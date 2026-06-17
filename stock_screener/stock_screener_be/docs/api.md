# API 레퍼런스

베이스 URL: `http://localhost:8005`

---

## 시스템

### `GET /`
HTML 페이지 반환 (SPA 진입점).

### `GET /api/status`
마지막 데이터 갱신 시각 조회.

**응답**
```json
{
  "last_refresh": {
    "US": "2024-01-15T09:30:00",
    "KR": "2024-01-15T09:31:00"
  }
}
```

### `POST /api/refresh`
전체 종목 데이터 수동 갱신 (US 30 + KR 30). 완료까지 약 30~60초 소요.

**응답**
```json
{ "status": "ok", "message": "refreshed" }
```

---

## 종목

### `GET /api/stocks`
전체 종목 목록 반환.

**쿼리 파라미터**

| 파라미터 | 기본값 | 설명 |
|---------|--------|------|
| `market` | (전체) | `US` 또는 `KR` 필터 |
| `sort` | `market_cap` | 정렬 컬럼 |
| `order` | `desc` | `asc` / `desc` |
| `limit` | `200` | 최대 반환 수 |

**응답 예시**
```json
[
  {
    "ticker": "AAPL",
    "market": "US",
    "name": "Apple Inc.",
    "price": 185.5,
    "change_pct": 1.2,
    "volume": 52000000,
    "market_cap": 2900000000000,
    "per": 28.4,
    "pbr": 45.2,
    "roe": 1.60,
    "eps": 6.53,
    "div_yield": 0.0055,
    "week52_high": 199.6,
    "week52_low": 124.2,
    "updated_at": "2024-01-15T09:30:00"
  }
]
```

### `POST /api/screen`
필터 조건으로 종목 스크리닝.

**요청 바디**
```json
{
  "conditions": [
    { "field": "per", "op": "<", "value": 15 },
    { "field": "roe", "op": ">", "value": 0.15 }
  ],
  "logic": "AND",
  "market": "US",
  "sort": "market_cap",
  "order": "desc"
}
```

| 필드 | 값 |
|------|----|
| `field` | `price`, `change_pct`, `market_cap`, `per`, `pbr`, `roe`, `eps`, `div_yield`, `week52_high`, `week52_low`, `volume`, `debt_ratio`, `eps_growth`, `sales_growth` |
| `op` | `>`, `<`, `>=`, `<=`, `=` |
| `logic` | `AND` / `OR` |
| `market` | `US`, `KR`, 또는 생략 (전체) |

**응답**: 조건에 맞는 종목 배열 (GET /api/stocks와 동일한 구조)

---

## 전략

### `GET /api/strategies`
사전 정의된 전략 목록 반환.

**응답 예시**
```json
[
  {
    "id": "greenblatt",
    "name": "그린블라트 마법공식",
    "subtitle": "이익수익률 + 자본수익률",
    "description": "조엘 그린블라트의 Magic Formula...",
    "group": "legendary",
    "color": "#f0883e",
    "conditions": [
      { "field": "per", "op": "<", "value": 15 },
      { "field": "roe", "op": ">", "value": 0.25 }
    ],
    "logic": "AND"
  }
]
```

`group` 값: `kostolany` | `classic` | `legendary`

### `GET /api/strategy/{strategy_id}`
특정 전략을 즉시 적용해 종목 목록 반환.

**경로 파라미터**: `strategy_id` — 전략 키 (예: `greenblatt`, `lynch_garp`)

**쿼리 파라미터**: `market`, `sort`, `order` (GET /api/stocks와 동일)

**응답**: 조건에 맞는 종목 배열

---

## DCA 계산기

### `GET /api/dca`
적립식 투자(DCA) 시뮬레이션.

**쿼리 파라미터**

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `ticker` | ✓ | 종목 코드 |
| `start` | ✓ | 시작일 `YYYY-MM-DD` |
| `amount` | ✓ | 회당 투자금 (USD/KRW) |
| `market` | - | `US` (기본) / `KR` |
| `freq` | - | `monthly` (기본) / `weekly` |

**응답 예시**
```json
{
  "ticker": "AAPL",
  "market": "US",
  "n_periods": 36,
  "total_invested": 36000,
  "final_value": 52000,
  "profit": 16000,
  "profit_pct": 44.4,
  "cagr": 13.2,
  "total_shares": 210.4,
  "current_price": 185.5,
  "max_gain_pct": 58.2,
  "min_gain_pct": -12.4,
  "history": [
    { "date": "2021-01", "price": 128.0, "bought": 7.8125, "total_shares": 7.8125, "invested": 1000, "value": 1000 }
  ]
}
```

`history`는 최근 36개 기간만 반환.

---

## 백테스트

### `POST /api/backtest`
전략을 과거 시점에 적용했을 때의 예상 수익 계산.

**요청 바디**
```json
{
  "strategy_id": "greenblatt",
  "start_date": "2021-01-01",
  "end_date": "2024-01-01",
  "market": "ALL"
}
```

| 필드 | 값 |
|------|----|
| `market` | `US`, `KR`, `ALL` (기본) |

**응답 예시**
```json
{
  "strategy_name": "그린블라트 마법공식",
  "start_date": "2021-01-01",
  "end_date": "2024-01-01",
  "matched": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "market": "US",
      "matched": true,
      "start_price": 128.0,
      "end_price": 185.5,
      "return_pct": 44.9,
      "data_quality": "precise",
      "fundamentals": { "per": 14.2, "roe": 0.87, "pbr": 28.1 }
    }
  ],
  "unmatched_count": 42,
  "portfolio_return": 38.5,
  "benchmark_return": 29.1,
  "data_quality": "precise"
}
```

**data_quality 설명**
- `precise` — 해당 시점의 역사적 재무제표(연간 손익계산서·대차대조표)로 PER/PBR/ROE 재계산
- `lite` — yfinance 과거 데이터 없을 때 현재 info 기준 지표 사용

**처리 시간**: 종목 수 × 네트워크 지연. US+KR 60종목 기준 약 30~120초.

---

## GET /api/candles/{ticker}

종목 캔들(OHLCV) 조회 — **일/주/월/연봉**. 차트용 과거 데이터.

| 파라미터 | 값 | 기본 | 설명 |
|----------|-----|------|------|
| `market` | `KR`\|`US` | `KR` | 시장 |
| `tf` | `D`\|`W`\|`M`\|`Y` | `D` | 일/주/월/연 |
| `count` | 정수 | tf별 기본 | 캔들 개수 |

```json
{ "ticker":"005930","market":"KR","tf":"M",
  "candles":[{"date":"2026-04-30","open":319500,"high":370000,"low":292500,"close":302500,"volume":253477582}] }
```

과거→최신 순. KR=FinanceDataReader, US=yfinance (KIS 레이트리밋과 무관). 상세: [chart.md](./chart.md).
