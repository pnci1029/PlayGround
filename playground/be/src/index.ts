import Fastify from 'fastify'
import cors from '@fastify/cors'
import path from 'path'
import { config } from './config'
import toolsRoutes from './routes/tools'
import { authRoutes } from './routes/auth'
import { statsRoutes } from './routes/stats'
import chatRoutes from './routes/chat'
// import { artworkRoutes } from './routes/artworks'
import { testConnection, initializeTables, db } from './config/database'
// import { MigrationService } from '../migrations/migration.service'
import { subdomainRoutingMiddleware, getSubdomainCorsOrigins, getSubdomainInfo } from './middleware/subdomain'
// import canvasRoutes from './routes/canvas'
// import websocketPlugin from './plugins/websocket'

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

// WebSocket 플러그인 등록
// fastify.register(websocketPlugin)

// 라우트 등록
fastify.register(toolsRoutes, { prefix: `${config.api.prefix}/tools` })
fastify.register(authRoutes, { prefix: `${config.api.prefix}/auth` })
fastify.register(statsRoutes, { prefix: `${config.api.prefix}/stats` })
fastify.register(chatRoutes, { prefix: `${config.api.prefix}/chat` })
// fastify.register(artworkRoutes)
// fastify.register(canvasRoutes, { prefix: `${config.api.prefix}/canvas` })

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
  try {
    // PostgreSQL 연결 테스트
    await testConnection()

    // 데이터베이스 테이블 초기화
    await initializeTables()

    // 🔄 자동 마이그레이션 실행 (playground만)
    // const migrationService = new MigrationService(db)
    // await migrationService.runPendingMigrations(['playground.sql'])

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
