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

test('lineage: "funky-ai" es exactamente 2 y son funky-forge y funky-secure', () => {
  const family = topLevelStringProps(fichaFiles(), "lineage").filter(
    (entry) => entry.value === "funky-ai",
  );
  assert.deepEqual(
    family.map((entry) => entry.file),
    ["data/projects/funky-forge.ts", "data/projects/funky-secure.ts"],
  );
});

test('status: "finished" es exactamente 2 y son Grinchmas Kart y Cumyxel', () => {
  const finished = topLevelStringProps(fichaFiles(), "status").filter(
    (entry) => entry.value === "finished",
  );
  assert.deepEqual(
    finished.map((entry) => entry.file),
    ["data/projects/cumyxel.ts", "data/projects/grinchmas-kart.ts"],
  );
});

// `funky-forge` quedo publicado (`0.2.0`, 2026-11-11), asi que su estado es el
// default (`active`) y no lleva sello. `pre-release` describe solo a Secure
// mientras no haya release.
test('status: "pre-release" solo lo declara funky-secure', () => {
  const preRelease = topLevelStringProps(fichaFiles(), "status").filter(
    (entry) => entry.value === "pre-release",
  );
  assert.deepEqual(
    preRelease.map((entry) => entry.file),
    ["data/projects/funky-secure.ts"],
  );
});

/**
 * Fichas que NO declaran `home`: viven solo en el catalogo, nunca en la home
 * (S2). Se lee el AST para no ejecutar `data/projects.ts`.
 */
test("solo funky-forge y funky-secure viven solo en el catalogo (sin home)", () => {
  const withHome = new Set(topLevelStringProps(fichaFiles(), "home").map((entry) => entry.file));
  const catalogOnly = fichaFiles().filter((file) => !withHome.has(file));
  assert.deepEqual(catalogOnly, [
    "data/projects/funky-forge.ts",
    "data/projects/funky-secure.ts",
  ]);
});

/**
 * `getCatalog()` cubre TODAS las fichas: el array `projects` de
 * `data/projects.ts` lista las 11 y cada entrada es el import de su ficha, asi
 * que ninguna queda fuera del catalogo por olvido de registro.
 */
test("getCatalog() cubre las 11 fichas del data layer", () => {
  const source = parse("data/projects.ts");

  const imports = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      imports.set(element.name.text, statement.moduleSpecifier.text);
    }
  }

  const declaration = source.statements
    .filter((statement) => ts.isVariableStatement(statement))
    .flatMap((statement) => statement.declarationList.declarations)
    .find((decl) => ts.isIdentifier(decl.name) && decl.name.text === "projects");
  assert.ok(declaration, "data/projects.ts debe declarar el array `projects`");
  assert.ok(
    ts.isArrayLiteralExpression(declaration.initializer),
    "`projects` debe inicializarse con un array literal",
  );
  const entries = declaration.initializer.elements.map((element) => {
    assert.ok(ts.isIdentifier(element), "cada entrada de `projects` es el import de una ficha");
    return element.text;
  });

  assert.equal(entries.length, 11);
  const modules = entries.map((name) => {
    const specifier = imports.get(name);
    assert.ok(specifier, `${name} debe importarse desde ./projects/<id>`);
    return specifier;
  });
  // Comparacion como CONJUNTO: el orden del array es contrato de layout (S1)
  // y no es asunto de este invariante, que solo exige que no falte ninguna.
  assert.deepEqual(
    [...modules].sort(),
    fichaFiles()
      .map((file) => file.replace(/^data\/projects\//, "./projects/").replace(/\.ts$/, ""))
      .sort(),
  );

  const getCatalog = source.statements.find(
    (statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === "getCatalog",
  );
  assert.ok(getCatalog, "data/projects.ts debe exportar getCatalog()");
  assert.match(getCatalog.body.getText(), /return projects;/);
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
