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
        <div style={{ textAlign: 'center', paddingTop: '3rem', marginBottom: '3rem' }}>
          <h1 className="trend-title">트렌드 순위</h1>
          <p className="trend-subtitle">
            실시간 한국 트렌드와 글로벌 인사이트를 한눈에
          </p>
        </div>
          
          <div className="flex flex-col items-center gap-6">
            <TimeframeSelector 
              value={timeframe}
              onChange={setTimeframe}
              isLoading={isLoading}
            />
            <LiveIndicator />
          </div>
        </div>

        {/* 카테고리 탭 */}
        <CategoryTabs 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
        />


        {/* 오류 표시 */}
        {error && (
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <span style={{ fontWeight: '600' }}>오류 발생</span>
            </div>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="trend-btn-primary"
              style={{ fontSize: '0.875rem' }}
            >
              🔄 페이지 새로고침
            </button>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && rankings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="trend-spinner"></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', margin: '1.5rem 0 0.75rem 0' }}>
              데이터 로딩 중
            </h3>
            <p style={{ color: '#cbd5e1', maxWidth: '24rem', margin: '0 auto' }}>
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
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>🏆</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '1rem' }}>
              순위 데이터가 없습니다
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '2rem', maxWidth: '24rem', margin: '0 auto 2rem auto' }}>
              새로고침을 시도해보세요
            </p>
            <button 
              onClick={handleRefresh}
              className="trend-btn-primary"
            >
              🔄 다시 시도
            </button>
          </div>
        )}

      </div>
    </div>
  )
}