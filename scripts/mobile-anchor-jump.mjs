/**
 * scripts/mobile-anchor-jump.mjs
 *
 * Measurement: the mobile anchor jump (`animateScrollTo` in hooks/use-lenis.tsx)
 * against the native `window.scrollTo({ behavior: "smooth" })` it replaced,
 * over the SAME distance, on WebKit at a phone viewport.
 *
 * Regression reference: a navbar tap on a phone gave a slow, readable animation
 * for a near section and a teleport for the farthest one. Cause measured here:
 * the UA's smooth-scroll duration does not grow with distance (220ms for 948px,
 * 215ms for 8050px), so the far trip travels ~13x faster. `animateScrollTo`
 * gives the trip a distance-independent duration band, like Lenis' `lerp`.
 *
 * WebKit on purpose: it is the engine this repo trusts for touch scroll (see
 * docs/issues/mobile-menu-scroll-cancelled.md 3) — the Chromium mobile emulator
 * resolves programmatic smooth scrolls without the animation being measured.
 *
 * Manual on purpose: it needs a production build (`pnpm build && pnpm start`),
 * because dev falsifies the reveal/layout work that competes for frames here.
 * Deliberately NOT wired into `pnpm qa`: a second transport for the same claim
 * is a growth decision (docs/rfcs/verification-policy.md 5).
 *
 * Usage: node scripts/mobile-anchor-jump.mjs [--url http://localhost:<port>]
 */
import { chromium, webkit } from "playwright";
import { resolveBase } from "./audit-base.mjs";

const VIEWPORT = { width: 390, height: 844 };
const TARGETS = [
  { id: "sobre-mi", label: "near #sobre-mi" },
  { id: "contacto", label: "far  #contacto" },
];
const RESET_ATTEMPTS = 4;
const SETTLE_MS = 3000;
/** A trip painted in fewer frames than this is a teleport, not a scroll. The
 *  WebKit headless rig on a GPU-less machine paints ~8; Chromium paints 49-90.
 *  Threshold is deliberately below both (it is a floor, not a target). */
const MIN_TRAVEL_FRAMES = 5;
/** The arrival cue must not fire before the travel ends. Samples are per frame,
 *  so a slow rig can leave a >300ms hole right after the landing; the comparison
 *  therefore uses only samples strictly before the cue, never the next sample. */
const MAX_RING_LEAD_MS = 100;

const BASE = await resolveBase("mobile-anchor-jump");
// WebKit is the engine this repo trusts for touch scroll; `PW_ENGINE=chromium`
// exists only to separate "the tween paints few frames" from "this headless
// WebKit rig paints few frames". The verdict is asserted on WebKit.
const ENGINE = process.env.PW_ENGINE === "chromium" ? chromium : webkit;
const browser = await ENGINE.launch(ENGINE === chromium ? { channel: "chrome" } : {});
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
  reducedMotion: "no-preference",
});
const page = await context.newPage();

/** Runs in the page: samples scrollY per frame, stamps the click, and watches
 *  the arrival ring (`arrive` class) on the target. */
function arm(id) {
  window.__samples = [];
  window.__stop = false;
  window.__clickAt = null;
  window.__ringAt = null;
  const loop = (t) => {
    if (window.__stop) return;
    window.__samples.push([t, window.scrollY]);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  document.addEventListener(
    "click",
    (e) => {
      const anchor = e.target && e.target.closest ? e.target.closest("a") : null;
      if (anchor && anchor.getAttribute("href") === "#" + id) window.__clickAt = performance.now();
    },
    true
  );
  const target = document.getElementById(id);
  if (target) {
    new MutationObserver(() => {
      if (target.classList.contains("arrive") && window.__ringAt === null) {
        window.__ringAt = performance.now();
      }
    }).observe(target, { attributes: true, attributeFilter: ["class"] });
  }
}

function readSamples() {
  window.__stop = true;
  return {
    samples: window.__samples,
    clickAt: window.__clickAt,
    ringAt: window.__ringAt,
    finalY: window.scrollY,
  };
}

function analyze({ samples, clickAt, ringAt }) {
  if (!samples || samples.length < 3) return { travel: 0 };
  const step = (a, b) => Math.abs(b[1] - a[1]);

  // Pass 1: the last frame where the page actually moved.
  let lastMove = null;
  let prev = samples[0];
  for (let i = 1; i < samples.length; i++) {
    if (step(prev, samples[i]) > 0.5) lastMove = samples[i];
    prev = samples[i];
  }
  if (!lastMove) {
    return { from: Math.round(samples[0][1]), to: Math.round(samples[0][1]), travel: 0 };
  }

  // Travel ends at the arrival cue when there is one: a frame that arrives after
  // it can only repeat the already-written position, and counting that late
  // sample would report a hole in the sampler as "movement after landing".
  const end = ringAt ?? lastMove[0];
  let firstMove = null;
  let travelEnd = null;
  let frames = 0;
  let maxGapMs = 0;
  let maxStep = 0;
  prev = samples[0];
  for (let i = 1; i < samples.length; i++) {
    const sample = samples[i];
    if (sample[0] > end) break;
    if (step(prev, sample) > 0.5) {
      if (firstMove === null) firstMove = prev;
      travelEnd = sample;
      if (step(prev, sample) > maxStep) maxStep = step(prev, sample);
    }
    if (firstMove !== null) {
      frames++;
      if (sample[0] - prev[0] > maxGapMs) maxGapMs = sample[0] - prev[0];
    }
    prev = sample;
  }
  if (!firstMove || !travelEnd) {
    return { from: Math.round(samples[0][1]), to: Math.round(samples[0][1]), travel: 0 };
  }
  return {
    from: Math.round(samples[0][1]),
    to: Math.round(travelEnd[1]),
    travel: Math.round(Math.abs(travelEnd[1] - samples[0][1])),
    travelMs: Math.round(travelEnd[0] - firstMove[0]),
    frames,
    maxFrameGapMs: Math.round(maxGapMs),
    maxStepPx: Math.round(maxStep),
    ringFired: ringAt !== null,
    ringAfterLandMs: ringAt !== null ? Math.round(ringAt - travelEnd[0]) : null,
    clickToRingMs: ringAt !== null && clickAt ? Math.round(ringAt - clickAt) : null,
  };
}

async function reset() {
  await page.goto("about:blank");
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(1400);
  for (let i = 0; i < RESET_ATTEMPTS; i++) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    if ((await page.evaluate(() => window.scrollY)) < 5) return true;
  }
  return false;
}

