/* ── Watchlist modal ─────────────────────────────────────────────────── */

let wlGroups   = [];   // [{id, name, tickers}]
let wlActiveId = null; // currently selected group id
let wlAnalysisMMode = "fit"; // "fit" | "returns"

// ── Open / Close ──────────────────────────────────────────────────────────

function openWatchlist() {
  document.getElementById("wlOverlay").style.display = "flex";
  _loadGroups();
}

function closeWatchlist() {
  document.getElementById("wlOverlay").style.display = "none";
}

function closeWlOutside(e) {
  if (e.target === document.getElementById("wlOverlay")) closeWatchlist();
}

// ── Load & render group list ──────────────────────────────────────────────

async function _loadGroups() {
  const res = await fetch("/api/watchlists");
  wlGroups  = await res.json();
  _renderGroupList();
  if (wlGroups.length > 0) {
    _selectGroup(wlActiveId && wlGroups.find(g => g.id === wlActiveId)
      ? wlActiveId
      : wlGroups[0].id);
  } else {
    _renderGroupDetail(null);
  }
}

function _renderGroupList() {
  const el = document.getElementById("wlGroupList");
  el.innerHTML = "";
  wlGroups.forEach(g => {
    const btn = document.createElement("button");
    btn.className = "wl-group-btn" + (g.id === wlActiveId ? " active" : "");
    btn.textContent = g.name;
    btn.onclick = () => _selectGroup(g.id);
    el.appendChild(btn);
  });
}

function _selectGroup(id) {
  wlActiveId = id;
  _renderGroupList();
  const g = wlGroups.find(g => g.id === id);
  _renderGroupDetail(g);
}

// ── Group detail pane ─────────────────────────────────────────────────────

function _renderGroupDetail(g) {
  const pane = document.getElementById("wlDetailPane");
  if (!g) {
    pane.innerHTML = `
      <div class="wl-empty">
        <p>관심종목 그룹을 만들어보세요</p>
        <button class="wl-new-btn" onclick="wlCreateGroup()">+ 새 그룹 만들기</button>
      </div>`;
    return;
  }

  pane.innerHTML = `
    <div class="wl-detail-header">
      <input class="wl-name-input" id="wlNameInput" value="${_esc(g.name)}"
             onblur="wlRenameGroup(${g.id}, this.value)"
             onkeydown="if(event.key==='Enter')this.blur()">
      <button class="wl-del-btn" onclick="wlDeleteGroup(${g.id})" title="그룹 삭제">🗑</button>
    </div>

    <div class="wl-ticker-section">
      <div class="wl-add-row">
        <input class="wl-add-input" id="wlTickerInput" placeholder="티커 입력 (예: AAPL, 005930)"
               list="wlTickerList"
               onkeydown="if(event.key==='Enter')wlAddTicker(${g.id})">
        <datalist id="wlTickerList">${_allTickerOptions()}</datalist>
        <button class="wl-add-ticker-btn" onclick="wlAddTicker(${g.id})">+ 추가</button>
      </div>
      <div class="wl-chips" id="wlChips">
        ${g.tickers.map(t => `
          <span class="wl-chip">
            ${_esc(t)}
            <button class="wl-chip-del" onclick="wlRemoveTicker(${g.id},'${t}')">×</button>
          </span>`).join("")}
        ${g.tickers.length === 0 ? '<span class="wl-chips-empty">종목을 추가하세요</span>' : ""}
      </div>
    </div>

    <div class="wl-analysis-tabs">
      <button class="wl-tab-btn ${wlAnalysisMMode==='fit'?'active':''}"
              onclick="wlSetMode('fit')">전략 적합성</button>
      <button class="wl-tab-btn ${wlAnalysisMMode==='returns'?'active':''}"
              onclick="wlSetMode('returns')">수익률 분석</button>
    </div>

    <div id="wlAnalysisArea">
      ${wlAnalysisMMode === "fit" ? _renderFitForm(g) : _renderReturnsForm(g)}
    </div>`;
}

