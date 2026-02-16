'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface TrendData {
  keyword: string
  interest: number
  category: string
  source: 'hackernews' | 'reddit' | 'github' | 'devto' | 'rss'
  timestamp: Date
  region: string
  url?: string
  rank?: number
}

interface WebSocketMessage {
  type: 'trend_update' | 'connection_status' | 'error'
  data?: TrendData[]
  message?: string
  timestamp: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

const getWebSocketUrl = () => {
  if (typeof window === 'undefined') return 'ws://localhost:8012/ws'
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/ws`
}

export function useTrends() {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return // 이미 연결됨
    }

    try {
      console.log('🔌 WebSocket 연결 시도...')
      const ws = new WebSocket(getWebSocketUrl())
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket 연결 성공')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          switch (message.type) {
            case 'trend_update':
              if (message.data) {
                console.log(`📊 트렌드 업데이트 받음: ${message.data.length}개`)
                setTrends(message.data.map(trend => ({
                  ...trend,
                  timestamp: new Date(trend.timestamp)
                })))
                setLastUpdate(new Date(message.timestamp))
              }
              break
              
            case 'connection_status':
              console.log('📡 연결 상태:', message.message)
              break
              
            case 'error':
              console.error('❌ WebSocket 오류:', message.message)
              setError(message.message || 'WebSocket error')
              break
          }
        } catch (error) {
          console.error('❌ WebSocket 메시지 파싱 오류:', error)
        }
      }

      ws.onclose = () => {
        console.log('🔌 WebSocket 연결 해제')
        setIsConnected(false)
        
        // 자동 재연결 (최대 5회 시도)
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // 지수 백오프
          reconnectAttempts.current++
          
          console.log(`🔄 ${delay}ms 후 재연결 시도 (${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, delay)
        } else {
          console.error('❌ 최대 재연결 시도 횟수 초과')
          setError('연결이 끊어졌습니다. 페이지를 새로고침해주세요.')
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error)
        setError('실시간 연결에 실패했습니다')
      }

    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error)
      setError('실시간 연결에 실패했습니다')
      setIsConnected(false)
    }
  }, [])

  // REST API로 트렌드 가져오기
  const fetchTrends = useCallback(async (source?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const endpoint = source ? `/api/trends/${source}` : '/api/trends'
      console.log(`📡 API 요청: ${endpoint}`)
      
      const response = await fetch(`${API_URL}${endpoint}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        const trendsWithDates = data.data.map((trend: any) => ({
          ...trend,
          timestamp: new Date(trend.timestamp)
        }))
        
        setTrends(trendsWithDates)
        setLastUpdate(new Date(data.lastUpdated))
        console.log(`✅ API 응답: ${trendsWithDates.length}개 트렌드`)
      } else {
        throw new Error(data.error || 'API 응답 오류')
      }
    } catch (error) {
      console.error('❌ API 오류:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 강제 새로고침
  const refreshTrends = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 강제 새로고침 요청')
      const response = await fetch(`${API_URL}/api/trends/refresh`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        const trendsWithDates = data.data.map((trend: any) => ({
          ...trend,
          timestamp: new Date(trend.timestamp)
        }))
        
        setTrends(trendsWithDates)
        setLastUpdate(new Date(data.lastUpdated))
        console.log(`✅ 강제 새로고침 완료: ${trendsWithDates.length}개`)
      } else {
        throw new Error(data.error || '새로고침 실패')
      }
    } catch (error) {
      console.error('❌ 새로고침 오류:', error)
      setError(error instanceof Error ? error.message : 'Refresh failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    console.log('🚀 useTrends 초기화')
    
    // 초기 데이터 로드
    fetchTrends()
    
    // WebSocket 연결
    connectWebSocket()

    // 클린업
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connectWebSocket, fetchTrends])

  return {
    trends,
    isLoading,
    isConnected,
    lastUpdate,
    error,
    fetchTrends,
    refreshTrends,
    connectWebSocket
  }
}