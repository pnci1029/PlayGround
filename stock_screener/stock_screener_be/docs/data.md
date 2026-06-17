# 데이터 레퍼런스

## DB 스키마

DB: **PostgreSQL** (`psycopg2`). 접속 정보는 `.env`(`DB_HOST`/`DB_NAME`/`DB_SCHEMA` 등), 스키마는 기본 `stocks`. 컬럼 타입은 아래 표가 의미 기준이며 실제 DDL은 `app/db.py` 참조.

### `stocks` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `ticker` | TEXT | 종목 코드 (PK 구성) |
| `market` | TEXT | `US` 또는 `KR` (PK 구성) |
| `name` | TEXT | 종목 이름 |
| `price` | REAL | 현재가 (USD / KRW) |
| `change_pct` | REAL | 전일 대비 등락률 (%) |
| `volume` | INTEGER | 거래량 |
| `market_cap` | REAL | 시가총액 |
| `per` | REAL | 주가수익비율 (Price/EPS) |
| `pbr` | REAL | 주가순자산비율 (Price/BPS) |
| `roe` | REAL | 자기자본이익률 (Net Income / Equity) |
| `eps` | REAL | 주당순이익 |
| `div_yield` | REAL | 배당수익률 (소수점, 예: 0.025 = 2.5%) |
| `week52_high` | REAL | 52주 최고가 |
| `week52_low` | REAL | 52주 최저가 |
| `debt_ratio` | REAL | 부채비율 (**% 단위**, 예: 45 = 45%) |
| `eps_growth` | REAL | 이익성장률 (**소수**, 예: 0.15 = 15% — roe와 단위 통일) |
| `sales_growth` | REAL | 매출성장률 (**소수**, 예: 0.20 = 20%) |
| `updated_at` | TEXT | 수집 시각 (ISO 8601) |

