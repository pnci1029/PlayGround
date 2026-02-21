import { WebSocketServer } from 'ws'

interface ChatMessage {
  type: 'message' | 'user_join' | 'user_leave' | 'user_list'
  message?: string
  nickname?: string
  timestamp: number
  userId?: string
  userCount?: number
  users?: string[]
}

interface User {
  id: string
  nickname: string
  joinTime: number
}

class ChatWebSocketServer {
  private wss: WebSocketServer
  private connections = new Map<string, any>()
  private users = new Map<string, User>()
  private messageHistory: ChatMessage[] = []

  constructor(port: number = 8010) {
    this.wss = new WebSocketServer({ port })
    
    this.wss.on('connection', (ws) => {
      const userId = this.generateId()
      const nickname = this.generateNickname()
      
      const user: User = {
        id: userId,
        nickname,
        joinTime: Date.now()
      }
      
      this.connections.set(userId, ws)
      this.users.set(userId, user)
      
      console.log(`💬 Chat user joined: ${nickname} (${userId}) - 총 ${this.connections.size}명`)
      
      // 새 사용자에게 환영 메시지와 최근 채팅 히스토리 전송
      ws.send(JSON.stringify({
        type: 'user_list',
        users: Array.from(this.users.values()).map(u => u.nickname),
        userCount: this.connections.size,
        timestamp: Date.now()
      }))

      // 최근 메시지 히스토리 전송 (최근 50개)
      const recentMessages = this.messageHistory.slice(-50)
      recentMessages.forEach(msg => {
        ws.send(JSON.stringify(msg))
      })
      
      // 다른 사용자들에게 새 사용자 입장 알림
      this.broadcast({
        type: 'user_join',
        nickname: user.nickname,
        timestamp: Date.now(),
        userCount: this.connections.size,
        users: Array.from(this.users.values()).map(u => u.nickname)
      }, userId)

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(userId, message)
        } catch (error) {
          console.error('Chat message parse error:', error)
        }
      })

      ws.on('close', () => {
        const user = this.users.get(userId)
        this.connections.delete(userId)
        this.users.delete(userId)
        
        if (user) {
          console.log(`💬 Chat user left: ${user.nickname} (${userId}) - 남은 ${this.connections.size}명`)
          
          // 다른 사용자들에게 퇴장 알림
          this.broadcast({
            type: 'user_leave',
            nickname: user.nickname,
            timestamp: Date.now(),
            userCount: this.connections.size,
            users: Array.from(this.users.values()).map(u => u.nickname)
          })
        }
      })

      ws.on('error', (error) => {
        console.error('Chat WebSocket error:', error)
        this.connections.delete(userId)
        this.users.delete(userId)
      })
    })

    console.log(`💬 Chat WebSocket server running on ws://localhost:${port}`)
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private generateNickname(): string {
    const adjectives = [
      '친절한', '활발한', '조용한', '재미있는', '신비한', '밝은', '차분한', '열정적인',
      '똑똑한', '멋진', '귀여운', '용감한', '창의적인', '유쾌한', '성실한', '자유로운'
    ]
    
    const nouns = [
      '고양이', '강아지', '토끼', '펭귄', '코알라', '팬더', '사자', '호랑이',
      '독수리', '돌고래', '나비', '사슴', '여우', '늑대', '곰', '다람쥐'
    ]
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 999) + 1
    
    return `${adjective}${noun}${number}`
  }

  private handleMessage(userId: string, data: any) {
    const user = this.users.get(userId)
    if (!user) return

    if (data.type === 'message' && data.message) {
      // 닉네임이 전송되면 업데이트
      if (data.nickname) {
        user.nickname = data.nickname
        this.users.set(userId, user)
      }

      const chatMessage: ChatMessage = {
        type: 'message',
        message: data.message.trim(),
        nickname: user.nickname,
        timestamp: Date.now(),
        userId
      }

      // 메시지 히스토리에 추가 (최대 1000개 유지)
      this.messageHistory.push(chatMessage)
      if (this.messageHistory.length > 1000) {
        this.messageHistory = this.messageHistory.slice(-800)
      }

      // 모든 사용자에게 브로드캐스트
      this.broadcast(chatMessage)
    }
  }

  private broadcast(message: ChatMessage, excludeUserId?: string) {
    const messageStr = JSON.stringify(message)
    
    this.connections.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === 1) { // WebSocket.OPEN = 1
        ws.send(messageStr)
      }
    })
  }

  getActiveUsers(): number {
    return this.connections.size
  }

  getMessageCount(): number {
    return this.messageHistory.length
  }
}

// Chat WebSocket 서버 시작
new ChatWebSocketServer(8010)