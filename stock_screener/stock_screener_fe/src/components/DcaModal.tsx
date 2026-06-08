"use client";

import { useEffect, useRef, useState } from "react";
import { apiDCA } from "@/lib/api";
import type { DcaResult, DcaHistoryPoint } from "@/lib/types";

interface Props {
  onClose: () => void;
}

// 원본 dca.js drawDCAChart 를 그대로 이식
function drawDCAChart(
  canvas: HTMLCanvasElement,
  history: DcaHistoryPoint[],
) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement?.clientWidth || 660;
  const H = 160;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  if (!history || history.length < 2) return;

  const PAD = { top: 10, right: 16, bottom: 28, left: 16 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;
  const values = history.map((h) => h.value);
  const invested = history.map((h) => h.invested);
  const minV = Math.min(...values, ...invested) * 0.95;
  const maxV = Math.max(...values, ...invested) * 1.02;

  const toX = (i: number) => PAD.left + (i / (history.length - 1)) * cw;
  const toY = (v: number) =>
    PAD.top + ch - ((v - minV) / (maxV - minV)) * ch;

  // grid
  ctx.strokeStyle = "#21262d";
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach((t) => {
    const y = PAD.top + ch * t;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(W - PAD.right, y);
    ctx.stroke();
  });

  // invested area
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(invested[0]));
  invested.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(invested.length - 1), H - PAD.bottom);
  ctx.lineTo(toX(0), H - PAD.bottom);
  ctx.closePath();
  ctx.fillStyle = "rgba(88,166,255,.08)";
  ctx.fill();

  // invested line (dashed)
  ctx.beginPath();
  ctx.strokeStyle = "#58a6ff";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  invested.forEach((v, i) =>
    i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)),
  );
  ctx.stroke();
  ctx.setLineDash([]);

  // value area
  const lastPnl = values[values.length - 1] - invested[invested.length - 1];
  const valCol = lastPnl >= 0 ? "#3fb950" : "#f85149";
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  values.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(values.length - 1), H - PAD.bottom);
  ctx.lineTo(toX(0), H - PAD.bottom);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
  grad.addColorStop(0, lastPnl >= 0 ? "rgba(63,185,80,.25)" : "rgba(248,81,73,.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fill();

  // value line
  ctx.beginPath();
  ctx.strokeStyle = valCol;
  ctx.lineWidth = 2;
  values.forEach((v, i) =>
    i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)),
  );
  ctx.stroke();

  // x-axis labels
  ctx.fillStyle = "#8b949e";
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  const step = Math.max(1, Math.floor(history.length / 6));
  history.forEach((h, i) => {
    if (i % step === 0 || i === history.length - 1)
      ctx.fillText(h.date, toX(i), H - PAD.bottom + 12);
  });

  // legend
  ctx.textAlign = "left";
  ctx.fillStyle = "#58a6ff";
  ctx.fillRect(PAD.left, PAD.top, 10, 3);
  ctx.fillStyle = "#8b949e";
  ctx.fillText("투자금", PAD.left + 14, PAD.top + 9);
  ctx.fillStyle = valCol;
  ctx.fillRect(PAD.left + 65, PAD.top, 10, 3);
  ctx.fillStyle = "#8b949e";
  ctx.fillText("평가금", PAD.left + 79, PAD.top + 9);
}

