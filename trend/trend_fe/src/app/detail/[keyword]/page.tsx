'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface TrendDetail {
  keyword: string
  category: string
  source: string
  interest: number
  rank: number
  region: string
  url?: string
  timestamp: Date
}

export default function TrendDetailPage() {
  const params = useParams()
  const router = useRouter()
  const keyword = decodeURIComponent(params.keyword as string)
  
  const [trendDetail, setTrendDetail] = useState<TrendDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [relatedTrends, setRelatedTrends] = useState<TrendDetail[]>([])

  useEffect(() => {
    fetchTrendDetail()
  }, [keyword])

  const fetchTrendDetail = async () => {
    try {
      setIsLoading(true)
      
      // 전체 트렌드에서 키워드 찾기
      const response = await fetch('http://localhost:8002/api/trends')
      const data = await response.json()
      
      if (data.success) {
        const trend = data.data.find((t: any) => t.keyword === keyword)
        if (trend) {
          setTrendDetail(trend)
          
          // 같은 카테고리 관련 트렌드
          const related = data.data
            .filter((t: any) => t.category === trend.category && t.keyword !== keyword)
            .slice(0, 6)
          setRelatedTrends(related)
        }
      }
    } catch (error) {
      console.error('상세 정보 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      '검색어': '🔍',
      '쇼핑': '🛍️',
      '영상': '📺',
      'IT': '💻',
      'Tech News': '📰',
      'Dev Article': '📝'
    }
    return icons[category as keyof typeof icons] || '📊'
  }

  const getSourceName = (source: string) => {
    const names = {
      'korean_search': '한국 검색',
      'shopping': '쇼핑몰',
      'youtube': 'YouTube',
      'tech': 'IT 기술',
      'hackernews': 'Hacker News',
      'reddit': 'Reddit',
      'github': 'GitHub',
      'devto': 'Dev.to',
      'rss': 'RSS 피드'
    }
    return names[source as keyof typeof names] || source
  }

  const handleSearchClick = () => {
    if (trendDetail?.url) {
      window.open(trendDetail.url, '_blank', 'noopener,noreferrer')
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRelatedClick = (relatedKeyword: string) => {
    router.push(`/detail/${encodeURIComponent(relatedKeyword)}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-surface border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!trendDetail) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">트렌드를 찾을 수 없습니다</h1>
          <button 
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container-centered py-12">
        {/* 상단 네비게이션 */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            트렌드 순위로 돌아가기
          </button>
        </div>

        {/* 트렌드 상세 정보 */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-3xl p-8 mb-8">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">{getCategoryIcon(trendDetail.category)}</span>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">{keyword}</h1>
                  <p className="text-text-secondary mt-2">
                    {trendDetail.category} · {getSourceName(trendDetail.source)}
                  </p>
                </div>
              </div>
            </div>

            {/* 통계 정보 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  #{trendDetail.rank}
                </div>
                <div className="text-sm text-text-secondary">순위</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-green mb-1">
                  {trendDetail.interest.toLocaleString()}
                </div>
                <div className="text-sm text-text-secondary">관심도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-yellow mb-1">
                  {trendDetail.region}
                </div>
                <div className="text-sm text-text-secondary">지역</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-red mb-1">
                  실시간
                </div>
                <div className="text-sm text-text-secondary">업데이트</div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="text-center">
              <button 
                onClick={handleSearchClick}
                className="btn-primary text-lg px-8 py-4 hover-lift"
              >
                <span className="mr-2">🔍</span>
                자세히 검색하기
              </button>
            </div>
          </div>

          {/* 관련 트렌드 */}
          {relatedTrends.length > 0 && (
            <div className="glass-strong rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
                <span className="mr-2">{getCategoryIcon(trendDetail.category)}</span>
                {trendDetail.category} 관련 트렌드
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTrends.map((related, index) => (
                  <div
                    key={related.keyword}
                    onClick={() => handleRelatedClick(related.keyword)}
                    className="p-4 rounded-xl bg-surface/50 border border-border/50 cursor-pointer
                               hover:bg-surface hover:border-primary/30 transition-all duration-300
                               animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-primary">#{related.rank}</span>
                      <span className="text-xs text-text-muted">{getSourceName(related.source)}</span>
                    </div>
                    <h3 className="font-medium text-text-primary leading-tight line-clamp-2">
                      {related.keyword}
                    </h3>
                    <div className="text-sm text-text-secondary mt-2">
                      관심도: {related.interest.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}