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
      <div className="trend-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="trend-spinner"></div>
          <p style={{ color: '#cbd5e1', marginTop: '1rem' }}>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!trendDetail) {
    return (
      <div className="trend-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '2rem' }}>트렌드를 찾을 수 없습니다</h1>
          <button 
            onClick={() => router.push('/')}
            className="trend-btn-primary"
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
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => router.push('/')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#cbd5e1', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            트렌드 순위로 돌아가기
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          {/* 헤더 섹션 */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '1.5rem', 
            padding: '3rem 2rem', 
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem'
              }}>
                {keyword}
              </h1>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '1rem', 
                color: '#cbd5e1' 
              }}>
                <span>{trendDetail.category}</span>
                <span>•</span>
                <span>{getSourceName(trendDetail.source)}</span>
              </div>
            </div>

            {/* 통계 그리드 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#6366f1', 
                  marginBottom: '0.5rem' 
                }}>
                  #{trendDetail.rank}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>순위</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#10b981', 
                  marginBottom: '0.5rem' 
                }}>
                  {getSourceName(trendDetail.source)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>출처</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#f59e0b', 
                  marginBottom: '0.5rem' 
                }}>
                  실시간
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>업데이트</div>
              </div>
            </div>
          </div>

          {/* 요약 정보 섹션 */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: '1rem', 
            padding: '1.5rem', 
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#f8fafc', 
              marginBottom: '1rem' 
            }}>
              트렌드 요약
            </h3>
            <div style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                • {trendDetail.category} 카테고리에서 {trendDetail.rank}위를 기록
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                • {getSourceName(trendDetail.source)} 출처에서 수집된 트렌드 데이터
              </p>
              <p>
                • 현재 한국에서 주목받고 있는 키워드입니다
              </p>
            </div>
          </div>

          {/* 관련 트렌드 */}
          {relatedTrends.length > 0 && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '1rem', 
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#f8fafc', 
                marginBottom: '1.5rem' 
              }}>
                {trendDetail.category} 관련 트렌드
              </h3>
              
              <div className="trend-grid" style={{ gap: '1rem' }}>
                {relatedTrends.map((related, index) => (
                  <div
                    key={related.keyword}
                    onClick={() => handleRelatedClick(related.keyword)}
                    className="trend-card trend-fade-in"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      padding: '1rem'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: '0.75rem' 
                    }}>
                      <div className="trend-rank-badge trend-rank-default">
                        <span>#{related.rank}</span>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#94a3b8',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem'
                      }}>
                        {getSourceName(related.source)}
                      </div>
                    </div>
                    
                    <div className="trend-keyword" style={{ 
                      fontSize: '1rem',
                      marginBottom: '0.5rem'
                    }}>
                      {related.keyword}
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#94a3b8' 
                    }}>
                      {related.category} 카테고리
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