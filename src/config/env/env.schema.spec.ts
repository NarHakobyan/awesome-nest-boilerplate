import { createHash, generateKeyPairSync } from 'node:crypto';

import { envDefinition, envKeys } from './env.definition.ts';
import { renderEnvExample } from './env.render.ts';
import {
  appEnvSchema,
  envFileSchema,
  formatEnvIssues,
  isLeakedSampleKey,
  LEAKED_SAMPLE_KEY_DIGESTS,
  validateEnv,
} from './env.schema.ts';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const escapeNewlines = (pem: string): string =>
  pem.trimEnd().replaceAll('\n', String.raw`\n`);

/** Only the variables that have no default and must therefore be supplied. */
const baseEnv = (): Record<string, string> => ({
  JWT_PRIVATE_KEY: escapeNewlines(privateKey),
  JWT_PUBLIC_KEY: escapeNewlines(publicKey),
});

describe('appEnvSchema', () => {
  it('accepts an environment that only sets the variables without defaults', () => {
    const result = appEnvSchema.safeParse(baseEnv());

    expect(result.success).toBe(true);
  });

  it('coerces values to the types the application expects', () => {
    const result = appEnvSchema.parse(baseEnv());

    expect(result.PORT).toBe(3000);
    expect(result.NATS_ENABLED).toBe(false);
    expect(result.ENABLE_ORM_LOGS).toBe(true);
    expect(result.CORS_ORIGINS).toEqual(['http://localhost:3000']);
    expect(result.JWT_EXPIRATION_TIME).toBe(86_400);
  });

  it('is loose, so unrelated operating-system variables pass through', () => {
    const result = appEnvSchema.safeParse({
      ...baseEnv(),
      PATH: '/usr/bin',
      HOME: '/root',
    });

    expect(result.success).toBe(true);
  });

  it('reports a missing variable that has no default', () => {
    const rest = baseEnv();

    delete rest.JWT_PRIVATE_KEY;

    const result = appEnvSchema.safeParse(rest);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toContain(
      'JWT_PRIVATE_KEY',
    );
  });

  it('treats an empty assignment as unset', () => {
    const result = appEnvSchema.parse({ ...baseEnv(), PORT: '' });

    expect(result.PORT).toBe(3000);
  });

  it('parses a duration into milliseconds', () => {
    expect(appEnvSchema.parse(baseEnv()).THROTTLER_TTL).toBe(60_000);
    expect(
      appEnvSchema.parse({ ...baseEnv(), THROTTLER_TTL: '30s' }).THROTTLER_TTL,
    ).toBe(30_000);
  });

  it('rejects a duration it cannot parse', () => {
    const result = appEnvSchema.safeParse({
      ...baseEnv(),
      THROTTLER_TTL: 'soon',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a non-numeric port', () => {
    const result = appEnvSchema.safeParse({ ...baseEnv(), DB_PORT: 'abc' });

    expect(result.success).toBe(false);
  });

  it('unescapes a PEM written on a single line', () => {
    const result = appEnvSchema.parse(baseEnv());

    expect(result.JWT_PRIVATE_KEY).toBe(privateKey.trimEnd());
    expect(result.JWT_PRIVATE_KEY).toContain('\n');
  });

  it('rejects a JWT key that is not a PEM block', () => {
    const result = appEnvSchema.safeParse({
      ...baseEnv(),
      JWT_PRIVATE_KEY: 'not-a-key',
    });

    expect(result.success).toBe(false);
  });

  describe('conditional requirements', () => {
    it('does not require the AWS credentials in development', () => {
      expect(appEnvSchema.safeParse(baseEnv()).success).toBe(true);
    });

    it('requires the AWS credentials in production', () => {
      const result = appEnvSchema.safeParse({
        ...baseEnv(),
        NODE_ENV: 'production',
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.path[0])).toContain(
        'AWS_ACCESS_KEY_ID',
      );
    });
  });

  describe('leaked sample keys', () => {
    /*
     * The sample keypair itself is deliberately not reintroduced anywhere in the
     * repository, so the guard is tested through its digest predicate plus the
     * negative case below.
     */
    it('recognises the published sample keys by digest', () => {
      expect(LEAKED_SAMPLE_KEY_DIGESTS.size).toBe(2);
      expect(
        LEAKED_SAMPLE_KEY_DIGESTS.has(
          '0e8ebac605cd3d56f9f51c511e440f3f86bc9aab14c2a0a054309db936ad5c32',
        ),
      ).toBe(true);
    });

    it('does not flag a freshly generated key', () => {
      expect(isLeakedSampleKey(privateKey.trimEnd())).toBe(false);
      expect(
        isLeakedSampleKey(
          createHash('sha256').update('anything').digest('hex'),
        ),
      ).toBe(false);
    });

    it('accepts a freshly generated key in production', () => {
      const result = appEnvSchema.safeParse({
        ...baseEnv(),
        NODE_ENV: 'production',
        AWS_ACCESS_KEY_ID: 'key',
        AWS_SECRET_ACCESS_KEY: 'secret',
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('envFileSchema', () => {
  it('is strict, so an undeclared key is an error', () => {
    const result = envFileSchema.safeParse({ TELEGRAM_BOT_TOKEN: 'x' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.code).toBe('unrecognized_keys');
  });

  it('allows a file that omits variables supplied by the deploy environment', () => {
    expect(envFileSchema.safeParse({ PORT: '8080' }).success).toBe(true);
  });

  it('still rejects a declared key with an invalid value', () => {
    expect(envFileSchema.safeParse({ DB_PORT: 'abc' }).success).toBe(false);
  });

  it('accepts everything the generated .env.example assigns', () => {
    const assignments = Object.fromEntries(
      renderEnvExample()
        .split('\n')
        .filter((line) => /^[A-Z]/.test(line))
        .map((line) => {
          const index = line.indexOf('=');

          return [line.slice(0, index), line.slice(index + 1)];
        }),
    );

    expect(envFileSchema.safeParse(assignments).success).toBe(true);
  });
});

describe('validateEnv', () => {
  it('returns unrelated variables alongside the parsed ones', () => {
    /*
     * ConfigService consults this object before process.env, so dropping the
     * untouched keys would make them unreachable through ConfigService.
     */
    const result = validateEnv({ ...baseEnv(), UNRELATED: 'kept' });

    expect(result.UNRELATED).toBe('kept');
    expect(result.PORT).toBe(3000);
  });

  it('throws with a report listing every problem at once', () => {
    const original = console.error;
    const reports: string[] = [];

    console.error = (report: string) => reports.push(report);

    try {
      expect(() =>
        validateEnv({ DB_PORT: 'abc', THROTTLER_TTL: 'soon' }),
      ).toThrow('Invalid environment configuration');
    } finally {
      console.error = original;
    }

    expect(reports[0]).toContain('DB_PORT');
    expect(reports[0]).toContain('THROTTLER_TTL');
    expect(reports[0]).toContain('JWT_PRIVATE_KEY');
  });
});

describe('formatEnvIssues', () => {
  it('distinguishes missing, invalid and unknown', () => {
    const missing = appEnvSchema.safeParse({});
    const report = formatEnvIssues('.env', missing.error!, {});

    expect(report).toContain('missing');

    const unknown = envFileSchema.safeParse({ NOPE: '1' });

    expect(formatEnvIssues('.env', unknown.error!, { NOPE: '1' })).toContain(
      'unknown',
    );
  });
});

describe('envDefinition', () => {
  it('gives every external variable an owner', () => {
    for (const key of envKeys) {
      const entry = envDefinition[key] as { scope: string; usedBy?: string };

      if (entry.scope === 'external') {
        expect(entry.usedBy).toBeDefined();
      }
    }
  });
});
