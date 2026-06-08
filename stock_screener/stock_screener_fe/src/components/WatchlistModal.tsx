"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiWatchlists,
  apiCreateWatchlist,
  apiUpdateWatchlist,
  apiDeleteWatchlist,
  apiStrategyFit,
  apiWatchlistReturns,
} from "@/lib/api";
import type {
  WatchGroup,
  StrategyFitResult,
  ReturnsResult,
} from "@/lib/types";

interface Props {
  onClose: () => void;
  allTickers: string[];
}

const GROUP_LABELS: Record<string, string> = {
  kostolany: "코스톨라니",
  classic: "전통 전략",
  legendary: "전설적 투자자",
};

function yearAgo() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

export default function WatchlistModal({ onClose, allTickers }: Props) {
  const [groups, setGroups] = useState<WatchGroup[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mode, setMode] = useState<"fit" | "returns">("fit");
  const [tickerInput, setTickerInput] = useState("");

  const [fit, setFit] = useState<StrategyFitResult | null>(null);
  const [fitState, setFitState] = useState<"" | "loading">("");
  const [returns, setReturns] = useState<ReturnsResult | null>(null);
  const [returnsState, setReturnsState] = useState<"" | "loading">("");
  const [returnStart, setReturnStart] = useState(yearAgo());

  const clearAnalysis = useCallback(() => {
    setFit(null);
    setReturns(null);
  }, []);

  const loadGroups = useCallback(async (keepActive?: number | null) => {
    const list = await apiWatchlists();
    setGroups(list);
    setActiveId((prev) => {
      const want = keepActive !== undefined ? keepActive : prev;
      if (want && list.find((g) => g.id === want)) return want;
      return list.length ? list[0].id : null;
    });
  }, []);

  // 마운트(열림) 시 그룹 로드 (비동기 fetch → setState). effect의 정당한 용도.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGroups();
  }, [loadGroups]);

  const active = groups.find((g) => g.id === activeId) || null;

  function selectGroup(id: number) {
    setActiveId(id);
    clearAnalysis();
  }

  async function createGroup() {
    const name = window.prompt("새 그룹 이름을 입력하세요:", "새 관심목록");
    if (!name || !name.trim()) return;
    const data = await apiCreateWatchlist(name.trim(), []);
    clearAnalysis();
    await loadGroups(data.id);
  }

  async function renameGroup(id: number, name: string) {
    if (!name.trim()) return;
    await apiUpdateWatchlist(id, { name: name.trim() });
    await loadGroups(id);
  }

  async function deleteGroup(id: number) {
    if (!window.confirm("이 그룹을 삭제하시겠습니까?")) return;
    await apiDeleteWatchlist(id);
    clearAnalysis();
    await loadGroups(null);
  }

  async function addTicker() {
    if (!active) return;
    const t = tickerInput.trim().toUpperCase();
    if (!t) return;
    if (active.tickers.includes(t)) {
      setTickerInput("");
      return;
    }
    await apiUpdateWatchlist(active.id, { tickers: [...active.tickers, t] });
    setTickerInput("");
    clearAnalysis();
    await loadGroups(active.id);
  }

  async function removeTicker(t: string) {
    if (!active) return;
    await apiUpdateWatchlist(active.id, {
      tickers: active.tickers.filter((x) => x !== t),
    });
    clearAnalysis();
    await loadGroups(active.id);
  }

  function switchMode(m: "fit" | "returns") {
    setMode(m);
    clearAnalysis();
  }

  async function runFit() {
    if (!active) return;
    setFit(null);
    setFitState("loading");
    try {
      const data = await apiStrategyFit(active.id);
      setFit(data);
    } finally {
      setFitState("");
    }
  }

  async function runReturns() {
    if (!active || !returnStart) return;
    setReturns(null);
    setReturnsState("loading");
    try {
      const data = await apiWatchlistReturns(active.id, returnStart);
      setReturns(data);
    } finally {
      setReturnsState("");
    }
  }

  return (
    <div
      className="wl-overlay"
      style={{ display: "flex" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="wl-modal">
        <div className="wl-modal-header">
          <h2>관심종목 그룹</h2>
          <button className="wl-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="wl-layout">
          {/* 사이드바 */}
          <div className="wl-sidebar">
            <button className="wl-new-group-btn" onClick={createGroup}>
              + 새 그룹
            </button>
            <div className="wl-group-list">
              {groups.map((g) => (
                <button
                  key={g.id}
                  className={`wl-group-btn${g.id === activeId ? " active" : ""}`}
                  onClick={() => selectGroup(g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* 상세 */}
          <div className="wl-detail">
            {!active ? (
              <div className="wl-empty">
                <p>관심종목 그룹을 만들어보세요</p>
                <button className="wl-new-btn" onClick={createGroup}>
                  + 새 그룹 만들기
                </button>
              </div>
            ) : (
              <>
                <div className="wl-detail-header">
                  <input
                    key={active.id}
                    className="wl-name-input"
                    defaultValue={active.name}
                    onBlur={(e) => renameGroup(active.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        (e.target as HTMLInputElement).blur();
                    }}
                  />
                  <button
                    className="wl-del-btn"
                    onClick={() => deleteGroup(active.id)}
                    title="그룹 삭제"
                  >
                    🗑
                  </button>
                </div>

                <div className="wl-ticker-section">
                  <div className="wl-add-row">
                    <input
                      className="wl-add-input"
                      placeholder="티커 입력 (예: AAPL, 005930)"
                      list="wlTickerList"
                      value={tickerInput}
                      onChange={(e) => setTickerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTicker();
                      }}
                    />
                    <datalist id="wlTickerList">
                      {allTickers.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                    <button className="wl-add-ticker-btn" onClick={addTicker}>
                      + 추가
                    </button>
                  </div>
                  <div className="wl-chips">
                    {active.tickers.map((t) => (
                      <span className="wl-chip" key={t}>
                        {t}
                        <button
                          className="wl-chip-del"
                          onClick={() => removeTicker(t)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {active.tickers.length === 0 && (
                      <span className="wl-chips-empty">종목을 추가하세요</span>
                    )}
                  </div>
                </div>

                <div className="wl-analysis-tabs">
                  <button
                    className={`wl-tab-btn${mode === "fit" ? " active" : ""}`}
                    onClick={() => switchMode("fit")}
                  >
                    전략 적합성
                  </button>
                  <button
                    className={`wl-tab-btn${mode === "returns" ? " active" : ""}`}
                    onClick={() => switchMode("returns")}
                  >
                    수익률 분석
                  </button>
                </div>

                <div>
                  {mode === "fit" ? (
                    <>
                      <button className="wl-run-analysis-btn" onClick={runFit}>
                        분석 실행
                      </button>
                      <div>
                        {fitState === "loading" && (
                          <div className="wl-loading">분석 중…</div>
                        )}
                        {fit && <FitResult data={fit} />}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="wl-returns-form">
                        <label>기준 시작일</label>
                        <input
                          type="date"
                          value={returnStart}
                          onChange={(e) => setReturnStart(e.target.value)}
                        />
                        <button
                          className="wl-run-analysis-btn"
                          onClick={runReturns}
                        >
                          수익률 계산
                        </button>
                      </div>
                      <div>
                        {returnsState === "loading" && (
                          <div className="wl-loading">
                            수익률 계산 중… (30~60초 소요)
                          </div>
                        )}
                        {returns && <ReturnsResultView data={returns} />}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FitResult({ data }: { data: StrategyFitResult }) {
  if (data.error) return <div className="wl-error">{data.error}</div>;
  if (!data.tickers || data.tickers.length === 0)
    return <div className="wl-info">종목을 먼저 추가하세요.</div>;

  const groups: Record<string, { id: string; name: string; group: string }[]> = {
    kostolany: data.strategies.filter((s) => s.group === "kostolany"),
    classic: data.strategies.filter((s) => s.group === "classic"),
    legendary: data.strategies.filter((s) => s.group === "legendary"),
  };

  return (
    <div className="wl-fit-wrap">
      {Object.entries(groups).map(([gkey, strats]) =>
        strats.length ? (
          <div className="wl-fit-group" key={gkey}>
            <div className="wl-fit-group-label">{GROUP_LABELS[gkey]}</div>
            <table className="wl-fit-table">
              <thead>
                <tr>
                  <th className="wl-fit-th-ticker">종목</th>
                  {strats.map((s) => (
                    <th className="wl-fit-th-strat" title={s.name} key={s.id}>
                      {s.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.tickers.map((t) => {
                  const info = data.ticker_info[t] || {};
                  return (
                    <tr key={t}>
                      <td className="wl-fit-ticker">
                        <span className={`wl-mkt-badge ${info.market || "?"}`}>
                          {info.market || "?"}
                        </span>
                        <span className="wl-ticker-name">{t}</span>
                        <span className="wl-ticker-fullname">
                          {info.name || ""}
                        </span>
                      </td>
                      {strats.map((s) => {
                        const v = data.matrix[t]?.[s.id];
                        if (v === null || v === undefined)
                          return (
                            <td className="wl-fit-na" key={s.id}>
                              -
                            </td>
                          );
                        return v ? (
                          <td className="wl-fit-yes" key={s.id}>
                            ✓
                          </td>
                        ) : (
                          <td className="wl-fit-no" key={s.id}>
                            ✗
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null,
      )}

      <div className="wl-fit-summary">
        <div className="wl-fit-group-label">전략 적합 요약</div>
        {data.tickers.map((t) => {
          const matched = data.strategies.filter(
            (s) => data.matrix[t]?.[s.id] === true,
          );
          return (
            <div className="wl-fit-summary-row" key={t}>
              <strong>{t}</strong>
              {matched.length > 0 ? (
                matched.map((s) => (
                  <span className="wl-fit-badge" key={s.id}>
                    {s.name}
                  </span>
                ))
              ) : (
                <span className="wl-fit-none">해당 전략 없음</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReturnsResultView({ data }: { data: ReturnsResult }) {
  if (data.error) return <div className="wl-error">{data.error}</div>;
  const results = data.results || [];
  if (!results.length)
    return <div className="wl-info">종목을 먼저 추가하세요.</div>;

  const valid = results.filter((r) => r.return_pct !== null);
  const avgRet = valid.length
    ? (
        valid.reduce((s, r) => s + (r.return_pct as number), 0) / valid.length
      ).toFixed(1)
    : null;

  return (
    <>
      <div className="wl-ret-meta">
        <span>
          {data.start_date} → {data.end_date}
        </span>
        {avgRet !== null && (
          <span className={`wl-ret-avg ${+avgRet >= 0 ? "pos" : "neg"}`}>
            그룹 평균 {+avgRet > 0 ? "+" : ""}
            {avgRet}%
          </span>
        )}
      </div>
      <table className="wl-ret-table">
        <thead>
          <tr>
            <th>종목</th>
            <th>이름</th>
            <th>매수가</th>
            <th>현재가</th>
            <th>수익률</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={`${r.ticker}-${i}`}>
              <td className="wl-ret-ticker">{r.ticker}</td>
              <td className="wl-ret-name">{r.name || ""}</td>
              <td>
                {r.start_price !== null ? r.start_price.toLocaleString() : "-"}
              </td>
              <td>
                {r.end_price !== null ? r.end_price.toLocaleString() : "-"}
              </td>
              <td
                className={
                  r.return_pct === null ? "" : r.return_pct >= 0 ? "pos" : "neg"
                }
              >
                {r.return_pct !== null
                  ? (r.return_pct > 0 ? "+" : "") + r.return_pct + "%"
                  : r.error || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
