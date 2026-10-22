#!/usr/bin/env node
// docs.mjs - docs gate for the design canon (no dependencies).
// Policy lives in docs/README.md and AGENTS.md, never here.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const DESIGN = join(DOCS, 'design');
const ENTRY = join(DOCS, 'README.md');

// The canon migration is done: C1-C3 fail the gate, C4 never does (level "note").
const MIGRATION = false;

const TOC_MIN_LINES = 120;
const SIZE_WARN_LINES = 300;
const TOC_START = '<!-- toc:start -->';
const TOC_END = '<!-- toc:end -->';
const DEAD = join(DESIGN, 'DEAD.md');
const AGENTS = join(ROOT, 'AGENTS.md');

// C5: the owner table is the path an agent actually walks; a dead path there
// sends it nowhere with the rest of the gate green.
const AGENTS_MAX_LINES = 80;
const MAP_MAX_ROWS = 40;

const HELP = [
  'docs.mjs - gate del canon de docs (mapa, TOC, nombres muertos, tamano).',
  'Uso: node scripts/docs.mjs [check | toc --write]',
  '  check        Informa C1 (mapa), C2 (TOC), C3 (nombres muertos), C4 (tamano) y C5 (tabla de docs duenos). Es la accion por defecto.',
  '  toc --write  Inserta o regenera el bloque TOC de los docs VIVO de mas de 120 lineas.',
  'Salida: 0 limpio, 1 hallazgos, 2 uso incorrecto.',
].join('\n');

function fail(message) {
  process.stderr.write(`docs.mjs: ${message}\n`);
  process.exit(2);
}

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, '/');
}

function read(file) {
  return readFileSync(file, 'utf8');
}

function eolOf(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function toLines(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function lineCount(text) {
  return toLines(text).length;
}

// VIVO docs: docs/design/*.md (not archive/, not ejemplos/) and docs/*.md.
function listVivoDocs() {
  const files = [];
  const collect = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isFile() && entry.endsWith('.md')) files.push(full);
    }
  };
  collect(DESIGN);
  collect(DOCS);
  return files.sort();
}

