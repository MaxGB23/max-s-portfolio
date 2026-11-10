#!/usr/bin/env node
/**
 * site-icons.mjs
 * --------------
 * Builds every browser-facing icon from the one brand mark the site already
 * owns, `public/images/m_logo.png` (192x192, black circle with a white M), and
 * writes them where Next.js picks them up by file convention:
 *
 *   app/icon.png        192x192  -> <link rel="icon" type="image/png" sizes="192x192">
 *   app/apple-icon.png  180x180  -> <link rel="apple-touch-icon" sizes="180x180">
 *   app/favicon.ico     16/32/48 -> <link rel="icon" sizes="32x32" type="image/x-icon">
 *
 * Why this exists: `app/favicon.ico` used to be a 32x32 PNG renamed to `.ico`
 * and served as `image/x-icon`. Google documents a minimum of 8x8 for favicons
 * in Search results and recommends something larger than 48x48, and it reads the
 * bytes rather than the extension, so the site offered no size it asks for and a
 * payload that disagreed with its declared type. A real multi-resolution ICO
 * plus a 192px PNG covers both the fallback browsers ask for and the size Google
 * wants.
 *
 * sharp cannot write ICO, so the container is assembled here: an ICONDIR header,
 * one 16-byte entry per size, then the PNG payloads. PNG-compressed entries are
 * part of the format since Vista and every browser this site supports reads them.
 *
 * The source is never upscaled. It is a flat monogram at 192px, already a
 * multiple of 48, so every target is a downscale.
 *
 * Run `pnpm icons:site` after replacing the mark.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'public/images/m_logo.png')
const APP = join(ROOT, 'app')

const PNG_TARGETS = [
  { file: 'icon.png', size: 192 },
  { file: 'apple-icon.png', size: 180 },
]
const ICO_SIZES = [16, 32, 48]

/**
 * Assembles a multi-resolution ICO around already-encoded PNG payloads.
 * ICONDIR: reserved(2) | type(2) | count(2)
 * ICONDIRENTRY: width(1) | height(1) | palette(1) | reserved(1) | planes(2) |
 *               bitCount(2) | bytesInRes(4) | imageOffset(4)
 */
function buildIco(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)

  let offset = header.length + 16 * pngs.length
  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    // 256 is encoded as 0; none of our sizes reach it.
    entry.writeUInt8(size, 0)
    entry.writeUInt8(size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...pngs.map((png) => png.data)])
}

function render(source, size) {
  return sharp(source)
    .resize(size, size, {
      fit: 'contain',
      kernel: 'lanczos3',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
}

const source = await readFile(SOURCE)
const meta = await sharp(source).metadata()
if (!meta.width || !meta.height) {
  throw new Error(`${SOURCE}: no readable dimensions`)
}
if (meta.width !== meta.height) {
  throw new Error(`${SOURCE}: expected a square mark, got ${meta.width}x${meta.height}`)
}
if (meta.width < Math.max(...PNG_TARGETS.map((target) => target.size))) {
  throw new Error(
    `${SOURCE}: ${meta.width}px cannot fill the largest target without upscaling`,
  )
}

// A transparent surround is what makes the favicon read as a circle on a dark
// tab strip. An opaque one would paint a square of whatever colour the corner
// pixel holds, so say it out loud instead of shipping it silently.
const corner = await sharp(source)
  .ensureAlpha()
  .extract({ left: 0, top: 0, width: 1, height: 1 })
  .raw()
  .toBuffer()
const cornerAlpha = corner[3]

for (const { file, size } of PNG_TARGETS) {
  await writeFile(join(APP, file), await render(source, size))
  console.log(`${file.padEnd(16)} ${size}x${size}`)
}

const icoPngs = []
for (const size of ICO_SIZES) {
  icoPngs.push({ size, data: await render(source, size) })
}
await writeFile(join(APP, 'favicon.ico'), buildIco(icoPngs))
console.log(`favicon.ico      ${ICO_SIZES.join('/')}`)
console.log(`corner alpha     ${cornerAlpha} ${cornerAlpha === 0 ? '(transparent)' : '(OPAQUE SQUARE)'}`)
