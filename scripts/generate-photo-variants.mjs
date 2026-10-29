import { createHash } from "node:crypto";
import { mkdir, readdir, stat } from "node:fs/promises";
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

const entries = await readdir(sourceDirectory, { withFileTypes: true });
let generated = 0;
let skipped = 0;

for (const entry of entries.filter((entry) => entry.isFile() && imageFile.test(entry.name))) {
  const input = path.join(sourceDirectory, entry.name);
  const inputStats = await stat(input);
  for (const [directory, edge, quality] of variants) {
    const output = path.join(outputDirectory, directory, filename(entry.name));
    const outputStats = await stat(output).catch(() => null);
    if (outputStats?.mtimeMs >= inputStats.mtimeMs) {
      skipped += 1;
      continue;
    }
    await mkdir(path.dirname(output), { recursive: true });
    await sharp(input)
      .rotate()
      .toColourspace("srgb")
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toFile(output);
    generated += 1;
  }
}

console.log(`Photo variants: ${generated} generated, ${skipped} unchanged.`);
