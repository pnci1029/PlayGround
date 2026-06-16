"""
Shared utilities for all fetcher modules.
"""
import psycopg2.extras

from app.config import DB_SCHEMA


def safe_float(v) -> float | None:
    try:
        f = float(v)
        return None if (f != f) else f  # NaN → None
    except Exception:
        return None


def safe_int(v) -> int | None:
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


# stocks 테이블 전체 컬럼 (INSERT 시 항상 이 순서)
_COLS = [
    "ticker", "market", "name", "price", "change_pct", "volume", "market_cap",
    "per", "pbr", "roe", "eps", "div_yield", "week52_high", "week52_low",
    "debt_ratio", "eps_growth", "sales_growth", "updated_at",
]
# 가격 소스(FDR)가 소유하는 컬럼 — 이것만 ON CONFLICT 갱신
_PRICE_COLS = ["name", "price", "change_pct", "volume", "market_cap", "updated_at"]
# 펀더멘털 소스(KIS)가 소유하는 컬럼
_FUND_COLS = [
    "per", "pbr", "roe", "eps", "div_yield", "week52_high", "week52_low",
    "debt_ratio", "eps_growth", "sales_growth", "updated_at",
]


def _batch_upsert(conn, rows: list[dict], update_cols: list[str]) -> None:
    """execute_values 로 대량 upsert. update_cols 컬럼만 ON CONFLICT 시 갱신.
    (소스별로 소유 컬럼만 건드려, 다른 소스가 채운 값을 덮어쓰지 않음)"""
    if not rows:
        return
    values = [[r.get(c) for c in _COLS] for r in rows]
    set_clause = ", ".join(f"{c}=EXCLUDED.{c}" for c in update_cols)
    sql = (
        f"INSERT INTO {DB_SCHEMA}.stocks ({','.join(_COLS)}) VALUES %s "
        f"ON CONFLICT(ticker,market) DO UPDATE SET {set_clause}"
    )
    with conn.cursor() as cur:
        psycopg2.extras.execute_values(cur, sql, values, page_size=500)


def upsert_price(conn, rows: list[dict]) -> None:
    """가격/시총/거래량/종목명만 갱신 (FDR 전 종목 수집용)."""
    _batch_upsert(conn, rows, _PRICE_COLS)


def upsert_fundamentals(conn, rows: list[dict]) -> None:
    """PER/PBR/ROE/EPS/배당/52주만 갱신 (KIS 펀더멘털 sweep용)."""
    _batch_upsert(conn, rows, _FUND_COLS)


def upsert(conn, row: dict) -> None:
    """PostgreSQL UPSERT using ON CONFLICT"""
    with conn.cursor() as cur:
        cur.execute(f"""
            INSERT INTO {DB_SCHEMA}.stocks
                (ticker,market,name,price,change_pct,volume,market_cap,
                 per,pbr,roe,eps,div_yield,week52_high,week52_low,
                 debt_ratio,eps_growth,sales_growth,updated_at)
            VALUES
                (%(ticker)s,%(market)s,%(name)s,%(price)s,%(change_pct)s,%(volume)s,%(market_cap)s,
                 %(per)s,%(pbr)s,%(roe)s,%(eps)s,%(div_yield)s,%(week52_high)s,%(week52_low)s,
                 %(debt_ratio)s,%(eps_growth)s,%(sales_growth)s,%(updated_at)s)
            ON CONFLICT(ticker,market) DO UPDATE SET
                name=EXCLUDED.name, price=EXCLUDED.price,
                change_pct=EXCLUDED.change_pct, volume=EXCLUDED.volume,
                market_cap=EXCLUDED.market_cap, per=EXCLUDED.per,
                pbr=EXCLUDED.pbr, roe=EXCLUDED.roe, eps=EXCLUDED.eps,
                div_yield=EXCLUDED.div_yield, week52_high=EXCLUDED.week52_high,
                week52_low=EXCLUDED.week52_low, debt_ratio=EXCLUDED.debt_ratio,
                eps_growth=EXCLUDED.eps_growth, sales_growth=EXCLUDED.sales_growth,
                updated_at=EXCLUDED.updated_at
        """, row)
