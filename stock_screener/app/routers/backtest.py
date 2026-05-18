"""
Strategy backtesting endpoint.

Precise mode:  uses historical annual financials/balance_sheet from yfinance
               to reconstruct PER/PBR/ROE at the start date, then filters.
Lite mode:     falls back to current info{} values for screening when
               historical fundamental data is unavailable; still uses real
               historical price returns.
"""

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout, as_completed

import pandas as pd
import yfinance as yf
from fastapi import APIRouter
from pydantic import BaseModel

from app.config import KR_TICKERS, SP500_TICKERS
from strategies import STRATEGIES

router = APIRouter()
logger = logging.getLogger(__name__)

_POOL = ThreadPoolExecutor(max_workers=12, thread_name_prefix="bt")

OPS = {
    ">":  lambda a, b: a > b,
    "<":  lambda a, b: a < b,
    ">=": lambda a, b: a >= b,
    "<=": lambda a, b: a <= b,
    "=":  lambda a, b: a == b,
}


class BacktestRequest(BaseModel):
    strategy_id: str
    start_date: str   # YYYY-MM-DD
    end_date: str     # YYYY-MM-DD
    market: str = "ALL"


@router.post("/api/backtest")
async def run_backtest(req: BacktestRequest):
    strategy = STRATEGIES.get(req.strategy_id)
    if not strategy:
        return {"error": "전략을 찾을 수 없습니다"}

    if req.market == "US":
        ticker_pairs = [(t, "US") for t in SP500_TICKERS]
        benchmark = "SPY"
    elif req.market == "KR":
        ticker_pairs = [(t + ".KS", "KR") for t in KR_TICKERS]
        benchmark = "069500.KS"
    else:
        ticker_pairs = [(t, "US") for t in SP500_TICKERS] + \
                       [(t + ".KS", "KR") for t in KR_TICKERS]
        benchmark = "SPY"

    try:
        result = await asyncio.to_thread(
            _backtest, strategy, req.start_date, req.end_date, ticker_pairs, benchmark
        )
    except Exception as exc:
        logger.exception("backtest failed: %s", exc)
        return {"error": f"백테스트 실행 오류: {exc}"}

    return result


# ── Core sync logic ────────────────────────────────────────────────────────

def _backtest(strategy, start_date, end_date, ticker_pairs, benchmark):
    conditions = strategy["conditions"]
    logic      = strategy.get("logic", "AND")

    benchmark_return = _price_return(benchmark, start_date, end_date)

    futures = {
        _POOL.submit(_analyze, tkr, mkt, start_date, end_date, conditions, logic): tkr
        for tkr, mkt in ticker_pairs
    }

    all_rows = []
    try:
        for f in as_completed(futures, timeout=120):
            try:
                row = f.result()
                if row:
                    all_rows.append(row)
            except Exception as exc:
                logger.debug("ticker %s: %s", futures.get(f, "?"), exc)
    except FuturesTimeout:
        logger.warning("backtest timed out after 120s, using partial results (%d rows)", len(all_rows))

    matched   = [r for r in all_rows if r.get("matched")]
    unmatched = len(all_rows) - len(matched)

    portfolio_return = None
    if matched:
        valid_returns = [r["return_pct"] for r in matched if r.get("return_pct") is not None]
        if valid_returns:
            portfolio_return = round(sum(valid_returns) / len(valid_returns), 2)

    matched.sort(key=lambda r: r.get("return_pct") or 0, reverse=True)

    precise_cnt = sum(1 for r in matched if r.get("data_quality") == "precise")
    overall_quality = (
        "precise" if matched and precise_cnt / len(matched) > 0.5
        else "lite"
    )

    return {
        "strategy_name":    strategy["name"],
        "start_date":       start_date,
        "end_date":         end_date,
        "matched":          matched,
        "unmatched_count":  unmatched,
        "portfolio_return": portfolio_return,
        "benchmark_return": benchmark_return,
        "data_quality":     overall_quality,
    }


