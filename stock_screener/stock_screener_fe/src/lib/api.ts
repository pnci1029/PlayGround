// API 클라이언트 — 모든 호출은 상대경로 /api/* (next.config rewrite가 백엔드로 프록시)
import type {
  Stock,
  Condition,
  Strategy,
  StatusResult,
  DcaResult,
  BacktestResult,
  WatchGroup,
  StrategyFitResult,
  ReturnsResult,
} from "./types";

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  return r.json();
}

async function sendJSON<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

// ── 종목 ──────────────────────────────────────────────────────────────
export function apiStocks(opts: {
  market?: string;
  sort?: string;
  order?: string;
  limit?: number;
} = {}): Promise<Stock[]> {
  const { market, sort = "market_cap", order = "desc", limit = 200 } = opts;
  const qs = new URLSearchParams({ sort, order, limit: String(limit) });
  if (market) qs.set("market", market);
  return getJSON<Stock[]>(`/api/stocks?${qs}`);
}

export function apiScreen(opts: {
  conditions: Condition[];
  logic: string;
  market?: string | null;
  sort: string;
  order: string;
}): Promise<Stock[]> {
  return sendJSON<Stock[]>("/api/screen", "POST", {
    conditions: opts.conditions,
    logic: opts.logic,
    market: opts.market || null,
    sort: opts.sort,
    order: opts.order,
  });
}

export function apiRefresh(): Promise<unknown> {
  return getJSON("/api/refresh");
}

export function apiStatus(): Promise<StatusResult> {
  return getJSON<StatusResult>("/api/status");
}

export function apiStrategies(): Promise<Strategy[]> {
  return getJSON<Strategy[]>("/api/strategies");
}

export function apiDCA(opts: {
  ticker: string;
  start: string;
  amount: number;
  market: string;
  freq: string;
}): Promise<DcaResult> {
  const qs = new URLSearchParams({
    ticker: opts.ticker,
    start: opts.start,
    amount: String(opts.amount),
    market: opts.market,
    freq: opts.freq,
  });
  return getJSON<DcaResult>(`/api/dca?${qs}`);
}

export function apiBacktest(opts: {
  strategy_id: string;
  start_date: string;
  end_date: string;
  market: string;
}): Promise<BacktestResult> {
  return sendJSON<BacktestResult>("/api/backtest", "POST", opts);
}

// ── 관심종목 ──────────────────────────────────────────────────────────
export function apiWatchlists(): Promise<WatchGroup[]> {
  return getJSON<WatchGroup[]>("/api/watchlists");
}

export function apiCreateWatchlist(name: string, tickers: string[] = []): Promise<{ id: number }> {
  return sendJSON<{ id: number }>("/api/watchlists", "POST", { name, tickers });
}

export function apiUpdateWatchlist(
  id: number,
  patch: { name?: string; tickers?: string[] },
): Promise<unknown> {
  return sendJSON(`/api/watchlists/${id}`, "PUT", patch);
}

export function apiDeleteWatchlist(id: number): Promise<unknown> {
  return sendJSON(`/api/watchlists/${id}`, "DELETE");
}

export function apiStrategyFit(id: number): Promise<StrategyFitResult> {
  return getJSON<StrategyFitResult>(`/api/watchlists/${id}/strategy-fit`);
}

export function apiWatchlistReturns(id: number, startDate: string): Promise<ReturnsResult> {
  return sendJSON<ReturnsResult>(`/api/watchlists/${id}/returns`, "POST", {
    start_date: startDate,
  });
}
