# 로드맵 — 직접 작성 / AI 글 수정

> 요구: ① AI 도움 없이 **직접 작성**하는 기능, ② AI가 쓴 글의 **일부를 본인이 수정**하는 기능. (작성: 베타 기간, 미구현 — 둘 다 구현 가능, 작업량 중간)

## 1. 직접 작성 (AI 없이)
- 사용자가 **제목 + 본문을 직접** 써서 등록. AI 생성 파이프라인 우회.
- **API**: `POST /api/stories/manual` `{ title, content, genre?, isPublic? }` — 입력 모더레이션만 거쳐 저장.
- **FE**: 홈/장르 화면에 "직접 쓰기" 진입 → 에디터(제목 + 본문 textarea). 저장 → 리더.
- **스키마**: 기존 `stories` 재사용. `model='manual'`, `premise=null`, `chapters=null`(또는 단일 챕터).
- **쿼터**: OpenAI 비용 0 → 쿼터 차감 안 해도 됨(정책 결정).
- 작업량: **중간**(에디터 UI + 저장 라우트 + 모더레이션).

## 2. AI 글 일부 수정 (작성자)
- 작성자가 생성된 글의 **제목/본문(챕터)을 직접 편집**.
- **API**: `PATCH /api/stories/:id` `{ title?, content?, chapters? }` — **작성자만**(`author_uid` 일치). 수정 후 출력 모더레이션 재검.
- **FE**: 리더(작성자)에 "수정" 버튼 → 편집 모드(제목/본문 textarea) → 저장.
- **단순화**: 챕터별 편집 UX가 복잡하면 **본문(content) 통짜 편집부터** 시작 → 이후 챕터 단위로 확장.
- 작업량: **중간**(편집 UI + PATCH + 권한 + 모더레이션).

## 공통 고려
- **모더레이션**: 직접 입력/수정도 하드블록 카테고리 검사 적용.
- **권한**: 수정은 `author_uid` 일치(익명 uid 기준; 로그인 도입 시 `user_id`로 전환).
- **표시**: 수정/직접작성 글 구분이 필요하면 `edited`/`source` 플래그 추가 가능.

---

## 구현 계획 (2026-06-25) — 착수

> 위 설계를 코드 레벨로 확정. 현재 스키마(`story.stories`)를 그대로 재사용(컬럼 1개만 추가).

### DB (story/story_be/src/db.ts)
- `ALTER TABLE story.stories ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ` — 수정/직접작성 표시용(null=미수정).
- 그 외 컬럼은 기존 것 재사용: `model`('manual' 또는 생성모델), `premise`=null, `chapters`=null 허용.

### P1-a. 직접 작성 — `POST /api/stories/manual`
- 요청 `{ title, content, genre, subGenres?, isPublic? }` (zod: title 1~200, content 20~20000, genre 필수).
- 흐름: genre 검증 → **입력 모더레이션**(title+content, 하드블록만) → insert(`model='manual'`, `premise=null`, `chapters=null`, `logline=null`, `is_public`=요청값 기본 false, `edited_at=now()`).
- **쿼터 차감 안 함**(OpenAI 비용 0).
- 서비스: `storyService.createManualStory(uid, input)`. 응답 `{ id, title, genre, isPublic, createdAt }`.

### P1-b. AI 글 수정 — `PATCH /api/stories/:id`
- 요청 `{ title?, content? }` — **작성자만**(`author_uid` 일치, 아니면 403 / 없으면 404).
- content 수정 시: **출력 모더레이션 재검**(하드블록만, 위반 시 UNSAFE_OUTPUT) → `content` 갱신 + **`chapters=NULL`**(통짜 본문으로 전환, 리더가 단일 블록 렌더) + `edited_at=now()`.
- title만 수정 시: title만 갱신 + `edited_at=now()`.
- 서비스: `storyService.updateStory(uid, id, patch)`. 응답: 갱신된 행 요약.
- 비고: 기존 `PATCH /api/stories/:id/visibility`(공개전환)와 경로가 달라 충돌 없음.

### FE
- API 클라이언트(lib/api.ts): `createManual(input)`, `updateStory(id, patch)` 추가 + 타입.
- **직접 쓰기**: 새 라우트 `/write`(제목+본문 textarea + 장르). 진입 = 홈/장르 화면에 "AI 없이 직접 쓰기" 링크. 저장 → 리더.
- **수정**: 리더(작성자) 공개전환 블록 옆 "수정" 버튼 → 인라인 편집모드(제목/본문 textarea 프리필) → 저장 → 재조회. 본문 편집은 **content 통짜**부터(챕터단위는 추후).

### 검증
- BE: `npm run build`(tsc) 통과. 로컬 pglite로 manual 생성/수정/모더레이션 경로 확인.
- FE: `npm run build` 통과. 리더 수정·직접쓰기 플로우 수동 확인.

## 상태: 구현 착수(2026-06-25). "문서 먼저 → 구현 → 검증" 순서 진행 중.
