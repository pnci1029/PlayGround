"use client";

import type { Stock } from "@/lib/types";
import {
  fmtNum,
  fmtCap,
  fmtPrice,
  changeMeta,
  sparkMeta,
} from "@/lib/format";

interface Col {
  key: string;
  label: string;
  sortable: boolean;
}

const COLS: Col[] = [
  { key: "ticker", label: "티커", sortable: true },
  { key: "name", label: "종목명", sortable: true },
  { key: "price", label: "가격", sortable: true },
  { key: "change_pct", label: "등락률", sortable: true },
  { key: "market_cap", label: "시총", sortable: true },
  { key: "per", label: "PER", sortable: true },
  { key: "pbr", label: "PBR", sortable: true },
  { key: "roe", label: "ROE%", sortable: true },
  { key: "div_yield", label: "배당%", sortable: true },
  { key: "week52_high", label: "52W H", sortable: true },
  { key: "week52_low", label: "52W L", sortable: true },
  { key: "_pos", label: "52W 위치", sortable: false },
];

const NA = <span className="na">—</span>;

function cell(v: string | null) {
  return v === null ? NA : <>{v}</>;
}

interface Props {
  rows: Stock[];
  loading: boolean;
  sortCol: string;
  sortAsc: boolean;
  onSort: (col: string) => void;
}

export default function StockTable({
  rows,
  loading,
  sortCol,
  sortAsc,
  onSort,
}: Props) {
  return (
    <div className="table-wrap" id="tableWrap">
      <table>
        <thead>
          <tr>
            {COLS.map((c) => (
              <th
                key={c.key}
                data-col={c.key}
                className={c.sortable && sortCol === c.key ? "sorted" : undefined}
                onClick={c.sortable ? () => onSort(c.key) : undefined}
                style={c.sortable ? undefined : { cursor: "default" }}
              >
                {c.label}{" "}
                {c.sortable && (
                  <span className="sort-arr">
                    {sortCol === c.key ? (sortAsc ? "▲" : "▼") : ""}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && !rows.length ? (
            <tr>
              <td colSpan={12}>
                <div className="state-box">
                  <p>
                    데이터 로딩 중…
                    <br />
                    최초 실행 시 1~2분 소요됩니다.
                  </p>
                </div>
              </td>
            </tr>
          ) : !rows.length ? (
            <tr>
              <td colSpan={12}>
                <div className="state-box">
                  <p>조건에 맞는 종목이 없습니다.</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const chg = changeMeta(r.change_pct);
              const spark = sparkMeta(r.price, r.week52_low, r.week52_high);
              return (
                <tr key={`${r.ticker}-${r.market}-${i}`}>
                  <td className="ticker-cell">
                    {r.ticker}
                    <span
                      className={`mkt-badge ${
                        r.market === "US" ? "badge-us" : "badge-kr"
                      }`}
                    >
                      {r.market}
                    </span>
                  </td>
                  <td className="name-cell" title={r.name || ""}>
                    {r.name || r.ticker}
                  </td>
                  <td>{cell(fmtPrice(r.price, r.market))}</td>
                  <td>
                    {chg === null ? (
                      NA
                    ) : (
                      <span className={chg.cls}>{chg.text}</span>
                    )}
                  </td>
                  <td>{cell(fmtCap(r.market_cap))}</td>
                  <td>{cell(fmtNum(r.per, 1))}</td>
                  <td>{cell(fmtNum(r.pbr, 2))}</td>
                  <td>
                    {r.roe == null ? NA : (r.roe * 100).toFixed(1) + "%"}
                  </td>
                  <td>
                    {r.div_yield == null
                      ? NA
                      : (r.div_yield * 100).toFixed(2) + "%"}
                  </td>
                  <td>{cell(fmtPrice(r.week52_high, r.market))}</td>
                  <td>{cell(fmtPrice(r.week52_low, r.market))}</td>
                  <td>
                    {spark === null ? (
                      NA
                    ) : (
                      <div className="bar-wrap">
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${spark.pct.toFixed(0)}%`,
                              background: spark.color,
                            }}
                          />
                        </div>
                        <span
                          style={{ color: "var(--muted)", fontSize: "10px" }}
                        >
                          {spark.pct.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
