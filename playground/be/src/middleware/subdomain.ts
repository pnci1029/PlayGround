import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * 🌐 서브도메인별 라우팅 미들웨어
 * 단일 백엔드에서 서브도메인별로 다른 로직을 처리
 */

export interface SubdomainConfig {
  subdomain: string
  prefix: string
  description: string
  features: string[]
}

/**
 * 지원하는 서브도메인 목록
 */
export const SUPPORTED_SUBDOMAINS: SubdomainConfig[] = [
  {
    subdomain: 'tools',
    prefix: '/api/tools',
    description: 'Developer Tools Hub (Client-side tools)',
    features: ['tool-info', 'file-upload', 'external-proxy']
  },
  {
    subdomain: 'auth',
    prefix: '/api/auth',
    description: 'Authentication Service',
    features: ['login', 'register', 'profile', 'password-reset']
  },
  {
    subdomain: 'admin',
    prefix: '/api/admin',
    description: 'Admin Dashboard',
    features: ['users', 'analytics', 'settings']
  },
  {
    subdomain: 'canvas',
    prefix: '/api/canvas',
    description: 'Collaborative Canvas (Future)',
    features: ['draw', 'collaborate', 'share']
  }
]

/**
 * 서브도메인 추출 함수
 */
export function extractSubdomain(host: string): string | null {
  if (!host) return null
  
  // localhost 개발환경 처리
  if (host.includes('localhost')) {
    const match = host.match(/^([^.]+)\.localhost/)
    return match ? match[1] : null
  }
  
  // 프로덕션 도메인 처리
  if (host.includes('devforge.com')) {
    const match = host.match(/^([^.]+)\.devforge\.com/)
    return match ? match[1] : null
  }
  
  return null
}

/**
 * 서브도메인별 라우팅 미들웨어
 */
export async function subdomainRoutingMiddleware(
  request: FastifyRequest, 
  reply: FastifyReply
) {
  const host = request.headers.host
  const subdomain = extractSubdomain(host || '')
  
  // 헬스체크 경로는 모든 서브도메인에서 접근 가능
  if (request.url === '/health' || request.url.startsWith('/health/')) {
    return
  }
  
  // 서브도메인이 없으면 기본 API로 처리
  if (!subdomain) {
    // 메인 도메인에서의 요청 - 기본 API 엔드포인트로 처리
    request.log.info(`메인 도메인 요청: ${host}${request.url}`)
    return
  }
  
  // 지원하는 서브도메인인지 확인
  const subdomainConfig = SUPPORTED_SUBDOMAINS.find(s => s.subdomain === subdomain)
  
  if (!subdomainConfig) {
    request.log.warn(`지원하지 않는 서브도메인: ${subdomain}`)
    return reply.status(404).send({
      error: 'Subdomain Not Found',
      message: `'${subdomain}' 서브도메인을 찾을 수 없습니다`,
      availableSubdomains: SUPPORTED_SUBDOMAINS.map(s => s.subdomain),
      timestamp: new Date().toISOString()
    })
  }
  
  // 요청 객체에 서브도메인 정보 추가
  ;(request as any).subdomain = {
    name: subdomain,
    config: subdomainConfig,
    originalUrl: request.url,
    mappedUrl: `${subdomainConfig.prefix}${request.url}`
  }
  
  request.log.info(`서브도메인 라우팅: ${subdomain} -> ${subdomainConfig.prefix}`)
}

/**
 * 서브도메인별 CORS 설정
 */
export function getSubdomainCorsOrigins(): string[] {
  const baseOrigins = [
    'http://localhost:3002',
    'https://devforge.com'
  ]
  
  // 각 서브도메인별 오리진 추가
  const subdomainOrigins = SUPPORTED_SUBDOMAINS.flatMap(config => [
    `http://${config.subdomain}.localhost:3002`,
    `https://${config.subdomain}.devforge.com`
  ])
  
  return [...baseOrigins, ...subdomainOrigins]
}

/**
 * 서브도메인 정보 조회 API
 */
export async function getSubdomainInfo(request: FastifyRequest, reply: FastifyReply) {
  const host = request.headers.host
  const subdomain = extractSubdomain(host || '')
  
  if (!subdomain) {
    return reply.send({
      subdomain: null,
      host,
      availableSubdomains: SUPPORTED_SUBDOMAINS
    })
  }
  
  const config = SUPPORTED_SUBDOMAINS.find(s => s.subdomain === subdomain)
  
  return reply.send({
    subdomain,
    host,
    config,
    isSupported: !!config,
    timestamp: new Date().toISOString()
  })
}