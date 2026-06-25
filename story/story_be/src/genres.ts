// 소설 장르 정의 + 장르별 "근거화 어휘"(grounding) — 산문 생성 프롬프트에 주입해
// 보라색 산문/클리셰 대신 구체적 디테일로 장르를 살린다. (근거: docs/llm-fiction-research.md §1.2)
export interface Genre {
  id: string
  name: string
  grounding: string // 시스템 프롬프트에 주입할 장르별 디테일 가이드
  subs: string[] // 선택형 세부 장르 (FE lib/genres.ts와 동일). 데일리 AI가 랜덤 추첨에 사용
}

export const GENRES: Genre[] = [
  { id: 'scifi', name: 'SF', grounding: '실제 기술/물리 메커니즘으로 근거화하고, 가설의 논리적 귀결을 따라간다. 막연한 미래 묘사 대신 작동 원리를 보여준다.', subs: ['우주', '디스토피아', '시간여행', 'AI', '포스트아포칼립스'] },
  { id: 'fantasy', name: '판타지', grounding: '마법/세계관에 일관된 규칙과 대가를 부여한다. 힘에는 비용이 따르고, 설정은 끝까지 모순 없이 유지된다.', subs: ['마법', '기사', '드래곤', '이세계', '신화'] },
  { id: 'mystery', name: '추리/미스터리', grounding: '단서·알리바이·물증·타임라인을 공정하게 배치한다. 독자가 함께 추리할 수 있도록 정보를 숨기되 속이지 않는다.', subs: ['살인사건', '밀실', '탐정', '심리', '도시전설'] },
  { id: 'romance', name: '로맨스', grounding: '인물의 내적 동기와 관계의 긴장을 구체적 행동/대화로 드러낸다. 감정을 설명하지 말고 보여준다.', subs: ['첫사랑', '재회', '오피스', '운명', '계약연애'] },
  { id: 'thriller', name: '스릴러', grounding: '시한과 위협을 점증시킨다. 각 장면은 위험을 키우거나 판돈을 올린다.', subs: ['추격', '복수', '음모', '범죄', '재난'] },
  { id: 'horror', name: '공포', grounding: '직접 묘사보다 암시와 분위기로 불안을 쌓는다. 보이지 않는 것이 더 무섭다.', subs: ['괴담', '저주', '심령', '생존', '광기'] },
  { id: 'historical', name: '사극', grounding: '시대의 구체적 디테일(의복·제도·언어결)로 분위기를 만든다. 고증된 감각을 우선한다.', subs: ['궁중', '무협', '전쟁', '암행', '민담'] },
  { id: 'comedy', name: '코미디', grounding: '상황의 아이러니와 말맛으로 웃긴다. 설명형 농담이 아니라 상황에서 웃음이 나오게 한다.', subs: ['일상', '로맨틱', '풍자', '슬랩스틱', '패러디'] },
]

export const GENRE_IDS = new Set(GENRES.map((g) => g.id))

export function findGenre(id: string): Genre | undefined {
  return GENRES.find((g) => g.id === id)
}
