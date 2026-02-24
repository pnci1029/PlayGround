// API 설정 중앙 관리
export const config = {
  api: {
    // 클라이언트사이드: 브라우저에서 프록시를 통한 API 접근
    clientBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    // 서버사이드: Docker 컨테이너 간 통신 (컨테이너 이름 사용)
    serverBaseUrl: process.env.BACKEND_CONTAINER_URL || 'http://playground_backend:8000',
    serverPrefix: process.env.BACKEND_API_PREFIX || '/api',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'PlayGround',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  environment: {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
  services: {
    playground: process.env.NEXT_PUBLIC_PLAYGROUND_URL || 'http://localhost:3000',
    moodbite: process.env.NEXT_PUBLIC_MOODBITE_URL || 'https://moodbite.localhost',
    trend: process.env.NEXT_PUBLIC_TREND_URL || 'https://trend.localhost',
  },
} as const

// 클라이언트사이드 API URL 생성 헬퍼 함수들 (브라우저에서 사용)
export const clientApiUrls = {
  // Artwork 관련 API
  artworks: `${config.api.clientBaseUrl}/artworks`,
  artwork: (id: string) => `${config.api.clientBaseUrl}/artworks/${id}`,
  artworkLike: (id: string) => `${config.api.clientBaseUrl}/artworks/${id}/like`,
  artworkFork: (id: string) => `${config.api.clientBaseUrl}/artworks/${id}/fork`,

  // Auth 관련 API
  auth: `${config.api.clientBaseUrl}/auth`,

  // Stats 관련 API
  stats: {
    badges: `${config.api.clientBaseUrl}/stats/badges`,
    visit: `${config.api.clientBaseUrl}/stats/visit`,
    popular: `${config.api.clientBaseUrl}/stats/popular`,
  },

  // Health check
  health: `${config.api.clientBaseUrl}/health`,

  // WebSocket - 브라우저에서만 사용
  chat: 'ws://localhost:8010',
} as const

// 서버사이드 API URL 생성 헬퍼 함수들 (Next.js 서버에서 사용)
export const serverApiUrls = {
  // Artwork 관련 API
  artworks: `${config.api.serverBaseUrl}${config.api.serverPrefix}/artworks`,
  artwork: (id: string) => `${config.api.serverBaseUrl}${config.api.serverPrefix}/artworks/${id}`,
  artworkLike: (id: string) => `${config.api.serverBaseUrl}${config.api.serverPrefix}/artworks/${id}/like`,
  artworkFork: (id: string) => `${config.api.serverBaseUrl}${config.api.serverPrefix}/artworks/${id}/fork`,

  // Auth 관련 API
  auth: `${config.api.serverBaseUrl}${config.api.serverPrefix}/auth`,

  // Stats 관련 API
  stats: {
    badges: `${config.api.serverBaseUrl}${config.api.serverPrefix}/stats/badges`,
    visit: `${config.api.serverBaseUrl}${config.api.serverPrefix}/stats/visit`,
    popular: `${config.api.serverBaseUrl}${config.api.serverPrefix}/stats/popular`,
  },

  // Health check
  health: `${config.api.serverBaseUrl}/health`,
} as const

// 호환성을 위한 기본 API URLs (클라이언트사이드 사용)
export const apiUrls = clientApiUrls

// 이미지 URL 생성 헬퍼 함수
export const imageUrls = {
  artwork: (path: string) => `${config.api.clientBaseUrl}${path}`,
  thumbnail: (path: string) => `${config.api.clientBaseUrl}${path}`,
} as const

// 로그 헬퍼 (개발 환경에서만 출력)
export const logger = {
  log: (...args: any[]) => config.environment.isDev && console.log(...args),
  error: (...args: any[]) => config.environment.isDev && console.error(...args),
  warn: (...args: any[]) => config.environment.isDev && console.warn(...args),
}
