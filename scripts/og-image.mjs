#!/usr/bin/env node
/**
 * og-image.mjs
 * ------------
 * Renders `app/opengraph-image.png` at 1200x630 from HTML, with the same
 * palette, fonts and photo as the site.
 *
 * Why HTML + Playwright instead of SVG + sharp: this card is a type-led
 * composition in Space Grotesk and Inter. sharp rasterizes SVG through
 * librsvg, which resolves type with fontconfig and silently falls back to a
 * system sans, so the card would stop looking like the site. Chromium loads
 * the real webfonts and reports whether they arrived.
 *
 * The card is rendered at 2x and downscaled to 1200x630: the eyebrow (24px)
 * and the URL (20px) need the extra samples to stay crisp, and the name is
 * large enough that one pass would not be enough for the whole composition.
 *
 * The name, the role and the URL come from `lib/site.ts`, so changing the
 * title also changes the card. Run `pnpm og:image` after such a change, after
 * replacing the photo, or after editing the template below.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { PERSON, SITE_URL } from '../lib/site.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PHOTO = join(ROOT, 'public/images/max-gb-pfp.webp')
const OUT = join(ROOT, 'app/opengraph-image.png')

const WIDTH = 1200
const HEIGHT = 630

// "Max González Ballesteros" -> "MAX GONZÁLEZ" / "BALLESTEROS". The site's
// hero breaks the name the same way: given name and first surname, then the
// second surname on its own line in the accent colour.
const words = PERSON.alternateName.split(' ')
const firstLine = words.slice(0, -1).join(' ').toUpperCase()
const secondLine = words.at(-1).toUpperCase()
const role = PERSON.jobTitle.toUpperCase()
const host = SITE_URL.replace(/^https?:\/\//, '')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    background: #040406;
    background-image: radial-gradient(660px 520px at 76% 52%, rgba(86,116,255,.14), rgba(86,116,255,0) 70%);
    color: #f2f2f2;
    font-family: 'Inter', system-ui, sans-serif;
    position: relative;
  }
  .frame {
    position: absolute;
    inset: 0;
    padding: 76px 88px 74px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .eyebrow {
    font-size: 24px;
    font-weight: 500;
    letter-spacing: .18em;
    color: #868686;
  }
  .name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 86px;
    line-height: .94;
    letter-spacing: -.035em;
    margin-top: 20px;
    white-space: nowrap;
  }
  .name .accent { color: #5674ff; }
  .url {
    font-size: 20px;
    font-weight: 400;
    letter-spacing: .01em;
    color: #868686;
  }
  .photo-wrap {
    position: absolute;
    right: 88px;
    top: 125px;
    width: 372px;
    height: 372px;
  }
  .photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 16%;
    border-radius: 28px;
    display: block;
  }
  .badge {
    position: absolute;
    left: -40px;
    bottom: -40px;
    width: 84px;
    height: 84px;
    border-radius: 999px;
    background: #5674ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    line-height: 1;
  }
</style>
</head>
<body>
  <div class="frame">
    <div>
      <div class="eyebrow">${role}</div>
      <div class="name">${firstLine}<br><span class="accent">${secondLine}</span></div>
    </div>
    <div class="url">${host}</div>
  </div>
  <div class="photo-wrap">
    <img class="photo" src="${pathToFileURL(PHOTO).href}" alt="">
    <div class="badge">🖐</div>
  </div>
</body>
</html>`

const scratch = await mkdtemp(join(tmpdir(), 'og-image-'))
const pageUrl = pathToFileURL(join(scratch, 'og.html')).href
await writeFile(join(scratch, 'og.html'), html)

// Playwright's bundled Chromium is the default; a machine that only has the
// browser cache for another Playwright version still works through the
// installed Chrome. The card is a local design asset, never a CI artifact.
let browser
let engine = 'bundled chromium'
try {
  browser = await chromium.launch()
} catch {
  engine = 'installed Chrome'
  browser = await chromium.launch({ channel: 'chrome' })
}
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  })
  await page.goto(pageUrl, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)

  const fontsReady = await page.evaluate(
    () =>
      document.fonts.check('700 86px "Space Grotesk"') &&
      document.fonts.check('500 24px "Inter"'),
  )
  if (!fontsReady) {
    throw new Error('webfonts did not load; the card would render in a fallback face')
  }

  const shot = await page.screenshot({ type: 'png' })
  await sharp(shot)
    .resize(WIDTH, HEIGHT, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9, palette: false })
    .toFile(OUT)
} finally {
  await browser.close()
  await rm(scratch, { recursive: true, force: true })
}

const written = await sharp(OUT).metadata()
if (written.width !== WIDTH || written.height !== HEIGHT) {
  throw new Error(`expected ${WIDTH}x${HEIGHT}, got ${written.width}x${written.height}`)
}
console.log(`app/opengraph-image.png  ${written.width}x${written.height}  (${engine})`)
