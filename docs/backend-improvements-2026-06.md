# 백엔드 개선 작업 기록 (2026-06)

> 대상: `playground/be`, `trend/trend_be`, `stock_screener/stock_screener_be`
> 작업일: 2026-06-22
> 상태: 코드 변경 완료(미커밋). 빌드/테스트 통과 확인.

세 백엔드를 같은 방향으로 정비했다. 공통 목표는 **(1) 보안 구멍(SQL 인젝션·에러 노출) 차단, (2) 가짜/랜덤 데이터 제거, (3) 죽은 코드 정리, (4) 테스트 도입, (5) 프로덕션 빌드 정합성**이다.

---

## 1. playground/be (Node.js + Fastify)

### 죽은 코드 / 미사용 기능 제거
- canvas·artwork·websocket·migration 관련 파일 일괄 삭제. `src/index.ts`에 주석으로만 남아 있던 라우트/플러그인 등록과 `MigrationService` 호출을 함께 제거해 참조를 끊었다.
  - 삭제: `config/sqlite.ts`, `controllers/canvasController.ts`, `middleware/validation.ts`, `models/projectModel.ts`, `models/toolsModel.ts`, `plugins/websocket.ts`, `routes/artworks.ts`, `routes/canvas/index.ts`, `services/{artwork,canvas,image}.service.ts`, `types/artwork.ts`, `websocket-server.ts`
  - 남은 라우트: `tools`, `auth`, `stats`, `chat` + 헬스체크/서브도메인 정보

### 채팅 서버 하드닝 (`chat-server.ts`)
- 메시지 길이 제한(`MAX_MESSAGE_LENGTH=1000`), 닉네임 길이 제한(`MAX_NICKNAME_LENGTH=30`)
- 빈 메시지 차단, 입력값 `String()` 강제 변환 후 `trim()`
- **rate limit** 도입: 동일 유저 `MIN_MESSAGE_INTERVAL_MS=400ms` 이내 연속 전송 차단 (스팸·DB 저장 폭증 방지)
- 연결 종료/에러 시 `lastMessageAt` 맵 정리로 메모리 누수 방지

### 부팅 안정성 (`config/database.ts`)
- DB 연결 실패를 삼키던 `catch`에서 `throw error` 추가. **DB 없이 서버가 떠서 모든 쿼리가 실패하는 상태**를 막고 부팅을 즉시 중단한다.

### 배포 정합성 (`Dockerfile`)
- 컨텍스트 밖이라 실패하던 `COPY ../../migrations` 제거
- 개발 서버(`npm run dev`)로 띄우던 것을 **프로덕션 빌드(`npm run build`) → `npm start`**로 변경

### 설정 / 테스트
- `.env.example` 신규: 필수 환경변수(서버/DB/JWT) 명시 — 누락 시 부팅 실패 항목 표기
- `vitest` 도입, `subdomain.test.ts` 추가 (8개 테스트 통과)
- `tsconfig.json` exclude에 `*.test.ts`, `vitest.config.ts` 추가

---

## 2. trend/trend_be (Node.js + Fastify)

### SQL 인젝션 차단 (`trendingScheduler.ts`)
- 순위 INSERT가 키워드/소스(뉴스 제목 등 외부 입력)를 **문자열 보간**으로 쿼리에 직접 넣던 것을 **파라미터 바인딩**(`$1..$N`)으로 전면 교체. `sources`는 node-postgres가 JS 배열을 `text[]`로 안전하게 직렬화.
- `INTERVAL '${hours} hours'` 류 문자열 보간을 `make_interval(hours => $1)` 파라미터 방식으로 교체 (`trending.ts`, `database.ts`, `trendingScheduler.ts` 전반)

### 가짜/랜덤 데이터 제거
- `generateSampleTrendData()`(ChatGPT/React 등 하드코딩 샘플) 삭제. DB 조회 실패 시 샘플로 대체하던 것을 **빈 배열 반환 + 에러 로깅**으로 변경.
- `trending.ts` 순위 응답에서 `Math.random()`으로 만들던 `prevRank`/`score`/`mentions`/`growthRate`/`trend`를 제거. 집계 불가능한 값은 임의 생성하지 않고 `null`로 정직하게 반환.
- 빈 배열일 때 `Math.max(...[])` → `-Infinity` 버그 방지 가드 추가

### 스키마 정합성
- 테이블 참조를 스키마 한정자로 통일: `trends` → `trend.trends`, `source_weights` → `trend.source_weights`, `trending_stats_hourly`/`trending_history` 등

### 스케줄러 운영 토글 (`index.ts`)
- "임시 비활성화" 주석 코드를 환경변수 게이트로 정리: `ENABLE_TREND_SCHEDULER=true`일 때만 가동 (기본 비활성). 싱글톤 `databaseService` 재사용.

### 설정 / 테스트
- `vitest` 도입, `trendingCalculator.test.ts` 추가
- `package.json` devDependencies 정리(`@types/node-fetch`, `nodemon`을 dev로 이동), `tsconfig.json` 테스트 제외
- 미사용 `utils/translator.ts` 삭제

---

## 3. stock_screener/stock_screener_be (Python + FastAPI)

### SQLite → PostgreSQL 마이그레이션 정합성 (`watchlist.py`)
- 남아 있던 SQLite 스타일 코드를 psycopg/PostgreSQL로 교체:
  - 플레이스홀더 `?` → `%s`
  - `datetime('now')`/`lastrowid` → `RETURNING id, created_at`
  - 테이블명을 `{DB_SCHEMA}.watchlists`로 스키마 한정
  - `with conn.cursor()` + `try/finally`로 커서/커넥션 정리 보장

### 전략 평가 로직 분리 (`strategy_eval.py` 신규)
- `backtest.py`에 흩어져 있던 조건 평가(`OPS` 딕셔너리, `_check()`)를 `evaluate_conditions()`로 추출해 공용 모듈화.
- `watchlist.py`/`backtest.py`가 동일 평가 함수를 공유 → 중복 제거 + 테스트 가능.

### 에러 메시지 정보 노출 차단
- `backtest.py`/`dca.py`에서 예외 원문(`str(exc)`)을 그대로 응답에 담던 것을 **일반 메시지로 마스킹** + 서버측 `logger.exception()` 기록으로 변경.

### 정리
- 미사용 import 제거(`pandas`, `timedelta`, `safe_float` 등)

### 테스트
- `tests/test_strategy_eval.py` 신규 (전략 평가 로직 단위 테스트)
- `requirements-dev.txt` 신규 (테스트 의존성 분리)

---

## 남은 작업 (TODO)

- [ ] `stock_screener` `docs/` 본문(api.md/data.md 등)에 `strategy_eval` 분리·PostgreSQL 전환 반영
- [ ] trend 스케줄러 운영 환경에서 `ENABLE_TREND_SCHEDULER` 설정 결정
