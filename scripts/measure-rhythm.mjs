// Vertical-rhythm + type-scale measurement: home (`/`) vs catalogue
// (`/proyectos`), on a real production build.
//
// WHY: `/proyectos` inherited its vertical rhythm from a design board that
// carried a single desktop measurement (32px) instead of the site's spacing
// primitives, so the gap had to be hand-corrected to `pt-6 md:pt-12 lg:pt-14`.
// A one-off correction drifts; this script measures the rendered result against
// the primitives in `lib/rhythm.ts` so the next page starts from a number, not
// from a board.
//
// WHAT IT REPORTS, per page and per viewport (390x844, 768x1024, 1440x900,
// deviceScaleFactor 1):
//   1. vertical rhythm — every top-level content block inside <main> (the fixed
//      navbar is skipped) with its box bounds, then for each adjacent pair:
//      bottom(prev), top(next) and the resulting gap, including the page
//      spacers that sit between them and how tall they rendered;
//   2. type scale — fontSize / lineHeight / letterSpacing of the headings and
//      of the first card title, plus the Tailwind classes that produce them;
//   3. primitive usage — whether the catalogue DOM carries the class strings
//      from `lib/rhythm.ts` (SECTION_GAP, SECTION_GAP_HALF and every
//      PAGE_SPACER_CLASSES entry).
//
// WHAT IS ASSERTED: the gap between two blocks must be exactly the height of the
// primitive spacers that sit between them, and that height must be 0 or a
// rhythm value for the viewport. Ad-hoc vertical padding is REPORTED (pt/pb per
// block, plus a summary of non-primitive values) but not asserted: a section may
// own its spacing instead of using a page spacer — that is the SECTION_GAP_Y
// case in the contract, not a defect.
//
// EXIT CODES: 0 = every gap explains itself; 1 = at least one gap does not (or a
// measurement could not be taken); 2 = no server answering at the base URL.
//
// Usage: node scripts/measure-rhythm.mjs [--url http://localhost:<port>]
// The base URL is resolved by scripts/audit-base.mjs (never hardcoded): start
// the production build with `pnpm build && pnpm start --port 3000` — or the next
// free port and pass it with --url — then run this script with the same --url,
// and stop the server when done.
import { resolveBase } from "./audit-base.mjs";

// lib/rhythm.ts is the single source of the spacing tokens: read them, do not
// restate them. Node strips the TS types, but the repo package has no
// "type": "module", so Node double-parses the file and emits a
// MODULE_TYPELESS_PACKAGE_JSON warning. Only that warning is filtered.
const emitWarning = process.emitWarning;
process.emitWarning = function filtered(warning, ...rest) {
  const code = typeof warning === "object" && warning ? warning.code : rest[0]?.code;
  const text = typeof warning === "string" ? warning : (warning?.message ?? "");
  if (code === "MODULE_TYPELESS_PACKAGE_JSON" || text.includes("MODULE_TYPELESS_PACKAGE_JSON")) return;
  return emitWarning.call(process, warning, ...rest);
};
const rhythm = await import("../lib/rhythm.ts");
process.emitWarning = emitWarning;

