'use client'

import { useState, useMemo } from 'react'
import { useTrends } from '../hooks/useTrends'
import TrendCard from '../components/TrendCard'
import SourceFilter from '../components/SourceFilter'
import LiveIndicator from '../components/LiveIndicator'

export default function TrendPage() {
  const { 
    trends, 
    isLoading, 
    isConnected, 
    lastUpdate, 
    error,
    fetchTrends,
    refreshTrends 
  } = useTrends()
  
  const [selectedSource, setSelectedSource] = useState<string>('all')

  // 선택된 소스에 따라 트렌드 필터링
  const filteredTrends = useMemo(() => {
    if (selectedSource === 'all') {
      return trends
    }
    return trends.filter(trend => trend.source === selectedSource)
  }, [trends, selectedSource])

  const handleSourceChange = (source: string) => {
    setSelectedSource(source)
    
    // 'all'이 아닌 특정 소스 선택 시 해당 소스의 최신 데이터 가져오기
    if (source !== 'all') {
      fetchTrends(source)
    }
  }

  const handleRefresh = () => {
    refreshTrends()
  }

  // 소스별 통계
  const sourceStats = useMemo(() => {
    const stats = trends.reduce((acc, trend) => {
      acc[trend.source] = (acc[trend.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return stats
  }, [trends])

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2">
                <span className="gradient-text">실시간 트렌드</span>
              </h1>
              <p className="text-xl text-text-secondary">
                전 세계 최신 트렌드를 <span className="text-primary font-semibold">실시간</span>으로 확인하세요
              </p>
            </div>
            
            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2 hover-lift"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  업데이트 중...
                </>
              ) : (
                <>
                  ✨ 새로고침
                </>
              )}
            </button>
          </div>

          {/* 상태 표시 */}
          <div className="flex items-center justify-between mb-6">
            <LiveIndicator 
              isConnected={isConnected} 
              lastUpdate={lastUpdate}
            />
          </div>

          {/* 소스 필터 */}
          <SourceFilter 
            selectedSource={selectedSource}
            onSourceChange={handleSourceChange}
            isLoading={isLoading}
          />

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="glass hover-lift rounded-xl p-4 text-center animate-pulse-glow">
              <div className="text-2xl font-bold text-primary mb-1">{trends.length}</div>
              <div className="text-sm text-text-secondary">총 트렌드</div>
            </div>
            {Object.entries(sourceStats).slice(0, 5).map(([source, count], index) => (
              <div 
                key={source} 
                className="glass hover-lift rounded-xl p-4 text-center transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-xl font-bold text-text-primary mb-1">{count}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">{source}</div>
              </div>
            ))}
          </div>
        </div>

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
        {isLoading && trends.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 border-4 border-surface border-t-primary rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-secondary rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3 gradient-text">
              데이터 수집 중...
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              다양한 소스에서 <span className="text-primary font-semibold">최신 트렌드 데이터</span>를 가져오고 있습니다
            </p>
          </div>
        )}

        {/* 트렌드 그리드 */}
        {!isLoading || trends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrends.map((trend, index) => (
              <TrendCard 
                key={`${trend.source}-${trend.keyword}-${index}`}
                trend={trend}
                index={index}
              />
            ))}
          </div>
        ) : null}

        {/* 데이터 없음 */}
        {!isLoading && filteredTrends.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              {selectedSource === 'all' ? '트렌드 데이터가 없습니다' : `${selectedSource.toUpperCase()} 트렌드가 없습니다`}
            </h3>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              잠시 후 다시 시도하거나 새로고침을 눌러보세요
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
        <div className="mt-20 pt-12 border-t border-border relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-primary">🌐</span> 데이터 소스
              </h3>
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent-orange"></span>
                  <span><strong>Hacker News</strong> - 기술 뉴스 및 토론</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent-red"></span>
                  <span><strong>Reddit</strong> - 소셜 뉴스 플랫폼</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-text-muted"></span>
                  <span><strong>GitHub</strong> - 오픈소스 프로젝트</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                  <span><strong>Dev.to</strong> - 개발자 커뮤니티</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span><strong>RSS 피드</strong> - 다양한 뉴스 소스</span>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-secondary">⚡</span> 업데이트 주기
              </h3>
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5"></span>
                  <span><strong>실시간 WebSocket</strong><br />5분마다 자동 업데이트</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-secondary mt-1.5"></span>
                  <span><strong>REST API</strong><br />5분 캐시 후 새 데이터 제공</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent-green mt-1.5"></span>
                  <span><strong>공식 API</strong><br />안전한 데이터 수집 방법</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center">
            <div className="flex items-center justify-center gap-2 text-text-muted mb-2">
              <span className="text-2xl">✨</span>
              <span className="text-sm">
                Powered by <span className="font-bold gradient-text">PlayGround Trend</span>
              </span>
            </div>
            <p className="text-xs text-text-muted">
              실시간 트렌드 서비스 • 데이터 출처: 공개 API 및 RSS 피드
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}