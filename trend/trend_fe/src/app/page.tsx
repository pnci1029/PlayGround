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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                실시간 트렌드
              </h1>
              <p className="text-xl text-gray-600">
                전 세계 최신 트렌드를 무료로 실시간 확인
              </p>
            </div>
            
            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  업데이트 중...
                </>
              ) : (
                <>
                  🔄 새로고침
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
            
            {/* 무료 배지 */}
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              💰 완전 무료 서비스
            </div>
          </div>

          {/* 소스 필터 */}
          <SourceFilter 
            selectedSource={selectedSource}
            onSourceChange={handleSourceChange}
            isLoading={isLoading}
          />

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-2xl font-bold text-blue-600">{trends.length}</div>
              <div className="text-sm text-gray-600">총 트렌드</div>
            </div>
            {Object.entries(sourceStats).slice(0, 5).map(([source, count]) => (
              <div key={source} className="bg-white rounded-lg p-4 text-center border">
                <div className="text-xl font-bold text-gray-800">{count}</div>
                <div className="text-xs text-gray-600 capitalize">{source}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 오류 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <span>⚠️</span>
              <span className="font-medium">오류 발생:</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              페이지 새로고침
            </button>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && trends.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              트렌드 수집 중...
            </h3>
            <p className="text-gray-600">
              여러 소스에서 최신 데이터를 가져오고 있습니다
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
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedSource === 'all' ? '트렌드 데이터가 없습니다' : `${selectedSource.toUpperCase()} 트렌드가 없습니다`}
            </h3>
            <p className="text-gray-600 mb-6">
              잠시 후 다시 시도하거나 새로고침을 눌러보세요
            </p>
            <button 
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔄 다시 시도
            </button>
          </div>
        )}

        {/* 푸터 정보 */}
        <div className="mt-16 border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">데이터 소스</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🔶</span>
                  <span>Hacker News - 기술 뉴스 및 토론</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🤖</span>
                  <span>Reddit - 소셜 뉴스 플랫폼</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⭐</span>
                  <span>GitHub - 오픈소스 프로젝트</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💻</span>
                  <span>Dev.to - 개발자 커뮤니티</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📡</span>
                  <span>RSS 피드 - 다양한 뉴스 소스</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">업데이트 주기</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• 실시간 WebSocket 연결 시: 5분마다 자동 업데이트</div>
                <div>• REST API: 5분 캐시 후 새 데이터 제공</div>
                <div>• 모든 API는 공식 및 무료 소스만 사용</div>
                <div>• 법적으로 안전한 데이터 수집 방법 적용</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>
              Powered by <strong>PlayGround Trend</strong> • 
              무료 실시간 트렌드 서비스 • 
              데이터 출처: 공개 API 및 RSS 피드
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}