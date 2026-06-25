# TODO / 백로그 (우선순위)

> 다음에 만들 것들. 우선순위는 사용자 지정(2026-06). 전부 **미구현**. 상세 설계는 각 로드맵 문서 참고.

## 우선순위 (P1 → P4)

### P1. 편집 기능 — AI 글 수정 + 직접 작성  → [roadmap-editing.md](roadmap-editing.md)
- **AI 글 일부 수정**: 작성자가 생성된 글의 제목/본문을 직접 편집. `PATCH /api/stories/:id`(작성자만) + 리더 "수정" 모드. 출력 모더레이션 재검.
- **직접 작성(AI 없이)**: 제목+본문 직접 입력해 등록. `POST /api/stories/manual` + 에디터 화면. `model='manual'`.
- 작업량: 중간. 사용자 통제력↑.

### P2. 생성 대기 UX 개선
- **문제**: 자기검수 추가로 생성이 ~1분(아웃라인+산문+검수 3콜)인데 스피너만 → 답답.
- **옵션 A(가벼움, 우선)**: 진행 단계 표시 — "아웃라인 작성 중 → 본문 작성 중 → 다듬는 중". BE가 단계 신호를 주거나 FE 추정 타이머.
- **옵션 B(중간)**: SSE 스트리밍 — 본문이 실시간으로 써지는 연출. BE SSE 라우트 + FE 스트림 처리. (기존에 WS 대신 SSE로 설계해둠)
- 추천: A → 이후 B.

### P3. 피드 필터·인기글  → [roadmap-feed.md](roadmap-feed.md)
- 장르별 필터(`?genre=`), 조회수 기반 인기/기간별(오늘·주간) 랭킹. 정렬용 인덱스 추가.
- 작업량: 가벼움~중간.

### P4. 로그인 + 닉네임  → [roadmap-auth.md](roadmap-auth.md)
- 소셜 로그인(카카오/구글) + 익명 uid 머지 → 기기 바뀌어도 내 글 유지.
- **작가를 닉네임으로 표시 + 닉네임 수정 가능**(`PATCH /api/me`).
- 쿼터/권한을 `user_id` 기준으로 전환.
- 작업량: 중간~큼(OAuth·users 테이블·머지·FE 로그인).

---

## 그 외 백로그 (조건부 / 추후)
- **품질 3단계**: `STORY_PROSE_MODEL=gpt-4.1` (env 한 줄 + 재배포). 검수 적용 후에도 품질이 아쉬우면. → [quality-improvements.md](quality-improvements.md)
- **속편 시리즈 묶기**: `parent_id`로 원작↔속편 링크/시리즈 묶음 표시(리더 "원작 보기"). 작은 polish.
- **장편/중편**: 챕터별 생성 + 메모리. 큰 작업. → [roadmap-longform-sequel.md](roadmap-longform-sequel.md)
- **성인(19금) 모드**: 정책·법무 제약 큼(OpenAI ToS, 성인인증). → [roadmap-mature-content.md](roadmap-mature-content.md)
- **운영/품질**: 기본 테스트, 신고 누적 시 자동 숨김, OpenAI 예산 캡.

## 상태
- 전부 미구현. P1부터 "문서 먼저 → 구현 → 검증" 순으로 진행 예정.
