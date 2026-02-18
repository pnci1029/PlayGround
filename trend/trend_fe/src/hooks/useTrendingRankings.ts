'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TrendingRanking {
  rank: number
  prevRank?: number
  keyword: string
  score: number
  mentions: number
  engagement: number
  growthRate: number
  sources: string[]
  trend: 'up' | 'down' | 'new' | 'stable'
}

export interface TrendingRankingsResponse {
  success: boolean
  data: {
    timeframe: string
    lastUpdate: string
    totalCount: number
    rankings: TrendingRanking[]
  }
}

export interface UseTrendingRankingsReturn {
  rankings: TrendingRanking[]
  isLoading: boolean
  error: string | null
  lastUpdate: Date | null
  timeframe: string
  setTimeframe: (timeframe: string) => void
  refreshRankings: () => Promise<void>
  stats: {
    totalKeywords: number
    avgScore: number
    maxScore: number
  } | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

export function useTrendingRankings(initialTimeframe: string = '1h'): UseTrendingRankingsReturn {
  const [rankings, setRankings] = useState<TrendingRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [timeframe, setTimeframe] = useState(initialTimeframe)
  const [stats, setStats] = useState<{
    totalKeywords: number
    avgScore: number
    maxScore: number
  } | null>(null)

  const fetchRankings = useCallback(async (tf: string = timeframe, limit: number = 50) => {
    try {
      console.log('🔍 fetchRankings 시작:', { tf, limit, timeframe })
      setIsLoading(true)
      setError(null)

      // 임시로 기존 trends API 사용하여 랭킹 시뮬레이션
      const response = await fetch(`${API_BASE_URL}/api/trends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 API 응답:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const trendsData = await response.json()
      console.log('📊 받은 데이터:', { success: trendsData.success, dataLength: trendsData.data?.length })

      if (trendsData.success && trendsData.data) {
        // 트렌드 데이터를 랭킹 형태로 변환
        const sortedTrends = trendsData.data
          .sort((a: any, b: any) => b.interest - a.interest)
          .slice(0, limit)

        const rankings = sortedTrends.map((trend: any, index: number) => ({
          rank: index + 1,
          prevRank: Math.random() > 0.5 ? index + Math.floor(Math.random() * 3) + 1 : null,
          keyword: trend.keyword,
          score: trend.interest * (Math.random() * 0.5 + 0.8),
          mentions: Math.floor(trend.interest * 0.6),
          engagement: Math.floor(trend.interest * 0.3),
          growthRate: (Math.random() - 0.5) * 20,
          sources: [trend.source],
          trend: Math.random() > 0.7 ? 'new' : Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
        }))

        console.log('✅ 변환된 랭킹 데이터:', rankings.slice(0, 3))
        setRankings(rankings)
        setLastUpdate(new Date())
        
        // 통계 계산
        const avgScore = rankings.reduce((sum: number, r: any) => sum + r.score, 0) / rankings.length
        const maxScore = Math.max(...rankings.map((r: any) => r.score))
        
        const statsData = {
          totalKeywords: rankings.length,
          avgScore: Math.round(avgScore * 100) / 100,
          maxScore: Math.round(maxScore * 100) / 100
        }
        
        console.log('📈 통계 데이터:', statsData)
        setStats(statsData)
      } else {
        throw new Error('API returned unsuccessful response')
      }

    } catch (err) {
      console.error('❌ 트렌드 순위 조회 실패:', err)
      const errorMsg = err instanceof Error ? err.message : '트렌드 순위를 가져올 수 없습니다'
      console.log('❌  설정된 에러 메시지:', errorMsg)
      setError(errorMsg)
      setRankings([])
      setStats(null)
    } finally {
      console.log('🏁 fetchRankings 완료, 로딩 상태 해제')
      setIsLoading(false)
    }
  }, [API_BASE_URL]) // timeframe 의존성 제거, API URL만 의존

  const refreshRankings = useCallback(async () => {
    await fetchRankings(timeframe)
  }, [timeframe])

  // timeframe 변경시 데이터 다시 로드
  useEffect(() => {
    console.log('⚡ timeframe 변경 감지:', { timeframe, initialTimeframe })
    if (timeframe !== initialTimeframe) {
      console.log('📊 timeframe 변경으로 인한 데이터 재로드')
      fetchRankings(timeframe)
    }
  }, [timeframe]) // fetchRankings 의존성 제거

  // 초기 로드
  useEffect(() => {
    console.log('🚀 컴포넌트 마운트 - 초기 데이터 로드 시작')
    fetchRankings(initialTimeframe)
  }, []) // fetchRankings 의존성 제거로 무한루프 방지

  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    setTimeframe(newTimeframe)
  }, [])

  // 반환값 로깅
  const hookData = {
    rankings,
    isLoading,
    error,
    lastUpdate,
    timeframe,
    setTimeframe: handleTimeframeChange,
    refreshRankings,
    stats
  }

  console.log('🔄 Hook 반환 데이터:', {
    rankingsLength: rankings.length,
    isLoading,
    error,
    timeframe,
    statsExists: !!stats
  })

  return hookData
}