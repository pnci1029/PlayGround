# M3 — 프론트엔드 구현 스펙

> Next.js(App Router) 모바일 최적화 웹앱. 원형 Flutter 앱의 3단계 플로우를 계승. (상위: PLANNING.md §10)

## 1. 스택
- Next.js 15 App Router + React 19 + TypeScript + **Tailwind v4**
- 폰트: **Pretendard**(UI 산세리프, 기본) + **Gowun Batang/고운바탕**(소설 본문, 부드러운 serif) — CDN `<link>` 로드
- **이모지 최소화**: 장르 아이콘·장식 이모지 제거, 타이포 중심 카드
- **공유**: 리더에서 "공유" → Web Share API(`navigator.share`, 모바일 카카오톡 등) / 미지원 시 클립보드 링크 복사
- 상태: 로컬 훅 + localStorage. 별도 전역 상태 라이브러리 없음(MVP)
- API: `NEXT_PUBLIC_API_URL`(기본 `http://localhost:8004/api`)

## 2. 디바이스 ID & API
- `lib/device.ts`: 최초 진입 시 `crypto.randomUUID()` → localStorage `story_uid`. 모든 API 요청 헤더 `X-Story-Uid`.
- **API base 정규화 (stock_screener 방식)**: 브라우저는 **상대경로 `/api/*`** 로 호출(`API_BASE = NEXT_PUBLIC_API_URL ?? '/api'`), 프록시는 **`next.config.js` rewrites**가 `API_PROXY_TARGET ?? 'https://story-api.chhong.kr'`로 처리. Vercel env에 의존하지 않아 누락돼도 안 깨짐. 로컬 dev는 `API_PROXY_TARGET=http://localhost:8004`로 오버라이드. (`vercel.json` 미사용)
- `lib/api.ts`: fetch 래퍼 + `ApiError{status, code}`. 함수: `getUsage`, `generateStory`, `getFeed`, `getStory`, `getMine`, `getBookmarked`, `toggleBookmark`, `reportStory`, `setVisibility`.
- 에러 코드 → 메시지: `DAILY_LIMIT`="오늘 생성 한도(3개)를 모두 사용했어요", `UNSAFE_INPUT`/`UNSAFE_OUTPUT`="안전 정책에 의해 생성할 수 없는 내용이에요", `GENERATION_FAILED`="생성에 실패했어요. 다시 시도해 주세요".

## 3. 라우트 / 화면
| 경로 | 화면 | 동작 |
|------|------|------|
| `/` | 홈 | 타이틀 + 소개 카드 + "시작하기"(→/genre) + "다른 이야기 둘러보기"(→/feed) |
| `/genre` | 장르 선택 | 8개 장르(이름+짧은 설명, 이모지 없음), 선택 → /create?genre= |
| `/create` | 줄거리 입력 | **세부 장르 칩(선택)** + **간략한 줄거리 textarea**(5~500자) + 쿼터 배지 → POST → /reader/[id] |
| `/reader/[id]` | 리더 | 챕터 본문, 글자 크기 조절, 키워드/조회수, "새 이야기"/"피드" |
| `/feed` | 피드 | 공개 글 목록(최신/인기), 카드 클릭 → /reader/[id] |

## 4. 디자인
- 다크 + 웜브라운 포인트: 배경 `#1A1A1A`, 카드 `#2D2D2D`, 브랜드 `#8B7355`.
- 모바일 우선: 단일 컬럼, `max-w-md` 중앙 정렬, 큰 터치 타깃(h-14 버튼), 하단 고정 CTA, 세이프에어리어.
- 본문 명조체 + 넉넉한 행간(`leading-8`), 글자 크기 조절(14~24px).
- 쿼터 배지: "오늘 N/3" — 소진 시 생성 버튼 비활성 + 안내.

## 5. 컴포넌트
- `components/QuotaBadge.tsx`, `components/Spinner.tsx`, `components/StoryCard.tsx`.
- `lib/genres.ts`(FE): id→{name, emoji} (백엔드 장르와 동일 id, UI용 이모지 추가).

## 6. 동작 확인
- `next build` 통과(컴파일/타입) + dev 서버 기동 후 홈 렌더 확인. (BE 동시 기동 시 전체 플로우 E2E 가능)
