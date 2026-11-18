import type { NextConfig } from "next";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages ? { output: "export" as const, pageExtensions: ["tsx"] } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/tanluc" : "",
    AGENT_PUBLIC_FILES: JSON.stringify(readdirSync("public", { recursive: true, withFileTypes: true })
      .filter((file) => file.isFile())
      .map((file) => `/${relative("public", join(file.parentPath, file.name)).split("\\").join("/")}`)),
  },
  turbopack: { root: process.cwd() },
  experimental: { turbopackFileSystemCacheForDev: false },
  ...(isGithubPages ? { basePath: "/tanluc" } : {}),
};

export default nextConfig;
