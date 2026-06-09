import time
import logging
from datetime import datetime

from app.config import KR_TICKERS, KR_UNIVERSE_SIZE, DB_SCHEMA
from app.db import get_db
from app.fetcher.common import safe_float, upsert
from app.kis.quote import domestic_price

log = logging.getLogger("fetcher.kr")

# 종목코드 → 종목명 매핑 (FDR KRX 상장목록, 모듈 1회 캐시).
# KIS 기본 시세 응답엔 종목명이 없어 이름은 FDR에서 보강한다.
_NAME_MAP: dict[str, str] = {}
_LISTING_CACHE = None


def _listing():
    """FDR KRX 상장목록 DataFrame (1회 캐시)."""
    global _LISTING_CACHE
    if _LISTING_CACHE is None:
        import FinanceDataReader as fdr
        _LISTING_CACHE = fdr.StockListing("KRX")
    return _LISTING_CACHE


def _name_map() -> dict[str, str]:
    global _NAME_MAP
    if _NAME_MAP:
        return _NAME_MAP
    try:
        listing = _listing()
        _NAME_MAP = {str(c): str(n) for c, n in zip(listing["Code"], listing["Name"])}
        log.info("KRX 종목명 %d개 로드", len(_NAME_MAP))
    except Exception as e:
        log.warning("KRX 종목명 목록 로드 실패(이름은 코드로 대체): %s", e)
    return _NAME_MAP


def kr_universe() -> list[str]:
    """수집 대상 KR 종목코드 목록.
    KR_UNIVERSE_SIZE>0 이면 FDR 시가총액 상위 N개, 실패 시 KR_TICKERS로 폴백."""
    if KR_UNIVERSE_SIZE <= 0:
        return KR_TICKERS
    try:
        df = _listing()
        # 우선주 등 제외: 6자리 보통주 코드만, 시가총액(Marcap) 내림차순
        df = df[df["Market"].isin(["KOSPI", "KOSDAQ"])].copy()
        df = df.dropna(subset=["Marcap"]).sort_values("Marcap", ascending=False)
        # 우선주 제외 (보통주만): 종목명이 '우' 또는 '우B'로 끝나는 종목 제거
        df = df[~df["Name"].astype(str).str.endswith(("우", "우B"))]
        codes = [str(c) for c in df["Code"].tolist() if str(c).isdigit()]
        codes = codes[:KR_UNIVERSE_SIZE]
        if codes:
            log.info("KR 유니버스: 시총 상위 %d종목", len(codes))
            return codes
    except Exception as e:
        log.warning("KR 유니버스 동적 구성 실패(KR_TICKERS로 폴백): %s", e)
    return KR_TICKERS


def build_kr_row(ticker: str, names: dict[str, str], now: str) -> dict:
    """KIS 시세 + FDR 종목명을 stocks 테이블 row 형태로 변환. (DB 없이 테스트 가능)"""
    q = domestic_price(ticker)
    mc = q.get("market_cap")  # KIS hts_avls 단위: 억원
    return dict(
        ticker=ticker, market="KR",
        name=names.get(ticker) or ticker,
        price=safe_float(q.get("price")),
        change_pct=safe_float(q.get("change_pct")),
        volume=q.get("volume"),
        market_cap=safe_float(mc * 1e8) if mc is not None else None,  # 억원 → 원
        per=safe_float(q.get("per")),
        pbr=safe_float(q.get("pbr")),
        roe=None,        # KIS 기본 시세엔 없음 (추후 재무 endpoint로 보강 가능)
        eps=safe_float(q.get("eps")),
        div_yield=None,  # KIS 기본 시세엔 없음
        week52_high=safe_float(q.get("week52_high")),
        week52_low=safe_float(q.get("week52_low")),
        updated_at=now,
    )


def fetch_kr() -> None:
    tickers = kr_universe()
    log.info("Fetching KR stocks via KIS (%d tickers)…", len(tickers))
    names = _name_map()
    conn = get_db()
    now = datetime.utcnow().isoformat()
    ok = 0

    for ticker in tickers:
        try:
            upsert(conn, build_kr_row(ticker, names, now))
            ok += 1
            time.sleep(0.1)  # KIS 유량 제한 여유
        except Exception as e:
            log.warning("KR %s error: %s", ticker, e)

    with conn.cursor() as cur:
        cur.execute(
            f"""
            INSERT INTO {DB_SCHEMA}.last_refresh(id, market, finished_at)
            VALUES (2, 'KR', %s)
            ON CONFLICT(id) DO UPDATE SET
                market = EXCLUDED.market,
                finished_at = EXCLUDED.finished_at
            """,
            (now,)
        )
    conn.commit()
    conn.close()
    log.info("KR done (KIS): %d/%d", ok, len(tickers))
