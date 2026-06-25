# TODO / 백로그 (우선순위)

> 스토리 앱의 할 일·백로그를 한 곳에서 관리. (구버전: 기능마다 roadmap-*.md를 따로 뒀으나 2026-06-25 이 문서로 통합)
> 두꺼운 설계/스펙은 별도 유지: [PLANNING](PLANNING.md) · [generation-pipeline](generation-pipeline.md) · [frontend-spec](frontend-spec.md) · [deploy](deploy.md) · [llm-fiction-research](llm-fiction-research.md)

## ✅ 완료

### P1. 편집 기능 — AI 글 수정 + 직접 작성  ✅ 완료·배포(2026-06-25)
- AI 글 수정: `PATCH /api/stories/:id`(작성자만, 출력 모더레이션 재검 + `chapters=NULL` 통짜전환 + `edited_at`) + 리더 인라인 "글 수정하기".
- 직접 작성: `POST /api/stories/manual`(입력 모더레이션만, `model='manual'`, 쿼터 X) + `/write` 에디터. 홈·장르 진입점.

### P2. 생성 대기 UX 개선  ✅ 완료·배포(2026-06-25, 옵션 A)
- `GenerationProgress`: 추정 타이머로 "구상(~12s)→집필(~45s)→다듬기" 3단계 + 진행바(추정 ~58s, 응답 전 95%에서 멈춤). create 스피너 대체. BE 무변경.
- 옵션 B(SSE 실시간 스트리밍 — BE SSE 라우트 + 본문 토큰 스트림)는 추후.

### P3. 데일리 AI 큐레이션 생성  ✅ 완료(2026-06-25)
- 매일 **10~16시(KST) 사이 랜덤 시각에 하루 1편** AI 자동 생성. 랜덤 장르+세부장르(0~2개) → premise도 AI 자체생성 → 기존 파이프라인 재사용. `author_uid='ai-curator'`, 바로 공개, 쿼터 무관.
- **AI 표식**: `is_ai` 컬럼 + `LIST_COLS` 포함 → 피드/`StoryCard`·리더에 "AI 생성" 배지.
- 스케줄: `scheduler.ts` — 외부 의존성 없이 `setInterval`(15분)로 점검. 예약 시각을 메모리에 두지 않고 **매 틱마다 DB에 물어보는** 방식.
- **발동/멈춤 로직** (틱마다):
  1. KST가 10~16시 윈도우인가? 아니면 패스.
  2. **"오늘 이미 만들었나?"** — `SELECT 1 FROM stories WHERE is_ai AND (created_at AT TIME ZONE 'Asia/Seoul')::date = (now() AT TIME ZONE 'Asia/Seoul')::date`. **있으면 즉시 종료** → 그날 남은 틱은 전부 no-op(= 더 이상 생성 안 함).
  3. 없으면 **확률 `1/남은_틱수`로 발동**. 시간이 갈수록 확률↑, 마지막 틱(15:45)은 100% → **윈도우 내 정확히 1회 보장 + 매일 다른 시각**.
  - **재시작 안전**: '오늘 생성됨'을 메모리가 아니라 **DB(생성된 글)**로 판단 → 배포로 컨테이너 재기동돼도 중복 0. (날짜 경계 = KST 자정)
- 설정: `ENABLE_STORY_DAILY_AI`(production 기본 on, 로컬 off), `STORY_DAILY_AI_COUNT`(기본 1).

### (완료) 속편 생성
- `POST /api/stories/:id/sequel` 구현됨(원작 컨텍스트 주입 → 기존 파이프라인 재사용, `parent_id` 저장). 리더 "속편 쓰기" 버튼.

### (완료) 소설 품질 개선 — 2단계
- C(프롬프트 일관성·고증·가독성 규칙) + D(산문 temp 0.8) + B(`reviseProse` 자기검수 1패스, `STORY_SELF_CRITIQUE` 토글, 실패 시 원본 유지) 적용.
- 3단계(필요 시): `STORY_PROSE_MODEL=gpt-4.1`로 산문 모델만 업그레이드(env 한 줄, 코드 변경 없음). 품질 보고 결정.

---

## 우선순위 (다음 작업)

