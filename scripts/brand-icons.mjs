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
 * edited by hand).
 *
 * Bootstrap verifies, it does not adopt. Without a ledger nothing on disk proves
 * that an existing WebP came from the current SVG, so the first run rasterizes
 * the SVG to a temp file outside the repo, compares its hash with the WebP on
 * disk and records the entry only when the two match. When they differ the WebP
 * is stale: it is rewritten from the SVG and the script says which icon. The
 * bootstrap fires ONLY when the manifest does not exist (ENOENT); every other
 * read error aborts, as do a malformed manifest, an unknown `version` and
 * duplicate names, so a ledger that cannot be understood is never overwritten.
 *
 * A removed SVG is pruned: its entry leaves the manifest and its orphan WebP is
 * deleted. Source and orphan detection are case-insensitive, so `Logo.SVG` is a
 * source and never an orphan. The manifest is written through a sibling temp file
 * and renamed before anything is deleted: an interruption leaves at worst an
 * orphan WebP that `scripts/brand-icons.test.mjs` reports, never a deleted binary
 * the ledger still lists.
 *
 * Run `pnpm icons:build` after adding or replacing a file in public/brands/.
 */
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const VERSION = 1;
const SIZE = 64;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "brands");
const manifestName = "brand-icons.manifest.json";
const manifestPath = path.join(root, "scripts", manifestName);

const sha256 = async (file) =>
  createHash("sha256").update(await readFile(file)).digest("hex");

const isFile = async (file) => {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
};

/** Splits a directory entry into its stem and its lowercase extension. */
const split = (file) => {
  const extension = path.extname(file);
  return { file, name: path.basename(file, extension), ext: extension.toLowerCase() };
};

const rasterize = async (svg, out) => {
  await sharp(svg, { density: 384 })
    .resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ lossless: true })
    .toFile(out);
};

/**
 * Reads the ledger. Only a missing file starts the bootstrap: any other failure
 * (EACCES, EISDIR, EMFILE, malformed JSON, unknown version, duplicate names) is
 * a ledger this script does not understand, and it aborts before touching disk.
 */
