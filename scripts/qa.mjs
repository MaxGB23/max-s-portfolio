/**
 * scripts/qa.mjs
 *
 * One command for every DOM guard, because five separate scripts is a habit
 * nobody keeps. Each guard needs a server; pass `--url` once and it is
 * forwarded to all of them (they read it through scripts/audit-base.mjs).
 *
 * Usage: node scripts/qa.mjs [--url http://localhost:<port>]
 */
import { spawnSync } from "node:child_process";

const guards = ["navbar-deep-link-bg.mjs", "about-reveal-order.mjs"];
const flags = process.argv.slice(2);
const failed = [];

// Names what it is about to run: the docs point at this command instead of
// keeping an inventory of guards that would rot as soon as a third one lands.
console.log(`qa: ${guards.length} guards -> ${guards.map((g) => g.replace(/\.mjs$/, "")).join(", ")}`);

for (const guard of guards) {
  const result = spawnSync(process.execPath, [`scripts/${guard}`, ...flags], {
    stdio: "inherit",
  });
  if (result.status !== 0) failed.push(guard);
}

console.log(
  failed.length === 0
    ? `\nQA: ${guards.length}/${guards.length} guards passed`
    : `\nQA: ${failed.length} of ${guards.length} guards failed -> ${failed.join(", ")}`
);
process.exit(failed.length === 0 ? 0 : 1);
