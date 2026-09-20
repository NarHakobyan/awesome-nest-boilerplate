import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

import dotenv from 'dotenv';

import type { EnvEntry } from '../src/config/env/env.definition.ts';
import { envDefinition, envKeys } from '../src/config/env/env.definition.ts';
import { diffEnvExample } from '../src/config/env/env.diff.ts';
import {
  ENV_DOCS_PATH,
  ENV_EXAMPLE_PATH,
  renderEnvDocs,
  renderEnvExample,
} from '../src/config/env/env.render.ts';
import {
  envFileSchema,
  formatEnvIssues,
} from '../src/config/env/env.schema.ts';

/**
 * Keeps `.env.example`, `docs/env-reference.md` and a developer's local `.env`
 * in step with `src/config/env/env.definition.ts`.
 *
 *   pnpm env:sync       regenerate the two committed files
 *   pnpm env:check      fail if they are stale; report on `.env` if it exists
 *   pnpm env:validate   same, but every finding is an error (deploy preflight)
 */

const ENV_PATH = '.env';

type ExitCode = 0 | 1;

const read = (path: string): string => readFileSync(path, 'utf8');

function reportEnvExample(write: boolean): ExitCode {
  const rendered = renderEnvExample();
  const renderedDocs = renderEnvDocs();

  if (write) {
    writeFileSync(ENV_EXAMPLE_PATH, rendered);
    writeFileSync(ENV_DOCS_PATH, renderedDocs);
    console.info(`wrote ${ENV_EXAMPLE_PATH} and ${ENV_DOCS_PATH}`);

    return 0;
  }

  const onDisk = existsSync(ENV_EXAMPLE_PATH) ? read(ENV_EXAMPLE_PATH) : '';
  const diff = diffEnvExample(onDisk, rendered);
  const isDocsStale =
    !existsSync(ENV_DOCS_PATH) || read(ENV_DOCS_PATH) !== renderedDocs;

  if (!diff.stale && !isDocsStale) {
    console.info(`${ENV_EXAMPLE_PATH} and ${ENV_DOCS_PATH} are up to date`);

    return 0;
  }

  console.error('');
  console.error('Generated environment files are out of date.');
  console.error('');

  for (const key of diff.missing) {
    console.error(`  missing from ${ENV_EXAMPLE_PATH}   ${key}`);
  }

  for (const key of diff.extra) {
    console.error(`  not in the schema           ${key}`);
  }

  if (diff.missing.length === 0 && diff.extra.length === 0) {
    console.error('  the declared keys match, but the rendered output differs');
  }

  if (isDocsStale) {
    console.error(`  ${ENV_DOCS_PATH} is stale`);
  }

  console.error('');
  console.error('Run `pnpm env:sync` and commit the result.');
  console.error('');

  return 1;
}

/** Declared, required, and with no default to fall back on. */
const requiredWithoutDefault = (): string[] =>
  envKeys.filter((key) => {
    const entry = envDefinition[key] as EnvEntry;

    return (
      (entry.required === undefined || entry.required === true) &&
      entry.default === undefined
    );
  });

function reportDotEnv(isStrict: boolean): ExitCode {
  if (!existsSync(ENV_PATH)) {
    console.info(`${ENV_PATH} not found — skipping local validation`);

    return 0;
  }

  const parsed = dotenv.parse(read(ENV_PATH));
  const result = envFileSchema.safeParse(parsed);
  let hasFailed = false;
  let hasReported = false;

  if (!result.success) {
    console.error(formatEnvIssues(ENV_PATH, result.error, parsed));
    hasFailed = true;
    hasReported = true;
  }

  const missing = requiredWithoutDefault().filter(
    (key) => parsed[key] === undefined || parsed[key] === '',
  );

  if (missing.length > 0) {
    const lines = missing.map((key) => `  ${key}`).join('\n');
    const message = [
      '',
      `${ENV_PATH} does not set these required variables:`,
      lines,
      '',
      'Set them, or make sure the environment you run in supplies them.',
      'For the JWT keys, run `pnpm env:keygen`.',
      '',
    ].join('\n');

    hasReported = true;

    if (isStrict) {
      console.error(message);
      hasFailed = true;
    } else {
      console.warn(message);
    }
  }

  if (!hasReported) {
    console.info(`${ENV_PATH} matches the schema`);
  }

  /*
   * A problem in an untracked, developer-local `.env` is a setup issue, not
   * repository drift, so it never blocks a commit unless --strict is asked for.
   */
  return hasFailed && isStrict ? 1 : 0;
}

function main(): ExitCode {
  if (process.env.ENV_SCHEMA_SKIP === '1') {
    console.info('ENV_SCHEMA_SKIP=1 — skipping environment schema checks');

    return 0;
  }

  // lint-staged appends the staged filenames, so only recognised words count.
  const argv = process.argv.slice(2);
  const isStrict = argv.includes('--strict');
  const command =
    argv.find((argument) => ['sync', 'check', 'validate'].includes(argument)) ??
    'check';

  if (command === 'sync') {
    return reportEnvExample(true);
  }

  if (command === 'validate') {
    return reportDotEnv(isStrict) === 0 ? 0 : 1;
  }

  const exampleCode = reportEnvExample(false);
  const dotEnvCode = reportDotEnv(isStrict);

  return exampleCode === 0 && dotEnvCode === 0 ? 0 : 1;
}

process.exit(main());
