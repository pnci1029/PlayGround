"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { fmtPrice, fmtCap, changeMeta } from "@/lib/format";
import type { Stock, Candle, Market } from "@/lib/types";

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

interface Legend {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  changePct: number | null; // 직전 봉 종가 대비 등락률
}

// data[i] 봉의 레전드 정보. 등락률은 직전 봉 종가 기준(첫 봉은 시가 기준).
function buildLegend(data: Candle[], i: number): Legend | null {
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

export default function ChartModal({ stock, onClose }: Props) {
  const [tf, setTf] = useState("D");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 크로스헤어가 가리키는 봉의 레전드. null이면 기본값(최신 봉)을 보여준다.
  const [hoverLegend, setHoverLegend] = useState<Legend | null>(null);

  // 모달 열려있는 동안 배경(테이블) 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ESC 키로 닫기 (닫기 버튼 보완). 모바일엔 영향 없음.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  // 크로스헤어 핸들러가 시간으로 봉을 찾기 위한 최신 필터링 데이터 참조
  const dataRef = useRef<Candle[]>([]);

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
      timeScale: { borderColor: "#30363d", fixRightEdge: true, rightOffset: 0 },
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

    // 봉 위 호버/터치-드래그 시 해당 봉 레전드로 갱신. 벗어나면 기본(최신봉)으로.
    chart.subscribeCrosshairMove((param) => {
      const d = dataRef.current;
      if (!d.length) return;
      if (param.time == null) {
        setHoverLegend(null);
        return;
      }
      const t = String(param.time);
      const i = d.findIndex((x) => String(x.date) === t);
      setHoverLegend(i >= 0 ? buildLegend(d, i) : null);
    });

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
    setHoverLegend(null); // 이전 종목/기간의 호버 잔상 제거
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

  // 유효 봉만 추린 데이터 (시리즈/레전드/크로스헤어 공통 소스)
  const data = useMemo(
    () =>
      candles.filter(
        (c) =>
          c.open != null && c.high != null && c.low != null && c.close != null,
      ),
    [candles],
  );

  // 기본 레전드 = 최신 봉. 호버 중이면 그 봉이 우선.
  const defaultLegend = useMemo(
    () => (data.length ? buildLegend(data, data.length - 1) : null),
    [data],
  );
  const legend = hoverLegend ?? defaultLegend;

  // 데이터 → 시리즈 반영
  useEffect(() => {
    const cs = candleSeriesRef.current;
    const vs = volSeriesRef.current;
    const chart = chartRef.current;
    if (!cs || !vs || !chart) return;
    dataRef.current = data;
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
  }, [data]);

  return (
    <div className="dca-overlay open">
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

        {legend && <ChartLegend legend={legend} market={stock.market} />}

        <div
          ref={containerRef}
          style={{ width: "100%", height: "360px", touchAction: "none" }}
        />
      </div>
    </div>
  );
}

// 차트 상단 OHLC 레전드. PC는 호버, 모바일은 터치-드래그로 갱신되며
// 기본값은 최신 봉이라 입력 없이도 항상 값이 보인다.
function ChartLegend({ legend, market }: { legend: Legend; market: Market }) {
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
