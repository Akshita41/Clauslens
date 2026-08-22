import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Turbopack walks up and finds an unrelated lockfile in the
  // home directory and warns about it on every build.
  turbopack: { root: __dirname },
  // pdfjs ships its own worker and font data; bundling it breaks both.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
