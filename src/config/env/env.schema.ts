import { createHash } from 'node:crypto';

import { z } from 'zod';

import type { EnvEntry, EnvKey, NodeEnvName } from './env.definition.ts';
import { envDefinition, envKeys } from './env.definition.ts';

/**
 * There are deliberately TWO validation surfaces here, built from the same
 * entries. Do not merge them.
 *
 *  - `appEnvSchema` runs over the merged `process.env`, which is full of `PATH`,
 *    `HOME` and CI noise. It MUST be a loose `z.object`; a strict object would
 *    reject every unrelated operating-system variable and nothing would boot.
 *  - `envFileSchema` runs over `dotenv.parse()` output, i.e. only the keys
 *    literally written in a `.env` file. It MUST be a `z.strictObject`, because
 *    this is the only place where "unknown key" is a meaningful signal -- and an
 *    undeclared key in someone's `.env` is precisely the drift this whole
 *    feature exists to catch.
 */

type Definition = typeof envDefinition;

/** An empty assignment (`KEY=`) means "not set", not "set to the empty string". */
const emptyToUndefined = (value: unknown): unknown =>
  value === '' ? undefined : value;

const isAlwaysRequired = (entry: EnvEntry): boolean =>
  entry.required === undefined || entry.required === true;

/**
 * @param optionalize when true every entry becomes optional, which is what the
 *   file check wants: a `.env` may legitimately omit a variable that the deploy
 *   environment supplies. Missing-but-required is reported separately, as a
 *   warning, by `scripts/env.ts`.
 */
function buildEntrySchema(entry: EnvEntry, optionalize: boolean): z.ZodType {
  if (!optionalize && entry.default !== undefined) {
    return z.preprocess(
      (value) => (value === undefined || value === '' ? entry.default : value),
      entry.schema,
    );
  }

  const isRequired = !optionalize && isAlwaysRequired(entry);

  return z.preprocess(
    emptyToUndefined,
    isRequired ? entry.schema : entry.schema.optional(),
  );
}

function buildShape(optionalize: boolean): Record<string, z.ZodType> {
  return Object.fromEntries(
    envKeys.map((key) => [
      key,
      buildEntrySchema(envDefinition[key] as EnvEntry, optionalize),
    ]),
  );
}

/**
 * Variables that are only required in some environments (`required: { in: [...] }`)
 * are optional in the shape and enforced here, where `NODE_ENV` is known.
 */
function applyConditionalRequirements(
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
): void {
  const nodeEnv = value.NODE_ENV as NodeEnvName | undefined;

  for (const key of envKeys) {
    const { required } = envDefinition[key] as EnvEntry;

    if (
      typeof required === 'object' &&
      nodeEnv !== undefined &&
      required.in.includes(nodeEnv) &&
      value[key] === undefined
    ) {
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: `is required when NODE_ENV is ${required.in.join(' or ')}`,
      });
    }
  }
}

/**
 * SHA-256 of the sample RSA keypair this repository used to ship inside
 * `.env.example`. Those keys are in the git history and cannot be rotated, so
 * anything signing production tokens with them is forgeable. We keep the
 * digests only -- the keys themselves are not reintroduced anywhere.
 */
export const LEAKED_SAMPLE_KEY_DIGESTS: ReadonlySet<string> = new Set([
  '0e8ebac605cd3d56f9f51c511e440f3f86bc9aab14c2a0a054309db936ad5c32',
  '5616597c6047e77af43f9ddb83214980a7b2008c648780a6b1698570aeecacbc',
]);

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

export const isLeakedSampleKey = (pem: string): boolean =>
  LEAKED_SAMPLE_KEY_DIGESTS.has(sha256(pem));

function rejectLeakedSampleKeys(
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
): void {
  if (value.NODE_ENV !== 'production') {
    return;
  }

  for (const key of ['JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY'] as const) {
    const pem = value[key];

    if (typeof pem === 'string' && isLeakedSampleKey(pem)) {
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: [
          'is the sample key that used to ship in .env.example.',
          'It is in the git history and cannot be used in production.',
          'Run `pnpm env:keygen` to generate your own.',
        ].join(' '),
      });
    }
  }
}

