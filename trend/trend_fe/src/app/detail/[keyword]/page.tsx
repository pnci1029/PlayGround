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
  // Enriched data fields
  description?: string
  summary?: string
  tags?: string[]
  relatedKeywords?: string[]
  trendReason?: string
  newsContext?: string
  wikipediaUrl?: string
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
              <h1 className="trend-detail-title" style={{ 
                wordBreak: 'break-word', 
                lineHeight: '1.4',
                fontSize: keyword.length > 60 ? '1.5rem' : '2rem',
                marginBottom: '0.5rem'
              }}>
                {keyword}
              </h1>
              <div className="trend-detail-meta">
                <span className="trend-detail-category">{trendDetail.category}</span>
                <span className="trend-detail-divider">•</span>
                <span className="trend-detail-source">{getSourceName(trendDetail.source)}</span>
                <span className="trend-detail-divider">•</span>
                <span className="trend-detail-rank">#{trendDetail.rank}위</span>
              </div>
            </div>

            {/* 링크 버튼 */}
            {trendDetail.url && (
              <div style={{ marginTop: '1rem' }}>
                <a 
                  href={trendDetail.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="trend-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  원본 보기
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </header>

          {/* 설명 섹션 */}
          {trendDetail.description && (
            <section className="trend-detail-description">
              <h2 className="trend-detail-section-title">설명</h2>
              <div className="trend-detail-description-content">
                <p className="trend-detail-description-text">
                  {trendDetail.description}
                </p>
                {trendDetail.wikipediaUrl && (
                  <a 
                    href={trendDetail.wikipediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="trend-detail-wiki-link"
                    aria-label="위키피디아에서 더 자세히 보기"
                  >
                    위키피디아에서 더 보기
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* 트렌드 이유 섹션 */}
          {trendDetail.trendReason && (
            <section className="trend-detail-reason">
              <h2 className="trend-detail-section-title">왜 트렌딩 중인가?</h2>
              <div className="trend-detail-reason-content">
                <p className="trend-detail-reason-text">
                  {trendDetail.trendReason}
                </p>
              </div>
            </section>
          )}

          {/* 뉴스 컨텍스트 섹션 */}
          {trendDetail.newsContext && (
            <section className="trend-detail-news">
              <h2 className="trend-detail-section-title">최근 소식</h2>
              <div className="trend-detail-news-content">
                <p className="trend-detail-news-text">
                  {trendDetail.newsContext}
                </p>
              </div>
            </section>
          )}

          {/* 태그 섹션 */}
          {trendDetail.tags && trendDetail.tags.length > 0 && (
            <section className="trend-detail-tags">
              <h2 className="trend-detail-section-title">태그</h2>
              <div className="trend-detail-tags-list">
                {trendDetail.tags.map((tag, index) => (
                  <span key={index} className="trend-detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 관련 키워드 섹션 */}
          {trendDetail.relatedKeywords && trendDetail.relatedKeywords.length > 0 && (
            <section className="trend-detail-related-keywords">
              <h2 className="trend-detail-section-title">관련 키워드</h2>
              <div className="trend-detail-keywords-list">
                {trendDetail.relatedKeywords.map((relatedKeyword, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(`/detail/${encodeURIComponent(relatedKeyword)}`)}
                    className="trend-detail-keyword-button"
                    aria-label={`${relatedKeyword} 트렌드 보기`}
                  >
                    {relatedKeyword}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 기본 요약 정보 섹션 - 더 간결하게 */}
          {!trendDetail.description && !trendDetail.trendReason && !trendDetail.newsContext && (
            <section className="trend-detail-summary">
              <h2 className="trend-detail-section-title">정보</h2>
              <div className="trend-detail-summary-content">
                <p className="trend-detail-summary-item">
                  {trendDetail.category} 카테고리 • {trendDetail.rank}위 • {getSourceName(trendDetail.source)} 출처
                </p>
                {trendDetail.region && (
                  <p className="trend-detail-summary-item">
                    지역: {trendDetail.region === 'Global' ? '글로벌' : trendDetail.region}
                  </p>
                )}
              </div>
            </section>
          )}

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