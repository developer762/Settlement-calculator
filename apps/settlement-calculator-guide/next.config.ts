import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/Settlement-calculator" : "",
  assetPrefix: isGitHubPages ? "/Settlement-calculator/" : "",
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
