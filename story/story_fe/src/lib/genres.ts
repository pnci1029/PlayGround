// FE 장르 메타 — 백엔드와 동일한 id. 이모지 대신 짧은 설명 + 선택형 세부 장르.
export interface GenreMeta {
  id: string
  name: string
  desc: string
  subs: string[] // 선택형 세부 장르
}

export const GENRES: GenreMeta[] = [
  { id: 'scifi', name: 'SF', desc: '과학과 미래의 상상', subs: ['우주', '디스토피아', '시간여행', 'AI', '포스트아포칼립스'] },
  { id: 'fantasy', name: '판타지', desc: '마법과 다른 세계', subs: ['마법', '기사', '드래곤', '이세계', '신화'] },
  { id: 'mystery', name: '추리', desc: '단서와 반전', subs: ['살인사건', '밀실', '탐정', '심리', '도시전설'] },
  { id: 'romance', name: '로맨스', desc: '마음과 관계', subs: ['첫사랑', '재회', '오피스', '운명', '계약연애'] },
  { id: 'thriller', name: '스릴러', desc: '긴장과 추격', subs: ['추격', '복수', '음모', '범죄', '재난'] },
  { id: 'horror', name: '공포', desc: '서늘한 분위기', subs: ['괴담', '저주', '심령', '생존', '광기'] },
  { id: 'historical', name: '사극', desc: '시대와 운명', subs: ['궁중', '무협', '전쟁', '암행', '민담'] },
  { id: 'comedy', name: '코미디', desc: '유쾌한 소동', subs: ['일상', '로맨틱', '풍자', '슬랩스틱', '패러디'] },
]

export const GENRE_NAME: Record<string, string> = Object.fromEntries(
  GENRES.map((g) => [g.id, g.name]),
)

export function findGenre(id: string): GenreMeta | undefined {
  return GENRES.find((g) => g.id === id)
}
