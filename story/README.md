# Story — AI 소설 생성 앱

장르 + 키워드를 고르면 LLM이 짧은 소설을 생성해 읽게 해주는 웹앱.
PlayGround 모노레포 소속 (공용 PostgreSQL `story` 스키마 사용).

## 현재 상태
**설계 합의 단계 (M0)** — 디렉토리 골격 + 기획서만 존재. 구현 전.

## 문서
- [기획서 (PLANNING.md)](docs/PLANNING.md) — 요구사항·아키텍처·DB·API·파이프라인·미정사항
- [생성 파이프라인 스펙 (M2)](docs/generation-pipeline.md) — 프롬프트·스키마·에러·처리순서
- [프론트엔드 스펙 (M3)](docs/frontend-spec.md) — 라우트·디자인·API 클라이언트
- [LLM 소설생성 리서치](docs/llm-fiction-research.md) — 프롬프팅/기법/모델/안전
- [배포 배선 (M4)](docs/deploy.md) — Docker/Caddy/Vercel/CI 등록 + 수동 운영 단계
- [로드맵: 장편·속편](docs/roadmap-longform-sequel.md) — 확장 기능 가능성·방법·작업량 진단
- [로드맵: 로그인/계정](docs/roadmap-auth.md) — 익명 uid 한계 + 소셜로그인·머지 설계

## 구조
```
story/
├── docs/         # 기획서 · 리서치
├── story_be/     # Fastify(TS) 백엔드  (port 8004)
└── story_fe/     # Next.js(App Router) 프론트엔드  (dev port 3004)
```

## 핵심 결정 (요약)
- 사용자 식별: **익명 디바이스 ID**(localStorage, `X-Story-Uid` 헤더) — 가입 없음
- 제한: **사용자당 하루 3개 생성**, 남의 글 **열람 무제한**
- 콘텐츠: **소설**만(MVP). 장르 = SF/판타지/추리 중심 + 로맨스/스릴러/공포/사극/코미디
- 모델: **gpt-4.1-mini**(전 단계) + `omni-moderation-latest`(무료)

> 다음 단계(M1~): 기획서의 미정사항 합의 → BE/FE 구현. 아직 코드는 비어 있음.
