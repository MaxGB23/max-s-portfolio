/**
 * scripts/reveal-guards.test.mjs
 *
 * Proves that the guards can FAIL. Each case feeds the sample shape the driver
 * produces for the known regression and for the fixed build. The values are
 * taken from real runs against the pre-fix and fixed deployments.
 *
 * No browser, no server: `pnpm test` runs this in CI for free, so a guard that
 * starts always passing is caught before it is trusted.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateNavbarDeepLink,
  evaluateAboutReveal,
} from "./lib/reveal-guards.mjs";

const surfaces = {
  transparent: "debug-l1 nav-arrive nav-surface fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-transparent backdrop-blur-none border-transparent shadow-none",
  opaque: "debug-l1 nav-arrive nav-surface fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-nav backdrop-blur-none md:backdrop-blur-md border-b border-border shadow-sm",
};

const failing = (result) => result.checks.filter((c) => !c.ok).map((c) => c.label);

// --------------------------------------------------------------- navbar ---

test("navbar guard: passes on the fixed build", () => {
  const result = evaluateNavbarDeepLink({
    heroClasses: surfaces.transparent,
    deepLinkY: 4706,
    deepLinkClasses: surfaces.opaque,
    scrolledClasses: surfaces.opaque,
  });
  assert.equal(result.ok, true, failing(result).join("; "));
});

test("navbar guard: fails when a deep link keeps the navbar transparent", () => {
  const result = evaluateNavbarDeepLink({
    heroClasses: surfaces.transparent,
    deepLinkY: 4706,
    deepLinkClasses: surfaces.transparent, // measured on the pre-fix deployment
    scrolledClasses: surfaces.opaque,
  });
  assert.equal(result.ok, false);
  assert.deepEqual(failing(result), ["(a) deep link into a section: navbar background is opaque"]);
});

test("navbar guard: fails when the hero is no longer transparent", () => {
  const result = evaluateNavbarDeepLink({
    heroClasses: surfaces.opaque, // effect deleted: (a) would still pass
    deepLinkY: 4706,
    deepLinkClasses: surfaces.opaque,
    scrolledClasses: surfaces.opaque,
  });
  assert.equal(result.ok, false);
  assert.deepEqual(failing(result), ["(b) hero: navbar background is still transparent"]);
});

test("navbar guard: fails when the deep link did not land deep", () => {
  const result = evaluateNavbarDeepLink({
    heroClasses: surfaces.transparent,
    deepLinkY: 0, // scenario not reproduced: the case proves nothing
    deepLinkClasses: surfaces.transparent,
    scrolledClasses: surfaces.opaque,
  });
  assert.equal(result.ok, false);
  assert.equal(result.checks[0].ok, false);
});

// ---------------------------------------------------------------- about ---

const frame = (opacity, labelOpacity, top, height = 280, vh = 844) => ({
  opacity,
  labelOpacity,
  top,
  bottom: top + height,
  height,
  vh,
});

test("About guard: passes with the portrait on screen at reveal start", () => {
  const result = evaluateAboutReveal({
    samples: [
      frame(0, 0, 1001), // measured on the fixed build: 46% on screen
      frame(0.03, 0.4, 707),
      frame(0.5, 0.9, 690),
      frame(0.996, 1, 670),
    ],
  });
  assert.equal(result.ok, true, failing(result).join("; "));
});

test("About guard: fails when the reveal starts while the portrait is offscreen", () => {
  const result = evaluateAboutReveal({
    samples: [
      frame(0, 0.3, 1001),
      frame(0.03, 0.8, 1001), // measured on the pre-fix deployment: 0% on screen
      frame(0.6, 1, 1001),
      frame(0.996, 1, 1001),
    ],
  });
  assert.equal(result.ok, false);
  const failed = failing(result);
  assert.equal(failed.length, 1);
  assert.match(failed[0], /at least 30% of the portrait on screen/);
});

test("About guard: fails when the portrait starts before the text", () => {
  const result = evaluateAboutReveal({
    samples: [
      frame(0.05, 0, 707),
      frame(0.4, 0.01, 700),
      frame(0.996, 1, 690),
    ],
  });
  assert.equal(result.ok, false);
  assert.deepEqual(failing(result), ["(b) the text starts before the portrait"]);
});

test("About guard: fails when no reveal was observed at all", () => {
  const result = evaluateAboutReveal({ samples: [frame(0, 0, 1200), frame(0, 0, 1100)] });
  assert.equal(result.ok, false);
  assert.equal(result.checks[0].ok, false);
});
