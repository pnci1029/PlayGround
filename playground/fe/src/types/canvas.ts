// Canvas 관련 타입 정의

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

export interface CanvasState {
  id: string
  title: string
  data: string // base64 encoded image data
  createdAt: string
  updatedAt: string
  author?: string
  isPublic?: boolean
}

export interface WebSocketMessage {
  type: 'join' | 'leave' | 'draw' | 'sync' | 'user_count'
  roomId?: string
  userId?: string
  data?: DrawEvent[]
  userCount?: number
}

export interface ArtworkData {
  id: string
  title: string
  description?: string
  canvas_data: string
  created_at: string
  updated_at: string
  is_public?: boolean
  author?: string
  author_name?: string
  likes?: number
  views?: number
}

export interface CanvasPageProps {
  searchParams: {
    edit?: string
  }
}

export type SortOption = 'latest' | 'popular' | 'views'