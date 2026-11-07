/**
 * Tests del dibujo de badges: la geometria y el contraste son puros y no tocan
 * red. Lo que se afirma es el contrato visible: la cifra que aparece en el
 * README, el color declarado y que un color ilegible no pase en silencio.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
  BADGE_HEIGHT,
  BADGE_MIN_CONTRAST,
  BADGES,
  contrastRatio,
  findBadge,
  renderBadge,
  type BadgeSpec,
} from "./badge-svg.ts";

test("el endpoint resuelve el badge por el nombre de archivo y rechaza el resto", () => {
  assert.equal(findBadge("open-vsx.svg")?.label, "OPEN VSX");
  assert.equal(findBadge("zed.svg")?.label, "ZED");
  assert.equal(findBadge("nope.svg"), null);
  assert.equal(findBadge("open-vsx"), null);
});

test("la cifra se escribe con el formato del sitio y en mayusculas", () => {
  const svg = renderBadge(BADGES["open-vsx"], 5104);
  assert.match(svg, />5\.1K DOWNLOADS</);
  assert.match(svg, />OPEN VSX</);
});

test("una cifra exacta corta no lleva sufijo", () => {
  assert.match(renderBadge(BADGES.zed, 999), />999 DOWNLOADS</);
});

test("el verdaderamente dibujado lleva el alto y los dos colores declarados", () => {
  const svg = renderBadge(BADGES.zed, 1711);
  assert.match(svg, new RegExp(`height="${BADGE_HEIGHT}"`));
  assert.match(svg, /fill="#555555"/);
  assert.match(svg, /fill="#6e56cf"/);
});

test("el ancho crece con la cifra: no recorta el texto al pasar de 999 a 10000", () => {
  const widthOf = (count: number): number => {
    const match = /^<svg[^>]*width="([\d.]+)"/.exec(renderBadge(BADGES.zed, count));
    assert.ok(match, "el svg debe declarar ancho");
    return Number(match[1]);
  };
  assert.ok(widthOf(12000) > widthOf(999));
});

test("un color por debajo de AA sin excepcion escrita no se dibuja", () => {
  const ilegible: BadgeSpec = { ...BADGES.zed, color: "#97ca00", contrastException: undefined };
  assert.ok(contrastRatio("#ffffff", ilegible.color) < BADGE_MIN_CONTRAST);
  assert.throws(() => renderBadge(ilegible, 1711), /debajo del minimo/);
});

test("la excepcion declarada publica el verde, pero el contraste sigue por debajo de AA", () => {
  // Si algun dia el verde alcanza AA, esta excepcion deja de tener sentido y
  // este test lo dice.
  assert.ok(contrastRatio("#ffffff", BADGES["open-vsx"].color) < BADGE_MIN_CONTRAST);
  assert.match(renderBadge(BADGES["open-vsx"], 5104), /fill="#7aa800"/);
});

test("el contraste se calcula sobre los extremos conocidos", () => {
  assert.equal(Number(contrastRatio("#ffffff", "#000000").toFixed(2)), 21);
});

test("una cifra imposible no se dibuja", () => {
  assert.throws(() => renderBadge(BADGES.zed, Number.NaN), RangeError);
  assert.throws(() => renderBadge(BADGES.zed, -1), RangeError);
});
