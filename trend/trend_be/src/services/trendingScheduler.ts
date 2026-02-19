// Trending Ranking Scheduler Service
// 주기적으로 트렌드 순위를 계산하고 DB에 저장

import { DatabaseService } from './database'
import { TrendingCalculator } from './trendingCalculator'

interface RankingData {
  keyword: string
  timeframe: string
  current_rank: number
  previous_rank?: number
  trending_score: number
  mentions_count: number
  engagement_total: number
  growth_rate: number
  sources: string[]
}

export class TrendingScheduler {
  private db: DatabaseService
  private calculator: TrendingCalculator
  private isProcessing: boolean = false

  constructor(db: DatabaseService) {
    this.db = db
    this.calculator = new TrendingCalculator()
  }

  /**
   * 모든 시간대에 대해 트렌드 순위 계산 (매 10분마다 실행)
   */
  async calculateAllTrendingRankings(): Promise<void> {
    if (this.isProcessing) {
      console.log('이미 트렌드 계산이 진행 중입니다.')
      return
    }

    this.isProcessing = true
    
    try {
      console.log('트렌드 순위 계산 시작:', new Date().toISOString())
      
      const timeframes = ['1h', '6h', '1d', '3d', '1w']
      
      for (const timeframe of timeframes) {
        await this.processTimeframe(timeframe)
        console.log(`${timeframe} 시간대 처리 완료`)
      }

      console.log('트렌드 순위 계산 완료:', new Date().toISOString())
      
    } catch (error) {
      console.error('트렌드 순위 계산 중 오류:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 특정 시간대의 트렌드 순위 계산
   */
  private async processTimeframe(timeframe: string): Promise<void> {
    try {
      // 1. 해당 시간대의 원시 데이터 조회
      const rawTrends = await this.getRawTrendsForTimeframe(timeframe)
      
      if (rawTrends.length === 0) {
        console.log(`${timeframe} 시간대에 데이터가 없습니다.`)
        return
      }

      // 2. 데이터 집계 및 화제성 점수 계산 준비
      const aggregatedData = await this.calculator.aggregateDataByTimeframe(rawTrends, timeframe)
      
      if (aggregatedData.length === 0) {
        console.log(`${timeframe} 시간대에 집계된 데이터가 없습니다.`)
        return
      }

      // 3. 이전 순위 조회
      const previousRankings = await this.getPreviousRankings(timeframe)

      // 4. 순위 계산
      const rankings = this.calculator.calculateRankings(aggregatedData, previousRankings)

      // 5. 상위 100개만 저장 (성능 최적화)
      const topRankings = rankings.slice(0, 100)

      // 6. DB에 저장
      await this.saveTrendingRankings(topRankings, timeframe)

      // 7. 시간대별 통계도 함께 저장
      await this.saveHourlyStats(aggregatedData, timeframe)

      console.log(`${timeframe}: ${topRankings.length}개 키워드 순위 업데이트`)

    } catch (error) {
      console.error(`${timeframe} 시간대 처리 중 오류:`, error)
    }
  }

  /**
   * 시간대별 원시 트렌드 데이터 조회
   */
  private async getRawTrendsForTimeframe(timeframe: string): Promise<any[]> {
    const timeframeHoursMap: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '1d': 24,
      '3d': 72,
      '1w': 168
    }
    const timeframeHours = timeframeHoursMap[timeframe] || 24

    // 기존 trends 테이블이 있다면 사용, 없다면 임시 데이터 생성
    try {
      const query = `
        SELECT keyword, source, interest as engagement, timestamp, region, category
        FROM trends 
        WHERE timestamp >= NOW() - INTERVAL '${timeframeHours} hours'
        AND keyword IS NOT NULL
        ORDER BY timestamp DESC
      `
      
      const result = await this.db.query(query)
      return result || []
      
    } catch (error) {
      console.log('기존 trends 테이블이 없어서 임시 데이터를 생성합니다.')
      return this.generateSampleTrendData(timeframe)
    }
  }

  /**
   * 이전 순위 조회
   */
  private async getPreviousRankings(timeframe: string): Promise<Map<string, number>> {
    const query = `
      SELECT keyword, current_rank
      FROM trending_rankings
      WHERE timeframe = $1 
      AND calculated_at >= CURRENT_DATE - INTERVAL '1 day'
      ORDER BY calculated_at DESC
      LIMIT 1000
    `
    
    const result = await this.db.query(query, [timeframe])
    const rankings = new Map<string, number>()
    
    result.forEach((row: any) => {
      rankings.set(row.keyword, row.current_rank)
    })

    return rankings
  }

  /**
   * 트렌드 순위 DB 저장
   */
  private async saveTrendingRankings(rankings: any[], timeframe: string): Promise<void> {
    if (rankings.length === 0) return

    // 기존 오늘 데이터 삭제
    await this.db.query(`
      DELETE FROM trending_rankings 
      WHERE timeframe = $1 AND DATE(calculated_at) = CURRENT_DATE
    `, [timeframe])

    // 새 순위 데이터 삽입
    const values = rankings.map(ranking => 
      `('${ranking.keyword}', '${timeframe}', ${ranking.rank}, ${ranking.trend === 'new' ? 'NULL' : (ranking.previousRank || 'NULL')}, ${ranking.score}, ${ranking.mentions}, ${ranking.engagement}, ${ranking.growthRate || 0}, ARRAY[${ranking.sources.map((s: string) => `'${s}'`).join(',')}])`
    ).join(',')

    const insertQuery = `
      INSERT INTO trending_rankings 
      (keyword, timeframe, current_rank, previous_rank, trending_score, mentions_count, engagement_total, growth_rate, sources)
      VALUES ${values}
    `

    await this.db.query(insertQuery)
  }

  /**
   * 시간별 통계 저장
   */
  private async saveHourlyStats(data: any[], timeframe: string): Promise<void> {
    const currentHour = new Date()
    currentHour.setMinutes(0, 0, 0) // 정시로 설정

    for (const item of data) {
      const sourceBreakdown = item.sources.reduce((acc: any, source: string) => {
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})

      const query = `
        INSERT INTO trending_stats_hourly 
        (keyword, hour_timestamp, mentions, engagement, unique_sources, source_breakdown)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (keyword, hour_timestamp) 
        DO UPDATE SET 
          mentions = EXCLUDED.mentions,
          engagement = EXCLUDED.engagement,
          unique_sources = EXCLUDED.unique_sources,
          source_breakdown = EXCLUDED.source_breakdown
      `

      await this.db.query(query, [
        item.keyword,
        currentHour,
        item.mentions,
        item.engagement,
        item.sources.length,
        JSON.stringify(sourceBreakdown)
      ])
    }
  }

  /**
   * 임시 샘플 데이터 생성 (테스트용)
   */
  private generateSampleTrendData(timeframe: string): any[] {
    const sampleKeywords = [
      { keyword: 'ChatGPT', engagement: 1500, sources: ['hackernews', 'reddit'] },
      { keyword: 'React 19', engagement: 1200, sources: ['github', 'devto'] },
      { keyword: 'TypeScript 5', engagement: 900, sources: ['hackernews', 'devto'] },
      { keyword: 'Next.js 14', engagement: 800, sources: ['github', 'reddit'] },
      { keyword: 'AI Coding', engagement: 1100, sources: ['hackernews', 'reddit', 'devto'] },
      { keyword: 'Docker', engagement: 600, sources: ['github', 'devto'] },
      { keyword: 'Kubernetes', engagement: 700, sources: ['hackernews', 'github'] },
      { keyword: 'Python 3.13', engagement: 850, sources: ['reddit', 'devto'] },
      { keyword: 'WebAssembly', engagement: 500, sources: ['hackernews', 'github'] },
      { keyword: 'Rust', engagement: 950, sources: ['hackernews', 'reddit', 'github'] }
    ]

    const now = new Date()
    const data: any[] = []

    sampleKeywords.forEach((item, index) => {
      // 각 키워드에 대해 여러 개의 언급 생성
      const mentionCount = Math.floor(Math.random() * 20) + 5
      
      for (let i = 0; i < mentionCount; i++) {
        const timestamp = new Date(now.getTime() - Math.random() * (24 * 60 * 60 * 1000))
        const randomSource = item.sources[Math.floor(Math.random() * item.sources.length)]
        
        data.push({
          keyword: item.keyword,
          source: randomSource,
          engagement: Math.floor(item.engagement + (Math.random() - 0.5) * 200),
          timestamp: timestamp,
          region: 'global',
          category: 'tech'
        })
      }
    })

    return data
  }

  /**
   * 오래된 데이터 정리
   */
  async cleanupOldData(): Promise<void> {
    try {
      // 30일 이상 된 히스토리 삭제
      await this.db.query(`
        DELETE FROM trending_history 
        WHERE recorded_at < NOW() - INTERVAL '30 days'
      `)

      // 7일 이상 된 시간별 통계 삭제
      await this.db.query(`
        DELETE FROM trending_stats_hourly 
        WHERE hour_timestamp < NOW() - INTERVAL '7 days'
      `)

      console.log('오래된 트렌드 데이터 정리 완료')
      
    } catch (error) {
      console.error('데이터 정리 중 오류:', error)
    }
  }

  /**
   * 스케줄러 시작
   */
  start(): void {
    console.log('트렌드 순위 스케줄러 시작')

    // 매 10분마다 순위 계산
    setInterval(async () => {
      await this.calculateAllTrendingRankings()
    }, 10 * 60 * 1000) // 10분

    // 매일 자정에 오래된 데이터 정리
    setInterval(async () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() < 10) {
        await this.cleanupOldData()
      }
    }, 10 * 60 * 1000) // 10분마다 체크하지만 자정에만 실행

    // 초기 실행
    setTimeout(() => {
      this.calculateAllTrendingRankings()
    }, 5000) // 5초 후 첫 실행
  }
}