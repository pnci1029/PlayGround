export interface ToolStats {
  id: number
  tool_name: string
  total_visits: number
  daily_visits: number
  weekly_visits: number
  last_visited: Date
  created_date: Date
  updated_at: Date
}

export interface ToolBadges {
  tool_name: string
  badges: ('NEW' | 'HOT' | 'TRENDING')[]
  visit_count: number
  is_new: boolean
  is_hot: boolean
  is_trending: boolean
}

export interface StatsResponse {
  badges: Record<string, ToolBadges>
  global_stats: {
    total_tools: number
    total_visits: number
    active_tools: string[]
  }
}

export interface VisitRequest {
  tool_name: string
  user_ip?: string
}