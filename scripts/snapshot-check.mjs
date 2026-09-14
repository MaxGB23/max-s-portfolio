// READ-ONLY verification: line-clamp behavior of all-projects card descriptions
// and computed typography of the pricing section (desktop + mobile).
//
// Usage:
//   node scripts/snapshot-check.mjs [--url http://localhost:3001]
// Requires the dev server running (pnpm dev --port 3001).
// Uses the system Chrome channel fallback (Playwright's own Chromium is not
// downloaded here) — same launch pattern as scripts/audit-detail.mjs.
import { chromium } from "playwright";
import { mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const args = process.argv.slice(2);
const pick = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const url = pick("--url", process.env.BASE_URL || "http://localhost:3001");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(scriptDir, "..", "shots");
mkdirSync(SHOTS, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// --- launch: copy of audit-detail.mjs pattern (system Chrome fallback) ---
async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch (e) {
    console.warn(`[browser fallback] ${String(e.message).split("\n")[0]}`);
    return await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome", headless: true });
  }
}

// --- page-side measurements -------------------------------------------------

const MEASURE_CARDS = () =>
  [...document.querySelectorAll("#all-projects-content p.line-clamp-3")].map((p, i) => {
    const cs = getComputedStyle(p);
    const card = p.closest("article");
    const titleEl = card && card.querySelector("h3");
    return {
      index: i,
      title: titleEl ? titleEl.textContent.trim() : "(no title)",
      text: (p.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48),
      fontFamily: cs.fontFamily.split(",")[0].trim(),
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      display: cs.display,
      webkitLineClamp: cs.webkitLineClamp,
      webkitBoxOrient: cs.webkitBoxOrient,
      overflow: cs.overflow,
      height: cs.height,
      minHeight: cs.minHeight,
      scrollHeight: p.scrollHeight,
      clientHeight: p.clientHeight,
      overflowVisible: p.scrollHeight > p.clientHeight,
      fourthLineVisible: p.scrollHeight - p.clientHeight > 1,
    };
  });

// Per-card pricing measure (runs inside page context).
// eslint-disable-next-line no-unused-vars
const MEASURE_PRICING = (highlightOnly) => {
  const cards = [...document.querySelectorAll("article[aria-label$=\" plan\"]")];
  const target = highlightOnly
    ? cards.filter((c) => c.closest(".pricing-highlighted"))
    : cards;
  const sel = highlightOnly ? (target.length ? target : [cards[0]]) : cards;

  return sel.map((card) => {
    const label = card.getAttribute("aria-label");
    const csOf = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily.split(",")[0].trim(),
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
      };
    };
    const name = card.querySelector("h3");
    const price = [...card.querySelectorAll("span")].find((s) =>
      [...s.classList].some((c) => c.includes("font-black"))
    );
    const desde = [...card.querySelectorAll("span")].find(
      (s) => (s.textContent || "").trim().toLowerCase() === "desde"
    );
    const features = [...card.querySelectorAll("li span")].slice(0, 2);
    const fluidPrice = card.querySelector('[class*="text-fluid-price"]');

    return {
      label,
      highlighted: !!card.closest(".pricing-highlighted"),
      nameText: name ? name.textContent.trim() : null,
      name: csOf(name),
      price: csOf(price),
      priceText: price ? price.textContent.trim() : null,
      desde: csOf(desde),
      feature1: csOf(features[0]),
      feature1Text: features[0] ? features[0].textContent.trim() : null,
      feature2: csOf(features[1]),
      feature2Text: features[1] ? features[1].textContent.trim() : null,
      fluidPriceFound: !!fluidPrice,
      fluidPriceClass: fluidPrice ? fluidPrice.className : null,
      fluidPriceFontSize: fluidPrice ? getComputedStyle(fluidPrice).fontSize : null,
    };
  });
};

// --- report helpers ---------------------------------------------------------

const t = (rows, headers) => {
  const esc = (s) => String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
  const h = headers.map(esc);
  const body = rows.map((r) => r.map(esc));
  const widths = headers.map((_, i) => Math.max(h[i].length, ...body.map((r) => r[i].length)));
  const line = (cells) => "| " + cells.map((c, i) => c.padEnd(widths[i])).join(" | ") + " |";
  const sep = "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|";
  return [line(h), sep, ...body.map(line)].join("\n");
};

