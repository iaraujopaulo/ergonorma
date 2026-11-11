/* ErgoNorma — núcleo: registro de ferramentas, formulários, painel, relatórios e armazenamento */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ utilidades */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => { if (v === '' || v == null) return NaN; const x = parseFloat(String(v).replace(',', '.')); return isNaN(x) ? NaN : x; };
  const n0 = v => { const x = num(v); return isNaN(x) ? 0 : x; };
  const fmt = (x, d = 1) => (x == null || x === '' || isNaN(x)) ? '—' : Number(x).toLocaleString('pt-BR', { maximumFractionDigits: d });
  const fmtF = (x, d = 2) => (x == null || isNaN(x)) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const hoje = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const dataBR = s => { if (!s) return '—'; const p = String(s).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; };
  const deep = o => JSON.parse(JSON.stringify(o));
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  /** procura o primeiro limite: faixa(x, [[lim, valor], ...], padrao) → valor do primeiro x < lim */
  const faixa = (x, tab, dflt) => { for (const [lim, val] of tab) if (x < lim) return val; return dflt; };
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN;

  /* ------------------------------------------------------------------ níveis de risco */
  const NIVEIS = [
    { n: 0, nome: 'Baixo', cls: 'lv0' },
    { n: 1, nome: 'Moderado', cls: 'lv1' },
    { n: 2, nome: 'Alto', cls: 'lv2' },
    { n: 3, nome: 'Muito alto', cls: 'lv3' }
  ];
  const nivel = n => NIVEIS[clamp(n | 0, 0, 3)];
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const corNivel = n => cssVar('--lv' + clamp(n | 0, 0, 3)) || ['#1E9E6A', '#D9A400', '#E0592A', '#7B3FD1'][clamp(n | 0, 0, 3)];

  /* ------------------------------------------------------------------ armazenamento local */
  const KEY = 'ergonorma.v1';
  let memoria = { avals: [], ident: null };
  const Store = {
    load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && Array.isArray(d.avals)) memoria = d; } catch (e) { /* sem armazenamento */ } return memoria; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(memoria)); return true; } catch (e) { return false; } },
    get db() { return memoria; },
    upsert(a) { const i = memoria.avals.findIndex(x => x.id === a.id); if (i >= 0) memoria.avals[i] = a; else memoria.avals.push(a); return this.save(); },
    remove(id) { memoria.avals = memoria.avals.filter(x => x.id !== id); return this.save(); },
    byTool(t) { return memoria.avals.filter(a => a.tool === t).sort((a, b) => b.ts - a.ts); },
    all() { return memoria.avals.slice().sort((a, b) => b.ts - a.ts); },
    find(id) { return memoria.avals.find(a => a.id === id); }
  };
  Store.load();

  /* ------------------------------------------------------------------ registro */
  const Ergo = {
    cats: {}, tools: [],
    util: { esc, num, n0, fmt, fmtF, clamp, faixa, mean, nivel, dataBR, uid },
    Store,
    cat(id, nome, icon, desc) { this.cats[id] = { id, nome, icon, desc }; },
    register(t) { t.secoes = t.secoes || []; this.tools.push(t); },
    tool(id) { return this.tools.find(t => t.id === id); },
    sorted(list) { return (list || this.tools).slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })); },
    catsSorted() { return Object.values(this.cats).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })); }
  };
  window.Ergo = Ergo;

  /* ------------------------------------------------------------------ identificação comum */
  const IDENT = [
    { id: 'empresa', l: 'Empresa / unidade', d: 'Metalúrgica Exemplo Ltda. — Unidade Fortaleza' },
    { id: 'setor', l: 'Setor', d: 'Montagem' },
    { id: 'ghe', l: 'GHE / GSE', d: 'GHE 03 — Montadores' },
    { id: 'funcao', l: 'Cargo / função', d: 'Montador(a) de produção' },
    { id: 'atividade', l: 'Atividade / posto avaliado', d: 'Montagem de chicotes na bancada 2' },
    { id: 'trabalhador', l: 'Trabalhador(es) observado(s)', d: '3 trabalhadores (turno A)' },
    { id: 'avaliador', l: 'Avaliador(a) responsável', d: '' },
    { id: 'data', l: 'Data da avaliação', d: '', tipo: 'date' }
  ];
  function identPadrao() {
    const base = {}; IDENT.forEach(f => base[f.id] = f.d); base.data = hoje(); base.obs = '';
    const ult = Store.db.ident; if (ult) Object.assign(base, ult, { data: hoje(), obs: '' });
    return base;
  }

  /* ------------------------------------------------------------------ valores padrão */
  function camposDe(tool) { const out = []; tool.secoes.forEach(s => (s.f || []).forEach(f => out.push(f))); return out; }
  function padrao(tool) {
    const v = {};
    camposDe(tool).forEach(f => {
      if (f.t === 'likert' || f.t === 'yn') f.itens.forEach(it => { v[it.id] = it.d != null ? it.d : f.d; });
      else if (f.t === 'grid') v[f.id] = deep(f.d || []);
      else if (f.t === 'matrix') { v[f.id] = {}; f.rows.forEach(([rid]) => { v[f.id][rid] = {}; f.cols.forEach(c => { v[f.id][rid][c.id] = (f.d && f.d[rid] && f.d[rid][c.id] != null) ? f.d[rid][c.id] : c.d; }); }); }
      else if (f.t === 'evals') v[f.id] = [];
      else if (f.t === 'pairs') f.pares.forEach(([a, b], i) => { v[f.id + '_' + i] = (f.d && f.d[i]) || a; });
      else if (f.id) v[f.id] = f.d != null ? deep(f.d) : (f.t === 'chk' ? false : '');
    });
    if (tool.padrao) Object.assign(v, tool.padrao());
    return v;
  }
  function vazio(tool) {
    const v = padrao(tool);
    camposDe(tool).forEach(f => {
      if (f.t === 'grid') v[f.id] = [];
      else if (f.t === 'txt' || f.t === 'area') v[f.id] = '';
      else if (f.t === 'num') v[f.id] = '';
      else if (f.t === 'chk') v[f.id] = false;
    });
    return v;
  }

  /* ------------------------------------------------------------------ renderização de campos */
  const isNum = x => typeof x === 'number';
  function optLabel(f, val) { const o = (f.o || []).find(o => String(o[0]) === String(val)); return o ? o[1] : (val === '' || val == null ? '—' : String(val)); }

  function campo(f, v, tool) {
    const id = 'f_' + tool.id + '_' + (f.id || Math.random().toString(36).slice(2));
    const ajuda = f.h ? `<div class="f-help">${f.h}</div>` : '';
    const wrapOpen = `<div class="fw fw-${f.t}${f.w ? ' ' + f.w : ''}" data-fw="${esc(f.id || '')}">`;
    switch (f.t) {
      case 'info': return `<div class="fw fw-info ${f.w || ''}">${f.html}</div>`;
      case 'txt': case 'date':
        return `${wrapOpen}<label class="form-label" for="${id}">${f.l}</label><input class="form-control" id="${id}" type="${f.t === 'date' ? 'date' : 'text'}" data-k="${f.id}" value="${esc(v[f.id])}" placeholder="${esc(f.ph || '')}">${ajuda}</div>`;
      case 'area':
        return `${wrapOpen}<label class="form-label" for="${id}">${f.l}</label><textarea class="form-control" id="${id}" rows="${f.rows || 3}" data-k="${f.id}" placeholder="${esc(f.ph || '')}">${esc(v[f.id])}</textarea>${ajuda}</div>`;
      case 'num':
        return `${wrapOpen}<label class="form-label" for="${id}">${f.l}</label><div class="input-group"><input class="form-control mono" id="${id}" type="number" inputmode="decimal" step="${f.step || 'any'}" ${f.min != null ? 'min="' + f.min + '"' : ''} ${f.max != null ? 'max="' + f.max + '"' : ''} data-k="${f.id}" data-type="num" value="${esc(v[f.id])}">${f.u ? `<span class="input-group-text">${f.u}</span>` : ''}</div>${ajuda}</div>`;
      case 'sel':
        return `${wrapOpen}<label class="form-label" for="${id}">${f.l}</label><select class="form-select" id="${id}" data-k="${f.id}" ${isNum(f.o[0][0]) ? 'data-type="num"' : ''}>${f.o.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(v[f.id]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>${ajuda}</div>`;
      case 'opt':
        return `${wrapOpen}<div class="form-label" id="${id}_l">${f.l}</div><div class="opt-group ${f.cols ? 'cols-' + f.cols : ''}" role="radiogroup" aria-labelledby="${id}_l">${f.o.map((o, i) => `<label class="opt"><input type="radio" name="${id}" data-k="${f.id}" ${isNum(o[0]) ? 'data-type="num"' : ''} value="${esc(o[0])}" ${String(o[0]) === String(v[f.id]) ? 'checked' : ''}><span class="opt-body">${o[2] != null ? `<b class="opt-pts">${esc(o[2])}</b>` : ''}<span>${esc(o[1])}</span></span></label>`).join('')}</div>${ajuda}</div>`;
      case 'chk':
        return `${wrapOpen}<label class="chk"><input class="form-check-input" type="checkbox" id="${id}" data-k="${f.id}" data-type="chk" ${v[f.id] ? 'checked' : ''}><span>${f.l}</span></label>${ajuda}</div>`;
      case 'range':
        return `${wrapOpen}<div class="d-flex justify-content-between align-items-baseline"><label class="form-label" for="${id}">${f.l}</label><output class="mono range-out" data-out="${f.id}">${esc(v[f.id])}</output></div><input type="range" class="form-range" id="${id}" min="${f.min}" max="${f.max}" step="${f.step || 1}" data-k="${f.id}" data-type="num" value="${esc(v[f.id])}">${f.ends ? `<div class="range-ends"><span>${f.ends[0]}</span><span>${f.ends[1]}</span></div>` : ''}${ajuda}</div>`;
      case 'likert': {
        const head = f.escala.map(e => `<th scope="col" title="${esc(e[1])}"><span>${esc(e[1])}</span></th>`).join('');
        let lastDim = null;
        const rows = f.itens.map((it, i) => {
          let dimRow = '';
          if (f.agrupar && it.dim !== lastDim) { lastDim = it.dim; dimRow = `<tr class="lk-dim"><th colspan="${f.escala.length + 1}">${esc((f.dims && f.dims[it.dim]) || it.dim)}</th></tr>`; }
          return dimRow + `<tr><th scope="row" class="lk-q"><span class="lk-n">${i + 1}</span>${esc(it.txt)}</th>${f.escala.map(e => `<td><label class="lk-cell" title="${esc(e[1])}"><input type="radio" name="${id}_${it.id}" data-k="${it.id}" data-type="num" value="${e[0]}" ${String(e[0]) === String(v[it.id]) ? 'checked' : ''} aria-label="${esc(it.txt)}: ${esc(e[1])}"><span></span></label></td>`).join('')}</tr>`;
        }).join('');
        return `<div class="fw fw-likert" data-fw="${esc(f.id || '')}">${f.l ? `<div class="form-label">${f.l}</div>` : ''}<div class="table-scroll"><table class="lk"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>${ajuda}</div>`;
      }
      case 'yn': {
        const ops = f.opts || [['s', 'Sim'], ['n', 'Não'], ['na', 'N/A']];
        let lastG = null;
        const rows = f.itens.map((it, i) => {
          let g = '';
          if (it.g && it.g !== lastG) { lastG = it.g; g = `<div class="yn-group">${esc(it.g)}</div>`; }
          return g + `<div class="yn-row"><div class="yn-q"><span class="lk-n">${i + 1}</span><span>${esc(it.txt)}${it.ref ? ` <em class="ref">${esc(it.ref)}</em>` : ''}</span></div><div class="yn-ops" role="radiogroup" aria-label="${esc(it.txt)}">${ops.map(o => `<label class="yn-op yn-${o[0]}"><input type="radio" name="${id}_${it.id}" data-k="${it.id}" value="${o[0]}" ${String(o[0]) === String(v[it.id]) ? 'checked' : ''}><span>${o[1]}</span></label>`).join('')}</div></div>`;
        }).join('');
        return `<div class="fw fw-yn" data-fw="${esc(f.id || '')}">${f.l ? `<div class="form-label">${f.l}</div>` : ''}${rows}${ajuda}</div>`;
      }
      case 'grid': return `<div class="fw fw-grid" data-fw="${esc(f.id)}" data-gridwrap="${f.id}">${gridHTML(f, v, tool)}</div>`;
      case 'matrix': {
        const head = f.cols.map(c => `<th scope="col">${esc(c.l)}</th>`).join('');
        const rows = f.rows.map(([rid, rl]) => `<tr><th scope="row">${esc(rl)}</th>${f.cols.map(c => `<td><select class="form-select form-select-sm" data-mx="${f.id}" data-row="${rid}" data-col="${c.id}" aria-label="${esc(rl)} — ${esc(c.l)}">${c.o.map(o => `<option value="${o[0]}" ${String(o[0]) === String(v[f.id][rid][c.id]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></td>`).join('')}${f.extraCol ? `<td class="mono mx-extra" data-mxout="${f.id}:${rid}"></td>` : ''}</tr>`).join('');
        return `<div class="fw fw-matrix" data-fw="${esc(f.id)}">${f.l ? `<div class="form-label">${f.l}</div>` : ''}<div class="table-scroll"><table class="table table-sm mx"><thead><tr><th></th>${head}${f.extraCol ? `<th>${esc(f.extraCol)}</th>` : ''}</tr></thead><tbody>${rows}</tbody></table></div>${ajuda}</div>`;
      }
      case 'pairs': {
        return `<div class="fw fw-pairs" data-fw="${esc(f.id)}">${f.l ? `<div class="form-label">${f.l}</div>` : ''}<div class="pairs">${f.pares.map(([a, b], i) => `<div class="pair" role="radiogroup" aria-label="Comparação ${i + 1}"><span class="lk-n">${i + 1}</span>${[a, b].map(x => `<label class="pair-op"><input type="radio" name="${id}_${i}" data-k="${f.id}_${i}" value="${x}" ${v[f.id + '_' + i] === x ? 'checked' : ''}><span>${esc(f.nomes[x])}</span></label>`).join('<span class="pair-vs">ou</span>')}</div>`).join('')}</div>${ajuda}</div>`;
      }
      case 'evals': {
        const lista = Store.all().filter(a => a.tool !== tool.id);
        const body = lista.length ? lista.map(a => { const t = Ergo.tool(a.tool); const nv = nivel(a.r.n); return `<label class="ev-row"><input class="form-check-input" type="checkbox" data-ev="${f.id}" value="${a.id}" ${(v[f.id] || []).includes(a.id) ? 'checked' : ''}><span class="ev-name">${esc(t ? t.sigla : a.tool)}<small>${esc(a.ident.atividade || a.ident.setor || '')} · ${dataBR(a.ident.data)}</small></span><span class="mono">${esc(a.r.score)}</span><span class="lv-pill ${nv.cls}">${nv.nome}</span></label>`; }).join('')
          : `<div class="empty-mini">Nenhuma avaliação salva ainda. Salve avaliações nas outras ferramentas (RULA, NIOSH, HSE-IT…) e elas aparecem aqui para compor a AET.</div>`;
        return `<div class="fw fw-evals" data-fw="${esc(f.id)}">${f.l ? `<div class="form-label">${f.l}</div>` : ''}<div class="ev-list">${body}</div>${ajuda}</div>`;
      }
      default: return '';
    }
  }

  function gridHTML(f, v, tool) {
    const rows = v[f.id] || [];
    const head = f.cols.map(c => `<th scope="col" ${c.wd ? `style="min-width:${c.wd}"` : ''}>${esc(c.l)}</th>`).join('');
    const body = rows.map((r, i) => `<tr>${f.cols.map(c => {
      const val = r[c.id] == null ? '' : r[c.id];
      const attrs = `data-grid="${f.id}" data-row="${i}" data-col="${c.id}" aria-label="${esc(c.l)} — linha ${i + 1}"`;
      if (c.t === 'sel') return `<td><select class="form-select form-select-sm" ${attrs} ${isNum(c.o[0][0]) ? 'data-type="num"' : ''}>${c.o.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(val) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></td>`;
      if (c.t === 'num') return `<td><input class="form-control form-control-sm mono" type="number" step="any" ${attrs} data-type="num" value="${esc(val)}"></td>`;
      if (c.t === 'calc') return `<td class="mono grid-calc" data-gcalc="${f.id}:${i}:${c.id}"></td>`;
      return `<td><input class="form-control form-control-sm" type="text" ${attrs} value="${esc(val)}"></td>`;
    }).join('')}<td class="grid-act"><button type="button" class="btn-icon sm" data-act="del-row" data-grid="${f.id}" data-row="${i}" aria-label="Remover linha ${i + 1}"><i data-lucide="trash-2"></i></button></td></tr>`).join('');
    return `${f.l ? `<div class="form-label">${f.l}</div>` : ''}<div class="table-scroll"><table class="table table-sm grid-t"><thead><tr>${head}<th></th></tr></thead><tbody>${body || `<tr><td colspan="${f.cols.length + 1}" class="empty-mini">Nenhuma linha. Use “Adicionar linha”.</td></tr>`}</tbody></table></div>
      <div class="d-flex flex-wrap gap-2 mt-2"><button type="button" class="btn btn-sm btn-outline-primary" data-act="add-row" data-grid="${f.id}"><i data-lucide="plus"></i> ${esc(f.addLabel || 'Adicionar linha')}</button>${(f.acoes || []).map(a => `<button type="button" class="btn btn-sm btn-outline-secondary" data-act="custom" data-acao="${a.id}"><i data-lucide="${a.icon || 'sparkles'}"></i> ${esc(a.l)}</button>`).join('')}</div>${f.h ? `<div class="f-help">${f.h}</div>` : ''}`;
  }

  /* ------------------------------------------------------------------ medidor (goniômetro) */
  function gauge(g, n) {
    if (!g) return '';
    const W = 220, cx = 110, cy = 112, R = 88;
    const frac = x => clamp((x - g.min) / (g.max - g.min), 0, 1);
    const pt = (f, r) => { const a = Math.PI * (1 - f); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
    const arc = (f0, f1, r) => { const [x0, y0] = pt(f0, r), [x1, y1] = pt(f1, r); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
    const lims = [g.min].concat(g.zonas || [], [g.max]);
    let seg = '';
    for (let i = 0; i < lims.length - 1; i++) seg += `<path d="${arc(frac(lims[i]), frac(lims[i + 1]), R)}" stroke="var(--lv${Math.min(i, 3)})" stroke-width="14" fill="none" opacity=".9"/>`;
    let ticks = '';
    for (let i = 0; i <= 20; i++) { const f = i / 20, big = i % 5 === 0; const [x0, y0] = pt(f, R - 12), [x1, y1] = pt(f, R - (big ? 22 : 17)); ticks += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="var(--muted)" stroke-width="${big ? 1.6 : 1}"/>`; }
    const vv = isNaN(g.v) ? g.min : g.v, f = frac(vv);
    const [nx, ny] = pt(f, R - 26);
    const lab = (x, anchor) => { const [lx, ly] = pt(frac(x), R + 14); return `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${anchor}" class="g-lab">${fmt(x, 2)}</text>`; };
    return `<svg class="gauge" viewBox="0 0 ${W} 132" role="img" aria-label="Medidor: ${fmt(vv, 2)} de ${fmt(g.max)}">${seg}${ticks}
      <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="var(--ink)"/><circle cx="${cx}" cy="${cy}" r="2.6" fill="var(--signal)"/>
      ${lab(g.min, 'start')}${lab(g.max, 'end')}</svg>`;
  }

  /* ------------------------------------------------------------------ gráficos */
  const charts = {};
  function destroyCharts(prefix) { Object.keys(charts).forEach(k => { if (!prefix || k.startsWith(prefix)) { try { charts[k].destroy(); } catch (e) { } delete charts[k]; } }); }
  function drawChart(canvas, spec) {
    if (!window.Chart || !canvas) { if (canvas) canvas.parentElement.innerHTML = '<div class="empty-mini">Gráfico indisponível sem conexão com a internet.</div>'; return; }
    const ink = cssVar('--ink'), muted = cssVar('--muted'), line = cssVar('--line'), accent = cssVar('--accent'), signal = cssVar('--signal');
    const pal = [accent, signal, cssVar('--lv2'), cssVar('--lv3'), cssVar('--lv0'), muted];
    const type = spec.type || 'bar';
    const datasets = spec.datasets.map((d, i) => {
      const base = { label: d.label || '', data: d.data, borderWidth: type === 'line' || type === 'radar' || type === 'scatter' ? 2 : 0, borderRadius: type === 'bar' ? 4 : 0 };
      let c = d.color || pal[i % pal.length];
      if (d.levels) c = d.levels.map(corNivel);
      if (type === 'doughnut' || type === 'pie') { base.backgroundColor = d.colors || d.data.map((_, j) => pal[j % pal.length]); base.borderColor = cssVar('--surface'); base.borderWidth = 2; return base; }
      base.backgroundColor = type === 'radar' ? hexA(c, .22) : (type === 'line' && d.fill ? hexA(c, .15) : c);
      base.borderColor = c; base.pointBackgroundColor = c; base.fill = !!d.fill; base.tension = .3;
      if (d.dash) base.borderDash = [6, 4];
      if (d.pointRadius != null) base.pointRadius = d.pointRadius;
      if (d.showLine != null) base.showLine = d.showLine;
      if (d.type) base.type = d.type;
      return base;
    });
    const scaleCommon = { grid: { color: line }, ticks: { color: muted, font: { family: 'Instrument Sans', size: 11 } }, border: { color: line } };
    const opts = {
      responsive: true, maintainAspectRatio: false, animation: spec.anim === false ? false : { duration: 250 },
      plugins: { legend: { display: !!spec.legend || type === 'doughnut', position: 'bottom', labels: { color: ink, boxWidth: 12, font: { family: 'Instrument Sans', size: 11 } } }, tooltip: { enabled: true } },
    };
    if (type === 'bar' || type === 'line' || type === 'scatter') {
      opts.indexAxis = spec.horizontal ? 'y' : 'x';
      const val = Object.assign({}, scaleCommon, { beginAtZero: true }); if (spec.max != null) val.max = spec.max; if (spec.min != null) val.min = spec.min;
      if (spec.yTitle) val.title = { display: true, text: spec.yTitle, color: muted };
      const cat = Object.assign({}, scaleCommon, { grid: { display: type !== 'bar', color: line } });
      if (spec.xTitle) cat.title = { display: true, text: spec.xTitle, color: muted };
      if (type === 'scatter') { cat.type = 'linear'; if (spec.xmax != null) cat.max = spec.xmax; if (spec.xmin != null) cat.min = spec.xmin; }
      opts.scales = spec.horizontal ? { x: val, y: cat } : { x: cat, y: val };
      if (spec.stacked) { opts.scales.x.stacked = true; opts.scales.y.stacked = true; }
    }
    if (type === 'radar') opts.scales = { r: { beginAtZero: true, max: spec.max, min: spec.min || 0, grid: { color: line }, angleLines: { color: line }, pointLabels: { color: ink, font: { family: 'Instrument Sans', size: 10 } }, ticks: { color: muted, backdropColor: 'transparent', showLabelBackdrop: false } } };
    if (type === 'doughnut') opts.cutout = '62%';
    const key = canvas.id;
    if (charts[key]) { try { charts[key].destroy(); } catch (e) { } }
    charts[key] = new Chart(canvas, { type, data: { labels: spec.labels, datasets }, options: opts });
  }
  function hexA(c, a) {
    if (!c || c[0] !== '#') return c;
    let h = c.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ------------------------------------------------------------------ toast */
  let toastT;
  function toast(msg, tipo) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast-msg ' + (tipo || ''); t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200);
  }
  const icons = () => { try { window.lucide && lucide.createIcons(); } catch (e) { } };

  /* ------------------------------------------------------------------ página da ferramenta */
  let cur = null; // { tool, v, ident, editId, exemplo, aba }

  function abrirFerramenta(tool, opts) {
    opts = opts || {};
    destroyCharts();
    let v, ident, editId = null, exemplo = true;
    if (opts.aval) { v = Object.assign(padrao(tool), deep(opts.aval.v)); ident = Object.assign(identPadrao(), deep(opts.aval.ident)); editId = opts.aval.id; exemplo = false; }
    else { v = padrao(tool); ident = identPadrao(); }
    cur = { tool, v, ident, editId, exemplo, aba: opts.aba || 'avaliar' };
    renderFerramenta();
  }

  function renderFerramenta() {
    const { tool } = cur;
    const cat = Ergo.cats[tool.cat];
    const view = $('#view');
    const hist = Store.byTool(tool.id);
    view.innerHTML = `
      <section class="tool-head">
        <div class="tool-head-txt">
          <div class="eyebrow"><i data-lucide="${cat.icon}"></i> ${esc(cat.nome)}</div>
          <h1>${esc(tool.nome)}</h1>
          <p class="lead-s">${tool.resumo}</p>
          <div class="norm-badges">${(tool.normas || []).map(n => `<span class="norm">${esc(n)}</span>`).join('')}</div>
        </div>
      </section>
      <div class="tabs" role="tablist">
        <button role="tab" class="tab ${cur.aba === 'avaliar' ? 'on' : ''}" data-aba="avaliar" aria-selected="${cur.aba === 'avaliar'}"><i data-lucide="clipboard-pen-line"></i> Avaliação</button>
        <button role="tab" class="tab ${cur.aba === 'painel' ? 'on' : ''}" data-aba="painel" aria-selected="${cur.aba === 'painel'}"><i data-lucide="chart-no-axes-combined"></i> Dashboard da ferramenta <span class="count">${hist.length}</span></button>
        <button role="tab" class="tab ${cur.aba === 'metodo' ? 'on' : ''}" data-aba="metodo" aria-selected="${cur.aba === 'metodo'}"><i data-lucide="book-open-text"></i> Método e normas</button>
      </div>
      <div id="tabBody"></div>`;
    $$('.tab', view).forEach(b => b.addEventListener('click', () => { cur.aba = b.dataset.aba; destroyCharts(); renderFerramenta(); }));
    const body = $('#tabBody');
    if (cur.aba === 'avaliar') renderAvaliacao(body);
    else if (cur.aba === 'painel') renderPainelFerramenta(body);
    else renderMetodo(body);
    icons();
  }

  function renderAvaliacao(body) {
    const { tool, v, ident } = cur;
    const identHTML = IDENT.map(f => `<div class="fw ${f.id === 'atividade' || f.id === 'empresa' ? 'w-full' : ''}"><label class="form-label" for="id_${f.id}">${f.l}</label><input class="form-control" id="id_${f.id}" type="${f.tipo || 'text'}" data-id="${f.id}" value="${esc(ident[f.id])}"></div>`).join('') +
      `<div class="fw w-full"><label class="form-label" for="id_obs">Observações e conclusões do avaliador (entram no relatório)</label><textarea class="form-control" id="id_obs" rows="2" data-id="obs">${esc(ident.obs)}</textarea></div>`;
    const secs = tool.secoes.map((s, i) => `<section class="f-card" ${s.id ? `id="sec_${s.id}"` : ''}>
        <header><span class="f-num">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(s.t)}</h2>${s.d ? `<p>${s.d}</p>` : ''}</div></header>
        <div class="f-grid">${(s.f || []).map(f => campo(f, v, tool)).join('')}</div>
      </section>`).join('');
    body.innerHTML = `
      <div class="eval-layout">
        <form class="eval-form" id="evalForm" autocomplete="off" novalidate>
          ${tool.topo ? tool.topo(cur) : ''}
          <section class="f-card f-ident">
            <header><span class="f-num"><i data-lucide="building-2"></i></span><div><h2>Identificação</h2><p>Dados do estabelecimento e do posto, compartilhados entre as ferramentas. ${cur.exemplo ? '<span class="pill-ex">Dados de exemplo — substitua pelos seus</span>' : ''}</p></div></header>
            <div class="f-grid">${identHTML}</div>
          </section>
          ${secs}
        </form>
        <aside class="eval-panel" id="evalPanel" aria-live="polite"></aside>
      </div>`;
    const form = $('#evalForm');
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    form.addEventListener('click', onClick);
    if (tool.bind) tool.bind(cur, form, atualizar);
    atualizar();
  }

  function marcarEditado() {
    if (cur.exemplo) { cur.exemplo = false; const p = $('.pill-ex'); if (p) p.remove(); }
  }
  function lerValor(t) {
    if (t.dataset.type === 'chk') return t.checked;
    if (t.dataset.type === 'num') { if (t.value === '') return ''; const x = num(t.value); return isNaN(x) ? t.value : x; }
    return t.value;
  }
  function onInput(e) {
    const t = e.target;
    if (t.dataset.id) { cur.ident[t.dataset.id] = t.value; marcarEditado(); return; }
    if (t.dataset.k) {
      if (t.type === 'radio' && !t.checked) return;
      cur.v[t.dataset.k] = lerValor(t);
      const out = $(`[data-out="${t.dataset.k}"]`); if (out) out.textContent = t.value;
    } else if (t.dataset.grid) {
      const row = cur.v[t.dataset.grid][+t.dataset.row]; if (row) row[t.dataset.col] = lerValor(t);
    } else if (t.dataset.mx) {
      cur.v[t.dataset.mx][t.dataset.row][t.dataset.col] = num(t.value);
    } else if (t.dataset.ev) {
      const arr = cur.v[t.dataset.ev] || (cur.v[t.dataset.ev] = []);
      if (t.checked) { if (!arr.includes(t.value)) arr.push(t.value); } else cur.v[t.dataset.ev] = arr.filter(x => x !== t.value);
    } else return;
    marcarEditado();
    if (e.type === 'input' && (t.type === 'text' || t.tagName === 'TEXTAREA')) { agendar(); return; }
    agendar();
  }
  let raf = 0;
  function agendar() { cancelAnimationFrame(raf); raf = requestAnimationFrame(atualizar); }

  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const f = camposDe(cur.tool).find(x => x.id === b.dataset.grid);
    if (b.dataset.act === 'add-row' && f) { cur.v[f.id].push(deep(f.novo || {})); redesenharGrid(f); }
    if (b.dataset.act === 'del-row' && f) { cur.v[f.id].splice(+b.dataset.row, 1); redesenharGrid(f); }
    if (b.dataset.act === 'custom' && cur.tool.acoes && cur.tool.acoes[b.dataset.acao]) {
      cur.tool.acoes[b.dataset.acao](cur, { redesenhar: () => camposDe(cur.tool).filter(x => x.t === 'grid').forEach(redesenharGrid), toast });
    }
    marcarEditado();
  }
  function redesenharGrid(f) { const w = $(`[data-gridwrap="${f.id}"]`); if (w) { w.innerHTML = gridHTML(f, cur.v, cur.tool); icons(); } atualizar(); }

  function visibilidade() {
    camposDe(cur.tool).forEach(f => { if (f.show && f.id) { const w = $(`[data-fw="${f.id}"]`); if (w) w.hidden = !f.show(cur.v); } });
  }

  function calcular(tool, v, ident) {
    try { return tool.calc(v, { Store, Ergo, ident: ident || {} }); }
    catch (err) { console.error(err); return { erro: String(err && err.message || err) }; }
  }

  function atualizar() {
    if (!cur) return;
    visibilidade();
    const { tool, v } = cur;
    const r = calcular(tool, v, cur.ident);
    cur.r = r;
    if (tool.after) tool.after(cur, r);
    const p = $('#evalPanel'); if (!p) return;
    if (r.erro) { p.innerHTML = `<div class="panel-card"><div class="empty-mini">Não foi possível calcular: ${esc(r.erro)}. Revise os campos preenchidos.</div></div>`; return; }
    const nv = nivel(r.faixa.n);
    p.innerHTML = `<div class="panel-card">
      <div class="panel-top"><span class="eyebrow">Resultado em tempo real</span><span class="lv-pill ${nv.cls}">${esc(r.faixa.rotulo || nv.nome)}</span></div>
      <div class="score-row">${gauge(r.gauge, r.faixa.n)}<div class="score-big"><span class="score-lab">${esc(r.scoreLabel || 'Pontuação')}</span><b class="mono">${esc(r.score)}</b>${r.scoreSub ? `<small>${esc(r.scoreSub)}</small>` : ''}</div></div>
      <div class="risk-scale" aria-hidden="true">${NIVEIS.map(n => `<span class="${n.cls} ${n.n === nv.n ? 'on' : ''}">${n.nome}</span>`).join('')}</div>
      <div class="faixa-box ${nv.cls}"><b>${esc(r.faixa.txt)}</b>${r.faixa.acao ? `<p>${esc(r.faixa.acao)}</p>` : ''}</div>
      ${(r.kpis || []).length ? `<div class="kpis">${r.kpis.map(k => `<div class="kpi ${k.n != null ? nivel(k.n).cls + ' has-lv' : ''}"><span>${esc(k.l)}</span><b class="mono">${esc(k.v)}</b>${k.s ? `<small>${esc(k.s)}</small>` : ''}</div>`).join('')}</div>` : ''}
      ${(r.charts || []).map((c, i) => `<figure class="chart-fig"><figcaption>${esc(c.title)}</figcaption><div class="chart-box" style="height:${c.h || 220}px"><canvas id="pc_${i}" aria-label="${esc(c.title)}"></canvas></div></figure>`).join('')}
      ${r.extra || ''}
      ${(r.recs || []).length ? `<div class="recs"><h3>Recomendações</h3><ul>${r.recs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      <div class="panel-actions">
        <button type="button" class="btn btn-primary" id="btSalvar"><i data-lucide="save"></i> ${cur.editId ? 'Atualizar avaliação' : 'Salvar avaliação'}</button>
        <button type="button" class="btn btn-signal" id="btRel"><i data-lucide="file-text"></i> Gerar relatório</button>
        <button type="button" class="btn btn-ghost" id="btEx"><i data-lucide="flask-conical"></i> Exemplo</button>
        <button type="button" class="btn btn-ghost" id="btLimpar"><i data-lucide="eraser"></i> Limpar</button>
      </div>
      ${cur.editId ? `<div class="edit-note">Editando avaliação salva em ${new Date(Store.find(cur.editId) ? Store.find(cur.editId).ts : Date.now()).toLocaleString('pt-BR')}. <a href="#" id="btNova">Começar nova</a></div>` : ''}
    </div>`;
    (r.charts || []).forEach((c, i) => drawChart($('#pc_' + i), Object.assign({ anim: false }, c)));
    if (tool.afterPanel) tool.afterPanel(cur, r, p);
    $('#btSalvar').onclick = salvar;
    $('#btRel').onclick = () => abrirRelatorio(cur.tool, cur.v, cur.ident, cur.r, true);
    $('#btEx').onclick = () => { cur.v = padrao(tool); cur.exemplo = true; renderFerramenta(); toast('Exemplo carregado.'); };
    $('#btLimpar').onclick = () => {
      const b = $('#btLimpar');
      if (!b.dataset.ok) { b.dataset.ok = '1'; b.innerHTML = 'Clique de novo para limpar'; setTimeout(() => { if (b.isConnected) { delete b.dataset.ok; b.innerHTML = '<i data-lucide="eraser"></i> Limpar'; icons(); } }, 3500); return; }
      cur.v = vazio(tool); cur.exemplo = false; cur.editId = null; renderFerramenta();
    };
    const bn = $('#btNova'); if (bn) bn.onclick = e => { e.preventDefault(); abrirFerramenta(tool); };
    $$('[data-gcalc]').forEach(td => { const [g, i, c] = td.dataset.gcalc.split(':'); const val = r.gridCalc && r.gridCalc[g] && r.gridCalc[g][i] ? r.gridCalc[g][i][c] : ''; td.innerHTML = val == null ? '' : val; });
    $$('[data-mxout]').forEach(td => { const [g, rid] = td.dataset.mxout.split(':'); td.innerHTML = r.mxCalc && r.mxCalc[g] ? (r.mxCalc[g][rid] || '') : ''; });
    icons();
  }

  function resumoResultado(r) { return { score: r.score, n: r.faixa.n, txt: r.faixa.txt, rotulo: r.faixa.rotulo || nivel(r.faixa.n).nome, scoreLabel: r.scoreLabel || 'Pontuação', num: r.scoreNum != null ? r.scoreNum : num(r.score) }; }

  function salvar() {
    const { tool, v, ident, r } = cur;
    if (r.erro) { toast('Corrija os campos antes de salvar.', 'err'); return; }
    const id = cur.editId || uid();
    const ok = Store.upsert({ id, tool: tool.id, ts: Date.now(), ident: deep(ident), v: deep(v), r: resumoResultado(r) });
    Store.db.ident = Object.fromEntries(IDENT.filter(f => f.id !== 'data').map(f => [f.id, ident[f.id]]));
    Store.save();
    cur.editId = id;
    toast(ok ? 'Avaliação salva neste navegador.' : 'Avaliação mantida apenas nesta sessão (armazenamento indisponível).', ok ? 'ok' : 'warn');
    const c = $('.tab[data-aba="painel"] .count'); if (c) c.textContent = Store.byTool(tool.id).length;
    atualizar();
    window.dispatchEvent(new Event('ergo:saved'));
  }

  /* ------------------------------------------------------------------ dashboard da ferramenta */
  function renderPainelFerramenta(body) {
    const { tool } = cur;
    const lista = Store.byTool(tool.id);
    if (!lista.length) {
      body.innerHTML = `<div class="empty-state"><i data-lucide="chart-spline"></i><h2>Nenhuma avaliação salva para ${esc(tool.sigla)}</h2><p>Preencha a aba Avaliação e clique em “Salvar avaliação”. Os indicadores desta ferramenta (quantidade, distribuição por nível de risco, evolução e ranking de postos) aparecem aqui.</p><button class="btn btn-primary" id="goAval"><i data-lucide="clipboard-pen-line"></i> Ir para a avaliação</button></div>`;
      $('#goAval').onclick = () => { cur.aba = 'avaliar'; renderFerramenta(); };
      icons(); return;
    }
    const nums = lista.map(a => a.r.num).filter(x => !isNaN(x));
    const altos = lista.filter(a => a.r.n >= 2).length;
    const porNivel = [0, 1, 2, 3].map(n => lista.filter(a => a.r.n === n).length);
    const setores = {};
    lista.forEach(a => { const s = a.ident.setor || 'Sem setor'; (setores[s] = setores[s] || []).push(a); });
    const ranking = lista.slice().sort((a, b) => b.r.n - a.r.n || (b.r.num || 0) - (a.r.num || 0)).slice(0, 8);
    const crono = lista.slice().sort((a, b) => a.ts - b.ts);
    body.innerHTML = `
      <div class="dash-kpis">
        <div class="kpi-l"><span>Avaliações salvas</span><b class="mono">${lista.length}</b><small>${Object.keys(setores).length} setor(es)</small></div>
        <div class="kpi-l"><span>${esc(lista[0].r.scoreLabel)} médio</span><b class="mono">${fmt(mean(nums), 2)}</b><small>mín. ${fmt(Math.min(...nums), 2)} · máx. ${fmt(Math.max(...nums), 2)}</small></div>
        <div class="kpi-l lv2 has-lv"><span>Alto ou muito alto</span><b class="mono">${fmt(altos / lista.length * 100, 0)}%</b><small>${altos} de ${lista.length} avaliações</small></div>
        <div class="kpi-l"><span>Última avaliação</span><b class="mono">${dataBR(lista[0].ident.data)}</b><small>${esc(lista[0].ident.atividade || '—')}</small></div>
      </div>
      <div class="dash-grid">
        <figure class="dash-card"><figcaption>Distribuição por nível de risco</figcaption><div class="chart-box" style="height:240px"><canvas id="hd_1"></canvas></div></figure>
        <figure class="dash-card"><figcaption>Evolução do resultado (${esc(lista[0].r.scoreLabel)})</figcaption><div class="chart-box" style="height:240px"><canvas id="hd_2"></canvas></div></figure>
        <figure class="dash-card"><figcaption>Nível médio por setor</figcaption><div class="chart-box" style="height:240px"><canvas id="hd_3"></canvas></div></figure>
      </div>
      <section class="dash-card"><h2 class="h-sm">Postos priorizados</h2>${tabelaAvals(ranking, false)}</section>
      <section class="dash-card"><h2 class="h-sm">Todas as avaliações de ${esc(tool.sigla)}</h2>${tabelaAvals(lista, false)}</section>`;
    drawChart($('#hd_1'), { type: 'doughnut', labels: NIVEIS.map(n => n.nome), datasets: [{ data: porNivel, colors: [0, 1, 2, 3].map(corNivel) }] });
    drawChart($('#hd_2'), { type: 'line', labels: crono.map(a => dataBR(a.ident.data)), datasets: [{ label: lista[0].r.scoreLabel, data: crono.map(a => a.r.num), fill: true }] });
    const sk = Object.keys(setores);
    drawChart($('#hd_3'), { type: 'bar', horizontal: true, max: 3, labels: sk, datasets: [{ label: 'Nível médio (0–3)', data: sk.map(s => +mean(setores[s].map(a => a.r.n)).toFixed(2)), levels: sk.map(s => Math.round(mean(setores[s].map(a => a.r.n)))) }] });
    ligarTabela(body);
    icons();
  }

  function tabelaAvals(lista, mostrarFerr) {
    return `<div class="table-scroll"><table class="table table-sm av-t"><thead><tr><th>Data</th>${mostrarFerr ? '<th>Ferramenta</th>' : ''}<th>Setor</th><th>Atividade / posto</th><th>Resultado</th><th>Nível</th><th class="text-end">Ações</th></tr></thead><tbody>${lista.map(a => {
      const t = Ergo.tool(a.tool), nv = nivel(a.r.n);
      return `<tr><td class="mono">${dataBR(a.ident.data)}</td>${mostrarFerr ? `<td><a href="#${t ? t.id : ''}">${esc(t ? t.sigla : a.tool)}</a></td>` : ''}<td>${esc(a.ident.setor || '—')}</td><td>${esc(a.ident.atividade || '—')}</td><td class="mono">${esc(a.r.score)}</td><td><span class="lv-pill ${nv.cls}">${esc(a.r.rotulo || nv.nome)}</span></td>
        <td class="text-end text-nowrap"><button class="btn-icon sm" data-av="abrir" data-id="${a.id}" title="Abrir e editar" aria-label="Abrir avaliação"><i data-lucide="pencil"></i></button><button class="btn-icon sm" data-av="rel" data-id="${a.id}" title="Relatório" aria-label="Gerar relatório"><i data-lucide="file-text"></i></button><button class="btn-icon sm danger" data-av="del" data-id="${a.id}" title="Excluir" aria-label="Excluir avaliação"><i data-lucide="trash-2"></i></button></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  function ligarTabela(root, onChange) {
    $$('[data-av]', root).forEach(b => b.addEventListener('click', () => {
      const a = Store.find(b.dataset.id); if (!a) return; const t = Ergo.tool(a.tool);
      if (b.dataset.av === 'abrir') { if (location.hash.slice(1) === t.id) abrirFerramenta(t, { aval: a }); else { Ergo._pend = a; location.hash = t.id; } }
      if (b.dataset.av === 'rel') { const r = calcular(t, Object.assign(padrao(t), a.v), a.ident); abrirRelatorio(t, Object.assign(padrao(t), a.v), a.ident, r, false); }
      if (b.dataset.av === 'del') {
        if (!b.dataset.ok) { b.dataset.ok = 1; b.classList.add('armed'); b.title = 'Clique de novo para excluir'; toast('Clique novamente na lixeira para confirmar a exclusão.'); setTimeout(() => { delete b.dataset.ok; b.classList.remove('armed'); }, 3500); return; }
        Store.remove(a.id); toast('Avaliação excluída.');
        if (onChange) onChange(); else if (cur) { destroyCharts(); renderFerramenta(); }
        window.dispatchEvent(new Event('ergo:saved'));
      }
    }));
  }

  function renderMetodo(body) {
    const t = cur.tool;
    body.innerHTML = `<div class="metodo">
      <article class="metodo-txt">${t.metodo || ''}</article>
      <aside class="metodo-side">
        <h3>Enquadramento normativo</h3>${(t.normasTxt || NORMAS_PADRAO(t)).map(x => `<p>${x}</p>`).join('')}
        ${t.refs ? `<h3>Referências</h3><ul>${t.refs.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
      </aside></div>`;
    icons();
  }
  const NORMAS_PADRAO = t => [
    '<b>NR 17, item 17.3</b>: a organização deve realizar a Avaliação Ergonômica Preliminar (AEP) das situações de trabalho e, quando necessário, a Análise Ergonômica do Trabalho (AET). Ferramentas como esta servem de apoio técnico à AEP e à AET.',
    '<b>NR 01, item 1.5 (GRO)</b>: os perigos e riscos identificados devem compor o inventário de riscos e o plano de ação do PGR, com classificação por severidade e probabilidade.'
  ];

  /* ------------------------------------------------------------------ relatório */
  function valorCampoTxt(f, v) {
    switch (f.t) {
      case 'sel': case 'opt': return optLabel(f, v[f.id]);
      case 'chk': return v[f.id] ? 'Sim' : 'Não';
      case 'num': return (v[f.id] === '' || v[f.id] == null) ? '—' : fmt(v[f.id], 3) + (f.u ? ' ' + f.u : '');
      case 'range': return fmt(v[f.id], 1);
      default: return v[f.id] == null || v[f.id] === '' ? '—' : String(v[f.id]);
    }
  }
  function entradasHTML(tool, v) {
    let h = '';
    tool.secoes.forEach(s => {
      const partes = [];
      (s.f || []).forEach(f => {
        if (f.show && !f.show(v)) return;
        if (f.t === 'info' || f.noReport) return;
        if (['sel', 'opt', 'chk', 'num', 'range', 'txt', 'date'].includes(f.t)) partes.push(`<tr><th>${f.l}</th><td>${esc(valorCampoTxt(f, v))}</td></tr>`);
        else if (f.t === 'area') { if (v[f.id]) partes.push(`<tr><th>${f.l}</th><td>${esc(v[f.id]).replace(/\n/g, '<br>')}</td></tr>`); }
        else if (f.t === 'likert') partes.push(`<tr><td colspan="2"><table class="rp-mini"><thead><tr><th>Item</th><th>Resposta</th></tr></thead><tbody>${f.itens.map((it, i) => `<tr><td>${i + 1}. ${esc(it.txt)}</td><td>${esc((f.escala.find(e => String(e[0]) === String(v[it.id])) || ['', '—'])[1])}</td></tr>`).join('')}</tbody></table></td></tr>`);
        else if (f.t === 'yn') { const ops = Object.fromEntries((f.opts || [['s', 'Sim'], ['n', 'Não'], ['na', 'N/A']])); partes.push(`<tr><td colspan="2"><table class="rp-mini"><thead><tr><th>Item</th><th>Resposta</th></tr></thead><tbody>${f.itens.map((it, i) => `<tr class="${v[it.id] === (f.ruim || 'n') ? 'rp-flag' : ''}"><td>${i + 1}. ${esc(it.txt)}</td><td>${esc(ops[v[it.id]] || '—')}</td></tr>`).join('')}</tbody></table></td></tr>`); }
        else if (f.t === 'grid') { const rows = v[f.id] || []; partes.push(`<tr><td colspan="2">${f.l ? `<div class="rp-sub">${f.l}</div>` : ''}<table class="rp-mini"><thead><tr>${f.cols.filter(c => c.t !== 'calc').map(c => `<th>${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${f.cols.filter(c => c.t !== 'calc').map(c => `<td>${esc(c.t === 'sel' ? optLabel(c, r[c.id]) : (r[c.id] == null ? '' : r[c.id]))}</td>`).join('')}</tr>`).join('') || '<tr><td>—</td></tr>'}</tbody></table></td></tr>`); }
        else if (f.t === 'matrix') partes.push(`<tr><td colspan="2">${f.l ? `<div class="rp-sub">${f.l}</div>` : ''}<table class="rp-mini"><thead><tr><th></th>${f.cols.map(c => `<th>${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${f.rows.map(([rid, rl]) => `<tr><td>${esc(rl)}</td>${f.cols.map(c => `<td>${esc(optLabel(c, v[f.id][rid][c.id]))}</td>`).join('')}</tr>`).join('')}</tbody></table></td></tr>`);
        else if (f.t === 'pairs') partes.push(`<tr><th>${f.l || 'Comparações'}</th><td>${f.pares.map((p, i) => esc(f.nomes[v[f.id + '_' + i]])).join(' · ')}</td></tr>`);
        else if (f.t === 'evals') { const ids = v[f.id] || []; partes.push(`<tr><th>${f.l}</th><td>${ids.length ? ids.map(id => { const a = Store.find(id); if (!a) return ''; const t = Ergo.tool(a.tool); return `${esc(t ? t.sigla : a.tool)}: ${esc(a.r.score)} (${esc(a.r.rotulo)}) — ${esc(a.ident.atividade || '')}`; }).join('<br>') : '—'}</td></tr>`); }
      });
      if (partes.length) h += `<h4 class="rp-h4">${esc(s.t)}</h4><table class="rp-t">${partes.join('')}</table>`;
    });
    return h;
  }

  function abrirRelatorio(tool, v, ident, r, doPainel) {
    if (r.erro) { toast('Corrija os campos antes de gerar o relatório.', 'err'); return; }
    const imgs = [];
    if (doPainel) $$('#evalPanel canvas').forEach(c => { try { imgs.push(c.toDataURL('image/png')); } catch (e) { } });
    const nv = nivel(r.faixa.n), cat = Ergo.cats[tool.cat];
    const linhasId = IDENT.map(f => `<tr><th>${f.l}</th><td>${esc(f.id === 'data' ? dataBR(ident[f.id]) : (ident[f.id] || '—'))}</td></tr>`).join('');
    const html = `
      <header class="rp-head">
        <div class="rp-brand"><svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true"><path d="M6 38a18 18 0 0 1 36 0" fill="none" stroke="#0C2A31" stroke-width="4" stroke-linecap="round"/><path d="M24 38 35 17" stroke="#E0A100" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="38" r="4.5" fill="#0C2A31"/></svg><div><b>ErgoNorma</b><span>Relatório técnico de avaliação ergonômica</span></div></div>
        <div class="rp-meta"><span>${esc(cat.nome)}</span><span>Emitido em ${new Date().toLocaleString('pt-BR')}</span></div>
      </header>
      <h1 class="rp-title">${esc(tool.nome)}</h1>
      <p class="rp-lead">${esc(ident.atividade || '')}${ident.setor ? ' · Setor ' + esc(ident.setor) : ''}</p>
      <section class="rp-sec"><h3>1. Identificação</h3><table class="rp-t">${linhasId}</table></section>
      <section class="rp-sec"><h3>2. Objetivo e enquadramento normativo</h3>
        <p>Avaliação realizada com o método <b>${esc(tool.sigla)}</b> como subsídio técnico ao processo ergonômico previsto na NR 17 (Ergonomia) e ao Gerenciamento de Riscos Ocupacionais da NR 01 (inventário de riscos e plano de ação do PGR).</p>
        ${(tool.normasTxt || NORMAS_PADRAO(tool)).map(x => `<p class="rp-small">${x}</p>`).join('')}
      </section>
      <section class="rp-sec"><h3>3. Resultado</h3>
        <div class="rp-result rp-${nv.cls}"><div><span>${esc(r.scoreLabel || 'Pontuação')}</span><b>${esc(r.score)}</b>${r.scoreSub ? `<small>${esc(r.scoreSub)}</small>` : ''}</div><div><span>Classificação</span><b>${esc(r.faixa.rotulo || nv.nome)}</b></div></div>
        <p><b>${esc(r.faixa.txt)}</b>${r.faixa.acao ? ' ' + esc(r.faixa.acao) : ''}</p>
        ${(r.kpis || []).length ? `<table class="rp-t rp-kpi"><tbody>${r.kpis.map(k => `<tr><th>${esc(k.l)}</th><td>${esc(k.v)}${k.s ? ` <small>(${esc(k.s)})</small>` : ''}</td></tr>`).join('')}</tbody></table>` : ''}
        ${imgs.length ? `<div class="rp-charts">${imgs.map((src, i) => `<figure><img src="${src}" alt="Gráfico ${i + 1}"><figcaption>${esc((r.charts[i] || {}).title || '')}</figcaption></figure>`).join('')}</div>` : ''}
        ${r.extraReport || ''}
      </section>
      ${(r.recs || []).length ? `<section class="rp-sec"><h3>4. Recomendações</h3><ol>${r.recs.map(x => `<li>${esc(x)}</li>`).join('')}</ol></section>` : ''}
      <section class="rp-sec"><h3>${(r.recs || []).length ? 5 : 4}. Dados registrados na avaliação</h3>${entradasHTML(tool, v)}</section>
      ${ident.obs ? `<section class="rp-sec"><h3>Observações e conclusões do avaliador</h3><p>${esc(ident.obs).replace(/\n/g, '<br>')}</p></section>` : ''}
      <section class="rp-sec rp-ass"><div><span></span>${esc(ident.avaliador || 'Avaliador(a) responsável')}<small>Responsável técnico</small></div><div><span></span>Representante da organização<small>Ciência</small></div></section>
      <footer class="rp-foot">Documento gerado pelo ErgoNorma. O método é uma ferramenta de apoio; a interpretação e as medidas de controle cabem ao profissional habilitado, considerando a participação dos trabalhadores (NR 17, 17.3.4) e o PGR (NR 01).</footer>`;
    $('#reportPaper').innerHTML = html;
    $('#reportTitle').textContent = 'Relatório — ' + tool.sigla;
    const rv = $('#reportView'); rv.hidden = false; document.body.classList.add('rp-open');
    rv.dataset.nome = (tool.sigla + '_' + (ident.atividade || 'avaliacao')).replace(/[^\w\-]+/g, '_').slice(0, 60);
    icons();
    $('.report-scroll').scrollTop = 0;
  }
  function fecharRelatorio() { $('#reportView').hidden = true; document.body.classList.remove('rp-open'); }

  function relatorioStandalone() {
    let css = '';
    try { for (const sh of document.styleSheets) { try { for (const rule of sh.cssRules) { if (rule.cssText.includes('.rp-') || rule.cssText.includes('.report-paper')) css += rule.cssText + '\n'; } } catch (e) { } } } catch (e) { }
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc($('#reportTitle').textContent)}</title><style>:root{--lv0:#1E9E6A;--lv1:#D9A400;--lv2:#E0592A;--lv3:#7B3FD1}body{margin:0;background:#fff;color:#0C2A31;font-family:'Instrument Sans',Arial,sans-serif}${css}</style></head><body><article class="report-paper">${$('#reportPaper').innerHTML}</article></body></html>`;
  }
  function ligarRelatorio() {
    $('#rpClose').onclick = fecharRelatorio;
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#reportView').hidden) fecharRelatorio(); });
    $('#rpPrint').onclick = () => { try { window.print(); } catch (e) { } setTimeout(() => toast('Se a janela de impressão não abrir, use “Baixar HTML” e imprima o arquivo, ou abra o site publicado/local.'), 600); };
    $('#rpDownload').onclick = () => {
      try {
        const blob = new Blob([relatorioStandalone()], { type: 'text/html' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ($('#reportView').dataset.nome || 'relatorio') + '.html';
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        toast('Download iniciado. Abra o arquivo e imprima como PDF.');
      } catch (e) { toast('Download bloqueado neste ambiente. Use “Copiar texto”.', 'warn'); }
    };
    $('#rpCopy').onclick = () => {
      const txt = $('#reportPaper').innerText;
      const ok = () => toast('Texto do relatório copiado.', 'ok');
      const fallback = () => { const r = document.createRange(); r.selectNodeContents($('#reportPaper')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Texto selecionado: use Ctrl+C para copiar.'); };
      try { navigator.clipboard.writeText(txt).then(ok, fallback); } catch (e) { fallback(); }
    };
  }

  /* ------------------------------------------------------------------ exportação */
  Object.assign(Ergo, {
    abrirFerramenta, renderFerramenta, atualizar: () => atualizar(),
    drawChart, destroyCharts, gauge, tabelaAvals, ligarTabela, toast, icons, ligarRelatorio,
    padrao, calcular, abrirRelatorio, NIVEIS, corNivel
  });
  Object.defineProperty(Ergo, 'cur', { get: () => cur });
})();
