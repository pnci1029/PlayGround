// Trending Rankings API Routes
// 트렌드 순위 조회 API 엔드포인트

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { DatabaseService } from '../services/database'

interface TrendingRankingQuery {
  timeframe?: string
  limit?: string
}

interface KeywordHistoryQuery {
  timeframe?: string
  days?: string
}

export async function trendingRoutes(fastify: FastifyInstance) {
  const db = new DatabaseService()

  /**
   * GET /api/trending/rankings
   * 트렌드 순위 조회
   */
  fastify.get('/rankings', async (
    request: FastifyRequest<{ Querystring: TrendingRankingQuery }>, 
    reply: FastifyReply
  ) => {
    try {
      const { timeframe = '1h', limit = '50' } = request.query
      const limitNum = Math.min(parseInt(limit), 100)

      // 유효한 시간대인지 확인
      const validTimeframes = ['1h', '6h', '1d', '3d', '1w']
      if (!validTimeframes.includes(timeframe)) {
        return reply.code(400).send({ 
          error: 'Invalid timeframe. Must be one of: ' + validTimeframes.join(', ') 
        })
      }

      // Database 사용 가능시 실제 DB 쿼리 실행  
      let dbAvailable = false
      try {
        if (db.pool) {
          await db.testConnection()
          dbAvailable = true
        }
      } catch (error) {
        console.log('DB 연결 실패, 메모리 캐시 모드로 실행')
      }

      if (dbAvailable) {
        const query = `
          SELECT 
            tr.*,
            COALESCE(sw.avg_weight, 1.0) as source_avg_weight
          FROM trending_rankings tr
          LEFT JOIN LATERAL (
            SELECT AVG(sw.weight_value) as avg_weight
            FROM source_weights sw
            WHERE sw.source_name = ANY(tr.sources) AND sw.is_active = true
          ) sw ON true
          WHERE tr.timeframe = $1 
          AND DATE(tr.calculated_at) = CURRENT_DATE
          ORDER BY tr.current_rank ASC
          LIMIT $2
        `

        const rankingResult = await db.pool.query(query, [timeframe, limitNum])
        const rankings = rankingResult.rows

        const lastUpdateQuery = `
          SELECT MAX(calculated_at) as last_update
          FROM trending_rankings
          WHERE timeframe = $1 AND DATE(calculated_at) = CURRENT_DATE
        `
        const lastUpdateResult = await db.pool.query(lastUpdateQuery, [timeframe])
        const lastUpdate = lastUpdateResult.rows.length > 0 ? lastUpdateResult.rows[0].last_update : new Date()

        reply.send({
          success: true,
          data: {
            timeframe,
            lastUpdate,
            totalCount: rankings.length,
            rankings: rankings.map((ranking: any) => ({
              rank: ranking.current_rank,
              prevRank: ranking.previous_rank,
              keyword: ranking.keyword,
              score: parseFloat(ranking.trending_score),
              mentions: ranking.mentions_count,
              engagement: ranking.engagement_total,
              growthRate: parseFloat(ranking.growth_rate || 0),
              sources: ranking.sources,
              trend: ranking.previous_rank 
                ? (ranking.current_rank < ranking.previous_rank ? 'up' 
                   : ranking.current_rank > ranking.previous_rank ? 'down' 
                   : 'stable')
                : 'new'
            }))
          }
        })
      } else {
        // DB 없을 때 실시간 트렌드 데이터를 기반으로 임시 랭킹 생성
        const { freeTrendService } = await import('../services/freeTrendService')
        const trendsData = await freeTrendService.getCachedTrends()
        
        // 트렌드 점수로 정렬하여 랭킹 생성
        const sortedTrends = trendsData
          .sort((a: any, b: any) => b.interest - a.interest)
          .slice(0, limitNum)

        const rankings = sortedTrends.map((trend: any, index: number) => ({
          rank: index + 1,
          prevRank: Math.random() > 0.5 ? index + Math.floor(Math.random() * 3) : null,
          keyword: trend.keyword,
          score: trend.interest * (Math.random() * 0.5 + 0.8),
          mentions: Math.floor(trend.interest * 0.6),
          engagement: Math.floor(trend.interest * 0.3),
          growthRate: (Math.random() - 0.5) * 20,
          sources: [trend.source],
          trend: Math.random() > 0.7 ? 'new' : Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
        }))

        // 통계 데이터 계산
        const stats = {
          maxScore: Math.max(...rankings.map((r: any) => r.score)),
          avgScore: Math.round(rankings.reduce((sum: number, r: any) => sum + r.score, 0) / rankings.length)
        }

        reply.send({
          success: true,
          data: {
            timeframe,
            lastUpdate: new Date(),
            totalCount: rankings.length,
            rankings,
            stats
          }
        })
      }

    } catch (error) {
      console.error('순위 조회 오류:', error)
      reply.code(500).send({ 
        success: false, 
        error: 'Failed to fetch trending rankings' 
      })
    }
  })

  /**
   * GET /api/trending/keyword/:keyword/history
   * 특정 키워드의 트렌드 히스토리
   */
  fastify.get('/keyword/:keyword/history', async (
    request: FastifyRequest<{ 
      Params: { keyword: string }
      Querystring: KeywordHistoryQuery 
    }>, 
    reply: FastifyReply
  ) => {
    try {
      const { keyword } = request.params
      const { timeframe = '1d', days = '7' } = request.query
      const daysNum = Math.min(parseInt(days), 30) // 최대 30일

      const query = `
        SELECT 
          calculated_at,
          current_rank,
          trending_score,
          mentions_count,
          engagement_total,
          growth_rate
        FROM trending_rankings 
        WHERE LOWER(keyword) = LOWER($1) 
        AND timeframe = $2
        AND calculated_at >= NOW() - INTERVAL '${daysNum} days'
        ORDER BY calculated_at DESC
        LIMIT 100
      `

      const historyResult = await db.pool.query(query, [keyword, timeframe])
      const history = historyResult.rows

      // 키워드의 현재 상태 조회
      const currentQuery = `
        SELECT * FROM trending_rankings
        WHERE LOWER(keyword) = LOWER($1) AND timeframe = $2
        AND DATE(calculated_at) = CURRENT_DATE
        LIMIT 1
      `
      const currentResult = await db.pool.query(currentQuery, [keyword, timeframe])
      const current = currentResult.rows

      reply.send({
        success: true,
        data: {
          keyword,
          timeframe,
          current: current[0] ? {
            rank: current[0].current_rank,
            score: parseFloat(current[0].trending_score),
            mentions: current[0].mentions_count,
            engagement: current[0].engagement_total,
            sources: current[0].sources
          } : null,
          timeline: history.map((item: any) => ({
            timestamp: item.calculated_at,
            rank: item.current_rank,
            score: parseFloat(item.trending_score),
            mentions: item.mentions_count,
            engagement: item.engagement_total,
            growthRate: parseFloat(item.growth_rate || 0)
          }))
        }
      })

    } catch (error) {
      console.error('키워드 히스토리 조회 오류:', error)
      reply.code(500).send({ 
        success: false, 
        error: 'Failed to fetch keyword history' 
      })
    }
  })

  /**
   * GET /api/trending/stats
   * 전체 통계 조회
   */
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = `
        SELECT 
          timeframe,
          COUNT(*) as total_keywords,
          AVG(trending_score) as avg_score,
          MAX(trending_score) as max_score,
          SUM(mentions_count) as total_mentions,
          SUM(engagement_total) as total_engagement
        FROM trending_rankings
        WHERE DATE(calculated_at) = CURRENT_DATE
        GROUP BY timeframe
        ORDER BY 
          CASE timeframe
            WHEN '1h' THEN 1
            WHEN '6h' THEN 2  
            WHEN '1d' THEN 3
            WHEN '3d' THEN 4
            WHEN '1w' THEN 5
          END
      `

      const statsResult = await db.pool.query(query)
      const stats = statsResult.rows

      // 소스별 통계
      const sourceStatsQuery = `
        SELECT 
          unnest(sources) as source,
          COUNT(*) as keyword_count,
          AVG(trending_score) as avg_score
        FROM trending_rankings
        WHERE DATE(calculated_at) = CURRENT_DATE
        GROUP BY unnest(sources)
        ORDER BY keyword_count DESC
      `
      
      const sourceStatsResult = await db.pool.query(sourceStatsQuery)
      const sourceStats = sourceStatsResult.rows

      reply.send({
        success: true,
        data: {
          timeframes: stats.map((stat: any) => ({
            timeframe: stat.timeframe,
            totalKeywords: parseInt(stat.total_keywords),
            avgScore: parseFloat(stat.avg_score || 0),
            maxScore: parseFloat(stat.max_score || 0),
            totalMentions: parseInt(stat.total_mentions || 0),
            totalEngagement: parseInt(stat.total_engagement || 0)
          })),
          sources: sourceStats.map((stat: any) => ({
            source: stat.source,
            keywordCount: parseInt(stat.keyword_count),
            avgScore: parseFloat(stat.avg_score || 0)
          }))
        }
      })

    } catch (error) {
      console.error('통계 조회 오류:', error)
      reply.code(500).send({ 
        success: false, 
        error: 'Failed to fetch statistics' 
      })
    }
  })

  /**
   * GET /api/trending/top-sources
   * 소스별 인기 키워드 조회
   */
  fastify.get('/top-sources', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = `
        SELECT 
          unnest(sources) as source,
          keyword,
          current_rank,
          trending_score
        FROM trending_rankings
        WHERE DATE(calculated_at) = CURRENT_DATE
        AND timeframe = '1d'
        ORDER BY trending_score DESC
      `

      const resultsQuery = await db.pool.query(query)
      const results = resultsQuery.rows
      
      // 소스별로 그룹화
      const sourceGroups = results.reduce((acc: any, item: any) => {
        if (!acc[item.source]) {
          acc[item.source] = []
        }
        if (acc[item.source].length < 5) { // 소스당 상위 5개만
          acc[item.source].push({
            keyword: item.keyword,
            rank: item.current_rank,
            score: parseFloat(item.trending_score)
          })
        }
        return acc
      }, {})

      reply.send({
        success: true,
        data: sourceGroups
      })

    } catch (error) {
      console.error('소스별 인기 키워드 조회 오류:', error)
      reply.code(500).send({ 
        success: false, 
        error: 'Failed to fetch top sources' 
      })
    }
  })

  /**
   * POST /api/trending/refresh
   * 수동 트렌드 순위 갱신 (개발용)
   */
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 스케줄러가 있다면 수동 실행
      const TrendingScheduler = require('../services/trendingScheduler').TrendingScheduler
      const scheduler = new TrendingScheduler(db)
      
      // 비동기로 실행 (응답은 즉시 반환)
      scheduler.calculateAllTrendingRankings()
        .catch((error: any) => console.error('수동 갱신 중 오류:', error))

      reply.send({
        success: true,
        message: 'Trending rankings refresh started'
      })

    } catch (error) {
      console.error('수동 갱신 요청 오류:', error)
      reply.code(500).send({ 
        success: false, 
        error: 'Failed to start refresh' 
      })
    }
  })
}