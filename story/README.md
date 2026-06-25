# Story — AI 소설 생성 앱

장르 + 키워드를 고르면 LLM이 짧은 소설을 생성해 읽게 해주는 웹앱.
PlayGround 모노레포 소속 (공용 PostgreSQL `story` 스키마 사용).

## 현재 상태
**운영 중** — story.chhong.kr(FE, Vercel) / story-api.chhong.kr(BE, Contabo). 생성·피드·편집·속편 동작.

## 문서
- [TODO / 백로그](docs/TODO.md) — 할 일·로드맵·백로그 **단일 관리처**(완료·다음작업·조건부)
- [기획서 (PLANNING.md)](docs/PLANNING.md) — 요구사항·아키텍처·DB·API·파이프라인
- [생성 파이프라인 스펙 (M2)](docs/generation-pipeline.md) — 프롬프트·스키마·에러·처리순서
- [프론트엔드 스펙 (M3)](docs/frontend-spec.md) — 라우트·디자인·API 클라이언트
- [LLM 소설생성 리서치](docs/llm-fiction-research.md) — 프롬프팅/기법/모델/안전
- [배포 배선 (M4)](docs/deploy.md) — Docker/Caddy/Vercel/CI 등록 + 수동 운영 단계

> 향후 기능·로드맵은 별도 문서를 만들지 말고 **TODO.md에 인라인**으로 관리한다.

## 구조
```
story/
├── docs/         # 기획서 · 리서치
├── story_be/     # Fastify(TS) 백엔드  (port 8004)
└── story_fe/     # Next.js(App Router) 프론트엔드  (dev port 3004)
```

## 핵심 결정 (요약)
- 사용자 식별: **익명 디바이스 ID**(localStorage, `X-Story-Uid` 헤더) — 가입 없음(로그인은 P5)
- 제한: **하루 3개 생성**(베타엔 `STORY_UNLIMITED`로 무제한), 남의 글 **열람 무제한**
- 콘텐츠: **소설**(MVP). 장르 = SF/판타지/추리 중심 + 로맨스/스릴러/공포/사극/코미디
- 모델: **gpt-4.1-mini** + `omni-moderation-latest`(무료). 산문만 `STORY_PROSE_MODEL`로 분리 가능
