import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Phase-0 acceptance: env.ts aborts boot (process.exit(1)) on a weak/invalid JWT_SECRET, and loads
// cleanly with a valid environment. We exercise it in a child process because it calls process.exit.
const ENV_IMPORT_URL = pathToFileURL(resolve(process.cwd(), 'src/config/env.ts')).href;

function runEnv(extraEnv: Record<string, string>): {
  status: number | null;
  stderr: string;
  stdout: string;
} {
  const res = spawnSync(
    process.execPath,
    ['--import', 'tsx', '-e', `import(${JSON.stringify(ENV_IMPORT_URL)})`],
    {
      env: { ...process.env, ...extraEnv },
      encoding: 'utf8',
    },
  );
  return { status: res.status, stderr: res.stderr, stdout: res.stdout };
}

describe('env.ts fail-fast', () => {
  it('exits non-zero on a too-short JWT_SECRET', () => {
    const { status } = runEnv({ JWT_SECRET: 'short' });
    expect(status).toBe(1);
  });

  it('exits non-zero on the default JWT_SECRET', () => {
    const { status } = runEnv({ JWT_SECRET: 'your_secret_key' });
    expect(status).toBe(1);
  });

  it('loads cleanly with a valid environment', () => {
    const { status } = runEnv({});
    expect(status).toBe(0);
  });
});
