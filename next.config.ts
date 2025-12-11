import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  allowedDevOrigins: ["192.168.1.34:3000", "localhost:3000"],
};

export default nextConfig;
