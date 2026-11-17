/**
 * scripts/anchor-state-guards.test.mjs
 *
 * CI guard for the navigation that `a5a45dc` had to fix (20 oct): the arrival
 * announcement called `history.replaceState(null, ...)`, and that `null` wipes
 * `history.state` — the tree Next keeps there to CONFIRM a transition in
 * flight. On a cold visit with a slow RSC the announcement (or its 1600 ms
 * backstop) fired mid-transition, the router could not confirm, the URL stayed
 * on `/#proyectos` and the detail page never painted.
 * See `docs/issues/navigation-race.md` and `docs/design/platform.md` 8.
 *
 * The fix is one character wide (`window.history.state` instead of `null`), so
 * it is exactly the kind of guarantee that gets lost to a copy-paste. This test
 * reads every `replaceState` call in `hooks/` and `components/` and fails when
 * the FIRST argument is the literal `null`.
 *
 * Source level on purpose: no browser, no bundle, no build. It runs in
 * `pnpm test` (`node --test "scripts/*.test.mjs"`).
 *
 * Why the first argument and not the URL: `replaceState(state, title, url)` is
 * the signature, so `null` is only legal as the URL and never as the state.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
/** The two directories that own URL rewriting (the only ones today). */
const GUARDED_DIRS = ["hooks", "components"];
const SOURCE_EXTENSIONS = /\.(ts|tsx)$/;

/** Every source file under `dir`, recursively, in a stable order. */
function sources(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  )) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...sources(full));
      continue;
    }
    if (SOURCE_EXTENSIONS.test(entry.name)) files.push(full);
  }
  return files;
}

/**
 * Splits the argument list of the call whose `(` sits at `open`.
 * Nesting (`()`, `[]`, `{}`) and quotes are honoured, so `base + (a, b)` or a
 * `", "` string cannot fake a separator. Returns the raw source of each
 * argument, trimmed of nothing: the caller trims, because `null ` is the same
 * argument as `null`.
 */
function callArguments(source, open) {
  const args = [];
  let depth = 0;
  let current = "";
  for (let i = open; i < source.length; i++) {
    const char = source[i];
    if (char === '"' || char === "'" || char === "`") {
      const close = char;
      let j = i + 1;
      for (; j < source.length; j++) {
        if (source[j] === "\\") {
          j++;
          continue;
        }
        if (source[j] === close) break;
      }
      current += source.slice(i, j + 1);
      i = j;
      continue;
    }
    if (char === "(" || char === "[" || char === "{") {
      depth++;
      if (depth === 1) continue; // the call's own paren
      current += char;
      continue;
    }
    if (char === ")" || char === "]" || char === "}") {
      depth--;
      if (depth === 0) {
        if (current.trim() !== "") args.push(current);
        return args;
      }
      current += char;
      continue;
    }
    if (char === "," && depth === 1) {
      args.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  return args;
}

/**
 * Every `replaceState(...)` call in `source` that passes the literal `null` as
 * its first argument, with the line it starts on.
 * A call with no arguments (`replaceState()`) has no first argument, so it is
 * not a hit: the guard is about the value written into `history.state`.
 */
export function nullStateWrites(source) {
  const hits = [];
  const pattern = /\breplaceState\s*\(/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const open = match.index + match[0].length - 1;
    const args = callArguments(source, open);
    if (args.length === 0) continue;
    if (args[0].trim() !== "null") continue;
    const before = source.slice(0, match.index);
    hits.push({
      line: before.split("\n").length,
      call: source.slice(match.index, match.index + 60).split("\n")[0],
    });
  }
  return hits;
}

/** Every `replaceState(...)` call in `source`, whatever its arguments. */
export function replaceStateCalls(source) {
  const calls = [];
  const pattern = /\breplaceState\s*\(/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const before = source.slice(0, match.index);
    calls.push({
      line: before.split("\n").length,
      args: callArguments(source, match.index + match[0].length - 1).map((a) => a.trim()),
    });
  }
  return calls;
}

// --- The detector itself ---------------------------------------------------
// These two cases are the reason the repo assertion below is not vacuous: a
// scanner that silently matches nothing would pass forever. The first one is
// the historic bug spelled out.

test("flags `null` as the first argument of replaceState", () => {
  const source = [
    "window.history.replaceState(null, \"\", base + href);",
    "history.replaceState( null , \"\", \"/\" );",
    "history.replaceState(null, '', href)",
  ].join("\n");
  assert.deepEqual(
    nullStateWrites(source).map((hit) => hit.line),
    [1, 2, 3]
  );
});

test("accepts a preserved history.state and ignores `null` elsewhere in the call", () => {
  const preserved = [
    "window.history.replaceState(window.history.state, \"\", \"/\");",
    "history.replaceState(state, null, null);",
    "history.replaceState(coordinates(...), \"\", base + (href ?? \"\"));",
  ].join("\n");
  assert.deepEqual(nullStateWrites(preserved), []);
});

test("counts arguments by nesting and quotes, not by commas in strings", () => {
  const calls = replaceStateCalls(
    ["history.replaceState(fn(a, b), \"\", \", \" + href);"].join("\n")
  );
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, ["fn(a, b)", '""', '", " + href']);
});

// --- The repository --------------------------------------------------------

test("no replaceState in hooks/ or components/ wipes history.state", () => {
  const violations = [];
  const inventory = [];
  for (const dir of GUARDED_DIRS) {
    for (const file of sources(join(ROOT, dir))) {
      const source = readFileSync(file, "utf8");
      const name = relative(ROOT, file).split("\\").join("/");
      for (const call of replaceStateCalls(source)) {
        inventory.push(`${name}:${call.line} (${call.args[0] ?? "sin argumentos"}, ...)`);
      }
      for (const hit of nullStateWrites(source)) {
        violations.push(`${name}:${hit.line}: ${hit.call}`);
      }
    }
  }

  // Anti-vacuity: the guarded surface really is the one that rewrites URLs.
  // Two call sites exist today (hooks/use-lenis.tsx, components/navbar.tsx);
  // the assertion stays a floor so a legitimately added site does not fail CI
  // for being new — it fails only if it passes `null`.
  assert.ok(
    inventory.length >= 2,
    `se esperaban al menos 2 llamadas a replaceState en ${GUARDED_DIRS.join("/")} y ${GUARDED_DIRS.join("/")}, encontradas ${inventory.length}: ${inventory.join("; ")}`
  );
  assert.deepEqual(
    violations,
    [],
    `replaceState(null, ...) borra history.state y mata la transicion en vuelo (a5a45dc): ${violations.join("; ")}`
  );
});
