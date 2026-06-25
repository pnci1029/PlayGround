# 백엔드 개선 — 진행 보드

> 상세 변경 내역: [backend-improvements-2026-06.md](./backend-improvements-2026-06.md)
> 이 문서는 남은 작업의 **진행 현황 관리용 체크리스트**다.
> 최종 갱신: 2026-06-23

## 전체 로드맵

- [x] **1. 나머지 3개 서비스 배포 검증** (stock_screener / trend / playground) — ✅ 완료 (2026-06-23)
- [ ] **2. 남은 TODO 처리** (stock_screener 문서 / trend 스케줄러 운영값) — 다음 차례
- [ ] **3. 새 개선 라운드** (프론트엔드 / 인프라 / DB 성능 중 택)

---

## 1. 배포 검증 (읽기 전용, 원격 Contabo 컨테이너) — ✅ 완료

5개 서비스 전부 검증 완료. 모두 재시작 0회, 소스/설정 반영 확인, 헬스 정상.

| 서비스 | 기동(restart) | 소스 반영 | 헬스 | 상태 |
|--------|--------------|----------|------|------|
| blog | running (0) | ✓ | 8003 healthy | ✅ |
| moodbite | running (0) | ✓ | 부팅 정상(11.8s) | ✅ |
| stock_screener | running (0) | ✓ | 8005 /docs 200 | ✅ |
| trend | running (0) | ✓ | 8002 /health 200 | ✅ |
| playground | running (0) | ✓ | 8000 /health 200 | ✅ |

확인된 반영 내역:
- stock_screener: `watchlist.py`(`{DB_SCHEMA}`/`%s`/`RETURNING`, `datetime('now')`·`VALUES (?` 잔재 없음), `strategy_eval.py`+`evaluate_conditions` 존재, backtest/dca 에러 마스킹 ✓
- trend: 스케줄러 `query(insertQuery, params)` 파라미터 바인딩(`VALUES ${values}` 보간 없음), `generateSampleTrendData` 0건, `ENABLE_TREND_SCHEDULER` 게이트, `translator.ts` 삭제됨 ✓
- playground: `index.ts` canvas/artwork/migration 잔재 없음, 채팅 `MIN_MESSAGE_INTERVAL_MS`/`lastMessageAt` rate limit, DB 연결실패 `throw error` ✓

> 메모: 운영 포트가 바뀌어 있었음 — stock_screener=8005, trend=8002(+WS 8012), playground=8000, blog=8003.

---

## 2. 남은 TODO

- [ ] stock_screener `docs/`(api.md/data.md 등)에 `strategy_eval` 분리·PostgreSQL 전환 반영
- [ ] trend 스케줄러 운영값 `ENABLE_TREND_SCHEDULER` 결정 (현재 기본 비활성)

## 3. 새 개선 라운드 — 감사 결과 (2026-06-23, 읽기 전용 파악만 / 미수정)

### 3-A. 프론트엔드 (blog_fe·MoodBite_FE·stock_screener_fe·trend_fe·playground/fe)

스택: blog/stock/trend/playground = Next.js 16 + React 19, moodbite = Vite 5 + React 18(SPA)

> **✅ 소스 수정 1차 적용 (2026-06-23)** — 아래 체크된 항목. stock_fe 타입체크 통과(EXIT 0).
> playground/fe·trend_fe는 로컬 의존성 미설치라 타입체크 미실시(편집이 작고 기존 패턴 동일).

**🔴 High**
- [x] `playground/fe` 로그인 페이지 **관리자 기본계정 `admin/admin123` 데모박스 제거**(`admin/login/page.tsx`) ✅
- [x] `playground/fe` `adminApi.ts` placeholder `https://api.yourdomain.com` → 앱 공통 `config.api.clientBaseUrl`(기본 `/api`) 사용 + `/api` 중복 조립 수정 ✅
- [x] `stock_screener_fe` `src/lib/api.ts` — `parseOrThrow` 추가, `response.ok` 확인 후 백엔드 error 메시지로 throw ✅
- [x] `trend_fe` `detail/[keyword]/page.tsx` 하드코딩 `localhost:8002` → `process.env.NEXT_PUBLIC_API_URL` 패턴 + `response.ok` 체크 ✅
- [~] `blog_fe` 약한 인증 게이트 — 배포 디버그 로그 제거(`AuthCheck.tsx`) ✅. 단 "토큰 존재=인증" 소프트게이트는 클라단 한계(실제 보안은 백엔드 JWT). 토큰 만료/유효성 검증은 백엔드 verify 연동 필요 → 보류

