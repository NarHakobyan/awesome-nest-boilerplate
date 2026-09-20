import { generateKeyPairSync } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

/**
 * Writes a fresh RS256 keypair into `.env` as `\n`-escaped one-liners.
 *
 * `.env.example` ships placeholders rather than a working keypair, so this is
 * the second half of the two-command setup:
 *
 *   cp .env.example .env && pnpm env:keygen
 */

const ENV_PATH = '.env';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const escape = (pem: string): string =>
  pem.trimEnd().replaceAll('\n', String.raw`\n`);

const assignments: Record<string, string> = {
  JWT_PRIVATE_KEY: escape(privateKey),
  JWT_PUBLIC_KEY: escape(publicKey),
};

if (!existsSync(ENV_PATH)) {
  console.error(`${ENV_PATH} not found. Run \`cp .env.example .env\` first.`);
  process.exit(1);
}

let contents = readFileSync(ENV_PATH, 'utf8');

for (const [key, value] of Object.entries(assignments)) {
  const line = `${key}=${value}`;
  const existing = new RegExp(`^#?\\s*${key}=.*$`, 'm');

  contents = existing.test(contents)
    ? contents.replace(existing, line)
    : `${contents.trimEnd()}\n${line}\n`;
}

writeFileSync(ENV_PATH, contents);
console.info(`wrote a fresh RS256 keypair to ${ENV_PATH}`);
