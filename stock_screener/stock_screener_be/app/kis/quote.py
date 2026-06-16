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


def domestic_finance(ticker: str) -> dict:
    """국내주식 재무비율(부채비율/성장률). TR FHKST66430300.
    현재가 시세(inquire-price)에는 없는 항목이라 별도 엔드포인트로 조회한다.
    output은 결산기 배열(최신이 [0]). 값은 모두 % 단위."""
    c = get_client()
    data = c.get(
        "/uapi/domestic-stock/v1/finance/financial-ratio",
        tr_id="FHKST66430300",
        params={
            "FID_DIV_CLS_CODE": "0",          # 0: 년, 1: 분기
            "fid_cond_mrkt_div_code": "J",   # 주식
            "fid_input_iscd": ticker,
        },
    )
    out = data.get("output") or []
    o = out[0] if out else {}
    return {
        "debt_ratio":   _f(o.get("lblt_rate")),   # 부채비율(%)
        "sales_growth": _f(o.get("grs")),          # 매출액 증가율(%)
        "eps_growth":   _f(o.get("ntin_inrt")),    # 순이익 증가율(%) ≈ 이익성장률
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
