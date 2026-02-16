import { WebSocketServer } from 'ws'

// 간단한 ID 생성기
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

interface DrawEvent {
  type: 'draw' | 'clear' | 'user_join' | 'user_leave'
  data?: any
  timestamp: number
  userId?: string
}

class CanvasWebSocketServer {
  private wss: WebSocketServer
  private connections = new Map<string, any>()
  private drawHistory: DrawEvent[] = []

  constructor(port: number = 8083) {
    this.wss = new WebSocketServer({ port })
    
    this.wss.on('connection', (ws) => {
      const userId = generateId()
      this.connections.set(userId, ws)
      
      console.log(`Canvas user connected: ${userId} (총 ${this.connections.size}명)`)
      
      // 새 사용자에게 기존 그림 데이터 전송
      ws.send(JSON.stringify({
        type: 'init',
        data: this.drawHistory.filter(event => event.type === 'draw'),
        timestamp: Date.now()
      }))
      
      // 다른 사용자들에게 새 사용자 알림
      this.broadcast({
        type: 'user_join',
        timestamp: Date.now(),
        userId
      }, userId)

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString())
          this.handleDrawEvent(userId, data)
        } catch (error) {
          console.error('Canvas message parse error:', error)
        }
      })

      ws.on('close', () => {
        this.connections.delete(userId)
        this.broadcast({
          type: 'user_leave',
          timestamp: Date.now(),
          userId
        })
        console.log(`Canvas user disconnected: ${userId} (남은 ${this.connections.size}명)`)
      })

      ws.on('error', (error) => {
        console.error('Canvas WebSocket error:', error)
        this.connections.delete(userId)
      })
    })

    console.log(`🎨 Canvas WebSocket server running on ws://localhost:${port}`)
  }

  private handleDrawEvent(userId: string, event: DrawEvent) {
    const enrichedEvent = {
      ...event,
      userId,
      timestamp: Date.now()
    }

    // 그리기 히스토리 관리
    if (event.type === 'clear') {
      this.drawHistory = [enrichedEvent]
    } else if (event.type === 'draw') {
      this.drawHistory.push(enrichedEvent)
      
      // 히스토리가 너무 길어지면 정리 (메모리 관리)
      if (this.drawHistory.length > 10000) {
        this.drawHistory = this.drawHistory.slice(-8000)
      }
    }

    // 모든 연결된 클라이언트에게 브로드캐스트 (자신 제외)
    this.broadcast(enrichedEvent, userId)
  }

  private broadcast(event: DrawEvent, excludeUserId?: string) {
    const message = JSON.stringify(event)
    
    this.connections.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === 1) { // WebSocket.OPEN = 1
        ws.send(message)
      }
    })
  }

  getActiveUsers(): number {
    return this.connections.size
  }
}

// WebSocket 서버 시작
new CanvasWebSocketServer(8083)