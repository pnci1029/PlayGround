import { WebSocket } from 'ws'
import { WebSocketMessage } from '../types/trend.types'
import { freeTrendService } from './freeTrendService'

export class TrendWebSocketService {
  private connections: Map<string, WebSocket> = new Map()
  private updateInterval: NodeJS.Timeout | null = null
  private readonly UPDATE_INTERVAL = 5 * 60 * 1000 // 5분마다 업데이트

  addConnection(connectionId: string, ws: WebSocket) {
    this.connections.set(connectionId, ws)
    console.log(`🔌 새 트렌드 연결: ${connectionId} (총 ${this.connections.size}명)`)
    
    // 연결 즉시 현재 트렌드 전송
    this.sendCurrentTrends(ws)
    
    // 첫 연결이면 자동 업데이트 시작
    if (this.connections.size === 1) {
      this.startAutoUpdate()
    }

    ws.on('close', () => {
      this.connections.delete(connectionId)
      console.log(`🔌 트렌드 연결 해제: ${connectionId} (남은 ${this.connections.size}명)`)
      
      if (this.connections.size === 0) {
        this.stopAutoUpdate()
      }
    })

    ws.on('error', (error) => {
      console.error(`❌ WebSocket 오류 (${connectionId}):`, error)
      this.connections.delete(connectionId)
    })

    // 연결 상태 메시지 전송
    this.sendMessage(ws, {
      type: 'connection_status',
      message: 'Connected to Trend WebSocket',
      timestamp: Date.now()
    })
  }

  private async sendCurrentTrends(ws: WebSocket) {
    try {
      const trends = await freeTrendService.getCachedTrends()
      this.sendMessage(ws, {
        type: 'trend_update',
        data: trends,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('❌ 트렌드 전송 실패:', error)
      this.sendMessage(ws, {
        type: 'error',
        message: 'Failed to fetch trends',
        timestamp: Date.now()
      })
    }
  }

  private startAutoUpdate() {
    console.log('⏰ 자동 트렌드 업데이트 시작 (5분 간격)')
    
    this.updateInterval = setInterval(async () => {
      try {
        console.log('🔄 자동 트렌드 업데이트 실행 중...')
        const trends = await freeTrendService.getAllTrends() // 캐시 무시하고 새 데이터
        
        const message: WebSocketMessage = {
          type: 'trend_update',
          data: trends,
          timestamp: Date.now()
        }

        this.broadcastToAll(message)
        console.log(`📡 ${this.connections.size}명에게 트렌드 업데이트 전송 완료`)
      } catch (error) {
        console.error('❌ 자동 업데이트 오류:', error)
        
        const errorMessage: WebSocketMessage = {
          type: 'error',
          message: 'Auto update failed',
          timestamp: Date.now()
        }
        
        this.broadcastToAll(errorMessage)
      }
    }, this.UPDATE_INTERVAL)
  }

  private stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log('⏰ 자동 트렌드 업데이트 중지')
    }
  }

  private sendMessage(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private broadcastToAll(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message)
    
    this.connections.forEach((ws, connectionId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr)
      } else {
        this.connections.delete(connectionId)
      }
    })
  }

  // 수동 업데이트 트리거
  async triggerUpdate() {
    console.log('🔄 수동 트렌드 업데이트 실행...')
    
    try {
      const trends = await freeTrendService.getAllTrends()
      
      const message: WebSocketMessage = {
        type: 'trend_update',
        data: trends,
        timestamp: Date.now()
      }

      this.broadcastToAll(message)
      console.log(`📡 수동 업데이트: ${this.connections.size}명에게 전송 완료`)
      return true
    } catch (error) {
      console.error('❌ 수동 업데이트 오류:', error)
      return false
    }
  }

  // 연결 통계
  getStats() {
    return {
      activeConnections: this.connections.size,
      autoUpdateActive: !!this.updateInterval,
      cacheStatus: freeTrendService.getCacheStatus()
    }
  }
}

export const trendWebSocketService = new TrendWebSocketService()