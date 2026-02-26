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
      
      const response = await fetch('http://localhost:8002/api/trends')
      const data = await response.json()
      
      if (data.success) {
        const trend = data.data.find((t: any) => t.keyword === keyword)
        if (trend) {
          setTrendDetail(trend)
          
          const related = data.data
            .filter((t: any) => t.category === trend.category && t.keyword !== keyword)
            .slice(0, 8)
          setRelatedTrends(related)
        }
      }
    } catch (error) {
      console.error('상세 정보 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSourceName = (source: string) => {
    const names = {
      'korean_search': 'Search',
      'shopping': 'Shopping',
      'youtube': 'Video',
      'tech': 'Tech',
      'hackernews': 'News',
      'reddit': 'Social',
      'github': 'Code',
      'devto': 'Dev',
      'rss': 'Feed'
    }
    return names[source as keyof typeof names] || source
  }

  const handleRelatedClick = (relatedKeyword: string) => {
    router.push(`/detail/${encodeURIComponent(relatedKeyword)}`)
  }

  if (isLoading) {
    return (
      <div className="trend-container trend-detail-loading">
        <div className="trend-detail-loading-content">
          <div className="trend-spinner"></div>
          <p className="trend-detail-loading-text">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!trendDetail) {
    return (
      <div className="trend-container trend-detail-not-found">
        <div className="trend-detail-not-found-content">
          <div className="trend-detail-error-icon">
            <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="trend-detail-error-title">트렌드를 찾을 수 없습니다</h1>
          <button 
            onClick={() => router.push('/')}
            className="trend-btn-primary"
            aria-label="메인 페이지로 돌아가기"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="trend-container">
      <div className="trend-centered" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* 상단 네비게이션 */}
        <nav className="trend-detail-nav" aria-label="내비게이션">
          <button 
            onClick={() => router.push('/')}
            className="trend-detail-back-button"
            aria-label="트렌드 순위 페이지로 돌아가기"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>트렌드 순위로 돌아가기</span>
          </button>
        </nav>

        {/* 메인 콘텐츠 */}
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          {/* 헤더 섹션 */}
          <header className="trend-detail-header">
            <div className="trend-detail-title-section">
              <h1 className="trend-detail-title">
                {keyword}
              </h1>
              <div className="trend-detail-meta">
                <span className="trend-detail-category">{trendDetail.category}</span>
                <span className="trend-detail-divider">•</span>
                <span className="trend-detail-source">{getSourceName(trendDetail.source)}</span>
              </div>
            </div>

            {/* 통계 그리드 */}
            <div className="trend-detail-stats">
              <div className="trend-detail-stat">
                <div className="trend-detail-stat-value trend-detail-stat-rank">
                  #{trendDetail.rank}
                </div>
                <div className="trend-detail-stat-label">순위</div>
              </div>
              <div className="trend-detail-stat">
                <div className="trend-detail-stat-value trend-detail-stat-source">
                  {getSourceName(trendDetail.source)}
                </div>
                <div className="trend-detail-stat-label">출처</div>
              </div>
              <div className="trend-detail-stat">
                <div className="trend-detail-stat-value trend-detail-stat-update">
                  실시간
                </div>
                <div className="trend-detail-stat-label">업데이트</div>
              </div>
            </div>
          </header>

          {/* 요약 정보 섹션 */}
          <section className="trend-detail-summary">
            <h2 className="trend-detail-summary-title">
              트렌드 요약
            </h2>
            <div className="trend-detail-summary-content">
              <p className="trend-detail-summary-item">
                • {trendDetail.category} 카테고리에서 {trendDetail.rank}위를 기록
              </p>
              <p className="trend-detail-summary-item">
                • {getSourceName(trendDetail.source)} 출처에서 수집된 트렌드 데이터
              </p>
              <p className="trend-detail-summary-item">
                • 현재 한국에서 주목받고 있는 키워드입니다
              </p>
            </div>
          </section>

          {/* 관련 트렌드 */}
          {relatedTrends.length > 0 && (
            <section className="trend-detail-related">
              <h2 className="trend-detail-related-title">
                {trendDetail.category} 관련 트렌드
              </h2>
              
              <div className="trend-grid" style={{ gap: '1rem' }}>
                {relatedTrends.map((related, index) => (
                  <article
                    key={related.keyword}
                    onClick={() => handleRelatedClick(related.keyword)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleRelatedClick(related.keyword)
                      }
                    }}
                    className="trend-card trend-fade-in"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      padding: '1rem'
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${related.keyword} 트렌드 상세 정보 보기`}
                  >
                    <div className="trend-card-header">
                      <div className="trend-rank-badge trend-rank-default">
                        <span>#{related.rank}</span>
                      </div>
                      <div className="trend-detail-related-source">
                        {getSourceName(related.source)}
                      </div>
                    </div>
                    
                    <h3 className="trend-keyword">
                      {related.keyword}
                    </h3>
                    
                    <p className="trend-detail-related-category">
                      {related.category} 카테고리
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}