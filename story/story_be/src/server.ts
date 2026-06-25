import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config.js'
import { initDb } from './db.js'
import { registerRoutes } from './routes/index.js'

// story_be 엔트리포인트. (전체 설계: ../docs/PLANNING.md)
async function main(): Promise<void> {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: config.corsOrigins, credentials: true })

  await initDb()
  await registerRoutes(app)

  app.get('/health', async () => ({ status: 'healthy', ts: new Date().toISOString() }))

  await app.listen({ port: config.port, host: '0.0.0.0' })
  app.log.info(`story_be 기동 — port ${config.port}, db driver ${config.db.driver}`)
  console.log(`[boot] story_be up — env=${process.env.NODE_ENV ?? 'dev'}, port=${config.port}`)
}

main().catch((err) => {
  console.error('❌ story_be 기동 실패:', err)
  process.exit(1)
})
