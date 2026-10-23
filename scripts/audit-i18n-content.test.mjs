/**
 * Tests del audit de contenido bilingue, por su interfaz publica: se ejecuta
 * el mismo CLI que corre en CI contra un fixture aislado en un directorio
 * temporal (`AUDIT_I18N_ROOT`), y se observa el codigo de salida y el tipo de
 * hallazgo impreso. Nada de importar funciones internas.
 *
 * Cada caso cambia un unico archivo del fixture: si el reporte trae el tipo
 * esperado, la regla existe y sabe distinguir su caso.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "audit-i18n-content.mjs");

// El audit enumera estos archivos: un fixture valido tiene que existir entero.
const BASE = {
  "data/products.ts": 'export const products = [{ label: { es: "Hola", en: "Hello" } }];\n',
  "data/pricing.ts": 'export const tiers = [{ label: { es: "Hola", en: "Hello" } }];\n',
  "data/projects.ts": 'export const projects = [{ hook: { es: "Hola", en: "Hello" } }];\n',
};

function runAudit(overrides) {
  const dir = mkdtempSync(join(tmpdir(), "audit-i18n-"));
  try {
    for (const [rel, content] of Object.entries({ ...BASE, ...overrides })) {
      const abs = join(dir, ...rel.split("/"));
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
    // El audit lee data/projects/ con readdirSync: el directorio debe existir.
    mkdirSync(join(dir, "data", "projects"), { recursive: true });
    const result = spawnSync(process.execPath, [SCRIPT], {
      encoding: "utf8",
      env: { ...process.env, AUDIT_I18N_ROOT: dir },
    });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("un fixture traducido pasa sin hallazgos", () => {
  const { status, output } = runAudit({});
  assert.equal(status, 0);
  assert.match(output, /0 problems/);
});

test("una hoja con los dos idiomas iguales reporta untranslated", () => {
  const { status, output } = runAudit({
    "data/projects/fixture.ts": 'export const x = { hook: { es: "Texto repetido", en: "Texto repetido" } };\n',
  });
  assert.equal(status, 1);
  assert.match(output, /\[untranslated\] data\/projects\/fixture\.ts/);
});

test("un token del allowlist no cuenta como falta de traduccion", () => {
  const { status, output } = runAudit({
    "data/projects/fixture.ts": 'export const x = { hook: { es: "Open VSX", en: "Open VSX" } };\n',
  });
  assert.equal(status, 0, output);
});

test("un desbalance de ** entre idiomas reporta markdown", () => {
  const { status, output } = runAudit({
    "data/projects/fixture.ts": 'export const x = { hook: { es: "**Hola** mundo", en: "Hola mundo" } };\n',
  });
  assert.equal(status, 1);
  assert.match(output, /\[markdown\]/);
});

test("un string visible fuera de una hoja reporta outside-leaf", () => {
  const { status, output } = runAudit({
    "data/projects/fixture.ts": 'export const x = { title: "Hola", hook: { es: "Hola", en: "Hello" } };\n',
  });
  assert.equal(status, 1);
  assert.match(output, /\[outside-leaf\]/);
});

test("un literal en una prop no traducible no reporta nada", () => {
  const { status, output } = runAudit({
    "data/projects/fixture.ts":
      'export const x = { id: "fixture", hook: { es: "Hola", en: "Hello" } };\n',
  });
  assert.equal(status, 0, output);
});
