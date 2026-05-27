// Pure API wrappers — no DOM access

async function apiStocks({ market, sort = 'market_cap', order = 'desc', limit = 200 } = {}) {
  const qs = new URLSearchParams({ sort, order, limit });
  if (market) qs.set('market', market);
  const r = await fetch(`/api/stocks?${qs}`);
  return r.json();
}

async function apiScreen({ conditions, logic, market, sort, order }) {
  const r = await fetch('/api/screen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conditions, logic, market: market || null, sort, order }),
  });
  return r.json();
}

async function apiRefresh() {
  const r = await fetch('/api/refresh');
  return r.json();
}

async function apiStatus() {
  const r = await fetch('/api/status');
  return r.json();
}

async function apiStrategies() {
  const r = await fetch('/api/strategies');
  return r.json();
}

async function apiDCA({ ticker, start, amount, market, freq }) {
  const qs = new URLSearchParams({ ticker, start, amount, market, freq });
  const r = await fetch(`/api/dca?${qs}`);
  return r.json();
}