let BASE;
try {
  BASE = await resolveBase("measure-rhythm");
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const VIEWPORTS = [
  { name: "mobile 390x844", width: 390, height: 844 },
  { name: "tablet 768x1024", width: 768, height: 1024 },
  { name: "desktop 1440x900", width: 1440, height: 900 },
];

// Rendered height a Tailwind spacing utility resolves to (`h-24` → 96px,
// `md:h-32` → 128px). `md:` is the 768px breakpoint, `h-N` = N * 0.25rem.
const MD_BREAKPOINT = 768;
const SPACING_UNIT = 4;

function heightFromClasses(cls, width) {
  const s = String(cls);
  const mdToken = /(?:^|\s)md:h-(\d+(?:\.\d+)?)(?:\s|$)/.exec(s);
  const baseToken = /(?:^|\s)h-(\d+(?:\.\d+)?)(?:\s|$)/.exec(s.replace(/(?:^|\s)md:h-\S+/g, " "));
  const token = width >= MD_BREAKPOINT ? (mdToken || baseToken) : baseToken;
  return token ? Number(token[1]) * SPACING_UNIT : 0;
}

const GAP_FULL = heightFromClasses(rhythm.SECTION_GAP, 0);
const GAP_FULL_MD = heightFromClasses(rhythm.SECTION_GAP, MD_BREAKPOINT);
const GAP_HALF = heightFromClasses(rhythm.SECTION_GAP_HALF, 0);
const GAP_HALF_MD = heightFromClasses(rhythm.SECTION_GAP_HALF, MD_BREAKPOINT);

/** Gaps a page may show between two top-level blocks: none, the full gap, or the half contact splits into. */
function allowedGaps(width) {
  const full = width >= MD_BREAKPOINT ? GAP_FULL_MD : GAP_FULL;
  const half = width >= MD_BREAKPOINT ? GAP_HALF_MD : GAP_HALF;
  return { full, half, allowed: [0, half, full] };
}

const round1 = (n) => Math.round(n * 10) / 10;
const pad = (s, n) => String(s).padEnd(n);
const clip = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));

// ---------------------------------------------------------------------------
// Type-scale roles. A role names the selector that owns it on that page; a role
// with no node is reported as ABSENT instead of silently skipped, because the
// featured heading legitimately does not exist on the catalogue.
// ---------------------------------------------------------------------------
const PAGES = [
  {
    path: "/",
    label: "home  /",
    roles: [
      { key: "all-projects heading", selector: "h2#all-projects-heading" },
      { key: "first card title", selector: "#all-projects h3[id^='project-title-']" },
      { key: "featured section heading", selector: "h2#featured-projects-label" },
    ],
  },
  {
    path: "/proyectos",
    label: "catalogue  /proyectos",
    roles: [
      { key: "catalogue page heading", selector: "main h1" },
      { key: "first group heading", selector: "main h2[id^='catalog-group-']" },
      { key: "first card title", selector: "h3[id^='project-title-']" },
      // The featured block does not exist here, so it is not a role to measure:
      // ABSENT keeps meaning "a role that should exist is missing".
    ],
  },
];

// Primitive class strings defined in lib/rhythm.ts, in report order.
const PRIMITIVES = [
  { name: "SECTION_GAP", cls: rhythm.SECTION_GAP },
  { name: "SECTION_GAP_HALF", cls: rhythm.SECTION_GAP_HALF },
  ...Object.entries(rhythm.PAGE_SPACER_CLASSES).map(([pair, cls]) => ({
    name: `PAGE_SPACER_CLASSES.${pair}`,
    cls,
  })),
];

// ---------------------------------------------------------------------------
// Browser: probe before assuming. A chromium-only assumption dies with a bare
// "executable doesn't exist" wherever only another engine is installed.
// ---------------------------------------------------------------------------
const playwright = await import("playwright");
const candidates = [
  { name: "chromium", type: playwright.chromium },
  { name: "webkit", type: playwright.webkit },
];

async function launchBrowser() {
  const failures = [];
  for (const candidate of candidates) {
    try {
      const browser = await candidate.type.launch({ headless: true });
      return { browser, name: `${candidate.name} ${browser.version()}` };
    } catch (error) {
      failures.push(`${candidate.name}: ${String(error.message).split("\n")[0]}`);
    }
  }
  throw new Error(`no Playwright browser could launch:\n  ${failures.join("\n  ")}`);
}

