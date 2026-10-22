#!/usr/bin/env node
// Instala los hooks versionados de .githooks sin dependencias ni nada escrito
// dentro de .git/: solo `core.hooksPath` (que es local a este clon).
// Uso: pnpm hooks:install

import { execFileSync } from 'node:child_process';
import { chmodSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HOOKS = ['.githooks/pre-commit', '.githooks/commit-msg'];

execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: ROOT, stdio: 'inherit' });

// En Windows el bit de ejecucion no viaja con NTFS, asi que se intenta igual:
// Git for Windows ejecuta los hooks a traves de su sh.
for (const hook of HOOKS) {
  try {
    chmodSync(join(ROOT, hook), 0o755);
  } catch {
    // sin permisos para tocar el modo: el hook sigue siendo valido para Git
  }
}

process.stdout.write('hooks: core.hooksPath -> .githooks (pre-commit, commit-msg)\n');
process.stdout.write('hooks: para desactivarlos, `git config --unset core.hooksPath`\n');
