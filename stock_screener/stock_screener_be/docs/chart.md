# 차트 (캔들/OHLCV) API

종목별 과거 가격 캔들을 조회하는 API. **일/주/월/연봉** 지원.

> 과거 데이터는 DB에 저장하지 않고 **on-demand로 조회**한다 (KR=FinanceDataReader, US=yfinance).
> 증권사 앱 차트와 같은 방식: 과거 캔들은 API 조회 + (예정) 실시간은 WebSocket으로 마지막 봉 갱신.

---

## 엔드포인트

```
GET /api/candles/{ticker}
```

### 쿼리 파라미터

| 파라미터 | 값 | 기본 | 설명 |
|----------|-----|------|------|
| `market` | `KR` \| `US` | `KR` | 시장 (KR=FDR, US=yfinance) |
| `tf` | `D` \| `W` \| `M` \| `Y` | `D` | 봉 단위: 일/주/월/연 |
| `count` | 정수 | tf별 기본값 | 표시할 캔들 개수 |

`count` 미지정 시 기본값: 일=250, 주=200, 월=240, 연=50.

### 응답

```json
{
  "ticker": "005930",
  "market": "KR",
  "tf": "M",
  "candles": [
    { "date": "2026-04-30", "open": 319500.0, "high": 370000.0,
      "low": 292500.0, "close": 302500.0, "volume": 253477582 },
    ...
  ]
}
```

- `candles`는 **과거→최신** 순서.
- `date`: 일봉=거래일, 주/월/연봉=해당 구간의 마지막 날짜.
- 데이터 없으면 `404`, 소스 조회 실패 시 `502`.

---

## 사용 예

```bash
# 삼성전자 일봉 (기본 250개)
curl "https://<API>/api/candles/005930"

# 삼성전자 월봉 24개
curl "https://<API>/api/candles/005930?tf=M&count=24"

# 삼성전자 연봉
curl "https://<API>/api/candles/005930?tf=Y"

# 애플(미국) 주봉
curl "https://<API>/api/candles/AAPL?market=US&tf=W"
```

## 프론트엔드 사용

- **스크리너 표에서 종목 행을 클릭** → 캔들 차트 **모달**이 열림.
- 모달 상단 **[일][주][월][연]** 토글로 timeframe 전환.
- 차트는 새 라이브러리 없이 **캔버스에 직접 렌더**(기존 DcaModal 패턴) — 캔들스틱 + 거래량 막대.
- 관련 파일:
  - `src/components/ChartModal.tsx` — 모달 + 캔들 렌더
  - `src/lib/api.ts` → `apiCandles(ticker, market, tf, count?)`
  - `src/components/StockTable.tsx` → 행 `onRowClick`
  - `src/app/page.tsx` → `chartStock` 상태로 모달 제어

```ts
const res = await apiCandles(ticker, market, tf); // GET /api/candles/...
// res.candles → 캔버스 렌더 (또는 lightweight-charts 등으로 교체 가능)
```

---

## 데이터 소스 / 동작

| tf | 처리 |
|----|------|
| D(일) | 소스 일봉 그대로 |
| W(주)/M(월) | 일봉을 주/월 단위로 OHLC 집계 (open=구간 첫날, high=최고, low=최저, close=마지막, volume=합) |
| Y(연) | 일봉을 **연 단위로 집계** (기본 제공 안 하는 소스가 많아 서버에서 계산) |

- 구현: `app/chart.py` (`get_candles`), 라우터 `app/routers/chart.py`
- 집계는 `pandas` `to_period`(버전 무관) 사용

---

## 한계

- **분봉/틱**: 무료 소스는 최근 며칠~수십일만 제공 (장기 분봉 불가).
- **일·주·월·연봉**: 수년~수십년치 제공 — 장기 차트 문제없음.
- 차트는 KIS가 아니라 FDR/yfinance를 써서 **KIS 초당 한도와 무관**.
- 실시간 갱신(마지막 봉 tick)은 추후 KIS WebSocket으로 별도 구현 예정.
