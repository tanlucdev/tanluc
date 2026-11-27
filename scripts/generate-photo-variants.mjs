import { createHash } from "node:crypto";
import { mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.join(process.cwd(), "public/images/photo");
const outputDirectory = path.join(sourceDirectory, "generated");
const variants = [
  ["thumbnail", 640, 75],
  ["full", 2400, 85],
];
const imageFile = /\.(avif|gif|jpe?g|png|webp)$/i;
const filename = (name) => `${createHash("sha256").update(name).digest("hex")}.webp`;
const generatorMtime = (await stat(new URL(import.meta.url))).mtimeMs;

const entries = await readdir(sourceDirectory, { withFileTypes: true });
let generated = 0;
let skipped = 0;

async function writeVariant(input, inputMtime, output, edge, quality) {
  const outputStats = await stat(output).catch(() => null);
  if (outputStats?.size && outputStats.mtimeMs >= Math.max(inputMtime, generatorMtime)) {
    skipped += 1;
    return;
  }
  await mkdir(path.dirname(output), { recursive: true });
  const temporaryFile = `${output}.${process.pid}.tmp`;
  try {
    await sharp(input)
      .rotate()
      .toColourspace("srgb")
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toFile(temporaryFile);
    await rename(temporaryFile, output);
  } finally {
    await rm(temporaryFile, { force: true });
  }
  generated += 1;
}

for (const entry of entries.filter((entry) => entry.isFile() && imageFile.test(entry.name))) {
  const input = path.join(sourceDirectory, entry.name);
  const inputStats = await stat(input);
  for (const [directory, edge, quality] of variants) {
    await writeVariant(input, inputStats.mtimeMs, path.join(outputDirectory, directory, filename(entry.name)), edge, quality);
  }
}

const recentDirectory = path.join(process.cwd(), "public/images/about/recently");
const recentEntries = await readdir(recentDirectory, { withFileTypes: true });
for (const entry of recentEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".webp"))) {
  const input = path.join(recentDirectory, entry.name);
  await writeVariant(input, (await stat(input)).mtimeMs, path.join(recentDirectory, "generated", entry.name), 720, 78);
}

console.log(`Photo variants: ${generated} generated, ${skipped} unchanged.`);
