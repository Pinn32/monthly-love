import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.74"],

  // Allow Notion-hosted images to be rendered via next/image (optional upgrade)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "prod-files-secure.s3.us-east-1.amazonaws.com" },
    ],
  },

  async headers() {
    return [
      {
        // Apply noindex to every article page and the whole site
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
