import { z } from 'zod';

import { zBool, zCsv, zDurationMs, zPem, zPort } from './env.zod.ts';

/**
 * THE source of truth for every environment variable this project touches.
 *
 * Four things are derived from this one object and nothing else:
 *   1. the Zod schemas used to validate the environment (`env.schema.ts`)
 *   2. the `Env` type `ApiConfigService` is written against
 *   3. `.env.example`            -- via `pnpm env:sync`
 *   4. `docs/env-reference.md`   -- via `pnpm env:sync`
 *
 * Adding a variable therefore means editing THIS FILE and running
 * `pnpm env:sync`. There is nowhere else to forget.
 */

export const ENV_SECTIONS = [
  'App',
  'JWT Auth',
  'DB',
  'AWS S3',
  'NATS',
  'Throttler',
  'Redis',
] as const;

export type EnvSection = (typeof ENV_SECTIONS)[number];

export const NODE_ENV_NAMES = ['development', 'production', 'test'] as const;

export type NodeEnvName = (typeof NODE_ENV_NAMES)[number];

/**
 * `app`      the Nest application reads it. Validated at bootstrap, present on
 *            `Env`, reachable through `ApiConfigService`.
 * `external` something other than the Nest application reads it (docker-compose,
 *            a shell script, the AWS SDK credential chain). Documented and
 *            accepted by the `.env` check, but deliberately absent from `Env` so
 *            nobody reaches for a value the app never honours.
 */
export type EnvScope = 'app' | 'external';

export interface EnvEntry<TSchema extends z.ZodType = z.ZodType> {
  /** Applied to the RAW string value. Do all coercion inside the schema. */
  readonly schema: TSchema;
  /** `#== <SECTION>` block this variable renders under. */
  readonly section: EnvSection;
  /** One-line comment rendered above the variable, and its docs-table cell. */
  readonly description: string;
  readonly scope: EnvScope;
  /** Required for `external` entries: who actually reads this. */
  readonly usedBy?: string;
  /** `true` (the default), `false`, or required only in certain environments. */
  readonly required?: boolean | { readonly in: readonly NodeEnvName[] };
  /**
   * The default, in its RAW STRING form.
   *
   * It is a string on purpose: the value printed into `.env.example` is then
   * byte-identical to the value that flows through coercion, so "copied the
   * example" and "set nothing at all" can never produce different config.
   */
  readonly default?: string;
  /** Value written to `.env.example` when there is no default. */
  readonly example?: string;
  /** Never rendered with a real value. Forces an empty placeholder. */
  readonly secret?: boolean;
  /** Extra comment line in `.env.example`, e.g. how to produce a value. */
  readonly hint?: string;
}

const defineEnv = <T extends Record<string, EnvEntry>>(definition: T): T =>
  definition;

