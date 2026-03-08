// WebSocket 관련 타입 정의
export interface WebSocketConnection {
  socket: any // WebSocket 객체
  userId: string
  roomId?: string
  joinTime: number
}

export interface DrawEvent {
  type: 'draw' | 'erase' | 'clear' | 'undo' | 'redo'
  x?: number
  y?: number
  prevX?: number
  prevY?: number
  color?: string
  lineWidth?: number
  tool?: string
  timestamp?: number
}

export interface WebSocketMessage {
  type: 'join' | 'leave' | 'draw' | 'sync' | 'user_count'
  roomId?: string
  userId?: string
  data?: DrawEvent[]
  userCount?: number
}

export interface ChatMessage {
  type: 'message' | 'user_join' | 'user_leave' | 'user_list'
  message?: string
  nickname?: string
  timestamp: number
  userId?: string
  userCount?: number
  users?: string[]
}

export interface ChatUser {
  id: string
  nickname: string
  joinTime: number
}