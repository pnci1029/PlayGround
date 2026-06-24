/** @type {import('next').NextConfig} */
// API 프록시 대상 (stock_screener 방식): 로컬은 API_PROXY_TARGET 로 오버라이드,
// 미설정 시 운영 백엔드(story-api.chhong.kr). 브라우저는 상대경로 /api/* 만 호출.
const API_TARGET = process.env.API_PROXY_TARGET ?? 'https://story-api.chhong.kr'

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_TARGET}/api/:path*` },
      { source: '/health', destination: `${API_TARGET}/health` },
    ]
  },
}

module.exports = nextConfig
