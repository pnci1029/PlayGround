import time
import logging
from datetime import datetime

import yfinance as yf

from app.config import SP500_TICKERS, DB_SCHEMA
from app.db import get_db
from app.fetcher.common import safe_float, upsert

log = logging.getLogger("fetcher.us")


def fetch_us() -> None:
    log.info("Fetching US stocks (%d tickers)…", len(SP500_TICKERS))
    conn = get_db()
    now = datetime.utcnow().isoformat()
    batch = yf.Tickers(" ".join(SP500_TICKERS))
    ok = 0

    for ticker in SP500_TICKERS:
        try:
            info = batch.tickers[ticker].info
            hist = batch.tickers[ticker].history(period="2d")
            if hist.empty:
                continue
            close = hist["Close"].iloc[-1]
            prev  = hist["Close"].iloc[-2] if len(hist) > 1 else close
            chg   = (close - prev) / prev * 100 if prev else 0

            upsert(conn, dict(
                ticker=ticker, market="US",
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
            time.sleep(0.1)
        except Exception as e:
            log.warning("US %s error: %s", ticker, e)

    with conn.cursor() as cur:
        cur.execute(
            f"""
            INSERT INTO {DB_SCHEMA}.last_refresh(id, market, finished_at)
            VALUES (1, 'US', %s)
            ON CONFLICT(id) DO UPDATE SET
                market = EXCLUDED.market,
                finished_at = EXCLUDED.finished_at
            """,
            (now,)
        )
    conn.commit()
    conn.close()
    log.info("US done: %d/%d", ok, len(SP500_TICKERS))
