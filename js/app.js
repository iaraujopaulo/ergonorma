/* ErgoNorma — menus, rotas, página inicial e histórico */
(function () {
  'use strict';
  const E = window.Ergo, { esc, fmt, nivel, dataBR, mean } = E.util;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

  /* ---------------- tema: segue o host (data-theme) ou o sistema, com alternância manual */
  const root = document.documentElement;
  function temaEfetivo() { const t = root.getAttribute('data-theme'); if (t === 'dark' || t === 'light') return t; return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function aplicarTema() { root.setAttribute('data-bs-theme', temaEfetivo()); }
  aplicarTema();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { aplicarTema(); redesenhar(); });
  new MutationObserver(m => { if (m.some(x => x.attributeName === 'data-theme')) { aplicarTema(); redesenhar(); } }).observe(root, { attributes: true });
  try { const s = localStorage.getItem('ergonorma.tema'); if (s) root.setAttribute('data-theme', s); } catch (e) { }
  $('#themeToggle').addEventListener('click', () => {
    const novo = temaEfetivo() === 'dark' ? 'light' : 'dark'; root.setAttribute('data-theme', novo);
    try { localStorage.setItem('ergonorma.tema', novo); } catch (e) { }
  });
  let redesenhoT;
  function redesenhar() { clearTimeout(redesenhoT); redesenhoT = setTimeout(() => { if (rotaAtual) rotear(true); }, 60); }

  /* ---------------- menu lateral (categorias e ferramentas em ordem alfabética) */
  function menu() {
    const q = ($('#menuSearch').value || '').trim().toLowerCase();
    const match = t => !q || (t.nome + ' ' + t.sigla + ' ' + (t.tags || '')).toLowerCase().includes(q);
    let h = `<div class="menu-top"><a href="#inicio" data-r="inicio"><i data-lucide="gauge"></i> Painel geral</a><a href="#todas" data-r="todas"><i data-lucide="layout-grid"></i> Todas as ferramentas (A–Z)</a><a href="#historico" data-r="historico"><i data-lucide="history"></i> Histórico e relatórios</a></div>`;
    E.catsSorted().forEach(c => {
      const ts = E.sorted(E.tools.filter(t => t.cat === c.id)).filter(match);
      if (!ts.length) return;
      const aberto = q || (rotaAtual && E.tool(rotaAtual) && E.tool(rotaAtual).cat === c.id);
      h += `<details class="menu-cat" ${aberto ? 'open' : ''}><summary><i data-lucide="${c.icon}"></i><span>${esc(c.nome)}</span><span class="cnt">${ts.length}</span><i class="chev" data-lucide="chevron-right"></i></summary><div class="menu-tools">${ts.map(t => `<a class="menu-tool" href="#${t.id}" data-r="${t.id}"><span>${esc(t.menu || t.nome)}</span></a>`).join('')}</div></details>`;
    });
    $('#menu').innerHTML = h;
    marcarMenu();
    E.icons();
  }
  function marcarMenu() { $$('#menu [data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === rotaAtual)); }
  $('#menuSearch').addEventListener('input', menu);
  const side = $('#side'), back = $('#sideBackdrop');
  const abrirSide = () => { side.classList.add('open'); back.classList.add('open'); };
  const fecharSide = () => { side.classList.remove('open'); back.classList.remove('open'); };
  $('#sideOpen').addEventListener('click', abrirSide);
  $('#sideClose').addEventListener('click', fecharSide);
  back.addEventListener('click', fecharSide);
  $('#menu').addEventListener('click', e => { if (e.target.closest('a')) fecharSide(); });

  /* ---------------- rotas por #hash */
  let rotaAtual = null;
  function rotear(forcar) {
    const h = (location.hash || '#inicio').slice(1) || 'inicio';
    if (h === rotaAtual && !forcar) return;
    const mudou = h !== rotaAtual;
    rotaAtual = h;
    E.destroyCharts();
    const t = E.tool(h);
    if (t) {
      $('#crumbs').innerHTML = `<a href="#inicio">Início</a> / ${esc(E.cats[t.cat].nome)} / <b>${esc(t.sigla)}</b>`;
      if (E._pend && E._pend.tool === t.id) { const a = E._pend; E._pend = null; E.abrirFerramenta(t, { aval: a }); }
      else if (forcar && !mudou && E.cur && E.cur.tool === t) E.renderFerramenta(); else E.abrirFerramenta(t);
    } else if (h === 'todas') { $('#crumbs').innerHTML = '<a href="#inicio">Início</a> / <b>Ferramentas A–Z</b>'; paginaTodas(); }
    else if (h === 'historico') { $('#crumbs').innerHTML = '<a href="#inicio">Início</a> / <b>Histórico e relatórios</b>'; paginaHistorico(); }
    else { rotaAtual = 'inicio'; $('#crumbs').innerHTML = '<b>Painel geral</b>'; paginaInicio(); }
    if (mudou) { window.scrollTo(0, 0); menu(); }
    else marcarMenu();
    E.icons();
  }
  window.addEventListener('hashchange', () => rotear());
  window.addEventListener('ergo:saved', () => { if (rotaAtual === 'inicio' || rotaAtual === 'historico') rotear(true); });

  /* ---------------- painel geral */
  function paginaInicio() {
    const avals = E.Store.all();
    const usadas = new Set(avals.map(a => a.tool));
    const altos = avals.filter(a => a.r.n >= 2).length;
    const cats = E.catsSorted();
    $('#view').innerHTML = `
      <section class="hero">
        <div>
          <div class="eyebrow"><i data-lucide="shield-check"></i> NR 17 · NR 01 · GRO/PGR</div>
          <h1>Análise ergonômica do diagnóstico ao plano de ação</h1>
          <p>${E.tools.length} ferramentas organizadas por menus em ordem alfabética. Cada uma calcula o resultado enquanto você preenche, mostra indicadores e gráficos e gera o relatório técnico pronto para anexar à AEP, à AET e ao inventário de riscos do PGR.</p>
          <div class="hero-actions"><a class="btn btn-signal" href="#aep"><i data-lucide="play"></i> Começar pela AEP</a><a class="btn btn-ghost" href="#todas"><i data-lucide="layout-grid"></i> Ver ferramentas A–Z</a></div>
        </div>
        <div class="hero-flow" aria-label="Fluxo recomendado">
          <a class="flow-step" href="#aep"><span class="k">1</span><span><b>AEP – Avaliação Ergonômica Preliminar</b><small>Identifica perigos (NR 17, 17.3.1)</small></span></a>
          <a class="flow-step" href="#todas"><span class="k">2</span><span><b>Ferramentas específicas</b><small>RULA, REBA, NIOSH, OCRA, HSE-IT…</small></span></a>
          <a class="flow-step" href="#aet"><span class="k">3</span><span><b>AET – Análise Ergonômica do Trabalho</b><small>Aprofunda quando a AEP indica (17.3.2)</small></span></a>
          <a class="flow-step" href="#pgr"><span class="k">4</span><span><b>Inventário de riscos e plano de ação</b><small>PGR (NR 01, 1.5.7)</small></span></a>
        </div>
      </section>
      <div class="dash-kpis">
        <div class="kpi-l"><span>Avaliações salvas</span><b class="mono">${avals.length}</b><small>neste navegador</small></div>
        <div class="kpi-l"><span>Ferramentas utilizadas</span><b class="mono">${usadas.size}<small class="mono"> / ${E.tools.length}</small></b><small>${fmt(usadas.size / E.tools.length * 100, 0)}% do portfólio</small></div>
        <div class="kpi-l lv2 has-lv"><span>Situações alto ou muito alto</span><b class="mono">${altos}</b><small>${avals.length ? fmt(altos / avals.length * 100, 0) + '% das avaliações' : 'sem avaliações'}</small></div>
        <div class="kpi-l"><span>Setores avaliados</span><b class="mono">${new Set(avals.map(a => a.ident.setor).filter(Boolean)).size}</b><small>${avals[0] ? 'última em ' + dataBR(avals[0].ident.data) : 'nenhuma ainda'}</small></div>
      </div>
      ${avals.length ? `<div class="dash-grid">
        <figure class="dash-card"><figcaption>Avaliações por nível de risco</figcaption><div class="chart-box" style="height:240px"><canvas id="g_niv"></canvas></div></figure>
        <figure class="dash-card"><figcaption>Avaliações por categoria</figcaption><div class="chart-box" style="height:240px"><canvas id="g_cat"></canvas></div></figure>
        <figure class="dash-card"><figcaption>Nível médio por setor (0 = baixo · 3 = muito alto)</figcaption><div class="chart-box" style="height:240px"><canvas id="g_set"></canvas></div></figure>
      </div>
      <section class="dash-card"><h2 class="h-sm">Avaliações recentes</h2>${E.tabelaAvals(avals.slice(0, 8), true)}</section>`
        : `<div class="empty-state"><i data-lucide="chart-pie"></i><h2>Os indicadores gerais aparecem aqui</h2><p>Abra qualquer ferramenta, revise o exemplo preenchido ou substitua pelos seus dados e clique em “Salvar avaliação”. O painel geral reúne nível de risco, categorias e setores de todas as avaliações.</p><a class="btn btn-primary" href="#rula"><i data-lucide="person-standing"></i> Experimentar com o RULA</a></div>`}
      <div class="sec-h"><h2>Menus de ferramentas</h2><p>Categorias e ferramentas em ordem alfabética</p></div>
      <div class="tool-grid">${cats.map(c => {
        const ts = E.sorted(E.tools.filter(t => t.cat === c.id));
        return `<section class="dash-card" style="margin:0"><div class="eyebrow"><i data-lucide="${c.icon}"></i> ${ts.length} ferramentas</div><h3 class="h-sm" style="margin-top:6px">${esc(c.nome)}</h3><ul class="mini-list">${ts.map(t => `<li><a href="#${t.id}">${esc(t.menu || t.nome)}</a><span class="mono" style="color:var(--muted)">${E.Store.byTool(t.id).length || ''}</span></li>`).join('')}</ul></section>`;
      }).join('')}</div>
      <div class="sec-h"><h2>Backup das avaliações</h2><p>Os dados ficam no seu navegador. Exporte para guardar ou levar a outro computador.</p></div>
      <div class="backup"><button class="btn btn-ghost" id="bkExp"><i data-lucide="download"></i> Exportar backup (.json)</button><label class="btn btn-ghost mb-0"><i data-lucide="upload"></i> Importar backup<input type="file" id="bkImp" accept="application/json,.json" hidden></label></div>`;
    if (avals.length) {
      const pn = [0, 1, 2, 3].map(n => avals.filter(a => a.r.n === n).length);
      E.drawChart($('#g_niv'), { type: 'doughnut', labels: E.NIVEIS.map(n => n.nome), datasets: [{ data: pn, colors: [0, 1, 2, 3].map(E.corNivel) }] });
      const cc = cats.map(c => avals.filter(a => { const t = E.tool(a.tool); return t && t.cat === c.id; }).length);
      E.drawChart($('#g_cat'), { type: 'bar', horizontal: true, labels: cats.map(c => c.nome.split(' –')[0].split(',')[0]), datasets: [{ label: 'Avaliações', data: cc }] });
      const setores = {}; avals.forEach(a => { const s = a.ident.setor || 'Sem setor'; (setores[s] = setores[s] || []).push(a.r.n); });
      const sk = Object.keys(setores);
      E.drawChart($('#g_set'), { type: 'bar', max: 3, labels: sk, datasets: [{ label: 'Nível médio', data: sk.map(s => +mean(setores[s]).toFixed(2)), levels: sk.map(s => Math.round(mean(setores[s]))) }] });
      E.ligarTabela($('#view'), () => rotear(true));
    }
    $('#bkExp').onclick = () => {
      try {
        const blob = new Blob([JSON.stringify(E.Store.db, null, 1)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ergonorma-backup-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
      } catch (e) { E.toast('Download bloqueado neste ambiente.', 'warn'); }
    };
    $('#bkImp').onchange = ev => {
      const f = ev.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result); if (!Array.isArray(d.avals)) throw new Error('formato');
          const ids = new Set(E.Store.db.avals.map(a => a.id)); let n = 0;
          d.avals.forEach(a => { if (!ids.has(a.id) && E.tool(a.tool)) { E.Store.db.avals.push(a); n++; } });
          E.Store.save(); E.toast(n + ' avaliação(ões) importada(s).', 'ok'); rotear(true);
        } catch (e) { E.toast('Arquivo inválido: use um backup exportado pelo ErgoNorma.', 'err'); }
      };
      rd.readAsText(f);
    };
  }

  /* ---------------- todas as ferramentas A–Z */
  let filtroCat = '', filtroTxt = '';
  function paginaTodas() {
    const cats = E.catsSorted();
    $('#view').innerHTML = `
      <section class="tool-head"><div class="eyebrow"><i data-lucide="layout-grid"></i> Catálogo</div><h1>Ferramentas de análise ergonômica (A–Z)</h1><p class="lead-s">Todas as ${E.tools.length} ferramentas em ordem alfabética. Filtre por categoria ou pesquise pelo nome do método.</p></section>
      <div class="dir-tools"><input class="form-control" id="dirQ" type="search" placeholder="Pesquisar: NIOSH, postura, carga mental…" value="${esc(filtroTxt)}" aria-label="Pesquisar ferramenta"><button class="chip ${!filtroCat ? 'on' : ''}" data-c="">Todas</button>${cats.map(c => `<button class="chip ${filtroCat === c.id ? 'on' : ''}" data-c="${c.id}">${esc(c.nome)}</button>`).join('')}</div>
      <div class="tool-grid" id="dirGrid"></div>`;
    const desenhar = () => {
      const q = filtroTxt.toLowerCase();
      const ts = E.sorted(E.tools.filter(t => (!filtroCat || t.cat === filtroCat) && (!q || (t.nome + ' ' + t.sigla + ' ' + t.resumo + ' ' + (t.tags || '')).toLowerCase().includes(q))));
      let h = '', letra = '';
      ts.forEach(t => {
        const L = t.nome[0].toUpperCase();
        if (L !== letra) { letra = L; h += `<div class="letter-h">${L}</div>`; }
        const n = E.Store.byTool(t.id).length;
        h += `<a class="tool-card" href="#${t.id}"><div class="tc-top"><span class="tc-cat">${esc(E.cats[t.cat].nome)}</span>${n ? `<span class="tc-n">${n} salva(s)</span>` : ''}</div><b>${esc(t.nome)}</b><p>${t.resumo.replace(/<[^>]+>/g, '')}</p></a>`;
      });
      $('#dirGrid').innerHTML = h || '<div class="empty-mini">Nenhuma ferramenta encontrada.</div>';
    };
    $('#dirQ').addEventListener('input', e => { filtroTxt = e.target.value; desenhar(); });
    $$('.chip[data-c]').forEach(b => b.addEventListener('click', () => { filtroCat = b.dataset.c; $$('.chip[data-c]').forEach(x => x.classList.toggle('on', x === b)); desenhar(); }));
    desenhar();
  }

  /* ---------------- histórico global */
  function paginaHistorico() {
    const avals = E.Store.all();
    $('#view').innerHTML = `
      <section class="tool-head"><div class="eyebrow"><i data-lucide="history"></i> Registros</div><h1>Histórico e relatórios</h1><p class="lead-s">Todas as avaliações salvas neste navegador. Abra para editar, gere o relatório novamente ou exclua.</p></section>
      ${avals.length ? `<section class="dash-card">${E.tabelaAvals(avals, true)}</section>` : `<div class="empty-state"><i data-lucide="inbox"></i><h2>Nenhuma avaliação salva</h2><p>As avaliações salvas em qualquer ferramenta aparecem aqui, com acesso rápido ao relatório.</p><a class="btn btn-primary" href="#todas">Escolher uma ferramenta</a></div>`}`;
    E.ligarTabela($('#view'), () => rotear(true));
  }

  /* ---------------- início */
  E.ligarRelatorio();
  menu();
  rotear(true);
  window.addEventListener('load', () => E.icons());
})();
