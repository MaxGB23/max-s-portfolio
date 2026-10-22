import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkTrace } from './commit-trace.mjs';

const message = (body) => `docs(gate): tighten the docs gate\n\n${body}`;
const exists = (path) => path === 'docs/README.md';

test('commit-msg: un mensaje con Docs y Risk completos pasa', () => {
  const problems = checkTrace(message('Docs: docs/README.md - nueva regla\nRisk: none'), { exists });
  assert.deepEqual(problems, []);
});

test('commit-msg: falta Docs se reporta', () => {
  const problems = checkTrace(message('Risk: none'), { exists });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /falta la linea `Docs:`/);
});

test('commit-msg: falta Risk se reporta', () => {
  const problems = checkTrace(message('Docs: none - solo codigo'), { exists });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /falta la linea `Risk:`/);
});

test('commit-msg: un Docs con formato invalido se reporta', () => {
  const problems = checkTrace(message('Docs: cambie cosas\nRisk: none'), { exists });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /esperaba `<archivo>\.md - <que cambio>`/);
});

test('commit-msg: un Docs que cita un doc inexistente se reporta', () => {
  const problems = checkTrace(message('Docs: docs/no-existe.md - algo\nRisk: none'), { exists });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /el archivo citado no existe/);
});

test('commit-msg: un Risk con formato invalido se reporta', () => {
  const problems = checkTrace(message('Docs: none - solo codigo\nRisk: item 9'), { exists });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /esperaba `none` o `item 1-6/);
});

test('commit-msg: un Risk item con motivo pasa', () => {
  const problems = checkTrace(message('Docs: none - solo codigo\nRisk: item 3 (rompe un flag)'), { exists });
  assert.deepEqual(problems, []);
});

test('commit-msg: un commit de merge no lleva rastro y no se bloquea', () => {
  const problems = checkTrace('Merge pull request #6 from MaxGB23/feat/x\n\nbody sin rastro', { exists });
  assert.deepEqual(problems, []);
});
