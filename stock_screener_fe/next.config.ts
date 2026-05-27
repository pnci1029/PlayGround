import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://stock_screener:8005/api/:path*',
      },
    ];
  },
};

export default nextConfig;
