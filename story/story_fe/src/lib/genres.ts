// FE 장르 메타 — 백엔드와 동일한 id. 이모지 대신 짧은 설명으로 차분하게.
export interface GenreMeta {
  id: string
  name: string
  desc: string
}

export const GENRES: GenreMeta[] = [
  { id: 'scifi', name: 'SF', desc: '과학과 미래의 상상' },
  { id: 'fantasy', name: '판타지', desc: '마법과 다른 세계' },
  { id: 'mystery', name: '추리', desc: '단서와 반전' },
  { id: 'romance', name: '로맨스', desc: '마음과 관계' },
  { id: 'thriller', name: '스릴러', desc: '긴장과 추격' },
  { id: 'horror', name: '공포', desc: '서늘한 분위기' },
  { id: 'historical', name: '사극', desc: '시대와 운명' },
  { id: 'comedy', name: '코미디', desc: '유쾌한 소동' },
]

export const GENRE_NAME: Record<string, string> = Object.fromEntries(
  GENRES.map((g) => [g.id, g.name]),
)
