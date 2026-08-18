import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const staticBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        assetPrefix: staticBasePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
