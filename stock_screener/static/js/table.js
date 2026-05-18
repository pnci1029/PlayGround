// Table rendering and sorting

function fmt(v, digits = 2, suffix = '') {
  if (v === null || v === undefined) return '<span class="na">—</span>';
  return v.toFixed(digits) + suffix;
}

function fmtCap(v) {
  if (v === null || v === undefined) return '<span class="na">—</span>';
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9)  return (v / 1e9).toFixed(1)  + 'B';
  if (v >= 1e8)  return (v / 1e8).toFixed(0)  + '억';
  return v.toLocaleString();
}

function fmtPrice(v, mkt) {
  if (v === null || v === undefined) return '<span class="na">—</span>';
  if (mkt === 'KR') return v.toLocaleString('ko-KR') + '원';
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtChg(v) {
  if (v === null || v === undefined) return '<span class="na">—</span>';
  const cls  = v > 0.1 ? 'up' : v < -0.1 ? 'down' : 'neu';
  const sign = v > 0 ? '+' : '';
  return `<span class="${cls}">${sign}${v.toFixed(2)}%</span>`;
}

function sparkBar(price, low, high) {
  if (price === null || low === null || high === null) return '<span class="na">—</span>';
  const range = high - low;
  if (range <= 0) return '<span class="na">—</span>';
  const pct = Math.max(0, Math.min(100, (price - low) / range * 100));
  const col = pct >= 75 ? 'var(--green)' : pct <= 25 ? 'var(--red)' : 'var(--yellow)';
  return `<div class="bar-wrap">
    <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(0)}%;background:${col}"></div></div>
    <span style="color:var(--muted);font-size:10px">${pct.toFixed(0)}%</span>
  </div>`;
}

function _nullOrUndef(v) { return v === null || v === undefined; }

function renderTable() {
  const tbody = document.getElementById('tbody');
  const count = document.getElementById('resultCount');

  if (!displayRows.length) {
    tbody.innerHTML = `<tr><td colspan="12"><div class="state-box"><p>조건에 맞는 종목이 없습니다.</p></div></td></tr>`;
    count.innerHTML = '';
    return;
  }

  count.innerHTML = `<span>${displayRows.length}</span>개 종목`;

  tbody.innerHTML = displayRows.map(r => {
    const badge = r.market === 'US'
      ? `<span class="mkt-badge badge-us">US</span>`
      : `<span class="mkt-badge badge-kr">KR</span>`;

    return `<tr>
      <td class="ticker-cell">${r.ticker}${badge}</td>
      <td class="name-cell" title="${r.name || ''}">${r.name || r.ticker}</td>
      <td>${fmtPrice(r.price, r.market)}</td>
      <td>${fmtChg(r.change_pct)}</td>
      <td>${fmtCap(r.market_cap)}</td>
      <td>${_nullOrUndef(r.per)        ? '<span class="na">—</span>' : fmt(r.per, 1)}</td>
      <td>${_nullOrUndef(r.pbr)        ? '<span class="na">—</span>' : fmt(r.pbr, 2)}</td>
      <td>${_nullOrUndef(r.roe)        ? '<span class="na">—</span>' : fmt(r.roe * 100, 1) + '%'}</td>
      <td>${_nullOrUndef(r.div_yield)  ? '<span class="na">—</span>' : fmt(r.div_yield * 100, 2) + '%'}</td>
      <td>${_nullOrUndef(r.week52_high)? '<span class="na">—</span>' : fmtPrice(r.week52_high, r.market)}</td>
      <td>${_nullOrUndef(r.week52_low) ? '<span class="na">—</span>' : fmtPrice(r.week52_low, r.market)}</td>
      <td>${sparkBar(r.price, r.week52_low, r.week52_high)}</td>
    </tr>`;
  }).join('');
}

function sortBy(col) {
  if (sortCol === col) sortAsc = !sortAsc;
  else { sortCol = col; sortAsc = false; }
  applySort();
}

function applySort() {
  displayRows = [...allRows].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortAsc ? av - bv : bv - av;
  });
  renderTable();
  updateSortArrows();
}

function updateSortArrows() {
  document.querySelectorAll('th').forEach(th => th.classList.remove('sorted'));
  document.querySelectorAll('[id^="arr-"]').forEach(el => el.textContent = '');
  const th  = document.querySelector(`th[data-col="${sortCol}"]`);
  const arr = document.getElementById(`arr-${sortCol}`);
  if (th)  th.classList.add('sorted');
  if (arr) arr.textContent = sortAsc ? '▲' : '▼';
}
