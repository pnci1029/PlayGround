// DCA simulator modal

function openDCA()  { document.getElementById('dcaOverlay').classList.add('open'); }
function closeDCA() { document.getElementById('dcaOverlay').classList.remove('open'); }

function closeDCAOutside(e) {
  if (e.target === document.getElementById('dcaOverlay')) closeDCA();
}

async function runDCA() {
  const ticker = document.getElementById('dcaTicker').value.trim().toUpperCase();
  const start  = document.getElementById('dcaStart').value;
  const amount = parseFloat(document.getElementById('dcaAmount').value);
  const market = document.getElementById('dcaMarket').value;
  const freq   = document.getElementById('dcaFreq').value;
  if (!ticker || !start || isNaN(amount) || amount <= 0) return;

  const loadEl   = document.getElementById('dcaLoading');
  const errEl    = document.getElementById('dcaError');
  const resultEl = document.getElementById('dcaResult');

  loadEl.classList.add('visible');
  errEl.classList.remove('visible');
  resultEl.classList.remove('visible');

  try {
    const d = await apiDCA({ ticker, start, amount, market, freq });
    loadEl.classList.remove('visible');

    if (d.error) {
      errEl.textContent = d.error;
      errEl.classList.add('visible');
      return;
    }

    _renderDCAStats(d, market, amount);
    drawDCAChart(d.history, market);
    resultEl.classList.add('visible');
  } catch (e) {
    loadEl.classList.remove('visible');
    errEl.textContent = '네트워크 오류: ' + e.message;
    errEl.classList.add('visible');
  }
}

function _renderDCAStats(d, market, amount) {
  const cur     = market === 'KR' ? `₩${d.current_price.toLocaleString()}` : `$${d.current_price.toFixed(2)}`;
  const inv     = market === 'KR' ? `₩${d.total_invested.toLocaleString()}` : `$${d.total_invested.toLocaleString()}`;
  const val     = market === 'KR' ? `₩${d.final_value.toLocaleString()}`   : `$${d.final_value.toLocaleString()}`;
  const sign    = d.profit >= 0 ? '+' : '';
  const col     = d.profit >= 0 ? 'var(--green)' : 'var(--red)';
  const pnlStr  = market === 'KR'
    ? `${sign}₩${Math.abs(d.profit).toLocaleString()}`
    : `${sign}$${Math.abs(d.profit).toLocaleString()}`;

  document.getElementById('dcaStats').innerHTML = `
    <div class="dca-stat">
      <div class="dca-stat-label">총 투자금</div>
      <div class="dca-stat-value" style="color:var(--text)">${inv}</div>
      <div class="dca-stat-sub">${d.n_periods}회 × ${market === 'KR' ? '₩' : '$'}${amount.toLocaleString()}</div>
    </div>
    <div class="dca-stat">
      <div class="dca-stat-label">현재 가치</div>
      <div class="dca-stat-value" style="color:var(--blue)">${val}</div>
      <div class="dca-stat-sub">현재가 ${cur}</div>
    </div>
    <div class="dca-stat">
      <div class="dca-stat-label">수익 / 손실</div>
      <div class="dca-stat-value" style="color:${col}">${pnlStr}</div>
      <div class="dca-stat-sub" style="color:${col}">${sign}${d.profit_pct}%</div>
    </div>
    <div class="dca-stat">
      <div class="dca-stat-label">연평균 수익률</div>
      <div class="dca-stat-value" style="color:${d.cagr >= 0 ? 'var(--green)' : 'var(--red)'}">${d.cagr >= 0 ? '+' : ''}${d.cagr}%</div>
      <div class="dca-stat-sub">CAGR</div>
    </div>
  `;
}

function drawDCAChart(history, market) {
  const canvas = document.getElementById('dcaCanvas');
  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.parentElement.clientWidth || 660;
  const H      = 160;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  if (!history || history.length < 2) return;

  const PAD    = { top: 10, right: 16, bottom: 28, left: 16 };
  const cw     = W - PAD.left - PAD.right;
  const ch     = H - PAD.top  - PAD.bottom;
  const values = history.map(h => h.value);
  const invested = history.map(h => h.invested);
  const minV   = Math.min(...values, ...invested) * 0.95;
  const maxV   = Math.max(...values, ...invested) * 1.02;

  const toX = i => PAD.left + (i / (history.length - 1)) * cw;
  const toY = v => PAD.top  + ch - ((v - minV) / (maxV - minV)) * ch;

  // grid
  ctx.strokeStyle = '#21262d'; ctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach(t => {
    const y = PAD.top + ch * t;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
  });

  // invested area
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(invested[0]));
  invested.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(invested.length - 1), H - PAD.bottom);
  ctx.lineTo(toX(0), H - PAD.bottom);
  ctx.closePath();
  ctx.fillStyle = 'rgba(88,166,255,.08)'; ctx.fill();

  // invested line (dashed)
  ctx.beginPath(); ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  invested.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
  ctx.stroke(); ctx.setLineDash([]);

  // value area
  const lastPnl = values[values.length - 1] - invested[invested.length - 1];
  const valCol  = lastPnl >= 0 ? '#3fb950' : '#f85149';
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(values[0]));
  values.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(values.length - 1), H - PAD.bottom);
  ctx.lineTo(toX(0), H - PAD.bottom);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
  grad.addColorStop(0, lastPnl >= 0 ? 'rgba(63,185,80,.25)' : 'rgba(248,81,73,.25)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad; ctx.fill();

  // value line
  ctx.beginPath(); ctx.strokeStyle = valCol; ctx.lineWidth = 2;
  values.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
  ctx.stroke();

  // x-axis labels
  ctx.fillStyle = '#8b949e'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(history.length / 6));
  history.forEach((h, i) => {
    if (i % step === 0 || i === history.length - 1)
      ctx.fillText(h.date, toX(i), H - PAD.bottom + 12);
  });

  // legend
  ctx.textAlign = 'left';
  ctx.fillStyle = '#58a6ff'; ctx.fillRect(PAD.left, PAD.top, 10, 3);
  ctx.fillStyle = '#8b949e'; ctx.fillText('투자금', PAD.left + 14, PAD.top + 9);
  ctx.fillStyle = valCol;    ctx.fillRect(PAD.left + 65, PAD.top, 10, 3);
  ctx.fillStyle = '#8b949e'; ctx.fillText('평가금', PAD.left + 79, PAD.top + 9);
}
