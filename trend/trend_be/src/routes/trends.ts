import { FastifyInstance, FastifyRequest } from 'fastify'
import { TrendResponse } from '../types/trend.types'
import { freeTrendService } from '../services/freeTrendService'
import { trendWebSocketService } from '../services/trendWebSocket'

interface SourceParams {
  source: string
}

interface CategoryParams {
  category: string
}

interface SearchQuery {
  q: string
}

export async function trendRoutes(fastify: FastifyInstance) {
  
  // 전체 트렌드 조회 (캐시됨)
  fastify.get('/api/trends', async (request, reply) => {
    try {
      console.log('📡 전체 트렌드 요청 받음')
      
      const trends = await freeTrendService.getCachedTrends()
      const cacheStatus = freeTrendService.getCacheStatus()
      
      const response: TrendResponse = {
        success: true,
        data: trends,
        lastUpdated: cacheStatus.lastUpdate || new Date(),
        totalCount: trends.length
      }

      console.log(`✅ 전체 트렌드 응답: ${trends.length}개`)
      return reply.send(response)
    } catch (error) {
      console.error('❌ 전체 트렌드 조회 오류:', error)
      
      return reply.status(500).send({
        success: false,
        data: [],
        lastUpdated: new Date(),
        totalCount: 0,
        error: 'Failed to fetch trends'
      })
    }
  })

  // 소스별 트렌드 조회
  fastify.get<{ Params: SourceParams }>('/api/trends/:source', async (request, reply) => {
    try {
      const { source } = request.params
      console.log(`📡 ${source} 트렌드 요청 받음`)

      const validSources = ['hackernews', 'reddit', 'github', 'devto', 'rss']
      if (!validSources.includes(source)) {
        return reply.status(400).send({
          success: false,
          data: [],
          lastUpdated: new Date(),
          totalCount: 0,
          error: `Invalid source. Valid sources: ${validSources.join(', ')}`
        })
      }

      const trends = await freeTrendService.getTrendsBySource(source)
      
      const response: TrendResponse = {
        success: true,
        data: trends,
        lastUpdated: new Date(),
        totalCount: trends.length,
        source
      }

      console.log(`✅ ${source} 트렌드 응답: ${trends.length}개`)
      return reply.send(response)
    } catch (error) {
      console.error(`❌ ${request.params.source} 트렌드 조회 오류:`, error)
      
      return reply.status(500).send({
        success: false,
        data: [],
        lastUpdated: new Date(),
        totalCount: 0,
        source: request.params.source,
        error: `Failed to fetch ${request.params.source} trends`
      })
    }
  })

  // 강제 새로고침 (캐시 무시)
  fastify.post('/api/trends/refresh', async (request, reply) => {
    try {
      console.log('🔄 강제 새로고침 요청 받음')
      
      const trends = await freeTrendService.getAllTrends() // 캐시 무시
      
      // WebSocket으로 연결된 클라이언트들에게도 업데이트 전송
      await trendWebSocketService.triggerUpdate()
      
      const response: TrendResponse = {
        success: true,
        data: trends,
        lastUpdated: new Date(),
        totalCount: trends.length
      }

      console.log(`✅ 강제 새로고침 완료: ${trends.length}개`)
      return reply.send(response)
    } catch (error) {
      console.error('❌ 강제 새로고침 오류:', error)
      
      return reply.status(500).send({
        success: false,
        data: [],
        lastUpdated: new Date(),
        totalCount: 0,
        error: 'Failed to refresh trends'
      })
    }
  })

  // 서버 상태 조회
  fastify.get('/api/trends/status', async (request, reply) => {
    try {
      const wsStats = trendWebSocketService.getStats()
      const cacheStatus = freeTrendService.getCacheStatus()
      
      return reply.send({
        success: true,
        status: 'running',
        websocket: {
          activeConnections: wsStats.activeConnections,
          autoUpdateActive: wsStats.autoUpdateActive
        },
        cache: cacheStatus,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('❌ 상태 조회 오류:', error)
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to get server status'
      })
    }
  })

  // 사용 가능한 소스 목록
  fastify.get('/api/trends/sources', async (request, reply) => {
    return reply.send({
      success: true,
      sources: [
        {
          id: 'hackernews',
          name: 'Hacker News',
          description: '기술 뉴스 및 토론',
          official: true,
          free: true
        },
        {
          id: 'reddit',
          name: 'Reddit',
          description: '소셜 뉴스 및 토론',
          official: true,
          free: true
        },
        {
          id: 'github',
          name: 'GitHub',
          description: '오픈소스 프로젝트 트렌드',
          official: true,
          free: true
        },
        {
          id: 'devto',
          name: 'Dev.to',
          description: '개발자 커뮤니티 아티클',
          official: true,
          free: true
        },
        {
          id: 'rss',
          name: 'RSS Feeds',
          description: 'RSS 피드 종합',
          official: true,
          free: true
        }
      ]
    })
  })

  // 카테고리별 트렌드 조회
  fastify.get<{ Params: CategoryParams }>('/api/trends/category/:category', async (request, reply) => {
    try {
      const { category } = request.params
      console.log(`📡 ${category} 카테고리 트렌드 요청 받음`)

      const trends = await freeTrendService.getTrendsByCategory(category)
      
      const response: TrendResponse = {
        success: true,
        data: trends,
        lastUpdated: new Date(),
        totalCount: trends.length
      }

      console.log(`✅ ${category} 카테고리 트렌드 응답: ${trends.length}개`)
      return reply.send(response)
    } catch (error) {
      console.error(`❌ ${request.params.category} 카테고리 조회 오류:`, error)
      
      return reply.status(500).send({
        success: false,
        data: [],
        lastUpdated: new Date(),
        totalCount: 0,
        error: `Failed to fetch ${request.params.category} category trends`
      })
    }
  })

  // 트렌드 검색
  fastify.get<{ Querystring: SearchQuery }>('/api/trends/search', async (request, reply) => {
    try {
      const { q } = request.query
      
      if (!q || q.trim().length < 2) {
        return reply.status(400).send({
          success: false,
          data: [],
          lastUpdated: new Date(),
          totalCount: 0,
          error: 'Search query must be at least 2 characters long'
        })
      }

      console.log(`🔍 트렌드 검색 요청: "${q}"`)
      const trends = await freeTrendService.searchTrends(q.trim())
      
      const response: TrendResponse = {
        success: true,
        data: trends,
        lastUpdated: new Date(),
        totalCount: trends.length
      }

      console.log(`✅ 검색 결과 응답: ${trends.length}개`)
      return reply.send(response)
    } catch (error) {
      console.error(`❌ 검색 오류:`, error)
      
      return reply.status(500).send({
        success: false,
        data: [],
        lastUpdated: new Date(),
        totalCount: 0,
        error: 'Failed to search trends'
      })
    }
  })

  // 통계 데이터 조회
  fastify.get('/api/trends/stats', async (request, reply) => {
    try {
      console.log('📊 통계 데이터 요청 받음')
      const stats = await freeTrendService.getStatistics()
      
      return reply.send({
        success: true,
        ...stats
      })
    } catch (error) {
      console.error('❌ 통계 조회 오류:', error)
      
      return reply.status(500).send({
        success: false,
        sourceStats: [],
        categoryStats: [],
        error: 'Failed to fetch statistics'
      })
    }
  })
}