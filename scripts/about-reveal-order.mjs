/**
 * scripts/about-reveal-order.mjs
 *
 * Guard: on a phone viewport the About portrait must start its reveal with part
 * of the image already on screen. Regression reference: PR #11 - the cascade
 * hung from a trigger on the section, so the portrait (the last block on
 * mobile) ran its tween and finished while it was still below the fold.
 *
 * Manual on purpose: it drives frames on a fixed viewport. The verdict itself
 * is pure and covered by scripts/reveal-guards.test.mjs.
 *
 * Usage: node scripts/about-reveal-order.mjs [--url http://localhost:<port>]
 */
import { chromium } from "playwright";
import { resolveBase } from "./audit-base.mjs";
import { evaluateAboutReveal } from "./lib/reveal-guards.mjs";

const VIEWPORT = { width: 390, height: 844 };
// 1px per frame: calibrated against the pre-fix deployment. A fast scroll
// brings the portrait on screen before its tween starts and hides the bug.
const SCROLL_STEP_PX = 1;
const MAX_FRAMES = 1200;
const SETTLE_MS = 1800; // let the hero timeline finish before scrolling

const BASE = await resolveBase("about-reveal-order");
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: true,
});
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(SETTLE_MS);

const samples = await page.evaluate(
  async ({ step, maxFrames }) => {
    const portrait = document.querySelector(".about-portrait");
    const label = document.querySelector(".about-label");
    if (!portrait || !label) throw new Error("missing .about-portrait or .about-label");

    const opacityOf = (el) => parseFloat(getComputedStyle(el).opacity);
    const out = [];

    for (let i = 0; i < maxFrames; i += 1) {
      window.scrollBy(0, step);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const rect = portrait.getBoundingClientRect();
      out.push({
        opacity: Number(opacityOf(portrait).toFixed(3)),
        labelOpacity: Number(opacityOf(label).toFixed(3)),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        vh: window.innerHeight,
      });

      // Stop once the portrait finished; the samples carry the whole entrance.
      if (out.length > 8 && out[out.length - 1].opacity > 0.995) break;
    }
    return out;
  },
  { step: SCROLL_STEP_PX, maxFrames: MAX_FRAMES }
);

await browser.close();

const result = evaluateAboutReveal({ samples });

console.log("\n== about-reveal-order ==");
console.log(`  url: ${BASE}`);
console.log(`  viewport: ${VIEWPORT.width}x${VIEWPORT.height}, frames: ${samples.length}`);
for (const c of result.checks) {
  console.log(`  ${c.ok ? "PASS" : "FAIL"} ${c.label}${c.detail ? ` - ${c.detail}` : ""}`);
}
console.log(result.ok ? "\nGUARD PASS" : "\nGUARD FAIL");
process.exit(result.ok ? 0 : 1);