const shots = [];
function shotReport(rel, buf) {
  const abs = path.join(SHOTS, rel);
  const size = statSync(abs).size;
  shots.push({ rel, abs, bytes: size });
}

// --- main -------------------------------------------------------------------

const browser = await launchBrowser();
try {
  // ============ STEP 2: all-projects cards (desktop 1280x800) ============
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await wait(1800); // hydration + reveal animations

  await page.locator("#all-projects-heading").scrollIntoViewIfNeeded();
  await wait(1500); // let the grid reveal
  const cards = await page.evaluate(MEASURE_CARDS);

  const grid = page.locator("#all-projects-content");
  await grid.scrollIntoViewIfNeeded();
  await wait(600);
  const bufGrid = await grid.screenshot({ path: path.join(SHOTS, "cards-clamp.png") });
  shotReport("cards-clamp.png", bufGrid);

  let zoomShot = null;
  const firstOverflow = cards.find((c) => c.overflowVisible);
  if (firstOverflow) {
    const zoomTarget = page
      .locator("#all-projects-content article.project-card")
      .nth(firstOverflow.index);
    await zoomTarget.scrollIntoViewIfNeeded();
    await wait(600);
    const bufZoom = await zoomTarget.screenshot({ path: path.join(SHOTS, "card-clamp-zoom.png") });
    shotReport("card-clamp-zoom.png", bufZoom);
    zoomShot = firstOverflow;
  }

  // ============ STEP 3: pricing desktop (1280x800) =======================
  await page.locator("#pricing-heading").scrollIntoViewIfNeeded();
  await wait(1500); // reveal animations
  const pricingDesktop = await page.evaluate(MEASURE_PRICING, false);

  const pricingSection = page.locator("section#precios");
  await pricingSection.scrollIntoViewIfNeeded();
  await wait(600);
  const bufPricing = await pricingSection.screenshot({ path: path.join(SHOTS, "pricing.png") });
  shotReport("pricing.png", bufPricing);
  await page.close();

  // ============ STEP 4: pricing mobile (390x844) =========================
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await wait(1800);
  await mobile.locator("#pricing-heading").scrollIntoViewIfNeeded();
  await wait(1500);
  const pricingMobile = await mobile.evaluate(MEASURE_PRICING, true);

  const mobileSection = mobile.locator("section#precios");
  await mobileSection.scrollIntoViewIfNeeded();
  await wait(600);
  const bufMobile = await mobileSection.screenshot({ path: path.join(SHOTS, "pricing-mobile.png") });
  shotReport("pricing-mobile.png", bufMobile);
  await mobile.close();

  // ============ REPORT ====================================================
  const fmt = (v) => (v == null || v === "" ? "-" : v);
  const over = (c) => (c.overflowVisible ? `YES (${c.scrollHeight} > ${c.clientHeight})` : `no (${c.scrollHeight} <= ${c.clientHeight})`);

  const lines = [];
  lines.push("# Snapshot & computed-style verification");
  lines.push("");
  lines.push(`URL: ${url} · Chrome channel: fallback system (` + (process.env.PW_CHANNEL || "chrome") + ")");
  lines.push("");

  lines.push("## Cards — description paragraphs with `line-clamp-3` (`#all-projects-content`)");
  lines.push("");
  lines.push(
    t(
      cards.map((c) => [
        c.index,
        c.title,
        c.fontSize,
        c.lineHeight,
        c.display,
        c.webkitLineClamp,
        c.webkitBoxOrient,
        c.overflow,
        c.height,
        c.minHeight,
        `${c.scrollHeight} vs ${c.clientHeight}`,
        over(c),
        c.fourthLineVisible ? "partial 4th line" : "no",
      ]),
      ["idx", "title", "font-size", "line-height", "display", "-webkit-line-clamp", "-webkit-box-orient", "overflow", "height", "min-height", "scrollHeight vs clientHeight", "overflowVisible", "4th line?"]
    )
  );
  lines.push("");

  const pricingRows = (rows) =>
    rows.flatMap((c) => [
      [c.label, "plan name (h3)", fmt(c.name && c.name.fontSize), fmt(c.name && c.name.fontWeight), fmt(c.name && c.name.lineHeight), fmt(c.name && c.name.fontFamily)],
      [c.label, "price span", fmt(c.price && c.price.fontSize), fmt(c.price && c.price.fontWeight), fmt(c.price && c.price.lineHeight), fmt(c.price && c.price.fontFamily)],
      [c.label, "`desde` label", fmt(c.desde && c.desde.fontSize), fmt(c.desde && c.desde.fontWeight), fmt(c.desde && c.desde.lineHeight), fmt(c.desde && c.desde.fontFamily)],
      [c.label, "feature item 1", fmt(c.feature1 && c.feature1.fontSize), fmt(c.feature1 && c.feature1.fontWeight), fmt(c.feature1 && c.feature1.lineHeight), fmt(c.feature1 && c.feature1.fontFamily)],
      [c.label, "feature item 2", fmt(c.feature2 && c.feature2.fontSize), fmt(c.feature2 && c.feature2.fontWeight), fmt(c.feature2 && c.feature2.lineHeight), fmt(c.feature2 && c.feature2.fontFamily)],
    ]);

  lines.push("## Pricing — computed styles");
  lines.push("");
  lines.push("### Desktop 1280x800");
  lines.push("");
  lines.push(t(pricingRows(pricingDesktop), ["card", "element", "font-size", "font-weight", "line-height", "font-family"]));
  lines.push("");
  for (const c of pricingDesktop) {
    lines.push(
      `- \`${c.label}\`${c.highlighted ? " (highlighted)" : ""}: text-fluid-price ${c.fluidPriceFound ? `FOUND → class="${c.fluidPriceClass}" font-size resolved = ${c.fluidPriceFontSize}` : "NOT FOUND in price block"}`
    );
  }
  lines.push("");

  lines.push("### Mobile 390x844 (highlighted card)");
  lines.push("");
  const hlCard = pricingMobile[0];
  lines.push(
    t(
      [
        ["plan name (h3)", fmt(hlCard.name && hlCard.name.fontSize), fmt(hlCard.name && hlCard.name.fontWeight), fmt(hlCard.name && hlCard.name.lineHeight), fmt(hlCard.name && hlCard.name.fontFamily)],
        ["price span", fmt(hlCard.price && hlCard.price.fontSize), fmt(hlCard.price && hlCard.price.fontWeight), fmt(hlCard.price && hlCard.price.lineHeight), fmt(hlCard.price && hlCard.price.fontFamily)],
        ["`desde` label", fmt(hlCard.desde && hlCard.desde.fontSize), fmt(hlCard.desde && hlCard.desde.fontWeight), fmt(hlCard.desde && hlCard.desde.lineHeight), fmt(hlCard.desde && hlCard.desde.fontFamily)],
        ["feature item 1", fmt(hlCard.feature1 && hlCard.feature1.fontSize), fmt(hlCard.feature1 && hlCard.feature1.fontWeight), fmt(hlCard.feature1 && hlCard.feature1.lineHeight), fmt(hlCard.feature1 && hlCard.feature1.fontFamily)],
        ["feature item 2", fmt(hlCard.feature2 && hlCard.feature2.fontSize), fmt(hlCard.feature2 && hlCard.feature2.fontWeight), fmt(hlCard.feature2 && hlCard.feature2.lineHeight), fmt(hlCard.feature2 && hlCard.feature2.fontFamily)],
      ],
      ["element", "font-size", "font-weight", "line-height", "font-family"]
    )
  );
  lines.push("");
  lines.push(
    `- Card: \`${hlCard.label}\`${hlCard.highlighted ? " (highlighted)" : ""} — text-fluid-price ${hlCard.fluidPriceFound ? `FOUND → font-size resolved = ${hlCard.fluidPriceFontSize}` : "NOT FOUND in price block"}`
  );
  lines.push("");
  lines.push(zoomShot ? `Zoom screenshot reason: card idx ${zoomShot.index} (\`${zoomShot.title}\`) overflows — ${zoomShot.scrollHeight} > ${zoomShot.clientHeight}.` : "Zoom screenshot: not taken (no card overflow detected).");
  lines.push("");

  lines.push("## Screenshots");
  lines.push("");
  lines.push(t(shots.map((s) => [s.rel, s.abs, `${s.bytes} bytes`]), ["file", "path", "size"]));
  lines.push("");

  const report = lines.join("\n");
  console.log(report);
} finally {
  await browser.close();
}