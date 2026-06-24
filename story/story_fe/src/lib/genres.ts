// FE 장르 메타 — 백엔드와 동일한 id, UI용 이모지 추가.
export interface GenreMeta {
  id: string
  name: string
  emoji: string
}

export const GENRES: GenreMeta[] = [
  { id: 'scifi', name: 'SF', emoji: '🚀' },
  { id: 'fantasy', name: '판타지', emoji: '✨' },
  { id: 'mystery', name: '추리/미스터리', emoji: '🔍' },
  { id: 'romance', name: '로맨스', emoji: '💗' },
  { id: 'thriller', name: '스릴러', emoji: '⚡' },
  { id: 'horror', name: '공포', emoji: '🌑' },
  { id: 'historical', name: '사극', emoji: '🏯' },
  { id: 'comedy', name: '코미디', emoji: '😄' },
]

export const GENRE_NAME: Record<string, string> = Object.fromEntries(
  GENRES.map((g) => [g.id, g.name]),
)
