import { fmtCap, fmtPrice, changeMeta } from "@/lib/format";
import type { Candle, Market } from "@/lib/types";

export interface Legend {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  changePct: number | null; // 직전 봉 종가 대비 등락률
}

// data[i] 봉의 레전드 정보. 등락률은 직전 봉 종가 기준(첫 봉은 시가 기준).
export function buildLegend(data: Candle[], i: number): Legend | null {
  const c = data[i];
  if (!c) return null;
  const prev = i > 0 ? data[i - 1].close : c.open;
  const changePct =
    prev != null && prev !== 0 && c.close != null
      ? ((c.close - prev) / prev) * 100
      : null;
  return {
    date: c.date,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume,
    changePct,
  };
}

// 차트 상단 OHLC 레전드. PC는 호버, 모바일은 터치-드래그로 갱신되며
// 기본값은 최신 봉이라 입력 없이도 항상 값이 보인다.
export default function ChartLegend({
  legend,
  market,
}: {
  legend: Legend;
  market: Market;
}) {
  const chg = changeMeta(legend.changePct);
  const chgColor =
    chg?.cls === "up"
      ? "var(--green)"
      : chg?.cls === "down"
        ? "var(--red)"
        : "var(--muted)";
  const price = (v: number | null) => fmtPrice(v, market) ?? "—";
  return (
    <div className="chart-legend">
      <span className="cl-date">{legend.date}</span>
      <span className="cl-item">
        시 <b>{price(legend.open)}</b>
      </span>
      <span className="cl-item">
        고 <b style={{ color: "var(--green)" }}>{price(legend.high)}</b>
      </span>
      <span className="cl-item">
        저 <b style={{ color: "var(--red)" }}>{price(legend.low)}</b>
      </span>
      <span className="cl-item">
        종 <b style={{ color: chgColor }}>{price(legend.close)}</b>
      </span>
      <span className="cl-item">
        거래량 <b>{fmtCap(legend.volume) ?? "—"}</b>
      </span>
      {chg && (
        <span className="cl-chg" style={{ color: chgColor }}>
          {chg.text}
        </span>
      )}
    </div>
  );
}
