import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.11", "localhost"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
