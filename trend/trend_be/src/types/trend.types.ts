export interface TrendData {
  keyword: string
  interest: number
  category: string
  source: 'hackernews' | 'reddit' | 'github' | 'devto' | 'rss' | 'korean_search' | 'shopping' | 'youtube' | 'tech'
  timestamp: Date
  region: string
  url?: string
  rank?: number
}

export interface TrendResponse {
  success: boolean
  data: TrendData[]
  lastUpdated: Date
  totalCount: number
  source?: string
}

export interface WebSocketMessage {
  type: 'trend_update' | 'connection_status' | 'error'
  data?: TrendData[]
  message?: string
  timestamp: number
}

export interface TrendCache {
  data: TrendData[]
  lastUpdate: Date
  expiry: Date
}