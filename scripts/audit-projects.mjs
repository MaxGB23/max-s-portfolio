/**
 * Measure why the "All Projects" grid lags while scrolling, on a mobile
 * emulator.
 *
 * The symptom (a hitch/twitch on the home page grid, desktop and mobile) has
 * three candidate causes that look identical from the outside:
 *
 *   M1 network contention - the featured panels above the grid mount three
 *      below-the-fold images with `priority` (eager + <link rel=preload>),
 *      so they eat the pipe before the grid is reached.
 *   M2 reveal before ready - the grid fades in while its images are still
 *      grey, so the pop is visible.
 *   M3 main-thread jank - decoding/painting full-width images (and the
 *      container fade) blocks the scroll animation.
 *
 * This script measures all three instead of guessing:
 *   - per image: request start, response end, load event, decode ready
 *   - per image: the moment it first entered the viewport
 *   - the moment each reveal item was marked "shown" (the fade start)
 *   - long tasks (>50ms) with their timing
 *   - LCP entries
 *   - bytes served for images before the grid was reached
 *
 * Usage:
 *   node scripts/audit-projects.mjs [--url http://localhost:<port>]
 *        [--profile mobile|desktop|both] [--net off|fast3g|slow4g]
 *        [--cpu 4] [--scroll-step 600] [--scroll-pause 100]
 *        [--wait-hydration] [--no-warm]
 *
 * Requires a PRODUCTION server (`pnpm build && pnpm start`): in dev mode
 * next/image has no cache and every variant is resized on the fly, which
 * fakes a latency problem that does not exist in production.
 *
 * The warm-up pass (on by default) matters for the same reason: the first
 * request for a variant costs ~1s of server-side resize, and six cold ones
 * queue into ~5s. That is a SERVER cost; measuring it as network latency
 * sends the whole diagnosis in the wrong direction.
 *
 * Scope: the home page and the "All Projects" grid. It says nothing about
 * the detail page.
 */
import { chromium } from "playwright";
import { resolveBase } from "./audit-base.mjs";
import { analyzeTrace, printTraceReport } from "./trace-analysis.mjs";

const args = process.argv.slice(2);
const pick = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const has = (flag) => args.includes(flag);

const url = await resolveBase("audit-projects");
const profileArg = pick("--profile", "mobile");
const netArg = pick("--net", "fast3g");
const cpuRate = Number(pick("--cpu", profileArg === "desktop" ? "1" : "4"));
const scrollStep = Number(pick("--scroll-step", "600"));
const scrollPause = Number(pick("--scroll-pause", "100"));
// Wait for the app to hydrate before scrolling. Off by default: on 3G the
// visitor scrolls before the bundle lands, and that IS the scenario to measure.
const waitHydration = args.includes("--wait-hydration");
// Warm the server-side image cache before measuring (see runProfile).
const warm = !args.includes("--no-warm");
// Force the decode of every image. Off by default: it creates a burst of
// decodes the browser would schedule on its own, and it fakes a dropped frame
// in the frame timeline.
const forceDecode = args.includes("--force-decode");
// Headed: real Chrome, real GPU. Software raster in headless overstates the
// cost of painting images by ~10x.
const headed = args.includes("--headed");
// Trace: capture a Chrome trace and attribute what fills the slow frame.
const trace = args.includes("--trace");

// Chrome DevTools-like network presets, in bytes per second.
const NET_PROFILES = {
  off: { downloadThroughput: -1, uploadThroughput: -1, latency: 0 },
  fast3g: { downloadThroughput: 200000, uploadThroughput: 93750, latency: 150 },
  slow4g: { downloadThroughput: 500000, uploadThroughput: 375000, latency: 85 },
};
const net = NET_PROFILES[netArg];
if (!net) {
  console.error(`audit-projects: unknown --net ${netArg} (${Object.keys(NET_PROFILES).join("|")})`);
  process.exit(1);
}

