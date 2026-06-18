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


# PK(ticker,market) 제외 전 컬럼 — US 단건 upsert는 모든 값을 한 번에 채운다
_ALL_UPDATE = [c for c in _COLS if c not in ("ticker", "market")]


def upsert(conn, row: dict) -> None:
    """US 단건 upsert (가격+펀더멘털 전체). PK 외 모든 컬럼 갱신.
    컬럼 목록은 _COLS 단일 소스에서 파생 → 필드 추가 시 여기만 자동 반영된다."""
    _batch_upsert(conn, [row], _ALL_UPDATE)
