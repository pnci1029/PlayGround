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

### KR 종목 (FinanceDataReader + yfinance)

- **대상**: KOSPI 주요 30종목 (`config.py` → `KR_TICKERS`)
- **현재가/등락률/거래량**: `FinanceDataReader.DataReader(ticker, market="KRX")` 최신 행
- **나머지 지표**: `yf.Ticker(ticker + ".KS").info`

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
| US | 30 | AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA, BRK-B, JPM, V, UNH, XOM, LLY, AVGO, MA, HD, PG, JNJ, MRK, COST, ABBV, BAC, CVX, NFLX, AMD, ORCL, CRM, KO, WMT, PEP |
| KR | 30 | 005930(삼성전자), 000660(SK하이닉스), 035720(카카오), 005380(현대차), 051910(LG화학), 068270(셀트리온), 035420(NAVER), 006400(삼성SDI), 028260(삼성물산), 105560(KB금융), 그 외 20종목 |

---

## 데이터 갱신 주기

- **서버 시작 시**: 자동으로 전체 수집 (`fetch_all()`)
- **수동 갱신**: `POST /api/refresh` 호출
- **자동 주기 갱신**: 미구현 (v0.4 roadmap)

---

## 데이터 한계 및 주의사항

1. **yfinance 제공 기간**: 역사적 재무제표는 최근 4~5년치만 제공. 그보다 오래된 start_date 백테스트는 lite 모드로 동작.
2. **KR 종목 지연**: FinanceDataReader KRX 데이터는 15~20분 지연.
3. **PBR·ROE 품질**: yfinance `returnOnEquity`는 TTM(최근 12개월) 기준. 분기 실적 반영에 시차 존재.
4. **배당수익률**: `trailingAnnualDividendYield`가 없으면 `dividendYield`로 대체. 일부 종목은 null.
5. **시가총액 단위**: US는 USD, KR은 KRW. UI에서 단위 구분 없이 숫자 표시되므로 직접 비교 주의.
