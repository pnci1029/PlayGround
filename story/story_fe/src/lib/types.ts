export interface Usage {
  used: number
  limit: number
  remaining: number
}

export interface Chapter {
  title: string
  body: string
}

// POST /api/stories 응답
export interface GeneratedStory {
  id: string
  title: string
  logline: string
  genre: string
  keywords: string[]
  chapters: Chapter[]
  createdAt: string
  usage: Usage
}

// GET /api/stories/:id 응답 (DB row)
export interface StoryDetail {
  id: string
  author_uid: string
  title: string
  logline: string
  genre: string
  keywords: string[]
  content: string
  chapters: Chapter[] | null
  view_count: number
  created_at: string
  bookmarked?: boolean
}

// 목록 아이템 (본문 제외)
export interface StoryListItem {
  id: string
  title: string
  logline: string
  genre: string
  keywords: string[]
  view_count: number
  created_at: string
}