def _analyze(ticker, market, start_date, end_date, conditions, logic):
    try:
        t    = yf.Ticker(ticker)
        hist = t.history(start=start_date, end=end_date)
        if hist.empty or len(hist) < 2:
            return None

        start_price = float(hist.iloc[0]["Close"])
        end_price   = float(hist.iloc[-1]["Close"])
        return_pct  = round((end_price - start_price) / start_price * 100, 2)

        funds, quality = _historical_fundamentals(t, start_date, start_price)

        if not _check(funds, conditions, logic):
            return {"ticker": ticker.replace(".KS", ""), "matched": False}

        info = t.info
        return {
            "ticker":       ticker.replace(".KS", ""),
            "name":         info.get("shortName") or info.get("longName") or ticker,
            "market":       market,
            "matched":      True,
            "start_price":  round(start_price, 2),
            "end_price":    round(end_price, 2),
            "return_pct":   return_pct,
            "data_quality": quality,
            "fundamentals": {
                k: (round(v, 4) if isinstance(v, float) else v)
                for k, v in funds.items() if v is not None
            },
        }
    except Exception as exc:
        logger.debug("_analyze %s: %s", ticker, exc)
        return None


def _historical_fundamentals(t: yf.Ticker, start_date: str, start_price: float):
    """
    Returns (funds_dict, quality).
    Tries to reconstruct PER/PBR/ROE from historical annual statements.
    Falls back to current info if data is unavailable.
    """
    funds   = {}
    quality = "lite"

    try:
        start_ts = pd.Timestamp(start_date)
        fin = t.financials      # income statement  (cols = dates)
        bs  = t.balance_sheet   # balance sheet     (cols = dates)

        if (fin is not None and not fin.empty
                and bs is not None and not bs.empty):

            fin_cols = sorted(
                [c for c in fin.columns if pd.Timestamp(c) <= start_ts],
                reverse=True,
            )
            bs_cols = sorted(
                [c for c in bs.columns if pd.Timestamp(c) <= start_ts],
                reverse=True,
            )

            if fin_cols and bs_cols:
                fc, bc = fin_cols[0], bs_cols[0]

                net_income = _get_row(fin, [
                    "Net Income", "Net Income Common Stockholders",
                ], fc)
                equity = _get_row(bs, [
                    "Stockholders Equity", "Common Stock Equity",
                    "Total Stockholder Equity",
                ], bc)

                info   = t.info
                shares = (info.get("sharesOutstanding")
                          or info.get("impliedSharesOutstanding"))

                if shares and shares > 0 and start_price:
                    if net_income is not None:
                        eps = net_income / shares
                        if eps > 0:
                            funds["per"] = start_price / eps
                    if equity and equity > 0:
                        bvps = equity / shares
                        funds["pbr"] = start_price / bvps
                        if net_income is not None:
                            funds["roe"] = net_income / equity

                    if funds:
                        quality = "precise"
    except Exception as exc:
        logger.debug("historical fundamentals: %s", exc)

    # ── Fallback: current info values ─────────────────────────────────────
    try:
        info = t.info
        funds.setdefault("per",       info.get("trailingPE"))
        funds.setdefault("pbr",       info.get("priceToBook"))
        funds.setdefault("roe",       info.get("returnOnEquity"))
        funds.setdefault("div_yield", (
            info.get("trailingAnnualDividendYield")
            or info.get("dividendYield")
        ))
    except Exception:
        pass

    # ── Historical dividend yield (1-year window around start_date) ────────
    if not funds.get("div_yield") and start_price:
        try:
            start_ts = pd.Timestamp(start_date)
            divs     = t.dividends
            if not divs.empty:
                window = divs[
                    (divs.index >= start_ts - pd.DateOffset(years=1))
                    & (divs.index <= start_ts + pd.DateOffset(months=3))
                ]
                if not window.empty:
                    funds["div_yield"] = float(window.sum()) / start_price
        except Exception:
            pass

    return funds, quality


def _get_row(df: pd.DataFrame, candidates: list, col):
    """Return float value of first matching row name at given column."""
    for name in candidates:
        if name in df.index:
            try:
                v = df.loc[name, col]
                return None if pd.isna(v) else float(v)
            except Exception:
                pass
    return None


def _price_return(ticker: str, start_date: str, end_date: str):
    try:
        hist = yf.Ticker(ticker).history(start=start_date, end=end_date)
        if hist.empty or len(hist) < 2:
            return None
        s = float(hist.iloc[0]["Close"])
        e = float(hist.iloc[-1]["Close"])
        return round((e - s) / s * 100, 2)
    except Exception:
        return None


def _check(funds: dict, conditions: list, logic: str) -> bool:
    evals = []
    for c in conditions:
        fval = funds.get(c["field"])
        if fval is None:
            evals.append(None)
            continue
        op_fn = OPS.get(c["op"])
        if op_fn is None:
            evals.append(None)
            continue
        try:
            evals.append(op_fn(float(fval), float(c["value"])))
        except Exception:
            evals.append(None)

    known = [e for e in evals if e is not None]
    if not known:
        return False
    return all(known) if logic == "AND" else any(known)
