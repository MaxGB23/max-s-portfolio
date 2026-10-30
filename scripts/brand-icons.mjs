/**
 * brand-icons.mjs
 * ---------------
 * Rasterizes `public/brands/*.svg` into `public/brands/*.webp` at 64x64.
 *
 * Why this exists (measured, 2026-10, iGPU Intel UHD, 2048x1280 dpr1.25, 165 Hz):
 * the "All Projects" entry carried ONE 60-80 ms GPU transaction. Hiding the card
 * photos changed nothing (66.4 ms); hiding the ~28 brand icons dropped it to
 * 18.3 ms with zero dropped frames. The icons were `<img src="*.svg">`, and
 * Chromium's `SVGImage` does not cache a raster: every paint replays the SVG's
 * `SkPicture`, so each icon contributes vector work to the tile's `GrOpList`,
 * which is then flushed whole in `DoEndRasterCHROMIUM` -> `prepareForExternalIO`
 * (the known slow path in the GPU process). On top of that the files declared
 * `width="800px" height="800px"` while being painted at 20 device px.
 *
 * A bitmap has none of that: it is decoded once into the GPU image cache and
 * every later paint is one textured draw. The icons render at 16 CSS px
 * (20 device px at dpr 1.25), so 64x64 leaves 3x headroom and costs a few
 * hundred bytes per icon.
 *
 * Run `pnpm icons:build` after adding or replacing a file in public/brands/.
 * Idempotent: a `.webp` newer than its `.svg` is left alone.
 */
import { readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const SIZE = 64;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "brands");

const newer = async (a, b) => {
  try {
    const [sa, sb] = await Promise.all([stat(a), stat(b)]);
    return sb.mtimeMs >= sa.mtimeMs;
  } catch {
    return false;
  }
};

const files = (await readdir(dir)).filter((f) => f.endsWith(".svg"));
let written = 0;
let skipped = 0;

for (const file of files) {
  const src = path.join(dir, file);
  const dest = path.join(dir, file.replace(/\.svg$/, ".webp"));
  if (await newer(src, dest)) {
    skipped += 1;
    continue;
  }
  await sharp(src, { density: 384 })
    .resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ lossless: true })
    .toFile(dest);
  written += 1;
}

console.log(`brand-icons: ${written} written, ${skipped} up to date (${files.length} sources)`);
