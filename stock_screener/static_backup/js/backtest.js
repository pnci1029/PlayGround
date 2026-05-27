// ── Backtest modal ────────────────────────────────────────────────────────

function openBacktest(stratId) {
  populateBtStratSelect();
  const sel = document.getElementById('btStratSel');
  if (stratId && sel) sel.value = stratId;

  // Default dates: 3 years ago → today
  const today = new Date();
  const y3ago = new Date(today);
  y3ago.setFullYear(y3ago.getFullYear() - 3);
  document.getElementById('btStart').value = y3ago.toISOString().slice(0, 10);
  document.getElementById('btEnd').value   = today.toISOString().slice(0, 10);

  document.getElementById('btResult').classList.remove('visible');
  document.getElementById('btError').classList.remove('visible');
  document.getElementById('btLoading').classList.remove('visible');
  document.getElementById('btOverlay').classList.add('open');
}

function closeBacktest() {
  document.getElementById('btOverlay').classList.remove('open');
}

function closeBtOutside(e) {
  if (e.target === document.getElementById('btOverlay')) closeBacktest();
}

function populateBtStratSelect() {
  const sel = document.getElementById('btStratSel');
  if (!sel) return;
  const groupLabels = { kostolany: '코스톨라니', classic: '전통 전략', legendary: '전설적 투자자' };
  const grouped = {};
  Object.entries(strategies).forEach(([id, s]) => {
    const g = s.group || 'classic';
    (grouped[g] = grouped[g] || []).push({ id, ...s });
  });
  sel.innerHTML = '<option value="">전략 선택…</option>' +
    Object.entries(grouped).map(([g, list]) =>
      `<optgroup label="${groupLabels[g] || g}">${
        list.map(s => `<option value="${s.id}">${s.name}</option>`).join('')
      }</optgroup>`
    ).join('');
}

async function runBacktest() {
  const stratId = document.getElementById('btStratSel').value;
  const start   = document.getElementById('btStart').value;
  const end     = document.getElementById('btEnd').value;
  const market  = document.getElementById('btMarket').value;

  const errEl = document.getElementById('btError');
  if (!stratId || !start || !end) {
    errEl.textContent = '전략, 시작일, 종료일을 모두 선택하세요.';
    errEl.classList.add('visible');
    return;
  }
  if (new Date(start) >= new Date(end)) {
    errEl.textContent = '시작일은 종료일보다 이전이어야 합니다.';
    errEl.classList.add('visible');
    return;
  }

  errEl.classList.remove('visible');
  document.getElementById('btResult').classList.remove('visible');
  document.getElementById('btLoading').classList.add('visible');

  try {
    const res = await fetch('/api/backtest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy_id: stratId, start_date: start, end_date: end, market }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    _renderBtResult(data);
  } catch (e) {
    errEl.textContent = e.message || '백테스트 실행 중 오류가 발생했습니다.';
    errEl.classList.add('visible');
  } finally {
    document.getElementById('btLoading').classList.remove('visible');
  }
}

function _renderBtResult(data) {
  const pRet  = data.portfolio_return;
  const bRet  = data.benchmark_return;
  const alpha = (pRet != null && bRet != null) ? +(pRet - bRet).toFixed(2) : null;

  const fmt = v => v == null ? 'N/A' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
  const col = v => v == null ? '' : v >= 0 ? 'var(--green)' : 'var(--red)';

  const qualBadge = q => q === 'precise'
    ? `<span class="bt-quality-badge precise">정밀모드</span>`
    : `<span class="bt-quality-badge lite">라이트모드</span>`;

  let html = `
    <div class="bt-result-hdr">
      <span class="bt-result-title">${data.strategy_name}</span>
      ${qualBadge(data.data_quality)}
      <span class="bt-result-period">${data.start_date} → ${data.end_date}</span>
    </div>
    <div class="bt-stats">
      <div class="bt-stat">
        <div class="bt-stat-lbl">전략 수익률</div>
        <div class="bt-stat-val" style="color:${col(pRet)}">${fmt(pRet)}</div>
        <div class="bt-stat-sub">${data.matched.length}종목 등가중 평균</div>
      </div>
      <div class="bt-stat">
        <div class="bt-stat-lbl">벤치마크(SPY)</div>
        <div class="bt-stat-val" style="color:${col(bRet)}">${fmt(bRet)}</div>
        <div class="bt-stat-sub">같은 기간 기준</div>
      </div>
      <div class="bt-stat">
        <div class="bt-stat-lbl">초과수익 α</div>
        <div class="bt-stat-val" style="color:${col(alpha)}">${alpha != null ? fmt(alpha) : 'N/A'}</div>
        <div class="bt-stat-sub">전략 − 벤치마크</div>
      </div>
      <div class="bt-stat">
        <div class="bt-stat-lbl">편입 종목</div>
        <div class="bt-stat-val" style="color:var(--blue)">${data.matched.length}</div>
        <div class="bt-stat-sub">총 ${data.matched.length + (data.unmatched_count || 0)}개 분석</div>
      </div>
    </div>`;

  if (data.matched.length) {
    html += `<div class="bt-ticker-title">편입 종목 상세</div>
    <div class="bt-ticker-list">`;
    data.matched.forEach(r => {
      const dot = r.data_quality === 'precise'
        ? `<span class="bt-dot precise" title="과거 재무데이터 사용"></span>`
        : `<span class="bt-dot lite"    title="현재 지표 기준 선별"></span>`;
      const fundsStr = Object.entries(r.fundamentals || {}).map(([k, v]) =>
        `${k.toUpperCase()}=${typeof v === 'number' ? v.toFixed(2) : v}`
      ).join('  ');
      html += `
        <div class="bt-ticker-row">
          <div class="bt-ticker-left">
            ${dot}
            <span class="bt-ticker">${r.ticker}</span>
            <span class="bt-tname">${r.name}</span>
          </div>
          <div class="bt-ticker-right">
            ${fundsStr ? `<span class="bt-funds">${fundsStr}</span>` : ''}
            <span class="bt-ret" style="color:${col(r.return_pct)}">${fmt(r.return_pct)}</span>
          </div>
        </div>`;
    });
    html += '</div>';
  } else {
    html += `<div class="bt-empty">해당 기간에 조건에 맞는 종목이 없었습니다</div>`;
  }

  if (data.data_quality === 'lite') {
    html += `<div class="bt-note">
      라이트모드: 과거 재무제표 데이터가 부족해 현재 지표 기준으로 종목을 선별했습니다.
      실제 당시 수치와 다를 수 있으니 참고용으로만 활용하세요.
    </div>`;
  }

  document.getElementById('btResultBody').innerHTML = html;
  document.getElementById('btResult').classList.add('visible');
}
