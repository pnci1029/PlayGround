"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { apiCandles } from "@/lib/api";
import type { Stock, Candle } from "@/lib/types";

const TFS: { k: string; label: string }[] = [
  { k: "D", label: "일" },
  { k: "W", label: "주" },
  { k: "M", label: "월" },
  { k: "Y", label: "연" },
];

interface Props {
  stock: Stock;
  onClose: () => void;
}

export default function ChartModal({ stock, onClose }: Props) {
  const [tf, setTf] = useState("D");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // 차트 생성 (모달 마운트 시 1회). 줌/패닝/크로스헤어/터치 핀치 모두 내장.
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b949e",
        fontSize: 11,
      },
      grid: { vertLines: { color: "#21262d" }, horzLines: { color: "#21262d" } },
      rightPriceScale: { borderColor: "#30363d" },
      timeScale: { borderColor: "#30363d" },
      crosshair: { mode: 0 }, // 자유 이동 크로스헤어
    });

    const cs = chart.addSeries(CandlestickSeries, {
      upColor: "#3fb950",
      downColor: "#f85149",
      borderVisible: false,
      wickUpColor: "#3fb950",
      wickDownColor: "#f85149",
    });
    cs.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.28 } });

    const vs = chart.addSeries(HistogramSeries, {
      priceScaleId: "", // 오버레이(거래량)
      priceFormat: { type: "volume" },
    });
    vs.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    chartRef.current = chart;
    candleSeriesRef.current = cs;
    volSeriesRef.current = vs;
    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volSeriesRef.current = null;
    };
  }, []);

  // 데이터 로드 (종목/tf 변경 시)
  useEffect(() => {
    let alive = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError("");
    /* eslint-enable react-hooks/set-state-in-effect */
    apiCandles(stock.ticker, stock.market, tf)
      .then((res) => {
        if (!alive) return;
        setLoading(false);
        if (!res || !res.candles || !res.candles.length) {
          setCandles([]);
          setError("차트 데이터가 없습니다.");
          return;
        }
        setCandles(res.candles);
      })
      .catch((e) => {
        if (!alive) return;
        setLoading(false);
        setError("네트워크 오류: " + (e as Error).message);
      });
    return () => {
      alive = false;
    };
  }, [stock.ticker, stock.market, tf]);

  // 데이터 → 시리즈 반영
  useEffect(() => {
    const cs = candleSeriesRef.current;
    const vs = volSeriesRef.current;
    const chart = chartRef.current;
    if (!cs || !vs || !chart) return;
    const data = candles.filter(
      (c) => c.open != null && c.high != null && c.low != null && c.close != null,
    );
    cs.setData(
      data.map((c) => ({
        time: c.date as Time,
        open: c.open as number,
        high: c.high as number,
        low: c.low as number,
        close: c.close as number,
      })),
    );
    vs.setData(
      data.map((c) => ({
        time: c.date as Time,
        value: c.volume ?? 0,
        color:
          (c.close as number) >= (c.open as number)
            ? "rgba(63,185,80,.4)"
            : "rgba(248,81,73,.4)",
      })),
    );
    chart.timeScale().fitContent();
  }, [candles]);

  return (
    <div
      className="dca-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dca-modal">
        <div className="dca-header">
          <h2>
            {stock.name || stock.ticker}{" "}
            <span style={{ color: "var(--muted, #8b949e)", fontSize: "13px" }}>
              {stock.ticker} · {stock.market}
            </span>
          </h2>
          <button className="dca-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, padding: "4px 0 10px" }}>
          {TFS.map((t) => (
            <button
              key={t.k}
              onClick={() => setTf(t.k)}
              style={{
                padding: "4px 14px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                border: "1px solid var(--border, #30363d)",
                background: tf === t.k ? "var(--blue, #58a6ff)" : "transparent",
                color: tf === t.k ? "#fff" : "var(--muted, #8b949e)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={`dca-loading${loading ? " visible" : ""}`}>불러오는 중…</div>
        <div className={`dca-error${error ? " visible" : ""}`}>{error}</div>

        <div
          ref={containerRef}
          style={{ width: "100%", height: "360px", touchAction: "none" }}
        />
      </div>
    </div>
  );
}
