import type { NextConfig } from "next";

// 프론트는 모든 API를 상대경로 /api/* 로 호출하고, 여기서 백엔드로 프록시한다.
// 운영(Vercel): stock-api.chhong.kr (Contabo FastAPI)
// 로컬 개발: API_PROXY_TARGET=http://localhost:8005 로 오버라이드
const API_TARGET = process.env.API_PROXY_TARGET ?? "https://stock-api.chhong.kr";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
