// Foreign-scroll guard audit: a native scroll write issued while Lenis is
// gliding must be adopted, not overwritten by Lenis's stale animatedScroll.
// Usage: node scripts/scroll-guard.mjs [--url http://localhost:<port>]
//
// The bug (lenis 1.3.18-dev.1, dist/lenis.mjs): onNativeScroll adopts the
// native position only when `isScrolling === false || isScrolling ===
// "native"`; during a wheel glide it is `"smooth"`, so a scrollbar drag is
// discarded and the rAF loop keeps writing the stale animatedScroll. With a
// real scrollbar the drag and that write alternate per frame: the page
// oscillates and, on release, snaps back to where the glide was heading.
// Upstream: darkroomengineering/lenis#107 (open), #168, #365 (closed, no fix).
//
// Case 1 (guard): desktop viewport (Lenis is active from 768px up), one wheel
// notch so a 600ms glide starts, then from t=100ms a foreign drag: a
// `window.scrollTo(0, Y)` every 8ms for 300ms, with Y far from the glide
// target. The foreign writes run on a timer, not on rAF, because that is how
// the browser delivers a scrollbar drag: not aligned to Lenis's rAF write,
// which is why the two fight instead of one of them winning every frame.
//
// Case 2 (preserve): the same wheel notch with no foreign write. The glide
// must still animate frame by frame and land on its own target - the guard
// must not adopt Lenis's own writes.
//
// Sampling: `window.scrollY` is recorded from a `scroll` listener, not from a
// rAF callback. A rAF callback registered after Lenis always reads the value
// Lenis just wrote, so the fight is invisible there (measured: 0 reversals on
// the unfixed tree). Scroll events fire in the frame's rendering step, before
// the rAF callbacks, and carry the position the previous frame settled on -
// what the visitor actually saw.
//
// Metrics for case 1:
//   (a) reversals - sign changes of the consecutive sampled deltas, ignoring
//       sub-2px deltas (rounding noise). The oscillation.
//   (b) final vs Y - |scrollY at t=700ms - Y|. The glide is over by then, so
//       this is "did the drag survive, or was it pulled back".
// Contract: (a) <= 1 and (b) <= 2. Unfixed: ~25 reversals and a 3092px
// pull-back to the glide target. Precondition: the glide must be running
// (position rising) when the drag starts, else the run is invalid instead of
// a false green.
//
// A dev server is enough: this is a JS-level race, not a media or frame budget
// (unlike audit-projects.mjs, which needs `pnpm build && pnpm start`).
import { chromium } from "playwright";
import { resolveBase } from "./audit-base.mjs";

const BASE = await resolveBase("scroll-guard");

const WHEEL_DELTA = 900; // one notch -> glide target ~900px
const DRAG_START_MS = 100; // mid-glide (glide lasts 600ms)
const DRAG_MS = 300;
const DRAG_INTERVAL_MS = 8;
const WINDOW_MS = 700; // glide + settle before reading the final position

const failures = [];
function check(ok, label, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"} ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

function reversals(series) {
  let prev = 0;
  let count = 0;
  for (let i = 1; i < series.length; i++) {
    const delta = series[i] - series[i - 1];
    if (Math.abs(delta) < 2) continue; // rounding noise, not movement
    const sign = Math.sign(delta);
    if (prev !== 0 && sign !== prev) count++;
    prev = sign;
  }
  return count;
}

const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: true,
});

/**
 * One wheel notch, sampled until t=WINDOW_MS. `drag` adds the foreign writes.
 * `glideY` is the position Lenis had reached when the drag began (or, in case
 * 2, the position of the last sample before the same instant).
 */
