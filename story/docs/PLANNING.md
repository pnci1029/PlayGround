# Story — AI 소설 생성 앱 기획서

> 사용자가 **장르 + 키워드**를 고르면 LLM이 짧은 **소설**을 생성해 읽게 해주는 웹앱.
> PlayGround 모노레포에 새 프로젝트로 편입한다.
> 최종 수정: 2026-06-24 · 상태: **설계 합의 단계 (구현 전)**

---

## 1. 개요 & 목표

- 한 줄 소개: "AI로 만드는 당신만의 이야기" — 장르와 키워드만으로 개인화된 단편 소설 생성.
- 원형: `hubs/story` (Flutter + Express 더미 백엔드, AI 미연동 프로토타입). 이번엔 **모노레포 규약에 맞춰 Next.js 웹앱 + Fastify BE + 실제 OpenAI 연동**으로 재구성한다.
- MVP 성공 기준:
  1. 장르+키워드 입력 → 실제 LLM이 생성한 소설을 읽을 수 있다.
  2. 한 사용자가 **하루 최대 3개** 생성, 초과 시 차단/안내.
  3. **남이 만든 소설은 제한 없이 열람** 가능(피드).

---

## 2. 확정 사항 (사용자 결정)

| 항목 | 결정 |
|------|------|
| 사용자 식별 | **익명 디바이스 ID** (localStorage `story_uid`, 헤더 `X-Story-Uid`로 전송). 가입/로그인 없음 |
| 생성 제한 | **사용자당 하루 3개** (KST 기준 자정 리셋). 남의 글 **열람은 무제한** |
| 콘텐츠 종류 | **초기엔 "소설"만**. (시/에세이/시나리오 등은 추후) |
| 장르 | 소설 내 장르 다수 제공 — **SF, 판타지, 추리/미스터리** 중심 + 로맨스/스릴러/공포/사극/코미디 |
| LLM 모델 | **전 단계 `gpt-4.1-mini`** (최저가 우선). 모더레이션은 무료 `omni-moderation-latest`. ※ 모델 선택 근거는 리서치 문서 "모델 선택 가이드" 참고 |
| 공개 기본값 | **기본 공개**(피드 노출). 비공개 옵션은 추후 검토 |
| 본문 형식 | **챕터 분리**(`chapters` JSONB). 단편 목표 ~1,500–3,000자, 3~4개 비트 |
| 쿼터 정책 | **실패는 차감 안 함**, **재생성도 1개로 카운트**. 성공 시에만 +1 |
| OpenAI 키 | 발급 완료 → **루트 `.env` 한 곳**에서 관리(`STORY_*` 접두어, gitignore). 프로젝트별 `.env` 미사용 |
| 채택된 보강 | IP 보조 레이트리밋 · 입출력 양방향 모더레이션 · `STYLE BANS` 블록 · 공개글 신고 버튼 · **WS 미사용(SSE)** |
| 이번 작업 범위 | **디렉토리 골격 + 기획서/리서치 정리**. 구현은 설계 합의 후 |

---

## 3. 범위 (Scope)

### In Scope (MVP)
- 익명 사용자 식별 + 하루 3개 생성 제한(서버 강제).
- 장르 선택 → 키워드 입력 → AI 소설 생성 → 리더로 읽기.
- 공개 피드(남이 만든 글 목록/열람), 조회수.
- 내 이야기 페이지(내가 쓴 글 / 저장한 글).
- 북마크(저장), 공개 글 신고.
- 입력/출력 모더레이션(안전).
- 모바일 최적화 UI(다크 + 웜브라운 테마, 본문 가독성).

### Out of Scope (이번엔 제외 / 추후)
- 회원가입·로그인·소셜 인증 (→ 익명 ID로 대체).
- 소설 외 콘텐츠(시/에세이/웹툰 등).
- 연재(시리즈)·캐릭터 지속성·RAG 기반 장편 일관성.
- 댓글·좋아요·팔로우 등 소셜 기능(조회수 정도만).
- 자가 교정(self-critique) 추가 패스 (비용 최저가 정책상 보류, 품질 이슈 시 재검토).
- WebSocket 서버 — **불필요**. 스트리밍은 HTTP **SSE**로 충분 (→ §6, §13 참고).

