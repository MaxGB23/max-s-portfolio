// Type-scale audit: real computed font sizes per typographic role.
// Usage: node scripts/type-scale.mjs  (dev server must be on :3001)
import { chromium } from "playwright";

const BASE = "http://localhost:3001";

const measures = [
  { label: "hero h1 (display)",                 selector: ".hero-title", token: "--text-fluid-display" },
  { label: "section h2 (first)",                selector: "h2[class*='text-fluid-section']", token: "--text-fluid-section" },
  { label: "about title (section)",             selector: ".about-title", token: "--text-fluid-section" },
  { label: "featured card title",               selector: "[class*='text-fluid-featured']", token: "--text-fluid-featured" },
  { label: "pricing plan name",                 selector: "[aria-label$=' plan'] h3.font-serif", token: "--text-fluid-card" },
  { label: "pricing price",                     selector: "[aria-label$=' plan'] [class*='text-fluid-price']", token: "--text-fluid-price" },
  { label: "pricing feature li",                selector: "[aria-label$=' plan'] li", token: "--text-fluid-card-body" },
  { label: "pricing desc",                      selector: "[aria-label$=' plan'] p", token: "--text-fluid-card-body" },
  { label: "card title (grid)",                 selector: "#project-title-one-click-ti", token: "--text-fluid-card" },
  { label: "card body (grid)",                  selector: ".line-clamp-3", token: "--text-fluid-card-body" },
  { label: "eyebrow (hero label)",              selector: ".hero-label", token: "--text-fluid-eyebrow" },
  { label: "hero description (body)",           selector: ".hero-description", token: "--text-fluid-body" },
  { label: "CTA v2 h3 (section call)",          selector: "h2[class*='text-fluid-section'] + * .text-fluid-card", token: "--text-fluid-card" },
];

const viewports = [
  { name: "mobile 390", width: 390, height: 844 },
  { name: "desktop 1280", width: 1280, height: 800 },
  { name: "wide 1920", width: 1920, height: 1080 },
];

function formatRow(r) {
  if (!r.found) return `  ${r.label.padEnd(38)} NOT FOUND`;
  const upper = r.uppercase ? " UPPER" : "";
  return `  ${r.label.padEnd(38)} ${String(r.fontSize.toFixed(1)).padStart(6)}px  lh ${String(r.lineHeight.toFixed(1)).padStart(6)}px  w${r.weight}${upper}`;
}

const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: true,
});

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const rows = await page.evaluate((ms) => {
    const out = [];
    for (const m of ms) {
      const nodes = Array.from(document.querySelectorAll(m.selector)).filter(
        (el) => el.offsetParent !== null || el.getBoundingClientRect().height > 0
      );
      if (nodes.length === 0) {
        out.push({ label: m.label, token: m.token, found: false });
        continue;
      }
      const el = nodes[0];
      const cs = getComputedStyle(el);
      out.push({
        label: m.label,
        token: m.token,
        found: true,
        fontSize: parseFloat(cs.fontSize),
        lineHeight: parseFloat(cs.lineHeight),
        weight: cs.fontWeight,
        uppercase: cs.textTransform === "uppercase",
      });
    }
    return out;
  }, measures);
  console.log(`\n==== ${vp.name} ====`);
  for (const r of rows) console.log(formatRow(r));
  await page.close();
}

// Detail page at 1280
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${BASE}/proyectos/caf`, { waitUntil: "networkidle" });
  const rows = await page.evaluate(() => {
    const grab = (selector, label) => {
      const el = document.querySelector(selector);
      if (!el) return { label, found: false };
      const cs = getComputedStyle(el);
      return { label, found: true, fontSize: parseFloat(cs.fontSize), lineHeight: parseFloat(cs.lineHeight), weight: cs.fontWeight };
    };
    return [
      { ...grab("h1[class*='text-fluid-detail']", "detail h1 (title)"), token: "--text-fluid-detail" },
      { ...grab("h2[class*='text-fluid-subheading']", "detail h2 (subheading)"), token: "--text-fluid-subheading" },
      { ...grab("section[class*='detail-hero'] p[class*='text-fluid-body']", "detail hero body"), token: "--text-fluid-body" },
    ];
  });
  console.log(`\n==== detail /proyectos/caf @1280 ====`);
  for (const r of rows) {
    console.log(`  ${r.label.padEnd(38)} ${r.found ? String(r.fontSize.toFixed(1)).padStart(6) + "px  lh " + String(r.lineHeight.toFixed(1)).padStart(6) + "px  w" + r.weight : "NOT FOUND"}  ${r.token}`);
  }
  await page.close();
}

await browser.close();
console.log("\nDone.");