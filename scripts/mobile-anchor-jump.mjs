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
 * It also owns the arrival cue's second entry point (cases D): the cue used to
 * live only inside the in-page anchor CLICK path, so arriving from `/proyectos`
 * or on a fresh load of `/#contacto` landed on the section with no ring. The
 * missing half is the announcement, not the scroll, so case D asserts BOTH: the
 * section in view AND the `arrive` class applied EXACTLY once (a stale 1600ms
 * backstop or an effect that re-runs when Lenis arrives late would make it two).
 *
 * Cases E own the OPPOSITE claim: an arrival that a route change already owns
 * must NOT be announced. `/` parked at `/#proyectos` -> card -> "Volver" (or the
 * browser back button) returns to the captured position, and the hash arrival
 * used to re-announce `#proyectos` afterwards and scroll away from it. Asserted
 * per case: the restored scroll is where the card was, and no cue is added.
 *
 * Manual on purpose: it needs a production build (`pnpm build && pnpm start`),
 * because dev falsifies the reveal/layout work that competes for frames here.
 * Deliberately NOT wired into `pnpm qa`: a second transport for the same claim
 * is a growth decision (docs/rfcs/verification-policy.md 5).
 *
 * Usage: pnpm build && pnpm start  (in another shell)
 *        node scripts/mobile-anchor-jump.mjs [--url http://localhost:<port>]
 *        PW_ENGINE=chromium ... separates "the tween paints few frames" from
 *        "this headless rig paints few frames".
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
await installCueCounter(context);
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

async function reset(p = page) {
  await p.goto("about:blank");
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(1400);
  for (let i = 0; i < RESET_ATTEMPTS; i++) {
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await p.waitForTimeout(300);
    if ((await p.evaluate(() => window.scrollY)) < 5) return true;
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

// --- D: the arrival cue bound to the URL hash on mount ----------------------
// Reported defect: from `/proyectos` the navbar Contact CTA navigates to
// `/#contacto` and the page lands on the section, but the `arrive` class is
// never applied; a fresh load of `/#contacto` is in the same state. The cue only
// existed inside the in-page click path (`useScrollToAnchor`), so arriving is
// not announcing. `components/anchor-arrival.tsx` replays that SAME path once on
// mount, which makes "exactly once" the assertion that matters: a stale
// `ARRIVAL_FALLBACK_MS` backstop, or an effect that re-runs when Lenis lands one
// commit later, would apply the class twice.
const CUE_ID = "contacto";
/** Longer than the whole announcement chain: the Lenis tween, the 1600ms
 *  backstop behind it, and the 2200ms window in which `announceArrival` clears
 *  the class. A second cue inside this window is a defect, not a slow rig. */
const ARRIVAL_SETTLE_MS = 3600;
const arrivalRows = [];

/** Installed in every document of the context (Playwright runs it before any
 *  page script): counts how many times `arrive` is ADDED to an element, keyed by
 *  its id, and keeps `#contacto` in its own list for the D cases.
 *  `announceArrival` does remove -> reflow -> add, so a naive observer that reads
 *  `classList` when the callback runs cannot tell one cue from two; the count
 *  therefore compares each record's `oldValue` against the class the NEXT record
 *  for the same element starts from, and against the live class for the last
 *  one. Rise only: the 2200ms cleanup is a fall, not a cue. */
async function installCueCounter(ctx) {
  await ctx.addInitScript(() => {
    window.__cue = { at: [], log: [] };
    const hasArrive = (value) =>
      typeof value === "string" && value.split(/\s+/).includes("arrive");
    const classAfter = (records, i) => {
      for (let j = i + 1; j < records.length; j++) {
        if (records[j].target === records[i].target) return records[j].oldValue;
      }
      return records[i].target.getAttribute("class");
    };
    new MutationObserver((records) => {
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        if (record.type !== "attributes" || !record.target) continue;
        if (!hasArrive(record.oldValue) && hasArrive(classAfter(records, i))) {
          const id = record.target.id || "(sin id)";
          window.__cue.log.push({ id, at: Math.round(performance.now()) });
          if (id === "contacto") window.__cue.at.push(Math.round(performance.now()));
        }
      }
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
      attributeOldValue: true,
    });
  });
}

/** The navbar Contact CTA. Mobile lives in the menu panel, desktop in the
 *  header row; `[href$="#contacto"]` is the same link in both (`/#contacto`
 *  outside the home, `#contacto` on it), so only the opening step differs. */
async function tapContactCta(p, mobile) {
  if (!mobile) {
    await p.click('header a[href$="#contacto"]:visible');
    return;
  }
  await p.click('button[aria-controls="mobile-menu"]');
  await p.waitForTimeout(500);
  await p.click('#mobile-menu a[href$="#contacto"]');
}

async function arrivalState(p) {
  return p.evaluate((id) => {
    const el = document.getElementById(id);
    const rect = el ? el.getBoundingClientRect() : null;
    return {
      fires: window.__cue.at.length,
      y: Math.round(window.scrollY),
      top: rect ? Math.round(rect.top) : null,
      viewport: window.innerHeight,
      hash: window.location.hash,
      strayArrive: document.querySelector(".arrive") !== null,
    };
  }, CUE_ID);
}

// --- E: a return that already owns the scroll must NOT announce -------------
// The bug: `ScrollRestorer` (layout, mounted BEFORE the page) consumes the
// captured position in its own effect, so by the time `AnchorArrival` (child of
// the home page) runs, nothing is pending and it announces the hash the URL came
// back with — `#proyectos` — and scrolls away from the restored card. Both rigs
// are measured: mobile takes the owned `window.scrollTo` restore, desktop takes
// the Lenis one (`scrollTo(target, { immediate: true })`).
const GRID_ID = "proyectos";
/** The restore is exact (a scroll position, not a tween), so the only slack is
 *  layout drift between the two paints. The bug shows up in the thousands. */
const RETURN_TOLERANCE_PX = 16;
const returnRows = [];

/** Where the card sits right now, plus the cue count this document already
 *  spent on `#proyectos` (the cold arrival at the section announces once, which
 *  is legitimate: a hash arrival nobody claimed). */
function cardState(href) {
  const link = document.querySelector(`a[href="${href}"]`);
  const rect = link ? link.getBoundingClientRect() : null;
  return {
    y: Math.round(window.scrollY),
    top: rect ? Math.round(rect.top) : null,
    fires: window.__cue.log.filter((entry) => entry.id === "proyectos").length,
    hash: window.location.hash,
    path: window.location.pathname,
  };
}

async function runReturnCases(p, rig) {
  for (const via of ["volver", "back"]) {
    const label = `${rig} /#${GRID_ID} -> ${via}`;
    // A cold arrival at the section, so the URL carries the hash the bug feeds
    // on and the card list is laid out from scratch.
    await p.goto("about:blank");
    await p.goto(BASE + "/#" + GRID_ID, { waitUntil: "load" });
    await p.waitForTimeout(ARRIVAL_SETTLE_MS);

    const card = await p.evaluate(() => {
      // A real grid card (`ProjectCard`), not the featured panel's CTA: the
      // whole-card overlay is what the visitor taps, and its click handler is
      // the one that captures the position (`saveHomeScroll(window.scrollY)`).
      const link = document.querySelector('article.project-card a[href^="/proyectos/"]');
      if (!link) return null;
      const rect = link.getBoundingClientRect();
      return { href: link.getAttribute("href"), y: Math.round(rect.top + window.scrollY) };
    });
    if (!card) {
      failures.push(`${label}: la home no ofrecio ninguna card de proyecto`);
      continue;
    }

    // Park the page ON the card: this is the position the card click captures
    // (`saveHomeScroll(window.scrollY)`) and the one the return must restore.
    await p.evaluate((top) => window.scrollTo({ top: top - 120, behavior: "instant" }), card.y);
    await p.waitForTimeout(400);
    const before = await p.evaluate(cardState, card.href);
    if (before.top === null) {
      failures.push(`${label}: la card desaparecio antes del click`);
      continue;
    }
    if (before.top < 0 || before.top > 300) {
      failures.push(`${label}: la card no quedo en vista antes del click (top ${before.top}px)`);
      continue;
    }

    // A REAL pointer click at a point inside the card, NOT `locator.click()`:
    // Playwright scrolls the element into view before clicking, and that scroll
    // is what `saveHomeScroll` would then capture — the case would restore an
    // arbitrary position and prove nothing. The hit test makes the click
    // honest: if the point does not land on the card's own link, the case fails
    // instead of measuring a page that never navigated.
    const point = await p.evaluate((href) => {
      const link = document.querySelector(`a[href="${href}"]`);
      const rect = link.getBoundingClientRect();
      const x = Math.round(rect.left + rect.width / 2);
      const y = Math.round(
        Math.min(Math.max(rect.top + rect.height / 2, 120), window.innerHeight - 120)
      );
      const hit = document.elementFromPoint(x, y);
      const owner = hit && hit.closest ? hit.closest("a") : null;
      return { x, y, hitHref: owner ? owner.getAttribute("href") : null };
    }, card.href);
    if (point.hitHref !== card.href) {
      failures.push(
        `${label}: el click no cae en la card (${point.x},${point.y} -> ${point.hitHref ?? "sin enlace"})`
      );
      continue;
    }
    await p.mouse.click(point.x, point.y);
    await p.waitForFunction(() => window.location.pathname.startsWith("/proyectos/"), null, {
      timeout: 20000,
    });
    await p.waitForTimeout(900);

    if (via === "volver") {
      // The floating "Volver" pill: it consumes the captured position in the
      // CLICK handler, i.e. before the navigation commits.
      await p.locator("a.back-btn").first().click();
    } else {
      // The browser back button: nothing of ours runs in the click path here,
      // so this case is the only proof that the `popstate` promoter publishes
      // the ownership too. Removing that publisher leaves this case red and
      // the "volver" case green.
      await p.goBack();
    }
    await p.waitForFunction(() => window.location.pathname === "/", null, { timeout: 20000 });
    await p.waitForTimeout(ARRIVAL_SETTLE_MS);
    const after = await p.evaluate(cardState, card.href);
    returnRows.push({
      rig,
      via,
      scrollBefore: before.y,
      scrollAfter: after.y,
      cardTopBefore: before.top,
      cardTopAfter: after.top,
      cueBefore: before.fires,
      cueAfter: after.fires,
      hashAfter: after.hash || "(sin hash)",
    });

    // Premise of the case: the return really did land on `/` with the hash in
    // the URL. Without it there is nothing for the arrival to announce and the
    // case would pass for the wrong reason.
    if (after.hash !== "#" + GRID_ID) {
      failures.push(`${label}: la vuelta perdio el hash (URL "${after.hash}")`);
    }
    if (after.fires !== before.fires) {
      failures.push(
        `${label}: el anillo se disparo al volver (${before.fires} -> ${after.fires}); la llegada con hash piso la posicion restaurada`
      );
    }
    if (after.top === null || Math.abs(after.top - before.top) > RETURN_TOLERANCE_PX) {
      failures.push(
        `${label}: el scroll no volvio a la card (scrollY ${before.y} -> ${after.y}, top ${before.top} -> ${after.top})`
      );
    }
  }
}

function assertArrival(label, state) {
  if (state.top === null) {
    failures.push(`${label}: no hay ninguna seccion #${CUE_ID} en el documento`);
    return;
  }
  if (state.fires !== 1) {
    failures.push(`${label}: el anillo se disparo ${state.fires} veces (esperado exactamente 1)`);
  }
  if (state.y < 1000 || state.top < -80 || state.top > state.viewport * 0.5) {
    failures.push(
      `${label}: la seccion no quedo en vista (scrollY ${state.y}, top ${state.top}px, viewport ${state.viewport}px)`
    );
  }
}

async function runArrivalCases(p, rig, mobile) {
  // D1: from the catalogue, the navbar Contact CTA must arrive AND announce.
  {
    const label = `${rig} /proyectos -> CTA`;
    await p.goto("about:blank");
    await p.goto(BASE + "/proyectos", { waitUntil: "load" });
    await p.waitForTimeout(1400);
    const onCatalogue = await p.evaluate(() => ({
      fires: window.__cue.at.length,
      cueTarget: document.getElementById("contacto") !== null,
      strayArrive: document.querySelector(".arrive") !== null,
    }));
    // The catalogue has no contact section, so it must not announce anything,
    // and the case below is only meaningful if the anchor really is missing.
    if (onCatalogue.fires !== 0 || onCatalogue.strayArrive) {
      failures.push(`${label}: el anillo se disparo en el catalogo, sin seccion de contacto`);
    }
    if (onCatalogue.cueTarget) {
      failures.push(`${label}: el catalogo tiene un #${CUE_ID}, la premisa del caso no se cumple`);
    }

    await tapContactCta(p, mobile);
    await p.waitForTimeout(ARRIVAL_SETTLE_MS);
    const state = await arrivalState(p);
    arrivalRows.push({ rig, case: "/proyectos -> CTA", ...state });
    assertArrival(label, state);
    if (state.hash !== "#" + CUE_ID) {
      failures.push(`${label}: el hash quedo en "${state.hash}"`);
    }
  }

  // D2: a fresh load of the same URL — same landing, same single cue.
  {
    const label = `${rig} fresh load /#${CUE_ID}`;
    // Through about:blank, so this is a NAVIGATION (a same-URL goto is a
    // reload, which the browser restores by session position).
    await p.goto("about:blank");
    await p.goto(BASE + "/#" + CUE_ID, { waitUntil: "load" });
    await p.waitForTimeout(ARRIVAL_SETTLE_MS);
    const state = await arrivalState(p);
    arrivalRows.push({ rig, case: `fresh load /#${CUE_ID}`, ...state });
    assertArrival(label, state);
  }

  // D3: clicking Contacto while ALREADY on the home is the old path, and the
  // mount trigger must not add a second cue to it.
  {
    const label = `${rig} click contacto on home`;
    if (!(await reset(p))) failures.push(`${label}: la pagina no volvio a scrollY 0`);
    await tapContactCta(p, mobile);
    await p.waitForTimeout(ARRIVAL_SETTLE_MS);
    const state = await arrivalState(p);
    arrivalRows.push({ rig, case: "click contacto on home", ...state });
    assertArrival(label, state);
  }

  // D4: the cue must not exist off the home at all — the detail page has no
  // navbar and no contact section, so nothing may be announced there.
  {
    const label = `${rig} /proyectos/[id]`;
    await p.goto("about:blank");
    await p.goto(BASE + "/proyectos", { waitUntil: "load" });
    await p.waitForTimeout(1000);
    const detail = await p.evaluate(() => {
      const link = document.querySelector('a[href^="/proyectos/"]');
      return link ? link.getAttribute("href") : null;
    });
    if (!detail) {
      failures.push(`${label}: el catalogo no ofrecio ninguna ficha para visitar`);
    } else {
      await p.goto(BASE + detail, { waitUntil: "load" });
      await p.waitForTimeout(1600);
      const state = await arrivalState(p);
      arrivalRows.push({ rig, case: "/proyectos/[id]", fires: state.fires, y: state.y });
      if (state.fires !== 0 || state.strayArrive) {
        failures.push(`${label}: el anillo se disparo fuera de la home (${state.fires} veces)`);
      }
    }
  }
}

await runArrivalCases(page, "mobile", true);
await runReturnCases(page, "mobile");

// The same three cases on the Lenis path: there the trigger waits for the
// instance (created one commit after mount), which is exactly where a
// non-idempotent effect would fire twice or not at all.
const desktopContext = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});
await installCueCounter(desktopContext);
const desktopPage = await desktopContext.newPage();
await runArrivalCases(desktopPage, "desktop", false);
await runReturnCases(desktopPage, "desktop");
await desktopContext.close();

const ratio = (mode) => {
  const times = rows.filter((r) => r.mode === mode && r.travel > 0).map((r) => r.travelMs);
  if (times.length < 2) return "n/a";
  return `x${(Math.max(...times) / Math.max(Math.min(...times), 1)).toFixed(2)}`;
};

console.table(rows);
console.table(arrivalRows);
console.table(returnRows);
console.log(
  `retorno a la grilla: ${returnRows.length} casos, ${returnRows.filter((r) => r.cueAfter === r.cueBefore).length} sin anillo extra`
);
console.log(
  `arrival cue: ${arrivalRows.length} casos, ${arrivalRows.filter((r) => r.fires === 1).length} con exactamente un aviso`
);
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
console.log("OK: el anillo se dispara una sola vez tambien al LLEGAR con hash, desde el catalogo y en carga directa.");
console.log("OK: una vuelta que ya tiene dueno conserva el scroll y NO anuncia el hash de la URL.");