---

## 4. 시스템 아키텍처 (모노레포 통합)

```
[Next.js FE (Vercel)]  --/api/*-->  [Caddy]  -->  [story BE :8004 (Fastify)]  -->  [공용 PostgreSQL :5432 / schema: story]
       story.chhong.kr                              story-api.chhong.kr                 (OpenAI API 외부 호출)
```

- **BE**: Fastify(TS, ESM). 기존 `blog_be` 레이아웃을 템플릿으로 사용.
- **FE**: Next.js(App Router) + Tailwind. 기존 `trend_fe` 레이아웃 참고. 프로덕션은 **Vercel** 배포(FE는 Docker 미사용).
- **DB**: 프로젝트별 schema 분리 규약. 환경별로 드라이버를 분기한다.
  - **로컬 개발**: **PGlite**(임베디드 PostgreSQL, WASM) — 별도 DB 프로세스/Docker 불필요, `npm install`만. 데이터는 `story_be/.pgdata/`에 영속(gitignore). *왜 PGlite인가:* 속이 진짜 Postgres라 운영의 공용 Postgres와 **SQL 100% 동일**(JSONB·`TEXT[]`·`gen_random_uuid()`·스키마·`ON CONFLICT`). SQLite는 방언이 달라 코드가 갈라지므로 배제. (H2는 JVM 전용이라 Node 스택에 부적합.)
  - **프로덕션**: 서버의 **공용 PostgreSQL + `story` 스키마** 추가.
  - **DB 어댑터**: `DB_DRIVER` 환경변수로 분기(`pglite`=로컬 / `pg`=운영). 양쪽 동일한 `query(text, params)` 인터페이스 노출 → **애플리케이션 SQL은 한 벌**로 유지. (로컬 PGlite는 단일 커넥션 — 개발용으로 충분.)
- **환경변수(.env)**: 비밀값은 **모노레포 루트 `.env` 단일 파일**에서 관리(다른 프로젝트와 동일 규약). story 전용 키는 **`STORY_` 접두어**로 네임스페이싱(`STORY_OPENAI_API_KEY`, `STORY_DB_DRIVER`, `STORY_PORT` 등). 프로덕션은 컨테이너에 `env_file: 루트 .env`로 주입, 로컬은 `story_be`가 루트 `.env`를 로드. 프로젝트별 `.env`는 두지 않음.
- **포트**(빈 번호 확인됨): BE HTTP **8004**, FE dev **3004**. (WS 8014는 예약만 하고 **사용 안 함** — SSE 사용.)
- **도메인**: `story.chhong.kr`(FE), `story-api.chhong.kr`(API).

### 모노레포 등록 체크리스트 (구현 단계에서)
- `database/init-schemas.sql`: `CREATE SCHEMA IF NOT EXISTS story;` + GRANT 추가 (+ 기존 DB엔 수동 `CREATE SCHEMA`).
- `story/docker-compose.yml`(BE 전용, 외부 네트워크) + 루트 `docker-compose.story.yml`(로컬 통합, 선택).
- `caddy/Caddyfile`: `story-api.chhong.kr` / `story.chhong.kr` 블록 추가 → `story:8004`.
- `deploy.sh`: `STORY_CHANGED` 변수 + 배포 블록 + 루프 목록 추가.
- `.github/workflows/test-and-deploy.yml`: tar 포함목록 / 변경감지 / env 전달 / health check 추가.
- `story/story_fe/vercel.json`: `/api/*` → `https://story-api.chhong.kr/api/$1` rewrite.

---

## 5. 데이터 모델 (`story` 스키마)

> 부팅 시 `CREATE TABLE IF NOT EXISTS`로 생성(playground/blog 방식). 마이그레이션 파일 불필요.

