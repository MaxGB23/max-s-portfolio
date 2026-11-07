/**
 * Invariantes de la seleccion de la home, por su fuente de verdad: las fichas.
 *
 * Por que AST y NO `import`: `package.json` globa los tests a
 * `scripts/*.test.mjs` y `lib/*.test.ts`, y `data/projects.ts` importa sin
 * extension (`"./projects/caf"`), asi que `node --test` falla con
 * `ERR_MODULE_NOT_FOUND`. Parsear con el AST de TypeScript (devDependency del
 * repo, el mismo mecanismo que `scripts/audit-i18n-content.mjs`) lee la fuente
 * sin ejecutarla y sin cambiar los especificadores de modulo solo para testear.
 *
 * El invariante de grilla (`home: "grid"` = 6) se agrega en T6, cuando los 6
 * definitivos existen; en T1 verifica que la seleccion visible no cambio.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPTS_DIR, "..");
const FICHAS_DIR = join(ROOT, "data", "projects");

function parse(relPath) {
  const abs = join(ROOT, ...relPath.split("/"));
  return ts.createSourceFile(abs, readFileSync(abs, "utf8"), ts.ScriptTarget.Latest, true);
}

/**
 * Valores de un prop de primer nivel (`home`, `id`, `featured`) por ficha:
 * `[{ file, prop, value }]` solo para asignaciones `prop: "literal"`.
 */
function topLevelStringProps(relPaths, prop) {
  const found = [];
  for (const rel of relPaths) {
    const source = parse(rel);
    const exported = source.statements.find(
      (node) =>
        ts.isVariableStatement(node) &&
        node.declarationList.declarations.some((decl) => ts.isIdentifier(decl.name)),
    );
    if (!exported) continue;
    for (const declaration of exported.declarationList.declarations) {
      const object = declaration.initializer;
      if (!ts.isObjectLiteralExpression(object)) continue;
      for (const entry of object.properties) {
        if (!ts.isPropertyAssignment(entry)) continue;
        if (!ts.isIdentifier(entry.name) || entry.name.text !== prop) continue;
        // `false` en un boolean tambien es un literal: se registra su texto.
        if (ts.isStringLiteral(entry.initializer)) {
          found.push({ file: rel, value: entry.initializer.text });
        } else if (
          entry.initializer.kind === ts.SyntaxKind.TrueKeyword ||
          entry.initializer.kind === ts.SyntaxKind.FalseKeyword
        ) {
          found.push({ file: rel, value: entry.initializer.getText() });
        }
      }
    }
  }
  return found;
}

function fichaFiles() {
  return readdirSync(FICHAS_DIR)
    .filter((file) => file.endsWith(".ts") && file !== "types.ts")
    .sort()
    .map((file) => `data/projects/${file}`);
}

test('home: "featured" es exactamente 3 y son CAF, Presidencia y Funky Theme', () => {
  const featured = topLevelStringProps(fichaFiles(), "home").filter(
    (entry) => entry.value === "featured",
  );
  assert.deepEqual(
    featured.map((entry) => entry.file),
    ["data/projects/caf.ts", "data/projects/funky-theme.ts", "data/projects/presidencia.ts"],
  );
});

test('home: "grid" es exactamente 6 y ninguna ficha declara otro valor', () => {
  const homes = topLevelStringProps(fichaFiles(), "home");
  const grid = homes.filter((entry) => entry.value === "grid");
  assert.equal(grid.length, 6);
  assert.deepEqual(
    homes.filter((entry) => entry.value !== "featured" && entry.value !== "grid"),
    [],
  );
});

test("el eje de curacion es unico: no queda el flag booleano featured", () => {
  const legacy = topLevelStringProps(
    [...fichaFiles(), "data/projects/types.ts"],
    "featured",
  );
  assert.deepEqual(legacy, []);
});

test("linaje y ciclo de vida se escriben como literales no traducibles", () => {
  const lineage = topLevelStringProps(fichaFiles(), "lineage");
  const status = topLevelStringProps(fichaFiles(), "status");
  assert.deepEqual(
    lineage.filter((entry) => typeof entry.value !== "string"),
    [],
  );
  assert.deepEqual(
    status.filter((entry) => !["active", "pre-release", "finished"].includes(entry.value)),
    [],
  );
});

// ---------------------------------------------------------------------------
// Gate i18n: los props nuevos del modelo son identificadores, no copy visible.
// Se ejecuta el mismo CLI que corre en CI contra un fixture aislado, y se
// observa el codigo de salida y el tipo de hallazgo impreso.
// ---------------------------------------------------------------------------

const AUDIT = join(SCRIPTS_DIR, "audit-i18n-content.mjs");

const AUDIT_BASE = {
  "data/products.ts": 'export const products = [{ label: { es: "Hola", en: "Hello" } }];\n',
  "data/pricing.ts": 'export const tiers = [{ label: { es: "Hola", en: "Hello" } }];\n',
  "data/projects.ts": 'export const projects = [{ hook: { es: "Hola", en: "Hello" } }];\n',
};

function runAudit(overrides) {
  const dir = mkdtempSync(join(tmpdir(), "projects-catalog-"));
  try {
    for (const [rel, content] of Object.entries({ ...AUDIT_BASE, ...overrides })) {
      const abs = join(dir, ...rel.split("/"));
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
    mkdirSync(join(dir, "data", "projects"), { recursive: true });
    const result = spawnSync(process.execPath, [AUDIT], {
      encoding: "utf8",
      env: { ...process.env, AUDIT_I18N_ROOT: dir },
    });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const FIXTURE =
  'export const x = { id: "x", home: "featured", lineage: "funky-ai", status: "pre-release", hook: { es: "Hola", en: "Hello" } };\n';

test("home, lineage y status no caen como outside-leaf", () => {
  const { status, output } = runAudit({ "data/projects/fixture.ts": FIXTURE });
  assert.equal(status, 0, output);
  assert.match(output, /0 problems/);
});

test("el allowlist no es un pase libre: un literal visible sigue reportando outside-leaf", () => {
  const { status, output } = runAudit({
    "data/projects/fixture.ts":
      'export const x = { id: "x", home: "featured", label: "Hola", hook: { es: "Hola", en: "Hello" } };\n',
  });
  assert.equal(status, 1, output);
  assert.match(output, /\[outside-leaf\] data\/projects\/fixture\.ts/);
  assert.match(output, /\[label\] "Hola"/);
});
