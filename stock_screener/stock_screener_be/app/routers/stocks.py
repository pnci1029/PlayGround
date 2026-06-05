from typing import Optional

from fastapi import APIRouter, Query

from app.config import NUMERIC_COLS, OPS, DB_SCHEMA
from app.db import get_db
from app.models import ScreenRequest

router = APIRouter(prefix="/api", tags=["stocks"])


def _rows_to_list(rows) -> list[dict]:
    return [dict(r) for r in rows]


@router.get("/stocks")
def list_stocks(
    market: Optional[str] = Query(None),
    sort:   str = Query("market_cap"),
    order:  str = Query("desc"),
    limit:  int = Query(200),
):
    col  = sort if sort in NUMERIC_COLS | {"ticker", "name", "market"} else "market_cap"
    dirn = "DESC" if order.lower() == "desc" else "ASC"
    where = "WHERE market=%s" if market else ""
    args  = (market,) if market else ()

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT * FROM {DB_SCHEMA}.stocks {where} ORDER BY {col} {dirn} NULLS LAST LIMIT %s",
            (*args, limit),
        )
        rows = cur.fetchall()
    conn.close()
    return _rows_to_list(rows)


@router.post("/screen")
def screen_stocks(req: ScreenRequest):
    if not req.conditions:
        return []

    clauses, params = [], []
    for c in req.conditions:
        if c.field not in NUMERIC_COLS or c.op not in OPS:
            continue
        clauses.append(f"{c.field} {OPS[c.op]} %s")
        params.append(c.value)

    if not clauses:
        return []

    col  = req.sort if req.sort in NUMERIC_COLS else "market_cap"
    dirn = "DESC" if req.order.lower() == "desc" else "ASC"
    join = f" {req.logic} "
    where_mkt = " AND market=%s" if req.market else ""
    if req.market:
        params.append(req.market)

    sql = (
        f"SELECT * FROM {DB_SCHEMA}.stocks WHERE ({join.join(clauses)}){where_mkt} "
        f"ORDER BY {col} {dirn} NULLS LAST"
    )
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()
    conn.close()
    return _rows_to_list(rows)