const PROFILES = {
  mobile: {
    label: "mobile 393x851 dpr3 (CPU x4)",
    viewport: { width: 393, height: 851 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  desktop: {
    label: "desktop 1440x900 dpr1",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Page-side instrumentation. Installed before any page script runs, so the
 * reveal observer and the long-task buffer see everything from the first
 * paint.
 */
const INIT_JS = () => {
  const forceDecode = window.__FORCE_DECODE__ === true;
  const p = {
    loads: [],
    decodes: [],
    visible: [],
    longtasks: [],
    lcp: [],
    reveals: [],
    frames: [],
    marks: {},
  };
  window.__perf = p;

  // Frame timeline. A hitch is a DROPPED FRAME, not necessarily a long task:
  // at 60Hz a 32ms frame is already visible, and the longtask API only sees
  // >50ms. This is the signal that matches "me dio un tiron".
  let lastFrame = performance.now();
  const tick = (now) => {
    p.frames.push({ t: now, d: now - lastFrame });
    lastFrame = now;
    p.raf = requestAnimationFrame(tick);
  };
  p.raf = requestAnimationFrame(tick);

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        p.longtasks.push({
          start: e.startTime,
          dur: e.duration,
          attribution: (e.attribution || []).map((a) => a.containerType || a.name || "?"),
        });
      }
    }).observe({ type: "longtask", buffered: true });
  } catch {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        p.lcp.push({
          t: e.startTime,
          size: e.size,
          url: e.url || (e.element && e.element.currentSrc) || "",
          tag: e.element ? e.element.tagName.toLowerCase() : "",
        });
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  const keyOf = (raw) => {
    if (!raw) return "";
    try {
      const u = new URL(raw, location.href);
      return u.searchParams.get("url") || u.pathname;
    } catch {
      return raw;
    }
  };

  document.addEventListener(
    "load",
    (e) => {
      const el = e.target;
      if (!el || el.tagName !== "IMG") return;
      const rec = {
        src: el.currentSrc || el.src,
        key: keyOf(el.currentSrc || el.src),
        t: performance.now(),
        w: el.naturalWidth,
        h: el.naturalHeight,
      };
      p.loads.push(rec);
      // decode() resolves when the bitmap is ready to paint, but CALLING it
      // forces a decode the browser would schedule on its own. With eager
      // images that becomes a burst of forced decodes and a fake dropped
      // frame, so it is opt-in (--force-decode) and off by default.
      if (forceDecode && typeof el.decode === "function") {
        el.decode()
          .then(() => p.decodes.push({ key: rec.key, t: performance.now() }))
          .catch(() => {});
      }
    },
    true,
  );

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        p.visible.push({
          key: keyOf(e.target.currentSrc || e.target.src),
          t: performance.now(),
        });
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px", threshold: 0 },
  );

  const observeImages = () => {
    for (const img of document.querySelectorAll("img")) io.observe(img);
  };

  const mo = new MutationObserver((records) => {
    for (const r of records) {
      const el = r.target;
      if (el.dataset && el.dataset.revealItem === "shown") {
        const isGrid = !!el.querySelector("article.project-card");
        p.reveals.push({
          t: performance.now(),
          isGrid,
          label: (el.className || "").toString().slice(0, 48),
        });
        // Anchor between the page clock and the trace clock.
        try {
          const name = isGrid ? "grid-fade" : "reveal";
          performance.mark(name);
          p.marks[name] = performance.now();
        } catch {}
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    observeImages();
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-reveal-item"],
      subtree: true,
    });
  });
  observeImages();
};

/** The source path behind a /_next/image request (or the path itself). */
function sourceOf(rawUrl) {
  try {
    const u = new URL(rawUrl);
    return u.searchParams.get("url") || u.pathname;
  } catch {
    return String(rawUrl);
  }
}

/** Identity of an image regardless of the variant (w) the browser picked. */
function keyOf(rawUrl) {
  return sourceOf(rawUrl);
}

