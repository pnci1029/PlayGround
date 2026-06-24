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
  CandlesResult,
} from "./types";

// 4xx/5xx 응답을 그대로 .json() 하면 에러 본문이 정상 데이터처럼 흘러간다.
// 상태 코드를 먼저 확인하고, 가능하면 백엔드의 error 메시지를 담아 throw 한다.
async function parseOrThrow<T>(r: Response): Promise<T> {
  if (!r.ok) {
    let detail = "";
    try {
      const body = await r.json();
      detail = body?.error || body?.detail || "";
    } catch {
      // JSON 이 아니면 무시
    }
    throw new Error(detail || `요청 실패 (HTTP ${r.status})`);
  }
  return r.json() as Promise<T>;
}

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  return parseOrThrow<T>(r);
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
  return parseOrThrow<T>(r);
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

// ── 차트 캔들 ─────────────────────────────────────────────────────────
export function apiCandles(
  ticker: string,
  market: string,
  tf: string,
  count?: number,
): Promise<CandlesResult> {
  const qs = new URLSearchParams({ market, tf });
  if (count) qs.set("count", String(count));
  return getJSON<CandlesResult>(`/api/candles/${encodeURIComponent(ticker)}?${qs}`);
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
