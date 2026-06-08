import type { Op } from "./types";

// 필터 가능 필드 (원본 state.js FIELDS)
export const FIELDS: { v: string; l: string }[] = [
  { v: "price", l: "가격" },
  { v: "change_pct", l: "등락률 %" },
  { v: "market_cap", l: "시가총액" },
  { v: "per", l: "PER" },
  { v: "pbr", l: "PBR" },
  { v: "roe", l: "ROE %" },
  { v: "eps", l: "EPS" },
  { v: "div_yield", l: "배당수익률" },
  { v: "week52_high", l: "52W 고가" },
  { v: "week52_low", l: "52W 저가" },
  { v: "volume", l: "거래량" },
];

export const OPS: Op[] = ["<", "<=", ">", ">=", "="];
