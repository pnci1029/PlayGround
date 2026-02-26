'use client'

import { useState, useMemo } from 'react'
import { useTrendingRankings } from '../hooks/useTrendingRankings'
import RankingCard from '../components/RankingCard'
import TimeframeSelector from '../components/TimeframeSelector'
import LiveIndicator from '../components/LiveIndicator'
import CategoryTabs from '../components/CategoryTabs'

export default function TrendRankingPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { 
    rankings, 
    isLoading, 
    error,
    lastUpdate, 
    timeframe,
    setTimeframe,
    refreshRankings,
    stats 
  } = useTrendingRankings('1h')

  // 카테고리별 필터링된 랭킹
  const filteredRankings = useMemo(() => {
    if (selectedCategory === 'all') return rankings
    return rankings.filter(ranking => ranking.category === selectedCategory)
  }, [rankings, selectedCategory])

  // 카테고리별 개수 계산
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: rankings.length }
    rankings.forEach(ranking => {
      counts[ranking.category] = (counts[ranking.category] || 0) + 1
    })
    return counts
  }, [rankings])

  // 페이지 렌더링 상태 로깅
  console.log('🖥️ TrendRankingPage 렌더링:', {
    rankingsCount: rankings.length,
    isLoading,
    error,
    timeframe,
    lastUpdate: lastUpdate?.toLocaleTimeString(),
    hasStats: !!stats
  })

  const handleRefresh = () => {
    console.log('🔄 새로고침 버튼 클릭')
    refreshRankings()
  }

  const getTimeframeName = (tf: string) => {
    const names = {
      '1h': '1시간',
      '6h': '6시간', 
      '1d': '1일',
      '3d': '3일',
      '1w': '1주일'
    }
    return names[tf as keyof typeof names] || tf
  }

  return (
    <div className="trend-container">
      <div className="trend-centered">
        
        {/* Header */}
        <header className="trend-header">
          <h1 className="trend-title">트렌드 순위</h1>
          <p className="trend-subtitle">
            실시간 한국 트렌드와 글로벌 인사이트를 한눈에
          </p>
        </header>
          
          <div className="flex flex-col items-center gap-6">
            <TimeframeSelector 
              value={timeframe}
              onChange={setTimeframe}
              isLoading={isLoading}
            />
            <LiveIndicator />
          </div>

        {/* 카테고리 탭 */}
        <CategoryTabs 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
        />


        {/* 오류 표시 */}
        {error && (
          <div className="trend-error-container" role="alert">
            <div className="trend-error-header">
              <svg className="trend-error-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="trend-error-title">오류 발생</span>
            </div>
            <p className="trend-error-message">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="trend-btn-primary trend-error-button"
              aria-label="페이지 새로고침"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              페이지 새로고침
            </button>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && rankings.length === 0 && (
          <div className="trend-loading-state" aria-live="polite">
            <div className="trend-spinner"></div>
            <h3 className="trend-loading-title">
              데이터 로딩 중
            </h3>
            <p className="trend-loading-description">
              순위 데이터를 계산하고 있습니다
            </p>
          </div>
        )}

        {/* 순위 리스트 */}
        {!isLoading && filteredRankings.length > 0 && (
          <div className="trend-grid">
            {filteredRankings.map((ranking, index) => (
              <RankingCard 
                key={`${ranking.keyword}-${ranking.rank}-${ranking.category}`}
                ranking={ranking}
                index={index}
              />
            ))}
          </div>
        )}

        {/* 데이터 없음 */}
        {!isLoading && rankings.length === 0 && (
          <div className="trend-empty-state">
            <div className="trend-empty-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="trend-empty-title">
              순위 데이터가 없습니다
            </h3>
            <p className="trend-empty-description">
              새로고침을 시도해보세요
            </p>
            <button 
              onClick={handleRefresh}
              className="trend-btn-primary"
              aria-label="데이터 다시 불러오기"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              다시 시도
            </button>
          </div>
        )}

      </div>
    </div>
  )
}