/** Runs inside the page. Receives everything it needs through `arg`. */
function measureInPage({ roles, primitivesToScan }) {
  const main = document.querySelector("main");
  if (!main) return { error: "no <main> on the page" };

  const textOf = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height };
  };
  const numeric = (el, prop) => {
    const v = parseFloat(getComputedStyle(el)[prop]);
    return Number.isFinite(v) ? v : 0;
  };
  const label = (el) => {
    if (el.id) return `#${el.id}`;
    // No id: name the block by the first heading it renders (the catalog index
    // section has no id, and its raw text starts with the first card).
    const heading = el.querySelector("h1, h2, h3");
    const text = heading ? textOf(heading) : textOf(el);
    if (text) return `${el.tagName.toLowerCase()} "${text.slice(0, 26)}${text.length > 26 ? "…" : ""}"`;
    return el.tagName.toLowerCase();
  };
  // A rhythm spacer is a text-less node whose subtree holds nothing but other
  // text-less/aria-hidden nodes: SectionSpacing (`aria-hidden`) and the
  // conditional PageSpacing wrapper around it (which may collapse to 0px in
  // landscape). Descendant text never belongs to a spacer.
  const isSpacer = (el) => {
    if (textOf(el) !== "") return false;
    if (el.getAttribute("aria-hidden") === "true") return true;
    return Array.from(el.querySelectorAll("*")).every(
      (child) => child.getAttribute("aria-hidden") === "true" || textOf(child) === ""
    );
  };

  const blocks = [];
  const spacers = [];
  for (const el of Array.from(main.children)) {
    // The navbar and the scroll-progress bar are `position: fixed` overlays:
    // not part of the vertical rhythm. Skipped by computed position, so a new
    // overlay is skipped without touching this script.
    if (getComputedStyle(el).position === "fixed") continue;
    const metrics = box(el);
    if (isSpacer(el)) {
      spacers.push({ ...metrics, cls: String(el.className) });
      continue;
    }
    blocks.push({
      ...metrics,
      label: label(el),
      tag: el.tagName.toLowerCase(),
      paddingTop: numeric(el, "paddingTop"),
      paddingBottom: numeric(el, "paddingBottom"),
    });
  }

  const gaps = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const a = blocks[i];
    const b = blocks[i + 1];
    const between = spacers.filter(
      (s) => s.top >= a.bottom - 0.5 && s.bottom <= b.top + 0.5 && s.height > 0
    );
    gaps.push({
      from: a.label,
      to: b.label,
      prevBottom: a.bottom,
      nextTop: b.top,
      gap: b.top - a.bottom,
      spacers: between.map((s) => ({ cls: s.cls, height: Math.round(s.height * 10) / 10 })),
    });
  }

  // Type scale: first matching node per role, with the typographic class tokens
  // that produce the computed values (Tailwind resolves them at build time, so
  // the class names — plus the fluid custom property they point at — are the
  // only durable provenance).
  const typeRows = roles.map((role) => {
    const el = document.querySelector(role.selector);
    if (!el) return { key: role.key, selector: role.selector, found: false };
    const cs = getComputedStyle(el);
    const tokens = String(el.className || "").split(/\s+/).filter(Boolean);
    const typographic = tokens.filter((t) => /^(?:text-|leading-|tracking-|font-|uppercase)/.test(t));
    const fluidVars = typographic
      .filter((t) => /^text-fluid-/.test(t))
      .map((t) => ({ name: `--${t}`, value: cs.getPropertyValue(`--${t}`).trim() }))
      .filter((v) => v.value);
    return {
      key: role.key,
      selector: role.selector,
      found: true,
      tag: el.tagName.toLowerCase(),
      fontSize: numeric(el, "fontSize"),
      lineHeight: numeric(el, "lineHeight"),
      letterSpacing: numeric(el, "letterSpacing"),
      fontWeight: cs.fontWeight,
      textTransform: cs.textTransform,
      fontFamily: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
      typographic,
      fluidVars,
      text: textOf(el).slice(0, 40),
    };
  });

  // Primitive usage: a class string is carried when one element's token list
  // contains every whitespace-separated token of it.
  const primitives = primitivesToScan.map(({ name, cls }) => {
    if (!cls) return { name, cls, state: "empty", count: 0, example: null };
    const tokens = cls.split(/\s+/).filter(Boolean);
    const hits = Array.from(document.querySelectorAll("*")).filter((el) => {
      const own = new Set(String(el.className || "").split(/\s+/).filter(Boolean));
      return tokens.every((t) => own.has(t));
    });
    return {
      name,
      cls,
      state: hits.length ? "present" : "absent",
      count: hits.length,
      example: hits.length ? hits[0].tagName.toLowerCase() : null,
    };
  });

  return {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio,
    blocks,
    gaps,
    typeRows,
    primitives,
  };
}

