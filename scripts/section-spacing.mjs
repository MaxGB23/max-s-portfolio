// Section-spacing audit: real inter-section gaps per viewport.
// Usage: node scripts/section-spacing.mjs  (dev server must be on :3001)
import { chromium } from "playwright";

const BASE = "http://localhost:3001";

// Sections in document order as rendered by app/page.tsx.
const sections = [
  { label: "Hero",        selector: "#inicio" },
  { label: "About",       selector: "#sobre-mi" },
  { label: "Projects",    selector: "#proyectos" },        // featured (GSAP pin excepción)
  { label: "All projects",selector: "#all-projects" },
  { label: "Pricing",     selector: "#precios" },
  { label: "Contact",     selector: "#contacto" },
  { label: "Footer",      selector: "#footer" },
];

const viewports = [
  { name: "mobile 390",        width: 390,  height: 844 },
  { name: "tablet 768",        width: 768,  height: 1024 },
  { name: "tablet portrait 810", width: 810,  height: 1080 },
  { name: "tablet portrait 820", width: 820,  height: 1180 },  // iPad Air
  { name: "tablet portrait 834", width: 834,  height: 1112 },  // iPad 10.2"
  { name: "iPad Pro portrait 1024", width: 1024, height: 1366 }, // cruza el umbral del pin GSAP
  { name: "desktop 1280",      width: 1280, height: 800 },
  { name: "wide 1920",         width: 1920, height: 1080 },
];

function attr(el, prop) {
  const v = parseFloat(getComputedStyle(el)[prop]);
  return Number.isFinite(v) ? v : 0;
}

const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: true,
});

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  // ESPERAR a que GSAP/ScrollTrigger apliquen alturas (min-h-screen, pin, etc.)
  await page.waitForTimeout(1200);

  const data = await page.evaluate((sections) => {
    const attrOf = (el, prop) => {
      const v = parseFloat(getComputedStyle(el)[prop]);
      return Number.isFinite(v) ? v : 0;
    };
    const out = [];
    for (const s of sections) {
      const el = document.querySelector(s.selector);
      if (!el) {
        out.push({ ...s, found: false });
        continue;
      }
      const rect = el.getBoundingClientRect();
      out.push({
        ...s,
        found: true,
        // Posición absoluta en el documento (independiente del scroll en curso)
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        height: rect.height,
        paddingTop: attrOf(el, "paddingTop"),
        paddingBottom: attrOf(el, "paddingBottom"),
        marginTop: attrOf(el, "marginTop"),
      });
    }
    return out;
  }, sections);

  console.log(`\n==== ${vp.name} ====`);
  const present = data.filter((d) => d.found);
  if (present.length === 0) {
    console.log("  NO SECTIONS FOUND — ¿server en :3001?");
    await page.close();
    continue;
  }

  // Por sección: bounds + paddings propios (si el elemento tiene padding vertical interno)
  for (const d of present) {
    console.log(
      `  ${d.label.padEnd(13)} y=${String(Math.round(d.top)).padStart(5)}..${String(Math.round(d.bottom)).padStart(5)} h=${String(Math.round(d.height)).padStart(5)} pt=${Math.round(d.paddingTop)} pb=${Math.round(d.paddingBottom)} mt=${Math.round(d.marginTop)}`
    );
  }

  // Gap REAL entre cajas: bottom(A) → top(B). Los paddings viven DENTRO de la
  // caja, así que el gap de cajas = márgenes/saltos externos (spacers, mt, wrappers).
  console.log("  ─ gap entre cajas (lo que muestra layout debug) ─");
  for (let i = 0; i < present.length - 1; i++) {
    const a = present[i];
    const b = present[i + 1];
    const gap = b.top - a.bottom;                       // externo (margins + intermedios)
    const internal = a.paddingBottom + b.paddingTop;    // dentro de las cajas
    const whitespace = gap + internal;                  // blanco visual total entre contenidos
    console.log(
      `  ${a.label.padEnd(13)} → ${b.label.padEnd(13)} cajas=${String(Math.round(gap)).padStart(5)}px externo | interno=${String(Math.round(internal)).padStart(5)}px (pbA${Math.round(a.paddingBottom)}+ptB${Math.round(b.paddingTop)}) | blanco total=${String(Math.round(whitespace)).padStart(5)}px`
    );
  }
  await page.close();
}

await browser.close();
console.log("\nDone.");