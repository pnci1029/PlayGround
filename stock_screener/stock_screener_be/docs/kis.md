# KIS (한국투자증권 OpenAPI) 연동

스크리너의 **한국주식 시세 소스**를 KIS로 전환하고, 장중 자동 갱신을 붙인 구조 문서.
(2026-06 도입)

> ⚠️ **조회 전용**입니다. 주문/거래 API는 이 프로젝트에 포함하지 않습니다.
> 실제 트레이딩은 동일 KIS를 쓰되 **별도 프로젝트**로 분리하기로 함.

---

## 🚨🚨 보안 최우선 — API 키 절대 노출 금지 🚨🚨

> **`KIS_APP_KEY` / `KIS_APP_SECRET` 는 어떤 경우에도 외부에 노출되어선 안 된다. (최초최중요)**
> 키가 노출되면 즉시 KIS Developers에서 **키 폐기 후 재발급**하고 `sync-secrets.js push` → 재배포할 것.

**반드시 지킬 것:**
- ❌ `.env`, `.env.production`, 키 값을 **git에 커밋 금지**. (`.gitignore`에 `.env`, `.env.*` 등록 확인 — 현재 추적 안 됨)
- ❌ 키를 **코드/문서/주석/로그/에러메시지/커밋메시지**에 하드코딩하거나 평문으로 적지 말 것.
- ❌ 키를 **채팅·이슈·PR·스크린샷·외부 서비스**에 붙여넣지 말 것. (한 번 외부로 나가면 캐시/인덱싱되어 회수 불가)
- ❌ 프론트엔드(Vercel) 번들에 키를 넣지 말 것. KIS 호출은 **백엔드에서만**.
- ✅ 키는 **루트 `.env`(로컬) + GitHub Secret `MAIN_ENV_FILE`(배포)** 경로로만 전달.
- ✅ 문서에 예시가 필요하면 실제 키 대신 `KIS_APP_KEY=<your-app-key>` 같은 **플레이스홀더**만 사용.
- ✅ 키 노출이 의심되면 **무조건 재발급**한다 — "아마 괜찮겠지"로 넘어가지 말 것.

---

## 1. 구성 파일

| 파일 | 역할 |
|------|------|
| `app/kis/client.py` | KIS 클라이언트 — 접근토큰 발급/파일캐싱(24h)/REST GET 래퍼. 실전/모의 도메인 자동 선택 |
| `app/kis/quote.py` | 시세 조회 — `domestic_price()`(국내), `overseas_price()`(미국) |
| `app/fetcher/kr.py` | KR 수집 — `fetch_kr_universe()`(FDR 전종목 가격), `fetch_kr_fundamentals()`(KIS 전종목 PER/PBR/EPS/ROE) |
| `app/fetcher/common.py` | `upsert_price`/`upsert_fundamentals` — 소스별 소유 컬럼만 갱신하는 배치 upsert |
| `app/scheduler.py` | 주기 갱신 (apscheduler) |
| `kis_test.py` | 연동 점검 스크립트 (`python kis_test.py`) |

---

## 2. 환경변수 (루트 `playground/.env` 에서 통합 관리)

| 변수 | 설명 |
|------|------|
| `KIS_ENV` | `real`(실전) \| `paper`(모의). 시세/실시간은 실전 도메인이 정확 |
| `KIS_APP_KEY` | KIS Developers 발급 App Key |
| `KIS_APP_SECRET` | KIS Developers 발급 App Secret |
| `KIS_ACCOUNT_NO` | 계좌 8자리 (시세조회엔 불필요, 추후 주문용) |
| `KIS_ACCOUNT_PROD` | 상품코드 2자리 (보통 `01`) |
| `KR_UNIVERSE_SIZE` | KR 유니버스 크기. `100`=시총 상위 100, `0`=하드코딩 `KR_TICKERS` |

> 🔐 `.env`는 `.gitignore` 대상. 서버 배포 시에는 git이 아니라 **GitHub Secret `MAIN_ENV_FILE`** 경로로 전달됨.
> 키를 바꾸면 반드시 `node sync-secrets.js push` (→ Secret 갱신) 후 재배포해야 서버에 반영된다. (gh CLI 필요)

도메인:
- 실전 REST: `https://openapi.koreainvestment.com:9443`
- 모의 REST: `https://openapivts.koreainvestment.com:29443`

---

## 3. 토큰 관리

- `oauth2/tokenP` 로 접근토큰 발급 (유효 24h).
- **분당 1회 재발급 제한**이 있어, 발급 토큰을 `.kis_token_{env}.json` 에 캐싱해 재사용.
  - 메모리 → 파일 캐시 → 신규발급 순으로 조회
  - 캐시 파일은 `.gitignore` 처리됨. 지워도 다음 호출 때 자동 재생성.

---

## 4. 데이터 매핑

### 국내 (`domestic_price`, TR `FHKST01010100`)
KIS `inquire-price.output` → `stocks` 컬럼:

