// QA screenshots + horizontal-overflow checks for the featured stack.
//
// Requires (once): pnpm add -D playwright && npx playwright install chromium
//
// Usage:
//   node scripts/shots.mjs                             # all viewports
//   node scripts/shots.mjs --vp 1024x768 --vp 390x844  # a subset
//   node scripts/shots.mjs --url http://localhost:3001
//
// For each viewport it lands on #proyectos and captures 5 stops along the
// stacking scroll range (0/25/50/75/100%), printing whether the page has any
// horizontal overflow at each stop (the phantom-scrollbar check).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "shots");

const args = process.argv.slice(2);
const pick = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const url = pick("--url", process.env.BASE_URL || "http://localhost:3001");
const viewports = args.includes("--vp")
  ? args
      .filter((a, i) => args[i - 1] === "--vp")
      .map((vp) => {
        const [width, height] = vp.split("x").map(Number);
        return { width, height, label: `${width}x${height}` };
      })
  : [
      { width: 1440, height: 900, label: "desktop" },
      { width: 1024, height: 768, label: "gate-min" },
      { width: 900, height: 700, label: "below-gate" },
      { width: 390, height: 844, label: "mobile" },
    ];

mkdirSync(outDir, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(3, "0");

async function captureStack(page, vp) {
  const name = vp.label;
  const prefix = `${vp.label}-${vp.width}x${vp.height}`;

  await page.evaluate(() => {
    const el = document.querySelector(".featured-section");
    if (!el) throw new Error(".featured-section not found");
    el.scrollIntoView();
  });
  await wait(1200); // let the GSAP pin settle

  // Scroll range of the stacking animation: the pin-spacer owns the real
  // height when the stack is pinned; the section itself only when it isn't.
  const range = await page.evaluate(() => {
    const el = document.querySelector(".featured-section");
    const spacer = document.querySelector(".pin-spacer");
    const anchor = spacer || el;
    const top = anchor.getBoundingClientRect().top + window.scrollY;
    const max = top + anchor.offsetHeight - innerHeight;
    return { start: Math.round(top), end: Math.round(max) };
  });

  for (const pct of [0, 25, 50, 75, 100]) {
    const target = range.start + ((range.end - range.start) * pct) / 100;
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(target));
    await wait(900); // scrub settles

    const report = await page.evaluate(() => ({
      xOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      scrollTop: Math.round(window.scrollY),
    }));

    console.log(
      `  [${name} ${String(pct).padStart(3, "0")}%] ` +
        `scrollTop=${report.scrollTop} overflow-x=${report.xOverflow > 0 ? "OVERFLOW-X" + report.xOverflow : "ok"}`
    );

    await page.screenshot({
      path: resolve(outDir, `${prefix}-${pad(pct)}.png`),
    });
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
  console.log(`\n== ${vp.label} (${vp.width}x${vp.height}) ==`);
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await wait(1500); // hydration + matchMedia state
  await captureStack(page, vp);
  await page.close();
}
await browser.close();
console.log(`\nScreenshots -> ${outDir}`);