// Emits a types-only socket contract file mirrored into the frontend. The backend
// src/contracts/socket.ts is the single source of truth; this script copies it with a DO-NOT-EDIT
// banner. A `git diff --exit-code` on the emitted file enforces the mirror stays current (documented
// in both READMEs). No runtime Zod is included — the frontend imports only the types.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, '../src/contracts/socket.ts');
// Frontend target (sibling repo). Can be overridden with CONTRACT_OUT for the backend-local copy.
const DEFAULT_TARGET = resolve(here, '../../Buni/src/types/contract.generated.ts');
const target = process.env.CONTRACT_OUT ? resolve(process.env.CONTRACT_OUT) : DEFAULT_TARGET;

function sourceRef(): string {
  try {
    const hash = execSync('git rev-parse --short HEAD', { cwd: resolve(here, '..') })
      .toString()
      .trim();
    return `api-buni@${hash}`;
  } catch {
    return 'api-buni (source: src/contracts/socket.ts)';
  }
}

function main(): void {
  const body = readFileSync(SOURCE, 'utf8');
  const banner = `// GENERATED FROM ${sourceRef()} — DO NOT EDIT BY HAND
// Source: api-buni/src/contracts/socket.ts
// Regenerate with: (api-buni) npm run export:contract  — then commit the diff.
// A \`git diff --exit-code\` on this file in CI/the frontend build enforces it stays in sync.

`;
  const out = banner + body;

  const dir = dirname(target);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(target, out, 'utf8');
  console.log(`Contract written to ${target}`);
}

main();