export const envDefinition = defineEnv({
  NODE_ENV: {
    schema: z.enum(NODE_ENV_NAMES),
    section: 'App',
    description: 'Runtime environment.',
    scope: 'app',
    default: 'development',
  },

  // == App
  PORT: {
    schema: zPort(),
    section: 'App',
    description: 'HTTP port the API listens on.',
    scope: 'app',
    default: '3000',
  },
  TRANSPORT_PORT: {
    schema: zPort(),
    section: 'App',
    description:
      'Port exposed by the container for the microservice transport.',
    scope: 'external',
    usedBy: 'docker-compose.yml',
    required: false,
    default: '8080',
  },
  FALLBACK_LANGUAGE: {
    schema: z.string().min(2),
    section: 'App',
    description: 'Locale used when the request asks for one we do not ship.',
    scope: 'app',
    default: 'en_US',
  },
  ENABLE_ORM_LOGS: {
    schema: zBool(),
    section: 'App',
    description: 'Log every SQL statement TypeORM executes.',
    scope: 'app',
    default: 'true',
  },
  ENABLE_DOCUMENTATION: {
    schema: zBool(),
    section: 'App',
    description: 'Serve the Swagger UI at /documentation.',
    scope: 'app',
    default: 'true',
  },
  API_VERSION: {
    schema: z.string().min(1),
    section: 'App',
    description: 'Version string shown in the Swagger document.',
    scope: 'app',
    default: 'v1.0.0',
  },
  CORS_ORIGINS: {
    schema: zCsv(),
    section: 'App',
    description: 'Comma-separated list of allowed CORS origins.',
    scope: 'app',
    default: 'http://localhost:3000',
  },
  FRONTEND_URL: {
    schema: z.url(),
    section: 'App',
    description: 'Public URL of the web client. Currently unused by the API.',
    scope: 'app',
    required: false,
    default: 'http://localhost:3000',
  },
  API_BASE_URL: {
    schema: z.url(),
    section: 'App',
    description: 'Public base URL of this API. Currently unused by the API.',
    scope: 'app',
    required: false,
  },

  // == JWT Auth
  JWT_PRIVATE_KEY: {
    schema: zPem('RSA PRIVATE KEY'),
    section: 'JWT Auth',
    description: String.raw`RS256 private key. Write newlines as literal \n to keep it on one line.`,
    scope: 'app',
    secret: true,
    hint: 'Generate a keypair with: pnpm env:keygen',
  },
  JWT_PUBLIC_KEY: {
    schema: zPem('PUBLIC KEY'),
    section: 'JWT Auth',
    description: 'RS256 public key, matching JWT_PRIVATE_KEY.',
    scope: 'app',
    secret: true,
    hint: 'Generate a keypair with: pnpm env:keygen',
  },
  JWT_EXPIRATION_TIME: {
    schema: z.coerce.number().int().positive(),
    section: 'JWT Auth',
    description: 'Access-token lifetime, in seconds.',
    scope: 'app',
    default: '86400',
  },

  // == DB
  DB_HOST: {
    schema: z.string().min(1),
    section: 'DB',
    description: 'Postgres host.',
    scope: 'app',
    default: '127.0.0.1',
  },
  DB_PORT: {
    schema: zPort(),
    section: 'DB',
    description: 'Postgres port.',
    scope: 'app',
    default: '5432',
  },
  DB_USERNAME: {
    schema: z.string().min(1),
    section: 'DB',
    description: 'Postgres user. Also read by init-data.sh.',
    scope: 'app',
    default: 'postgres',
  },
  DB_PASSWORD: {
    schema: z.string().min(1),
    section: 'DB',
    description: 'Postgres password. Also read by init-data.sh.',
    scope: 'app',
    secret: true,
    example: 'postgres',
    default: 'postgres',
  },
  DB_DATABASE: {
    schema: z.string().min(1),
    section: 'DB',
    description: 'Postgres database name. Also read by init-data.sh.',
    scope: 'app',
    default: 'awesome_nest_db',
  },

  // == AWS S3
  AWS_ACCESS_KEY_ID: {
    schema: z.string().min(1),
    section: 'AWS S3',
    description: 'Picked up implicitly by the AWS SDK credential chain.',
    scope: 'external',
    usedBy: '@aws-sdk credential chain',
    required: { in: ['production'] },
    secret: true,
  },
  AWS_SECRET_ACCESS_KEY: {
    schema: z.string().min(1),
    section: 'AWS S3',
    description: 'Picked up implicitly by the AWS SDK credential chain.',
    scope: 'external',
    usedBy: '@aws-sdk credential chain',
    required: { in: ['production'] },
    secret: true,
  },
  AWS_REGION: {
    schema: z.string().min(1),
    section: 'AWS S3',
    description:
      'Default region for the AWS SDK. S3 calls use AWS_S3_BUCKET_REGION instead.',
    scope: 'external',
    usedBy: '@aws-sdk credential chain',
    required: false,
    default: 'eu-central-1',
  },
  AWS_S3_BUCKET_NAME: {
    schema: z.string().min(1),
    section: 'AWS S3',
    description: 'Bucket uploads are written to.',
    scope: 'app',
    default: 'deno-prod-upload',
  },
  AWS_S3_BUCKET_REGION: {
    schema: z.string().min(1),
    section: 'AWS S3',
    description: 'Region of AWS_S3_BUCKET_NAME. Used to build public URLs.',
    scope: 'app',
    default: 'eu-central-1',
  },
  AWS_S3_API_VERSION: {
    schema: z.string().min(1),
    section: 'AWS S3',
    description: 'S3 API version pinned by the client.',
    scope: 'app',
    default: '2006-03-01',
  },
  SECRET_MANAGER_ARN: {
    schema: z.string().min(1),
    section: 'AWS S3',
    description:
      'ARN baked into the image as a build arg. Not read by the API.',
    scope: 'external',
    usedBy: 'Dockerfile build arg',
    required: false,
  },

  // == NATS
  NATS_ENABLED: {
    schema: zBool(),
    section: 'NATS',
    description: 'Start the NATS microservice transport alongside HTTP.',
    scope: 'app',
    default: 'false',
  },
  NATS_HOST: {
    schema: z.string().min(1),
    section: 'NATS',
    description: 'NATS server host. Required when NATS_ENABLED is true.',
    scope: 'app',
    default: 'localhost',
  },
  NATS_PORT: {
    schema: zPort(),
    section: 'NATS',
    description: 'NATS server port. Required when NATS_ENABLED is true.',
    scope: 'app',
    default: '4222',
  },

  // == Throttler
  THROTTLER_TTL: {
    schema: zDurationMs(),
    section: 'Throttler',
    description: 'Rate-limit window, e.g. 1m, 30s, 500ms.',
    scope: 'app',
    default: '1m',
  },
  THROTTLER_LIMIT: {
    schema: z.coerce.number().int().positive(),
    section: 'Throttler',
    description: 'Requests allowed per THROTTLER_TTL window.',
    scope: 'app',
    default: '10',
  },

  // == Redis
  REDIS_URL: {
    schema: z.string().min(1),
    section: 'Redis',
    description:
      'Redis connection string. Not yet wired into application code.',
    scope: 'external',
    usedBy: 'docker-compose redis service',
    required: false,
    example: 'redis://localhost:6379',
  },
});

export type EnvKey = keyof typeof envDefinition;

export const envKeys = Object.keys(envDefinition) as EnvKey[];
