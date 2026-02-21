import { FastifyInstance } from 'fastify'
import { StatsService } from '../services/stats.service'

export async function statsRoutes(fastify: FastifyInstance) {
  const statsService = new StatsService(fastify.pg)

  // 도구 방문 기록
  fastify.post('/visit', {
    schema: {
      body: {
        type: 'object',
        required: ['tool_name'],
        properties: {
          tool_name: { type: 'string' }
        }
      }
    }
  }, statsService.recordVisit.bind(statsService))

  // 모든 도구 통계 및 뱃지 정보
  fastify.get('/badges', statsService.getToolStats.bind(statsService))

  // 인기 도구 목록
  fastify.get('/popular', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50 }
        }
      }
    }
  }, statsService.getPopularTools.bind(statsService))
}