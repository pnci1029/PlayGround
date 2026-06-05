"""
Shared utilities for all fetcher modules.
"""
from app.config import DB_SCHEMA


def safe_float(v) -> float | None:
    try:
        f = float(v)
        return None if (f != f) else f  # NaN → None
    except Exception:
        return None


def upsert(conn, row: dict) -> None:
    """PostgreSQL UPSERT using ON CONFLICT"""
    with conn.cursor() as cur:
        cur.execute(f"""
            INSERT INTO {DB_SCHEMA}.stocks
                (ticker,market,name,price,change_pct,volume,market_cap,
                 per,pbr,roe,eps,div_yield,week52_high,week52_low,updated_at)
            VALUES
                (%(ticker)s,%(market)s,%(name)s,%(price)s,%(change_pct)s,%(volume)s,%(market_cap)s,
                 %(per)s,%(pbr)s,%(roe)s,%(eps)s,%(div_yield)s,%(week52_high)s,%(week52_low)s,%(updated_at)s)
            ON CONFLICT(ticker,market) DO UPDATE SET
                name=EXCLUDED.name, price=EXCLUDED.price,
                change_pct=EXCLUDED.change_pct, volume=EXCLUDED.volume,
                market_cap=EXCLUDED.market_cap, per=EXCLUDED.per,
                pbr=EXCLUDED.pbr, roe=EXCLUDED.roe, eps=EXCLUDED.eps,
                div_yield=EXCLUDED.div_yield, week52_high=EXCLUDED.week52_high,
                week52_low=EXCLUDED.week52_low, updated_at=EXCLUDED.updated_at
        """, row)