function refine(value: Record<string, unknown>, ctx: z.RefinementCtx): void {
  applyConditionalRequirements(value, ctx);
  rejectLeakedSampleKeys(value, ctx);
}

/** Loose. Validates the merged `process.env` at bootstrap. */
export const appEnvSchema = z
  .object(buildShape(false))
  .loose()
  .superRefine(refine);

/** Strict. Validates the contents of a `.env` file, and only those keys. */
export const envFileSchema = z
  .strictObject(buildShape(true))
  .superRefine(refine);

type IsConditionallyOptional<TEntry> = TEntry extends { required: false }
  ? true
  : TEntry extends { required: { in: readonly NodeEnvName[] } }
    ? true
    : false;

/** An entry is present on `Env` unless it is optional AND has no default. */
type IsPresent<TEntry> = TEntry extends { default: string }
  ? true
  : IsConditionallyOptional<TEntry> extends true
    ? false
    : true;

type AppKey = {
  [K in EnvKey]: Definition[K]['scope'] extends 'app' ? K : never;
}[EnvKey];

type PresentKey = {
  [K in AppKey]: IsPresent<Definition[K]> extends true ? K : never;
}[AppKey];

type AbsentKey = Exclude<AppKey, PresentKey>;

/**
 * The shape of the validated environment, derived from `envDefinition` alone.
 *
 * Only `scope: 'app'` entries appear: `external` variables are validated and
 * documented, but they are read by docker-compose, a shell script or the AWS
 * SDK -- never by this application -- so reaching for one through
 * `ApiConfigService` is a compile error by construction.
 */
export type Env = {
  [K in PresentKey]: z.infer<Definition[K]['schema']>;
} & {
  [K in AbsentKey]?: z.infer<Definition[K]['schema']>;
};

let cachedEnv: Env | undefined;

export function formatEnvIssues(
  source: string,
  error: z.ZodError,
  raw: Record<string, unknown> = {},
): string {
  const width = Math.max(
    ...error.issues.map((issue) => String(issue.path[0] ?? '').length),
    12,
  );

  const lines = error.issues.flatMap((issue) => {
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map(
        (key) => `  unknown  ${key.padEnd(width)}  not declared in the schema`,
      );
    }

    const key = String(issue.path[0] ?? '<root>');
    const isPresent = raw[key] !== undefined && raw[key] !== '';
    const label = isPresent ? 'invalid' : 'missing';
    // Zod already names the received value for some codes; don't say it twice.
    const detail =
      isPresent && !issue.message.includes('received')
        ? `${issue.message} (received ${JSON.stringify(raw[key])})`
        : issue.message;

    return [`  ${label}  ${key.padEnd(width)}  ${detail}`];
  });

  return [
    '',
    `Invalid environment configuration (${source})`,
    '',
    ...lines,
    '',
    'Declared variables live in src/config/env/env.definition.ts.',
    'Run `pnpm env:sync` after changing the schema.',
    '',
  ].join('\n');
}

/**
 * Wired into `ConfigModule.forRoot({ validate })`, so a misconfigured
 * environment stops the process at boot with every problem listed at once,
 * instead of throwing from whichever getter happens to run first.
 */
export function validateEnv(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const result = appEnvSchema.safeParse(raw);

  if (!result.success) {
    console.error(formatEnvIssues('.env', result.error, raw));

    throw new Error('Invalid environment configuration. See the report above.');
  }

  cachedEnv = result.data as Env;

  /*
   * The merge matters: `ConfigService` consults this object BEFORE `process.env`,
   * so returning only the parsed keys would make every unrelated variable
   * unreachable through `ConfigService`.
   */
  return { ...raw, ...result.data };
}

/**
 * Typed access for the handful of static, non-DI call sites. Memoised; the
 * cache is filled by `validateEnv` during `ConfigModule.forRoot()`, which runs
 * while `app.module.ts` is being evaluated -- long before any request.
 */
export function getEnv(): Env {
  if (cachedEnv === undefined) {
    validateEnv(process.env);
  }

  return cachedEnv!;
}

/** Test seam. */
export function resetEnvCache(): void {
  cachedEnv = undefined;
}