const readManifest = async () => {
  let raw;
  try {
    raw = await readFile(manifestPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return { raw: null, entries: new Map() };
    throw new Error(
      `cannot read scripts/${manifestName} (${error.code ?? error.message}); ` +
        `the ledger and public/brands/ are untouched`,
      { cause: error },
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `scripts/${manifestName} is not valid JSON; the ledger and public/brands/ are untouched`,
      { cause: error },
    );
  }
  if (parsed === null || typeof parsed !== "object" || !Array.isArray(parsed.icons)) {
    throw new Error(
      `scripts/${manifestName} has no "icons" array; the ledger and public/brands/ are untouched`,
    );
  }
  if (parsed.version !== VERSION) {
    throw new Error(
      `manifest version ${parsed.version} is not supported (expected ${VERSION}); ` +
        `the shape changed, so the file must be regenerated whole`,
    );
  }

  const entries = new Map();
  const duplicates = new Set();
  for (const icon of parsed.icons) {
    if (typeof icon?.name !== "string") {
      throw new Error(
        `scripts/${manifestName} has an icon without a string "name"; ` +
          `the ledger and public/brands/ are untouched`,
      );
    }
    if (entries.has(icon.name)) duplicates.add(icon.name);
    else entries.set(icon.name, icon);
  }
  if (duplicates.size > 0) {
    throw new Error(
      `scripts/${manifestName} lists ${duplicates.size} duplicate name(s): ` +
        `${[...duplicates].join(", ")}; two entries for one icon would collapse silently`,
    );
  }

  return { raw, entries };
};

/** Writes the ledger through a sibling temp file, so a crash never leaves half a file. */
const writeManifestAtomic = async (serialized) => {
  const temp = `${manifestPath}.tmp`;
  try {
    await writeFile(temp, serialized);
    await rename(temp, manifestPath);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
};

const main = async () => {
  const { raw, entries } = await readManifest();
  const bootstrapping = raw === null;
  const files = (await readdir(dir)).map(split);
  const sources = files
    .filter((file) => file.ext === ".svg")
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  // Case-insensitive keys: on this filesystem "Logo.SVG" and "logo.svg" would
  // write the same WebP, so two sources that differ only in case cannot coexist.
  const sourceKeys = new Map();
  for (const source of sources) {
    const key = source.name.toLowerCase();
    const clash = sourceKeys.get(key);
    if (clash !== undefined) {
      throw new Error(
        `public/brands has two sources that differ only in case ` +
          `(${clash}.svg and ${source.file}); they would share one WebP`,
      );
    }
    sourceKeys.set(key, source.name);
  }

  const counts = { rasterized: 0, verified: 0, rebuilt: 0, upToDate: 0 };
  const icons = [];
  let scratch = null;

  const rasterIntoScratch = async (source) => {
    if (scratch === null) scratch = await mkdtemp(path.join(tmpdir(), "brand-icons-"));
    const out = path.join(scratch, `${source.name}.webp`);
    await rasterize(path.join(dir, source.file), out);
    return out;
  };

  try {
    for (const source of sources) {
      const svg = path.join(dir, source.file);
      const webp = path.join(dir, `${source.name}.webp`);
      const svgSha256 = await sha256(svg);
      const webpSha256 = (await isFile(webp)) ? await sha256(webp) : null;

      if (bootstrapping) {
        // A WebP on disk is not evidence of the current SVG: rasterize and compare.
        const raster = await rasterIntoScratch(source);
        const rasterSha256 = await sha256(raster);
        if (rasterSha256 === webpSha256) {
          icons.push({ name: source.name, svgSha256, webpSha256 });
          counts.verified += 1;
          continue;
        }
        await copyFile(raster, webp);
        icons.push({ name: source.name, svgSha256, webpSha256: rasterSha256 });
        if (webpSha256 === null) {
          counts.rasterized += 1;
        } else {
          console.log(
            `brand-icons: ${source.name}: the WebP did not match a raster of ${source.file}; ` +
              `regenerated from the SVG`,
          );
          counts.rebuilt += 1;
        }
        continue;
      }

      const entry = entries.get(source.name);
      if (entry?.svgSha256 === svgSha256 && entry?.webpSha256 === webpSha256) {
        icons.push({ name: source.name, svgSha256, webpSha256 });
        counts.upToDate += 1;
        continue;
      }

      await rasterize(svg, webp);
      icons.push({ name: source.name, svgSha256, webpSha256: await sha256(webp) });
      counts.rasterized += 1;
    }
  } finally {
    if (scratch !== null) await rm(scratch, { recursive: true, force: true });
  }

  // Pruned = ledger entries that are in the old file and not in the new one.
  const kept = new Set(icons.map((icon) => icon.name));
  const pruned = [...entries.keys()].filter((name) => !kept.has(name));
  // Orphan = WebP files whose stem is not a source, compared without case.
  const orphans = files.filter(
    (file) => file.ext === ".webp" && !sourceKeys.has(file.name.toLowerCase()),
  );

  const serialized = `${JSON.stringify({ version: VERSION, icons }, null, 2)}\n`;
  // The ledger lands before any deletion: an interruption can only leave an orphan
  // WebP for the test to report, never a deleted binary the ledger still lists.
  if (serialized !== raw) await writeManifestAtomic(serialized);
  for (const orphan of orphans) {
    await rm(path.join(dir, orphan.file), { force: true });
  }

  console.log(
    `brand-icons: ${counts.rasterized} rasterized, ${counts.upToDate} up to date, ` +
      `${counts.verified} verified by comparison, ${counts.rebuilt} rebuilt from a stale WebP, ` +
      `${pruned.length} entries pruned from the ledger, ${orphans.length} orphan WebP files removed ` +
      `(${sources.length} sources${bootstrapping ? "; bootstrap, the manifest did not exist" : ""})`,
  );
};

main().catch((error) => {
  console.error(`brand-icons: ${error.message}`);
  process.exitCode = 1;
});
