"""
Watchlist group management + analysis endpoints.

Groups are stored in PostgreSQL ({DB_SCHEMA}.watchlists table).
Analysis:
  - strategy-fit: checks current DB snapshot values against strategy conditions
  - returns: fetches historical price from yfinance for the chosen start date
"""

import asyncio
import json
import logging
from datetime import date

import yfinance as yf
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.db import get_db
from app.config import DB_SCHEMA
from app.strategy_eval import evaluate_conditions
from strategies import STRATEGIES

router = APIRouter(prefix="/api", tags=["watchlist"])
logger = logging.getLogger(__name__)


# ── Pydantic models ────────────────────────────────────────────────────────

class WatchlistCreate(BaseModel):
    name: str
    tickers: List[str] = []


class WatchlistUpdate(BaseModel):
    name: Optional[str] = None
    tickers: Optional[List[str]] = None


class ReturnsRequest(BaseModel):
    start_date: str   # YYYY-MM-DD


# ── CRUD ──────────────────────────────────────────────────────────────────

@router.get("/watchlists")
def list_watchlists():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, name, tickers, created_at FROM {DB_SCHEMA}.watchlists ORDER BY id"
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return [
        {
            "id":         r["id"],
            "name":       r["name"],
            "tickers":    json.loads(r["tickers"]),
            "created_at": r["created_at"],
        }
        for r in rows
    ]


@router.post("/watchlists")
def create_watchlist(body: WatchlistCreate):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {DB_SCHEMA}.watchlists (name, tickers) "
                f"VALUES (%s, %s) RETURNING id, created_at",
                (body.name, json.dumps(body.tickers)),
            )
            row = cur.fetchone()
        conn.commit()
    finally:
        conn.close()
    return {
        "id": row["id"],
        "name": body.name,
        "tickers": body.tickers,
        "created_at": row["created_at"],
    }


@router.put("/watchlists/{wid}")
def update_watchlist(wid: int, body: WatchlistUpdate):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, name, tickers FROM {DB_SCHEMA}.watchlists WHERE id=%s", (wid,)
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Watchlist not found")

            new_name    = body.name    if body.name    is not None else row["name"]
            new_tickers = body.tickers if body.tickers is not None else json.loads(row["tickers"])

            cur.execute(
                f"UPDATE {DB_SCHEMA}.watchlists SET name=%s, tickers=%s WHERE id=%s",
                (new_name, json.dumps(new_tickers), wid),
            )
        conn.commit()
    finally:
        conn.close()
    return {"id": wid, "name": new_name, "tickers": new_tickers}


@router.delete("/watchlists/{wid}")
def delete_watchlist(wid: int):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM {DB_SCHEMA}.watchlists WHERE id=%s", (wid,))
        conn.commit()
    finally:
        conn.close()
    return {"ok": True}


# ── Strategy fit analysis ──────────────────────────────────────────────────

@router.get("/watchlists/{wid}/strategy-fit")
def strategy_fit(wid: int):
    """
    For each ticker in the watchlist, check which strategies it currently matches
    using the live DB snapshot values.
    """
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT tickers FROM {DB_SCHEMA}.watchlists WHERE id=%s", (wid,))
            wrow = cur.fetchone()
            if not wrow:
                raise HTTPException(status_code=404, detail="Watchlist not found")

            tickers = json.loads(wrow["tickers"])
            if not tickers:
                return {"tickers": [], "strategies": [], "matrix": {}}

            # Fetch current snapshot for each ticker (strip .KS suffix for lookup)
            ticker_data = {}
            for t in tickers:
                clean = t.upper().replace(".KS", "")
                cur.execute(
                    f"SELECT * FROM {DB_SCHEMA}.stocks WHERE ticker=%s OR ticker=%s "
                    f"ORDER BY market LIMIT 1",
                    (clean, clean + ".KS" if not clean.endswith(".KS") else clean),
                )
                row = cur.fetchone()
                if not row:
                    cur.execute(f"SELECT * FROM {DB_SCHEMA}.stocks WHERE ticker=%s", (clean,))
                    row = cur.fetchone()
                if row:
                    ticker_data[t] = dict(row)
    finally:
        conn.close()

    strategy_list = [
        {"id": sid, "name": s["name"], "group": s.get("group", "classic")}
        for sid, s in STRATEGIES.items()
    ]

    matrix = {}
    for t in tickers:
        funds = ticker_data.get(t, {})
        matrix[t] = {
            sid: evaluate_conditions(funds, s["conditions"], s.get("logic", "AND"))
            for sid, s in STRATEGIES.items()
        }

    ticker_info = {
        t: {
            "name":   ticker_data[t].get("name", t) if t in ticker_data else t,
            "market": ticker_data[t].get("market", "?") if t in ticker_data else "?",
        }
        for t in tickers
    }

    return {
        "tickers":   tickers,
        "strategies": strategy_list,
        "matrix":    matrix,
        "ticker_info": ticker_info,
    }


