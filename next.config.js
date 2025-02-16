/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["img.clerk.com"], // Add 'img.clerk.com' to the list of allowed domains
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint during Next.js build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during Next.js build
  },
};

export default config;