/** Short label for an image URL: the project folder and the file. */
function labelOf(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const src = u.searchParams.get("url") || u.pathname;
    const m = src.match(/\/images\/projects\/([^/]+)\/([^/?]+)/);
    if (m) return `${m[1]}/${m[2].replace(/\.(webp|png|jpe?g)$/i, "")}@${u.searchParams.get("w") || "raw"}`;
    const p = src.match(/\/images\/([^/?]+)/);
    return p ? `${p[1]}@${u.searchParams.get("w") || "raw"}` : src.slice(-40);
  } catch {
    return String(rawUrl).slice(-40);
  }
}

function pad(s, n) {
  return String(s).padEnd(n, " ").slice(0, n);
}

async function launchBrowser() {
  // Headed mode runs the real Chrome with GPU rasterization. The bundled
  // headless Chromium rasterizes in software (SwiftShader), which inflates
  // the cost of painting images by an order of magnitude and does NOT
  // reproduce what a visitor sees on a desktop.
  const opts = { headless: !headed };
  try {
    return await chromium.launch(opts);
  } catch (e) {
    console.warn(`[browser fallback] ${String(e.message).split("\n")[0]}`);
    return await chromium.launch({ ...opts, channel: process.env.PW_CHANNEL || "chrome" });
  }
}

