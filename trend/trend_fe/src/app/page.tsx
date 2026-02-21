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
    <div className="min-h-screen bg-gradient-bg">
      <div className="container-centered py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <h1 className="text-6xl font-bold mb-4 gradient-text tracking-tight">트렌드 순위</h1>
            <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2">
              <div className="w-32 h-1 bg-gradient-primary rounded-full opacity-60"></div>
            </div>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
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
          <div className="glass-strong border border-accent-red/30 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center gap-3 text-accent-red mb-3">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold">오류 발생</span>
            </div>
            <p className="text-text-secondary mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm hover-glow"
            >
              🔄 페이지 새로고침
            </button>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && rankings.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 border-4 border-surface border-t-primary rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-secondary rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3 gradient-text">
              데이터 로딩 중
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              순위 데이터를 계산하고 있습니다
            </p>
          </div>
        )}

        {/* 순위 리스트 */}
        {!isLoading && filteredRankings.length > 0 && (
          <div className="relative">
            {/* 카테고리 정보 헤더 */}
            <div className="max-w-4xl mx-auto mb-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-surface/30 backdrop-blur-sm border border-border/50">
                <span className="text-sm font-medium text-text-secondary">
                  {selectedCategory === 'all' ? '전체 트렌드' : selectedCategory}
                </span>
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                <span className="text-sm font-bold text-primary">
                  {filteredRankings.length}개
                </span>
              </div>
            </div>

            {/* 순위 그리드 */}
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredRankings.map((ranking, index) => (
                  <RankingCard 
                    key={`${ranking.keyword}-${ranking.rank}-${ranking.category}`}
                    ranking={ranking}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 데이터 없음 */}
        {!isLoading && rankings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🏆</div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              순위 데이터가 없습니다
            </h3>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              새로고침을 시도해보세요
            </p>
            <button 
              onClick={handleRefresh}
              className="btn-primary hover-lift"
            >
              🔄 다시 시도
            </button>
          </div>
        )}

        {/* 푸터 정보 */}
        <div className="content-section section-spacing-large">
          <div className="visual-separator-thick mb-16"></div>
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">화제성 순위 시스템</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              언급 빈도, 상호작용, 성장률을 종합한 화제성 점수로 순위 결정
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="glass-strong rounded-2xl p-8 hover-lift">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">데이터 소스</h3>
                <p className="text-text-secondary">수집 플랫폼</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-glass hover:bg-surface-hover transition-colors">
                  <span className="w-3 h-3 rounded-full bg-accent-orange"></span>
                  <div>
                    <div className="font-semibold text-text-primary">Hacker News</div>
                    <div className="text-sm text-text-muted">기술 뉴스 및 토론</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-glass hover:bg-surface-hover transition-colors">
                  <span className="w-3 h-3 rounded-full bg-accent-red"></span>
                  <div>
                    <div className="font-semibold text-text-primary">Reddit</div>
                    <div className="text-sm text-text-muted">소셜 뉴스 플랫폼</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-glass hover:bg-surface-hover transition-colors">
                  <span className="w-3 h-3 rounded-full bg-text-muted"></span>
                  <div>
                    <div className="font-semibold text-text-primary">GitHub</div>
                    <div className="text-sm text-text-muted">오픈소스 프로젝트</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-glass hover:bg-surface-hover transition-colors">
                  <span className="w-3 h-3 rounded-full bg-accent-green"></span>
                  <div>
                    <div className="font-semibold text-text-primary">Dev.to</div>
                    <div className="text-sm text-text-muted">개발자 커뮤니티</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-glass hover:bg-surface-hover transition-colors">
                  <span className="w-3 h-3 rounded-full bg-accent-yellow"></span>
                  <div>
                    <div className="font-semibold text-text-primary">RSS Feeds</div>
                    <div className="text-sm text-text-muted">다양한 뉴스 소스</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-strong rounded-2xl p-8 hover-lift">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-secondary flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">업데이트 시스템</h3>
                <p className="text-text-secondary">데이터 동기화</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-glass border-l-4 border-primary">
                  <div className="font-semibold text-text-primary mb-2">실시간 WebSocket</div>
                  <div className="text-sm text-text-secondary">5분마다 자동 업데이트</div>
                </div>
                <div className="p-4 rounded-lg bg-glass border-l-4 border-secondary">
                  <div className="font-semibold text-text-primary mb-2">REST API 캐시</div>
                  <div className="text-sm text-text-secondary">캐싱으로 빠른 응답</div>
                </div>
                <div className="p-4 rounded-lg bg-glass border-l-4 border-accent-green">
                  <div className="font-semibold text-text-primary mb-2">데이터 안정성</div>
                  <div className="text-sm text-text-secondary">PostgreSQL 백업</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center py-12 border-t border-border">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">✨</span>
              <span className="text-2xl font-bold gradient-text">PlayGround Trend</span>
            </div>
            <p className="text-text-secondary text-lg">
              실시간 트렌드 분석 서비스
            </p>
            <div className="flex justify-center gap-6 mt-8 text-sm text-text-muted">
              <span>실시간 분석</span>
              <span>데이터 보안</span>
              <span>고성능</span>
              <span>글로벌</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}