```sql
-- 생성된 소설
CREATE TABLE IF NOT EXISTS story.stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_uid   VARCHAR(64) NOT NULL,           -- 익명 디바이스 ID
  title        VARCHAR(200) NOT NULL,
  logline      TEXT,                            -- 한 줄 요약
  genre        VARCHAR(30) NOT NULL,            -- 'scifi' | 'fantasy' | 'mystery' ...
  keywords     TEXT[] NOT NULL DEFAULT '{}',
  content      TEXT NOT NULL,                   -- 본문(전체). 챕터 분리 시 chapters로 확장 가능
  chapters     JSONB,                           -- [{title, body}] (선택) — 챕터형일 때
  model        VARCHAR(40),                     -- 'gpt-4.1-mini'
  is_public    BOOLEAN NOT NULL DEFAULT TRUE,   -- 기본 공개(피드 노출)
  view_count   INTEGER NOT NULL DEFAULT 0,
  status       VARCHAR(20) NOT NULL DEFAULT 'done', -- 'done' | 'failed'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stories_public_created ON story.stories (is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_author ON story.stories (author_uid, created_at DESC);

-- 하루 사용량(쿼터) — 사용자/날짜별 카운트
CREATE TABLE IF NOT EXISTS story.daily_usage (
  user_key    VARCHAR(64) NOT NULL,
  usage_date  DATE NOT NULL,                    -- KST 기준 날짜
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_key, usage_date)
);
```

```sql
-- 공개 글 신고
CREATE TABLE IF NOT EXISTS story.reports (
  id            UUID PRIMARY KEY,
  story_id      UUID NOT NULL,
  reporter_uid  VARCHAR(64) NOT NULL,
  reason        VARCHAR(40),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 북마크(저장)
CREATE TABLE IF NOT EXISTS story.bookmarks (
  user_key    VARCHAR(64) NOT NULL,
  story_id    UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_key, story_id)
);
```

- 쿼터 증가 규칙: **생성 성공 시에만 +1** (실패는 차감 안 함). UPSERT로 원자적 증가.

---

## 6. API 설계

표준 응답 `{ success, data?, error? }`. 모든 요청은 헤더 `X-Story-Uid` 동반.

| 메서드 | 경로 | 설명 | 쿼터 |
|--------|------|------|------|
| `GET`  | `/health` | 헬스체크 | - |
| `GET`  | `/api/genres` | 장르 목록 | - |
| `GET`  | `/api/usage` | 오늘 남은 생성 횟수 `{ used, limit:3, remaining }` | - |
| `POST` | `/api/stories` | **소설 생성** `{ genre, keywords[] }` → 생성·저장·반환 | 차감 |
| `POST` | `/api/stories/stream` | (선택) SSE 스트리밍 생성 | 차감 |
| `GET`  | `/api/stories` | 공개 피드 목록(`?sort=recent|popular&cursor=`) | - |
| `GET`  | `/api/stories/:id` | 단건 열람(조회수 +1) | - |
| `GET`  | `/api/stories/mine` | 내 글 목록(`X-Story-Uid` 기준) | - |
| `GET`  | `/api/stories/bookmarked` | 내가 저장한 글 목록 | - |
| `POST` | `/api/stories/:id/bookmark` | 북마크 토글 → `{ bookmarked }` | - |
| `POST` | `/api/stories/:id/report` | 신고 `{ reason? }` | - |

- 생성 흐름(서버): `usage 확인 → 초과 시 429` → `키워드 모더레이션` → `생성` → `출력 모더레이션` → `저장 + usage UPSERT +1` → 반환.
- 쿼터 초과: HTTP **429** + `{ error: 'DAILY_LIMIT', remaining: 0 }`.
- 모더레이션 위반: HTTP **422** + `{ error: 'UNSAFE_INPUT' }`.

---

## 7. 사용자 식별 & 하루 제한 로직

- 최초 진입 시 FE가 `crypto.randomUUID()`로 `story_uid` 생성 → localStorage 저장 → 이후 모든 요청 헤더에 첨부.
- 서버는 `X-Story-Uid`를 신뢰하되, **남용 방지 백스톱으로 IP 기준 보조 레이트리밋** 권장(디바이스 ID는 위조·초기화 가능하므로). 예: 같은 IP에서 1시간 N회 초과 차단.
- 날짜 경계는 **Asia/Seoul** 고정(서버에서 KST 날짜 계산).
- 동시요청 레이스: `INSERT ... ON CONFLICT (user_key, usage_date) DO UPDATE SET count = daily_usage.count + 1 RETURNING count`로 원자적 처리 후, 반환된 count가 limit 초과면 롤백/거부.