const rows = [];
const failures = [];
for (const target of TARGETS) {
  if (!(await reset())) failures.push(`${target.label}: la pagina no volvio a scrollY 0`);

  // A: the real UI path — open the mobile menu, tap the link.
  await page.evaluate(arm, target.id);
  await page.click('button[aria-controls="mobile-menu"]');
  await page.waitForTimeout(500);
  await page.click(`#mobile-menu a[href="#${target.id}"]`);
  await page.waitForTimeout(SETTLE_MS);
  const authored = await page.evaluate(readSamples);
  const authoredStats = analyze(authored);
  rows.push({ target: target.label, mode: "authored", ...authoredStats });

  // B: native smooth scroll over the distance the authored jump just covered.
  const distance = authored.finalY;
  if (!(await reset())) failures.push(`${target.label}: la pagina no volvio a scrollY 0 (native)`);
  await page.evaluate(arm, target.id);
  // One painted frame before the trigger, so the baseline has a real `from`.
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => done(null))));
  await page.evaluate((y) => {
    window.__clickAt = performance.now();
    window.scrollTo({ top: y, behavior: "smooth" });
  }, distance);
  await page.waitForTimeout(SETTLE_MS);
  rows.push({ target: target.label, mode: "native", ...analyze(await page.evaluate(readSamples)) });

  if (!authoredStats.travel) failures.push(`${target.label}: el salto no movio la pagina`);
  if (!authoredStats.ringFired) failures.push(`${target.label}: el anillo de llegada no se disparo`);
  if (authoredStats.ringAfterLandMs !== null && authoredStats.ringAfterLandMs < -MAX_RING_LEAD_MS) {
    failures.push(`${target.label}: el anillo se disparo ${-authoredStats.ringAfterLandMs}ms antes de aterrizar`);
  }
  if (authoredStats.frames < MIN_TRAVEL_FRAMES) {
    failures.push(`${target.label}: el viaje se pinto en ${authoredStats.frames} frames`);
  }
}

// C: an accidental touch during the jump. The trip yields where the finger
// left it, but the arrival cue is STILL owed: the tap on the link registered,
// and losing the cue on a stray touch was the reported defect.
{
  const target = TARGETS[0];
  if (!(await reset())) failures.push(`${target.label}: la pagina no volvio a scrollY 0 (interrupted)`);
  await page.evaluate(arm, target.id);
  await page.click('button[aria-controls="mobile-menu"]');
  await page.waitForTimeout(500);
  await page.click(`#mobile-menu a[href="#${target.id}"]`);
  await page.waitForTimeout(250);
  await page.touchscreen.tap(VIEWPORT.width / 2, VIEWPORT.height / 2);
  await page.waitForTimeout(1200);
  const stats = analyze(await page.evaluate(readSamples));
  rows.push({ target: target.label, mode: "interrupted", ...stats });
  if (!stats.ringFired) failures.push(`${target.label}: el toque corto el viaje y el anillo no se disparo`);
}

const ratio = (mode) => {
  const times = rows.filter((r) => r.mode === mode && r.travel > 0).map((r) => r.travelMs);
  if (times.length < 2) return "n/a";
  return `x${(Math.max(...times) / Math.max(Math.min(...times), 1)).toFixed(2)}`;
};

console.table(rows);
console.log(`authored spread: ${ratio("authored")} (duracion independiente de la distancia, por diseno)`);
console.log(`native spread  : ${ratio("native")} (duracion del motor, no de la distancia)`);
console.log(
  "frame budget: un viaje que pinta pocos frames alarga el tween (se escribe una vez por frame)," +
    " asi que `travelMs` por encima de la banda de duracion es coste de pintura, no de la curva."
);

await browser.close();

if (failures.length) {
  console.error("\nFALLA:");
  for (const f of failures) console.error(" - " + f);
  process.exit(1);
}
console.log("\nOK: el anillo llega al aterrizar y el viaje no se resuelve en un salto unico.");