export function headings(lines) {
  const out = [];
  let fence = null;
  lines.forEach((raw, index) => {
    const line = raw.replace(/\r$/, '');
    const fenceMark = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMark) {
      const marker = fenceMark[1][0];
      if (fence === marker) fence = null;
      else if (fence === null) fence = marker;
      return;
    }
    if (fence !== null) return;
    const match = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (match) out.push({ level: match[1].length, text: match[2], index });
  });
  return out;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function tocEntries(list) {
  const seen = new Map();
  const entries = [];
  for (const heading of list) {
    if (heading.level !== 2) continue;
    const base = slugify(heading.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${count}`;
    entries.push(`- [${heading.text}](#${slug})`);
  }
  return entries;
}

function tocRange(lines) {
  const start = lines.findIndex((line) => line.trim() === TOC_START);
  if (start === -1) return null;
  const end = lines.findIndex((line, index) => index > start && line.trim() === TOC_END);
  return end === -1 ? null : { start, end };
}

function expectedToc(list, eol) {
  return [TOC_START, ...tocEntries(list), TOC_END].map((line) => line + eol);
}

function applyToc(file, text, findings) {
  const lines = toLines(text);
  const list = headings(lines);
  const eol = eolOf(text);
  const block = expectedToc(list, eol);
  const range = tocRange(lines);

  if (range) {
    const current = lines.slice(range.start, range.end + 1).map((line) => line + eol);
    if (current.join('') === block.join('')) return false;
    lines.splice(range.start, range.end - range.start + 1, ...block.map((line) => line.replace(/\r?\n$/, '')));
  } else {
    const h1 = list.find((heading) => heading.level === 1);
    if (!h1) {
      findings.push({ level: 'error', file, message: 'sin H1: no se puede anclar el TOC' });
      return false;
    }
    lines.splice(h1.index + 1, 0, '', ...block.map((line) => line.replace(/\r?\n$/, '')));
  }

  const trailing = text.endsWith('\n') ? eol : '';
  writeFileSync(file, lines.join(eol) + trailing, 'utf8');
  return true;
}

// Anclas reales del doc, con la desambiguacion `-1`, `-2` que usa GitHub,
// para poder validar enlaces con fragmento sin abrir el navegador.
export function anchorSlugs(text) {
  const seen = new Map();
  const slugs = new Set();
  for (const heading of headings(toLines(text))) {
    const base = slugify(heading.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  return slugs;
}

export function checkToc(file, text, findings) {
  if (lineCount(text) <= TOC_MIN_LINES) return;
  const lines = toLines(text);
  const list = headings(lines);
  const range = tocRange(lines);
  if (!range) {
    findings.push({ level: 'note', file, message: `C2: falta el bloque TOC (${lineCount(text)} lineas)` });
    return;
  }
  const expected = expectedToc(list, eolOf(text)).map((line) => line.replace(/\r?\n$/, ''));
  const current = lines.slice(range.start, range.end + 1);
  if (current.join('\n') !== expected.join('\n')) {
    findings.push({ level: 'note', file, message: 'C2: el TOC no coincide con los H2 reales' });
  }
}

const LINK_RE = /\[[^\]]*\]\(\s*([^)\s]+)\s*\)/g;

// Destino y fragmento de cada enlace relativo. Externos y anclas locales se
// ignoran: no hay archivo que resolver.
export function linkRefs(text) {
  const refs = [];
  for (const match of text.matchAll(LINK_RE)) {
    const raw = match[1].trim();
    if (/^(https?:|mailto:)/.test(raw)) continue;
    const hash = raw.indexOf('#');
    const target = hash === -1 ? raw : raw.slice(0, hash);
    const fragment = hash === -1 ? '' : raw.slice(hash + 1);
    if (!target) continue;
    refs.push({ target, fragment });
  }
  return refs;
}

function resolveLink(file, target) {
  return target.startsWith('/') ? join(ROOT, target.slice(1)) : resolve(dirname(file), target);
}

// `lookup(target)` devuelve el texto del doc o null si no existe: asi la regla
// se prueba sin disco.
export function missingAnchors(refs, lookup) {
  const missing = [];
  for (const ref of refs) {
    if (!ref.fragment) continue;
    const text = lookup(ref.target);
    if (text == null) {
      missing.push({ ...ref, reason: 'missing-file' });
      continue;
    }
    if (!anchorSlugs(text).has(ref.fragment)) missing.push({ ...ref, reason: 'missing-anchor' });
  }
  return missing;
}

// El mapa cita la seccion en prosa ("doc + 4.4"), no como fragmento, asi que se
// valida el numero contra los headings del doc destino.
const MAP_SECTION_RE = /\]\(\s*([^)\s#]+)\s*\)\s*(\d+(?:\.\d+)?)\b/;

export function mapSectionRefs(text) {
  const refs = [];
  for (const line of toLines(text)) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1);
    const last = (cells[cells.length - 1] ?? '').trim();
    const match = MAP_SECTION_RE.exec(last);
    if (match) refs.push({ target: match[1], section: match[2] });
  }
  return refs;
}

export function docSections(text) {
  const sections = new Set();
  for (const heading of headings(toLines(text))) {
    const match = /^(\d+(?:\.\d+)?)[.\s]/.exec(heading.text);
    if (match) sections.add(match[1]);
  }
  return sections;
}

export function missingSections(refs, lookup) {
  const missing = [];
  for (const ref of refs) {
    const text = lookup(ref.target);
    if (text == null) {
      missing.push({ ...ref, reason: 'missing-file' });
      continue;
    }
    if (!docSections(text).has(ref.section)) missing.push({ ...ref, reason: 'missing-section' });
  }
  return missing;
}

function checkMap(files, findings) {
  if (!existsSync(ENTRY)) {
    findings.push({ level: 'warning', file: ENTRY, message: 'C1: docs/README.md no existe todavia' });
    return;
  }

  const reachable = new Set([ENTRY]);
  let frontier = [ENTRY];
  for (let hop = 0; hop < 2 && frontier.length > 0; hop += 1) {
    const next = [];
    for (const file of frontier) {
      for (const ref of linkRefs(read(file))) {
        const target = resolveLink(file, ref.target);
        if (!target.endsWith('.md')) continue;
        if (!existsSync(target)) {
          findings.push({ level: 'warning', file, message: `C1: enlace roto -> ${rel(target)}` });
          continue;
        }
        if (ref.fragment && !anchorSlugs(read(target)).has(ref.fragment)) {
          findings.push({
            level: 'error',
            file,
            message: `C1: ancla inexistente -> ${rel(target)}#${ref.fragment}`,
          });
        }
        if (!reachable.has(target)) {
          reachable.add(target);
          next.push(target);
        }
      }
    }
    frontier = next;
  }

  for (const file of files) {
    if (!reachable.has(file)) {
      findings.push({ level: 'warning', file, message: 'C1: doc VIVO fuera del mapa' });
    }
  }
}

function checkMapSections(findings) {
  if (!existsSync(ENTRY)) return;
  const refs = mapSectionRefs(read(ENTRY));
  const missing = missingSections(refs, (target) => {
    const full = resolve(dirname(ENTRY), target);
    return existsSync(full) ? read(full) : null;
  });
  for (const miss of missing) {
    findings.push({
      level: 'error',
      file: ENTRY,
      message: `C1: seccion citada inexistente -> ${miss.target} ${miss.section}`,
    });
  }
}

export function checkSize(file, text, findings) {
  const count = lineCount(text);
  if (count > SIZE_WARN_LINES) {
    findings.push({ level: 'note', file, message: `C4: ${count} lineas (presupuesto ${SIZE_WARN_LINES})` });
  }
}

// Only the backticked tokens of the first cell count: prose rows are documentation.
function deadTokens() {
  if (!existsSync(DEAD)) return [];
  const tokens = new Set();
  for (const line of toLines(read(DEAD))) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|');
    if (cells.length < 3) continue;
    for (const match of cells[1].matchAll(/`([^`]+)`/g)) tokens.add(match[1]);
  }
  return [...tokens];
}

function allowedTokens(text) {
  const allowed = new Set();
  for (const match of text.matchAll(/<!--\s*docs-lint:\s*allow-tokens\s+([^>]*?)-->/g)) {
    for (const token of match[1].trim().split(/\s+/)) {
      if (token) allowed.add(token);
    }
  }
  return allowed;
}

export function checkDead(file, text, tokens, findings) {
  if (resolve(file) === DEAD || tokens.length === 0) return 0;
  const allowed = allowedTokens(text);
  const listed = tokens.filter((token) => !allowed.has(token));
  if (listed.length === 0) return allowed.size;
  const lines = toLines(text);
  lines.forEach((line, index) => {
    for (const token of listed) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`).test(line)) {
        findings.push({ level: 'warning', file, message: `C3: nombre muerto \`${token}\` (linea ${index + 1})` });
      }
    }
  });
  return allowed.size;
}