async function runProfile(browser, key) {
  const prof = PROFILES[key];
  const context = await browser.newContext({
    viewport: prof.viewport,
    deviceScaleFactor: prof.deviceScaleFactor,
    isMobile: prof.isMobile,
    hasTouch: prof.hasTouch,
    userAgent: prof.userAgent,
  });
  await context.addInitScript(INIT_JS);
  await context.addInitScript(`window.__FORCE_DECODE__ = ${forceDecode};`);
  const page = await context.newPage();

  const client = await context.newCDPSession(page);
  await client.send("Network.enable");

  // Which GPU is actually doing the work. A machine without hardware
  // acceleration rasterizes in the GPU process with SwiftShader and every
  // GPU task costs 10x more than on a real GPU: without this line, a
  // software-rendered artifact reads as a page problem.
  let gpuInfo = null;
  try {
    const info = await client.send("SystemInfo.getInfo");
    const devs = info?.gpu?.devices || [];
    gpuInfo = devs.map((d) => `${d.deviceString || "?"} (${d.vendorId || "?"}:${d.deviceId || "?"})`).join(" | ") || "sin GPU";
  } catch {
    gpuInfo = null;
  }
  if (!gpuInfo) {
    // SystemInfo is not always exposed; the WebGL renderer string is the
    // portable way to know whether the GPU process is faking it in software
    // (SwiftShader / llvmpipe / "Software Adapter").
    gpuInfo = await page
      .evaluate(() => {
        try {
          const gl = document.createElement("canvas").getContext("webgl");
          if (!gl) return "sin WebGL";
          const ext = gl.getExtension("WEBGL_debug_renderer_info");
          const r = ext
            ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
            : gl.getParameter(gl.RENDERER);
          return String(r);
        } catch {
          return "no disponible";
        }
      })
      .catch(() => "no disponible");
  }
  if (net.downloadThroughput !== -1) {
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      ...net,
      connectionType: "cellular3g",
    });
  }
  if (cpuRate > 1) {
    await client.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
  }

  // Warm-up pass. The image optimizer resizes on the fly the first time it
  // sees a variant (measured: ~990ms for one card, and 6 cold requests
  // serialize into ~5s). That is a SERVER cost, not a network one, and it
  // dominated every run against a freshly built server. One warm navigation
  // pays it before the measured one.
  if (warm) {
    const client2 = client;
    await client2.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
    await page.goto(url, { waitUntil: "load", timeout: 90000 });
    await wait(4000);
    if (net.downloadThroughput !== -1) {
      await client2.send("Network.emulateNetworkConditions", {
        offline: false,
        ...net,
        connectionType: "cellular3g",
      });
    }
  }

  // Network timeline (node clock, ms since navigation start).
  const net0 = Date.now();
  const requests = new Map();
  const imageLog = [];
  page.on("request", (req) => {
    if (req.resourceType() !== "image") return;
    const rec = {
      url: req.url(),
      start: Date.now() - net0,
      end: null,
      bytes: 0,
      isCard: /\/images\/projects\//.test(sourceOf(req.url())),
    };
    requests.set(req, rec);
    imageLog.push(rec);
  });
  page.on("response", (res) => {
    const req = res.request();
    const rec = requests.get(req);
    if (!rec) return;
    rec.status = res.status();
    rec.end = Date.now() - net0;
    try {
      const len = res.headers()["content-length"];
      if (len) rec.bytes = Number(len);
    } catch {}
  });
  page.on("requestfinished", async (req) => {
    const rec = requests.get(req);
    if (!rec) return;
    try {
      const res = await req.response();
      const body = await res.body();
      if (!rec.bytes && body && body.length) rec.bytes = body.length;
    } catch {}
  });
  page.on("requestfailed", (req) => {
    const rec = requests.get(req);
    if (rec) rec.failed = true;
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

  // A backgrounded window gets its compositor throttled and the frame
  // timeline turns into noise. In headed mode, bring it to the front.
  if (headed) {
    try {
      await page.bringToFront();
    } catch {}
  }

  // Align the page clock with the node clock.
  const pageNow = await page.evaluate(() => performance.now());
  const offset = Date.now() - net0 - pageNow;

  // Hydration gate. The Reveal effect writes --reveal-delay inline, so that
  // property is the only JS-only signal of a hydrated app. On 3G the bundle
  // takes ~4s to hydrate, which is AFTER the visitor already scrolled past
  // the grid: any client-side prefetch is born too late there, and the reveal
  // the user sees is the 2s safety net, not React.
  let hydratedAt = null;
  const checkAt = Date.now() - net0;
  if (waitHydration) {
    for (let i = 0; i < 120; i++) {
      const ok = await page.evaluate(() => {
        const el = document.querySelector(".reveal-fade");
        return !!el && el.style.getPropertyValue("--reveal-delay") !== "";
      });
      if (ok) {
        hydratedAt = Date.now() - net0;
        break;
      }
      await wait(250);
    }
  } else {
    const ok = await page.evaluate(() => {
      const el = document.querySelector(".reveal-fade");
      return !!el && el.style.getPropertyValue("--reveal-delay") !== "";
    });
    if (ok) hydratedAt = Date.now() - net0;
  }

  // Scroll the way a visitor does: wheel events, so Lenis handles them.
  const scrollStart = Date.now() - net0;
  const traceEvents = [];
  if (trace) {
    client.on("Tracing.dataCollected", (e) => {
      for (const ev of e.value) traceEvents.push(ev);
    });
    await client.send("Tracing.start", {
      categories: [
        "devtools.timeline",
        "disabled-by-default-devtools.timeline",
        "disabled-by-default-devtools.timeline.frame",
        "disabled-by-default-devtools.timeline.image",
        "blink.user_timing",
        "latencyInfo",
      ].join(","),
      transferMode: "ReportEvents",
    });
  }
  const gridTop = await page.evaluate(() => {
    const grid = document.querySelector("#all-projects .grid");
    if (!grid) return null;
    return grid.getBoundingClientRect().top + window.scrollY;
  });

  let guard = 0;
  let reachedGrid = false;
  while (guard++ < 400) {
    await page.mouse.wheel(0, scrollStep);
    await wait(scrollPause);
    const y = await page.evaluate(() => window.scrollY);
    if (gridTop != null && !reachedGrid && y >= gridTop - 200) reachedGrid = true;
    const end = await page.evaluate(() => {
      const grid = document.querySelector("#all-projects .grid");
      if (!grid) return null;
      return grid.getBoundingClientRect().bottom + window.scrollY;
    });
    if (end != null && y >= end + 100) break;
    if (y + (await page.evaluate(() => window.innerHeight)) >= (await page.evaluate(() => document.body.scrollHeight))) break;
  }
  const scrollEnd = Date.now() - net0;

  if (trace) {
    try {
      await page.evaluate(() => performance.mark("scroll-end"));
    } catch {}
    // CDPSession is an EventEmitter, not a Page: no waitForEvent.
    const tracingDone = new Promise((resolve) => {
      client.once("Tracing.tracingComplete", () => resolve());
      setTimeout(resolve, 30000);
    });
    await client.send("Tracing.end");
    await tracingDone;
  }

  // Let the stragglers land.
  await wait(2500);

  const perf = await page.evaluate(() => window.__perf);
  const now = Date.now() - net0;
  await context.close();

  return {
    prof,
    key,
    perf,
    imageLog,
    offset,
    scrollStart,
    scrollEnd,
    now,
    gridTop,
    reachedGrid,
    hydratedAt,
    checkAt,
    traceEvents,
    gpuInfo,
  };
}

function report(run) {
  const { prof, perf, imageLog, offset, scrollStart, scrollEnd, hydratedAt, checkAt } = run;
  const toNode = (t) => t + offset;

  console.log(`\n================ ${prof.label} ================`);
  console.log(`net=${netArg} cpu=x${cpuRate} scroll=${scrollStart}..${scrollEnd}ms`);
  if (run.gpuInfo) console.log(`gpu: ${run.gpuInfo}`);
  console.log(
    `hidratacion: ${
      hydratedAt == null
        ? "NO (a los " + Math.round(checkAt) + "ms todavia sin JS)"
        : hydratedAt + "ms"
    }`
  );

  // --- Images: network timeline -------------------------------------------
  const imgs = imageLog
    .map((r) => ({
      label: labelOf(r.url),
      start: r.start,
      end: r.end,
      bytes: r.bytes,
      status: r.status || 0,
      isCard: r.isCard,
    }))
    .sort((a, b) => a.start - b.start);

  console.log("\n-- image requests (node clock, ms) --");
  console.log(`  ${pad("image", 34)} ${pad("req", 7)} ${pad("end", 7)} ${pad("delta", 7)} KB`);
  for (const i of imgs) {
    const delta = i.end != null ? i.end - i.start : -1;
    console.log(
      `  ${pad(i.label, 34)} ${pad(i.start, 7)} ${pad(i.end == null ? "-" : i.end, 7)} ${pad(delta, 7)} ${(i.bytes / 1024).toFixed(0)}`
    );
  }

  // --- Reveal vs paint ----------------------------------------------------
  const gridReveal = perf.reveals.find((r) => r.isGrid);
  const firstCard = imgs.find((i) => i.isCard);
  console.log("\n-- reveal vs first paint --");
  if (gridReveal) {
    console.log(`  grid fade-in shown at  ${toNode(gridReveal.t).toFixed(0)}ms (page ${gridReveal.t.toFixed(0)}ms)`);
  } else {
    console.log("  grid fade-in: NOT OBSERVED");
  }

  // Per card image: when it entered the viewport, when its bytes landed and
  // when its pixels were ready.
  const cardVisible = perf.visible.filter((v) => v.key.includes("/images/"));
  const loads = new Map(perf.loads.map((l) => [l.key, l]));
  const decodes = new Map(perf.decodes.map((d) => [d.key, d]));

  console.log("\n-- card images: visible -> bytes -> pixels (page clock, ms) --");
  console.log(`  ${pad("image", 36)} ${pad("visible", 9)} ${pad("load", 8)} ${pad("decode", 8)} ${pad("gray", 7)}`);
  let worstPop = 0;
  const pops = [];
  for (const v of cardVisible) {
    const label = labelOf(v.key);
    const l = loads.get(v.key);
    const d = decodes.get(v.key);
    const pop = l ? l.t - v.t : -1;
    if (pop > worstPop) worstPop = pop;
    if (pop >= 0) pops.push(pop);
    console.log(
      `  ${pad(label, 36)} ${pad(v.t.toFixed(0), 9)} ${pad(l ? l.t.toFixed(0) : "-", 8)} ${pad(d ? d.t.toFixed(0) : "-", 8)} ${pad(pop >= 0 ? pop.toFixed(0) : "-", 7)}`
    );
  }

  // --- Frame timeline ----------------------------------------------------
  const gridFade = gridReveal ? gridReveal.t : null;
  const inWindow = (t, from, to) => t >= from && t <= to;
  const frameStats = (from, to) => {
    const frames = perf.frames.filter((f) => inWindow(f.t, from, to));
    if (frames.length < 2) return null;
    const deltas = frames.map((f) => f.d).sort((a, b) => a - b);
    const over32 = deltas.filter((d) => d > 32);
    const over50 = deltas.filter((d) => d > 50);
    return {
      n: frames.length,
      median: deltas[Math.floor(deltas.length / 2)],
      p95: deltas[Math.floor(deltas.length * 0.95)],
      max: deltas[deltas.length - 1],
      over32: over32.length,
      over50: over50.length,
      lostMs: over32.reduce((s, d) => s + (d - 16.7), 0),
    };
  };
  const scrollFrames = frameStats(scrollStart, scrollEnd);
  const fadeFrames = gridFade ? frameStats(gridFade, gridFade + 700) : null;

  console.log("\n-- frame timeline (60Hz = 16.7ms) --");
  if (scrollFrames) {
    console.log(
      `  scroll completo: ${scrollFrames.n} frames  mediana ${scrollFrames.median.toFixed(1)}ms  p95 ${scrollFrames.p95.toFixed(1)}ms  max ${scrollFrames.max.toFixed(1)}ms`
    );
    console.log(
      `    frames >32ms (caidos): ${scrollFrames.over32}   >50ms: ${scrollFrames.over50}   frames perdidos: ~${scrollFrames.lostMs.toFixed(0)}ms`
    );
  }
  if (fadeFrames) {
    console.log(
      `  ventana del fade de la grid (700ms): ${fadeFrames.n} frames  mediana ${fadeFrames.median.toFixed(1)}ms  max ${fadeFrames.max.toFixed(1)}ms  caidos ${fadeFrames.over32} (~${fadeFrames.lostMs.toFixed(0)}ms perdidos)`
    );
  } else {
    console.log("  ventana del fade: sin datos");
  }

  // The worst frames, with their position relative to the grid fade: a hitch
  // at the fade is the grid; a hitch at page load is the eager download.
  const worst = perf.frames
    .filter((f) => f.d > 32)
    .sort((a, b) => b.d - a.d)
    .slice(0, 6);
  console.log("  frames mas pesados (d = duracion, t = posicion):");
  for (const f of worst) {
    const rel = gridFade == null ? "?" : Math.round(f.t - gridFade);
    console.log(
      `    d=${f.d.toFixed(0)}ms  t=${Math.round(f.t)}ms  ${rel >= 0 ? rel + "ms tras el fade" : Math.abs(rel) + "ms antes del fade"}`
    );
  }

  // --- Trace attribution -------------------------------------------------
  if (run.traceEvents && run.traceEvents.length) {
    const winStart = scrollStart - offset;
    const winEnd = scrollEnd - offset;
    let slow = null;
    for (const f of perf.frames) {
      if (f.t < winStart || f.t > winEnd) continue;
      if (!slow || f.d > slow.d) slow = { t: f.t, d: f.d };
    }
    const anchorPage = perf.marks && perf.marks["grid-fade"];
    const anchorEv = run.traceEvents.find((e) => e.name === "grid-fade");
    if (slow && anchorPage != null && anchorEv) {
      const traceReport = analyzeTrace(run.traceEvents, {
        slowFrame: slow,
        anchorPage,
        anchorTs: anchorEv.ts,
      });
      printTraceReport(traceReport);
      console.log(
        `  (con tracing el frame se infla: ${slow.d.toFixed(0)}ms aqui vs lo que se midio sin trace)`
      );
    } else {
      console.log(
        "  trace: sin ancla (grid-fade) o sin frame lento en la ventana del scroll"
      );
    }
  }

  // --- Long tasks ---------------------------------------------------------
  const inScroll = perf.longtasks.filter((t) => {
    const n = toNode(t.start);
    return n >= scrollStart - 200 && n <= scrollEnd + 400;
  });
  const blocked = inScroll.reduce((s, t) => s + t.dur, 0);
  console.log("\n-- main thread --");
  console.log(`  long tasks during scroll: ${inScroll.length} (total ${blocked.toFixed(0)}ms, max ${inScroll.length ? Math.max(...inScroll.map((t) => t.dur)).toFixed(0) : 0}ms)`);
  for (const t of inScroll.slice(0, 12)) {
    console.log(`    +${toNode(t.start).toFixed(0)}ms  ${t.dur.toFixed(0)}ms  ${t.attribution.join(",")}`);
  }
  console.log(`  long tasks total (page): ${perf.longtasks.length}`);

  if (perf.lcp.length) {
    const last = perf.lcp[perf.lcp.length - 1];
    console.log(`\n-- LCP --\n  ${last.t.toFixed(0)}ms  ${last.tag}  ${labelOf(last.url)}  (size ${last.size})`);
    for (const l of perf.lcp) {
      console.log(`    candidate ${l.t.toFixed(0)}ms ${l.tag} ${labelOf(l.url)}`);
    }
  }

  // --- Bandwidth before the grid -----------------------------------------
  const beforeGrid = imgs.filter((i) => gridReveal && i.end != null && i.end <= toNode(gridReveal.t));
  const bytesBefore = beforeGrid.reduce((s, i) => s + i.bytes, 0);
  console.log("\n-- bandwidth --");
  console.log(
    `  ${beforeGrid.length} images finished before the grid faded in: ${(bytesBefore / 1024).toFixed(0)}KB`
  );
  for (const i of beforeGrid) console.log(`    ${pad(i.label, 34)} ${(i.bytes / 1024).toFixed(0)}KB`);

  // --- Verdict ------------------------------------------------------------
  const gridRevealNode = gridReveal ? toNode(gridReveal.t) : null;
  const pops2 = pops.slice().sort((a, b) => a - b);
  const medianPop = pops2.length ? pops2[Math.floor(pops2.length / 2)] : -1;
  console.log("\n-- verdict --");
  console.log(`  worst pop (visible -> bytes): ${worstPop.toFixed(0)}ms   median: ${medianPop.toFixed(0)}ms`);
  console.log(`  main thread blocked during scroll: ${blocked.toFixed(0)}ms`);
  if (medianPop > 300 && blocked < 500) {
    console.log("  => NETWORK bound: the image arrives long after the card is visible.");
    console.log("     Fix: preload the card variants (same `sizes`) before the grid is reached.");
  } else if (blocked >= 500) {
    console.log("  => MAIN THREAD bound: decoding/painting the images (and the fade) blocks the scroll.");
    console.log("     Fix: cut the decode/paint cost (content-visibility, layer promotion, smaller variants).");
  } else {
    console.log("  => MIXED or mild: see the timeline above.");
  }
  if (bytesBefore > 200 * 1024) {
    console.log(
      `  => ${(bytesBefore / 1024).toFixed(0)}KB of below-the-fold images landed before the grid:`
    );
    console.log("     M1 contention. Fix: drop `priority` from the featured panels (only the hero is LCP).");
  }
  if (gridRevealNode != null) {
    const firstCardLoad = imgs.find((i) => i.isCard);
    if (firstCardLoad && firstCardLoad.end != null && firstCardLoad.end > gridRevealNode) {
      console.log(
        `  => the grid faded in at ${gridRevealNode.toFixed(0)}ms and the first card image landed at ${firstCardLoad.end.toFixed(0)}ms: M2 pop is real.`
      );
    }
  }
}

const browser = await launchBrowser();
const keys = profileArg === "both" ? ["mobile", "desktop"] : [profileArg];
if (!PROFILES[keys[0]]) {
  console.error(`audit-projects: unknown --profile ${profileArg}`);
  process.exit(1);
}
for (const key of keys) {
  const run = await runProfile(browser, key);
  report(run);
}
await browser.close();