async function measure({ drag }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // GSAP/Lenis settle (same as navbar-active.mjs)

  // Park at the top with a native write: no glide in flight, so this is not
  // part of what is measured.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const limit = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );
  // Far from the glide target (~900px) and inside the scroll range.
  const farY = Math.min(limit, Math.round(limit * 0.72));

  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, WHEEL_DELTA);

  const result = await page.evaluate(
    async ({ farY, drag, dragStart, dragMs, dragInterval, windowMs }) => {
      const samples = [];
      const t0 = performance.now();
      const onScroll = () =>
        samples.push([
          Math.round(performance.now() - t0),
          Math.round(window.scrollY),
        ]);
      window.addEventListener("scroll", onScroll, { passive: true });

      // The foreign drag: the same call a scrollbar drag or a PageDown
      // performs, on a timer so it lands between Lenis's rAF writes.
      let writes = 0;
      const id = drag
        ? setInterval(() => {
            const elapsed = performance.now() - t0;
            if (elapsed < dragStart || elapsed > dragStart + dragMs) return;
            window.scrollTo(0, farY);
            writes++;
          }, dragInterval)
        : null;

      const final = await new Promise((resolve) => {
        setTimeout(() => resolve(Math.round(window.scrollY)), windowMs);
      });

      if (id !== null) clearInterval(id);
      window.removeEventListener("scroll", onScroll);
      return { samples, writes, final, farY };
    },
    {
      farY,
      drag,
      dragStart: DRAG_START_MS,
      dragMs: DRAG_MS,
      dragInterval: DRAG_INTERVAL_MS,
      windowMs: WINDOW_MS,
    }
  );

  await page.close();

  const series = result.samples.map((s) => s[1]);
  const beforeDrag = result.samples.filter((s) => s[0] < DRAG_START_MS);
  const glideY = beforeDrag.length ? beforeDrag[beforeDrag.length - 1][1] : 0;
  return { ...result, series, beforeDrag, glideY };
}

// ---------------------------------------------------------------- case 1 ----
console.log("\n==== (1) 1280x800 - foreign drag during a wheel glide ====");
{
  const run = await measure({ drag: true });
  const rev = reversals(run.series);
  const delta = run.final - run.farY;
  const glideRose = run.beforeDrag.length > 1 && run.glideY - run.beforeDrag[0][1] > 100;

  // A run where the glide was not in flight, or the write landed next to it,
  // proves nothing about the guard: fail it as invalid instead of green.
  check(
    glideRose,
    "precondition: Lenis glide is running when the drag starts",
    `y=${run.beforeDrag.length ? run.beforeDrag[0][1] : "-"}->${run.glideY} samples=${run.beforeDrag.length}`
  );
  check(
    run.farY - run.glideY > 1000,
    "precondition: Y is far from the glide target",
    `y=${run.farY} glideY=${run.glideY} distance=${run.farY - run.glideY}`
  );
  check(
    run.writes > 0,
    "precondition: the foreign drag wrote",
    `writes=${run.writes} interval=${DRAG_INTERVAL_MS}ms`
  );
  check(
    rev <= 1,
    "(a) the drag does not oscillate against the glide",
    `reversals=${rev} samples=${run.series.length}`
  );
  check(
    Math.abs(delta) <= 2,
    "(b) the page stays where the drag left it",
    `final=${run.final} y=${run.farY} delta=${delta}`
  );
}

// ---------------------------------------------------------------- case 2 ----
console.log("\n==== (2) 1280x800 - wheel glide alone still animates ====");
{
  const run = await measure({ drag: false });
  const rising = run.series.filter((y, i) => i > 0 && y - run.series[i - 1] > 1).length;
  const travel = run.final - 0; // parked at the top before the notch

  check(
    rising >= 3,
    "(2) the glide advances over several frames (smooth, not instant)",
    `risingFrames=${rising} samples=${run.series.length}`
  );
  check(
    Math.abs(travel - WHEEL_DELTA) <= WHEEL_DELTA * 0.1,
    "(2) the glide lands on its own target",
    `travel=${travel} wheelDelta=${WHEEL_DELTA}`
  );
  check(
    reversals(run.series) === 0,
    "(2) the guard does not adopt Lenis's own writes (monotonic)",
    `reversals=${reversals(run.series)}`
  );
}

await browser.close();

if (failures.length) {
  console.error(`\nSCROLL-GUARD FAIL [${failures.length}] - aserciones fallidas:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exitCode = 1;
} else {
  console.log(
    "\nSCROLL-GUARD OK - un scroll nativo ajeno gana al glide de Lenis."
  );
}
