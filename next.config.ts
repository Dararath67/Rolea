import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "http://us.apsara.lol:15511";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
