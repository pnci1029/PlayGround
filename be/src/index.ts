import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config'
import toolsRoutes from './routes/tools'

const fastify = Fastify({
  logger: true
})

// CORS 설정
fastify.register(cors, config.cors)

// 라우트 등록
fastify.register(toolsRoutes, { prefix: `${config.api.prefix}/tools` })

// 헬스체크 라우트
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// 서버 시작
const start = async () => {
  try {
    await fastify.listen({ 
      port: config.server.port, 
      host: config.server.host 
    })
    console.log(`🚀 Backend server running on http://localhost:${config.server.port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()