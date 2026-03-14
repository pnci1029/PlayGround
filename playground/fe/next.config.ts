import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Docker 환경에서는 항상 컨테이너 이름 사용
    const apiUrl = 'http://playground_backend:8000'
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
  // 개발 환경에서 CORS 이슈 해결
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

export default nextConfig;