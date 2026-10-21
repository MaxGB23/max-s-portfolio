/**
 * Trace analysis for the home page audit.
 *
 * The frame timeline says WHERE the hitch is (a gap between rAF callbacks)
 * but not WHAT is inside it. This module turns a Chrome trace into that
 * attribution: the events that occupy the slow frame, grouped by name and
 * by thread, plus a verdict.
 *
 * The two clocks: the page has its own `performance.now()` and the trace has
 * a monotonic `ts` in microseconds. The page emits a `performance.mark` when
 * the grid fades in, and the trace carries the same mark as a UserTiming
 * event: that is the anchor that lets us map a page-time window onto
 * trace-time events.
 */

/** Event names that identify what the slow frame was spending time on. */
const VERDICTS = [
  { match: /RasterTask|RasterImage|RasterScrollLayer/, label: "RASTER (pintado de la capa)" },
  { match: /PaintImage|PaintLayer|^Paint$|PaintRecord/, label: "PAINT (pintado del DOM)" },
  { match: /ImageDecodeTask|DecodeImage|ImageDecoder/, label: "DECODE de imagen" },
  { match: /CompositeLayers|^Commit$|DrawFrame|ActivateLayerTree/, label: "COMPOSITE (capas)" },
  { match: /UpdateLayerTree|LayerTreeHostImpl/, label: "LAYER TREE" },
  { match: /FunctionCall|EvaluateScript|v8\.run|EventDispatch/, label: "JS" },
  { match: /^Layout$|UpdateLayoutTree/, label: "LAYOUT" },
  { match: /ParseHTML|ParseAuthorStyleSheet/, label: "PARSEO" },
];

/**
 * Thread-level verdict. A slow frame that lives in the GPU process is a
 * different animal from one that lives in the renderer main thread: the
 * first is raster/texture work (and on a machine without hardware
 * acceleration it is software raster pretending to be GPU work), the second
 * is script or style work.
 */
const THREAD_VERDICTS = [
  { match: /Gpu|GPU/, label: "GPU (proceso GPU: raster, subida de texturas, sombras)" },
  { match: /Compositor|VizCompositor/, label: "COMPOSITOR (presentacion de frames)" },
  { match: /CrRendererMain/, label: "RENDERER MAIN (JS, estilo, layout, paint)" },
];

/**
 * @param {object[]} events raw trace events (Chrome DevTools format)
 * @param {object} opts
 * @param {{t:number,d:number}} opts.slowFrame slow frame in page time (ms)
 * @param {number} opts.anchorPage page time (ms) of the anchor mark
 * @param {number} opts.anchorTs trace time (us) of the anchor mark
 * @param {number} opts.pad extra window around the slow frame (us)
 */
