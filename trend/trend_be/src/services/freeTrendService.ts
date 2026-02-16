import { TrendData, TrendCache } from '../types/trend.types'
import { databaseService, StoredTrendData } from './database'

// API 응답 타입 정의
interface HackerNewsStory {
  id: number
  title: string
  url?: string
  score: number
}

interface RedditPost {
  data: {
    title: string
    score: number
    subreddit_name_prefixed: string
    permalink: string
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

interface GitHubRepo {
  name: string
  description?: string
  stargazers_count: number
  language?: string
  html_url: string
}

interface GitHubSearchResponse {
  items: GitHubRepo[]
}

interface DevToArticle {
  title: string
  public_reactions_count: number
  url: string
}

export class FreeTrendService {
  private cache = new Map<string, TrendCache>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

  // 1. HackerNews API (완전 무료, 공식)
  async getHackerNewsTrends(): Promise<TrendData[]> {
    try {
      console.log('🔍 HackerNews 트렌드 수집 중...')
      
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      const storyIds = await response.json()
      
      // 상위 15개 스토리만 가져오기
      const storyPromises = (storyIds as number[]).slice(0, 15).map(async (id: number) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        return storyResponse.json()
      })
      
      const stories = await Promise.all(storyPromises) as HackerNewsStory[]
      
      const trends = stories
        .filter((story: HackerNewsStory) => story && story.title)
        .map((story: HackerNewsStory, index: number) => ({
          keyword: story.title,
          interest: story.score || 0,
          category: 'Tech News',
          source: 'hackernews' as const,
          timestamp: new Date(),
          region: 'Global',
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          rank: index + 1
        }))

      console.log(`✅ HackerNews: ${trends.length}개 수집 완료`)
      return trends
    } catch (error) {
      console.error('❌ HackerNews API Error:', error)
      return []
    }
  }

  // 2. Reddit 공식 JSON (무료, 공식)
  async getRedditTrends(): Promise<TrendData[]> {
    try {
      console.log('🔍 Reddit 트렌드 수집 중...')
      
      const subreddits = ['all', 'popular', 'programming']
      const allPosts: TrendData[] = []

      for (const subreddit of subreddits) {
        try {
          const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=8`)
          const data = await response.json() as RedditResponse
          
          if (data?.data?.children) {
            const posts = data.data.children.map((post: RedditPost, index: number) => ({
              keyword: post.data.title.length > 80 
                ? post.data.title.substring(0, 77) + '...' 
                : post.data.title,
              interest: post.data.score || 0,
              category: post.data.subreddit_name_prefixed || 'r/unknown',
              source: 'reddit' as const,
              timestamp: new Date(),
              region: 'Global',
              url: `https://reddit.com${post.data.permalink}`,
              rank: allPosts.length + index + 1
            }))
            
            allPosts.push(...posts)
          }
          
          // Rate limiting 준수
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (subError) {
          console.warn(`⚠️ Reddit r/${subreddit} 건너뜀:`, subError)
        }
      }

