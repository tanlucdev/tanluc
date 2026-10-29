import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/tanluc" : "" },
  turbopack: { root: process.cwd() },
  experimental: { turbopackFileSystemCacheForDev: false },
  ...(isGithubPages ? { basePath: "/tanluc" } : {}),
};

export default nextConfig;