**🟠 Medium (미적용 — 일부 위험/판단 필요)**
- [ ] blog/playground: 인증 토큰 `localStorage` 저장(XSS) → httpOnly 쿠키 권장 (구조 변경)
- [ ] `trend_fe` `next.config.js` `typescript.ignoreBuildErrors:true` 제거 — 숨은 타입에러로 빌드 깨질 수 있어 빌드 검증 환경에서 처리 권장
- [ ] `playground/fe` 중복 미들웨어 2개(`middleware.ts` vs `src/middleware.ts`) — 어느 쪽 활성인지 빌드 확인 후 정리(라우팅 위험)
- [ ] `playground/fe` `next.config.ts` API URL Docker 컨테이너명 하드코딩 (배포 config 성격)
- [ ] 전 프로젝트 `.env.example` 부재
- [ ] 곳곳에 `any` 타입(trend/moodbite/playground API 응답)

**🟡 Low**
- [x] playground `src/middleware.ts` 매-요청 디버그 `console.log` 제거 ✅
- [ ] trend `useTrends.ts` 디버그 console.log 11개, playground canvas/gallery localStorage stopgap 로직

### 3-B. 인프라 (Caddy / nginx / Dockerfile / compose / CI)

**🔴 High**
- [x] **Postgres가 `0.0.0.0:5432` 로 공개** → **`127.0.0.1:5432:5432` 로 변경**(2026-06-25). 적용 파일: `docker-compose.yml`/`db.yml`/`dev.yml`/`blog.yml`/`moodbite.yml`/`playground.yml`/`trend.yml` 전 7개. 앱은 내부망 `postgres:5432`로 접속하므로 영향 없음. 호스트 로컬/SSH 터널 접속은 유지. ✅
- [ ] **모든 백엔드 컨테이너가 root 실행**(blog_fe 제외 전 BE Dockerfile에 `USER` 없음) → 비-root 유저 추가 — **보류**(사용자 지시, 2026-06-25: 구조 변경이라 나중에)
- [x] **Caddy 보안헤더 전무** → **`(security_headers)` 스니펫 추가 + 전 사이트 import**(2026-06-25). HSTS/X-Content-Type-Options/X-Frame-Options/Referrer-Policy 적용 + `-Server` 헤더 제거. **CSP는 의도적 보류**(잘못 걸면 salehero 프론트 등 정적사이트가 깨질 수 있어 사이트별 튜닝 필요). dev `localhost` 블록은 제외. ✅

**🟠 Medium**
- [ ] 백엔드 API/WS 포트들이 `0.0.0.0` 공개 — Caddy가 내부망으로 프록시하므로 불필요, TLS 우회 노출 → loopback 바인드/제거
- [ ] 대부분 백엔드 **멀티스테이지 빌드/.dockerignore 없음** — 빌드툴·소스·devDeps가 prod 이미지에 적재(일부는 repo 루트를 빌드 컨텍스트로)
- [ ] Dockerfile **HEALTHCHECK 전무**, compose **healthcheck/resource limit 없음**
- [ ] `blog_be/Dockerfile` `npm install`(타 BE는 `npm ci`) — 비재현 설치 + devDeps 포함
- [ ] CI `test` job이 **blog만 빌드/타입체크** — 나머지 4개 BE는 빌드 게이트 없이 배포
- [ ] CI SSH가 `StrictHostKeyChecking=no`(MITM 위험), 배포가 `rm -rf` 후 untar(중간 실패 시 롤백 없음)
- [ ] `docker-compose.dev.yml:11` 하드코딩 `POSTGRES_PASSWORD: password`(repo 커밋됨, dev 한정)
- [ ] `nginx/nginx.conf` 가 stale로 보임(서비스명 불일치, plaintext :80) — 사용여부 확인

**🟡 Low**: base 이미지 digest 미고정, stock_fe만 node:18(타 서비스 node:20), moodbite BE가 JRE 아닌 full JDK 런타임, compose 파일 이원화(root vs per-project)

**🧹 정리 대상(우발 생성물)**: `caddy/Caddyfile;C`, `moodbite/MoodBite_BE;C` — botched 셸 리다이렉트 잔재 디렉토리(빈/거의빈, git 미추적). 어디서도 참조 안 됨 → 삭제 안전

### ⭐ 통합 우선순위 (수정 착수 시 권장 순서)
1. playground/fe 하드코딩 `admin/admin123` 제거 (공개 노출, 즉시)
2. Postgres `0.0.0.0:5432` 공개 차단 (DB 직접 노출)
3. Caddy 보안헤더 스니펫 추가 (전 도메인 일괄)
4. 백엔드 컨테이너 비-root 유저
5. stock_fe / trend_fe fetch 에러처리 + 하드코딩 URL 제거

---

## 4. 트렌드 스케줄러 (최후순위로 보류)

- [ ] trend `ENABLE_TREND_SCHEDULER` 운영값 결정 (현재 기본 비활성 = 순위집계 미가동)
