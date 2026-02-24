'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TrendingRanking {
  rank: number
  keyword: string
  category: string
  source: string
  score: number
  url?: string
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

  const fetchRankings = useCallback(async (tf: string = timeframe, limit: number = 100) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/trends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const trendsData = await response.json()

      if (trendsData.success && trendsData.data) {
        // 관심도 기준으로 정렬 및 순위 할당
        const rankings = trendsData.data
          .sort((a: any, b: any) => b.interest - a.interest)
          .slice(0, limit)
          .map((trend: any, index: number) => ({
            rank: index + 1,
            keyword: trend.keyword,
            category: trend.category || '기타',
            source: trend.source,
            score: trend.interest,
            url: trend.url
          }))

        setRankings(rankings)
        setLastUpdate(new Date())
        
        // 통계 계산
        const avgScore = rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length
        const maxScore = Math.max(...rankings.map(r => r.score))
        
        setStats({
          totalKeywords: rankings.length,
          avgScore: Math.round(avgScore),
          maxScore: Math.round(maxScore)
        })
      } else {
        throw new Error('API returned unsuccessful response')
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '트렌드 순위를 가져올 수 없습니다'
      setError(errorMsg)
      setRankings([])
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  const refreshRankings = useCallback(async () => {
    await fetchRankings(timeframe)
  }, [timeframe])

  // timeframe 변경시 데이터 다시 로드
  useEffect(() => {
    if (timeframe !== initialTimeframe) {
      fetchRankings(timeframe)
    }
  }, [timeframe, fetchRankings, initialTimeframe])

  // 초기 로드
  useEffect(() => {
    fetchRankings(initialTimeframe)
  }, [fetchRankings, initialTimeframe])

  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    setTimeframe(newTimeframe)
  }, [])

  return {
    rankings,
    isLoading,
    error,
    lastUpdate,
    timeframe,
    setTimeframe: handleTimeframeChange,
    refreshRankings,
    stats
  }
}