---

## 8. 장르 & 콘텐츠 정책

- **매체: 소설(novel) 단일** (MVP). 향후 `medium` 컬럼/탭으로 시·에세이 확장 여지.
- 장르(초기 제공):

| id | 이름 | 근거화 어휘(프롬프트 주입용 예시) |
|----|------|----------------------------------|
| `scifi` | SF | 실제 기술/물리 메커니즘, 가설의 논리적 귀결 |
| `fantasy` | 판타지 | 마법 체계의 규칙과 대가, 세계관 일관성 |
| `mystery` | 추리/미스터리 | 단서·알리바이·물증·타임라인, 공정한 단서 배치 |
| `romance` | 로맨스 | 관계 긴장·내적 동기 |
| `thriller` | 스릴러 | 시한·위협의 점증 |
| `horror` | 공포 | 분위기·암시(직접 묘사 절제) |
| `historical` | 사극 | 시대 고증 디테일 |
| `comedy` | 코미디 | 상황·말맛 |

- 분량: **단편**(목표 약 1,500~3,000자 / 3~4개 비트). max tokens로 캡.
- 언어: **한국어** 출력.

---

## 9. AI 생성 파이프라인 (전 단계 gpt-4.1-mini)

리서치 근거: `docs/llm-fiction-research.md` 참고. "한 번에 통짜 생성" 대신 **계획→확장** 경량 체인.

```
1) 입력 모더레이션   omni-moderation-latest (무료)  — 키워드 안전성
2) 로그라인+비트     gpt-4.1-mini, temp 0.5, Structured Outputs(JSON)
                     → {title, logline, beats:[...], pov, tone}  (= story bible)
3) 산문 확장         gpt-4.1-mini, temp ~0.95, frequency_penalty ~0.5
                     → 비트별/단편 본문 (SSE 스트리밍 가능)
4) 출력 모더레이션   omni-moderation-latest — 결과 재검사
5) 저장 + 쿼터 +1
```

- **시스템 프롬프트 고정 접두부**(소설가 페르소나 + `STYLE BANS` 블록)를 프롬프트 앞에 배치 → **프롬프트 캐싱**으로 비용·지연 절감.
- `STYLE BANS`(AI 티/클리셰 억제) 예: "It was not X but Y"식 안티테제·"없는 것" 묘사·세피아 향수조·설교형 깨달음 금지(상세는 리서치 문서 §1.6).
- 단편 1편이라 2단계(로그라인/비트 → 산문)면 충분. 장편/연재 전까진 RAG·상태추적 불필요.
- (보류) 자가 교정 패스: 품질 부족 시 추가. 현 정책은 비용 최저가.

---

## 10. 프론트엔드 / UX (모바일 최적화)

원형 Flutter 앱의 3단계 플로우를 **웹으로 계승**하되 UI/UX를 더 다듬는다.

- 플로우: `홈 → 장르 선택 → 키워드 입력 → (생성 중) → 리더` + `피드(남의 글)` 탭.
- 테마: 다크 + 웜브라운(`#8B7355`) 포인트, 본문 **명조 계열**(가독성), 넉넉한 행간.
- 모바일 우선: 단일 컬럼, 큰 터치 타깃(56px 버튼), 하단 고정 CTA, 세이프에어리어.
- 리더: 폰트 크기 조절, 진행률, 키워드 칩, "새 이야기/저장(북마크)".
- 생성 중: **SSE 스트리밍**으로 본문이 써지는 연출(체감 지연↓) — 옵션, 미구현 시 스피너 + 진행 단계 표시.
- 쿼터 표시: "오늘 N/3개 남음" 배지. 소진 시 생성 버튼 비활성 + 안내.
- 피드: 카드 리스트(제목/장르/키워드/조회수), 정렬(최신/인기).

---

## 11. 보안 & 모더레이션

