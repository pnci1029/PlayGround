// API 설정 중앙 관리
const isClientSide = process.env.NEXT_RUNTIME === 'nodejs' ? false : true
const isServerSide = !isClientSide

export const config = {
  api: {
    // 서버사이드: Docker 컨테이너 간 통신 (컨테이너 이름 사용)
    // 클라이언트사이드: 브라우저에서 프록시를 통한 API 접근
    baseUrl: isServerSide
      ? process.env.BACKEND_CONTAINER_URL || 'http://playground_backend:8000'
      : process.env.NEXT_PUBLIC_API_URL || '/api',
    prefix: isServerSide 
      ? process.env.BACKEND_API_PREFIX || '/api'
      : '',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'PlayGround',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  environment: {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    isClientSide,
    isServerSide,
  },
} as const

// API URL 생성 헬퍼 함수들
export const apiUrls = {
  // Artwork 관련 API
  artworks: `${config.api.baseUrl}${config.api.prefix}/artworks`,
  artwork: (id: string) => `${config.api.baseUrl}${config.api.prefix}/artworks/${id}`,
  artworkLike: (id: string) => `${config.api.baseUrl}${config.api.prefix}/artworks/${id}/like`,
  artworkFork: (id: string) => `${config.api.baseUrl}${config.api.prefix}/artworks/${id}/fork`,

  // Auth 관련 API
  auth: `${config.api.baseUrl}${config.api.prefix}/auth`,

  // Stats 관련 API
  stats: {
    badges: `${config.api.baseUrl}${config.api.prefix}/stats/badges`,
    visit: `${config.api.baseUrl}${config.api.prefix}/stats/visit`,
    popular: `${config.api.baseUrl}${config.api.prefix}/stats/popular`,
  },

  // Health check
  health: `${config.api.baseUrl}/health`,

  // WebSocket - 브라우저에서만 사용
  chat: 'ws://localhost:8010',
} as const

// 이미지 URL 생성 헬퍼 함수
export const imageUrls = {
  artwork: (path: string) => `${config.api.baseUrl}${path}`,
  thumbnail: (path: string) => `${config.api.baseUrl}${path}`,
} as const

// 로그 헬퍼 (개발 환경에서만 출력)
export const logger = {
  log: (...args: any[]) => config.environment.isDev && console.log(...args),
  error: (...args: any[]) => config.environment.isDev && console.error(...args),
  warn: (...args: any[]) => config.environment.isDev && console.warn(...args),
}
