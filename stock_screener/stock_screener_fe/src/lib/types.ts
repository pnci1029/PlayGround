// 도메인 타입 — 백엔드 응답 형태 (원본 사용처에서 역산)

export type Market = "US" | "KR";
export type Op = "<" | "<=" | ">" | ">=" | "=";
export type StrategyGroup = "kostolany" | "classic" | "legendary";

export interface Stock {
  ticker: string;
  name: string;
  market: Market;
  price: number | null;
  change_pct: number | null;
  market_cap: number | null;
  per: number | null;
  pbr: number | null;
  roe: number | null; // 소수 (0.10 = 10%)
  eps: number | null;
  div_yield: number | null; // 소수
  volume: number | null;
  week52_high: number | null;
  week52_low: number | null;
}

export interface Candle {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface CandlesResult {
  ticker: string;
  market: Market;
  tf: string;
  candles: Candle[];
}

export interface Condition {
  field: string;
  op: Op;
  value: number;
}

export interface Strategy {
  id: string;
  name: string;
  subtitle: string;
  investor?: string;
  description: string;
  color: string;
  group: StrategyGroup;
  conditions: Condition[];
  logic: "AND" | "OR";
}

export interface StatusResult {
  refresh_running?: boolean;
  counts?: { US?: number; KR?: number };
}

export interface DcaHistoryPoint {
  date: string;
  value: number;
  invested: number;
}

export interface DcaResult {
  error?: string;
  current_price: number;
  total_invested: number;
  final_value: number;
  profit: number;
  profit_pct: number;
  cagr: number;
  n_periods: number;
  history: DcaHistoryPoint[];
}

export interface BacktestMatch {
  ticker: string;
  name: string;
  return_pct: number | null;
  data_quality: "precise" | "lite";
  fundamentals?: Record<string, number | string>;
}

export interface BacktestResult {
  error?: string;
  strategy_name: string;
  data_quality: "precise" | "lite";
  start_date: string;
  end_date: string;
  portfolio_return: number | null;
  benchmark_return: number | null;
  unmatched_count?: number;
  matched: BacktestMatch[];
}

export interface WatchGroup {
  id: number;
  name: string;
  tickers: string[];
}

export interface StrategyFitResult {
  error?: string;
  tickers: string[];
  strategies: { id: string; name: string; group: string }[];
  ticker_info: Record<string, { market?: Market; name?: string }>;
  matrix: Record<string, Record<string, boolean | null>>;
}

export interface ReturnsRow {
  ticker: string;
  name?: string;
  start_price: number | null;
  end_price: number | null;
  return_pct: number | null;
  error?: string;
}

export interface ReturnsResult {
  error?: string;
  start_date: string;
  end_date: string;
  results: ReturnsRow[];
}
