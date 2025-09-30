import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: ["jalvirtual.com"], // Add any image domains you're using
  },
  typescript: {
    ignoreBuildErrors: false, // Enforce type checking during build
  },
  distDir: ".next",
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname), 
  experimental: {
    serverActions: {},
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JAL_API_BASE_URL: process.env.JAL_API_BASE_URL,
    ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  },
};

export default nextConfig;