function _esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function _allTickerOptions() {
  // Gather all known tickers from the global allRows if available
  const tickers = typeof allRows !== "undefined"
    ? allRows.map(r => r.ticker)
    : [];
  return tickers.map(t => `<option value="${t}">`).join("");
}

function _renderFitForm(g) {
  return `
    <button class="wl-run-analysis-btn" onclick="wlRunFit(${g.id})">분석 실행</button>
    <div id="wlFitResult"></div>`;
}

function _renderReturnsForm(g) {
  const defaultDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  })();
  return `
    <div class="wl-returns-form">
      <label>기준 시작일</label>
      <input type="date" id="wlReturnStart" value="${defaultDate}">
      <button class="wl-run-analysis-btn" onclick="wlRunReturns(${g.id})">수익률 계산</button>
    </div>
    <div id="wlReturnsResult"></div>`;
}

// ── CRUD actions ──────────────────────────────────────────────────────────

async function wlCreateGroup() {
  const name = prompt("새 그룹 이름을 입력하세요:", "새 관심목록");
  if (!name || !name.trim()) return;
  const res  = await fetch("/api/watchlists", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({name: name.trim(), tickers: []}),
  });
  const data = await res.json();
  wlActiveId = data.id;
  await _loadGroups();
}

async function wlRenameGroup(id, name) {
  if (!name.trim()) return;
  await fetch(`/api/watchlists/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({name: name.trim()}),
  });
  await _loadGroups();
}

async function wlDeleteGroup(id) {
  if (!confirm("이 그룹을 삭제하시겠습니까?")) return;
  await fetch(`/api/watchlists/${id}`, {method: "DELETE"});
  wlActiveId = null;
  await _loadGroups();
}

async function wlAddTicker(id) {
  const input  = document.getElementById("wlTickerInput");
  const ticker = input.value.trim().toUpperCase();
  if (!ticker) return;

  const g = wlGroups.find(g => g.id === id);
  if (!g) return;
  if (g.tickers.includes(ticker)) {
    input.value = "";
    return;
  }
  const newTickers = [...g.tickers, ticker];
  await fetch(`/api/watchlists/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({tickers: newTickers}),
  });
  input.value = "";
  wlAnalysisMMode = wlAnalysisMMode; // preserve tab
  await _loadGroups();
}

