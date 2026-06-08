"use client";

import { useState } from "react";
import { apiBacktest } from "@/lib/api";
import type { Strategy, BacktestResult } from "@/lib/types";

interface Props {
  onClose: () => void;
  strategies: Strategy[];
  preselect: string | null;
}

const GROUP_LABELS: Record<string, string> = {
  kostolany: "코스톨라니",
  classic: "전통 전략",
  legendary: "전설적 투자자",
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtPct(v: number | null): string {
  return v == null ? "N/A" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}
function colPct(v: number | null): string {
  return v == null ? "" : v >= 0 ? "var(--green)" : "var(--red)";
}

export default function BacktestModal({
  onClose,
  strategies,
  preselect,
}: Props) {
  // 모달은 열릴 때만 마운트되므로 초기값으로 기본 세팅 (3년 전 → 오늘)
  const [stratId, setStratId] = useState(preselect || "");
  const [start, setStart] = useState(() => {
    const y3 = new Date();
    y3.setFullYear(y3.getFullYear() - 3);
    return ymd(y3);
  });
  const [end, setEnd] = useState(() => ymd(new Date()));
  const [market, setMarket] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BacktestResult | null>(null);

  // 전략 그룹별 분류 (select optgroup)
  const grouped: Record<string, Strategy[]> = {};
  strategies.forEach((s) => {
    const g = s.group || "classic";
    (grouped[g] = grouped[g] || []).push(s);
  });

  async function runBacktest() {
    if (!stratId || !start || !end) {
      setError("전략, 시작일, 종료일을 모두 선택하세요.");
      return;
    }
    if (new Date(start) >= new Date(end)) {
      setError("시작일은 종료일보다 이전이어야 합니다.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await apiBacktest({
        strategy_id: stratId,
        start_date: start,
        end_date: end,
        market,
      });
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError((e as Error).message || "백테스트 실행 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const alpha =
    result && result.portfolio_return != null && result.benchmark_return != null
      ? +(result.portfolio_return - result.benchmark_return).toFixed(2)
      : null;

  return (
    <div
      className="bt-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bt-modal">
        <div className="bt-header">
          <h2>전략 백테스트</h2>
          <button className="bt-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="bt-form">
          <div className="bt-field">
            <label>투자 전략</label>
            <select
              className="bt-select"
              value={stratId}
              onChange={(e) => setStratId(e.target.value)}
            >
              <option value="">전략 선택…</option>
              {Object.entries(grouped).map(([g, list]) => (
                <optgroup key={g} label={GROUP_LABELS[g] || g}>
                  {list.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="bt-field">
            <label>시작일</label>
            <input
              className="bt-input"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="bt-field">
            <label>종료일</label>
            <input
              className="bt-input"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div className="bt-field">
            <label>시장</label>
            <select
              className="bt-select"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            >
              <option value="ALL">전체</option>
              <option value="US">US</option>
              <option value="KR">KR</option>
            </select>
          </div>
          <button
            className="bt-run-btn"
            onClick={runBacktest}
            style={{ gridColumn: "span 4" }}
          >
            백테스트 실행 ▶
          </button>
        </div>

        <div className={`bt-loading${loading ? " visible" : ""}`}>
          분석 중… 종목 수에 따라 30~90초 소요됩니다.
        </div>
        <div className={`bt-error${error ? " visible" : ""}`}>{error}</div>

        <div className={`bt-result${result ? " visible" : ""}`}>
          {result && (
            <div id="btResultBody">
              <div className="bt-result-hdr">
                <span className="bt-result-title">{result.strategy_name}</span>
                {result.data_quality === "precise" ? (
                  <span className="bt-quality-badge precise">정밀모드</span>
                ) : (
                  <span className="bt-quality-badge lite">라이트모드</span>
                )}
                <span className="bt-result-period">
                  {result.start_date} → {result.end_date}
                </span>
              </div>
              <div className="bt-stats">
                <div className="bt-stat">
                  <div className="bt-stat-lbl">전략 수익률</div>
                  <div
                    className="bt-stat-val"
                    style={{ color: colPct(result.portfolio_return) }}
                  >
                    {fmtPct(result.portfolio_return)}
                  </div>
                  <div className="bt-stat-sub">
                    {result.matched.length}종목 등가중 평균
                  </div>
                </div>
                <div className="bt-stat">
                  <div className="bt-stat-lbl">벤치마크(SPY)</div>
                  <div
                    className="bt-stat-val"
                    style={{ color: colPct(result.benchmark_return) }}
                  >
                    {fmtPct(result.benchmark_return)}
                  </div>
                  <div className="bt-stat-sub">같은 기간 기준</div>
                </div>
                <div className="bt-stat">
                  <div className="bt-stat-lbl">초과수익 α</div>
                  <div
                    className="bt-stat-val"
                    style={{ color: colPct(alpha) }}
                  >
                    {alpha != null ? fmtPct(alpha) : "N/A"}
                  </div>
                  <div className="bt-stat-sub">전략 − 벤치마크</div>
                </div>
                <div className="bt-stat">
                  <div className="bt-stat-lbl">편입 종목</div>
                  <div className="bt-stat-val" style={{ color: "var(--blue)" }}>
                    {result.matched.length}
                  </div>
                  <div className="bt-stat-sub">
                    총 {result.matched.length + (result.unmatched_count || 0)}개
                    분석
                  </div>
                </div>
              </div>

              {result.matched.length ? (
                <>
                  <div className="bt-ticker-title">편입 종목 상세</div>
                  <div className="bt-ticker-list">
                    {result.matched.map((r, i) => {
                      const fundsStr = Object.entries(r.fundamentals || {})
                        .map(
                          ([k, v]) =>
                            `${k.toUpperCase()}=${
                              typeof v === "number" ? v.toFixed(2) : v
                            }`,
                        )
                        .join("  ");
                      return (
                        <div className="bt-ticker-row" key={`${r.ticker}-${i}`}>
                          <div className="bt-ticker-left">
                            <span
                              className={`bt-dot ${
                                r.data_quality === "precise" ? "precise" : "lite"
                              }`}
                              title={
                                r.data_quality === "precise"
                                  ? "과거 재무데이터 사용"
                                  : "현재 지표 기준 선별"
                              }
                            />
                            <span className="bt-ticker">{r.ticker}</span>
                            <span className="bt-tname">{r.name}</span>
                          </div>
                          <div className="bt-ticker-right">
                            {fundsStr ? (
                              <span className="bt-funds">{fundsStr}</span>
                            ) : null}
                            <span
                              className="bt-ret"
                              style={{ color: colPct(r.return_pct) }}
                            >
                              {fmtPct(r.return_pct)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="bt-empty">
                  해당 기간에 조건에 맞는 종목이 없었습니다
                </div>
              )}

              {result.data_quality === "lite" && (
                <div className="bt-note">
                  라이트모드: 과거 재무제표 데이터가 부족해 현재 지표 기준으로
                  종목을 선별했습니다. 실제 당시 수치와 다를 수 있으니 참고용으로만
                  활용하세요.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
