import parse from 'parse-duration';
import { z } from 'zod';

/**
 * Reusable coercions for environment variables.
 *
 * Every helper takes the RAW string form of the variable (that is what lands in
 * `process.env` and in a `.env` file) and produces the value the application
 * actually wants. Keeping the coercion in the schema is what makes
 * `ApiConfigService` a thin typed accessor instead of a pile of parsers.
 */

/**
 * A PEM block that may be written on a single line with literal `\n` escapes,
 * which is how `.env` files have to carry multi-line keys.
 */
export const zPem = (label: string): z.ZodType<string, string> =>
  z
    .string()
    .transform((value) => value.replaceAll(String.raw`\n`, '\n'))
    .refine((value) => value.includes(`-----BEGIN ${label}-----`), {
      message: `must be a PEM block containing -----BEGIN ${label}-----`,
    });

/**
 * A human duration (`1m`, `30s`, `500ms`) coerced to **milliseconds**, which is
 * the unit every consumer in this repo expects (`@nestjs/throttler` included).
 */
export const zDurationMs = (): z.ZodType<number, string> =>
  z.string().transform((value, ctx) => {
    const milliseconds = parse(value);

    if (milliseconds === null) {
      ctx.addIssue({
        code: 'custom',
        message: `must be a duration like 1m, 30s or 500ms. Received: ${value}`,
      });

      return z.NEVER;
    }

    return milliseconds;
  });

/** `true`/`false`/`1`/`0`/`yes`/`no`/`on`/`off`, case-insensitive. */
export const zBool = (): z.ZodType<boolean, string> => z.stringbool();

/** A TCP port. */
export const zPort = (): z.ZodType<number> =>
  z.coerce.number().int().min(1).max(65_535);

/** A comma-separated list, trimmed, with empty entries dropped. */
export const zCsv = (): z.ZodType<string[], string> =>
  z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string()).min(1));