export default function DcaModal({ onClose }: Props) {
  const [ticker, setTicker] = useState("AAPL");
  const [start, setStart] = useState("2020-01-01");
  const [amount, setAmount] = useState("100");
  const [market, setMarket] = useState("US");
  const [freq, setFreq] = useState("monthly");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DcaResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (result && canvasRef.current) {
      drawDCAChart(canvasRef.current, result.history);
    }
  }, [result]);

  async function runDCA() {
    const tk = ticker.trim().toUpperCase();
    const amt = parseFloat(amount);
    if (!tk || !start || isNaN(amt) || amt <= 0) return;

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const d = await apiDCA({ ticker: tk, start, amount: amt, market, freq });
      setLoading(false);
      if (d.error) {
        setError(d.error);
        return;
      }
      setResult(d);
    } catch (e) {
      setLoading(false);
      setError("네트워크 오류: " + (e as Error).message);
    }
  }

  const unit = market === "KR" ? "₩" : "$";
  const amt = parseFloat(amount) || 0;

  function money(v: number, fixed2 = false) {
    if (market === "KR") return `₩${v.toLocaleString()}`;
    return fixed2 ? `$${v.toFixed(2)}` : `$${v.toLocaleString()}`;
  }

  return (
    <div
      className="dca-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dca-modal">
        <div className="dca-header">
          <h2>DCA 적립식 투자 시뮬레이터</h2>
          <button className="dca-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="dca-form">
          <div className="dca-field">
            <label>티커</label>
            <input
              className="dca-input"
              value={ticker}
              placeholder="AAPL / 005930"
              onChange={(e) => setTicker(e.target.value)}
            />
          </div>
          <div className="dca-field">
            <label>시작일</label>
            <input
              className="dca-input"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="dca-field">
            <label>회당 금액</label>
            <input
              className="dca-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="dca-field">
            <label>시장</label>
            <select
              className="dca-select"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            >
              <option value="US">US (USD)</option>
              <option value="KR">KR (KRW)</option>
            </select>
          </div>
          <div className="dca-field">
            <label>주기</label>
            <select
              className="dca-select"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
            >
              <option value="monthly">월간</option>
              <option value="weekly">주간</option>
            </select>
          </div>
          <button className="dca-run-btn" onClick={runDCA}>
            시뮬레이션 실행
          </button>
        </div>

        <div className={`dca-loading${loading ? " visible" : ""}`}>계산 중…</div>
        <div className={`dca-error${error ? " visible" : ""}`}>{error}</div>

        <div className={`dca-result${result ? " visible" : ""}`}>
          {result && (
            <>
              <div className="dca-stats">
                <div className="dca-stat">
                  <div className="dca-stat-label">총 투자금</div>
                  <div
                    className="dca-stat-value"
                    style={{ color: "var(--text)" }}
                  >
                    {money(result.total_invested)}
                  </div>
                  <div className="dca-stat-sub">
                    {result.n_periods}회 × {unit}
                    {amt.toLocaleString()}
                  </div>
                </div>
                <div className="dca-stat">
                  <div className="dca-stat-label">현재 가치</div>
                  <div
                    className="dca-stat-value"
                    style={{ color: "var(--blue)" }}
                  >
                    {money(result.final_value)}
                  </div>
                  <div className="dca-stat-sub">
                    현재가 {money(result.current_price, true)}
                  </div>
                </div>
                <div className="dca-stat">
                  <div className="dca-stat-label">수익 / 손실</div>
                  <div
                    className="dca-stat-value"
                    style={{
                      color: result.profit >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {result.profit >= 0 ? "+" : ""}
                    {market === "KR"
                      ? `₩${Math.abs(result.profit).toLocaleString()}`
                      : `$${Math.abs(result.profit).toLocaleString()}`}
                  </div>
                  <div
                    className="dca-stat-sub"
                    style={{
                      color: result.profit >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {result.profit >= 0 ? "+" : ""}
                    {result.profit_pct}%
                  </div>
                </div>
                <div className="dca-stat">
                  <div className="dca-stat-label">연평균 수익률</div>
                  <div
                    className="dca-stat-value"
                    style={{
                      color: result.cagr >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {result.cagr >= 0 ? "+" : ""}
                    {result.cagr}%
                  </div>
                  <div className="dca-stat-sub">CAGR</div>
                </div>
              </div>
              <div className="dca-chart-title">
                포트폴리오 가치 추이 (최근 36기간)
              </div>
              <div style={{ position: "relative" }}>
                <canvas
                  ref={canvasRef}
                  width={660}
                  height={160}
                  style={{ width: "100%", height: "160px" }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
