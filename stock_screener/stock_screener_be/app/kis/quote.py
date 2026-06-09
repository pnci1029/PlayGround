"""
KIS 시세조회 (조회 전용).

- domestic_price(): 국내주식 현재가
- overseas_price(): 미국주식 현재가
"""
from app.kis.client import get_client


def _f(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _i(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def domestic_price(ticker: str) -> dict:
    """국내주식 현재가. ticker 예: '005930' (삼성전자)."""
    c = get_client()
    data = c.get(
        "/uapi/domestic-stock/v1/quotations/inquire-price",
        tr_id="FHKST01010100",
        params={
            "FID_COND_MRKT_DIV_CODE": "J",  # 주식
            "FID_INPUT_ISCD": ticker,
        },
    )
    o = data.get("output", {})
    return {
        "ticker": ticker,
        "market": "KR",
        "name": o.get("bstp_kor_isnm"),       # 업종명(종목명 별도 조회 필요할 수 있음)
        "price": _f(o.get("stck_prpr")),       # 현재가
        "change_pct": _f(o.get("prdy_ctrt")),  # 전일대비율(%)
        "volume": _i(o.get("acml_vol")),       # 누적거래량
        "market_cap": _f(o.get("hts_avls")),   # 시가총액(억원)
        "per": _f(o.get("per")),
        "pbr": _f(o.get("pbr")),
        "eps": _f(o.get("eps")),
        "week52_high": _f(o.get("w52_hgpr")),
        "week52_low": _f(o.get("w52_lwpr")),
    }


# 미국 거래소 코드
US_EXCHANGES = {"NAS": "나스닥", "NYS": "뉴욕", "AMS": "아멕스"}


def overseas_price(symbol: str, excd: str = "NAS") -> dict:
    """미국주식 현재가. symbol 예: 'AAPL', excd: NAS/NYS/AMS."""
    c = get_client()
    data = c.get(
        "/uapi/overseas-price/v1/quotations/price",
        tr_id="HHDFS00000300",
        params={"AUTH": "", "EXCD": excd, "SYMB": symbol},
    )
    o = data.get("output", {})
    return {
        "ticker": symbol,
        "market": "US",
        "excd": excd,
        "price": _f(o.get("last")),       # 현재가
        "change_pct": _f(o.get("rate")),  # 등락율(%)
        "volume": _i(o.get("tvol")),      # 거래량
        "prev_close": _f(o.get("base")),  # 전일종가
    }
