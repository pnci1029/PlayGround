"use client";

import type { Strategy } from "@/lib/types";

interface Props {
  open: boolean;
  strategies: Strategy[];
  selectedStrat: string | null;
  onApplyStrategy: (id: string) => void;
  onOpenBacktest: (id: string) => void;
}

// 코스톨라니 달걀모형 6단계 (원본 index.html 하드코딩 SVG)
const PHASES = [
  { id: "kost_A", cx: 48, cy: 145, stroke: "#22c55e", label: "매집", ty1: 141, ty2: 154 },
  { id: "kost_B", cx: 48, cy: 58, stroke: "#3fb950", label: "상승", ty1: 54, ty2: 67 },
  { id: "kost_C", cx: 150, cy: 18, stroke: "#f85149", label: "과열", ty1: 14, ty2: 27 },
  { id: "kost_D", cx: 252, cy: 58, stroke: "#d29922", label: "분산", ty1: 54, ty2: 67 },
  { id: "kost_E", cx: 252, cy: 145, stroke: "#f85149", label: "하락", ty1: 141, ty2: 154 },
  { id: "kost_F", cx: 150, cy: 183, stroke: "#58a6ff", label: "공포", ty1: 179, ty2: 192 },
] as const;

const ARROWS = [
  "M68 55 Q100 22 130 19",
  "M170 19 Q200 22 232 55",
  "M265 78 Q274 100 265 125",
  "M232 148 Q200 178 170 183",
  "M130 183 Q100 178 68 148",
  "M35 125 Q26 100 35 78",
];

function StratCard({
  s,
  selected,
  onApply,
  onBacktest,
}: {
  s: Strategy;
  selected: boolean;
  onApply: () => void;
  onBacktest: () => void;
}) {
  return (
    <div
      className={`strat-card${selected ? " selected" : ""}`}
      onClick={onApply}
    >
      <div
        style={{
          width: "100%",
          height: "2px",
          background: s.color,
          borderRadius: "2px",
          marginBottom: "8px",
        }}
      />
      <div className="strat-card-name">{s.name}</div>
      <div className="strat-card-sub">{s.subtitle}</div>
      {s.investor ? (
        <div className="strat-card-investor">{s.investor}</div>
      ) : null}
      <div className="strat-card-desc">{s.description}</div>
      <div style={{ marginTop: "8px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBacktest();
          }}
          style={{
            fontSize: "10px",
            padding: "3px 8px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--muted)",
            cursor: "pointer",
          }}
        >
          백테스트
        </button>
      </div>
    </div>
  );
}

export default function StrategyPanel({
  open,
  strategies,
  selectedStrat,
  onApplyStrategy,
  onOpenBacktest,
}: Props) {
  const classic = strategies.filter((s) => s.group === "classic");
  const legendary = strategies.filter((s) => s.group === "legendary");
  const sel = selectedStrat
    ? strategies.find((s) => s.id === selectedStrat)
    : null;

  return (
    <div className={`strategy-panel${open ? " open" : ""}`} id="stratPanel">
      <div className="strat-inner">
        {/* 코스톨라니 달걀모형 */}
        <div className="kost-section">
          <div className="kost-title">코스톨라니 달걀모형</div>
          <svg width="300" height="200" viewBox="0 0 300 200">
            <ellipse
              cx="150"
              cy="100"
              rx="120"
              ry="78"
              fill="none"
              stroke="#30363d"
              strokeWidth="1.5"
            />
            {PHASES.map((p) => (
              <g
                key={p.id}
                onClick={() => onApplyStrategy(p.id)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r="20"
                  fill={selectedStrat === p.id ? "#1c2128" : "#0d1117"}
                  stroke={p.stroke}
                  strokeWidth="1.5"
                  className="phase-circle"
                />
                <text
                  x={p.cx}
                  y={p.ty1}
                  textAnchor="middle"
                  fill={p.stroke}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {p.id.slice(-1)}
                </text>
                <text
                  x={p.cx}
                  y={p.ty2}
                  textAnchor="middle"
                  fill={p.stroke}
                  fontSize="7.5"
                >
                  {p.label}
                </text>
              </g>
            ))}
            {ARROWS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="#30363d"
                strokeWidth="1.2"
                markerEnd="url(#arr)"
              />
            ))}
            <text
              x="150"
              y="88"
              textAnchor="middle"
              fill="#21262d"
              fontSize="18"
              fontWeight="900"
              fontFamily="monospace"
            >
              BULL
            </text>
            <text
              x="150"
              y="122"
              textAnchor="middle"
              fill="#21262d"
              fontSize="18"
              fontWeight="900"
              fontFamily="monospace"
            >
              BEAR
            </text>
            <defs>
              <marker
                id="arr"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L6,3 z" fill="#30363d" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* 전통 / 전설 전략 카드 */}
        <div className="classic-section">
          <div className="classic-title">전통 투자전략</div>
          <div className="classic-cards">
            {classic.map((s) => (
              <StratCard
                key={s.id}
                s={s}
                selected={selectedStrat === s.id}
                onApply={() => onApplyStrategy(s.id)}
                onBacktest={() => onOpenBacktest(s.id)}
              />
            ))}
          </div>
          <div className="classic-title" style={{ marginTop: "12px" }}>
            전설적 투자자 전략
          </div>
          <div className="classic-cards">
            {legendary.map((s) => (
              <StratCard
                key={s.id}
                s={s}
                selected={selectedStrat === s.id}
                onApply={() => onApplyStrategy(s.id)}
                onBacktest={() => onOpenBacktest(s.id)}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              lineHeight: 1.5,
              maxWidth: "600px",
              marginTop: "8px",
            }}
          >
            {sel ? (
              <>
                <strong style={{ color: "var(--text)" }}>{sel.name}</strong> —{" "}
                {sel.description}
                <br />
                <span style={{ fontFamily: "var(--mono)", color: "var(--blue)" }}>
                  {sel.conditions
                    .map((c) => `${c.field} ${c.op} ${c.value}`)
                    .join(` ${sel.logic} `)}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
