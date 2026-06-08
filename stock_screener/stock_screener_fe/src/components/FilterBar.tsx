"use client";

import type { Op } from "@/lib/types";
import { FIELDS, OPS } from "@/lib/constants";

export interface CondRow {
  id: number;
  field: string;
  op: Op;
  value: string;
}

interface Props {
  conditions: CondRow[];
  logic: "AND" | "OR";
  resultCount: number | null;
  onAddCond: () => void;
  onDelCond: (id: number) => void;
  onUpdateCond: (id: number, patch: Partial<Omit<CondRow, "id">>) => void;
  onToggleLogic: () => void;
  onRunScreen: () => void;
  onReset: () => void;
}

export default function FilterBar({
  conditions,
  logic,
  resultCount,
  onAddCond,
  onDelCond,
  onUpdateCond,
  onToggleLogic,
  onRunScreen,
  onReset,
}: Props) {
  return (
    <div className="filterbar" id="filterbar">
      <div className="filter-label">FILTER</div>
      <div
        id="condList"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
        }}
      >
        {conditions.map((c) => (
          <div className="cond-row" key={c.id}>
            <select
              className="cond-sel"
              value={c.field}
              onChange={(e) => onUpdateCond(c.id, { field: e.target.value })}
            >
              {FIELDS.map((f) => (
                <option key={f.v} value={f.v}>
                  {f.l}
                </option>
              ))}
            </select>
            <select
              className="cond-op"
              value={c.op}
              onChange={(e) =>
                onUpdateCond(c.id, { op: e.target.value as Op })
              }
            >
              {OPS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <input
              className="cond-val"
              type="number"
              value={c.value}
              placeholder="값"
              onChange={(e) => onUpdateCond(c.id, { value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRunScreen();
              }}
            />
            <button className="cond-del" onClick={() => onDelCond(c.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        className={`logic-toggle ${logic.toLowerCase()}`}
        onClick={onToggleLogic}
      >
        {logic}
      </button>
      <button className="add-cond" onClick={onAddCond}>
        + 조건 추가
      </button>
      <button className="run-btn" onClick={onRunScreen}>
        스크린
      </button>
      <button className="reset-btn" onClick={onReset}>
        초기화
      </button>
      <div className="spacer" />
      <div className="result-count">
        {resultCount !== null && resultCount > 0 ? (
          <>
            <span>{resultCount}</span>개 종목
          </>
        ) : null}
      </div>
    </div>
  );
}
