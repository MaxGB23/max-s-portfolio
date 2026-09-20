// Hero/About internal audit: how much of the section box is real content
// vs blank space, per viewport. Usage: node scripts/hero-about-audit.mjs
// (dev server must be on :3001)
import { chromium } from "playwright";

const BASE = "http://localhost:3001";

const viewports = [
  { name: "mobile 390",        width: 390,  height: 844 },
  { name: "tablet 768",        width: 768,  height: 1024 },
  { name: "tablet portrait 810", width: 810,  height: 1080 },
  { name: "tablet portrait 820", width: 820,  height: 1180 },
  { name: "tablet portrait 834", width: 834,  height: 1112 },
  { name: "iPad Pro portrait", width: 1024, height: 1366 },
  { name: "desktop 1280",      width: 1280, height: 800 },
  { name: "wide 1920",         width: 1920, height: 1080 },
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome", headless: true });

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const data = await page.evaluate(() => {
    const rectOf = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height };
    };
    const hero = document.querySelector("#inicio");
    const about = document.querySelector("#sobre-mi");

    // Hero content elements (include CTA, ticker, scroll indicator)
    const hTitle = document.querySelector(".hero-title");
    const hDesc = document.querySelector(".hero-description");
    const hPortrait = document.querySelector(".hero-portrait");
    const hCta = document.querySelector(".hero-cta");
    const hChips = document.querySelector(".hero-chips");
    const hScroll = document.querySelector(".hero-scroll");
    const heroContent = [hTitle, hDesc, hPortrait, hCta, hChips, hScroll].filter(Boolean).map((el) => rectOf(el));

    // About content elements
    const aPortrait = document.querySelector(".about-portrait");
    const aInfo = document.querySelector(".about-info");
    const aTitle = document.querySelector(".about-title");
    const aDesc = document.querySelector(".about-description");
    const aboutContent = [aTitle, aDesc, aInfo, aPortrait].filter(Boolean).map((el) => rectOf(el));

    return {
      hero: hero ? { ...rectOf(hero), pt: parseFloat(getComputedStyle(hero).paddingTop) } : null,
      heroContent,
      heroContentTop: heroContent.length ? Math.min(...heroContent.map((c) => c.top)) : null,
      heroContentBottom: heroContent.length ? Math.max(...heroContent.map((c) => c.bottom)) : null,
      about: about ? { ...rectOf(about), pt: parseFloat(getComputedStyle(about).paddingTop) } : null,
      aboutContent,
      aboutContentTop: aboutContent.length ? Math.min(...aboutContent.map((c) => c.top)) : null,
      aboutContentBottom: aboutContent.length ? Math.max(...aboutContent.map((c) => c.bottom)) : null,
    };
  });

  console.log(`\n==== ${vp.name} (${vp.width}x${vp.height}) ====`);
  if (data.hero) {
    const blankTop = data.heroContentTop - data.hero.top;
    const blankBottom = data.hero.bottom - data.heroContentBottom;
    const contentH = data.heroContentBottom - data.heroContentTop;
    console.log(`  HERO  caja=${Math.round(data.hero.height)}px pt=${data.hero.pt} | contenido=${Math.round(contentH)}px | blanco arriba=${Math.round(blankTop)}px | blanco abajo=${Math.round(blankBottom)}px`);
  }
  if (data.about) {
    const blankTop = data.aboutContentTop - data.about.top;
    const blankBottom = data.about.bottom - data.aboutContentBottom;
    const contentH = data.aboutContentBottom - data.aboutContentTop;
    console.log(`  ABOUT caja=${Math.round(data.about.height)}px pt=${data.about.pt} | contenido=${Math.round(contentH)}px | blanco arriba=${Math.round(blankTop)}px | blanco abajo=${Math.round(blankBottom)}px`);
  }
  await page.close();
}

await browser.close();
console.log("\nDone.");