/**
 * scripts/navbar-deep-link-bg.mjs
 *
 * Guard: opening a deep link into a section must land with an opaque navbar.
 * Regression reference: PR #15 (commit 3a94348) - `scrolled` was only written
 * from inside a `scroll` event, so a restored position arrived before hydration
 * and the navbar stayed transparent over the content.
 *
 * Two calibration details, both verified against the pre-fix deployment, which
 * passes without them and fails with them:
 *
 *  1. The scenario is a LINK, not a reload. Reloading an already scrolled page
 *     fires a `scroll` event and the navbar corrects itself.
 *  2. The link has to be a COLD load, so it needs its own page. Navigating to
 *     the hash from an already loaded page is a same-document anchor scroll,
 *     which also fires a scroll event.
 *
 * Manual on purpose: it needs a server. The verdict itself is pure and covered
 * by scripts/reveal-guards.test.mjs.
 *
 * Usage: node scripts/navbar-deep-link-bg.mjs [--url http://localhost:<port>]
 */
import { chromium } from "playwright";
import { resolveBase } from "./audit-base.mjs";
import { evaluateNavbarDeepLink } from "./lib/reveal-guards.mjs";

const VIEWPORT = { width: 1600, height: 900 };
const DEEP_SECTION = "#precios";
const DEEP_Y = 3000;
const SETTLE_MS = 1500;

const BASE = await resolveBase("navbar-deep-link-bg");
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: true,
});

const readSurface = (page) =>
  page.evaluate(() => document.querySelector(".nav-surface")?.className ?? "");
const readScrollY = (page) => page.evaluate(() => Math.round(window.scrollY));

// Cold load at the top: the hero case, the only place the background must stay
// transparent.
const heroPage = await browser.newPage({ viewport: VIEWPORT });
await heroPage.goto(BASE, { waitUntil: "networkidle" });
await heroPage.waitForTimeout(SETTLE_MS);
const heroClasses = await readSurface(heroPage);

// The reported case: a shared link, in its own page so the document is fresh.
const deepPage = await browser.newPage({ viewport: VIEWPORT });
await deepPage.goto(`${BASE}/${DEEP_SECTION}`, { waitUntil: "networkidle" });
await deepPage.waitForTimeout(SETTLE_MS);
const deepLinkY = await readScrollY(deepPage);
const deepLinkClasses = await readSurface(deepPage);

// Control: the same region reached by scrolling must keep working.
const scrollPage = await browser.newPage({ viewport: VIEWPORT });
await scrollPage.goto(BASE, { waitUntil: "networkidle" });
await scrollPage.waitForTimeout(SETTLE_MS);
await scrollPage.evaluate((y) => window.scrollTo(0, y), DEEP_Y);
await scrollPage.waitForTimeout(600);
const scrolledClasses = await readSurface(scrollPage);

await browser.close();

const result = evaluateNavbarDeepLink({ heroClasses, deepLinkClasses, deepLinkY, scrolledClasses });

console.log("\n== navbar-deep-link-bg ==");
console.log(`  url: ${BASE}`);
console.log(`  viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);
console.log(`  deep link: ${BASE}/${DEEP_SECTION} -> scrollY=${deepLinkY}`);
for (const c of result.checks) {
  console.log(`  ${c.ok ? "PASS" : "FAIL"} ${c.label}${c.detail ? ` - ${c.detail}` : ""}`);
}
console.log(result.ok ? "\nGUARD PASS" : "\nGUARD FAIL");
process.exit(result.ok ? 0 : 1);
