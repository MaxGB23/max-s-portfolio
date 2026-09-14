// Audit the project detail page: effective widths of section containers
// (max-w-*) and computed typography (fluid tokens) across viewports.
//
// Usage:
//   node scripts/audit-detail.mjs [--url http://localhost:3001] [--slug caf] [--vp 1440x900 ...]
// Requires the dev server running (pnpm dev --port 3001).
import { chromium } from "playwright";

const args = process.argv.slice(2);
const pick = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const url = pick("--url", process.env.BASE_URL || "http://localhost:3001");
const slug = pick("--slug", "caf");
const viewports = args.includes("--vp")
  ? args
      .filter((a, i) => args[i - 1] === "--vp")
      .map((vp) => {
        const [width, height] = vp.split("x").map(Number);
        return { width, height };
      })
  : [
      { width: 1440, height: 900 },
      { width: 1024, height: 768 },
      { width: 390, height: 844 },
    ];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// One evaluate pass: layouts + typography of every debug-level container and
// every fluid/heading text element in the detail page.
const AUDIT_JS = () => {
  const sum = (el) => {
    const r = el.getBoundingClientRect();
    return {
      w: Math.round(r.width),
      left: Math.round(r.left),
      right: Math.round(r.right),
      overX: el.scrollWidth - el.clientWidth,
    };
  };
  const containers = [...document.querySelectorAll("main [class*='debug-l'], main [class*='max-w-']")]
    .filter((el) => el !== undefined)
    .slice(0, 60)
    .map((el) => {
      const cls = [...el.classList]
        .filter((c) => c.includes("debug-l") || c.includes("max-w-"))
        .join(" ");
      const tag = el.tagName.toLowerCase();
      const short = cls || tag;
      if (cls.includes("debug-l4") || cls.includes("debug-l3")) {
        // leaf/block nodes: only report containers that hold layout, skip tiny leaves
        if (el.children.length === 0) return null;
      }
      const label = el.id ? `#${el.id}` : "";
      return { label: `${tag} ${label} ${short}`.trim(), ...sum(el) };
    })
    .filter(Boolean);

  const texts = [...document.querySelectorAll("main h1, main h2, main h3, main [class*='text-fluid-']")]
    .filter((el) => {
      // skip icon-font elements; keep real text nodes
      const t = (el.textContent || "").trim();
      return t.length > 0 && !el.closest("[aria-hidden='true']");
    })
    .slice(0, 40)
    .map((el) => {
      const cs = getComputedStyle(el);
      const cls = [...el.classList].filter((c) => c.includes("text-fluid-")).join(" ") || el.tagName.toLowerCase();
      const text = (el.textContent || "").trim().replace(/\s+/g, " ");
      return {
        label: cls,
        text: text.length > 42 ? text.slice(0, 42) + "…" : text,
        fs: cs.fontSize,
        lh: cs.lineHeight,
        fw: cs.fontWeight,
        fam: cs.fontFamily.split(",")[0].trim(),
        ...sum(el),
      };
    });

  return {
    containers,
    texts,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
};

const pad = (s, n) => String(s).padEnd(n, " ");

function print(vp, audit) {
  console.log(`\n== ${vp.width}x${vp.height} ==`);
  console.log(`overflow-x: ${audit.overflowX > 0 ? "OVERFLOW-X " + audit.overflowX : "ok"}`);

  console.log("\n-- containers --");
  for (const c of audit.containers) {
    console.log(
      `  ${pad(c.label, 58)} w=${c.w}  L=${c.left} R=${c.right}${c.overX > 0 ? ` overX=${c.overX}` : ""}`
    );
  }

  console.log("\n-- typography --");
  for (const t of audit.texts) {
    console.log(
      `  ${pad(t.label, 28)} fs=${pad(t.fs, 7)} lh=${pad(t.lh, 7)} fw=${pad(t.fw, 4)} ${pad(t.fam, 22)} w=${t.w}  "${t.text}"`
    );
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch (e) {
    console.warn(`[browser fallback] ${String(e.message).split("\n")[0]}`);
    return await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
  }
}

const browser = await launchBrowser();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const target = `${url}/proyectos/${slug}`;
  await page.goto(target, { waitUntil: "networkidle", timeout: 60000 });
  await wait(1800); // hydration + reveal animations
  const audit = await page.evaluate(AUDIT_JS);
  print(vp, audit);
  await page.close();
}
await browser.close();