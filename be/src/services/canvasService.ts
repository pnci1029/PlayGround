import { WebSocket } from 'ws'

interface DrawEvent {
  type: 'draw' | 'clear' | 'user_join' | 'user_leave'
  data?: any
  timestamp: number
  userId?: string
}

export class CanvasService {
  private connections: Map<string, WebSocket> = new Map()
  private drawHistory: DrawEvent[] = []

  // 새 사용자 연결
  addConnection(connectionId: string, ws: WebSocket) {
    this.connections.set(connectionId, ws)
    
    // 연결된 모든 사용자에게 새 사용자 알림
    this.broadcast({
      type: 'user_join',
      timestamp: Date.now(),
      userId: connectionId
    }, connectionId)

    // 새 사용자에게 기존 그림 데이터 전송
    ws.send(JSON.stringify({
      type: 'init',
      data: this.drawHistory.filter(event => event.type === 'draw'),
      timestamp: Date.now()
    }))

    console.log(`Canvas user connected: ${connectionId} (총 ${this.connections.size}명)`)
  }

  // 사용자 연결 해제
  removeConnection(connectionId: string) {
    this.connections.delete(connectionId)
    
    // 연결된 모든 사용자에게 사용자 나감 알림
    this.broadcast({
      type: 'user_leave',
      timestamp: Date.now(),
      userId: connectionId
    })

    console.log(`Canvas user disconnected: ${connectionId} (남은 ${this.connections.size}명)`)
  }

  // 그리기 이벤트 처리
  handleDrawEvent(connectionId: string, event: DrawEvent) {
    // 이벤트에 사용자 ID와 타임스탬프 추가
    const enrichedEvent = {
      ...event,
      userId: connectionId,
      timestamp: Date.now()
    }

    // 그리기 히스토리에 추가 (clear 이벤트의 경우 히스토리 초기화)
    if (event.type === 'clear') {
      this.drawHistory = [enrichedEvent]
    } else if (event.type === 'draw') {
      this.drawHistory.push(enrichedEvent)
    }

    // 모든 연결된 사용자에게 브로드캐스트 (자신 제외)
    this.broadcast(enrichedEvent, connectionId)
  }

  // 모든 연결된 클라이언트에게 메시지 브로드캐스트
  private broadcast(event: DrawEvent, excludeConnectionId?: string) {
    const message = JSON.stringify(event)
    
    this.connections.forEach((ws, connectionId) => {
      if (connectionId !== excludeConnectionId && ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }

  // 현재 연결된 사용자 수
  getActiveUsers(): number {
    return this.connections.size
  }

  // 그리기 히스토리 가져오기
  getDrawHistory(): DrawEvent[] {
    return this.drawHistory.filter(event => event.type === 'draw')
  }
}

// 싱글톤 인스턴스
export const canvasService = new CanvasService()