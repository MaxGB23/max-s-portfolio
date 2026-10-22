#!/usr/bin/env node
// Valida el rastro que AGENTS.md exige en cada commit: una linea `Docs:` y una
// `Risk:`. Se ejecuta desde .githooks/commit-msg y lo cubren sus tests.
// Uso: node scripts/commit-trace.mjs <archivo-del-mensaje>

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const DOCS_NONE = /^none\s+-\s+\S/;
const DOCS_FILE = /^(\S+\.md)\s+-\s+\S/;
const RISK = /^(none|item\s+[1-6]\b.*)$/;

/**
 * Devuelve la lista de problemas; vacia cuando el mensaje cumple el contrato.
 * Un commit de merge no lleva rastro: Git lo escribe, no el autor.
 */
export function checkTrace(message, { exists = (path) => existsSync(join(ROOT, path)) } = {}) {
  const lines = message.replace(/\r\n/g, '\n').split('\n');
  if (/^Merge\b/.test(lines[0] ?? '')) return [];

  const docs = lines.filter((line) => /^Docs:/.test(line)).map((line) => line.slice('Docs:'.length).trim());
  const risk = lines.filter((line) => /^Risk:/.test(line)).map((line) => line.slice('Risk:'.length).trim());
  const problems = [];

  if (docs.length === 0) problems.push('falta la linea `Docs:` (o `Docs: none - <motivo>`)');
  if (risk.length === 0) problems.push('falta la linea `Risk:` (o `Risk: none`)');

  for (const value of docs) {
    if (DOCS_NONE.test(value)) continue;
    const match = DOCS_FILE.exec(value);
    if (!match) {
      problems.push(`Docs: esperaba \`<archivo>.md - <que cambio>\` o \`none - <motivo>\`, recibi \`${value}\``);
      continue;
    }
    if (!exists(match[1])) problems.push(`Docs: el archivo citado no existe -> ${match[1]}`);
  }

  for (const value of risk) {
    if (!RISK.test(value)) {
      problems.push(`Risk: esperaba \`none\` o \`item 1-6 (motivo)\`, recibi \`${value}\``);
    }
  }

  return problems;
}

const invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const file = process.argv[2];
  if (!file) {
    process.stderr.write('commit-trace.mjs: falta la ruta del mensaje de commit\n');
    process.exit(2);
  }
  const problems = checkTrace(readFileSync(file, 'utf8'));
  if (problems.length > 0) {
    process.stderr.write('\ncommit-msg: el mensaje no cumple el rastro de AGENTS.md\n');
    for (const problem of problems) process.stderr.write(`  - ${problem}\n`);
    process.stderr.write('  (se salta a proposito con `git commit --no-verify`)\n\n');
    process.exit(1);
  }
}