// Rows of the first table that appears after a matching line (header excluded).
export function tableAfter(lines, matcher) {
  const at = lines.findIndex((line) => matcher.test(line));
  if (at === -1) return null;
  let i = at + 1;
  while (i < lines.length && !lines[i].trim().startsWith('|')) {
    if (lines[i].trim() !== '') return null;
    i += 1;
  }
  const rows = [];
  let header = true;
  for (; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) continue;
    if (header) {
      header = false;
      continue;
    }
    rows.push(cells);
  }
  return rows;
}

export function ownerDocPaths(rows) {
  const paths = [];
  for (const cells of rows ?? []) {
    for (const match of (cells[cells.length - 1] ?? '').matchAll(/`([^`]+)`/g)) {
      if (match[1].endsWith('.md')) paths.push(match[1]);
    }
  }
  return paths;
}

function checkOwnerTable(findings) {
  if (!existsSync(AGENTS)) {
    findings.push({ level: 'warning', file: AGENTS, message: 'C5: AGENTS.md no existe' });
    return;
  }
  const text = read(AGENTS);
  const count = lineCount(text);
  if (count > AGENTS_MAX_LINES) {
    findings.push({
      level: 'note',
      file: AGENTS,
      message: `C5: ${count} lineas (tope ${AGENTS_MAX_LINES}); mueve el detalle a docs/README.md`,
    });
  }
  const rows = tableAfter(toLines(text), /^-\s+Docs due\S*os:/i);
  if (rows === null) {
    findings.push({ level: 'warning', file: AGENTS, message: 'C5: falta la tabla de docs duenos' });
    return;
  }
  for (const path of ownerDocPaths(rows)) {
    if (!existsSync(resolve(ROOT, path))) {
      findings.push({ level: 'error', file: AGENTS, message: `C5: doc dueno inexistente -> ${path}` });
    }
  }
}

function checkMapRows(findings) {
  if (!existsSync(ENTRY)) return;
  const rows = tableAfter(toLines(read(ENTRY)), /^##\s+Mapa de preguntas/i);
  if (rows === null) return;
  if (rows.length > MAP_MAX_ROWS) {
    findings.push({
      level: 'note',
      file: ENTRY,
      message: `C5: mapa con ${rows.length} filas (tope ${MAP_MAX_ROWS}); fusiona o retira la menos usada`,
    });
  }
}

function runToc(write) {
  const findings = [];
  let changed = 0;
  for (const file of listVivoDocs()) {
    const text = read(file);
    if (lineCount(text) <= TOC_MIN_LINES) continue;
    if (write) {
      if (applyToc(file, text, findings)) changed += 1;
    } else {
      checkToc(file, text, findings);
    }
  }
  return { findings, changed };
}

function runCheck() {
  const findings = [];
  const files = listVivoDocs();
  const tokens = deadTokens();
  let exemptions = 0;
  checkMap(files, findings);
  checkMapSections(findings);
  checkOwnerTable(findings);
  checkMapRows(findings);
  for (const file of files) {
    const text = read(file);
    checkToc(file, text, findings);
    checkSize(file, text, findings);
    if (checkDead(file, text, tokens, findings) > 0) exemptions += 1;
  }
  return { findings, exemptions };
}

function report(findings, exemptions = 0) {
  const blocks = (finding) => finding.level === 'error' || (finding.level === 'warning' && !MIGRATION);
  const blocking = findings.filter(blocks);
  for (const finding of findings) {
    const kind = finding.level === 'note' ? 'aviso' : blocks(finding) ? 'error' : 'aviso';
    process.stdout.write(`${kind}: ${rel(finding.file)}: ${finding.message}\n`);
  }
  if (findings.length === 0) process.stdout.write('docs: sin hallazgos\n');
  else process.stdout.write(`docs: ${findings.length} hallazgo(s), ${blocking.length} bloqueante(s)\n`);
  if (exemptions > 0) process.stdout.write(`docs: ${exemptions} archivo(s) con allow-tokens\n`);
  return blocking.length;
}

// Solo corre el CLI cuando se ejecuta como script: al importarlo desde los
// tests, este bloque no debe ni interpretar argv ni llamar a process.exit.
const invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

const argv = process.argv.slice(2);
if (invokedDirectly && (argv.includes('--help') || argv.includes('-h'))) {
  process.stdout.write(`${HELP}\n`);
  process.exit(0);
}

const command = argv[0] ?? 'check';
if (invokedDirectly && command === 'check' && argv.length === 1) {
  const { findings, exemptions } = runCheck();
  process.exit(report(findings, exemptions) > 0 ? 1 : 0);
}
if (invokedDirectly && command === 'toc') {
  if (argv.length !== 2 || argv[1] !== '--write') fail('toc solo acepta --write');
  const { findings, changed } = runToc(true);
  report(findings);
  process.stdout.write(`docs: TOC escrito en ${changed} archivo(s)\n`);
  process.exit(findings.some((finding) => finding.level === 'error') ? 1 : 0);
}
if (!invokedDirectly) {
  // Importado como modulo (tests): no hay CLI que ejecutar.
} else {
  fail(`subcomando desconocido: ${argv.join(' ')}`);
}