| KIS 필드 | 컬럼 | 비고 |
|----------|------|------|
| `stck_prpr` | price | 현재가 |
| `prdy_ctrt` | change_pct | 전일대비율(%) |
| `acml_vol` | volume | 누적거래량 |
| `hts_avls` | market_cap | 시총(억원) → **×1e8 (원) 환산** |
| `per` / `pbr` / `eps` | per/pbr/eps | |
| `w52_hgpr` / `w52_lwpr` | week52_high/low | |
| (없음) | roe, div_yield | KIS 기본 시세 미제공 → null |
| (FDR 보강) | name | `StockListing("KRX")` 코드→이름 |

### 국내 재무비율 (`domestic_finance`, TR `FHKST66430300`)
`/uapi/domestic-stock/v1/finance/financial-ratio` → `output`은 결산기 배열(최신 `[0]`). 값은 % 단위.

| KIS 필드 | 컬럼 | 비고 |
|----------|------|------|
| `lblt_rate` | debt_ratio | 부채비율(%) — 그대로 저장 |
| `grs` | sales_growth | 매출액 증가율(%) → **÷100 소수 저장** |
| `ntin_inrt` | eps_growth | 순이익 증가율(%) ≈ 이익성장률 → **÷100 소수 저장** |

> 현재가 시세(`inquire-price`)엔 없는 항목이라 별도 TR로 종목당 추가 1콜. 실패해도 기본 펀더멘털은 유지(부분 NULL 허용).

### 미국 (`overseas_price`, TR `HHDFS00000300`)
| KIS 필드 | 의미 |
|----------|------|
| `last` | 현재가 |
| `rate` | 등락율(%) |
| `tvol` | 거래량 |
| `base` | 전일종가 |

> 미국 펀더멘털(PER/PBR/ROE 등)은 KIS 기본 시세에 없어, **US는 yfinance를 유지**한다.

---

## 5. 자동 갱신 (스케줄러)

`app/scheduler.py` — apscheduler `BackgroundScheduler`:

| Job | 주기 | 조건 | 소스 | 비고 |
|-----|------|------|------|------|
| `kr_universe` | 10분 | 평일 09:00~15:30 KST | FDR | 전 종목 가격/시총/거래량 |
| `kr_fund` | 하루 1회 (평일 15:40 KST) | 마감 후 | KIS | 전 종목 PER/PBR/EPS/ROE sweep |
| `us_poll` | 10분 | 평일 09:30~16:00 ET | yfinance | 30종목 |

- 장외·주말엔 interval job이 즉시 스킵.
- `max_instances=1` + `coalesce=True` → 이전 수집이 안 끝났으면 겹쳐 돌지 않음.
- 주기 변경은 `KR_INTERVAL_MIN` / `US_INTERVAL_MIN` 상수, 펀더멘털 시각은 `CronTrigger`.

### 왜 전 종목은 10분 폴링(실시간 아님)인가
- KIS REST는 **초당 ~20콜** 한도. 종목당 1콜이라 전 종목(~2,600) 실시간은 불가.
- 가격은 FDR 전 시장 1콜로 10분마다, 펀더멘털은 KIS sweep으로 하루 1회(EPS/BPS는 장중 불변).
- 전 종목 실시간은 **41종목/연결 한도 + 기관 피드 비용** 때문에 무료론 불가. 실시간은 "고른 종목"만 WebSocket(아래).

### 시작 시 주의
- `fetch_all()`(서버 시작 1회)에 펀더멘털 sweep 포함 → 재시작마다 전 종목 KIS 호출(~2-3분). 가격(FDR)은 먼저 빨리 채워짐.

---

## 6. 실시간(WebSocket) — 예정

- KIS 실시간 WS는 **한 연결에 ~41종목** 등록 한도가 있어 전체(100+)를 실시간으로 못 함.
- 설계: **전체 테이블은 30초 폴링**, **사용자가 보는 종목(상세/관심종목 ≤41개)만 WebSocket** 실시간.
- 차트: 과거 캔들은 KIS 기간별/분봉 API(or yfinance) on-demand 조회 + 마지막 봉만 WS로 갱신.
- approval_key 발급(`oauth2/Approval`) → WS 구독 → 브라우저 푸시 구조로 추후 구현.

---

## 7. 과거 데이터 정책

- `stocks` 테이블은 **최신 스냅샷만**(upsert 덮어쓰기). 틱 히스토리는 쌓지 않음.
- 차트/백테스트용 과거 데이터는 **API on-demand**(KIS 기간별시세 / yfinance `history()`)로 조회. (증권사 앱 차트와 동일한 방식)
- 무료 한계: 일/주/월봉은 수년치 OK, **분봉/틱은 최근 며칠~수십일만** 제공.

---

## 8. 점검 방법

```bash
# 로컬 (루트 .env 의 KIS 키 사용)
cd stock_screener_be
python kis_test.py        # 삼성전자 + AAPL 현재가 출력되면 OK

# 서버 배포 후
docker logs stock_screener | grep -E "KR done|US done|KIS token"
#   기대: "KIS token issued", "KR done (KIS): NN/100", "US done: 30/30"
```
