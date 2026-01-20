import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config'
import toolsRoutes from './routes/tools'
import { authRoutes } from './routes/auth'
import { testConnection } from './config/database'
// import canvasRoutes from './routes/canvas'
// import websocketPlugin from './plugins/websocket'

const fastify = Fastify({
  logger: true
})

// CORS 설정
fastify.register(cors, config.cors)

// WebSocket 플러그인 등록 (나중에 추가)
// fastify.register(websocketPlugin)

// 라우트 등록
fastify.register(toolsRoutes, { prefix: `${config.api.prefix}/tools` })
fastify.register(authRoutes, { prefix: `${config.api.prefix}/auth` })
// fastify.register(canvasRoutes, { prefix: `${config.api.prefix}/canvas` })

// 헬스체크 라우트
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// 서버 시작
const start = async () => {
  try {
    // PostgreSQL 연결 테스트
    await testConnection()
    
    await fastify.listen({ 
      port: config.server.port, 
      host: config.server.host 
    })
    console.log(`🚀 Backend server running on http://localhost:${config.server.port}`)
    console.log(`🔐 Auth API: http://localhost:${config.server.port}${config.api.prefix}/auth`)
    console.log(`🐘 PostgreSQL connected on port 5432`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()