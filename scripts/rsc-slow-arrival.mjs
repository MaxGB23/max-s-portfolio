/**
 * scripts/rsc-slow-arrival.mjs
 *
 * Regression for the October navigation bug (`a5a45dc`, 20 oct): a card click
 * whose RSC payload is still in flight must still land on `/proyectos/<id>`.
 *
 * What happened: `announceArrival` called `history.replaceState(null, ...)`, and
 * that `null` wipes `history.state` — the tree Next keeps there to CONFIRM a
 * transition. On a cold visit with a slow RSC the announcement (or its 1600 ms
 * backstop) fired mid-transition, the router could not confirm, the URL stayed
 * on `/#proyectos` and the ficha never painted. The fix preserved
 * `history.state` (`hooks/use-lenis.tsx`); the source-level half of the guard is
 * `scripts/anchor-state-guards.test.mjs`, which reads every `replaceState` call.
 * This script owns the runtime half: it proves the END-TO-END claim with the
 * same ~2.6 s reproduction figure the fix was measured with, and it proves it is
 * not vacuous by replaying the old call from the page.
 *
 * The reproduction, in order:
 *  1. A production build (`pnpm build && pnpm start`). Dev falsifies this:
 *     prefetching, chunking and the compile-on-demand of the route all differ.
 *  2. Every request under `/proyectos/**` is delayed 2.6 s, so the card click
 *     leaves a transition in flight instead of committing instantly.
 *  3. Load `/` cold, wait for the grid, click a card.
 *  4. Bounded wait, then assert the final path is the clicked card's href, the
 *     ficha's own heading is in the DOM, and the URL is not stuck on the anchor.
 *
 * The second case is the non-vacuity proof, and it is why this is not "assert a
 * URL after a fixed sleep": it runs the same scenario with the historical call
 * injected from the page (`history.replaceState(null, "", "/#proyectos")`,
 * 400 ms after the click, while the payload is still delayed). If the probe
 * cannot SEE the bug when the bug is literally replayed, its pass in case 1
 * means nothing, so that case must FAIL the arrival. Neither case touches
 * product code: the injection is a page script, not a change to the app.
 *
 * Exit codes: 0 both cases produced the expected outcome, 1 the claimed case
 * failed or the injected bug was not detected (observed URL and DOM state are
 * printed either way), 2 no server is answering at the base URL.
 *
 * Manual on purpose (`scripts/` is not part of CI): it needs a production
 * build and a server, like the rest of the browser layer.
 *
 * Usage: pnpm build && pnpm start  (in another shell)
 *        node scripts/rsc-slow-arrival.mjs [--url http://localhost:<port>] [--claim-only]
 *        PW_ENGINE=webkit ... picks the engine explicitly (default: probe the
 *        installed ones and use the first that launches).
 */
import { chromium, webkit } from "playwright";
import { resolveBase } from "./audit-base.mjs";

/** The commit's own reproduction figure: the RSC arrives after ~2.6 s. */
const DELAY_MS = 2600;
/** Generous bound: a healthy arrival measures ~3.2 s (delay + router commit). */
const ARRIVAL_TIMEOUT_MS = 12000;
/** When the replayed `replaceState` fires, counted from the click: inside the
 *  delayed window, i.e. while the transition is in flight. */
const CLOBBER_AT_MS = 400;
const VIEWPORT = { width: 1440, height: 900 };
/** The grid's whole-card link (`components/project-card.tsx`). */
const CARD_LINK = "#all-projects .project-card a[href^='/proyectos/']";
/** The historical stuck state, as `a5a45dc` left it. */
const STUCK_URL = "/#proyectos";

/**
 * Engines are PROBED, not assumed: a missing browser binary in `node_modules`
 * binaries (`npx playwright install <engine>`) would otherwise fail with a bare
 * "Executable doesn't exist" from inside the scenario. The order is the cheap
 * default first; `PW_ENGINE` pins one (the claim is router/history state written
 * from JS, so the engine does not change the verdict — unlike the touch-scroll
 * incidents, which only WebKit reproduces).
 */
