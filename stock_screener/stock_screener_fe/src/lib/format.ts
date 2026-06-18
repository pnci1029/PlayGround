// 포맷 헬퍼 — 원본 table.js 규칙을 그대로 재현.
// null/undefined 면 null 반환 → 컴포넌트가 <span class="na">—</span> 로 렌더.
import type { Market } from "./types";

function isNil(v: number | null | undefined): v is null | undefined {
  return v === null || v === undefined;
}

export function fmtNum(
  v: number | null | undefined,
  digits = 2,
  suffix = "",
): string | null {
  if (isNil(v)) return null;
  return v.toFixed(digits) + suffix;
}

// roe·성장률처럼 소수(0.15)로 저장된 비율을 "15.0%" 문자열로. null이면 null.
export function fmtPct(
  v: number | null | undefined,
  digits = 1,
): string | null {
  if (isNil(v)) return null;
  return (v * 100).toFixed(digits) + "%";
}

export function fmtCap(v: number | null | undefined): string | null {
  if (isNil(v)) return null;
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e8) return (v / 1e8).toFixed(0) + "억";
  return v.toLocaleString();
}

export function fmtPrice(
  v: number | null | undefined,
  mkt: Market,
): string | null {
  if (isNil(v)) return null;
  if (mkt === "KR") return v.toLocaleString("ko-KR") + "원";
  return (
    "$" +
    v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export interface ChangeMeta {
  text: string;
  cls: "up" | "down" | "neu";
}

export function changeMeta(v: number | null | undefined): ChangeMeta | null {
  if (isNil(v)) return null;
  const cls = v > 0.1 ? "up" : v < -0.1 ? "down" : "neu";
  const sign = v > 0 ? "+" : "";
  return { text: `${sign}${v.toFixed(2)}%`, cls };
}

export interface SparkMeta {
  pct: number;
  color: string;
}

export function sparkMeta(
  price: number | null | undefined,
  low: number | null | undefined,
  high: number | null | undefined,
): SparkMeta | null {
  if (isNil(price) || isNil(low) || isNil(high)) return null;
  const range = high - low;
  if (range <= 0) return null;
  const pct = Math.max(0, Math.min(100, ((price - low) / range) * 100));
  const color =
    pct >= 75 ? "var(--green)" : pct <= 25 ? "var(--red)" : "var(--yellow)";
  return { pct, color };
}
