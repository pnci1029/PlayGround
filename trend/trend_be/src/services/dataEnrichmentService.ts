import { TrendData } from '../types/trend.types'

interface WikipediaPageSummary {
  extract?: string
  extract_html?: string
  content_urls?: {
    desktop?: {
      page?: string
    }
  }
}

interface WikipediaRelatedResponse {
  pages?: Array<{
    title: string
  }>
}

interface CacheItem<T> {
  data: T
  timestamp: number
}

export class DataEnrichmentService {
  private cache = new Map<string, CacheItem<unknown>>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30분 캐시

  // Wikipedia API를 통한 키워드 설명 조회
  async getWikipediaInfo(keyword: string): Promise<{ description?: string; summary?: string; wikipediaUrl?: string }> {
    try {
      const cacheKey = `wiki_${keyword}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data as { description?: string; summary?: string; wikipediaUrl?: string }
      }

      // 1. 위키피디아 검색 API
      const searchResponse = await fetch(
        `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`
      )
      
      if (searchResponse.ok) {
        const data = await searchResponse.json() as WikipediaPageSummary
        const result = {
          description: data.extract,
          summary: data.extract_html ? data.extract_html.replace(/<[^>]*>/g, '') : data.extract,
          wikipediaUrl: data.content_urls?.desktop?.page
        }
        
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
        return result
      }

      // 2. 영어 위키피디아 대안 (한국어에서 찾을 수 없는 경우)
      const enSearchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`
      )
      
      if (enSearchResponse.ok) {
        const enData = await enSearchResponse.json() as WikipediaPageSummary
        const result = {
          description: enData.extract,
          summary: enData.extract_html ? enData.extract_html.replace(/<[^>]*>/g, '') : enData.extract,
          wikipediaUrl: enData.content_urls?.desktop?.page
        }
        
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
        return result
      }

      return {}
    } catch (error) {
      console.error(`Wikipedia API 오류 (${keyword}):`, error)
      return {}
    }
  }

  // 관련 키워드 추출 (Wikipedia 링크 기반)
  async getRelatedKeywords(keyword: string): Promise<string[]> {
    try {
      const cacheKey = `related_${keyword}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data as string[]
      }

      // Wikipedia의 "관련 항목" 섹션에서 키워드 추출
      const response = await fetch(
        `https://ko.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(keyword)}`
      )
      
      if (response.ok) {
        const data = await response.json() as WikipediaRelatedResponse
        const related = data.pages?.map((page) => page.title).slice(0, 5) || []
        
        this.cache.set(cacheKey, { data: related, timestamp: Date.now() })
        return related
      }

      return []
    } catch (error) {
      console.error(`관련 키워드 조회 오류 (${keyword}):`, error)
      return []
    }
  }

  // 뉴스 컨텍스트 조회 (Google News RSS)
  async getNewsContext(keyword: string): Promise<{ newsContext?: string; trendReason?: string }> {
    try {
      const cacheKey = `news_${keyword}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data as { newsContext?: string; trendReason?: string }
      }

      // Google News RSS (한국어)
      const response = await fetch(
        `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`
      )
      
      if (response.ok) {
        const xmlText = await response.text()
        
        // RSS XML에서 첫 번째 뉴스 제목과 설명 추출
        const titleMatch = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)
        const descMatch = xmlText.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g)
        
        if (titleMatch && titleMatch.length > 1) { // 첫 번째는 채널 제목이므로 skip
          const newsTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '')
          const newsDesc = descMatch && descMatch[1] 
            ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '')
            : ''
          
          const result = {
            newsContext: newsDesc || newsTitle,
            trendReason: `최근 "${newsTitle}"와 관련하여 주목받고 있습니다.`
          }
          
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
          return result
        }
      }

      return {}
    } catch (error) {
      console.error(`뉴스 컨텍스트 조회 오류 (${keyword}):`, error)
      return {}
    }
  }

  // 키워드 태그 생성 (카테고리 기반)
  generateTags(trendData: TrendData): string[] {
    const tags: string[] = []
    
    // 카테고리 기반 태그
    switch (trendData.category) {
      case '검색어':
        tags.push('인기검색어', '실시간', '한국트렌드')
        break
      case '쇼핑':
        tags.push('쇼핑', '상품', '구매', '온라인몰')
        break
      case '영상':
        tags.push('유튜브', '영상콘텐츠', '미디어')
        break
      case 'IT':
        tags.push('기술', '개발', 'IT', '프로그래밍')
        break
      default:
        tags.push('트렌드', '인기')
    }
    
    // 소스 기반 태그
    switch (trendData.source) {
      case 'korean_search':
        tags.push('검색')
        break
      case 'shopping':
        tags.push('이커머스')
        break
      case 'youtube':
        tags.push('동영상')
        break
      case 'tech':
        tags.push('테크')
        break
    }
    
    return [...new Set(tags)] // 중복 제거
  }

  // 종합 데이터 강화
  async enrichTrendData(trendData: TrendData): Promise<TrendData> {
    console.log(`🔍 데이터 강화 중: ${trendData.keyword}`)
    
    const [wikipediaInfo, relatedKeywords, newsContext] = await Promise.allSettled([
      this.getWikipediaInfo(trendData.keyword),
      this.getRelatedKeywords(trendData.keyword),
      this.getNewsContext(trendData.keyword)
    ])

    const enriched: TrendData = {
      ...trendData,
      tags: this.generateTags(trendData)
    }

    if (wikipediaInfo.status === 'fulfilled') {
      enriched.description = wikipediaInfo.value.description
      enriched.summary = wikipediaInfo.value.summary
      enriched.wikipediaUrl = wikipediaInfo.value.wikipediaUrl
    }

    if (relatedKeywords.status === 'fulfilled') {
      enriched.relatedKeywords = relatedKeywords.value
    }

    if (newsContext.status === 'fulfilled') {
      enriched.newsContext = newsContext.value.newsContext
      enriched.trendReason = newsContext.value.trendReason
    }

    console.log(`✅ 데이터 강화 완료: ${trendData.keyword} (${enriched.tags?.length || 0}개 태그)`)
    return enriched
  }

  // 배치 데이터 강화 (성능 최적화)
  async enrichTrendDataBatch(trendDataList: TrendData[]): Promise<TrendData[]> {
    console.log(`🚀 배치 데이터 강화 시작: ${trendDataList.length}개 항목`)
    const startTime = Date.now()

    // RSS 및 해외 소스는 우선 강화, 상위 40개까지 강화 (범위 확대)
    const rssAndGlobalTrends = trendDataList.filter(trend => 
      ['rss', 'hackernews', 'reddit', 'github', 'devto'].includes(trend.source)
    ).slice(0, 15)
    
    const koreanTrends = trendDataList.filter(trend => 
      !['rss', 'hackernews', 'reddit', 'github', 'devto'].includes(trend.source)
    ).slice(0, 25)
    
    const trendsToEnrich = [...rssAndGlobalTrends, ...koreanTrends]
    const remainingTrends = trendDataList.filter(trend => 
      !trendsToEnrich.some(t => t.keyword === trend.keyword)
    )

    // 병렬 처리로 성능 개선
    const enrichedPromises = trendsToEnrich.map(trend => this.enrichTrendData(trend))
    const enrichedResults = await Promise.allSettled(enrichedPromises)

    const enrichedTrends = enrichedResults.map((result, index) => 
      result.status === 'fulfilled' ? result.value : trendsToEnrich[index]
    )

    const allResults = [...enrichedTrends, ...remainingTrends]
    
    const endTime = Date.now()
    console.log(`🎉 배치 데이터 강화 완료: ${allResults.length}개 항목 (${endTime - startTime}ms)`)
    
    return allResults
  }
}

export const dataEnrichmentService = new DataEnrichmentService()