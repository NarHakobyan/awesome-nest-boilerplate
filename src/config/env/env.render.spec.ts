import { envKeys } from './env.definition.ts';
import { diffEnvExample, parseAssignedKeys } from './env.diff.ts';
import { renderEnvDocs, renderEnvExample } from './env.render.ts';

describe('renderEnvExample', () => {
  it('declares every variable in the schema', () => {
    const rendered = parseAssignedKeys(renderEnvExample());

    expect(new Set(rendered)).toEqual(new Set<string>(envKeys));
  });

  it('marks itself as generated', () => {
    expect(renderEnvExample()).toContain('do not edit by hand');
  });

  it('never prints a secret that has no explicit example', () => {
    expect(renderEnvExample()).toContain('JWT_PRIVATE_KEY=\n');
  });

  it('comments out optional variables that have no default', () => {
    const rendered = renderEnvExample();

    expect(rendered).toContain('# REDIS_URL=redis://localhost:6379');
    expect(rendered).toContain('# AWS_ACCESS_KEY_ID=');
    expect(rendered).not.toContain('\nAWS_ACCESS_KEY_ID=');
  });

  it('is stable across calls', () => {
    expect(renderEnvExample()).toBe(renderEnvExample());
  });
});

describe('renderEnvDocs', () => {
  it('documents every variable', () => {
    const rendered = renderEnvDocs();

    for (const key of envKeys) {
      expect(rendered).toContain(`\`${key}\``);
    }
  });
});

describe('diffEnvExample', () => {
  const rendered = renderEnvExample();

  it('reports a file that matches as fresh', () => {
    expect(diffEnvExample(rendered, rendered)).toEqual({
      missing: [],
      extra: [],
      stale: false,
    });
  });

  it('flags a hand-added key', () => {
    const diff = diffEnvExample(`${rendered}TELEGRAM_BOT_TOKEN=x\n`, rendered);

    expect(diff.extra).toEqual(['TELEGRAM_BOT_TOKEN']);
    expect(diff.stale).toBe(true);
  });

  it('flags a removed key', () => {
    const diff = diffEnvExample(
      rendered
        .split('\n')
        .filter((line) => !line.startsWith('DB_HOST='))
        .join('\n'),
      rendered,
    );

    expect(diff.missing).toEqual(['DB_HOST']);
    expect(diff.stale).toBe(true);
  });

  it('flags a file whose keys match but whose bytes do not', () => {
    const diff = diffEnvExample(
      rendered.replace('# Postgres host.', ''),
      rendered,
    );

    expect(diff.missing).toEqual([]);
    expect(diff.extra).toEqual([]);
    expect(diff.stale).toBe(true);
  });
});