### P4. 피드 필터·인기글
- 현재: `?sort=recent|popular`(인기=`view_count DESC`)는 이미 지원. 없는 것 = 장르 필터, 기간별 인기, 트렌딩.
- 추가: ①**장르 필터** `GET /api/stories?genre=fantasy`(FE 상단 장르 칩). ②**기간별 인기** `?period=today|week|all`(WHERE/ORDER 확장). ③(선택) 트렌딩(최근 N시간 급상승, trend 프로젝트 방식). ④(선택) 세부장르 필터 — 먼저 `stories.sub_genre` 컬럼 저장 필요(현재 생성힌트로만 쓰고 미저장).
- 인덱스: `(genre, view_count DESC)`, `(is_public, view_count DESC)` 권장.
- 권장 순서: 장르 필터 + 기간 인기(가벼움) 먼저 → 트렌딩/세부장르(데이터 적재) 다음. P3로 피드가 차면 가치↑.

### P5. 로그인 + 닉네임
- 현재 신원 = 익명 디바이스 UUID(`X-Story-Uid`). 기기/브라우저 바뀌면 내 글·쿼터·공개권한 상실 → 계정 필요.
- **권장안 A(정식)**: 카카오/구글 OAuth + 익명 uid 머지. 스키마 `story.users(id, provider, provider_id, nickname, created_at)` + `stories.user_id UUID NULL`. 머지 = `UPDATE stories SET user_id=? WHERE author_uid=? AND user_id IS NULL`. 쿼터/권한 `user_id` 기준 전환(비로그인은 `author_uid` 병행). blog의 JWT 패턴 재사용 가능.
- **닉네임(요구사항)**: 가입 시 닉네임 부여 → 작가를 닉네임으로 표시(피드·리더·내글 "by 닉네임"). 수정 가능(`PATCH /api/me`, `user_id` 조인이라 기존 글 자동 반영). 비로그인 글은 "익명".
- 임시 대안 B: "복구 코드"(현재 uid를 코드로 보여주고 타 기기에서 입력 → 동일 신원 복원). 구현 쉬움, 보안 약함.
- 작업량: 중간~큼(OAuth 콜백·users 테이블·머지·FE 로그인·토큰 미들웨어).

---

## 그 외 백로그 (조건부 / 추후)

- **속편 시리즈 제어·네비게이션**:
  - ① **속편 중복 방지(정확성)** ✅ 완료(2026-06-25): `generateSequel`에서 기존 자식(`parent_id=:id`) 있으면 409 SEQUEL_EXISTS. "한 편당 직속 속편 1개"(선형 1→2→3). 원작 변경은 재생성 아닌 P1 편집으로.
  - ② **리더 시리즈 네비** ✅ 완료(2026-06-25): 단건 응답에 `next_id` 추가. 리더 하단 "← 이전 화 / 다음 화 보기 →"(parent_id+next_id). 마지막 화(next 없음)에만 "속편 쓰기" 노출.
  - ③ **피드 시리즈 묶음(중간, 추후)**: 피드/내글에서 시리즈를 한 카드로 묶어 "전 N화" 표시, 클릭 시 1화부터. `series_root_id` 비정규화 또는 체인 워킹.
- **중편·장편**: 현재 단편(4챕터). 확장은 챕터별 개별 호출 필수 + 연속성(메모리) 문제.
  - 권장 단계: **중편(8~10챕터)** = 전체 아웃라인 → 챕터별 호출 + "직전 챕터 요약"만 주입(가벼운 메모리). 안정되면 **장편** = Story Bible(인물·설정 JSON 상태객체) + 비동기 생성 + 진행률 UX.
  - 스키마 영향: `stories.length_type`('short'|'medium'|'long'), `bible JSONB`, 챕터 많아지면 `story_chapters(story_id, idx, title, body)` 별도 테이블.
  - 비용: 호출 수↑ → 하루 쿼터 정책(장편=단편 몇 개로 칠지) + OpenAI 예산 캡 같이 결정.
- **성인(19금) 모드**: OpenAI API로 노골적 성적 콘텐츠 생성은 사용정책 위반 → **키/계정 정지 위험**. 한국 법규(성인인증·등급·청소년 차단)도 부담. (미성년 성적은 불법, 현재 하드블록 `sexual/minors`.)
  - 단기 추천 (A): "성숙 테마"까지만(폭력·다크·암시적 로맨스). OpenAI로 가능, 인증 불필요, 명시적 성행위 제외.
  - 진짜 19금 (B): 성인 허용 프로바이더로 모델 교체 + 성인인증 연동 + 피드 분리/등급 게이트 → 별도 과제(법무 검토). OpenAI 기반에선 비권장.
- **품질 3단계**: `STORY_PROSE_MODEL=gpt-4.1`(env 한 줄 + 재배포). 2단계 검수 후에도 아쉬우면.
- **운영/품질**: 기본 테스트, 신고 누적 시 자동 숨김, OpenAI 예산 캡.

## 상태
- P1·P2·P3 완료·배포. 다음 = **P4 피드 필터·인기글**.