      const trends = allPosts.slice(0, 20)
      console.log(`✅ Reddit: ${trends.length}개 수집 완료`)
      return trends
    } catch (error) {
      console.error('❌ Reddit API Error:', error)
      return []
    }
  }

  // 3. GitHub API (무료 티어, 공식)
  async getGitHubTrends(): Promise<TrendData[]> {
    try {
      console.log('🔍 GitHub 트렌드 수집 중...')
      
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const dateStr = yesterday.toISOString().split('T')[0]
      
      const response = await fetch(
        `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=12`
      )
      
      if (!response.ok) {
        console.warn('⚠️ GitHub API 제한, 건너뜀')
        return []
      }
      
      const data = await response.json() as GitHubSearchResponse
      
      const trends = (data.items || []).map((repo: GitHubRepo, index: number) => ({
        keyword: `${repo.name}${repo.description ? ` - ${repo.description.substring(0, 60)}` : ''}`,
        interest: repo.stargazers_count || 0,
        category: repo.language || 'Code',
        source: 'github' as const,
        timestamp: new Date(),
        region: 'Global',
        url: repo.html_url,
        rank: index + 1
      }))

      console.log(`✅ GitHub: ${trends.length}개 수집 완료`)
      return trends
    } catch (error) {
      console.error('❌ GitHub API Error:', error)
      return []
    }
  }

  // 4. Dev.to API (무료, 공식)
  async getDevToTrends(): Promise<TrendData[]> {
    try {
      console.log('🔍 Dev.to 트렌드 수집 중...')
      
      const response = await fetch('https://dev.to/api/articles?top=7&per_page=12')
      const articles = await response.json() as DevToArticle[]
      
      const trends = articles.map((article: DevToArticle, index: number) => ({
        keyword: article.title,
        interest: article.public_reactions_count || 0,
        category: 'Dev Article',
        source: 'devto' as const,
        timestamp: new Date(),
        region: 'Global',
        url: article.url,
        rank: index + 1
      }))

      console.log(`✅ Dev.to: ${trends.length}개 수집 완료`)
      return trends
    } catch (error) {
      console.error('❌ Dev.to API Error:', error)
      return []
    }
  }

  // 5. RSS 피드 파싱 (모든 RSS는 공식 제공)
  async parseRSSFeeds(): Promise<TrendData[]> {
    const rssFeeds = [
      { url: 'https://hnrss.org/frontpage', source: 'hackernews', category: 'Tech' },
      { url: 'https://dev.to/feed', source: 'devto', category: 'Development' }
    ]

    const allTrends: TrendData[] = []

    for (const feed of rssFeeds) {
      try {
        console.log(`🔍 RSS 피드 수집 중: ${feed.source}`)
        
        const response = await fetch(feed.url)
        const xmlText = await response.text()
        
        // 간단한 XML 파싱
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g
        const linkRegex = /<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/g
        
        const titles: string[] = []
        const links: string[] = []
        
        let match
        while ((match = titleRegex.exec(xmlText)) !== null) {
          const title = match[1] || match[2]
          if (title && !title.includes('RSS') && !title.includes('Feed')) {
            titles.push(title.trim())
          }
        }
        
        while ((match = linkRegex.exec(xmlText)) !== null) {
          const link = match[1] || match[2]
          if (link && link.startsWith('http')) {
            links.push(link.trim())
          }
        }

        titles.slice(1, 9).forEach((title, index) => {
          if (title && title.length > 10) {
            allTrends.push({
              keyword: title.substring(0, 90),
              interest: 100 - (index * 10),
              category: feed.category,
              source: 'rss' as const,
              timestamp: new Date(),
              region: 'Global',
              url: links[index + 1] || '',
              rank: allTrends.length + 1
            })
          }
        })

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`❌ RSS Feed Error (${feed.url}):`, error)
      }
    }

    console.log(`✅ RSS Feeds: ${allTrends.length}개 수집 완료`)
    return allTrends
  }

  // 6. 모든 합법적 소스 통합 (DB 저장 포함)
  async getAllTrends(forceRefresh: boolean = false): Promise<TrendData[]> {
    console.log('🚀 전체 트렌드 수집 시작...')
    const startTime = Date.now()
    
    const [hackerNews, reddit, github, devTo, rss] = await Promise.allSettled([
      this.getHackerNewsTrends(),
      this.getRedditTrends(),
      this.getGitHubTrends(), 
      this.getDevToTrends(),
      this.parseRSSFeeds()
    ])

    const allTrends: TrendData[] = []
    
    if (hackerNews.status === 'fulfilled') allTrends.push(...hackerNews.value)
    if (reddit.status === 'fulfilled') allTrends.push(...reddit.value)
    if (github.status === 'fulfilled') allTrends.push(...github.value)
    if (devTo.status === 'fulfilled') allTrends.push(...devTo.value)
    if (rss.status === 'fulfilled') allTrends.push(...rss.value)

    const endTime = Date.now()
    console.log(`🎉 총 ${allTrends.length}개 트렌드 수집 완료 (${endTime - startTime}ms)`)

    // 데이터베이스에 저장
    if (allTrends.length > 0) {
      try {
        await databaseService.saveTrends(allTrends)
        console.log(`💾 ${allTrends.length}개 트렌드 DB 저장 완료`)
      } catch (error) {
        console.error('❌ DB 저장 실패:', error)
        // DB 저장 실패해도 메모리 데이터는 반환
      }
    }

    return allTrends
  }

  // 7. 캐시된 트렌드 (DB 우선, 메모리 캐시 백업)
  async getCachedTrends(): Promise<TrendData[]> {
    const cacheKey = 'all_trends'
    const cached = this.cache.get(cacheKey)
    
    // 1. 메모리 캐시 확인
    if (cached && new Date() < cached.expiry) {
      console.log('💾 메모리 캐시 데이터 반환')
      return cached.data
    }
    
    // 2. DB에서 최신 데이터 확인 (24시간 이내)
    try {
      const dbTrends = await databaseService.getLatestTrends(100)
      if (dbTrends.length > 0) {
        console.log(`💽 DB에서 ${dbTrends.length}개 트렌드 반환`)
        
        // 메모리 캐시 업데이트
        this.cache.set(cacheKey, {
          data: dbTrends,
          lastUpdate: new Date(),
          expiry: new Date(Date.now() + this.CACHE_DURATION)
        })
        
        return dbTrends
      }
    } catch (error) {
      console.warn('⚠️ DB 조회 실패, 새 데이터 수집:', error)
    }
    
    // 3. DB에 데이터가 없거나 실패 시 새로 수집
    console.log('🔄 새로운 데이터 수집')
    const trends = await this.getAllTrends()
    
    // 캐시 업데이트
    this.cache.set(cacheKey, {
      data: trends,
      lastUpdate: new Date(),
      expiry: new Date(Date.now() + this.CACHE_DURATION)
    })
    
    return trends
  }

  // 8. 카테고리별 트렌드 조회
  async getTrendsByCategory(category: string): Promise<TrendData[]> {
    try {
      return await databaseService.getTrendsByCategory(category)
    } catch (error) {
      console.error('❌ 카테고리별 조회 실패:', error)
      // 메모리 캐시에서 필터링
      const allTrends = await this.getCachedTrends()
      return allTrends.filter(trend => trend.category.toLowerCase().includes(category.toLowerCase()))
    }
  }

  // 9. 트렌드 검색
  async searchTrends(query: string): Promise<TrendData[]> {
    try {
      return await databaseService.searchTrends(query)
    } catch (error) {
      console.error('❌ 검색 실패:', error)
      // 메모리 캐시에서 검색
      const allTrends = await this.getCachedTrends()
      return allTrends.filter(trend => 
        trend.keyword.toLowerCase().includes(query.toLowerCase()) ||
        trend.category.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  // 10. 통계 데이터 조회
  async getStatistics(): Promise<any> {
    try {
      const [sourceStats, categoryStats] = await Promise.all([
        databaseService.getSourceStats(),
        databaseService.getCategoryStats()
      ])
      
      return {
        sourceStats,
        categoryStats,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('❌ 통계 조회 실패:', error)
      return { sourceStats: [], categoryStats: [], timestamp: new Date() }
    }
  }

  // 소스별 트렌드 가져오기
  async getTrendsBySource(source: string): Promise<TrendData[]> {
    console.log(`🎯 ${source} 트렌드 수집 중...`)
    
    switch (source) {
      case 'hackernews':
        return await this.getHackerNewsTrends()
      case 'reddit':
        return await this.getRedditTrends()
      case 'github':
        return await this.getGitHubTrends()
      case 'devto':
        return await this.getDevToTrends()
      case 'rss':
        return await this.parseRSSFeeds()
      default:
        throw new Error(`Unknown source: ${source}`)
    }
  }

  // 캐시 상태 확인
  getCacheStatus() {
    const cacheKey = 'all_trends'
    const cached = this.cache.get(cacheKey)
    
    return {
      hasCachedData: !!cached,
      lastUpdate: cached?.lastUpdate,
      expiresAt: cached?.expiry,
      itemCount: cached?.data.length || 0
    }
  }
}

export const freeTrendService = new FreeTrendService()