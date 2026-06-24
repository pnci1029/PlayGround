# M4 — 배포 배선 (Deploy)

> story 프로젝트를 모노레포 배포 파이프라인에 편입. **파일만 추가/수정해 둔 상태(미커밋·미배포).**
> 다른 프로젝트(blog) 패턴을 그대로 따름. BE=Contabo(Docker), FE=Vercel.

## 추가/수정한 파일

| 파일 | 종류 | 내용 |
|------|------|------|
| `story/story_be/Dockerfile` | 신규 | node:20-alpine, `npm run build`(tsc) → `npm start`, EXPOSE 8004 |
| `story/docker-compose.yml` | 신규 | BE 전용(prod), 외부 네트워크, `STORY_DB_DRIVER=pg` |
| `story/story_fe/vercel.json` | 신규 | `/api/*`·`/health` → `https://story-api.chhong.kr` rewrite |
| `database/init-schemas.sql` | 수정 | `CREATE SCHEMA story` + GRANT |
| `caddy/Caddyfile` | 수정 | `story-api.chhong.kr` / `story.chhong.kr` 블록(→ `story:8004`, WS 없음) |
| `deploy.sh` | 수정 | `STORY_CHANGED` 변수 + 배포 블록 + DOCKER_CHANGED 루프 |
| `docker-compose.yml`(루트) | 수정 | story 서비스 정의(모놀리스 정의용) |
| `.github/workflows/test-and-deploy.yml` | 수정 | tar 포함·rm·변경감지·env 전달 + `story/story_fe` 제외 |

- **포트**: BE `8004` (WebSocket 없음 — SSE/HTTP만).
- **DB**: 운영은 `STORY_DB_DRIVER=pg` → 공용 PostgreSQL `story` 스키마. DB 접속은 공용 `POSTGRES_*` 재사용, host=`postgres`.
- **OpenAI 키**: 컨테이너가 `env_file: /root/playground/.env`에서 `STORY_OPENAI_API_KEY`를 읽음.

## ⚠️ 배포 전 수동 단계 (서버/외부 — 코드로 안 되는 것)

1. **서버 루트 `.env`에 STORY_ 키 추가** — 서버의 `/root/playground/.env`(= GitHub Secret `MAIN_ENV_FILE`)에 다음을 넣어야 함:
   ```
   STORY_OPENAI_API_KEY=sk-...
   STORY_OPENAI_MODEL=gpt-4.1-mini
   STORY_OPENAI_MODERATION_MODEL=omni-moderation-latest
   STORY_DAILY_LIMIT=3
   # STORY_DB_DRIVER 는 compose 에서 pg 로 주입되므로 .env 엔 없어도 됨
   ```
   (로컬 `.env`의 `STORY_DB_DRIVER=pglite`는 로컬 전용. 서버는 compose가 `pg`로 덮어씀.)

2. **기존 DB에 `story` 스키마 생성** — `init-schemas.sql`은 **빈 볼륨 최초 1회만** 실행됨. 이미 떠 있는 DB엔 수동:
   ```bash
   docker exec -i postgres psql -U postgres -d playground \
     -c "CREATE SCHEMA IF NOT EXISTS story; GRANT ALL PRIVILEGES ON SCHEMA story TO postgres;"
   ```
   (테이블은 story BE가 부팅 시 자동 생성)

3. **DNS** — `story-api.chhong.kr`, `story.chhong.kr` A레코드 → 서버 IP.

4. **Vercel** — story_fe 새 프로젝트 생성, 루트 디렉터리 `story/story_fe`, 환경변수 `NEXT_PUBLIC_API_URL=/api`. `vercel.json`이 `/api/*`를 `story-api.chhong.kr`로 rewrite.

## 배포 동작 방식
- CI(`test-and-deploy.yml`)가 푸시 diff에서 `story/story_be/**` 또는 `story/docker-compose.yml` 변경을 감지 → `STORY_CHANGED=true` 전달.
- 서버에서 `deploy.sh`가 `cd story && docker compose -p story_service up -d` 로 BE 재배포.
- FE는 Vercel이 자동 배포(별도).

## ⚠️ 주의
- **루트 `docker-compose.yml` 수정**은 CI 변경감지에서 `docker_config=true`를 유발 → 다음 배포 때 **모든 백엔드 재배포**(DOCKER_CHANGED 루프). 의도된 동작이나 인지 필요.
- story BE는 WebSocket 미사용이라 Caddy 블록에 `/ws` 없음.
