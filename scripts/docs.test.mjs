// Tests del gate de docs. Fixtures en memoria, sin tocar el arbol real.
// Un test por regla; los casos son los que la propia regla nombra.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  anchorSlugs,
  checkDead,
  checkSize,
  checkToc,
  docSections,
  linkRefs,
  mapSectionRefs,
  missingAnchors,
  missingSections,
  tableAfter,
  ownerDocPaths,
} from './docs.mjs';

const filler = (count) => Array.from({ length: count }, (_, i) => `linea ${i + 1}`).join('\n');
const findings = () => [];

test('C2: un doc largo sin bloque TOC se reporta una vez', () => {
  const sink = findings();
  checkToc('fixture.md', `# Doc\n\n## Uno\n\n${filler(130)}`, sink);
  assert.equal(sink.length, 1);
  assert.match(sink[0].message, /C2: falta el bloque TOC/);
});

test('C2: un doc corto no exige TOC (limite de 120 lineas)', () => {
  const sink = findings();
  checkToc('fixture.md', `# Doc\n\n## Uno\n\n${filler(100)}`, sink);
  assert.deepEqual(sink, []);
});

test('C2: un TOC desincronizado se reporta', () => {
  const sink = findings();
  const text = [
    '# Doc',
    '',
    '<!-- toc:start -->',
    '- [Vieja](#vieja)',
    '<!-- toc:end -->',
    '',
    '## Nueva',
    '',
    filler(130),
  ].join('\n');
  checkToc('fixture.md', text, sink);
  assert.equal(sink.length, 1);
  assert.match(sink[0].message, /C2: el TOC no coincide con los H2 reales/);
});

test('C2: un TOC correcto no reporta nada', () => {
  const sink = findings();
  const text = [
    '# Doc',
    '',
    '<!-- toc:start -->',
    '- [Uno](#uno)',
    '<!-- toc:end -->',
    '',
    '## Uno',
    '',
    filler(130),
  ].join('\n');
  checkToc('fixture.md', text, sink);
  assert.deepEqual(sink, []);
});

test('C2: no bloquea cuando el nivel es note', () => {
  const sink = findings();
  checkToc('fixture.md', `# Doc\n\n## Uno\n\n${filler(130)}`, sink);
  assert.equal(sink[0].level, 'note');
});

test('C4: el presupuesto de tamano es un aviso, nunca un bloqueo', () => {
  const sink = findings();
  checkSize('fixture.md', filler(301), sink);
  assert.equal(sink.length, 1);
  assert.equal(sink[0].level, 'note');
});

test('C3: un nombre muerto en otro doc se reporta', () => {
  const sink = findings();
  checkDead('fixture.md', 'Usa `FadeIn` para la entrada.', ['FadeIn'], sink);
  assert.equal(sink.length, 1);
  assert.match(sink[0].message, /C3: nombre muerto `FadeIn` \(linea 1\)/);
});

test('C3: el nombre muerto en DEAD.md no se reporta contra si mismo', () => {
  const sink = findings();
  checkDead('docs/design/DEAD.md', 'Usa `FadeIn` para la entrada.', ['FadeIn'], sink);
  assert.deepEqual(sink, []);
});

test('C3: allow-tokens exime el token en ese archivo', () => {
  const sink = findings();
  const text = '<!-- docs-lint: allow-tokens FadeIn -->\n\nUsa `FadeIn` aqui.';
  checkDead('fixture.md', text, ['FadeIn'], sink);
  assert.deepEqual(sink, []);
});

test('C3: no confunde un token con su version mas larga', () => {
  const sink = findings();
  checkDead('fixture.md', 'Usa `FadeInStagger` aqui.', ['FadeIn'], sink);
  assert.deepEqual(sink, []);
});

test('C1: linkRefs separa destino y fragmento e ignora externos y anclas locales', () => {
  const text = [
    '[a](design/sections.md#2-gap)',
    '[b](https://example.com/x)',
    '[c](mailto:hola@example.com)',
    '[d](#local)',
    '[e](i18n.md)',
  ].join('\n');
  assert.deepEqual(linkRefs(text), [
    { target: 'design/sections.md', fragment: '2-gap' },
    { target: 'i18n.md', fragment: '' },
  ]);
});

test('C1: un ancla existente se acepta', () => {
  const docs = new Map([['design/sections.md', '# Sections\n\n## 2. Gap entre secciones\n']]);
  const refs = linkRefs('[x](design/sections.md#2-gap-entre-secciones)');
  assert.deepEqual(missingAnchors(refs, (target) => docs.get(target) ?? null), []);
});

test('C1: un ancla rota se reporta con su motivo', () => {
  const docs = new Map([['design/sections.md', '# Sections\n\n## 2. Gap entre secciones\n']]);
  const refs = linkRefs('[x](design/sections.md#2-gap-viejo)');
  const missing = missingAnchors(refs, (target) => docs.get(target) ?? null);
  assert.equal(missing.length, 1);
  assert.equal(missing[0].reason, 'missing-anchor');
  assert.equal(missing[0].fragment, '2-gap-viejo');
});

test('C1: un archivo destino inexistente se reporta como missing-file', () => {
  const refs = linkRefs('[x](design/no-existe.md#cualquiera)');
  const missing = missingAnchors(refs, () => null);
  assert.equal(missing.length, 1);
  assert.equal(missing[0].reason, 'missing-file');
});

test('C1: anchorSlugs desambigua headings repetidos como GitHub', () => {
  const slugs = anchorSlugs('# Doc\n\n## Deuda\n\n## Deuda\n');
  assert.ok(slugs.has('deuda'));
  assert.ok(slugs.has('deuda-1'));
});

test('C1: el mapa cita seccion por numero y se valida contra los headings', () => {
  const entry = '| Pregunta | Respuesta | [sections.md](design/sections.md) 2 |';
  const refs = mapSectionRefs(entry);
  assert.deepEqual(refs, [{ target: 'design/sections.md', section: '2' }]);
  const docs = new Map([['design/sections.md', '# Sections\n\n## 2. Gap entre secciones\n']]);
  assert.deepEqual(missingSections(refs, (target) => docs.get(target) ?? null), []);
});

test('C1: una seccion citada que ya no existe se reporta', () => {
  const refs = mapSectionRefs('| P | R | [sections.md](design/sections.md) 4.4 |');
  const docs = new Map([['design/sections.md', '# Sections\n\n## 2. Gap entre secciones\n']]);
  const missing = missingSections(refs, (target) => docs.get(target) ?? null);
  assert.equal(missing.length, 1);
  assert.equal(missing[0].section, '4.4');
});

test('C1: docSections lee solo el numero inicial del heading', () => {
  const sections = docSections('# Doc\n\n## 2. Gap\n\n### 4.10 Volver\n\n## Sin numero\n');
  assert.deepEqual([...sections].sort(), ['2', '4.10']);
});

test('C5: tableAfter devuelve las filas de la tabla que sigue al marcador', () => {
  const text = ['- Docs duenos:', '', '| Si tocas | Doc |', '|---|---|', '| shell | `docs/a.md` |', '| ritmo | `docs/b.md` |'].join('\n');
  const rows = tableAfter(text.split('\n'), /^-\s+Docs due\S*os:/i);
  assert.deepEqual(ownerDocPaths(rows), ['docs/a.md', 'docs/b.md']);
});
