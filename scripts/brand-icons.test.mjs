// Guard del generador de iconos de marca (ver docs/rfcs/verification-policy.md 6).
// La fuente de verdad es el manifiesto por sha256, no el mtime: reemplazar un SVG
// sin reconstruir su WebP sirve un icono viejo, y ni typecheck ni build lo
// detectan: este es el unico chequeo que falla.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const brandsDir = join(here, '..', 'public', 'brands');
const manifestPath = join(here, 'brand-icons.manifest.json');

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const listing = () =>
  readdirSync(brandsDir).map((file) => {
    const extension = extname(file);
    return { file, name: basename(file, extension), ext: extension.toLowerCase() };
  });

// La comparacion es insensible a mayusculas en la extension y en el nombre:
// `Logo.SVG` es la fuente de `Logo.webp`, nunca un huerfano.
const indexOf = (extension) =>
  new Map(
    listing()
      .filter((entry) => entry.ext === extension)
      .map((entry) => [entry.name.toLowerCase(), entry]),
  );

const sourcesOf = () => [...indexOf('.svg').values()].sort((a, b) => (a.name < b.name ? -1 : 1));

const manifest = () => JSON.parse(readFileSync(manifestPath, 'utf8'));

test('1. hay al menos un SVG en public/brands (guarda al guard)', () => {
  assert.ok(
    sourcesOf().length > 0,
    'public/brands no tiene ningun SVG: una carpeta vacia pasaria todas las aserciones siguientes',
  );
});

test('2. cada SVG tiene entrada de manifiesto con su svgSha256', () => {
  const byName = new Map(manifest().icons.map((entry) => [entry.name.toLowerCase(), entry]));

  const stale = sourcesOf()
    .filter((source) => {
      const entry = byName.get(source.name.toLowerCase());
      return !entry || entry.svgSha256 !== sha256(join(brandsDir, source.file));
    })
    .map((source) => source.name);

  assert.deepEqual(
    stale,
    [],
    `${stale.length} SVG sin entrada o con svgSha256 desactualizado: ${stale.join(', ')}. Corre \`pnpm icons:build\` y commitea el manifiesto y los .webp.`,
  );
});

test('3. cada entrada tiene su SVG y su WebP, y webpSha256 coincide', () => {
  const svgByName = indexOf('.svg');
  const webpByName = indexOf('.webp');
  const problems = [];

  for (const entry of manifest().icons) {
    const key = entry.name.toLowerCase();
    const svg = svgByName.get(key);
    const webp = webpByName.get(key);
    if (!svg) {
      problems.push(`${entry.name}: entrada sin SVG`);
      continue;
    }
    if (!webp) {
      problems.push(`${entry.name}: entrada sin WebP`);
      continue;
    }
    if (entry.webpSha256 !== sha256(join(brandsDir, webp.file))) {
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
  const sources = new Set(indexOf('.svg').keys());

  const orphans = [...indexOf('.webp')]
    .filter(([key]) => !sources.has(key))
    .map(([, entry]) => entry.name);

  assert.deepEqual(
    orphans,
    [],
    `${orphans.length} WebP huerfano(s): ${orphans.join(', ')}. Un SVG eliminado se poda; corre \`pnpm icons:build\` y commitea el borrado.`,
  );
});

test('5. el manifiesto es version 1 y no repite nombres', () => {
  const parsed = manifest();

  assert.equal(
    parsed.version,
    1,
    'la forma del manifiesto no es la version 1: un bump reescribe el archivo entero',
  );

  const names = parsed.icons.map((entry) => entry.name);
  const duplicates = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];

  assert.deepEqual(
    duplicates,
    [],
    `${duplicates.length} nombre(s) repetido(s) en el manifiesto: ${duplicates.join(', ')}. Dos entradas para un icono colapsan en silencio, asi que el generador aborta; corrige el archivo a mano.`,
  );
});
