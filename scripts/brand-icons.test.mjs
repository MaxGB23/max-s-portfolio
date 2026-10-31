// Guard del generador de iconos de marca (ver docs/rfcs/verification-policy.md 6).
// La fuente de verdad es el manifiesto por sha256, no el mtime: reemplazar un SVG
// sin reconstruir su WebP sirve un icono viejo, y ni typecheck ni build lo
// detectan: este es el unico chequeo que falla.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const brandsDir = join(here, '..', 'public', 'brands');
const manifestPath = join(here, 'brand-icons.manifest.json');

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const isFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

const filesWith = (extension) =>
  readdirSync(brandsDir)
    .filter((name) => name.endsWith(extension))
    .map((name) => name.slice(0, -extension.length))
    .sort();

const manifest = () => JSON.parse(readFileSync(manifestPath, 'utf8'));

test('1. hay al menos un SVG en public/brands (guarda al guard)', () => {
  assert.ok(
    filesWith('.svg').length > 0,
    'public/brands no tiene ningun SVG: una carpeta vacia pasaria todas las aserciones siguientes',
  );
});

test('2. cada SVG tiene entrada de manifiesto con su svgSha256', () => {
  const entries = new Map(manifest().icons.map((entry) => [entry.name, entry]));

  const stale = filesWith('.svg').filter((name) => {
    const entry = entries.get(name);
    return !entry || entry.svgSha256 !== sha256(join(brandsDir, `${name}.svg`));
  });

  assert.deepEqual(
    stale,
    [],
    `${stale.length} SVG sin entrada o con svgSha256 desactualizado: ${stale.join(', ')}. Corre \`pnpm icons:build\` y commitea el manifiesto y los .webp.`,
  );
});

test('3. cada entrada tiene su SVG y su WebP, y webpSha256 coincide', () => {
  const problems = [];

  for (const entry of manifest().icons) {
    const svg = join(brandsDir, `${entry.name}.svg`);
    const webp = join(brandsDir, `${entry.name}.webp`);
    if (!isFile(svg)) {
      problems.push(`${entry.name}: entrada sin SVG`);
      continue;
    }
    if (!isFile(webp)) {
      problems.push(`${entry.name}: entrada sin WebP`);
      continue;
    }
    if (entry.webpSha256 !== sha256(webp)) {
      problems.push(`${entry.name}: webpSha256 no coincide`);
    }
  }

  assert.deepEqual(
    problems,
    [],
    `${problems.length} icono(s) rotos: ${problems.join('; ')}. Corre \`pnpm icons:build\` y commitea el resultado.`,
  );
});

test('4. no hay WebP sin SVG', () => {
  const svgs = new Set(filesWith('.svg'));

  const orphans = filesWith('.webp').filter((name) => !svgs.has(name));

  assert.deepEqual(
    orphans,
    [],
    `${orphans.length} WebP huerfano(s): ${orphans.join(', ')}. Un SVG eliminado se poda; corre \`pnpm icons:build\` y commitea el borrado.`,
  );
});

test('5. el manifiesto es version 1', () => {
  assert.equal(
    manifest().version,
    1,
    'la forma del manifiesto no es la version 1: un bump reescribe el archivo entero',
  );
});
