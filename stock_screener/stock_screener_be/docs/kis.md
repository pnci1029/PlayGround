# KIS (한국투자증권 OpenAPI) 연동

스크리너의 **한국주식 시세 소스**를 KIS로 전환하고, 장중 자동 갱신을 붙인 구조 문서.
(2026-06 도입)

> ⚠️ **조회 전용**입니다. 주문/거래 API는 이 프로젝트에 포함하지 않습니다.
> 실제 트레이딩은 동일 KIS를 쓰되 **별도 프로젝트**로 분리하기로 함.

---

## 1. 구성 파일

| 파일 | 역할 |
|------|------|
| `app/kis/client.py` | KIS 클라이언트 — 접근토큰 발급/파일캐싱(24h)/REST GET 래퍼. 실전/모의 도메인 자동 선택 |
| `app/kis/quote.py` | 시세 조회 — `domestic_price()`(국내), `overseas_price()`(미국) |
| `app/fetcher/kr.py` | KR 수집 — KIS 시세 + FDR 종목명 → `stocks` 테이블 upsert. 유니버스 동적 구성 |
| `app/scheduler.py` | 장중 주기 갱신 (apscheduler) |
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

| Job | 주기 | 장중 조건 | 비고 |
|-----|------|----------|------|
| `kr_poll` | 30초 | 평일 09:00~15:30 KST | KIS, 100종목 ~10-20s 소요 |
| `us_poll` | 10분 | 평일 09:30~16:00 ET | yfinance 과호출/차단 방지 |

- 장외·주말엔 job이 즉시 스킵.
- `max_instances=1` + `coalesce=True` → 이전 수집이 안 끝났으면 겹쳐 돌지 않음.
- 주기 변경은 `KR_INTERVAL_SEC` / `US_INTERVAL_MIN` 상수.

### 왜 전체 테이블은 폴링인가 (10초/WebSocket 아님)
- KIS REST는 **초당 ~20콜** 한도. 기본 시세는 종목당 1콜 → 100종목 = 최소 5초. 10초 폴링은 한도 풀가동이라 에러 위험.
- **30초**가 한도 여유 + 충분한 신선도의 스윗스팟.
- 진짜 실시간(체결 즉시)은 폴링이 아니라 WebSocket으로 풀어야 함 (아래).

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
