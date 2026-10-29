import { readdir, stat, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const directory = path.join(process.cwd(), "public/images/photo");
const entries = await readdir(directory, { withFileTypes: true });
const sources = entries.filter((entry) => entry.isFile() && /\.heic$/i.test(entry.name));

for (const source of sources) {
  const input = path.join(directory, source.name);
  const output = path.join(directory, source.name.replace(/\.heic$/i, ".png"));
  const inputStats = await stat(input);
  const outputStats = await stat(output).catch(() => null);

  if (outputStats && outputStats.mtimeMs >= inputStats.mtimeMs) {
    await unlink(input);
    continue;
  }

  const result = spawnSync("sips", ["-s", "format", "png", input, "--out", output], {
    stdio: "inherit",
  });

  if (result.status !== 0) process.exit(result.status ?? 1);

  await unlink(input);
}

for (const entry of await readdir(directory, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.(avif|gif|jpe?g|png)$/i.test(entry.name)) continue;
  const input = path.join(directory, entry.name);
  const output = input.replace(/\.[^.]+$/, ".webp");
  const existing = await stat(output).catch(() => null);
  if (!process.argv.includes("--force") && existing && existing.mtimeMs >= (await stat(input)).mtimeMs) continue;
  await sharp(input).rotate().webp({ quality: 95, smartSubsample: true, effort: 6 }).toFile(output);
  console.log(`WebP: ${entry.name}`);
}
