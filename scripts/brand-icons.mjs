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
 * Freshness is a hash ledger, not mtime. `scripts/brand-icons.manifest.json`
 * (committed next to this script, never under `public/`) records the sha256 of
 * every SVG and of the WebP built from it. An icon is re-rasterized only when
 * its entry is missing, when `svgSha256` no longer matches the SVG, when the
 * WebP is missing, or when `webpSha256` no longer matches the WebP (a binary
 * edited by hand). The first run adopts what is already on disk: while the
 * manifest does not exist yet, a WebP without an entry is recorded with its
 * current hash instead of being rebuilt, so the ledger starts true and staleness
 * is detectable from then on.
 *
 * A removed SVG is pruned: its entry leaves the manifest and its orphan WebP is
 * deleted. `scripts/brand-icons.test.mjs` fails if either is left behind, so the
 * result does not depend on someone remembering to run this.
 *
 * Run `pnpm icons:build` after adding or replacing a file in public/brands/.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const VERSION = 1;
const SIZE = 64;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "brands");
const manifestPath = path.join(root, "scripts", "brand-icons.manifest.json");

const sha256 = async (file) =>
  createHash("sha256").update(await readFile(file)).digest("hex");

const isFile = async (file) => {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
};

const readManifest = async () => {
  let raw;
  try {
    raw = await readFile(manifestPath, "utf8");
  } catch {
    return { raw: null, entries: new Map() };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `brand-icons: scripts/brand-icons.manifest.json is not valid JSON; fix it or delete it to re-adopt the current icons`,
    );
  }
  if (parsed.version !== VERSION) {
    throw new Error(
      `brand-icons: manifest version ${parsed.version} is not supported (expected ${VERSION}); the shape changed, so the file must be regenerated whole`,
    );
  }
  const entries = new Map((parsed.icons ?? []).map((icon) => [icon.name, icon]));
  return { raw, entries };
};

const rasterize = async (svg, webp) => {
  await sharp(svg, { density: 384 })
    .resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ lossless: true })
    .toFile(webp);
};

const { raw, entries } = await readManifest();
const adopting = raw === null;
const files = await readdir(dir);
const svgNames = new Set(
  files.filter((file) => file.endsWith(".svg")).map((file) => file.slice(0, -4)),
);

const icons = [];
let written = 0;
let adopted = 0;
let skipped = 0;

for (const name of [...svgNames].sort()) {
  const svg = path.join(dir, `${name}.svg`);
  const webp = path.join(dir, `${name}.webp`);
  const svgSha256 = await sha256(svg);
  const entry = entries.get(name);
  const webpExists = await isFile(webp);

  if (adopting && webpExists) {
    icons.push({ name, svgSha256, webpSha256: await sha256(webp) });
    adopted += 1;
    continue;
  }

  const stale =
    !entry ||
    entry.svgSha256 !== svgSha256 ||
    !webpExists ||
    entry.webpSha256 !== (await sha256(webp));

  if (stale) {
    await rasterize(svg, webp);
    icons.push({ name, svgSha256, webpSha256: await sha256(webp) });
    written += 1;
    continue;
  }

  icons.push({ name, svgSha256, webpSha256: entry.webpSha256 });
  skipped += 1;
}

const pruned = [...entries.keys()].filter((name) => !svgNames.has(name)).length;
const removed = files
  .filter((file) => file.endsWith(".webp"))
  .map((file) => file.slice(0, -5))
  .filter((name) => !svgNames.has(name));
for (const name of removed) {
  await rm(path.join(dir, `${name}.webp`), { force: true });
}

const manifest = { version: VERSION, icons };
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (serialized !== raw) await writeFile(manifestPath, serialized);

console.log(
  `brand-icons: ${written} rasterized, ${adopted} adopted, ${skipped} up to date, ` +
    `${pruned} pruned, ${removed.length} orphan WebP removed (${svgNames.size} sources)`,
);
