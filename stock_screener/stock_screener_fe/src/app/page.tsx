"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Market, Stock, Strategy } from "@/lib/types";
import {
  apiStocks,
  apiScreen,
  apiStatus,
  apiStrategies,
  apiRefresh,
} from "@/lib/api";
import TopBar from "@/components/TopBar";
import FilterBar, { type CondRow } from "@/components/FilterBar";
import StrategyPanel from "@/components/StrategyPanel";
import StockTable from "@/components/StockTable";
import DcaModal from "@/components/DcaModal";
import BacktestModal from "@/components/BacktestModal";
import WatchlistModal from "@/components/WatchlistModal";
import ChartModal from "@/components/ChartModal";

// 조건 행 → API 페이로드. 값이 비었거나 숫자가 아닌 행은 버린다.
function parseConds(rows: CondRow[]) {
  return rows.reduce<{ field: string; op: CondRow["op"]; value: number }[]>(
    (acc, c) => {
      const val = parseFloat(c.value);
      if (c.field && c.op && !isNaN(val))
        acc.push({ field: c.field, op: c.op, value: val });
      return acc;
    },
    [],
  );
}

export default function Home() {
  // ── 상태 ────────────────────────────────────────────────────────────
  const [allRows, setAllRows] = useState<Stock[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [curMkt, setCurMkt] = useState<"ALL" | Market>("KR");
  const [sortCol, setSortCol] = useState("market_cap");
  const [sortAsc, setSortAsc] = useState(false);
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [screening, setScreening] = useState(false);
  const [conditions, setConditions] = useState<CondRow[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrat, setSelectedStrat] = useState<string | null>(null);
  const [stratPanelOpen, setStratPanelOpen] = useState(false);

  const [statusDot, setStatusDot] = useState("status-dot");
  const [statusText, setStatusText] = useState("연결 중…");

  const [dcaOpen, setDcaOpen] = useState(false);
  const [btOpen, setBtOpen] = useState(false);
  const [btPreselect, setBtPreselect] = useState<string | null>(null);
  const [wlOpen, setWlOpen] = useState(false);
  const [chartStock, setChartStock] = useState<Stock | null>(null);
  const [query, setQuery] = useState("");
  // 입력은 즉시 반영하되, 무거운 목록 필터링은 지연시켜 타이핑 끊김 방지
  const deferredQuery = useDeferredValue(query);
  const [fetching, setFetching] = useState(false); // 조회/스크리닝 진행 중 스피너용

  // 조건 행 id 카운터 (렌더와 무관한 단순 증가값)
  const condIdRef = useRef(0);

  // 폴링(장기 실행 인터벌)에서 최신 allRows 길이만 읽기 위한 ref.
  // 이벤트 핸들러는 ref가 아니라 상태/인자를 직접 사용한다.
  const allRowsRef = useRef(allRows);
  useEffect(() => {
    allRowsRef.current = allRows;
  }, [allRows]);

  // ── 데이터 로드 ────────────────────────────────────────────────────
  const loadAll = useCallback(
    async (mkt: "ALL" | Market = curMkt) => {
      setFetching(true);
      try {
        const rows = await apiStocks({
          market: mkt === "ALL" ? undefined : mkt,
        });
        setAllRows(rows);
        setScreening(false);
        setHasLoaded(true);
      } catch (e) {
        console.error("loadAll error", e);
      } finally {
        setFetching(false);
      }
    },
    [curMkt],
  );

  // 스크리닝 실행. 방금 바꾼 값(시장/조건/로직)은 opts로 넘겨 최신값을 보장한다.
  const runScreen = useCallback(
    async (opts?: {
      conditions?: CondRow[];
      logic?: "AND" | "OR";
      market?: "ALL" | Market;
    }) => {
      const mkt = opts?.market ?? curMkt;
      const conds = parseConds(opts?.conditions ?? conditions);
      if (!conds.length) {
        await loadAll(mkt); // loadAll이 자체 스피너 처리
        return;
      }
      setFetching(true);
      try {
        const rows = await apiScreen({
          conditions: conds,
          logic: opts?.logic ?? logic,
          market: mkt === "ALL" ? null : mkt,
          sort: sortCol,
          order: sortAsc ? "asc" : "desc",
        });
        setAllRows(rows);
        setScreening(true);
        setHasLoaded(true);
      } catch (e) {
        console.error("screen error", e);
      } finally {
        setFetching(false);
      }
    },
    [conditions, logic, curMkt, sortCol, sortAsc, loadAll],
  );

  // ── 핸들러 ─────────────────────────────────────────────────────────
  function setMkt(m: "ALL" | Market) {
    setCurMkt(m);
    if (screening) runScreen({ market: m });
    else loadAll(m);
  }

  function addCond(field = "per", op: CondRow["op"] = "<", value: string = "") {
    const id = condIdRef.current++;
    setConditions((prev) => [...prev, { id, field, op, value }]);
  }

  function updateCond(id: number, patch: Partial<Omit<CondRow, "id">>) {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function delCond(id: number) {
    const next = conditions.filter((c) => c.id !== id);
    setConditions(next);
    if (next.length === 0) {
      setScreening(false);
      setSelectedStrat(null);
      loadAll();
    }
  }

  function toggleLogic() {
    setLogic((prev) => (prev === "AND" ? "OR" : "AND"));
  }

  function resetAll() {
    setConditions([]);
    setLogic("AND");
    setScreening(false);
    setSelectedStrat(null);
    loadAll();
  }

  function sortBy(col: string) {
    if (sortCol === col) {
      setSortAsc((a) => !a);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
  }

  function applyStrategy(id: string) {
    const s = strategies.find((x) => x.id === id);
    if (!s) return;
    setSelectedStrat(id);
    const nl = s.logic || "AND";
    setLogic(nl);
    const newConds: CondRow[] = s.conditions.map((c) => ({
      id: condIdRef.current++,
      field: c.field,
      op: c.op,
      value: String(c.value),
    }));
    setConditions(newConds);
    runScreen({ conditions: newConds, logic: nl });
  }

  function openBacktest(id?: string) {
    setBtPreselect(id ?? null);
    setBtOpen(true);
  }

  function doRefresh() {
    apiRefresh().catch(() => {});
  }

  // ── 정렬된 표시 행 (원본 applySort) ─────────────────────────────────
  const displayRows = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const rows = q
      ? allRows.filter(
          (r) =>
            r.ticker.toLowerCase().includes(q) ||
            (r.name ?? "").toLowerCase().includes(q),
        )
      : [...allRows];
    rows.sort((a, b) => {
      const av = a[sortCol as keyof Stock];
      const bv = b[sortCol as keyof Stock];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "string" && typeof bv === "string")
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return rows;
  }, [allRows, sortCol, sortAsc, deferredQuery]);

  // ── 부팅: 전략 로드 + 기본 조건 + 상태 폴링 ─────────────────────────
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;

    apiStrategies()
      .then((list) => setStrategies(list))
      .catch((e) => console.error("loadStrategies error", e));

    addCond("per", "<", "20");
    addCond("roe", ">", "0.1");

    let timer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;

    async function poll() {
      try {
        const s = await apiStatus();
        const us = s.counts?.US ?? 0;
        const kr = s.counts?.KR ?? 0;
        const total = us + kr;
        if (s.refresh_running) {
          setStatusDot("status-dot running");
          setStatusText("갱신 중…");
        } else if (total > 0) {
          setStatusDot("status-dot ok");
          setStatusText(`US ${us} · KR ${kr}`);
          if (allRowsRef.current.length === 0) loadAll();
        } else {
          setStatusDot("status-dot");
          setStatusText("데이터 없음");
        }
      } catch {
        setStatusDot("status-dot");
        setStatusText("서버 오프라인");
      }
      if (alive) timer = setTimeout(poll, 5000);
    }
    poll();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allTickers = useMemo(() => allRows.map((r) => r.ticker), [allRows]);

  return (
    <>
      <TopBar
        curMkt={curMkt}
        onSetMkt={setMkt}
        stratPanelOpen={stratPanelOpen}
        onToggleStrat={() => setStratPanelOpen((o) => !o)}
        statusDotClass={statusDot}
        statusText={statusText}
        onRefresh={doRefresh}
        onOpenWatchlist={() => setWlOpen(true)}
        onOpenBacktest={() => openBacktest()}
        onOpenDCA={() => setDcaOpen(true)}
      />

      <div className="searchbar">
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="종목명 또는 티커 검색 (예: 삼성전자, AAPL)"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => setQuery("")}
            aria-label="검색 지우기"
          >
            ×
          </button>
        )}
      </div>

      <FilterBar
        conditions={conditions}
        logic={logic}
        resultCount={displayRows.length}
        onAddCond={() => addCond()}
        onDelCond={delCond}
        onUpdateCond={updateCond}
        onToggleLogic={toggleLogic}
        onRunScreen={() => runScreen()}
        onReset={resetAll}
      />

      <StrategyPanel
        open={stratPanelOpen}
        strategies={strategies}
        selectedStrat={selectedStrat}
        onApplyStrategy={applyStrategy}
        onOpenBacktest={openBacktest}
      />

      <StockTable
        rows={displayRows}
        loading={!hasLoaded}
        fetching={fetching}
        sortCol={sortCol}
        sortAsc={sortAsc}
        onSort={sortBy}
        onRowClick={setChartStock}
      />

      {dcaOpen && <DcaModal onClose={() => setDcaOpen(false)} />}
      {btOpen && (
        <BacktestModal
          onClose={() => setBtOpen(false)}
          strategies={strategies}
          preselect={btPreselect}
        />
      )}
      {wlOpen && (
        <WatchlistModal
          onClose={() => setWlOpen(false)}
          allTickers={allTickers}
        />
      )}
      {chartStock && (
        <ChartModal stock={chartStock} onClose={() => setChartStock(null)} />
      )}
    </>
  );
}
