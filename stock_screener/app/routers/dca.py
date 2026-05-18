from fastapi import APIRouter
import yfinance as yf

from app.fetcher.common import safe_float

router = APIRouter(prefix="/api", tags=["dca"])


@router.get("/dca")
def dca_simulate(
    ticker: str,
    start:  str,
    amount: float,
    market: str = "US",
    freq:   str = "monthly",
):
    try:
        yt       = ticker + ".KS" if market == "KR" else ticker
        interval = "1mo" if freq == "monthly" else "1wk"
        hist     = yf.Ticker(yt).history(start=start, interval=interval)

        if hist is None or hist.empty:
            return {"error": "데이터 없음 (기간이 너무 짧거나 티커 오류)"}

        shares, invested = 0.0, 0.0
        history: list[dict] = []

        for ts, row in hist.iterrows():
            price = float(row["Close"])
            if price <= 0:
                continue
            bought   = amount / price
            shares   += bought
            invested += amount
            history.append({
                "date":         ts.strftime("%Y-%m"),
                "price":        round(price, 2),
                "bought":       round(bought, 4),
                "total_shares": round(shares, 4),
                "invested":     round(invested, 0),
                "value":        round(shares * price, 0),
            })

        if not history:
            return {"error": "해당 기간 데이터 없음"}

        current_price = float(hist["Close"].iloc[-1])
        final_value   = shares * current_price
        profit        = final_value - invested
        profit_pct    = profit / invested * 100 if invested > 0 else 0
        n_periods     = len(history)
        years         = n_periods / (52 if freq == "weekly" else 12)
        cagr = ((final_value / invested) ** (1 / years) - 1) * 100 if years > 0 and invested > 0 else 0

        gains    = [(h["value"] - h["invested"]) / h["invested"] * 100 for h in history if h["invested"] > 0]
        max_gain = max(gains) if gains else 0
        min_gain = min(gains) if gains else 0

        return {
            "ticker":         ticker,
            "market":         market,
            "start":          start,
            "freq":           freq,
            "amount_per":     amount,
            "n_periods":      n_periods,
            "total_invested": round(invested, 0),
            "final_value":    round(final_value, 0),
            "profit":         round(profit, 0),
            "profit_pct":     round(profit_pct, 1),
            "cagr":           round(cagr, 1),
            "total_shares":   round(shares, 4),
            "current_price":  round(current_price, 2),
            "max_gain_pct":   round(max_gain, 1),
            "min_gain_pct":   round(min_gain, 1),
            "history":        history[-36:],
        }
    except Exception as e:
        return {"error": str(e)}