const { browser, name: browserName } = await launchBrowser();
console.log(`measure-rhythm   base=${BASE}   browser=${browserName}`);
console.log(
  `primitives  SECTION_GAP ("${rhythm.SECTION_GAP}") = ${GAP_FULL}px / ${GAP_FULL_MD}px · ` +
    `SECTION_GAP_HALF ("${rhythm.SECTION_GAP_HALF}") = ${GAP_HALF}px / ${GAP_HALF_MD}px (mobile / ≥${MD_BREAKPOINT}px)`
);

const failures = [];
const primitiveReports = [];

for (const pageDef of PAGES) {
  console.log(`\n===== ${pageDef.label} =====`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  let primitivesPrinted = false;

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}${pageDef.path}`, { waitUntil: "networkidle" });
    // Same settle as scripts/section-spacing.mjs: let GSAP/ScrollTrigger apply
    // its heights and the CSS Reveal family finish before reading boxes.
    await page.waitForTimeout(1200);

    const data = await page.evaluate(measureInPage, {
      roles: pageDef.roles,
      primitivesToScan: PRIMITIVES,
    });

    console.log(`\n--- ${vp.name} · viewport ${data.viewport ?? "?"} · dpr ${data.dpr ?? "?"} ---`);
    if (data.error) {
      console.log(`  MEASUREMENT FAILED: ${data.error}`);
      failures.push({ page: pageDef.label, viewport: vp.name, reason: data.error });
      continue;
    }

    console.log("  blocks (in flow, <main> children; fixed overlays skipped)");
    data.blocks.forEach((b, i) => {
      console.log(
        `    ${String(i + 1).padStart(2)}  ${pad(clip(b.tag, 7), 8)} ${pad(clip(b.label, 44), 46)} y ${pad(Math.round(b.top), 6)}..${pad(Math.round(b.bottom), 6)} h=${pad(Math.round(b.height), 5)} pt=${pad(Math.round(b.paddingTop), 4)} pb=${Math.round(b.paddingBottom)}`
      );
    });

    const primitivePx = new Set([0, GAP_FULL, GAP_FULL_MD, GAP_HALF, GAP_HALF_MD]);
    const offGrid = data.blocks.filter(
      (b) => !primitivePx.has(Math.round(b.paddingTop)) || !primitivePx.has(Math.round(b.paddingBottom))
    );
    console.log("  vertical padding of each block (reported, not asserted)");
    if (!offGrid.length) {
      console.log(`    every block pt/pb is 0 or a rhythm value (${[...primitivePx].join(" / ")}px)`);
    } else {
      for (const b of offGrid) {
        console.log(
          `    ${pad(clip(b.label, 44), 46)} pt=${pad(Math.round(b.paddingTop), 4)} pb=${pad(Math.round(b.paddingBottom), 4)} (rhythm values: ${[...primitivePx].join(" / ")}px)`
        );
      }
    }

    console.log("  gaps (bottom(prev) → top(next))");
    for (const g of data.gaps) {
      const spacerSum = g.spacers.reduce((sum, s) => sum + s.height, 0);
      const { full, half, allowed } = allowedGaps(vp.width);
      const spacerText = g.spacers.length
        ? `via ${g.spacers.map((s) => `"${clip(s.cls, 60)}"=${s.height}px`).join(" + ")}`
        : "no spacer";
      console.log(
        `    ${pad(clip(g.from, 44), 46)} → ${pad(clip(g.to, 44), 46)} ${pad(Math.round(g.prevBottom), 6)} → ${pad(Math.round(g.nextTop), 6)} = ${pad(`${Math.round(g.gap)}px`, 7)} ${spacerText}`
      );
      const extra = round1(g.gap - spacerSum);
      if (Math.abs(extra) > 0.5) {
        failures.push({
          page: pageDef.label,
          viewport: vp.name,
          reason: `${g.from} → ${g.to}: ${Math.round(g.gap)}px gap, ${spacerSum}px from spacers — ${extra}px unattributed (allowed ${allowed.join(" / ")})`,
        });
        console.log(`      x UNATTRIBUTED: ${extra}px beyond the primitive spacers (allowed ${allowed.join(" / ")})`);
      } else if (!allowed.includes(spacerSum)) {
        failures.push({
          page: pageDef.label,
          viewport: vp.name,
          reason: `${g.from} → ${g.to}: ${spacerSum}px is not a rhythm primitive (allowed ${allowed.join(" / ")})`,
        });
        console.log(`      x NOT A PRIMITIVE: ${spacerSum}px (allowed ${allowed.join(" / ")}; full=${full}, half=${half})`);
      }
    }

    console.log("  type scale");
    for (const r of data.typeRows) {
      if (!r.found) {
        console.log(`    ${pad(r.key, 26)} ABSENT  (selector ${r.selector})`);
        failures.push({
          page: pageDef.label,
          viewport: vp.name,
          reason: `type role "${r.key}" not found via ${r.selector}`,
        });
        continue;
      }
      console.log(
        `    ${pad(r.key, 26)} ${pad(r.tag, 4)} size=${pad(`${round1(r.fontSize)}px`, 8)} lh=${pad(`${round1(r.lineHeight)}px`, 8)} ls=${pad(`${round1(r.letterSpacing)}px`, 8)} ${pad(r.fontFamily, 10)} w${r.fontWeight}${r.textTransform === "uppercase" ? " UPPER" : ""}`
      );
      console.log(`      classes: ${r.typographic.join(" ") || "(none)"}`);
      if (r.fluidVars.length) {
        console.log(`      ${r.fluidVars.map((v) => `${v.name} = ${v.value}`).join(" · ")}`);
      }
      console.log(`      text: "${r.text}"`);
    }

    // Primitive usage is DOM-level, not viewport-level: print it once per page.
    if (pageDef.path === "/proyectos" && !primitivesPrinted) {
      primitivesPrinted = true;
      const nameWidth = Math.max(...data.primitives.map((p) => p.name.length)) + 2;
      const clsWidth = Math.max(...data.primitives.map((p) => p.cls.length));
      console.log("  primitive usage on /proyectos (class strings from lib/rhythm.ts)");
      for (const p of data.primitives) {
        const value =
          p.state === "empty"
            ? "n/a (empty string = 'no conditional wrapper'; nothing to carry)"
            : `${p.state}${p.count ? ` x${p.count}` : ""}${p.example ? ` (e.g. <${p.example}>)` : ""}`;
        console.log(`    ${pad(p.name, nameWidth)} ${pad(`"${p.cls}"`, clsWidth + 2)} ${value}`);
      }
    }
    if (pageDef.path === "/proyectos" && !primitiveReports.length) {
      primitiveReports.push(...data.primitives);
    }
  }

  await page.close();
}

await browser.close();

const present = primitiveReports.filter((p) => p.state === "present").map((p) => p.name);
console.log(
  `\nprimitive usage on /proyectos: ${present.length ? present.join(", ") : "none — no rhythm primitive class is carried"}`
);

if (failures.length) {
  console.log(`\nMISMATCH (${failures.length}):`);
  for (const f of failures) console.log(`  x ${f.page} @ ${f.viewport}: ${f.reason}`);
  console.log("\nFAIL");
  process.exit(1);
}
console.log("\nOK - every measured gap is 0 or an exact rhythm primitive.");