> ⚠️ **단위 주의**: `debt_ratio`는 %(45)로, `eps_growth`·`sales_growth`는 소수(0.15)로 저장된다(기존 `roe`/`div_yield`와 동일 규칙). 스크리닝/전략 조건도 같은 단위로 입력해야 한다.
>
> 🔧 **마이그레이션**: 이 3개 컬럼은 `init_db()`의 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`로 **서버 시작 시 자동 추가**된다(기존 DB 포함). 별도 수동 작업 불필요.

Primary Key: `(ticker, market)` — 동일 코드가 US/KR에 중복 존재할 수 있어 양쪽을 구분.

### `last_refresh` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | INTEGER | PK |
| `market` | TEXT | `US` 또는 `KR` |
| `finished_at` | TEXT | 마지막 갱신 완료 시각 |

---

## 데이터 소스

### US 종목 (yfinance)

- **대상**: S&P 500 상위 30종목 (`config.py` → `SP500_TICKERS`)
- **라이브러리**: `yfinance`
- **수집 방식**: `yf.Ticker(ticker).info` 딕셔너리에서 필드 추출

| yfinance 키 | DB 컬럼 |
|-------------|---------|
| `currentPrice` / `regularMarketPrice` | `price` |
| `regularMarketChangePercent` | `change_pct` |
| `volume` | `volume` |
| `marketCap` | `market_cap` |
| `trailingPE` | `per` |
| `priceToBook` | `pbr` |
| `returnOnEquity` | `roe` |
| `trailingEps` | `eps` |
| `trailingAnnualDividendYield` / `dividendYield` | `div_yield` |
| `fiftyTwoWeekHigh` | `week52_high` |
| `fiftyTwoWeekLow` | `week52_low` |
| `debtToEquity` | `debt_ratio` (% 단위) |
| `earningsGrowth` | `eps_growth` (소수) |
| `revenueGrowth` | `sales_growth` (소수) |

### KR 종목 (FinanceDataReader 가격 + KIS 펀더멘털)

> 2026-06 구조: **전 종목 가격은 FDR(10분), 펀더멘털은 KIS(하루 1회)** 로 분리.
> pykrx는 KRX 로그인 요구 + 해외 IP 차단 이슈로 미사용. 자세한 건 [`kis.md`](./kis.md).

- **대상(유니버스)**: KOSPI+KOSDAQ 보통주 **전 종목**(~2,600개, 우선주 제외). `KR_UNIVERSE_SIZE>0`이면 시총 상위 N개로 축소(테스트용).
- **가격·등락률·거래량·시총**: `FinanceDataReader.StockListing("KRX")` 전 시장 1콜 (`fetch_kr_universe`) — 가격 컬럼만 upsert
- **PER·PBR·EPS·ROE·52주가**: KIS `inquire-price` 전 종목 sweep (`fetch_kr_fundamentals`) — 펀더멘털 컬럼만 upsert. `ROE = PBR/PER`
- **부채비율·이익성장률·매출성장률**: KIS 재무비율 TR `FHKST66430300`(`domestic_finance`) 종목별 추가 호출. 성장률은 KIS %값을 **÷100해 소수로 저장**. 자세한 건 [`kis.md`](./kis.md).
- **div_yield·종목명**: div_yield는 KIS 미제공(`null`), 종목명은 FDR 제공
- ⚠️ 펀더멘털 sweep이 종목당 **KIS TR 2개**(시세+재무비율)를 호출하므로 일일 sweep 시간이 늘어남(과금 없음, rate limit은 백오프 재시도로 처리)
- 가격 소스와 펀더멘털 소스가 **서로 다른 컬럼만 갱신**(`upsert_price`/`upsert_fundamentals`)해 덮어쓰기 충돌 없음

---

## 백테스트 데이터 (yfinance 역사 데이터)

백테스트(`/api/backtest`)에서 추가로 사용하는 yfinance API:

| yfinance API | 내용 | 기간 |
|-------------|------|------|
| `t.history(start, end)` | 일별 OHLCV | 무제한 (주가 분할 조정) |
| `t.financials` | 연간 손익계산서 | 최근 4~5년 |
| `t.balance_sheet` | 연간 대차대조표 | 최근 4~5년 |
| `t.dividends` | 배당 이력 | 무제한 |

**정밀모드 계산 방법**:
```
EPS  = Net Income / sharesOutstanding
PER  = start_price / EPS          (EPS > 0 인 경우만)
BVPS = Stockholders Equity / sharesOutstanding
PBR  = start_price / BVPS
ROE  = Net Income / Stockholders Equity
```

사용하는 재무제표 행 이름:
- 손익계산서: `"Net Income"`, `"Net Income Common Stockholders"`
- 대차대조표: `"Stockholders Equity"`, `"Common Stock Equity"`, `"Total Stockholder Equity"`

---

## 종목 유니버스

| 시장 | 종목 수 | 구성 |
|------|--------|------|
| US | 30 | S&P 500 상위 30 (`SP500_TICKERS` 하드코딩) |
| KR | 전 종목 ~2,600 | KOSPI+KOSDAQ 보통주 전체(우선주 제외). `KR_UNIVERSE_SIZE>0`이면 시총 상위 N개로 축소 |

---

## 데이터 갱신 주기

- **서버 시작 시**: 자동으로 전체 1회 수집 (`fetch_all()`)
- **수동 갱신**: `GET /api/refresh` 호출
- **자동 주기 갱신**: ✅ 구현됨 (`app/scheduler.py`, apscheduler)
  - **KR 가격(FDR)**: 장중(평일 09:00~15:30 KST) **10분** 주기 — 전 종목
  - **KR 펀더멘털(KIS)**: **하루 1회** 평일 15:40 KST (장 마감 후) — 전 종목 sweep
  - **US(yfinance)**: 장중(평일 09:30~16:00 ET) **10분** 주기
  - 장외·주말엔 interval job이 자동 스킵
  - 주기 조절: `app/scheduler.py` 의 `KR_INTERVAL_MIN` / `US_INTERVAL_MIN`

> **왜 PER/PBR이 하루 1회여도 되나**: EPS·BPS(실적값)는 장중 안 바뀜(분기 실적 때만). 가격은 10분마다 갱신되므로 선별엔 충분.
> 더 빠른 실시간(체결 즉시)은 "고른 종목"만 **KIS WebSocket** 으로 별도 구현 예정 (전 종목 실시간은 41종목 한도·기관피드 비용 때문에 불가). [`kis.md`](./kis.md) 참고.

---

## 데이터 한계 및 주의사항

1. **yfinance 제공 기간**: 역사적 재무제표는 최근 4~5년치만 제공. 그보다 오래된 start_date 백테스트는 lite 모드로 동작.
2. **KR 시세(KIS)**: 장중 준실시간. 단 장 시작 전엔 전일대비(`change_pct`)가 0으로 올 수 있음. KIS 무료 등급 기준.
3. **KR roe·div_yield 없음**: KIS 기본 시세가 미제공 → 한국 종목은 해당 컬럼이 `null`. (스크리너 필터 시 주의)
4. **US 펀더멘털은 yfinance**: KIS 미국 기본 시세는 가격/거래량만 줘서, PER·PBR·ROE 등 지표는 yfinance 유지.
5. **시가총액 단위**: US는 USD, KR은 KRW(KIS `hts_avls` 억원 → 원으로 환산 저장). UI에서 단위 구분 없이 표시되므로 직접 비교 주의.
6. **미국 실시간 한계**: KIS 무료 해외 시세는 정규장 지연 위주. 프리/애프터마켓 실시간은 제한적.