export function analyzeTrace(events, { slowFrame, anchorPage, anchorTs, pad = 150000 }) {
  const toTrace = (pageMs) => anchorTs + (pageMs - anchorPage) * 1000;
  const winStart = toTrace(slowFrame.t) - pad;
  const winEnd = toTrace(slowFrame.t + slowFrame.d) + pad;

  // Thread names arrive as metadata events.
  const threadNames = new Map();
  for (const e of events) {
    if (e.ph === "M" && e.name === "thread_name") {
      threadNames.set(`${e.pid}:${e.tid}`, e.args?.name || "?");
    }
  }

  const byName = new Map();
  const byThread = new Map();
  const top = [];

  for (const e of events) {
    if (e.ph !== "X" || typeof e.dur !== "number") continue;
    if (e.ts < winStart || e.ts > winEnd) continue;
    const dur = e.dur / 1000; // ms
    const thread = threadNames.get(`${e.pid}:${e.tid}`) || `tid:${e.tid}`;
    const rec = byName.get(e.name) || { name: e.name, count: 0, total: 0, max: 0, thread };
    rec.count += 1;
    rec.total += dur;
    if (dur > rec.max) rec.max = dur;
    byName.set(e.name, rec);

    const trec = byThread.get(thread) || { thread, total: 0, count: 0 };
    trec.total += dur;
    trec.count += 1;
    byThread.set(thread, trec);

    top.push({ name: e.name, dur, thread, ts: e.ts, args: e.args });
  }

  top.sort((a, b) => b.dur - a.dur);
  const topArgs = top
    .filter((e) => e.args && Object.keys(e.args).length)
    .slice(0, 6)
    .map((e) => ({
      name: e.name,
      dur: e.dur,
      args: JSON.stringify(e.args).slice(0, 220),
    }));

  const groups = [...byName.values()].sort((a, b) => b.total - a.total);
  const threads = [...byThread.values()].sort((a, b) => b.total - a.total);

  // Thread verdict: where the time lives, not just which event name.
  const threadVerdicts = [];
  for (const v of THREAD_VERDICTS) {
    const hit = threads.filter((t) => v.match.test(t.thread));
    if (hit.length) {
      threadVerdicts.push({
        label: v.label,
        total: hit.reduce((s, t) => s + t.total, 0),
        max: Math.max(...hit.map((t) => t.total)),
      });
    }
  }
  threadVerdicts.sort((a, b) => b.total - a.total);

  // Verdict: the heaviest group inside the window, matched against the
  // known signatures. A long RunTask with no rendering sibling means JS.
  const heavy = groups.filter((g) => g.max >= 8);
  const verdicts = [];
  for (const v of VERDICTS) {
    const hit = heavy.filter((g) => v.match.test(g.name));
    if (hit.length) {
      const total = hit.reduce((s, g) => s + g.total, 0);
      verdicts.push({ label: v.label, total, max: Math.max(...hit.map((g) => g.max)) });
    }
  }
  verdicts.sort((a, b) => b.total - a.total);

  return { winStart, winEnd, groups, threads, top, topArgs, verdicts, threadVerdicts, slowFrame };
}

export function printTraceReport(report, pad = 34) {
  const p = (s, n) => String(s).padEnd(n, " ").slice(0, n);
  console.log(
    `\n-- trace: que ocupa el frame lento (${report.slowFrame.d.toFixed(0)}ms) --`
  );

  console.log("  por thread:");
  for (const t of report.threads.slice(0, 5)) {
    console.log(`    ${p(t.thread, 22)} ${t.total.toFixed(0).padStart(6)}ms  (${t.count} eventos)`);
  }

  console.log("  por evento (total / max):");
  for (const g of report.groups.slice(0, 12)) {
    console.log(
      `    ${p(g.name, pad)} ${g.total.toFixed(0).padStart(6)}ms  max ${g.max.toFixed(0).padStart(4)}ms  x${g.count}  ${p(g.thread, 18)}`
    );
  }

  console.log("  eventos individuales mas largos:");
  for (const e of report.top.slice(0, 8)) {
    console.log(
      `    ${p(e.name, pad)} ${e.dur.toFixed(1).padStart(7)}ms  ${p(e.thread, 18)}`
    );
  }

  if (report.topArgs && report.topArgs.length) {
    console.log("  args de los eventos mas largos:");
    for (const a of report.topArgs) {
      console.log(`    ${p(a.name, 22)} ${a.dur.toFixed(1)}ms  ${a.args}`);
    }
  }

  if (report.threadVerdicts.length) {
    console.log("  veredicto (thread):");
    for (const v of report.threadVerdicts.slice(0, 3)) {
      console.log(`    ${v.label}: ${v.total.toFixed(0)}ms en la ventana`);
    }
  }
  if (report.verdicts.length) {
    console.log("  veredicto (eventos):");
    for (const v of report.verdicts.slice(0, 4)) {
      console.log(`    ${v.label}: ${v.total.toFixed(0)}ms acumulados, max ${v.max.toFixed(0)}ms`);
    }
  } else {
    console.log("  veredicto: sin firma reconocible (revisar los eventos de arriba)");
  }
}
