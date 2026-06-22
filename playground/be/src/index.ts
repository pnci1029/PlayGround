import Fastify from 'fastify'
import cors from '@fastify/cors'
import path from 'path'
import { config } from './config'
import toolsRoutes from './routes/tools'
import { authRoutes } from './routes/auth'
import { statsRoutes } from './routes/stats'
import chatRoutes from './routes/chat'
import { testConnection, initializeTables, db } from './config/database'
import { subdomainRoutingMiddleware, getSubdomainCorsOrigins, getSubdomainInfo } from './middleware/subdomain'

const fastify = Fastify({
  logger: true
})

// Add uploads directory and database to fastify instance
fastify.decorate('uploadsDir', path.join(__dirname, '../uploads'))
fastify.decorate('pg', db)

// 서브도메인별 CORS 설정
fastify.register(cors, {
  ...config.cors,
  origin: getSubdomainCorsOrigins()
})

// 서브도메인 라우팅 미들웨어 등록
fastify.addHook('preHandler', subdomainRoutingMiddleware)

// 라우트 등록
fastify.register(toolsRoutes, { prefix: `${config.api.prefix}/tools` })
fastify.register(authRoutes, { prefix: `${config.api.prefix}/auth` })
fastify.register(statsRoutes, { prefix: `${config.api.prefix}/stats` })
fastify.register(chatRoutes, { prefix: `${config.api.prefix}/chat` })

// 헬스체크 라우트
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'devforge-backend',
    version: '1.0.0'
  }
})

// 서브도메인 정보 조회 라우트
fastify.get('/subdomain-info', getSubdomainInfo)

// 서버 시작
const start = async () => {
  console.log('🔑 PlayGround BE — DB 비밀번호 로테이션 재배포 (2026-06)')
  try {
    // PostgreSQL 연결 테스트
    await testConnection()

    // 데이터베이스 테이블 초기화
    await initializeTables()

    await fastify.listen({
      port: config.server.port,
      host: config.server.host
    })
    console.log(`🚀 Backend server running on http://localhost:${config.server.port}`)
    console.log(`🔐 Auth API: http://localhost:${config.server.port}${config.api.prefix}/auth`)
    console.log(`🐘 PostgreSQL connected on port 5432`)

    // Start chat WebSocket server
    import('./chat-server').catch(console.error)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
