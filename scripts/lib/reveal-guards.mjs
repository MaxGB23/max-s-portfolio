/**
 * scripts/lib/reveal-guards.mjs
 *
 * Pure verdicts for the DOM guards. No browser and no page here: the drivers
 * (scripts/navbar-deep-link-bg.mjs, scripts/about-reveal-order.mjs) collect
 * samples and hand them over, so scripts/reveal-guards.test.mjs can prove the
 * verdict flips with fixtures instead of a live page.
 *
 * Why the split: a guard that cannot fail is worse than no guard. The fixtures
 * feed the exact shape of both regressions, so `pnpm test` catches a guard that
 * quietly always passes, while the browser run stays manual on purpose.
 *
 * Both scenarios were calibrated against the pre-fix deployments, not guessed:
 * the navbar case has to be a deep LINK (a plain reload fires a scroll event and
 * hides the bug) and the About case has to scroll slowly (a fast scroll brings
 * the portrait on screen before its tween starts and hides it too).
 */

const TRANSPARENT_CLASS = "bg-transparent";
const SCROLL_THRESHOLD_PX = 20;
const PORTRAIT_START_OPACITY = 0.02;
const PORTRAIT_DONE_OPACITY = 0.99;
const PORTRAIT_MIN_VISIBLE_RATIO = 0.3;

const check = (ok, label, detail = "") => ({ ok, label, detail });
const verdict = (checks) => ({ ok: checks.every((c) => c.ok), checks });
const hasClass = (className, token) => className.split(/\s+/).includes(token);

/**
 * Navbar background on a deep link.
 *
 * Regression (PR #15, commit 3a94348): `scrolled` was only written from inside
 * a `scroll` event. Opening `/#precios` restores the position before hydration,
 * nothing moves afterwards, no event arrives, and the navbar stays transparent
 * over the content. A reload of an already-scrolled page does NOT reproduce it
 * (the restored position fires a scroll event), which is why the driver uses a
 * link instead.
 *
 * @param {{
 *   heroClasses: string,
 *   deepLinkClasses: string,
 *   deepLinkY: number,
 *   scrolledClasses: string,
 * }} sample
 */
export function evaluateNavbarDeepLink({ heroClasses, deepLinkClasses, deepLinkY, scrolledClasses }) {
  const landedY = Number.isFinite(deepLinkY) ? deepLinkY : -1;

  return verdict([
    // Guard the guard: without a restored position the case proves nothing, so
    // it fails loudly instead of passing on an empty scenario.
    check(
      landedY > SCROLL_THRESHOLD_PX,
      "the deep link landed on a scrolled position",
      `scrollY=${landedY}, threshold=${SCROLL_THRESHOLD_PX}`
    ),
    check(
      !hasClass(deepLinkClasses, TRANSPARENT_CLASS),
      "(a) deep link into a section: navbar background is opaque",
      `class="${deepLinkClasses}"`
    ),
    // Control: the effect must still be off on the hero. Without it, deleting
    // the background logic altogether would satisfy (a).
    check(
      hasClass(heroClasses, TRANSPARENT_CLASS),
      "(b) hero: navbar background is still transparent",
      `class="${heroClasses}"`
    ),
    // Control: a position reached by scrolling must keep working.
    check(
      !hasClass(scrolledClasses, TRANSPARENT_CLASS),
      "(c) manual scroll past the threshold: navbar background is opaque",
      `class="${scrolledClasses}"`
    ),
  ]);
}

/**
 * About portrait reveal on a phone viewport.
 *
 * Regression (PR #11): the whole cascade hung from a trigger on the section, so
 * on mobile the portrait - the last block - started its tween while it was
 * still below the fold. At a finger's pace that means the entrance is never
 * seen. The invariant is not the animation, it is the geometry: the reveal must
 * start with part of the image already on screen.
 *
 * @param {{ samples: { opacity: number, labelOpacity: number, top: number, bottom: number, height: number, vh: number }[] }} input
 */
export function evaluateAboutReveal({ samples }) {
  const startIndex = samples.findIndex((s) => s.opacity > PORTRAIT_START_OPACITY);
  const labelIndex = samples.findIndex((s) => s.labelOpacity > PORTRAIT_START_OPACITY);
  const start = startIndex === -1 ? null : samples[startIndex];
  const maxOpacity = samples.length ? Math.max(...samples.map((s) => s.opacity)) : 0;

  const visiblePx = start ? Math.max(0, Math.min(start.bottom, start.vh) - Math.max(start.top, 0)) : 0;
  const ratio = start && start.height > 0 ? visiblePx / start.height : 0;

  return verdict([
    check(startIndex !== -1, "portrait reveal was observed", `frames=${samples.length}`),
    check(
      maxOpacity > PORTRAIT_DONE_OPACITY,
      "portrait tween completed while scrolling",
      `maxOpacity=${maxOpacity}`
    ),
    check(
      ratio >= PORTRAIT_MIN_VISIBLE_RATIO,
      `(a) reveal starts with at least ${Math.round(PORTRAIT_MIN_VISIBLE_RATIO * 100)}% of the portrait on screen`,
      start ? `${visiblePx}px of ${start.height}px (${Math.round(ratio * 100)}%)` : "portrait never started"
    ),
    // Control: the visual order (text above, portrait below) still holds.
    check(
      labelIndex !== -1 && labelIndex <= startIndex,
      "(b) the text starts before the portrait",
      `labelFrame=${labelIndex}, portraitFrame=${startIndex}`
    ),
  ]);
}

export const GUARD_CONSTANTS = {
  TRANSPARENT_CLASS,
  SCROLL_THRESHOLD_PX,
  PORTRAIT_START_OPACITY,
  PORTRAIT_MIN_VISIBLE_RATIO,
};
