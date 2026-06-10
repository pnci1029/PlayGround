"""차트(캔들) API. 과거 OHLCV를 on-demand로 조회."""
from fastapi import APIRouter, HTTPException, Query

from app.chart import get_candles

router = APIRouter(tags=["chart"])


@router.get("/api/candles/{ticker}")
def candles(
    ticker: str,
    market: str = Query("KR", description="KR | US"),
    tf: str = Query("D", description="D(일)/W(주)/M(월)/Y(연)"),
    count: int | None = Query(None, description="표시할 캔들 개수 (미지정 시 tf별 기본값)"),
):
    try:
        data = get_candles(ticker, market.upper(), tf, count)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"candle fetch failed: {e}")
    if not data:
        raise HTTPException(status_code=404, detail="no candle data")
    return {"ticker": ticker, "market": market.upper(), "tf": tf.upper(), "candles": data}