- **입력/출력 양방향 모더레이션**(무료 omni-moderation). 명백 위반(특히 미성년 성적 콘텐츠 등)은 무조건 차단, 일반 창작 주제는 다소 허용.
- 공개 글 **신고 버튼**(추후 `story.reports`) — 운영 안전장치.
- OpenAI 키는 **BE에서만** 사용(.env). FE 노출 금지.
- CORS 화이트리스트(`story.chhong.kr`, localhost), 입력 길이/개수 제한(키워드 개수·길이).
- IP 보조 레이트리밋(§7) — 디바이스 ID 위조 대비.

---

## 12. 비용 추정 (개략)

- 모델: `gpt-4.1-mini` (mini 가격대, gpt-4o 대비 대폭 저렴). 모더레이션 무료.
- 단편 1편 ≈ 입력 수백~1천 토큰 + 출력 1~2천 토큰 수준 → **편당 매우 저렴**(수 원 이하 추정).
- 절감책: 시스템 프롬프트 캐싱, 하루 3개 상한 자체가 비용 상한 역할.
- ⚠️ 실제 단가·모델 가용성은 구현 직전 OpenAI 가격/모델 목록 재확인.

---

## 13. 결정 완료 / 잔여 미정

### 결정 완료 ✅
1. **OpenAI 키** — 발급 완료, **루트 `.env`**(`STORY_OPENAI_API_KEY`, gitignore)에서 단일 관리.
2. **공개 기본값** — 기본 공개.
3. **본문 형식** — 챕터 분리(`chapters` JSONB), 단편 ~1,500–3,000자.
4. **쿼터 정책** — 실패 차감 없음, 재생성도 1개 카운트, 성공 시에만 +1.
5. **WS 포트(8014)** — 미사용 확정. 스트리밍은 SSE.
6. **보강 채택** — IP 보조 레이트리밋 · 입출력 양방향 모더레이션 · STYLE BANS · 신고 버튼.
7. **로컬 DB** — **PGlite**(임베디드 PG). 운영 = 공용 Postgres + `story` 스키마. `DB_DRIVER`로 분기, SQL은 한 벌.
8. **키워드 프롬프트 인젝션 방어** — 키워드는 '소재 데이터'로만 취급(역할/구분자 분리, 지시 무시 규칙), 개수·길이 제한.

### 잔여 미정 (구현 중 확정 가능, 블로커 아님)
1. **월 예산 캡** — OpenAI 대시보드에서 사용량 상한(usage limit) 설정 권장 값? (하루 3개 상한이 1차 방어선)
2. **모델 최종 확정** — `gpt-4.1-mini` 기본. 산문 품질이 부족하면 **산문 단계만** `gpt-4.1`로 승급할지(비용↑). → 구현 후 샘플 보고 판단.
3. **스트리밍 채택** — SSE "써지는" 연출을 M2에 넣을지 M4로 미룰지(기능적 블로커 아님).
4. **신고 운영 범위** — 신고 버튼만(M4) vs 자동 숨김 임계치까지?

---

## 14. 마일스톤 (제안)

- **M0 (이번)**: 디렉토리 골격 + 기획서 + 리서치 정리. ✅
- **M1**: BE 스캐폴드(Fastify, DB 스키마/테이블, `/health`, `/api/genres`, `/api/usage`) + 모노레포 등록.
- **M2**: 생성 파이프라인(모더레이션→로그라인/비트→산문) + `/api/stories` 저장/반환 + 쿼터 강제.
- **M3**: FE(홈/장르/키워드/리더/피드) 모바일 UI + 디바이스 ID + 쿼터 표시.
- **M4**: 스트리밍·신고·정렬 등 다듬기 + 배포(Caddy/Vercel/CI).

---

## 15. 디렉토리 구조 (현재 골격)

```
story/
├── docs/
│   ├── PLANNING.md                 # (이 문서)
│   └── llm-fiction-research.md     # LLM 소설생성 기법 리서치
├── story_be/                       # Fastify(TS) 백엔드
│   └── src/{routes,services,middleware,utils,types}/
└── story_fe/                       # Next.js(App Router) 프론트엔드
    └── src/{app,components,lib,types}/
```