const ENGINES = [
  { name: "chrome", launch: () => chromium.launch({ channel: "chrome", headless: true }) },
  { name: "chromium", launch: () => chromium.launch({ headless: true }) },
  { name: "webkit", launch: () => webkit.launch({ headless: true }) },
];

async function pickEngine() {
  const wanted = (process.env.PW_ENGINE || "").trim().toLowerCase();
  const candidates = wanted ? ENGINES.filter((engine) => engine.name === wanted) : ENGINES;
  if (candidates.length === 0) {
    throw new Error(
      `unknown PW_ENGINE "${wanted}" - understood: ${ENGINES.map((e) => e.name).join(", ")}`
    );
  }

  const skipped = [];
  for (const engine of candidates) {
    try {
      const browser = await engine.launch();
      await browser.close();
      return { engine, skipped };
    } catch (error) {
      skipped.push(`${engine.name}: ${String(error.message || error).split("\n")[0]}`);
    }
  }
  throw new Error(
    `no Playwright engine could launch\n  ${skipped.join("\n  ")}\n` +
      `  Install one with: npx playwright install chromium webkit`
  );
}

/**
 * Runs the scenario once. `fault` injects the historical `replaceState` call
 * from the page; everything else is identical, so the two cases differ in
 * exactly the one variable the bug is about.
 */
async function runCase(engine, base, { fault }) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  const delayed = [];
  const pageErrors = [];

  // Only the route segment: `new URL(url).pathname` keeps image variants
  // (`/_next/image?url=...`) and the home page itself out of the delay.
  await page.route(
    (url) => url.pathname.startsWith("/proyectos/"),
    async (route) => {
      const entry = { url: route.request().url().slice(base.length), startedAt: Date.now() };
      delayed.push(entry);
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      entry.releasedAt = Date.now();
      await route.continue().catch(() => {});
    }
  );
  page.on("pageerror", (error) => pageErrors.push(String(error.message || error)));

  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(CARD_LINK, { timeout: 20000 });
  const href = await page.getAttribute(CARD_LINK, "href");
  const clickedAt = Date.now();
  await page.click(CARD_LINK, { force: true });

  let injected = null;
  if (fault) {
    // The exact call `a5a45dc` removed: `null` as the state argument.
    injected = await page.evaluate(
      ({ target, delayMs }) => {
        window.setTimeout(() => {
          try {
            window.history.replaceState(null, "", target);
            window.__clobberAt = Date.now();
          } catch (error) {
            window.__clobberError = String(error);
          }
        }, delayMs);
        return target;
      },
      { target: STUCK_URL, delayMs: CLOBBER_AT_MS }
    );
  }

  let arrived = false;
  try {
    await page.waitForFunction(
      () => /^\/proyectos\/[^/]+\/?$/.test(window.location.pathname) && window.location.hash === "",
      undefined,
      { timeout: ARRIVAL_TIMEOUT_MS }
    );
    arrived = true;
  } catch {
    // Falling through is the observation: the report below prints what the page
    // actually shows, which is what the historical bug looked like.
  }
  const elapsedMs = Date.now() - clickedAt;
  // Let the ficha paint (claim) or the stuck URL settle (fault) before reading.
  await page.waitForTimeout(800);

  const observed = await page.evaluate(() => ({
    url: window.location.href,
    pathname: window.location.pathname,
    hash: window.location.hash,
    heading: document.querySelector(".detail-hero h1")?.textContent?.trim() ?? null,
    grid: Boolean(document.querySelector("#all-projects")),
    clobberAt: window.__clobberAt ?? null,
    clobberError: window.__clobberError ?? null,
  }));

  await browser.close();
  return { fault, href, injected, arrived, elapsedMs, observed, delayed, pageErrors };
}

function report(checks) {
  for (const check of checks) {
    console.log(`  ${check.ok ? "PASS" : "FAIL"} ${check.label}${check.detail ? ` - ${check.detail}` : ""}`);
  }
  return checks.every((check) => check.ok);
}

const flags = process.argv.slice(2);
const claimOnly = flags.includes("--claim-only");