# ── Historical return analysis ─────────────────────────────────────────────

@router.post("/watchlists/{wid}/returns")
async def watchlist_returns(wid: int, body: ReturnsRequest):
    """
    Calculate return for each ticker from start_date to today.
    Uses yfinance history. Runs in thread pool to avoid blocking.
    """
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT tickers FROM {DB_SCHEMA}.watchlists WHERE id=%s", (wid,))
            wrow = cur.fetchone()
            if not wrow:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            tickers = json.loads(wrow["tickers"])
    finally:
        conn.close()

    if not tickers:
        return {"tickers": [], "start_date": body.start_date, "results": []}

    try:
        results = await asyncio.to_thread(_calc_returns, tickers, body.start_date)
    except Exception as exc:
        logger.exception("returns calc failed: %s", exc)
        raise HTTPException(status_code=500, detail="수익률 계산 중 오류가 발생했습니다")

    return {
        "start_date": body.start_date,
        "end_date":   str(date.today()),
        "results":    results,
    }


def _calc_returns(tickers: list, start_date: str) -> list:
    end_date = str(date.today())

    # 종목별 market/name 을 한 번의 DB 연결로 조회한 뒤(네트워크 I/O 전에 연결을 닫는다)
    # yfinance 가격 조회를 수행한다.
    info: dict = {}
    conn = get_db()
    try:
        with conn.cursor() as cur:
            for raw in tickers:
                clean = raw.upper().replace(".KS", "")
                cur.execute(
                    f"SELECT market, name, price FROM {DB_SCHEMA}.stocks WHERE ticker=%s",
                    (clean,),
                )
                r = cur.fetchone()
                if r:
                    info[raw] = r
    finally:
        conn.close()

    results = []
    for raw_ticker in tickers:
        t = raw_ticker.upper()
        row = info.get(raw_ticker)
        yf_sym = t
        if row and row["market"] == "KR" and not t.endswith(".KS"):
            yf_sym = t + ".KS"

        try:
            hist = yf.Ticker(yf_sym).history(start=start_date, end=end_date)
            if hist.empty or len(hist) < 2:
                results.append({
                    "ticker": t,
                    "name":   row["name"] if row else t,
                    "start_price": None,
                    "end_price":   None,
                    "return_pct":  None,
                    "error":       "데이터 없음",
                })
                continue

            start_price = round(float(hist.iloc[0]["Close"]), 4)
            end_price   = round(float(hist.iloc[-1]["Close"]), 4)
            ret_pct     = round((end_price - start_price) / start_price * 100, 2)
            results.append({
                "ticker":      t,
                "name":        row["name"] if row else t,
                "start_price": start_price,
                "end_price":   end_price,
                "return_pct":  ret_pct,
            })
        except Exception as exc:
            logger.debug("returns %s: %s", t, exc)
            results.append({
                "ticker": t,
                "name":   row["name"] if row else t,
                "start_price": None,
                "end_price":   None,
                "return_pct":  None,
                "error":       "조회 실패",
            })

    results.sort(key=lambda r: r.get("return_pct") or -9999, reverse=True)
    return results
