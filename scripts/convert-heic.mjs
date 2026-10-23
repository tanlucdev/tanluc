import { readdir, stat, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

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
