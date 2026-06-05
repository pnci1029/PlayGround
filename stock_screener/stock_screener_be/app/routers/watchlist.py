"""
Watchlist group management + analysis endpoints.

Groups are stored in PostgreSQL (stocks.watchlists table).
Analysis:
  - strategy-fit: checks current DB snapshot values against strategy conditions
  - returns: fetches historical price from yfinance for the chosen start date
"""

import asyncio
import json
import logging
from datetime import date, timedelta

import pandas as pd
import yfinance as yf
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.db import get_db
from app.config import DB_SCHEMA
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
    rows = conn.execute(
        "SELECT id, name, tickers, created_at FROM watchlists ORDER BY id"
    ).fetchall()
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
    cur = conn.execute(
        "INSERT INTO watchlists (name, tickers, created_at) VALUES (?, ?, datetime('now'))",
        (body.name, json.dumps(body.tickers)),
    )
    conn.commit()
    wid = cur.lastrowid
    conn.close()
    return {"id": wid, "name": body.name, "tickers": body.tickers}


@router.put("/watchlists/{wid}")
def update_watchlist(wid: int, body: WatchlistUpdate):
    conn = get_db()
    row = conn.execute("SELECT id, name, tickers FROM watchlists WHERE id=?", (wid,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Watchlist not found")

    new_name    = body.name    if body.name    is not None else row["name"]
    new_tickers = body.tickers if body.tickers is not None else json.loads(row["tickers"])

    conn.execute(
        "UPDATE watchlists SET name=?, tickers=? WHERE id=?",
        (new_name, json.dumps(new_tickers), wid),
    )
    conn.commit()
    conn.close()
    return {"id": wid, "name": new_name, "tickers": new_tickers}


@router.delete("/watchlists/{wid}")
def delete_watchlist(wid: int):
    conn = get_db()
    conn.execute("DELETE FROM watchlists WHERE id=?", (wid,))
    conn.commit()
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
    wrow = conn.execute("SELECT tickers FROM watchlists WHERE id=?", (wid,)).fetchone()
    if not wrow:
        conn.close()
        raise HTTPException(status_code=404, detail="Watchlist not found")

    tickers = json.loads(wrow["tickers"])
    if not tickers:
        conn.close()
        return {"tickers": [], "strategies": [], "matrix": {}}

    # Fetch current snapshot for each ticker (strip .KS suffix for lookup)
    ticker_data = {}
    for t in tickers:
        clean = t.upper().replace(".KS", "")
        # Try both US and KR
        row = conn.execute(
            "SELECT * FROM stocks WHERE ticker=? OR ticker=? ORDER BY market LIMIT 1",
            (clean, clean + ".KS" if not clean.endswith(".KS") else clean),
        ).fetchone()
        if not row:
            # Try raw ticker
            row = conn.execute(
                "SELECT * FROM stocks WHERE ticker=?", (clean,)
            ).fetchone()
        if row:
            ticker_data[t] = dict(row)
    conn.close()

    strategy_list = [
        {"id": sid, "name": s["name"], "group": s.get("group", "classic")}
        for sid, s in STRATEGIES.items()
    ]

    OPS_FN = {
        ">":  lambda a, b: a > b,
        "<":  lambda a, b: a < b,
        ">=": lambda a, b: a >= b,
        "<=": lambda a, b: a <= b,
        "=":  lambda a, b: a == b,
    }

    matrix = {}
    for t in tickers:
        funds = ticker_data.get(t, {})
        row_result = {}
        for sid, s in STRATEGIES.items():
            conditions = s["conditions"]
            logic      = s.get("logic", "AND")
            evals = []
            for c in conditions:
                fval = funds.get(c["field"])
                if fval is None:
                    evals.append(None)
                    continue
                fn = OPS_FN.get(c["op"])
                if fn is None:
                    evals.append(None)
                    continue
                try:
                    evals.append(fn(float(fval), float(c["value"])))
                except Exception:
                    evals.append(None)
            known = [e for e in evals if e is not None]
            if not known:
                row_result[sid] = None   # data unavailable
            elif logic == "AND":
                row_result[sid] = all(known)
            else:
                row_result[sid] = any(known)
        matrix[t] = row_result

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
    wrow = conn.execute("SELECT tickers FROM watchlists WHERE id=?", (wid,)).fetchone()
    if not wrow:
        conn.close()
        raise HTTPException(status_code=404, detail="Watchlist not found")
    tickers = json.loads(wrow["tickers"])
    conn.close()

    if not tickers:
        return {"tickers": [], "start_date": body.start_date, "results": []}

    try:
        results = await asyncio.to_thread(_calc_returns, tickers, body.start_date)
    except Exception as exc:
        logger.exception("returns calc failed: %s", exc)
        return {"error": str(exc)}

    return {
        "start_date": body.start_date,
        "end_date":   str(date.today()),
        "results":    results,
    }


def _calc_returns(tickers: list, start_date: str) -> list:
    end_date = str(date.today())
    results  = []

    for raw_ticker in tickers:
        t = raw_ticker.upper()
        # Determine yfinance symbol
        yf_sym = t if "." in t else t   # KR tickers stored without .KS, add it
        # Try to figure out market from DB
        conn = get_db()
        row = conn.execute(
            "SELECT market, name, price FROM stocks WHERE ticker=?", (t.replace(".KS", ""),)
        ).fetchone()
        conn.close()

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
            results.append({
                "ticker": t,
                "name":   row["name"] if row else t,
                "start_price": None,
                "end_price":   None,
                "return_pct":  None,
                "error":       str(exc),
            })

    results.sort(key=lambda r: r.get("return_pct") or -9999, reverse=True)
    return results
