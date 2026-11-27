import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const devOrigin = process.env.PORTFOLIO_DEV_ORIGIN;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/tanluc" : "" },
  turbopack: { root: process.cwd() },
  experimental: { turbopackFileSystemCacheForDev: false },
  ...(devOrigin ? { allowedDevOrigins: [devOrigin] } : {}),
  ...(isGithubPages ? { basePath: "/tanluc" } : {}),
};

export default nextConfig;
