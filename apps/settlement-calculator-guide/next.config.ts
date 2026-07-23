import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/settlement-calculator-guide" : "",
  assetPrefix: isGitHubPages ? "/settlement-calculator-guide/" : "",
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
