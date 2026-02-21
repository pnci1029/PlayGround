import { FastifyRequest, FastifyReply } from 'fastify'
import { Pool } from 'pg'
import { ToolStats, ToolBadges, StatsResponse, VisitRequest } from '../types/stats'

export class StatsService {
  constructor(private pool: Pool) {}

  async recordVisit(request: FastifyRequest<{ Body: VisitRequest }>, reply: FastifyReply) {
    try {
      const { tool_name } = request.body
      const user_ip = request.ip

      if (!tool_name) {
        return reply.status(400).send({ error: 'Tool name is required' })
      }

      // 도구 통계 업데이트
      const updateStatsQuery = `
        INSERT INTO tool_stats (tool_name, total_visits, daily_visits, weekly_visits, last_visited)
        VALUES ($1, 1, 1, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (tool_name) 
        DO UPDATE SET 
          total_visits = tool_stats.total_visits + 1,
          daily_visits = tool_stats.daily_visits + 1,
          weekly_visits = tool_stats.weekly_visits + 1,
          last_visited = CURRENT_TIMESTAMP
      `
      
      await this.pool.query(updateStatsQuery, [tool_name])

      // 일별 방문 통계 업데이트
      const dailyStatsQuery = `
        INSERT INTO daily_tool_visits (tool_name, visit_date, visit_count)
        VALUES ($1, CURRENT_DATE, 1)
        ON CONFLICT (tool_name, visit_date)
        DO UPDATE SET visit_count = daily_tool_visits.visit_count + 1
      `
      
      await this.pool.query(dailyStatsQuery, [tool_name])

      reply.status(200).send({ success: true, tool_name })
    } catch (error) {
      console.error('Error recording visit:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getToolStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 모든 도구 통계 가져오기
      const statsQuery = `
        SELECT * FROM tool_stats 
        ORDER BY total_visits DESC
      `
      const statsResult = await this.pool.query(statsQuery)
      const allStats: ToolStats[] = statsResult.rows

      // 뱃지 계산
      const badges: Record<string, ToolBadges> = {}
      
      // 통계 기준값 계산
      const totalVisits = allStats.map(s => s.total_visits)
      const weeklyVisits = allStats.map(s => s.weekly_visits)
      
      const hotThreshold = this.calculatePercentile(totalVisits, 80) // 상위 20%
      const trendingThreshold = this.calculatePercentile(weeklyVisits, 70) // 상위 30%

      allStats.forEach(stat => {
        const isNew = this.isNewTool(stat.created_date)
        const isHot = stat.total_visits >= hotThreshold
        const isTrending = stat.weekly_visits >= trendingThreshold

        const toolBadges: ('NEW' | 'HOT' | 'TRENDING')[] = []
        if (isNew) toolBadges.push('NEW')
        if (isHot) toolBadges.push('HOT')
        if (isTrending) toolBadges.push('TRENDING')

        badges[stat.tool_name] = {
          tool_name: stat.tool_name,
          badges: toolBadges,
          visit_count: stat.total_visits,
          is_new: isNew,
          is_hot: isHot,
          is_trending: isTrending
        }
      })

      // 전체 통계
      const globalStats = {
        total_tools: allStats.length,
        total_visits: allStats.reduce((sum, s) => sum + s.total_visits, 0),
        active_tools: allStats
          .filter(s => s.last_visited > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .map(s => s.tool_name)
      }

      const response: StatsResponse = {
        badges,
        global_stats: globalStats
      }

      reply.send(response)
    } catch (error) {
      console.error('Error fetching tool stats:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)] || 0
  }

  private isNewTool(createdDate: Date): boolean {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return new Date(createdDate) > sevenDaysAgo
  }

  async getPopularTools(request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) {
    try {
      const { limit = 6 } = request.query

      const query = `
        SELECT tool_name, total_visits, weekly_visits, created_date
        FROM tool_stats 
        ORDER BY weekly_visits DESC, total_visits DESC
        LIMIT $1
      `
      
      const result = await this.pool.query(query, [limit])
      reply.send(result.rows)
    } catch (error) {
      console.error('Error fetching popular tools:', error)
      reply.status(500).send({ error: 'Internal server error' })
    }
  }
}