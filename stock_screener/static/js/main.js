// Application init, polling, market filter, layout

function setMkt(m, btn) {
  curMkt = m;
  document.querySelectorAll('.mkt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (screening) runScreen(); else loadAll();
}

async function pollStatus() {
  try {
    const s     = await apiStatus();
    const dot   = document.getElementById('sdot');
    const txt   = document.getElementById('stxt');
    const us    = s.counts?.US ?? 0;
    const kr    = s.counts?.KR ?? 0;
    const total = us + kr;

    if (s.refresh_running) {
      dot.className   = 'status-dot running';
      txt.textContent = '갱신 중…';
    } else if (total > 0) {
      dot.className   = 'status-dot ok';
      txt.textContent = `US ${us} · KR ${kr}`;
      if (!allRows.length) loadAll();
    } else {
      dot.className   = 'status-dot';
      txt.textContent = '데이터 없음';
    }
  } catch {
    document.getElementById('sdot').className   = 'status-dot';
    document.getElementById('stxt').textContent = '서버 오프라인';
  }
  setTimeout(pollStatus, 5000);
}

async function doRefresh() { await apiRefresh(); }

async function loadAll() {
  try {
    const mkt = curMkt === 'ALL' ? undefined : curMkt;
    allRows   = await apiStocks({ market: mkt });
    screening = false;
    applySort();
  } catch (e) { console.error('loadAll error', e); }
}

function syncTableHeight() {
  const topbar = document.querySelector('.topbar');
  const fb     = document.getElementById('filterbar');
  const sp     = document.getElementById('stratPanel');
  const tw     = document.getElementById('tableWrap');
  if (!topbar || !fb || !tw) return;
  const spH = stratPanelOpen ? sp.offsetHeight : 0;
  tw.style.height = `calc(100vh - ${topbar.offsetHeight + fb.offsetHeight + spH}px)`;
}

// ── boot ──────────────────────────────────────────────────────────────────────
const _ro = new ResizeObserver(syncTableHeight);
_ro.observe(document.getElementById('filterbar'));
_ro.observe(document.getElementById('stratPanel'));
syncTableHeight();

pollStatus();
loadStrategies();
addCond('per', '<', 20);
addCond('roe', '>',  0.10);
