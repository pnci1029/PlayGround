"""
종목 캔들(OHLCV) 조회 — 차트용.

과거 데이터는 저장하지 않고 on-demand로 가져온다.
- KR: FinanceDataReader 일봉 → 주/월/연 집계
- US: yfinance 일봉 → 주/월/연 집계
(KIS 레이트리밋을 피하려 차트는 FDR/yfinance 사용)
"""
import logging
from datetime import datetime, timedelta

log = logging.getLogger("chart")

# timeframe → (그룹 주기 period, fetch 연수, 기본 표시 개수)
_TF = {
    "D": (None, 2, 250),    # 일봉
    "W": ("W", 5, 200),     # 주봉
    "M": ("M", 20, 240),    # 월봉
    "Y": ("Y", 40, 50),     # 연봉 (월/일봉을 연 단위 집계)
}
_OHLCV = ["Open", "High", "Low", "Close", "Volume"]


def _fetch_daily(ticker: str, market: str, start: str):
    if market == "US":
        import yfinance as yf
        df = yf.Ticker(ticker).history(start=start)
    else:
        import FinanceDataReader as fdr
        df = fdr.DataReader(ticker, start)
    if df is None or df.empty:
        return None
    return df[[c for c in _OHLCV if c in df.columns]].dropna()


def _r(v):
    try:
        f = float(v)
        return None if f != f else round(f, 2)
    except (TypeError, ValueError):
        return None


def get_candles(ticker: str, market: str = "KR", tf: str = "D", count: int | None = None) -> list[dict]:
    """OHLCV 캔들 목록. tf: D(일)/W(주)/M(월)/Y(연)."""
    tf = (tf or "D").upper()
    if tf not in _TF:
        tf = "D"
    group, years, default_count = _TF[tf]
    count = count or default_count
    start = (datetime.today() - timedelta(days=int(years * 366))).strftime("%Y-%m-%d")

    df = _fetch_daily(ticker, market, start)
    if df is None or df.empty:
        return []
    if getattr(df.index, "tz", None) is not None:  # yfinance tz-aware → 제거
        df.index = df.index.tz_localize(None)

    if group:  # 주/월/연 집계 (to_period 는 pandas 버전 무관하게 안정적)
        g = df.groupby(df.index.to_period(group))
        df = g.agg(Open=("Open", "first"), High=("High", "max"),
                   Low=("Low", "min"), Close=("Close", "last"), Volume=("Volume", "sum"))
        df.index = df.index.to_timestamp(how="end")

    df = df.tail(count)
    out = []
    for ts, row in df.iterrows():
        vol = row.get("Volume")
        out.append({
            "date": ts.strftime("%Y-%m-%d"),
            "open": _r(row.get("Open")), "high": _r(row.get("High")),
            "low": _r(row.get("Low")), "close": _r(row.get("Close")),
            "volume": int(vol) if vol == vol else None,
        })
    return out
