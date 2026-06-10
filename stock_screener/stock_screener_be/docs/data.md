# 데이터 레퍼런스

## DB 스키마

파일: `stocks.db` (SQLite, 프로젝트 루트)

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
| `updated_at` | TEXT | 수집 시각 (ISO 8601) |

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

### KR 종목 (KIS 한국투자증권 OpenAPI + FinanceDataReader)

> 2026-06 변경: 기존 FDR+yfinance(.KS) → **KIS 시세 기반으로 전환**. (한국주식 준실시간 + 지표 정확도 향상)
> 자세한 연동 구조는 [`kis.md`](./kis.md) 참고.

- **대상**: FDR 상장목록 시가총액 **상위 100종목 동적** (`config.py` → `KR_UNIVERSE_SIZE`, 우선주 제외). `0`으로 두면 하드코딩 `KR_TICKERS` 사용.
- **현재가·등락률·거래량·시총·PER·PBR·EPS·52주가**: KIS `inquire-price` (`app/fetcher/kr.py` → `app/kis/quote.py`)
- **종목명**: FDR `StockListing("KRX")` 에서 보강 (KIS 기본 시세엔 종목명이 없음)
- **roe·div_yield**: KIS 기본 시세 미제공 → `None` (추후 KIS 재무 endpoint로 보강 가능)

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
| KR | 100 (기본) | FDR 상장목록 **시가총액 상위 N개 동적** (`KR_UNIVERSE_SIZE`, 우선주 제외). 삼성전자·SK하이닉스 등 대형주 자동 포함 |

---

## 데이터 갱신 주기

- **서버 시작 시**: 자동으로 전체 1회 수집 (`fetch_all()`)
- **수동 갱신**: `GET /api/refresh` 호출
- **자동 주기 갱신**: ✅ 구현됨 (`app/scheduler.py`, apscheduler)
  - **KR(KIS)**: 장중(평일 09:00~15:30 KST) **30초** 주기
  - **US(yfinance)**: 장중(평일 09:30~16:00 ET) **10분** 주기 (과호출 방지)
  - 장외·주말엔 각 job이 자동 스킵
  - 주기 조절: `app/scheduler.py` 의 `KR_INTERVAL_SEC` / `US_INTERVAL_MIN`

> 더 빠른 실시간(체결 즉시)은 종목 상세 화면에서 **KIS WebSocket** 으로 별도 구현 예정 (전체 테이블은 폴링, 보는 종목만 WS — 41종목 등록 한도 때문). [`kis.md`](./kis.md) 참고.

---

## 데이터 한계 및 주의사항

1. **yfinance 제공 기간**: 역사적 재무제표는 최근 4~5년치만 제공. 그보다 오래된 start_date 백테스트는 lite 모드로 동작.
2. **KR 시세(KIS)**: 장중 준실시간. 단 장 시작 전엔 전일대비(`change_pct`)가 0으로 올 수 있음. KIS 무료 등급 기준.
3. **KR roe·div_yield 없음**: KIS 기본 시세가 미제공 → 한국 종목은 해당 컬럼이 `null`. (스크리너 필터 시 주의)
4. **US 펀더멘털은 yfinance**: KIS 미국 기본 시세는 가격/거래량만 줘서, PER·PBR·ROE 등 지표는 yfinance 유지.
5. **시가총액 단위**: US는 USD, KR은 KRW(KIS `hts_avls` 억원 → 원으로 환산 저장). UI에서 단위 구분 없이 표시되므로 직접 비교 주의.
6. **미국 실시간 한계**: KIS 무료 해외 시세는 정규장 지연 위주. 프리/애프터마켓 실시간은 제한적.
