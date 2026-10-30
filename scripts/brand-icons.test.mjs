// Guard del generador de iconos de marca (ver components-detail.md 4.6).
// Un SVG sin su bitmap hermano sirve un icono roto en produccion, y ni
// typecheck ni build ni i18n lo detectan: este es el unico chequeo que falla.
import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const brandsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'brands');

const isFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

test('cada SVG de public/brands tiene su WebP hermano', () => {
  const svgs = readdirSync(brandsDir)
    .filter((name) => name.endsWith('.svg'))
    .sort();

  assert.ok(svgs.length > 0, 'public/brands no tiene ningun SVG: el guard no puede pasar sin fuentes');

  const missing = svgs
    .filter((name) => !isFile(join(brandsDir, name.replace(/\.svg$/, '.webp'))))
    .map((name) => name.replace(/\.svg$/, '.webp'));

  assert.deepEqual(
    missing,
    [],
    `falta el bitmap de ${missing.length} icono(s): ${missing.join(', ')}. Corre \`pnpm icons:build\` y commitea los .webp.`,
  );
});
