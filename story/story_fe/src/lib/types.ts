export interface Usage {
  used: number
  limit: number
  remaining: number
  unlimited?: boolean
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
  premise: string
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
  premise: string | null
  keywords?: string[] // 레거시
  content: string
  chapters: Chapter[] | null
  is_public: boolean
  view_count: number
  created_at: string
  edited_at?: string | null
  parent_id?: string | null // 시리즈: 이전 화(원작) id
  next_id?: string | null // 시리즈: 다음 화(직속 속편) id
  bookmarked?: boolean
}

// POST /api/stories/manual 응답
export interface ManualSaveResult {
  id: string
  title: string
  genre: string
  isPublic: boolean
  createdAt: string
}

// PATCH /api/stories/:id 응답
export interface UpdateResult {
  id: string
  title: string
  editedAt: string
}

// 목록 아이템 (본문 제외)
export interface StoryListItem {
  id: string
  title: string
  logline: string
  genre: string
  view_count: number
  created_at: string
  is_public: boolean
}
