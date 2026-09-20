import { envKeys } from './env.definition.ts';

export interface EnvExampleDiff {
  /** Declared in the schema but absent from the file on disk. */
  readonly missing: string[];
  /** Present in the file on disk but not declared in the schema. */
  readonly extra: string[];
  /** True when the file is not byte-identical to what the schema renders. */
  readonly stale: boolean;
}

const ASSIGNMENT = /^#?\s*([A-Z][\dA-Z_]*)=/;

export function parseAssignedKeys(contents: string): string[] {
  return contents
    .split('\n')
    .map((line) => ASSIGNMENT.exec(line.trim())?.[1])
    .filter((key): key is string => key !== undefined);
}

/**
 * Staleness is a byte comparison, exactly like `prettier --check`: reordered
 * sections and edited comments are drift too, not just a changed key set. The
 * key-level diff exists only so the error message can say something useful.
 */
export function diffEnvExample(
  onDisk: string,
  rendered: string,
): EnvExampleDiff {
  const declared = new Set<string>(envKeys);
  const present = new Set(parseAssignedKeys(onDisk));

  return {
    missing: [...declared].filter((key) => !present.has(key)),
    extra: [...present].filter((key) => !declared.has(key)),
    stale: onDisk !== rendered,
  };
}
