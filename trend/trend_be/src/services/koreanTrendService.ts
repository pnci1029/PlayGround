import { TrendData } from '../types/trend.types'

export class KoreanTrendService {
  private cache = new Map<string, any>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10분 캐시

  // 1. 한국 검색 트렌드 (큐레이션 데이터)
  async getKoreanSearchTrends(): Promise<TrendData[]> {
    // 실제 한국에서 인기 있는 검색어들
    const popularSearches = [
      '날씨', '뉴스', '코로나19', '주식', '부동산',
      '맛집', '영화', '드라마', '아이돌', '스포츠',
      '게임', '쇼핑', '패션', '여행', '취업'
    ]

    return popularSearches.map((keyword, index) => ({
      keyword,
      interest: 1000 - (index * 50),
      category: '검색어',
      source: 'korean_search' as const,
      timestamp: new Date(),
      region: 'Korea',
      url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
      rank: index + 1
    }))
  }

  // 2. 한국 쇼핑 트렌드 (큐레이션 데이터)
  async getShoppingTrends(): Promise<TrendData[]> {
    // 실제 인기 상품들 (시장 조사 기반)
    const popularProducts = [
      '맥북 M4', '아이폰 16', '갤럭시 S25', 'iPad Air', 
      '에어팟 프로', '다이슨 에어랩', '르세라핌 앨범', 'PS5',
      '닌텐도 스위치', '애플워치 10', '삼성 갤럭시북', 'LG 그램',
      '무선이어폰', '게이밍 의자', '모니터 암', '기계식 키보드',
      '아이패드 프로', '갤럭시 버즈', '맥미니 M4', '에어팟 맥스'
    ]
    
    return popularProducts.map((product, index) => ({
      keyword: product,
      interest: 800 - (index * 30),
      category: '쇼핑',
      source: 'shopping' as const,
      timestamp: new Date(),
      region: 'Korea',
      url: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(product)}`,
      rank: index + 1
    }))
  }

  // 3. 유튜브 한국 트렌드 (큐레이션 데이터)
  async getYoutubeTrends(): Promise<TrendData[]> {
    // 한국에서 인기 있는 유튜브 콘텐츠 키워드
    const popularVideos = [
      'Claude AI 사용법', '맥북 M4 리뷰', '아이폰 16 언박싱', 
      '프로그래밍 강의', 'React 튜토리얼', 'Next.js 배우기',
      'AI 그림 생성', '코딩 테스트', '개발자 일상',
      '스타트업 창업', 'IT 뉴스', '신제품 리뷰',
      '갤럭시 S25 출시', 'ChatGPT 활용', '웹개발 트렌드'
    ]
    
    return popularVideos.map((video, index) => ({
      keyword: video,
      interest: 600 - (index * 25),
      category: '영상',
      source: 'youtube' as const,
      timestamp: new Date(),
      region: 'Korea',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(video)}`,
      rank: index + 1
    }))
  }

  // 4. IT/기술 트렌드 (큐레이션 데이터)
  async getItTrends(): Promise<TrendData[]> {
    // 실제 IT 업계에서 핫한 키워드들
    const itTrends = [
      'Claude 3.5 Sonnet', 'GPT-5', 'Sora AI', 'Gemini Ultra',
      'TypeScript 5.7', 'Next.js 15', 'React 19', 'Node.js 23',
      'Bun 런타임', 'Deno 2.0', 'Rust 웹', 'Go 1.24',
      'Docker Desktop', '쿠버네티스', 'AWS Lambda', 'Vercel',
      'Supabase', 'PlanetScale', 'Railway', 'Cloudflare',
      'Cursor IDE', 'GitHub Copilot', 'VS Code', 'Figma'
    ]

    return itTrends.map((keyword, index) => ({
      keyword,
      interest: 400 - (index * 15),
      category: 'IT',
      source: 'tech' as const,
      timestamp: new Date(),
      region: 'Korea',
      url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
      rank: index + 1
    }))
  }

  // 5. 통합 한국 트렌드
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

    const endTime = Date.now()
    console.log(`🎉 한국 트렌드 ${allTrends.length}개 수집 완료 (${endTime - startTime}ms)`)

    return allTrends.slice(0, 100) // 상위 100개
  }
}

export const koreanTrendService = new KoreanTrendService()