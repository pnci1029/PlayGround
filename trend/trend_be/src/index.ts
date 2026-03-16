import Fastify, { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
import path from 'path'
import { config } from 'dotenv'
import { trendRoutes } from './routes/trends'
import { trendingRoutes } from './routes/trending'
import { trendWebSocketService } from './services/trendWebSocket'
import { databaseService, DatabaseService } from './services/database'
import { TrendingScheduler } from './services/trendingScheduler'
import { MigrationService } from './services/migration.service'
import { randomUUID } from 'crypto'

// 환경변수 로드
config()

const PORT = parseInt(process.env.PORT || '8002')
const WS_PORT = parseInt(process.env.WS_PORT || '8013')

// HTTP 서버 (API)
const httpServer: FastifyInstance = Fastify({
  logger: true
})

// WebSocket 서버 (실시간 업데이트)
const wsServer: FastifyInstance = Fastify({
  logger: true
})

async function startHttpServer() {
  try {
    // CORS 설정
    await httpServer.register(fastifyCors, {
      origin: [
        'http://localhost:3002', 
        'http://trend.localhost', 
        'https://trend.localhost',
        'http://localhost:3000'
      ],
      credentials: true
    })

    // 라우트 등록
    await httpServer.register(trendRoutes)
    await httpServer.register(trendingRoutes, { prefix: '/api/trending' })

    // 헬스체크
    httpServer.get('/health', async (request, reply) => {
      return reply.send({
        status: 'healthy',
        service: 'trend-backend',
        timestamp: new Date(),
        port: PORT
      })
    })

    await httpServer.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`🚀 Trend HTTP Server running on port ${PORT}`)
  } catch (error) {
    console.error('❌ HTTP Server 시작 실패:', error)
    process.exit(1)
  }
}

async function startWebSocketServer() {
  try {
    // WebSocket 플러그인 등록
    await wsServer.register(fastifyWebsocket)

    // WebSocket 핸들러
    wsServer.get('/ws', { websocket: true }, (connection, request) => {
      const connectionId = randomUUID()
      trendWebSocketService.addConnection(connectionId, connection)
    })

    // 헬스체크
    wsServer.get('/health', async (request, reply) => {
      const stats = trendWebSocketService.getStats()
      return reply.send({
        status: 'healthy',
        service: 'trend-websocket',
        timestamp: new Date(),
        port: WS_PORT,
        ...stats
      })
    })

    await wsServer.listen({ port: WS_PORT, host: '0.0.0.0' })
    console.log(`🔌 Trend WebSocket Server running on port ${WS_PORT}`)
  } catch (error) {
    console.warn('⚠️ WebSocket Server 시작 실패:', error)
    console.log('📡 WebSocket 없이 HTTP API만 실행됩니다')
  }
}

// 서버 시작
async function startServers() {
  console.log('🎯 Trend Backend 시작 중...')
  console.log(`📍 HTTP API: http://localhost:${PORT}`)
  console.log(`🔌 WebSocket: ws://localhost:${WS_PORT}/ws`)
  
  // 데이터베이스 연결 테스트 및 테이블 초기화
  console.log('🔗 PostgreSQL 연결 테스트 중...')
  const dbConnected = await databaseService.testConnection()
  if (!dbConnected) {
    console.warn('⚠️ DB 연결 실패, 메모리 캐시로만 운영됩니다')
  } else {
    // await databaseService.initializeTables()
    
    // 🔄 자동 마이그레이션 실행 (trend 스키마) - 강제 재실행
    console.log('🔄 Trend 마이그레이션 강제 재실행 중...')
    const migrationService = new MigrationService(databaseService.pool)
    
    // 서버에서 trend.sql 마이그레이션 기록 삭제 후 재실행
    try {
      await databaseService.pool.query("DELETE FROM migrations WHERE filename = 'trend.sql'")
      console.log('🗑️ 기존 trend.sql 마이그레이션 기록 삭제')
    } catch (error) {
      console.log('⚠️ 마이그레이션 기록 삭제 실패 (테이블이 없을 수 있음)')
    }
    
    await migrationService.runPendingMigrations(['trend.sql'])
    console.log('✅ Trend 마이그레이션 완료')
    
    await databaseService.initializeTables()
  }
  
  await startHttpServer()
  await startWebSocketServer()

  // 트렌드 순위 스케줄러 시작 (임시 비활성화)
  if (dbConnected) {
    console.log('⚠️ 트렌드 순위 스케줄러 임시 비활성화')
    // const db = new DatabaseService()
    // const scheduler = new TrendingScheduler(db)
    // scheduler.start()
    // console.log('✅ 트렌드 순위 스케줄러 시작됨 (10분 간격)')
  }

  console.log('✅ 모든 서버가 성공적으로 시작되었습니다!')
  console.log('🔍 API 엔드포인트:')
  console.log('📊 트렌드 순위 API:')
  console.log(`   GET  http://localhost:${PORT}/api/trending/rankings?timeframe=1h&limit=50`)
  console.log(`   GET  http://localhost:${PORT}/api/trending/keyword/:keyword/history`)
  console.log(`   GET  http://localhost:${PORT}/api/trending/stats`)
  console.log(`   GET  http://localhost:${PORT}/api/trending/top-sources`)
  console.log(`   POST http://localhost:${PORT}/api/trending/refresh`)
  console.log('📈 기존 트렌드 API:')
  console.log(`   GET  http://localhost:${PORT}/api/trends`)
  console.log(`   GET  http://localhost:${PORT}/api/trends/:source`)
  console.log(`   GET  http://localhost:${PORT}/api/trends/category/:category`)
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 서버 종료 중...')
  await Promise.all([
    httpServer.close(),
    wsServer.close(),
    databaseService.close()
  ])
  console.log('✅ 서버가 안전하게 종료되었습니다')
  process.exit(0)
})

startServers().catch((error) => {
  console.error('❌ 서버 시작 실패:', error)
  process.exit(1)
})