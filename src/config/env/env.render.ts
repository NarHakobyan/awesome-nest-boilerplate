import type { EnvEntry, EnvKey, EnvSection } from './env.definition.ts';
import { ENV_SECTIONS, envDefinition, envKeys } from './env.definition.ts';

/**
 * Renders `.env.example` and `docs/env-reference.md` from `envDefinition`.
 *
 * Both files are generated, never hand-edited -- that is the whole point. Pure
 * functions live here (and are unit-tested); all file IO lives in
 * `scripts/env.ts`.
 */

export const ENV_EXAMPLE_PATH = '.env.example';
export const ENV_DOCS_PATH = 'docs/env-reference.md';

const GENERATED_BANNER = [
  '# Generated from src/config/env/env.definition.ts -- do not edit by hand.',
  '# Add or change a variable there, then run `pnpm env:sync`.',
];

/**
 * An entry is rendered commented-out when it is optional and has no default:
 * uncommenting it is then a deliberate opt-in, and `cp .env.example .env`
 * still produces a valid file.
 */
export const isCommentedOut = (entry: EnvEntry): boolean =>
  entry.required !== true &&
  entry.required !== undefined &&
  entry.default === undefined;

/** A secret never renders a real value unless one is given explicitly. */
export const exampleValue = (entry: EnvEntry): string => {
  if (entry.example !== undefined) {
    return entry.example;
  }

  return entry.secret === true ? '' : (entry.default ?? '');
};

const entryOf = (key: EnvKey): EnvEntry => envDefinition[key] as EnvEntry;

const keysBySection = (section: EnvSection): EnvKey[] =>
  envKeys.filter((key) => entryOf(key).section === section);

function renderEntry(key: EnvKey): string[] {
  const entry = entryOf(key);
  const comment = [`# ${entry.description}`];

  if (entry.scope === 'external') {
    comment.push(`# Read by: ${entry.usedBy ?? 'external tooling'}`);
  }

  if (entry.hint !== undefined) {
    comment.push(`# ${entry.hint}`);
  }

  const assignment = `${key}=${exampleValue(entry)}`;

  return [...comment, isCommentedOut(entry) ? `# ${assignment}` : assignment];
}

export function renderEnvExample(): string {
  const lines: string[] = [...GENERATED_BANNER];

  for (const section of ENV_SECTIONS) {
    const keys = keysBySection(section);

    if (keys.length === 0) {
      continue;
    }

    lines.push('', `#== ${section.toUpperCase()}`);

    for (const key of keys) {
      lines.push(...renderEntry(key));
    }
  }

  return `${lines.join('\n')}\n`;
}

const presence = (entry: EnvEntry): string => {
  if (typeof entry.required === 'object') {
    return `required in ${entry.required.in.join(', ')}`;
  }

  return entry.required === false ? 'optional' : 'required';
};

const cell = (value: string): string => value.replaceAll('|', String.raw`\|`);

export function renderEnvDocs(): string {
  const lines = [
    '<!-- Generated from src/config/env/env.definition.ts by `pnpm env:sync`. Do not edit by hand. -->',
    '',
    '# Environment reference',
    '',
    'Every variable this project reads. The list is generated from',
    '`src/config/env/env.definition.ts`, which is the single source of truth for',
    '`.env.example`, the runtime validation and this page.',
    '',
    'To add a variable: add an entry to `env.definition.ts`, run `pnpm env:sync`, and',
    'commit the regenerated files. `pnpm env:check` fails the build if they drift.',
    '',
    '**Scope** is `app` when the NestJS application reads the variable, and `external`',
    'when something else does (docker-compose, a shell script, the AWS SDK).',
    '',
  ];

  for (const section of ENV_SECTIONS) {
    const keys = keysBySection(section);

    if (keys.length === 0) {
      continue;
    }

    lines.push(
      `## ${section}`,
      '',
      '| Variable | Scope | Presence | Default | Description |',
      '| --- | --- | --- | --- | --- |',
    );

    for (const key of keys) {
      const entry = entryOf(key);
      const defaultCell =
        entry.default === undefined ? '—' : `\`${cell(entry.default)}\``;
      const description =
        entry.scope === 'external'
          ? `${entry.description} Read by ${entry.usedBy ?? 'external tooling'}.`
          : entry.description;

      lines.push(
        `| \`${key}\` | ${entry.scope} | ${presence(entry)} | ${defaultCell} | ${cell(description)} |`,
      );
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