let base;
try {
  base = await resolveBase("rsc-slow-arrival");
} catch (error) {
  console.error(String(error.message || error));
  process.exit(2);
}

const { engine, skipped } = await pickEngine();
console.log("\n== rsc-slow-arrival ==");
console.log(`  url: ${base}`);
console.log(`  engine: ${engine.name}${skipped.length > 0 ? ` (probe skipped ${skipped.join("; ")})` : ""}`);
console.log(`  rsc delay: ${DELAY_MS}ms, arrival bound: ${ARRIVAL_TIMEOUT_MS}ms`);

// ---------------------------------------------------------------- case 1 ---
console.log("\n---- case 1: slow RSC, nothing injected (must arrive) ----");
const claim = await runCase(engine, base, { fault: false });
const claimExpectedPath = claim.href.replace(/\/$/, "");
const claimOk = report([
  {
    ok: claim.arrived,
    label: `arrived at ${claimExpectedPath} within ${ARRIVAL_TIMEOUT_MS}ms`,
    detail: `after ${claim.elapsedMs}ms the URL is ${claim.observed.url}`,
  },
  {
    ok: claim.observed.pathname === claimExpectedPath,
    label: "final path is the clicked card's own route",
    detail: `expected ${claimExpectedPath}, got ${claim.observed.pathname}`,
  },
  {
    ok: claim.observed.hash === "",
    label: `URL is not stuck on ${STUCK_URL}`,
    detail: `hash="${claim.observed.hash}"`,
  },
  {
    ok: Boolean(claim.observed.heading),
    label: "the ficha's own heading is in the DOM",
    detail: claim.observed.heading ? `h1="${claim.observed.heading}"` : "no .detail-hero h1",
  },
  {
    ok: claim.delayed.length > 0,
    label: "the /proyectos/** payload was delayed (the scenario ran)",
    detail: claim.delayed
      .map((entry) =>
        entry.releasedAt
          ? `${entry.url} held ${entry.releasedAt - entry.startedAt}ms`
          : `${entry.url} still held when the case ended`
      )
      .join(", "),
  },
]);
if (claim.pageErrors.length > 0) {
  console.log(`  note: page errors - ${claim.pageErrors.join(" | ")}`);
}

let faultOk = true;
if (!claimOnly) {
  // -------------------------------------------------------------- case 2 ---
  console.log("\n---- case 2: same scenario with `a5a45dc` replayed (must NOT arrive) ----");
  const fault = await runCase(engine, base, { fault: true });
  const injectionRan = fault.observed.clobberAt !== null;
  faultOk = report([
    {
      ok: fault.observed.clobberError === null,
      label: `replaceState(null, "", "${fault.injected}") was injected`,
      detail: fault.observed.clobberError ?? "no exception",
    },
    {
      ok: injectionRan,
      label: "the injected call ran mid-transition",
      detail: injectionRan ? `${CLOBBER_AT_MS}ms after the click` : "never ran",
    },
    {
      ok: !fault.arrived,
      label: "the arrival is refused, reproducing the historical bug",
      detail: `after ${fault.elapsedMs}ms the URL is ${fault.observed.url}`,
    },
    {
      ok: fault.observed.pathname === "/" && fault.observed.hash === "#proyectos",
      label: `the URL stays on ${STUCK_URL}`,
      detail: `${fault.observed.pathname}${fault.observed.hash}`,
    },
    {
      ok: fault.observed.heading === null && fault.observed.grid,
      label: "the ficha never paints (the grid is still mounted)",
      detail: `heading=${fault.observed.heading === null ? "absent" : `"${fault.observed.heading}"`}, grid=${fault.observed.grid}`,
    },
  ]);
  if (!faultOk) {
    console.log(
      "  note: a probe that arrives anyway cannot detect the bug it claims to guard; case 1 passing is then vacuous."
    );
  }
}

const ok = claimOk && faultOk;
console.log(ok ? "\nGUARD PASS" : "\nGUARD FAIL");
process.exit(ok ? 0 : 1);
