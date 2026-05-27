// Strategy panel — Kostolany egg + classic cards

function toggleStratPanel() {
  stratPanelOpen = !stratPanelOpen;
  document.getElementById('stratPanel').classList.toggle('open', stratPanelOpen);
  document.getElementById('stratTab').classList.toggle('active', stratPanelOpen);
  syncTableHeight();
}

async function loadStrategies() {
  try {
    const list = await apiStrategies();
    list.forEach(s => { strategies[s.id] = s; });
    renderStratCards('classicCards',    list.filter(s => s.group === 'classic'));
    renderStratCards('legendaryCards',  list.filter(s => s.group === 'legendary'));
  } catch (e) { console.error('loadStrategies error', e); }
}

function renderStratCards(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = list.map(s => `
    <div class="strat-card" id="sc-${s.id}" onclick="applyStrategy('${s.id}')">
      <div style="width:100%;height:2px;background:${s.color};border-radius:2px;margin-bottom:8px"></div>
      <div class="strat-card-name">${s.name}</div>
      <div class="strat-card-sub">${s.subtitle}</div>
      ${s.investor ? `<div class="strat-card-investor">${s.investor}</div>` : ''}
      <div class="strat-card-desc">${s.description}</div>
      <div style="margin-top:8px">
        <button onclick="event.stopPropagation();openBacktest('${s.id}')"
          style="font-size:10px;padding:3px 8px;border-radius:4px;border:1px solid var(--border);
                 background:transparent;color:var(--muted);cursor:pointer;"
          onmouseover="this.style.borderColor='var(--purple)';this.style.color='var(--purple)'"
          onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">
          백테스트
        </button>
      </div>
    </div>
  `).join('');
}

// keep backward compat alias
function renderClassicCards(list) { renderStratCards('classicCards', list); }

function clearStratSelection() {
  document.querySelectorAll('.strat-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.phase-circle').forEach(c => c.setAttribute('fill', '#0d1117'));
}

function applyStrategy(id) {
  const s = strategies[id];
  if (!s) return;

  clearStratSelection();
  selectedStrat = id;

  document.getElementById(`sc-${id}`)?.classList.add('selected');
  document.getElementById(`pc-${id}`)?.setAttribute('fill', '#1c2128');

  const condText = s.conditions.map(c => `${c.field} ${c.op} ${c.value}`).join(` ${s.logic} `);
  document.getElementById('stratInfo').innerHTML =
    `<strong style="color:var(--text)">${s.name}</strong> — ${s.description}<br>
     <span style="font-family:var(--mono);color:var(--blue)">${condText}</span>`;

  document.getElementById('condList').innerHTML = '';
  logic = s.logic || 'AND';
  const btn = document.getElementById('logicBtn');
  btn.textContent = logic;
  btn.className   = `logic-toggle ${logic.toLowerCase()}`;

  s.conditions.forEach(c => addCond(c.field, c.op, c.value));
  runScreen();
}
