"use client";

import type { Market } from "@/lib/types";

interface Props {
  curMkt: "ALL" | Market;
  onSetMkt: (m: "ALL" | Market) => void;
  stratPanelOpen: boolean;
  onToggleStrat: () => void;
  statusDotClass: string; // "status-dot" | "status-dot ok" | "status-dot running"
  statusText: string;
  onRefresh: () => void;
  onOpenWatchlist: () => void;
  onOpenBacktest: () => void;
  onOpenDCA: () => void;
}

const MARKETS: ("ALL" | Market)[] = ["ALL", "US", "KR"];
const MKT_LABEL: Record<string, string> = { ALL: "전체", US: "US", KR: "KR" };

export default function TopBar({
  curMkt,
  onSetMkt,
  stratPanelOpen,
  onToggleStrat,
  statusDotClass,
  statusText,
  onRefresh,
  onOpenWatchlist,
  onOpenBacktest,
  onOpenDCA,
}: Props) {
  return (
    <div className="topbar">
      <div className="logo">StockScreen</div>
      <div className="topbar-sep" />
      {MARKETS.map((m) => (
        <button
          key={m}
          className={`mkt-btn${curMkt === m ? " active" : ""}`}
          onClick={() => onSetMkt(m)}
        >
          {MKT_LABEL[m]}
        </button>
      ))}
      <div className="topbar-sep" />
      <button
        className={`tab-btn${stratPanelOpen ? " active" : ""}`}
        onClick={onToggleStrat}
      >
        투자전략
      </button>
      <div className="spacer" />
      <button className="dca-open-btn wl-open-btn" onClick={onOpenWatchlist}>
        관심종목
      </button>
      <button className="dca-open-btn" onClick={onOpenBacktest}>
        백테스트
      </button>
      <button className="dca-open-btn" onClick={onOpenDCA}>
        DCA 계산기
      </button>
      <div className={statusDotClass} />
      <div className="status-txt">{statusText}</div>
      <button className="refresh-btn" onClick={onRefresh}>
        ↻ 새로고침
      </button>
    </div>
  );
}
