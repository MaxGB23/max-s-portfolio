/**
 * scripts/about-orientation.mjs
 *
 * Guard: loading the portfolio in LANDSCAPE and then rotating to portrait must
 * leave the About portrait able to run its entrance. Regression reference: a
 * real Android left the image at opacity 0 with visibility hidden forever.
 *
 * The rotation is the whole point of the script. A fresh portrait load starts
 * the `(max-width: 767px)` block of `gsap.matchMedia` while the page mounts; the
 * defect only appears when that context is born LATER, from a media change, so
 * a plain phone viewport cannot reproduce it.
 *
 * Manual on purpose: it drives frames on a fixed viewport, one per scroll step.
 * The verdict itself is pure and covered by scripts/reveal-guards.test.mjs.
 *
 * Usage: node scripts/about-orientation.mjs [--url http://localhost:<port>]
 */
import { chromium } from "playwright";
import { resolveBase } from "./audit-base.mjs";
import { evaluateAboutOrientation } from "./lib/reveal-guards.mjs";

// A phone that loads in landscape is wider than the 768px gate, so the app
// boots in its desktop branch; rotating to portrait flips every matchMedia.
const LOAD_VIEWPORT = { width: 844, height: 390 };
const ROTATED_VIEWPORT = { width: 390, height: 844 };
// 24px per frame: slow enough that the entrance is sampled while it runs and
// fast enough to cross the page inside the frame budget below.
const SCROLL_STEP_PX = 24;
const MAX_FRAMES = 900;
// The portrait is still inside its 0.5s entrance when the scroll loop ends, so
// the plateau needs its own frames; without them the guard would judge an
// entrance that is still in flight. The tail runs slower than 60fps under
// deviceScaleFactor 2, hence the generous cap: it stops as soon as the tween
// settles (measured: 0.989 mid-flight when the tail was 60 frames).
const PLATEAU_MAX_FRAMES = 240;
const PLATEAU_AFTER_DONE_FRAMES = 20;
const SETTLED_OPACITY = 0.995;
const MIN_FRAMES_BEFORE_BREAK = 30;
const SETTLE_MS = 1800; // let the hero timeline finish before scrolling
const ROTATE_SETTLE_MS = 1200; // let the matchMedia switch rebuild the triggers

const BASE = await resolveBase("about-orientation");
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: true,
});
const page = await browser.newPage({
  viewport: LOAD_VIEWPORT,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(SETTLE_MS);

await page.setViewportSize(ROTATED_VIEWPORT);
await page.waitForTimeout(ROTATE_SETTLE_MS);

const samples = await page.evaluate(
  async ({ step, maxFrames, plateauMaxFrames, plateauAfterDone, settledOpacity, minFrames }) => {
    const portrait = document.querySelector(".about-portrait");
    if (!portrait) throw new Error("missing .about-portrait");

    const sample = () => {
      const style = getComputedStyle(portrait);
      const rect = portrait.getBoundingClientRect();
      return {
        y: Math.round(window.scrollY),
        opacity: Number(parseFloat(style.opacity).toFixed(3)),
        visibility: style.visibility,
        top: Math.round(rect.top),
        vh: window.innerHeight,
      };
    };

    const out = [];

    for (let i = 0; i < maxFrames; i += 1) {
      window.scrollBy(0, step);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      out.push(sample());

      // Stop once the portrait is above the middle of the viewport: from there
      // on the geometry (the part this guard measures) cannot change.
      if (out.length >= minFrames && out[out.length - 1].top < out[out.length - 1].vh / 2) break;
    }

    // No more scrolling: watch the entrance land, so a portrait that stalls or
    // falls back after the plateau is still recorded.
    let doneAt = -1;
    for (let i = 0; i < plateauMaxFrames; i += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      out.push(sample());
      if (doneAt === -1 && out[out.length - 1].opacity >= settledOpacity) doneAt = i;
      if (doneAt !== -1 && i - doneAt >= plateauAfterDone) break;
    }

    return out;
  },
  {
    step: SCROLL_STEP_PX,
    maxFrames: MAX_FRAMES,
    plateauMaxFrames: PLATEAU_MAX_FRAMES,
    plateauAfterDone: PLATEAU_AFTER_DONE_FRAMES,
    settledOpacity: SETTLED_OPACITY,
    minFrames: MIN_FRAMES_BEFORE_BREAK,
  }
);

await browser.close();

const result = evaluateAboutOrientation({ samples });

console.log("\n== about-orientation ==");
console.log(`  url: ${BASE}`);
console.log(
  `  viewport: ${LOAD_VIEWPORT.width}x${LOAD_VIEWPORT.height} -> ` +
    `${ROTATED_VIEWPORT.width}x${ROTATED_VIEWPORT.height}, frames: ${samples.length}`
);
for (const c of result.checks) {
  console.log(`  ${c.ok ? "PASS" : "FAIL"} ${c.label}${c.detail ? ` - ${c.detail}` : ""}`);
}
console.log(result.ok ? "\nGUARD PASS" : "\nGUARD FAIL");
process.exit(result.ok ? 0 : 1);