async function wlRemoveTicker(id, ticker) {
  const g = wlGroups.find(g => g.id === id);
  if (!g) return;
  const newTickers = g.tickers.filter(t => t !== ticker);
  await fetch(`/api/watchlists/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({tickers: newTickers}),
  });
  await _loadGroups();
}

function wlSetMode(mode) {
  wlAnalysisMMode = mode;
  const g = wlGroups.find(g => g.id === wlActiveId);
  _renderGroupDetail(g);
}

// ── Strategy fit analysis ─────────────────────────────────────────────────

async function wlRunFit(id) {
  const area = document.getElementById("wlFitResult");
  area.innerHTML = '<div class="wl-loading">분석 중…</div>';

  const res  = await fetch(`/api/watchlists/${id}/strategy-fit`);
  const data = await res.json();

  if (data.error) {
    area.innerHTML = `<div class="wl-error">${data.error}</div>`;
    return;
  }
  if (!data.tickers || data.tickers.length === 0) {
    area.innerHTML = '<div class="wl-info">종목을 먼저 추가하세요.</div>';
    return;
  }

  // Group strategies
  const groups = {
    kostolany: data.strategies.filter(s => s.group === "kostolany"),
    classic:   data.strategies.filter(s => s.group === "classic"),
    legendary: data.strategies.filter(s => s.group === "legendary"),
  };
  const groupLabels = {kostolany: "코스톨라니", classic: "전통 전략", legendary: "전설적 투자자"};

  let html = '<div class="wl-fit-wrap">';

  for (const [gkey, strats] of Object.entries(groups)) {
    if (!strats.length) continue;
    html += `<div class="wl-fit-group">
      <div class="wl-fit-group-label">${groupLabels[gkey]}</div>
      <table class="wl-fit-table">
        <thead><tr>
          <th class="wl-fit-th-ticker">종목</th>
          ${strats.map(s => `<th class="wl-fit-th-strat" title="${_esc(s.name)}">${_esc(s.name.split(" ")[0])}</th>`).join("")}
        </tr></thead>
        <tbody>
          ${data.tickers.map(t => {
            const info = data.ticker_info[t] || {};
            return `<tr>
              <td class="wl-fit-ticker">
                <span class="wl-mkt-badge ${info.market||'?'}">${info.market||'?'}</span>
                <span class="wl-ticker-name">${_esc(t)}</span>
                <span class="wl-ticker-fullname">${_esc(info.name||'')}</span>
              </td>
              ${strats.map(s => {
                const v = data.matrix[t]?.[s.id];
                if (v === null || v === undefined) return '<td class="wl-fit-na">-</td>';
                return v ? '<td class="wl-fit-yes">✓</td>' : '<td class="wl-fit-no">✗</td>';
              }).join("")}
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
  }

  // Summary: which strategies does each ticker match?
  html += '<div class="wl-fit-summary"><div class="wl-fit-group-label">전략 적합 요약</div>';
  data.tickers.forEach(t => {
    const matched = data.strategies.filter(s => data.matrix[t]?.[s.id] === true);
    html += `<div class="wl-fit-summary-row">
      <strong>${_esc(t)}</strong>
      ${matched.length > 0
        ? matched.map(s => `<span class="wl-fit-badge">${_esc(s.name)}</span>`).join("")
        : '<span class="wl-fit-none">해당 전략 없음</span>'}
    </div>`;
  });
  html += '</div></div>';

  area.innerHTML = html;
}

// ── Returns analysis ──────────────────────────────────────────────────────

async function wlRunReturns(id) {
  const startDate = document.getElementById("wlReturnStart")?.value;
  if (!startDate) return;

  const area = document.getElementById("wlReturnsResult");
  area.innerHTML = '<div class="wl-loading">수익률 계산 중… (30~60초 소요)</div>';

  const res  = await fetch(`/api/watchlists/${id}/returns`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({start_date: startDate}),
  });
  const data = await res.json();

  if (data.error) {
    area.innerHTML = `<div class="wl-error">${data.error}</div>`;
    return;
  }

  const results = data.results || [];
  if (!results.length) {
    area.innerHTML = '<div class="wl-info">종목을 먼저 추가하세요.</div>';
    return;
  }

  const valid    = results.filter(r => r.return_pct !== null);
  const avgRet   = valid.length
    ? (valid.reduce((s, r) => s + r.return_pct, 0) / valid.length).toFixed(1)
    : null;

  let html = `
    <div class="wl-ret-meta">
      <span>${_esc(data.start_date)} → ${_esc(data.end_date)}</span>
      ${avgRet !== null ? `<span class="wl-ret-avg ${+avgRet >= 0 ? 'pos' : 'neg'}">그룹 평균 ${avgRet > 0 ? '+' : ''}${avgRet}%</span>` : ''}
    </div>
    <table class="wl-ret-table">
      <thead><tr>
        <th>종목</th><th>이름</th>
        <th>매수가</th><th>현재가</th><th>수익률</th>
      </tr></thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td class="wl-ret-ticker">${_esc(r.ticker)}</td>
            <td class="wl-ret-name">${_esc(r.name||'')}</td>
            <td>${r.start_price !== null ? r.start_price.toLocaleString() : '-'}</td>
            <td>${r.end_price   !== null ? r.end_price.toLocaleString()   : '-'}</td>
            <td class="${r.return_pct === null ? '' : r.return_pct >= 0 ? 'pos' : 'neg'}">
              ${r.return_pct !== null
                ? (r.return_pct > 0 ? '+' : '') + r.return_pct + '%'
                : r.error || '-'}
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`;

  area.innerHTML = html;
}
