import time
import logging
from datetime import datetime, timedelta

import yfinance as yf

from app.config import KR_TICKERS, DB_SCHEMA
from app.db import get_db
from app.fetcher.common import safe_float, upsert

log = logging.getLogger("fetcher.kr")

try:
    import FinanceDataReader as fdr
    FDR_AVAILABLE = True
except ImportError:
    FDR_AVAILABLE = False


def fetch_kr() -> None:
    if not FDR_AVAILABLE:
        log.warning("FinanceDataReader not installed — skipping KR fetch")
        return

    log.info("Fetching KR stocks (%d tickers)…", len(KR_TICKERS))
    conn = get_db()
    now = datetime.utcnow().isoformat()
    ok = 0

    for ticker in KR_TICKERS:
        try:
            end_dt   = datetime.today().strftime("%Y-%m-%d")
            start_dt = (datetime.today() - timedelta(days=7)).strftime("%Y-%m-%d")
            hist = fdr.DataReader(ticker, start_dt, end_dt)
            if hist is None or hist.empty:
                continue

            close = float(hist["Close"].iloc[-1])
            prev  = float(hist["Close"].iloc[-2]) if len(hist) > 1 else close
            chg   = (close - prev) / prev * 100 if prev else 0

            info: dict = {}
            try:
                info = yf.Ticker(ticker + ".KS").info
            except Exception:
                pass

            upsert(conn, dict(
                ticker=ticker, market="KR",
                name=info.get("shortName") or info.get("longName") or ticker,
                price=safe_float(close),
                change_pct=safe_float(chg),
                volume=info.get("regularMarketVolume"),
                market_cap=safe_float(info.get("marketCap")),
                per=safe_float(info.get("trailingPE")),
                pbr=safe_float(info.get("priceToBook")),
                roe=safe_float(info.get("returnOnEquity")),
                eps=safe_float(info.get("trailingEps")),
                div_yield=safe_float(info.get("trailingAnnualDividendYield")),
                week52_high=safe_float(info.get("fiftyTwoWeekHigh")),
                week52_low=safe_float(info.get("fiftyTwoWeekLow")),
                updated_at=now,
            ))
            ok += 1
            time.sleep(0.2)
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
    log.info("KR done: %d/%d", ok, len(KR_TICKERS))
