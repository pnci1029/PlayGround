// Trending Score Calculation Service
// 화제성 점수 계산 및 순위 시스템

interface TrendingScoreData {
  keyword: string
  mentions: number
  engagement: number
  sources: string[]
  timeframe: string
  growthRate: number
  timestamp: Date
}

interface SourceWeights {
  [key: string]: number
}

interface TrendingResult {
  keyword: string
  score: number
  rank: number
  mentions: number
  engagement: number
  sources: string[]
  growthRate: number
  trend?: 'up' | 'down' | 'new' | 'stable'
}

export class TrendingCalculator {
  private sourceWeights: SourceWeights = {
    hackernews: 2.0,    // 기술 전문성 높음
    reddit: 1.5,        // 대중적 관심도
    github: 1.8,        // 개발 트렌드
    devto: 1.3,         // 개발자 커뮤니티
    rss: 1.0            // 일반 뉴스
  }

  private timeframeMultipliers = {
    '1h': 2.0,   // 짧은 시간대일수록 높은 가중치 (급상승 트렌드 반영)
    '6h': 1.5,
    '1d': 1.0,
    '3d': 0.8,
    '1w': 0.6
  }

  /**
   * 화제성 점수 계산
   * 공식: (기본점수 + 상호작용보너스 + 성장보너스) * 소스가중치 * 시간대가중치
   */
  calculateTrendingScore(data: TrendingScoreData): number {
    const baseScore = data.mentions * 1.0
    const engagementBonus = data.engagement * 0.5
    const sourceMultiplier = this.getSourceWeight(data.sources)
    const growthBonus = Math.max(0, data.growthRate * 10)
    const timeframeMultiplier = this.getTimeframeMultiplier(data.timeframe)
    
    // 시간 가중치 (최근일수록 높은 점수)
    const timeWeight = this.calculateTimeWeight(data.timestamp, data.timeframe)
    
    const finalScore = (baseScore + engagementBonus + growthBonus) * 
                      sourceMultiplier * 
                      timeframeMultiplier * 
                      timeWeight

    return Math.round(finalScore * 100) / 100 // 소수점 2자리
  }

  /**
   * 소스별 가중치 계산
   */
  private getSourceWeight(sources: string[]): number {
    if (sources.length === 0) return 1.0
    
    const weights = sources.map(source => this.sourceWeights[source] || 1.0)
    const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length
    
    // 다양한 소스에서 언급될수록 추가 보너스
    const diversityBonus = sources.length > 1 ? 1 + (sources.length - 1) * 0.1 : 1
    
    return avgWeight * diversityBonus
  }

  /**
   * 시간대별 가중치
   */
  private getTimeframeMultiplier(timeframe: string): number {
    return this.timeframeMultipliers[timeframe as keyof typeof this.timeframeMultipliers] || 1.0
  }

  /**
   * 시간 가중치 계산 (최근일수록 높은 점수)
   */
  private calculateTimeWeight(timestamp: Date, timeframe: string): number {
    const now = new Date()
    const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
    
    const timeframeHours: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '1d': 24,
      '3d': 72,
      '1w': 168
    }
    const maxHours = timeframeHours[timeframe] || 24

    // 최근일수록 높은 가중치 (지수적 감소)
    const decayRate = 0.1
    return Math.exp(-decayRate * (hoursDiff / maxHours))
  }

  /**
   * 키워드 정규화 (동의어 처리)
   */
  normalizeKeyword(keyword: string, synonyms?: Map<string, string[]>): string {
    const cleaned = keyword.trim().toLowerCase()
    
    if (synonyms) {
      for (const [canonical, variants] of synonyms) {
        if (variants.some(variant => cleaned.includes(variant.toLowerCase()))) {
          return canonical
        }
      }
    }

    return this.capitalizeFirst(cleaned)
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * 성장률 계산
   */
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  /**
   * 순위 변동 방향 계산
   */
  calculateTrendDirection(currentRank: number, previousRank?: number): 'up' | 'down' | 'new' | 'stable' {
    if (!previousRank) return 'new'
    
    if (currentRank < previousRank) return 'up'    // 순위가 올라감 (숫자가 작아짐)
    if (currentRank > previousRank) return 'down'  // 순위가 내려감 (숫자가 커짐)
    return 'stable'
  }

  /**
   * 여러 키워드 데이터를 받아서 순위 계산
   */
  calculateRankings(
    data: TrendingScoreData[], 
    previousRankings?: Map<string, number>
  ): TrendingResult[] {
    // 1. 점수 계산
    const scoredData = data.map(item => ({
      ...item,
      score: this.calculateTrendingScore(item)
    }))

    // 2. 점수 순으로 정렬하여 순위 매기기
    const rankedData = scoredData
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        keyword: item.keyword,
        score: item.score,
        rank: index + 1,
        mentions: item.mentions,
        engagement: item.engagement,
        sources: item.sources,
        growthRate: item.growthRate,
        trend: this.calculateTrendDirection(
          index + 1, 
          previousRankings?.get(item.keyword)
        )
      }))

    return rankedData
  }

  /**
   * 시간대별 데이터 집계
   */
  async aggregateDataByTimeframe(
    rawTrends: any[], 
    timeframe: string
  ): Promise<TrendingScoreData[]> {
    const timeframeHoursMap: Record<string, number> = {
      '1h': 1,
      '6h': 6, 
      '1d': 24,
      '3d': 72,
      '1w': 168
    }
    const timeframeHours = timeframeHoursMap[timeframe] || 24

    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - timeframeHours)

    // 시간대 내 데이터만 필터링
    const filteredTrends = rawTrends.filter(trend => 
      new Date(trend.timestamp) >= cutoffTime
    )

    // 키워드별로 집계
    const aggregated = new Map<string, {
      mentions: number
      engagement: number
      sources: Set<string>
      timestamps: Date[]
    }>()

    filteredTrends.forEach(trend => {
      const normalized = this.normalizeKeyword(trend.keyword)
      
      if (!aggregated.has(normalized)) {
        aggregated.set(normalized, {
          mentions: 0,
          engagement: 0,
          sources: new Set(),
          timestamps: []
        })
      }

      const data = aggregated.get(normalized)!
      data.mentions += 1
      data.engagement += trend.interest || trend.engagement || 0
      data.sources.add(trend.source)
      data.timestamps.push(new Date(trend.timestamp))
    })

    // TrendingScoreData 형태로 변환
    const result: TrendingScoreData[] = []
    
    for (const [keyword, data] of aggregated) {
      // 최근 시간과 이전 시간의 언급량 비교로 성장률 계산
      const halfTime = timeframeHours / 2
      const halfCutoff = new Date()
      halfCutoff.setHours(halfCutoff.getHours() - halfTime)
      
      const recentMentions = data.timestamps.filter(t => t >= halfCutoff).length
      const earlierMentions = data.mentions - recentMentions
      const growthRate = this.calculateGrowthRate(recentMentions, earlierMentions)

      result.push({
        keyword,
        mentions: data.mentions,
        engagement: data.engagement,
        sources: Array.from(data.sources),
        timeframe,
        growthRate,
        timestamp: data.timestamps.sort((a, b) => b.getTime() - a.getTime())[0] // 가장 최근 시간
      })
    }

    return result
  }
}