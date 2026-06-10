"use client";

import { useEffect, useRef, useState } from "react";
import { apiCandles } from "@/lib/api";
import type { Stock, Candle } from "@/lib/types";

const TFS: { k: string; label: string }[] = [
  { k: "D", label: "일" },
  { k: "W", label: "주" },
  { k: "M", label: "월" },
  { k: "Y", label: "연" },
];

function fmtP(v: number): string {
  return v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(2);
}

// 캔들스틱 + 거래량을 캔버스에 직접 렌더 (DcaModal 패턴 이식)
function drawCandles(canvas: HTMLCanvasElement, candles: Candle[]) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement?.clientWidth || 660;
  const H = 340;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const data = candles
    .filter(
      (c) => c.open != null && c.high != null && c.low != null && c.close != null,
    )
    .map((c) => ({
      date: c.date,
      open: c.open as number,
      high: c.high as number,
      low: c.low as number,
      close: c.close as number,
      volume: c.volume ?? 0,
    }));
  if (data.length < 2) return;

  const PAD = { top: 10, right: 56, bottom: 22, left: 8 };
  const volH = 46;
  const cw = W - PAD.left - PAD.right;
  const priceH = H - PAD.top - PAD.bottom - volH - 8;

  let maxP = Math.max(...data.map((c) => c.high));
  let minP = Math.min(...data.map((c) => c.low));
  const padP = (maxP - minP) * 0.05 || maxP * 0.05;
  maxP += padP;
  minP -= padP;
  const maxV = Math.max(...data.map((c) => c.volume || 0), 1);

  const n = data.length;
  const slot = cw / n;
  const bw = Math.max(1, slot * 0.6);
  const toX = (i: number) => PAD.left + slot * i + slot / 2;
  const toY = (v: number) => PAD.top + priceH - ((v - minP) / (maxP - minP)) * priceH;
  const volTop = PAD.top + priceH + 8;
  const toVY = (v: number) => volTop + volH - (v / maxV) * volH;

  // 가격 그리드 + 라벨
  ctx.strokeStyle = "#21262d";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#8b949e";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  for (let t = 0; t <= 4; t++) {
    const y = PAD.top + (priceH * t) / 4;
    const p = maxP - ((maxP - minP) * t) / 4;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cw, y);
    ctx.stroke();
    ctx.fillText(fmtP(p), PAD.left + cw + 4, y + 3);
  }

  // 캔들 + 거래량
  data.forEach((c, i) => {
    const up = c.close >= c.open;
    const col = up ? "#3fb950" : "#f85149";
    const x = toX(i);
    // 심지
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, toY(c.high));
    ctx.lineTo(x, toY(c.low));
    ctx.stroke();
    // 몸통
    const yo = toY(c.open);
    const yc = toY(c.close);
    ctx.fillStyle = col;
    ctx.fillRect(x - bw / 2, Math.min(yo, yc), bw, Math.max(1, Math.abs(yc - yo)));
    // 거래량
    ctx.fillStyle = up ? "rgba(63,185,80,.35)" : "rgba(248,81,73,.35)";
    const vy = toVY(c.volume || 0);
    ctx.fillRect(x - bw / 2, vy, bw, volTop + volH - vy);
  });

  // 날짜 라벨
  ctx.fillStyle = "#8b949e";
  ctx.textAlign = "center";
  const step = Math.max(1, Math.floor(n / 6));
  data.forEach((c, i) => {
    if (i % step === 0 || i === n - 1) ctx.fillText(c.date.slice(2), toX(i), H - 6);
  });
}

interface Props {
  stock: Stock;
  onClose: () => void;
}

export default function ChartModal({ stock, onClose }: Props) {
  const [tf, setTf] = useState("D");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    if (candles.length && canvasRef.current) drawCandles(canvasRef.current, candles);
  }, [candles]);

  useEffect(() => {
    const h = () => {
      if (candles.length && canvasRef.current) drawCandles(canvasRef.current, candles);
    };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
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

        <div style={{ position: "relative", minHeight: 340 }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "340px" }} />
        </div>
      </div>
    </div>
  );
}
