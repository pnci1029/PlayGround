// Filter condition management

function addCond(field = 'per', op = '<', val = '') {
  const id  = condId++;
  const div = document.createElement('div');
  div.className = 'cond-row';
  div.id = `cond-${id}`;
  div.innerHTML = `
    <select class="cond-sel" id="cf-${id}">
      ${FIELDS.map(f => `<option value="${f.v}"${f.v === field ? ' selected' : ''}>${f.l}</option>`).join('')}
    </select>
    <select class="cond-op" id="co-${id}">
      ${['<', '<=', '>', '>=', '='].map(o => `<option${o === op ? ' selected' : ''}>${o}</option>`).join('')}
    </select>
    <input class="cond-val" id="cv-${id}" type="number" value="${val}" placeholder="값">
    <button class="cond-del" onclick="delCond(${id})">×</button>
  `;
  document.getElementById('condList').appendChild(div);
}

function delCond(id) {
  document.getElementById(`cond-${id}`)?.remove();
  if (!document.getElementById('condList').children.length) {
    screening = false;
    selectedStrat = null;
    clearStratSelection();
    loadAll();
  }
}

function toggleLogic() {
  logic = logic === 'AND' ? 'OR' : 'AND';
  const btn = document.getElementById('logicBtn');
  btn.textContent  = logic;
  btn.className    = `logic-toggle ${logic.toLowerCase()}`;
}

function getConditions() {
  return [...document.querySelectorAll('.cond-row')].reduce((acc, row) => {
    const id    = row.id.replace('cond-', '');
    const field = document.getElementById(`cf-${id}`)?.value;
    const op    = document.getElementById(`co-${id}`)?.value;
    const val   = parseFloat(document.getElementById(`cv-${id}`)?.value);
    if (field && op && !isNaN(val)) acc.push({ field, op, value: val });
    return acc;
  }, []);
}

async function runScreen() {
  const conds = getConditions();
  if (!conds.length) { loadAll(); return; }
  try {
    const mkt = curMkt === 'ALL' ? null : curMkt;
    allRows   = await apiScreen({ conditions: conds, logic, market: mkt, sort: sortCol, order: sortAsc ? 'asc' : 'desc' });
    screening = true;
    applySort();
  } catch (e) { console.error('screen error', e); }
}

function resetAll() {
  document.getElementById('condList').innerHTML = '';
  logic = 'AND';
  const btn = document.getElementById('logicBtn');
  btn.textContent = 'AND';
  btn.className   = 'logic-toggle and';
  screening     = false;
  selectedStrat = null;
  clearStratSelection();
  document.getElementById('stratInfo').textContent = '';
  loadAll();
}
