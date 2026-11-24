/**
 * Contrato de agrupacion de la pagina `/proyectos`.
 *
 * Prueba la funcion pura `groupCatalog` de `lib/projects-catalog.ts`: no importa
 * `data/projects.ts` (sus imports no llevan extension y `node --test` falla con
 * `ERR_MODULE_NOT_FOUND`), asi que los fixtures son fichas minimas: el
 * agrupador solo lee `id`, `lineage` y `status`.
 *
 * Lo que se afirma es lo visible: cuantos grupos hay, en que orden, que ficha
 * cae en cada uno y que la entrada no pierde ninguna ficha.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { groupCatalog, projectSeal } from "../lib/projects-catalog.ts";

/**
 * Las 11 fichas del catalogo con el orden real del array (contrato de layout):
 * el hub primero, sus dos productos despues, el resto activo, y lo terminado al
 * final.
 */
function catalog11() {
  return [
    { id: "caf", home: "featured", status: "active" },
    { id: "presidencia", home: "featured", status: "active" },
    { id: "funky-ai", home: "grid", status: "active" },
    { id: "funky-forge", lineage: "funky-ai", status: "pre-release" },
    { id: "funky-secure", lineage: "funky-ai", status: "pre-release" },
    { id: "grinchmas-kart", status: "finished" },
    { id: "cumyxel", status: "finished" },
    { id: "one-click-ti", home: "grid", status: "active" },
    { id: "autoshop", home: "grid", status: "active" },
    { id: "color-highlight-v2", status: "active" },
    { id: "funky-theme", home: "featured", status: "active" },
  ];
}

const ids = (group) => group.projects.map((project) => project.id);

test("tres grupos en orden: familia, resto activo, trabajo anterior", () => {
  const groups = groupCatalog(catalog11());

  assert.deepEqual(
    groups.map((group) => group.kind),
    ["family", "projects", "earlier"],
  );
  assert.deepEqual(ids(groups[0]), ["funky-ai", "funky-forge", "funky-secure"]);
  assert.deepEqual(ids(groups[1]), [
    "caf",
    "presidencia",
    "one-click-ti",
    "autoshop",
    "color-highlight-v2",
    "funky-theme",
  ]);
  assert.deepEqual(ids(groups[2]), ["grinchmas-kart", "cumyxel"]);
});

test("el grupo de familia identifica a la ficha padre por su id", () => {
  const [family] = groupCatalog(catalog11());

  assert.equal(family.lineage, "funky-ai");
});

test("lo terminado va al final aunque en el array venga primero", () => {
  const finishedFirst = [
    { id: "cumyxel", status: "finished" },
    { id: "funky-ai" },
    { id: "funky-forge", lineage: "funky-ai", status: "pre-release" },
    { id: "caf" },
  ];

  const groups = groupCatalog(finishedFirst);

  assert.deepEqual(
    groups.map((group) => group.kind),
    ["family", "projects", "earlier"],
  );
  assert.deepEqual(ids(groups[0]), ["funky-ai", "funky-forge"]);
  assert.deepEqual(ids(groups[1]), ["caf"]);
  assert.deepEqual(ids(groups[2]), ["cumyxel"]);
});

test("un grupo vacio no se emite", () => {
  // Sin linaje no hay familia; sin `finished` no hay trabajo anterior.
  const noFamily = groupCatalog([
    { id: "caf" },
    { id: "presidencia", status: "pre-release" },
  ]);

  assert.deepEqual(
    noFamily.map((group) => group.kind),
    ["projects"],
  );

  const noEarlier = groupCatalog([
    { id: "funky-ai" },
    { id: "funky-forge", lineage: "funky-ai" },
  ]);

  assert.deepEqual(
    noEarlier.map((group) => group.kind),
    ["family"],
  );

  // Un linaje que apunta a una ficha inexistente no inventa una familia.
  const danglingLineage = groupCatalog([
    { id: "one-click-ti", lineage: "no-existe" },
    { id: "autoshop" },
  ]);

  assert.deepEqual(
    danglingLineage.map((group) => group.kind),
    ["projects"],
  );
  assert.deepEqual(ids(danglingLineage[0]), ["one-click-ti", "autoshop"]);
});

test("ninguna ficha se pierde: los grupos particionan la entrada", () => {
  const input = catalog11();
  const groups = groupCatalog(input);

  const emitted = groups.flatMap(ids);

  assert.equal(emitted.length, input.length);
  assert.deepEqual([...emitted].sort(), [...input.map((p) => p.id)].sort());
});

test("el orden del array se conserva dentro de cada grupo", () => {
  const input = catalog11();
  const groups = groupCatalog(input);

  for (const group of groups) {
    const positions = group.projects.map((project) => input.indexOf(project));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  }
});

// ---------------------------------------------------------------------------
// Sello de la tarjeta (T2b)
//
// El sello aparece solo cuando dice algo que el contexto no dice. Tres casos
// visibles en el catalogo: `pre-release` gana, `featured` aplica solo, y una
// ficha terminada o activa sin superficie destacada no lleva sello. La entrada
// de la regla es el shape de la tarjeta (`status` + `featured`), no la ficha
// cruda: `featured` es la API propia de la card.
// ---------------------------------------------------------------------------

test("pre-release gana sobre featured cuando aplican los dos", () => {
  assert.equal(projectSeal({ status: "pre-release", featured: true }), "pre-release");
});

test("featured aplica solo cuando no hay pre-release", () => {
  assert.equal(projectSeal({ status: "active", featured: true }), "featured");
  assert.equal(projectSeal({ featured: true }), "featured");
});

test("una ficha terminada no lleva sello", () => {
  assert.equal(projectSeal({ status: "finished" }), null);
  assert.equal(projectSeal({ status: "finished", featured: false }), null);
});

test("una ficha activa sin superficie destacada no lleva sello", () => {
  assert.equal(projectSeal({ status: "active" }), null);
  assert.equal(projectSeal({}), null);
});
