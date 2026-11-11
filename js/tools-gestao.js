/* Categorias e ferramentas de gestão (NR 01 / NR 17): AEP, AET e Inventário de Riscos do PGR */
(function () {
  'use strict';
  const E = window.Ergo, U = E.util, { fmt, esc } = U;

  E.cat('ambiente', 'Ambiente e Conforto', 'sun', 'Condições de conforto no ambiente de trabalho (NR 17, 17.8).');
  E.cat('biomecanica', 'Biomecânica e Posturas', 'person-standing', 'Métodos observacionais de postura do corpo inteiro e de escritório.');
  E.cat('triagem', 'Checklists e Questionários', 'list-checks', 'Listas de verificação e questionários de triagem.');
  E.cat('gestao', 'Gestão de Riscos – NR 01 / NR 17', 'clipboard-list', 'AEP, AET e inventário de riscos do PGR.');
  E.cat('membros', 'Membros Superiores e Repetitividade', 'hand', 'Exposição de mãos, punhos, braços e ombros a tarefas repetitivas.');
  E.cat('cargas', 'Movimentação Manual de Cargas', 'package', 'Levantamento, transporte, empurrar e puxar, e movimentação de pacientes.');
  E.cat('psico', 'Psicossociais, Cognitivos e Carga Mental', 'brain', 'Fatores psicossociais e cognitivos (NR 01 e NR 17, 17.4) e carga mental.');

  /* ======================================================================= AEP */
  const SUG = {
    cargas: 'Equação NIOSH, KIM, Liberty Mutual Tables ou MAPO',
    mob: 'ROSA, Checklists de Ergonomia ou Questionário Bipolar (home office)',
    rep: 'OCRA, Strain Index, TLV HAL, TOR-TOM ou Suzanne Rodgers',
    post: 'RULA, REBA, OWAS ou QEC',
    amb: 'Avaliação de Iluminamento (NHO 11)',
    org: 'NASA-TLX, ERGOS ou TOR-TOM',
    psi: 'HSE-IT, ITRA ou Ferramentas Psicossociais e Cognitivas'
  };
  const AEP_ITENS = [
    ['Levantamento, transporte e descarga de cargas (17.5)', [
      ['a1', 'O peso e a frequência das cargas movimentadas manualmente são compatíveis com a capacidade dos trabalhadores, sem esforço excessivo.', 1, 'cargas', '17.5.1'],
      ['a2', 'Há meios técnicos (carrinhos, talhas, mesas elevatórias) para reduzir o esforço quando necessário.', 0, 'cargas', '17.5.2'],
      ['a3', 'As cargas são manuseadas próximas ao corpo, sem torção do tronco ou alcance acima dos ombros/abaixo dos joelhos.', 1, 'cargas', '17.5.3'],
      ['a4', 'Os trabalhadores receberam treinamento sobre métodos de trabalho no manuseio de cargas.', 0, 'cargas', '17.5.4']]],
    ['Mobiliário dos postos de trabalho (17.6)', [
      ['b1', 'A altura e as características da superfície de trabalho são compatíveis com a tarefa e permitem alternância de posturas.', 0, 'mob', '17.6.1'],
      ['b2', 'Os assentos são reguláveis em altura, com apoio lombar e borda frontal arredondada, quando a tarefa é sentada.', 0, 'mob', '17.6.3'],
      ['b3', 'Há espaço para as pernas e, quando necessário, apoio para os pés.', 0, 'mob', '17.6.4'],
      ['b4', 'Postos com uso de computador permitem ajuste de tela, teclado e mouse (tela na altura dos olhos, punhos neutros).', 1, 'mob', '17.6.6'],
      ['b5', 'Para trabalho em pé há assentos para descanso nas pausas.', 0, 'mob', '17.6.7']]],
    ['Posturas e movimentos', [
      ['c1', 'A tarefa não exige posturas extremas ou mantidas de tronco, pescoço, ombros ou punhos (flexões > 45°, braços acima dos ombros).', 1, 'post', '17.3.2'],
      ['c2', 'Não há trabalho agachado, ajoelhado ou com o tronco inclinado por longos períodos.', 1, 'post', '17.3.2']]],
    ['Trabalho com máquinas, equipamentos e ferramentas manuais (17.7)', [
      ['d1', 'Ferramentas manuais têm pega adequada, peso compatível e não exigem desvio do punho ou força excessiva.', 0, 'rep', '17.7.1'],
      ['d2', 'As tarefas com membros superiores não são altamente repetitivas (ciclos curtos com o mesmo gesto) sem pausas.', 1, 'rep', '17.4.3'],
      ['d3', 'Comandos, painéis e displays estão dentro do alcance e campo visual, sem posturas forçadas.', 0, 'post', '17.7.2'],
      ['d4', 'A exposição a vibração de mãos e braços ou de corpo inteiro é controlada.', 0, 'rep', 'NR 09']]],
    ['Condições de conforto no ambiente (17.8)', [
      ['e1', 'A iluminação é adequada à natureza da atividade, sem ofuscamento, reflexos ou sombras incômodas.', 0, 'amb', '17.8.3'],
      ['e2', 'O nível de ruído permite a concentração e a comunicação (referência de conforto acústico).', 0, 'amb', '17.8.4.1'],
      ['e3', 'Temperatura, umidade e velocidade do ar estão em faixas de conforto para atividades que exigem atenção.', 0, 'amb', '17.8.4.2']]],
    ['Organização do trabalho (17.4)', [
      ['f1', 'O ritmo e as metas de produção consideram as exigências de tempo e a variabilidade do trabalho.', 1, 'org', '17.4.1'],
      ['f2', 'Há pausas para recuperação psicofisiológica em tarefas repetitivas ou com alta exigência.', 1, 'org', '17.4.3'],
      ['f3', 'A jornada, os turnos e as horas extras são organizados sem sobrecarga habitual.', 0, 'org', '17.4.1'],
      ['f4', 'Os trabalhadores participam da definição dos métodos e podem relatar dificuldades.', 0, 'org', '17.3.4']]],
    ['Fatores psicossociais e cognitivos (NR 01, 1.5.3.1.4)', [
      ['g1', 'As exigências cognitivas (atenção, memória, decisões, interrupções) são compatíveis com a tarefa.', 0, 'psi', '17.4.1'],
      ['g2', 'Não há relatos de assédio, conflitos interpessoais frequentes ou violência no trabalho.', 1, 'psi', 'NR 01'],
      ['g3', 'Há apoio da chefia e dos colegas, autonomia e reconhecimento adequados.', 0, 'psi', 'NR 01'],
      ['g4', 'Não há queixas, afastamentos ou indicadores de saúde (SESMT/PCMSO) associados ao posto.', 1, 'psi', 'NR 07']]]
  ];
  const AEP_DEF = { a1: 'n', a2: 's', a3: 'n', a4: 's', b1: 's', b2: 's', b3: 's', b4: 'na', b5: 'n', c1: 'n', c2: 's', d1: 'n', d2: 'n', d3: 's', d4: 's', e1: 's', e2: 's', e3: 'n', f1: 'n', f2: 'n', f3: 's', f4: 's', g1: 's', g2: 's', g3: 's', g4: 'n' };
  const aepItens = [];
  AEP_ITENS.forEach(([g, its]) => its.forEach(([id, txt, crit, sug, ref]) => aepItens.push({ id, txt, g, crit: !!crit, sug, ref: ref + (crit ? ' · crítico' : ''), d: AEP_DEF[id] })));

  E.register({
    id: 'aep', cat: 'gestao', sigla: 'AEP', nome: 'AEP – Avaliação Ergonômica Preliminar', menu: 'AEP – Avaliação Ergonômica Preliminar (PGR)',
    resumo: 'Identificação preliminar dos perigos ergonômicos do posto conforme a NR 17 (17.3.1), integrada ao inventário de riscos do PGR. Indica quando é necessária a AET e quais ferramentas aplicar.',
    normas: ['NR 17 · 17.3.1', 'NR 17 · 17.3.2', 'NR 01 · 1.5.4', 'PGR'],
    tags: 'preliminar triagem pgr nr17',
    secoes: [
      { t: 'Caracterização', f: [
        { t: 'sel', id: 'tipoAval', l: 'Forma de avaliação', o: [['obs', 'Observação direta + entrevista'], ['quali', 'Abordagem qualitativa (checklist)'], ['semi', 'Semiquantitativa'], ['quanti', 'Quantitativa']], d: 'obs' },
        { t: 'num', id: 'expostos', l: 'Trabalhadores expostos', u: 'pessoas', d: 12, min: 0 },
        { t: 'chk', id: 'particip', l: 'Os trabalhadores participaram da AEP (NR 17, 17.3.4)', d: true },
        { t: 'chk', id: 'meEpp', l: 'ME/EPP com grau de risco 1 ou 2 (declaração de inexistência de riscos permitida, NR 01)', d: false }
      ] },
      { t: 'Lista de verificação NR 17', d: 'Responda se a situação <b>atende</b> ao requisito. Itens marcados como “crítico”, quando não atendidos, indicam necessidade de AET.', f: [
        { t: 'yn', id: 'chk', itens: aepItens, opts: [['s', 'Atende'], ['n', 'Não atende'], ['na', 'N/A']] }
      ] },
      { t: 'Perigos e situações observadas', f: [
        { t: 'area', id: 'perigos', l: 'Descrição dos perigos, fontes e circunstâncias', d: 'Montagem de chicotes em bancada fixa com flexão de punho repetida; caixas de componentes de 14 kg retiradas do piso; ritmo definido pela linha, sem pausas formais além do almoço.' }
      ] }
    ],
    calc(v) {
      const grupos = {};
      let s = 0, n = 0, crit = 0; const nc = [], sug = new Set();
      aepItens.forEach(it => {
        const g = grupos[it.g] || (grupos[it.g] = { s: 0, n: 0 });
        if (v[it.id] === 's') { s++; g.s++; }
        if (v[it.id] === 'n') { n++; g.n++; nc.push(it); sug.add(it.sug); if (it.crit) crit++; }
      });
      const conf = s + n ? s / (s + n) * 100 : 100;
      let nv = n === 0 ? 0 : crit === 0 ? 1 : crit <= 2 ? 2 : 3;
      const aet = crit > 0;
      const gk = Object.keys(grupos);
      const recs = [];
      if (aet) recs.push('Realizar a Análise Ergonômica do Trabalho (AET), pois a AEP identificou situações que demandam avaliação aprofundada (NR 17, 17.3.2).');
      sug.forEach(k => recs.push('Aplicar ' + SUG[k] + ' para quantificar o risco identificado.'));
      if (!v.particip) recs.push('Registrar a participação dos trabalhadores na AEP, conforme NR 17, 17.3.4.');
      if (n) recs.push('Incluir os perigos não conformes no inventário de riscos do PGR e definir as medidas no plano de ação (NR 01, 1.5.7).');
      if (!n) recs.push('Manter a AEP registrada no PGR e revisar quando houver mudanças no posto, no processo ou ocorrência de queixas.');
      return {
        score: fmt(conf, 0) + '%', scoreNum: conf, scoreLabel: 'Conformidade', scoreSub: `${s} atendem · ${n} não atendem`,
        faixa: { n: nv, rotulo: aet ? 'AET necessária' : (n ? 'Ajustes necessários' : 'Adequado'), txt: aet ? `AEP indica ${crit} situação(ões) crítica(s): a AET é necessária.` : (n ? 'Há não conformidades sem itens críticos: corrigir e registrar no PGR.' : 'Nenhuma não conformidade identificada nesta AEP.'), acao: aet ? 'Programe a AET e as ferramentas específicas indicadas abaixo.' : '' },
        gauge: { v: 100 - conf, min: 0, max: 100, zonas: [10, 30, 50] },
        kpis: [{ l: 'Itens avaliados', v: s + n }, { l: 'Não atendem', v: n, n: n ? 1 : 0 }, { l: 'Críticos', v: crit, n: crit ? 2 : 0 }, { l: 'AET necessária', v: aet ? 'Sim' : 'Não', n: aet ? 2 : 0 }, { l: 'Expostos', v: v.expostos || 0 }],
        charts: [{ title: 'Conformidade por tema da NR 17 (%)', type: 'bar', horizontal: true, max: 100, h: 260, labels: gk.map(g => g.replace(/\s*\(.*\)/, '')), datasets: [{ label: '% atende', data: gk.map(g => grupos[g].s + grupos[g].n ? Math.round(grupos[g].s / (grupos[g].s + grupos[g].n) * 100) : 100), levels: gk.map(g => { const x = grupos[g]; const p = x.s + x.n ? x.s / (x.s + x.n) : 1; return p >= .9 ? 0 : p >= .7 ? 1 : p >= .5 ? 2 : 3; }) }] }],
        extra: nc.length ? `<div class="recs"><h3>Perigos identificados</h3><ul class="mini-list">${nc.map(it => `<li><span>${esc(it.txt)}</span><span class="lv-pill ${it.crit ? 'lv2' : 'lv1'}">${it.crit ? 'Crítico' : 'Ajustar'}</span></li>`).join('')}</ul></div>` : '',
        recs
      };
    },
    metodo: `<h3>O que é</h3><p>A Avaliação Ergonômica Preliminar (AEP) é a etapa obrigatória de identificação dos perigos ergonômicos prevista na NR 17 (redação da Portaria MTP nº 423/2021). Pode usar abordagens qualitativas, semiquantitativas, quantitativas ou combinadas, e deve ser registrada no PGR.</p>
      <h3>Como esta ferramenta classifica</h3><p>A conformidade é o percentual de itens que atendem entre os aplicáveis. Itens críticos não atendidos indicam necessidade de AET, conforme 17.3.2 (quando a AEP não for suficiente para definir medidas, houver indicação do PCMSO ou do acompanhamento de saúde, ou quando a organização assim decidir).</p>
      <table class="table table-sm"><thead><tr><th>Situação</th><th>Nível</th></tr></thead><tbody><tr><td>Nenhum item não atendido</td><td>Baixo</td></tr><tr><td>Não conformidades sem itens críticos</td><td>Moderado</td></tr><tr><td>1 a 2 itens críticos</td><td>Alto — AET necessária</td></tr><tr><td>3 ou mais itens críticos</td><td>Muito alto — AET prioritária</td></tr></tbody></table>
      <h3>Próximos passos</h3><p>Use as ferramentas sugeridas no painel para quantificar cada perigo. Depois, registre os perigos no <a href="#pgr">Inventário de Riscos – PGR</a> e, se indicado, elabore a <a href="#aet">AET</a> vinculando as avaliações salvas.</p>`,
    normasTxt: ['<b>NR 17, 17.3.1</b>: a organização deve realizar a avaliação ergonômica preliminar das situações de trabalho que, em decorrência da natureza e conteúdo das atividades requeridas, demandam adaptação às características psicofisiológicas dos trabalhadores.', '<b>NR 17, 17.3.2</b>: a AET deve ser realizada quando observada a necessidade de avaliação mais aprofundada, quando indicado pelo PCMSO, ou quando a AEP não for suficiente.', '<b>NR 01, 1.5.4</b>: o levantamento preliminar de perigos integra o processo de identificação de perigos e avaliação de riscos do PGR.'],
    refs: ['Brasil. NR 17 – Ergonomia (Portaria MTP nº 423/2021).', 'Brasil. NR 01 – Disposições Gerais e Gerenciamento de Riscos Ocupacionais.', 'Brasil. Manual de Aplicação da NR 17 (MTE).']
  });

  /* ======================================================================= PGR */
  const SEV = [[1, '1 – Desconforto leve, sem afastamento'], [2, '2 – Dor ou fadiga reversível'], [3, '3 – Adoecimento com afastamento curto'], [4, '4 – Adoecimento com afastamento prolongado'], [5, '5 – Incapacidade permanente']];
  const PROB = [[1, '1 – Rara'], [2, '2 – Improvável'], [3, '3 – Possível'], [4, '4 – Provável'], [5, '5 – Quase certa']];
  const TIPOS = [['bio', 'Ergonômico – biomecânico'], ['mob', 'Ergonômico – mobiliário/equipamentos'], ['org', 'Ergonômico – organização do trabalho'], ['amb', 'Ergonômico – ambiental'], ['psi', 'Psicossocial'], ['cog', 'Cognitivo']];
  const nrNivel = x => x <= 4 ? 0 : x <= 9 ? 1 : x <= 16 ? 2 : 3;
  const NR_ROT = ['Baixo', 'Moderado', 'Alto', 'Crítico'];
  const PGR_DEF = [
    { perigo: 'Flexão e desvio de punho repetitivos', tipo: 'bio', fonte: 'Montagem manual de conectores', ghe: 'Montadores', exp: 12, sev: 3, prob: 4, exist: 'Rodízio informal', medida: 'Gabarito inclinado e pausas de 10 min a cada 50 min', resp: 'Engenharia', prazo: '2026-12-15' },
    { perigo: 'Levantamento de caixas do piso', tipo: 'bio', fonte: 'Abastecimento de componentes', ghe: 'Abastecedores', exp: 4, sev: 4, prob: 3, exist: 'Nenhuma', medida: 'Mesa elevatória e caixas de até 8 kg', resp: 'Logística', prazo: '2026-11-30' },
    { perigo: 'Pressão de tempo e metas por hora', tipo: 'org', fonte: 'Ritmo definido pela linha', ghe: 'Montadores', exp: 12, sev: 3, prob: 3, exist: 'Reunião mensal', medida: 'Revisar metas com base na AET e incluir margem de variabilidade', resp: 'Produção', prazo: '2027-01-31' },
    { perigo: 'Iluminância abaixo do requerido na bancada 4', tipo: 'amb', fonte: 'Luminárias com lâmpadas queimadas', ghe: 'Montadores', exp: 3, sev: 2, prob: 3, exist: '—', medida: 'Manutenção e luminária de tarefa', resp: 'Manutenção', prazo: '2026-11-10' }
  ];
  E.register({
    id: 'pgr', cat: 'gestao', sigla: 'PGR', nome: 'Avaliação e Inventário de Riscos – PGR', menu: 'Avaliação e Inventário de Riscos – PGR',
    resumo: 'Inventário dos perigos ergonômicos, psicossociais e cognitivos com matriz de severidade × probabilidade e plano de ação, conforme o GRO da NR 01. Importa resultados das outras ferramentas.',
    normas: ['NR 01 · 1.5.4', 'NR 01 · 1.5.7', 'NR 17 · 17.3', 'GRO'],
    tags: 'inventario matriz risco plano de acao gro nr01',
    secoes: [
      { t: 'Critérios', f: [
        { t: 'info', html: '<b>Nível de risco = Severidade × Probabilidade</b> (matriz 5 × 5): 1–4 baixo · 5–9 moderado · 10–16 alto · 20–25 crítico. Ajuste os critérios ao procedimento do PGR da sua organização.' },
        { t: 'txt', id: 'estab', l: 'Estabelecimento / CNPJ', d: 'Metalúrgica Exemplo Ltda. — 00.000.000/0001-00' },
        { t: 'txt', id: 'revisao', l: 'Revisão do inventário', d: 'Rev. 02 — outubro/2026' }
      ] },
      { t: 'Inventário de riscos e plano de ação', d: 'Cada linha é um perigo. Use “Importar avaliações salvas” para trazer os resultados das ferramentas (RULA, NIOSH, HSE-IT…).', f: [
        { t: 'grid', id: 'riscos', addLabel: 'Adicionar perigo', d: PGR_DEF,
          novo: { perigo: '', tipo: 'bio', fonte: '', ghe: '', exp: 1, sev: 3, prob: 3, exist: '', medida: '', resp: '', prazo: '' },
          acoes: [{ id: 'importar', l: 'Importar avaliações salvas', icon: 'download' }],
          cols: [
            { id: 'perigo', l: 'Perigo / fator de risco', wd: '200px' }, { id: 'tipo', l: 'Tipo', t: 'sel', o: TIPOS, wd: '190px' },
            { id: 'fonte', l: 'Fonte / circunstância', wd: '170px' }, { id: 'ghe', l: 'GHE / atividade', wd: '140px' },
            { id: 'exp', l: 'Expostos', t: 'num' }, { id: 'sev', l: 'Severidade', t: 'sel', o: SEV, wd: '210px' }, { id: 'prob', l: 'Probabilidade', t: 'sel', o: PROB, wd: '150px' },
            { id: 'nr', l: 'Risco', t: 'calc' },
            { id: 'exist', l: 'Medidas existentes', wd: '160px' }, { id: 'medida', l: 'Medida proposta (plano de ação)', wd: '220px' }, { id: 'resp', l: 'Responsável', wd: '120px' }, { id: 'prazo', l: 'Prazo', wd: '120px' }
          ] }
      ] }
    ],
    acoes: {
      importar(cur, api) {
        const sev = [2, 3, 4, 5], prob = [1, 2, 3, 4];
        let n = 0;
        E.Store.all().filter(a => a.tool !== 'pgr' && a.tool !== 'aet').forEach(a => {
          const t = E.tool(a.tool); if (!t) return;
          const nome = `${t.sigla}: ${a.r.rotulo} (${a.r.score})`;
          if (cur.v.riscos.some(r => r.perigo === nome)) return;
          const tipo = t.cat === 'psico' ? 'psi' : t.cat === 'ambiente' ? 'amb' : t.id === 'rosa' || t.id === 'bipolar' ? 'mob' : 'bio';
          cur.v.riscos.push({ perigo: nome, tipo, fonte: a.ident.atividade || '', ghe: a.ident.ghe || a.ident.funcao || '', exp: 1, sev: sev[a.r.n], prob: prob[a.r.n], exist: '', medida: '', resp: '', prazo: '' });
          n++;
        });
        api.redesenhar();
        api.toast(n ? n + ' avaliação(ões) importada(s) para o inventário.' : 'Nenhuma avaliação nova para importar. Salve avaliações nas outras ferramentas.');
      }
    },
    calc(v) {
      const rows = (v.riscos || []).filter(r => r.perigo || r.fonte);
      const gc = { riscos: {} };
      const mat = {}; const cont = [0, 0, 0, 0]; let exp = 0, expAlto = 0, semMedida = 0;
      (v.riscos || []).forEach((r, i) => {
        const s = U.n0(r.sev) || 1, p = U.n0(r.prob) || 1, x = s * p, nv = nrNivel(x);
        gc.riscos[i] = { nr: `<span class="lv-pill lv${nv}">${x} · ${NR_ROT[nv]}</span>` };
      });
      rows.forEach(r => {
        const s = U.n0(r.sev) || 1, p = U.n0(r.prob) || 1, x = s * p, nv = nrNivel(x);
        cont[nv]++; mat[s + '_' + p] = (mat[s + '_' + p] || 0) + 1; exp += U.n0(r.exp);
        if (nv >= 2) { expAlto += U.n0(r.exp); if (!r.medida) semMedida++; }
      });
      const maxN = rows.length ? Math.max(...rows.map(r => nrNivel((U.n0(r.sev) || 1) * (U.n0(r.prob) || 1)))) : 0;
      let heat = '<table class="heat" aria-label="Matriz de risco"><tr><th>S \\ P</th>' + [1, 2, 3, 4, 5].map(p => `<th>${p}</th>`).join('') + '</tr>';
      for (let s = 5; s >= 1; s--) { heat += `<tr><th>${s}</th>`; for (let p = 1; p <= 5; p++) { const c = mat[s + '_' + p] || 0; heat += `<td class="h${nrNivel(s * p)} ${c ? '' : 'zero'}">${c || s * p}</td>`; } heat += '</tr>'; }
      heat += '</table>';
      const porTipo = TIPOS.map(([k]) => rows.filter(r => r.tipo === k).length);
      const recs = [];
      if (cont[3]) recs.push(`Tratar com prioridade imediata ${cont[3]} risco(s) crítico(s), com medidas de engenharia e organização do trabalho.`);
      if (cont[2]) recs.push(`Implementar medidas para ${cont[2]} risco(s) alto(s) com prazos definidos no plano de ação.`);
      if (semMedida) recs.push(`${semMedida} risco(s) alto(s)/crítico(s) estão sem medida proposta: complete o plano de ação.`);
      recs.push('Acompanhar a implementação e revisar o inventário a cada 2 anos ou quando houver mudanças (NR 01, 1.5.4.4.6).');
      return {
        score: rows.length, scoreLabel: 'Perigos inventariados', scoreSub: `${cont[2] + cont[3]} alto(s) ou crítico(s)`, scoreNum: maxN,
        faixa: { n: maxN, rotulo: 'Maior risco: ' + NR_ROT[maxN], txt: `O inventário tem ${rows.length} perigo(s); o maior nível de risco é ${NR_ROT[maxN].toLowerCase()}.`, acao: maxN >= 2 ? 'Priorize as medidas dos riscos altos e críticos no plano de ação.' : 'Mantenha o acompanhamento e as medidas existentes.' },
        gauge: { v: maxN + 0.5, min: 0, max: 4, zonas: [1, 2, 3] },
        kpis: [{ l: 'Baixo', v: cont[0], n: 0 }, { l: 'Moderado', v: cont[1], n: 1 }, { l: 'Alto', v: cont[2], n: 2 }, { l: 'Crítico', v: cont[3], n: 3 }, { l: 'Expostos (soma)', v: exp }, { l: 'Expostos a alto/crítico', v: expAlto }],
        charts: [{ title: 'Perigos por tipo', type: 'bar', horizontal: true, h: 230, labels: TIPOS.map(t => t[1].replace('Ergonômico – ', 'Ergo. ')), datasets: [{ label: 'Perigos', data: porTipo }] }],
        extra: `<div><div class="chart-fig"><figcaption style="font-size:.78rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Matriz severidade × probabilidade (nº de perigos)</figcaption>${heat}</div></div>`,
        extraReport: `<h4 class="rp-h4">Matriz de risco</h4><div style="max-width:360px">${heat}</div>`,
        gridCalc: gc, recs
      };
    },
    metodo: `<h3>Inventário de riscos (NR 01, 1.5.7.3)</h3><p>O inventário deve conter, no mínimo: caracterização dos processos e ambientes, das atividades, descrição dos perigos e possíveis lesões ou agravos à saúde, identificação das fontes ou circunstâncias, indicação dos grupos de trabalhadores expostos, dados da análise preliminar ou do monitoramento e a avaliação dos riscos com o nível de risco e a classificação para fins de priorização.</p>
      <h3>Matriz utilizada</h3><p>Severidade (1 a 5) × Probabilidade (1 a 5). Ajuste as descrições ao procedimento interno do PGR. Os fatores psicossociais e cognitivos devem ser considerados no GRO conforme a atualização da NR 01.</p>
      <h3>Integração</h3><p>O botão <b>Importar avaliações salvas</b> cria uma linha para cada avaliação das outras ferramentas, com severidade e probabilidade sugeridas pelo nível obtido (baixo → 2×1, moderado → 3×2, alto → 4×3, muito alto → 5×4). Revise os valores sugeridos.</p>`,
    normasTxt: ['<b>NR 01, 1.5.4.4</b>: a organização deve avaliar os riscos ocupacionais e classificá-los quanto à severidade e probabilidade para determinar a necessidade de medidas de prevenção.', '<b>NR 01, 1.5.5</b>: as medidas de prevenção seguem a hierarquia: eliminação, engenharia, administrativas/organizacionais e EPI.', '<b>NR 17, 17.3.3</b>: a AEP e a AET compõem o PGR.'],
    refs: ['Brasil. NR 01 – Gerenciamento de Riscos Ocupacionais (GRO/PGR).', 'ABNT NBR ISO 31000 – Gestão de riscos.', 'Brasil. Guia de informações sobre fatores de riscos psicossociais relacionados ao trabalho (MTE).']
  });

  /* ======================================================================= AET */
  E.register({
    id: 'aet', cat: 'gestao', sigla: 'AET', nome: 'AET – Análise Ergonômica do Trabalho', menu: 'AET – Análise Ergonômica do Trabalho',
    resumo: 'Estudo aprofundado e completo de uma situação real de trabalho, exigido quando a AEP aponta riscos que demandam investigação detalhada (como sobrecarga muscular ou levantamento de cargas). Vincula as avaliações das outras ferramentas ao diagnóstico e às recomendações.',
    normas: ['NR 17 · 17.3.2', 'NR 17 · 17.3.4', 'NR 17 · 17.3.5', 'NR 01 · PGR'],
    tags: 'analise ergonomica do trabalho estudo aprofundado diagnostico',
    secoes: [
      { t: 'Demanda e contexto', f: [
        { t: 'sel', id: 'origem', l: 'Origem da demanda', o: [['aep', 'AEP indicou necessidade de aprofundamento'], ['pcmso', 'Indicação do PCMSO / queixas de saúde'], ['mudanca', 'Mudança de processo, posto ou equipamento'], ['fisc', 'Notificação ou fiscalização'], ['org', 'Decisão da organização']], d: 'aep' },
        { t: 'txt', id: 'contratante', l: 'Responsável pela AET / registro profissional', d: 'Ergonomista — CREA/CREFITO/CRP nº 000000' },
        { t: 'area', id: 'demanda', l: 'Análise da demanda (problema a ser investigado)', d: 'A AEP do setor de Montagem apontou flexão repetitiva de punho e levantamento de caixas do piso, com 5 queixas de dor em punho registradas no ambulatório em 2026.' },
        { t: 'area', id: 'global', l: 'Análise global da empresa e do setor', d: 'Indústria de autopeças com 420 empregados; setor de Montagem com 36 trabalhadores em 2 turnos; produção puxada por pedidos semanais.' }
      ] },
      { t: 'População e tarefa', f: [
        { t: 'num', id: 'nTrab', l: 'Trabalhadores no posto/setor', u: 'pessoas', d: 12 },
        { t: 'txt', id: 'turnos', l: 'Turnos, jornada e pausas', d: '2 turnos de 8h48, 1 h de almoço, sem pausas formais' },
        { t: 'area', id: 'perfil', l: 'Perfil da população (sexo, idade, tempo na função, restrições)', d: '70% mulheres, idade média 34 anos, tempo médio na função de 3,5 anos; 2 trabalhadoras com restrição médica para levantamento.' },
        { t: 'area', id: 'prescrita', l: 'Tarefa prescrita', d: 'Montar 180 chicotes por hora conforme instrução de trabalho IT-112, inspecionar visualmente e embalar.' },
        { t: 'area', id: 'real', l: 'Atividade real observada (estratégias, variabilidade, imprevistos)', d: 'As montadoras antecipam o corte dos fios para ganhar tempo; quando falta componente, aguardam e depois aceleram. O encaixe do conector exige pinça com força.' }
      ] },
      { t: 'Condições e organização do trabalho', f: [
        { t: 'area', id: 'condicoes', l: 'Condições físicas, mobiliário, equipamentos e ambiente', d: 'Bancada fixa a 92 cm; cadeiras sem regulagem de apoio lombar; iluminância média de 410 lux (requerido 500 lux).' },
        { t: 'area', id: 'organizacao', l: 'Organização do trabalho (ritmo, metas, conteúdo das tarefas, autonomia)', d: 'Meta horária fixa, controle visual em painel; pouca autonomia para regular o ritmo; rodízio informal.' },
        { t: 'area', id: 'verbal', l: 'Verbalizações e participação dos trabalhadores', d: '“No fim do turno o punho dói e fica difícil encaixar o conector.” “Quando a caixa vem cheia, a gente pega do chão.”' }
      ] },
      { t: 'Ferramentas aplicadas', d: 'Marque as avaliações salvas que fundamentam esta AET. Elas entram no relatório com resultado e classificação.', f: [
        { t: 'evals', id: 'vinculos', l: 'Avaliações vinculadas' }
      ] },
      { t: 'Diagnóstico e recomendações', f: [
        { t: 'area', id: 'diagnostico', l: 'Diagnóstico ergonômico', rows: 4, d: 'Sobrecarga de membros superiores por repetitividade e força de pinça, agravada pela ausência de pausas; risco de lombalgia no abastecimento pelo levantamento de caixas a partir do piso.' },
        { t: 'sel', id: 'classif', l: 'Classificação final do risco (avaliador)', o: [['auto', 'Automática (maior nível das ferramentas vinculadas)'], [0, 'Baixo'], [1, 'Moderado'], [2, 'Alto'], [3, 'Muito alto']], d: 'auto' },
        { t: 'grid', id: 'recs', l: 'Recomendações e cronograma', addLabel: 'Adicionar recomendação',
          d: [
            { rec: 'Instalar gabarito inclinado e ferramenta de inserção para reduzir força de pinça', tipo: 'eng', prio: 'alta', resp: 'Engenharia', prazo: '2026-12-15' },
            { rec: 'Instituir pausas de 10 min a cada 50 min trabalhados', tipo: 'org', prio: 'alta', resp: 'RH / Produção', prazo: '2026-11-15' },
            { rec: 'Abastecer caixas em carrinho na altura entre joelhos e ombros', tipo: 'eng', prio: 'media', resp: 'Logística', prazo: '2026-12-01' },
            { rec: 'Capacitar trabalhadores e líderes sobre os riscos e a regulação do ritmo', tipo: 'adm', prio: 'baixa', resp: 'SESMT', prazo: '2027-01-30' }],
          novo: { rec: '', tipo: 'eng', prio: 'media', resp: '', prazo: '' },
          cols: [{ id: 'rec', l: 'Recomendação', wd: '300px' }, { id: 'tipo', l: 'Tipo de medida', t: 'sel', o: [['eng', 'Engenharia'], ['org', 'Organização do trabalho'], ['adm', 'Administrativa / treinamento'], ['epi', 'EPI / complementar']], wd: '200px' }, { id: 'prio', l: 'Prioridade', t: 'sel', o: [['alta', 'Alta'], ['media', 'Média'], ['baixa', 'Baixa']], wd: '110px' }, { id: 'resp', l: 'Responsável', wd: '130px' }, { id: 'prazo', l: 'Prazo', wd: '120px' }] },
        { t: 'area', id: 'restituicao', l: 'Validação e restituição dos resultados aos trabalhadores (17.3.5)', d: 'Resultados apresentados aos trabalhadores e à CIPA em reunião; sugestões incorporadas às recomendações.' }
      ] }
    ],
    calc(v, ctx) {
      const links = (v.vinculos || []).map(id => ctx.Store.find(id)).filter(Boolean);
      const auto = links.length ? Math.max(...links.map(a => a.r.n)) : 1;
      const nv = v.classif === 'auto' || v.classif === '' ? auto : +v.classif;
      const recs = (v.recs || []).filter(r => r.rec);
      const pr = p => recs.filter(r => r.prio === p).length;
      const porTipo = { eng: 0, org: 0, adm: 0, epi: 0 }; recs.forEach(r => porTipo[r.tipo] = (porTipo[r.tipo] || 0) + 1);
      const campos = ['demanda', 'global', 'perfil', 'prescrita', 'real', 'condicoes', 'organizacao', 'verbal', 'diagnostico', 'restituicao'];
      const compl = campos.filter(c => String(v[c] || '').trim().length > 10).length / campos.length * 100;
      const charts = [];
      if (links.length) charts.push({ title: 'Ferramentas vinculadas — nível de risco (0 a 3)', type: 'bar', max: 3, h: 220, labels: links.map(a => (E.tool(a.tool) || {}).sigla || a.tool), datasets: [{ label: 'Nível', data: links.map(a => a.r.n + .15), levels: links.map(a => a.r.n) }] });
      charts.push({ title: 'Recomendações por tipo de medida', type: 'doughnut', h: 200, labels: ['Engenharia', 'Organização', 'Administrativa', 'EPI/complementar'], datasets: [{ data: [porTipo.eng, porTipo.org, porTipo.adm, porTipo.epi] }] });
      const lista = links.map(a => { const t = E.tool(a.tool); return `<tr><td>${esc(t ? t.nome : a.tool)}</td><td>${esc(a.ident.atividade || '')}</td><td>${esc(a.r.score)}</td><td>${esc(a.r.rotulo)}</td></tr>`; }).join('');
      return {
        score: E.NIVEIS[nv].nome, scoreLabel: 'Classificação da AET', scoreSub: `${links.length} ferramenta(s) vinculada(s)`, scoreNum: nv,
        faixa: { n: nv, txt: links.length ? `A AET reúne ${links.length} avaliação(ões); o maior nível encontrado é ${E.NIVEIS[auto].nome.toLowerCase()}.` : 'Nenhuma avaliação vinculada: aplique as ferramentas específicas e vincule-as nesta AET.', acao: nv >= 2 ? 'Implantar as recomendações de prioridade alta e acompanhar sua eficácia.' : 'Acompanhar e reavaliar quando houver mudanças.' },
        gauge: { v: nv + .5, min: 0, max: 4, zonas: [1, 2, 3] },
        kpis: [{ l: 'Prioridade alta', v: pr('alta'), n: pr('alta') ? 2 : 0 }, { l: 'Prioridade média', v: pr('media'), n: pr('media') ? 1 : 0 }, { l: 'Prioridade baixa', v: pr('baixa') }, { l: 'Ferramentas', v: links.length }, { l: 'Completude do estudo', v: fmt(compl, 0) + '%', n: compl < 60 ? 2 : compl < 90 ? 1 : 0 }],
        charts,
        recs: recs.map(r => `[${r.prio === 'alta' ? 'Alta' : r.prio === 'media' ? 'Média' : 'Baixa'}] ${r.rec}${r.resp ? ' — ' + r.resp : ''}${r.prazo ? ' (até ' + U.dataBR(r.prazo) + ')' : ''}`),
        extraReport: links.length ? `<h4 class="rp-h4">Resultados das ferramentas aplicadas</h4><table class="rp-mini"><thead><tr><th>Ferramenta</th><th>Posto</th><th>Resultado</th><th>Classificação</th></tr></thead><tbody>${lista}</tbody></table>` : ''
      };
    },
    metodo: `<h3>Etapas da AET (NR 17, 17.3.5)</h3><ol><li>Análise da demanda e, quando aplicável, reformulação do problema;</li><li>Análise do funcionamento da organização, dos processos, das situações de trabalho e da atividade;</li><li>Descrição e justificativa dos métodos, técnicas e ferramentas adequados à análise e sua aplicação, não estando adstrita à utilização de métodos, técnicas ou ferramentas específicos;</li><li>Estabelecimento de diagnóstico;</li><li>Recomendações para as situações de trabalho analisadas;</li><li>Restituição dos resultados, validação e revisão das intervenções efetuadas, quando necessária, com a participação dos trabalhadores.</li></ol>
      <h3>Como usar</h3><p>Aplique as ferramentas pertinentes (por exemplo, RULA e OCRA para membros superiores, NIOSH para levantamento, HSE-IT para fatores psicossociais), salve cada avaliação e vincule-as na seção “Ferramentas aplicadas”. O relatório da AET traz o resultado de cada uma.</p>`,
    normasTxt: ['<b>NR 17, 17.3.2</b>: a AET deve ser realizada quando a AEP indicar necessidade, por indicação do PCMSO ou quando a organização decidir.', '<b>NR 17, 17.3.5</b>: define as etapas mínimas da AET.', '<b>NR 17, 17.3.4</b>: a AEP e a AET devem considerar a participação dos trabalhadores.', '<b>NR 01</b>: as conclusões e medidas da AET alimentam o inventário de riscos e o plano de ação do PGR.'],
    refs: ['Guérin, F. et al. Compreender o trabalho para transformá-lo: a prática da ergonomia. Blucher, 2001.', 'Brasil. NR 17 – Ergonomia, e Manual de Aplicação da NR 17.', 'Abrahão, J. et al. Introdução à ergonomia: da prática à teoria. Blucher, 2009.']
  });
})();
