import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Turbopack walks up and finds an unrelated lockfile in the
  // home directory and warns about it on every build.
  turbopack: { root: __dirname },
};

export default nextConfig;
