import { TrendData } from '../types/trend.types'
import { dataEnrichmentService } from './dataEnrichmentService'

export class KoreanTrendService {
  private cache = new Map<string, any>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10분 캐시

  // 1. 한국 검색 트렌드 - Google Trends RSS 사용
  async getKoreanSearchTrends(): Promise<TrendData[]> {
    try {
      console.log('🔍 구글 트렌드 한국 데이터 수집 중...')
      
      // Google Trends RSS - 한국 실시간 트렌드
      const response = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR')
      const xmlText = await response.text()
      
      const trends: TrendData[] = []
      
      // RSS XML 파싱 - 한국어 검색어 추출
      const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g
      const linkRegex = /<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/g
      
      const titles: string[] = []
      const links: string[] = []
      
      let match
      while ((match = titleRegex.exec(xmlText)) !== null) {
        const title = match[1] || match[2]
        if (title && !title.includes('트렌드') && !title.includes('Google') && title.length > 2) {
          titles.push(title.trim())
        }
      }
      
      while ((match = linkRegex.exec(xmlText)) !== null) {
        const link = match[1] || match[2]
        if (link && link.startsWith('http')) {
          links.push(link.trim())
        }
      }

      // 상위 15개 추출
      titles.slice(1, 16).forEach((keyword, index) => {
        if (keyword && keyword.length > 1) {
          trends.push({
            keyword: keyword.length > 50 ? keyword.substring(0, 47) + '...' : keyword,
            interest: 100 - (index * 2), // 실시간 관심도 시뮬레이션
            category: '검색어',
            source: 'korean_search' as const,
            timestamp: new Date(),
            region: 'Korea',
            url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
            rank: index + 1
          })
        }
      })

      if (trends.length === 0) {
        console.warn('⚠️ Google Trends 데이터 없음, Naver 실시간 검색 시도')
        return await this.getNaverRealTimeSearch()
      }

      console.log(`✅ 구글 트렌드: ${trends.length}개 수집 완료`)
      return trends
    } catch (error) {
      console.error('❌ Google Trends 오류:', error)
      return await this.getNaverRealTimeSearch()
    }
  }

  // Naver 실시간 검색어 백업 (Google Trends 실패시)
  private async getNaverRealTimeSearch(): Promise<TrendData[]> {
    try {
      console.log('🔍 네이버 실시간 검색 시도...')
      // Naver Open API나 크롤링 대신 안전한 방법 사용
      // 실제로는 공식 API를 사용해야 함
      return []
    } catch (error) {
      console.error('❌ 네이버 실시간 검색 실패:', error)
      return []
    }
  }

  // 2. 한국 쇼핑 트렌드 - 실제 데이터는 제거 (더미 데이터 금지)
  async getShoppingTrends(): Promise<TrendData[]> {
    // 쇼핑 트렌드는 실제 API가 필요하므로 현재 비활성화
    // 실제 네이버 쇼핑이나 이커머스 API 연동 시 활성화
    console.log('⚠️ 쇼핑 트렌드: 실제 API 연동 필요 (더미 데이터 제거됨)')
    return []
  }

  // 3. 유튜브 한국 트렌드 - 더미 데이터 제거
  async getYoutubeTrends(): Promise<TrendData[]> {
    // 유튜브 트렌드는 실제 YouTube API가 필요하므로 현재 비활성화
    // YouTube Data API v3 연동 시 활성화
    console.log('⚠️ 유튜브 트렌드: 실제 API 연동 필요 (더미 데이터 제거됨)')
    return []
  }

  // 4. IT/기술 트렌드 - 더미 데이터 제거  
  async getItTrends(): Promise<TrendData[]> {
    // IT 트렌드는 HackerNews, GitHub, Dev.to 등 실제 소스에서 이미 수집하므로 중복 제거
    console.log('⚠️ IT 트렌드: 실제 소스(HackerNews, GitHub, Dev.to)에서 수집 중 (더미 데이터 제거됨)')
    return []
  }

  // 5. 통합 한국 트렌드 (데이터 강화 포함)
  async getAllKoreanTrends(): Promise<TrendData[]> {
    console.log('🇰🇷 한국 트렌드 수집 시작...')
    const startTime = Date.now()
    
    const [search, shopping, youtube, tech] = await Promise.allSettled([
      this.getKoreanSearchTrends(),
      this.getShoppingTrends(), 
      this.getYoutubeTrends(),
      this.getItTrends()
    ])

    const allTrends: TrendData[] = []
    
    if (search.status === 'fulfilled') allTrends.push(...search.value.slice(0, 15))
    if (shopping.status === 'fulfilled') allTrends.push(...shopping.value.slice(0, 20))
    if (youtube.status === 'fulfilled') allTrends.push(...youtube.value.slice(0, 15))
    if (tech.status === 'fulfilled') allTrends.push(...tech.value.slice(0, 24))

    // 관심도 기준으로 정렬
    allTrends.sort((a, b) => b.interest - a.interest)
    const topTrends = allTrends.slice(0, 100) // 상위 100개

    // 데이터 강화 적용 (상위 20개만)
    console.log('📈 트렌드 데이터 강화 시작...')
    const enrichedTrends = await dataEnrichmentService.enrichTrendDataBatch(topTrends)

    const endTime = Date.now()
    console.log(`🎉 한국 트렌드 ${enrichedTrends.length}개 수집 및 강화 완료 (${endTime - startTime}ms)`)

    return enrichedTrends
  }
}

export const koreanTrendService = new KoreanTrendService()