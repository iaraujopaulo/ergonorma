/* Checklists e Questionários (Checklists de Ergonomia, EHS, PLIBEL, Questionário Bipolar, WISHA) e Ambiente (Iluminamento) */
(function () {
  'use strict';
  const E = window.Ergo, U = E.util, { fmt, fmtF, clamp, esc, mean } = U;

  /* ======================================================================= Iluminamento NR 17 / NHO 11 */
  const AMB = [
    ['circ', 'Áreas de circulação e corredores', 100, 0.4], ['esc', 'Escadas e escadas rolantes', 150, 0.4], ['alm', 'Almoxarifados e áreas de estocagem', 100, 0.4],
    ['exp', 'Expedição e embalagem', 300, 0.6], ['vest', 'Vestiários, banheiros e sanitários', 200, 0.4], ['refe', 'Refeitórios e cantinas', 200, 0.4],
    ['rec', 'Recepção', 300, 0.6], ['arq', 'Arquivamento, cópia e circulação em escritórios', 300, 0.4], ['esc2', 'Escritório: escrever, teclar, ler e processar dados', 500, 0.6],
    ['cad', 'Estações de projeto (CAD)', 500, 0.6], ['des', 'Desenho técnico', 750, 0.7], ['reun', 'Salas de reunião e conferência', 500, 0.6],
    ['callc', 'Teleatendimento (call center)', 500, 0.6], ['aula', 'Salas de aula e treinamento', 300, 0.6], ['lab', 'Laboratórios', 500, 0.6],
    ['ctrl', 'Salas de controle', 500, 0.6], ['mg', 'Montagem grosseira', 300, 0.6], ['mm', 'Montagem média', 500, 0.6], ['mf', 'Montagem fina', 750, 0.7],
    ['mmf', 'Montagem muito fina / eletrônica', 1000, 0.7], ['insp', 'Inspeção de cores e controle de qualidade', 1000, 0.7], ['coz', 'Cozinhas industriais', 500, 0.6],
    ['amb', 'Ambulatório / sala de exames', 500, 0.6]
  ];
  const PONTOS_DEF = [['P1', 'Bancada 1 — centro', 520], ['P2', 'Bancada 1 — borda', 470], ['P3', 'Bancada 2 — centro', 505], ['P4', 'Bancada 2 — borda', 430], ['P5', 'Bancada 3 — centro', 480], ['P6', 'Bancada 3 — borda', 395], ['P7', 'Bancada 4 — centro', 360], ['P8', 'Bancada 4 — borda', 310]].map(([p, l, x]) => ({ p, local: l, lux: x }));
  E.register({
    id: 'iluminamento', cat: 'ambiente', sigla: 'Iluminamento', nome: 'Avaliação de Iluminamento – NR 17 e NHO 11', menu: 'Avaliação de Iluminamento (NR 17 / NHO 11)',
    resumo: 'Avaliação dos níveis de iluminância nos postos de trabalho conforme a NR 17 (17.8.3), a NHO 11 da Fundacentro e os valores de referência da ABNT NBR ISO/CIE 8995-1: média, mínima, uniformidade e conformidade por ponto.',
    normas: ['NR 17 · 17.8.3', 'NHO 11 (Fundacentro)', 'NBR ISO/CIE 8995-1'], tags: 'iluminacao lux luximetro luz conforto visual',
    secoes: [
      { t: 'Ambiente e critério', f: [
        { t: 'sel', id: 'amb', l: 'Ambiente / tarefa (NBR ISO/CIE 8995-1)', o: AMB.map(a => [a[0], `${a[1]} — ${a[2]} lux`]), d: 'mm' },
        { t: 'num', id: 'emOverride', l: 'Iluminância requerida personalizada (opcional)', u: 'lux', d: '', h: 'Deixe vazio para usar o valor da tabela.' },
        { t: 'sel', id: 'tipoIlum', l: 'Tipo de iluminação', o: [['art', 'Artificial'], ['nat', 'Natural'], ['mis', 'Mista (natural + artificial)']], d: 'mis' },
        { t: 'txt', id: 'horario', l: 'Horário e condição da medição', d: '14h30 — céu parcialmente nublado, todas as luminárias acesas' }
      ] },
      { t: 'Instrumento e procedimento (NHO 11)', f: [
        { t: 'txt', id: 'lux', l: 'Luxímetro (marca, modelo, nº de série)', d: 'Luxímetro digital LX-1010 — nº 2026-0457' },
        { t: 'txt', id: 'calib', l: 'Certificado e data de calibração', d: 'Cert. 1234/2026 — 15/03/2026' },
        { t: 'num', id: 'altura', l: 'Altura do plano de medição', u: 'cm', d: 85, h: 'Plano da tarefa; quando indefinido, 75 cm do piso (NHO 11).' },
        { t: 'chk', id: 'estab', l: 'Lâmpadas estabilizadas (≥ 20 min ligadas) e fotocélula sem sombra do avaliador', d: true, w: 'w-full' }
      ] },
      { t: 'Pontos medidos', d: 'Registre cada ponto de medição do campo de trabalho (malha ou ponto da tarefa).', f: [
        { t: 'grid', id: 'pontos', addLabel: 'Adicionar ponto', d: PONTOS_DEF, novo: { p: '', local: '', lux: '' }, cols: [{ id: 'p', l: 'Ponto' }, { id: 'local', l: 'Local / posto', wd: '220px' }, { id: 'lux', l: 'Iluminância (lux)', t: 'num' }, { id: 'st', l: 'Situação', t: 'calc' }] }
      ] }
    ],
    calc(v) {
      const a = AMB.find(x => x[0] === v.amb) || AMB[0];
      const Er = U.num(v.emOverride) > 0 ? U.num(v.emOverride) : a[2], Uo = a[3];
      const pts = (v.pontos || []).map((r, i) => ({ i, p: r.p || 'P' + (i + 1), local: r.local, x: U.num(r.lux) })).filter(r => !isNaN(r.x));
      const gc = { pontos: {} };
      (v.pontos || []).forEach((r, i) => { const x = U.num(r.lux); if (isNaN(x)) return; const k = x >= Er ? 0 : x >= 0.7 * Er ? 1 : 2; gc.pontos[i] = { st: `<span class="lv-pill lv${k}">${['Atende', 'Abaixo', '< 70% Er'][k]}</span>` }; });
      if (!pts.length) return { score: '—', scoreLabel: 'Iluminância média', faixa: { n: 0, rotulo: 'Sem medições', txt: 'Adicione os pontos medidos.' }, kpis: [], charts: [], recs: [], gridCalc: gc };
      const xs = pts.map(p => p.x), Em = mean(xs), Emin = Math.min(...xs), Emax = Math.max(...xs), Uf = Em > 0 ? Emin / Em : 0;
      const ok = xs.filter(x => x >= Er).length, baixo70 = xs.filter(x => x < 0.7 * Er).length;
      const r = Em / Er;
      let n = r >= 1 ? (Uf >= Uo ? 0 : 1) : r >= 0.9 ? 1 : r >= 0.7 ? 2 : 3;
      const recs = [];
      if (Em < Er) recs.push(`Elevar a iluminância média para pelo menos ${Er} lux: revisar projeto luminotécnico, manutenção e limpeza das luminárias.`);
      if (Uf < Uo) recs.push(`Melhorar a uniformidade (atual ${fmtF(Uf, 2)}; referência ≥ ${fmtF(Uo, 2)}): redistribuir luminárias ou complementar com iluminação localizada.`);
      if (baixo70) recs.push(`${baixo70} ponto(s) abaixo de 70% do valor requerido: priorizar esses postos.`);
      if (Emax > 3 * Er) recs.push('Verificar ofuscamento e reflexos nos pontos com iluminância muito elevada.');
      recs.push('Manter o registro das medições no PGR e repetir após mudanças de leiaute ou do sistema de iluminação.');
      return {
        score: fmt(Em, 0) + ' lux', scoreNum: Em, scoreLabel: 'Iluminância média (Em)', scoreSub: `Requerido ${Er} lux · uniformidade mínima ${fmtF(Uo, 1)}`,
        faixa: { n, rotulo: n === 0 ? 'Conforme' : n === 1 ? 'Parcialmente conforme' : 'Não conforme', txt: n === 0 ? 'Iluminância média e uniformidade atendem ao valor de referência.' : r >= 1 ? 'A média atende, mas a uniformidade está abaixo da referência.' : `A iluminância média corresponde a ${fmt(r * 100, 0)}% do valor requerido.` },
        gauge: { v: clamp(r * 100, 0, 150), min: 0, max: 150, zonas: [70, 90, 100].map(x => x) },
        kpis: [{ l: 'Em (média)', v: fmt(Em, 0) + ' lux', n }, { l: 'Emín', v: fmt(Emin, 0) + ' lux' }, { l: 'Emáx', v: fmt(Emax, 0) + ' lux' }, { l: 'Uniformidade Emín/Em', v: fmtF(Uf, 2), n: Uf >= Uo ? 0 : 1 }, { l: 'Pontos que atendem', v: `${ok}/${pts.length}`, n: ok === pts.length ? 0 : 1 }, { l: 'Pontos < 70% Er', v: baixo70, n: baixo70 ? 2 : 0 }],
        charts: [{ title: 'Iluminância por ponto × valor requerido (lux)', type: 'bar', h: 240, labels: pts.map(p => p.p), legend: true, datasets: [{ label: 'Medido', data: xs, levels: xs.map(x => x >= Er ? 0 : x >= .7 * Er ? 1 : 2) }, { label: 'Requerido (Er)', data: pts.map(() => Er), type: 'line', dash: true, color: E.corNivel(3), pointRadius: 0 }] }],
        gridCalc: gc, recs
      };
    },
    metodo: `<h3>Iluminância nos postos de trabalho</h3><p>A NR 17 (17.8.3) exige iluminação natural ou artificial, geral ou suplementar, apropriada à natureza da atividade, distribuída uniformemente e sem ofuscamento, reflexos incômodos, sombras ou contrastes excessivos. A NHO 11 (Fundacentro, 2018) estabelece o procedimento de avaliação: luxímetro calibrado com correção de cosseno e de cor, medição no plano da tarefa (ou a 75 cm do piso), lâmpadas estabilizadas e malha de pontos representativa.</p><p>Os valores de referência (iluminância mantida, Em, e uniformidade, Uo = Emín/Em) seguem a ABNT NBR ISO/CIE 8995-1. A tabela desta ferramenta traz os ambientes mais comuns; para outros, informe o valor requerido personalizado.</p><h3>Critérios usados</h3><ul><li>Em ≥ Er e Uo atendida: conforme.</li><li>Em ≥ Er com Uo abaixo, ou Em entre 90% e 100% de Er: parcialmente conforme.</li><li>Em entre 70% e 90% de Er: não conforme (alto).</li><li>Em abaixo de 70% de Er: não conforme (muito alto).</li></ul>`,
    normasTxt: ['<b>NR 17, 17.8.3</b>: em todos os locais e situações de trabalho deve haver iluminação, natural ou artificial, geral ou suplementar, apropriada à natureza da atividade.', '<b>NHO 11 (Fundacentro)</b>: avaliação dos níveis de iluminamento em ambientes internos de trabalho.', '<b>ABNT NBR ISO/CIE 8995-1</b>: iluminação de ambientes de trabalho — parte 1: interior.'],
    refs: ['Fundacentro. NHO 11 — Avaliação dos níveis de iluminamento em ambientes internos de trabalho, 2018.', 'ABNT NBR ISO/CIE 8995-1:2013 — Iluminação de ambientes de trabalho.']
  });

  /* ======================================================================= Checklists de Ergonomia */
  const CK = [
    ['Posto informatizado', [['Tela posicionada a 50–75 cm, com a borda superior na altura dos olhos ou pouco abaixo', 's'], ['Teclado e mouse no mesmo nível, próximos ao corpo, com punhos neutros', 'n'], ['Suporte para notebook com teclado e mouse externos quando o uso é prolongado', 'na'], ['Ausência de reflexos na tela (janelas e luminárias posicionadas lateralmente)', 'n'], ['Porta-documentos disponível quando há digitação de documentos', 's']]],
    ['Cadeira e mobiliário', [['Assento com regulagem de altura e pés apoiados no piso ou em apoio', 's'], ['Encosto com apoio lombar e regulagem', 'n'], ['Borda frontal do assento arredondada', 's'], ['Espaço livre sob a mesa para pernas e movimentação', 's'], ['Superfície de trabalho com altura compatível com a tarefa e o trabalhador', 'n']]],
    ['Trabalho em pé', [['Possibilidade de alternar as posturas em pé e sentado', 'n'], ['Assentos para descanso disponíveis nas pausas (17.6.7)', 'n'], ['Piso com tapete antifadiga ou material amortecedor', 'n'], ['Objetos de uso frequente na zona de alcance entre cintura e ombros', 's']]],
    ['Ferramentas manuais e equipamentos', [['Pega com diâmetro adequado (30–50 mm para força) e material antiderrapante', 's'], ['Ferramentas não exigem desvio do punho ou pinça com força', 'n'], ['Ferramentas pesadas suspensas ou balanceadas', 'na'], ['Vibração controlada e manutenção preventiva das ferramentas', 's'], ['Comandos e displays visíveis e ao alcance', 's']]],
    ['Ambiente', [['Iluminação adequada à tarefa, sem ofuscamento', 's'], ['Ruído compatível com atividades que exigem concentração', 's'], ['Conforto térmico e ventilação adequados', 'n']]],
    ['Organização do trabalho', [['Pausas definidas para tarefas repetitivas ou com exigência cognitiva', 'n'], ['Metas consideram a variabilidade do trabalho e a opinião dos trabalhadores', 'n'], ['Rodízio entre tarefas com exigências diferentes', 's'], ['Treinamento sobre os riscos ergonômicos e os métodos de trabalho', 's'], ['Canal para os trabalhadores relatarem dificuldades e sugestões', 's']]]
  ];
  const ckItens = []; let ci = 0;
  CK.forEach(([g, its]) => its.forEach(([txt, d]) => { ci++; ckItens.push({ id: 'ck' + ci, g, txt, d }); }));
  E.register({
    id: 'checklists', cat: 'triagem', sigla: 'Checklist', nome: 'Checklists de Ergonomia', menu: 'Checklists de Ergonomia',
    resumo: 'Lista de verificação de conformidade ergonômica para posto informatizado, mobiliário, trabalho em pé, ferramentas manuais, ambiente e organização do trabalho, com índice de conformidade por bloco.',
    normas: ['NR 17 · 17.6', 'NR 17 · 17.7', 'NR 17 · 17.8', 'AEP'], tags: 'checklist conformidade mobiliario couto',
    secoes: [{ t: 'Verificação', d: 'Marque se o requisito é atendido. Não atendido = não conformidade.', f: [{ t: 'yn', id: 'ck', itens: ckItens, opts: [['s', 'Atende'], ['n', 'Não atende'], ['na', 'N/A']] }] }],
    calc(v) {
      const g = {}; let s = 0, n = 0; const nc = [];
      ckItens.forEach(it => { const x = g[it.g] || (g[it.g] = { s: 0, n: 0 }); if (v[it.id] === 's') { s++; x.s++; } else if (v[it.id] === 'n') { n++; x.n++; nc.push(it); } });
      const pct = s + n ? s / (s + n) * 100 : 100;
      const nv = pct >= 90 ? 0 : pct >= 75 ? 1 : pct >= 50 ? 2 : 3;
      const gk = Object.keys(g);
      return {
        score: fmt(pct, 0) + '%', scoreNum: pct, scoreLabel: 'Índice de conformidade', scoreSub: `${s} atendem · ${n} não atendem`,
        faixa: { n: nv, rotulo: ['Condição ergonômica boa', 'Razoável', 'Ruim', 'Péssima'][nv], txt: ['≥ 90% de conformidade.', '75% a 89%: ajustes necessários.', '50% a 74%: melhorias significativas necessárias.', 'Abaixo de 50%: condição inadequada.'][nv] },
        gauge: { v: 100 - pct, min: 0, max: 100, zonas: [10, 25, 50] },
        kpis: gk.map(k => { const x = g[k], p = x.s + x.n ? x.s / (x.s + x.n) * 100 : 100; return { l: k, v: fmt(p, 0) + '%', n: p >= 90 ? 0 : p >= 75 ? 1 : p >= 50 ? 2 : 3 }; }),
        charts: [{ title: 'Conformidade por bloco (%)', type: 'bar', horizontal: true, max: 100, h: 240, labels: gk, datasets: [{ label: '%', data: gk.map(k => { const x = g[k]; return x.s + x.n ? Math.round(x.s / (x.s + x.n) * 100) : 100; }), levels: gk.map(k => { const x = g[k], p = x.s + x.n ? x.s / (x.s + x.n) : 1; return p >= .9 ? 0 : p >= .75 ? 1 : p >= .5 ? 2 : 3; }) }] }],
        recs: nc.map(it => `${it.g}: ${it.txt}.`).concat(nc.length ? ['Registrar as não conformidades no PGR com responsável e prazo.'] : ['Manter as condições e revisar periodicamente.'])
      };
    },
    metodo: `<h3>Checklists de Ergonomia</h3><p>Listas de verificação de requisitos da NR 17 e de boas práticas consagradas (como os checklists de Couto e o Ergonomic Checkpoints da OIT). O índice de conformidade é a proporção de itens atendidos entre os aplicáveis: ≥ 90% boa · 75–89% razoável · 50–74% ruim · &lt; 50% péssima.</p>`,
    refs: ['Couto, H. A. Ergonomia aplicada ao trabalho: o manual técnico da máquina humana. Ergo, 1995.', 'OIT/IEA. Ergonomic Checkpoints, 2ª ed., 2010.']
  });

  /* ======================================================================= EHS */
  const EHS_F = [['tronco', 'Postura de tronco (flexão/torção)'], ['pesc', 'Postura de pescoço'], ['omb', 'Braços acima dos ombros'], ['pun', 'Punhos desviados'], ['rep', 'Repetitividade de membros superiores'], ['forca', 'Força manual (pega/pinça)'], ['lev', 'Levantamento de cargas'], ['emp', 'Empurrar e puxar'], ['pe', 'Trabalho em pé prolongado'], ['sent', 'Trabalho sentado prolongado'], ['vib', 'Vibração'], ['comp', 'Compressão mecânica / contato'], ['term', 'Desconforto térmico'], ['ruido', 'Ruído (conforto)'], ['ilum', 'Iluminação'], ['ritmo', 'Ritmo / pressão de tempo'], ['mental', 'Exigência cognitiva']];
  const EHS_DEF = { tronco: { i: 2, d: 2 }, pesc: { i: 2, d: 3 }, omb: { i: 1, d: 1 }, pun: { i: 2, d: 3 }, rep: { i: 3, d: 3 }, forca: { i: 2, d: 2 }, lev: { i: 2, d: 1 }, emp: { i: 1, d: 1 }, pe: { i: 2, d: 3 }, sent: { i: 0, d: 0 }, vib: { i: 0, d: 0 }, comp: { i: 1, d: 2 }, term: { i: 1, d: 2 }, ruido: { i: 1, d: 3 }, ilum: { i: 1, d: 3 }, ritmo: { i: 2, d: 3 }, mental: { i: 1, d: 2 } };
  E.register({
    id: 'ehs', cat: 'triagem', sigla: 'EHS', nome: 'EHS – Triagem de Riscos Ergonômicos (Saúde e Segurança)', menu: 'EHS – Triagem de Riscos Ergonômicos',
    resumo: 'Matriz de triagem usada por equipes de EHS (Environment, Health & Safety): cada fator de risco recebe intensidade e duração da exposição, gerando um mapa de prioridades do posto.',
    normas: ['NR 17 · 17.3.1', 'NR 01 · 1.5.4', 'AEP'], tags: 'environment health safety triagem matriz exposicao',
    secoes: [{ t: 'Fatores de risco', d: 'Intensidade: 0 ausente · 1 leve · 2 moderada · 3 intensa. Duração: 0 nunca · 1 ocasional (< 1/3) · 2 frequente (1/3 a 2/3) · 3 contínua (> 2/3 da jornada).', f: [
      { t: 'matrix', id: 'm', rows: EHS_F, d: EHS_DEF, extraCol: 'Pontos (I × D)', cols: [{ id: 'i', l: 'Intensidade', o: [[0, '0 · Ausente'], [1, '1 · Leve'], [2, '2 · Moderada'], [3, '3 · Intensa']], d: 0 }, { id: 'd', l: 'Duração', o: [[0, '0 · Nunca'], [1, '1 · Ocasional'], [2, '2 · Frequente'], [3, '3 · Contínua']], d: 0 }] }
    ] }],
    calc(v) {
      const r = EHS_F.map(([id, nome]) => { const x = v.m[id]; const p = U.n0(x.i) * U.n0(x.d); return { id, nome, p, n: p <= 2 ? 0 : p <= 4 ? 1 : p <= 6 ? 2 : 3 }; });
      const mx = { m: {} }; r.forEach(x => mx.m[x.id] = `<span class="lv-pill lv${x.n}">${x.p}</span>`);
      const max = Math.max(...r.map(x => x.n)), tot = r.reduce((s, x) => s + x.p, 0);
      const top = r.filter(x => x.n >= 2).sort((a, b) => b.p - a.p);
      const MAP = { tronco: 'REBA/OWAS', pesc: 'RULA/ROSA', omb: 'RULA/OCRA', pun: 'Strain Index/OCRA', rep: 'OCRA/TOR-TOM/TLV HAL', forca: 'Strain Index/TLV HAL', lev: 'NIOSH/KIM-LHC', emp: 'KIM-PP/Liberty Mutual', pe: 'Checklists/AET', sent: 'ROSA', vib: 'avaliação quantitativa de vibração (NHO 09/10)', comp: 'Checklists', term: 'avaliação de conforto térmico', ruido: 'avaliação de conforto acústico', ilum: 'Avaliação de Iluminamento', ritmo: 'NASA-TLX/HSE-IT', mental: 'NASA-TLX/ERGOS' };
      return {
        score: tot, scoreLabel: 'Pontuação total da triagem', scoreSub: `${top.length} fator(es) prioritário(s) · máximo ${EHS_F.length * 9}`,
        faixa: { n: max, rotulo: 'Maior prioridade: ' + ['baixa', 'moderada', 'alta', 'muito alta'][max], txt: top.length ? 'Fatores com prioridade alta exigem avaliação específica e medidas de controle.' : 'Nenhum fator em prioridade alta.' },
        gauge: { v: max + .5, min: 0, max: 4, zonas: [1, 2, 3] },
        kpis: [0, 1, 2, 3].map(n => ({ l: ['Baixa', 'Moderada', 'Alta', 'Muito alta'][n], v: r.filter(x => x.n === n).length, n })),
        charts: [{ title: 'Mapa de prioridades (I × D, 0 a 9)', type: 'bar', horizontal: true, max: 9, h: 380, labels: r.map(x => x.nome), datasets: [{ label: 'Pontos', data: r.map(x => x.p), levels: r.map(x => x.n) }] }],
        mxCalc: mx,
        recs: top.map(x => `${x.nome} (${x.p} pts): aprofundar com ${MAP[x.id]} e definir controles.`).concat(['Levar os fatores prioritários para a AEP e o inventário de riscos do PGR.'])
      };
    },
    metodo: `<h3>Triagem EHS</h3><p>Matriz simples e rápida usada por equipes de Saúde, Segurança e Meio Ambiente (EHS) para triagem de postos: pontuação = intensidade (0–3) × duração (0–3). 0–2 baixa · 3–4 moderada · 6 alta · 9 muito alta. A triagem indica quais ferramentas específicas aplicar a seguir.</p>`,
    refs: ['NIOSH. Elements of Ergonomics Programs: a primer based on workplace evaluations of musculoskeletal disorders, 1997.', 'Brasil. NR 17 — Ergonomia.']
  });

  /* ======================================================================= PLIBEL */
  const PL = [
    ['O piso é irregular, inclinado, escorregadio ou instável?', 'pes joe lom'], ['O espaço é muito limitado para os movimentos ou materiais?', 'pes joe lom pes2'], ['Ferramentas e equipamentos são inadequados para o trabalhador ou a tarefa?', 'cot pes2 lom'],
    ['A altura de trabalho está mal ajustada?', 'pes2 lom'], ['A cadeira é mal projetada ou mal ajustada?', 'pes2 lom'], ['O trabalho é realizado em pé sem possibilidade de sentar e descansar?', 'pes joe lom'],
    ['Há fadiga no trabalho de pedalar (pedais)?', 'pes joe'], ['Há trabalho com as pernas fatigante: subir repetidamente em degrau, escadas, saltar?', 'pes joe lom'], ['Há trabalho ajoelhado ou agachado repetido ou prolongado?', 'joe lom'],
    ['O pescoço é flexionado à frente ou torcido repetida ou prolongadamente?', 'pes2'], ['O tronco é flexionado ou torcido repetida ou prolongadamente?', 'lom'], ['Os braços trabalham acima dos ombros ou sem apoio repetida ou prolongadamente?', 'pes2 cot'],
    ['Os punhos são flexionados, estendidos ou desviados repetida ou prolongadamente?', 'cot'], ['Há levantamento manual de cargas? (peso, frequência, postura, pega)', 'pes2 cot lom joe'], ['Há trabalho repetitivo, monótono e com movimentos semelhantes?', 'pes2 cot lom'],
    ['Há pegas em pinça ou com força, ou ferramentas pesadas?', 'cot'], ['Há exigência visual elevada que obriga a postura forçada do pescoço?', 'pes2'], ['Há vibração de mãos e braços ou de corpo inteiro?', 'cot lom'],
    ['A iluminação é insuficiente ou causa ofuscamento?', 'pes2'], ['Há frio, calor, correntes de ar ou ruído que dificultam o trabalho?', 'pes2 cot lom'], ['O trabalhador não pode influenciar o ritmo ou a organização do próprio trabalho?', 'pes2 cot lom'],
    ['Há pressão de tempo, metas rígidas ou pagamento por produção?', 'pes2 cot lom']
  ];
  const PL_REG = { pes2: 'Pescoço, ombros e parte superior das costas', cot: 'Cotovelos, antebraços e mãos', pes: 'Pés', joe: 'Joelhos e quadris', lom: 'Região lombar' };
  const PL_DEF = [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1];
  const plItens = PL.map(([txt, r], i) => ({ id: 'pl' + (i + 1), txt, reg: r.split(' '), ref: r.split(' ').map(x => ({ pes2: 'pescoço/ombros', cot: 'mãos/cotovelos', pes: 'pés', joe: 'joelhos', lom: 'lombar' }[x])).join(' · '), d: PL_DEF[i] ? 'sim' : 'nao' }));
  E.register({
    id: 'plibel', cat: 'triagem', sigla: 'PLIBEL', nome: 'PLIBEL – Método de Identificação de Riscos Musculoesqueléticos', menu: 'PLIBEL',
    resumo: 'Checklist sueco (Kemmlert, 1995) que relaciona as condições do posto com cinco regiões do corpo, indicando onde os riscos musculoesqueléticos se concentram.',
    normas: ['NR 17 · 17.3.1', 'AEP'], tags: 'checklist sueco kemmlert regioes corporais',
    secoes: [{ t: 'Itens do PLIBEL', d: 'Marque “Sim” quando a condição estiver presente. Cada item é vinculado às regiões do corpo indicadas.', f: [{ t: 'yn', id: 'pl', itens: plItens, opts: [['sim', 'Sim'], ['nao', 'Não']], ruim: 'sim' }] }],
    calc(v) {
      const cont = Object.fromEntries(Object.keys(PL_REG).map(k => [k, { s: 0, t: 0 }]));
      let sims = 0;
      plItens.forEach(it => { const y = v[it.id] === 'sim'; if (y) sims++; it.reg.forEach(r => { cont[r].t++; if (y) cont[r].s++; }); });
      const regs = Object.keys(PL_REG).map(k => { const p = cont[k].t ? cont[k].s / cont[k].t * 100 : 0; return { k, nome: PL_REG[k], s: cont[k].s, t: cont[k].t, p, n: p < 20 ? 0 : p < 40 ? 1 : p < 60 ? 2 : 3 }; });
      const max = Math.max(...regs.map(r => r.n));
      const pct = sims / plItens.length * 100;
      return {
        score: sims, scoreLabel: 'Itens presentes', scoreSub: `${fmt(pct, 0)}% dos ${plItens.length} itens`, scoreNum: sims,
        faixa: { n: max, rotulo: 'Região mais exposta: ' + regs.slice().sort((a, b) => b.p - a.p)[0].nome.split(',')[0], txt: max >= 2 ? 'Há concentração de fatores de risco em pelo menos uma região do corpo.' : 'Fatores de risco distribuídos em baixa proporção.' },
        gauge: { v: pct, min: 0, max: 100, zonas: [20, 40, 60] },
        kpis: regs.map(r => ({ l: r.nome, v: `${r.s}/${r.t}`, s: fmt(r.p, 0) + '%', n: r.n })),
        charts: [{ title: 'Proporção de itens presentes por região (%)', type: 'bar', horizontal: true, max: 100, h: 230, labels: regs.map(r => r.nome), datasets: [{ label: '%', data: regs.map(r => +r.p.toFixed(0)), levels: regs.map(r => r.n) }] }],
        recs: regs.filter(r => r.n >= 2).map(r => `${r.nome}: corrigir os itens presentes vinculados a esta região e aprofundar com método específico.`).concat(['O PLIBEL é um método de identificação: use-o na AEP e aprofunde com RULA, REBA, OCRA ou NIOSH.'])
      };
    },
    metodo: `<h3>PLIBEL</h3><p>Método de identificação desenvolvido por Kristina Kemmlert (Instituto Nacional de Saúde Ocupacional da Suécia, 1995). Cada pergunta é associada às regiões do corpo afetadas: pescoço/ombros/parte superior das costas, cotovelos/antebraços/mãos, pés, joelhos/quadris e região lombar. Não há pontuação total oficial; esta ferramenta mostra a proporção de itens presentes por região para apoiar a priorização.</p>`,
    refs: ['Kemmlert, K. A method assigned for the identification of ergonomic hazards — PLIBEL. Applied Ergonomics, 26(3), 1995.']
  });

  /* ======================================================================= WISHA */
  const WI = [
    ['Posturas', 'Mãos acima da cabeça ou cotovelos acima dos ombros', 'mais de 2 h/dia', 'mais de 4 h/dia e mais de 1 vez/min', 'c'],
    ['Posturas', 'Pescoço ou tronco flexionado mais de 30° (sem apoio, sem mudar de posição)', 'mais de 2 h/dia', 'mais de 4 h/dia (pescoço > 30°) ou tronco > 45° mais de 2 h/dia', 'c'],
    ['Posturas', 'Agachado ou ajoelhado', 'mais de 2 h/dia', 'mais de 4 h/dia', '0'],
    ['Força manual', 'Pinça de objeto ≥ 0,9 kg (2 lb) ou força de pinça ≥ 1,8 kg por mão', 'mais de 2 h/dia', 'mais de 3 h/dia com punho desviado ou mais de 4 h/dia', 'p'],
    ['Força manual', 'Pega com força de ≥ 4,5 kg (10 lb) por mão', 'mais de 2 h/dia', 'mais de 3 h/dia com punho desviado ou mais de 4 h/dia', 'c'],
    ['Repetitividade', 'Repetir o mesmo movimento do pescoço, ombros, cotovelos, punhos ou mãos a cada poucos segundos', 'mais de 2 h/dia', 'mais de 6 h/dia, ou mais de 2 h/dia com força ou postura', 'p'],
    ['Repetitividade', 'Digitação intensiva', 'mais de 4 h/dia', 'mais de 7 h/dia, ou mais de 4 h/dia com postura inadequada', '0'],
    ['Impacto repetido', 'Usar a mão ou o joelho como martelo mais de 10 vezes por hora', 'mais de 2 h/dia', 'mais de 2 h/dia', '0'],
    ['Levantamento', 'Levantar objetos de 34 kg uma vez; 25 kg mais de 10 vezes/dia; 4,5 kg mais de 2 vezes/min por 2 h; ou acima dos ombros/abaixo dos joelhos/longe do corpo', 'condição presente', 'peso acima do limite da calculadora de levantamento WISHA', 'c'],
    ['Vibração', 'Ferramentas com vibração mão-braço moderada (serras, lixadeiras, esmerilhadeiras)', 'mais de 2 h/dia', 'mais de 4 h/dia', '0'],
    ['Vibração', 'Ferramentas com alta vibração (marteletes, rebitadeiras, impacto)', 'mais de 30 min/dia', 'mais de 30 min/dia', '0']
  ];
  const wiItens = WI.map(([g, txt, c, h, d], i) => ({ id: 'w' + (i + 1), g, txt: `${txt} — Atenção: ${c}; Perigo: ${h}`, d }));
  E.register({
    id: 'wisha', cat: 'triagem', sigla: 'WISHA', nome: 'WISHA – Checklist de Zonas de Atenção e de Perigo', menu: 'WISHA – Caution / Hazard Zone',
    resumo: 'Checklist do Washington State Department of Labor & Industries (WAC 296-62-051) que classifica posturas, força manual, repetitividade, impactos, levantamento e vibração em zona de atenção (caution) ou de perigo (hazard).',
    normas: ['NR 17 · 17.3.1', 'AEP', 'WAC 296-62-051'], tags: 'washington caution zone hazard zone checklist',
    secoes: [{ t: 'Fatores de risco', d: 'Para cada fator, indique se a exposição está ausente, na zona de atenção ou na zona de perigo.', f: [{ t: 'yn', id: 'wi', itens: wiItens, opts: [['0', 'Ausente'], ['c', 'Atenção'], ['p', 'Perigo']], ruim: 'p' }] }],
    calc(v) {
      const c = wiItens.filter(i => v[i.id] === 'c'), p = wiItens.filter(i => v[i.id] === 'p');
      const n = p.length >= 2 ? 3 : p.length === 1 ? 2 : c.length ? 1 : 0;
      const grupos = [...new Set(WI.map(w => w[0]))];
      return {
        score: p.length, scoreLabel: 'Fatores em zona de perigo', scoreSub: `${c.length} em zona de atenção`, scoreNum: p.length * 10 + c.length,
        faixa: { n, rotulo: ['Sem zonas de risco', 'Zona de atenção', 'Zona de perigo', 'Múltiplas zonas de perigo'][n], txt: ['Nenhum fator nas zonas de atenção ou de perigo.', 'Fatores na zona de atenção: avaliar e monitorar.', 'Fator na zona de perigo: reduzir abaixo do nível de perigo.', 'Vários fatores na zona de perigo: intervenção prioritária.'][n] },
        gauge: { v: Math.min(p.length * 2 + c.length * .5, 8), min: 0, max: 8, zonas: [0.4, 2, 4] },
        kpis: [{ l: 'Zona de perigo', v: p.length, n: p.length ? 2 : 0 }, { l: 'Zona de atenção', v: c.length, n: c.length ? 1 : 0 }, { l: 'Ausentes', v: wiItens.length - p.length - c.length, n: 0 }],
        charts: [{ title: 'Fatores por grupo (atenção e perigo)', type: 'bar', stacked: true, legend: true, h: 230, labels: grupos, datasets: [{ label: 'Atenção', data: grupos.map(g => c.filter(i => i.g === g).length), color: E.corNivel(1) }, { label: 'Perigo', data: grupos.map(g => p.filter(i => i.g === g).length), color: E.corNivel(2) }] }],
        recs: p.map(i => 'Reduzir abaixo da zona de perigo: ' + i.txt.split(' — ')[0] + '.').concat(c.length ? ['Fatores na zona de atenção: aprofundar com o método específico (RULA, NIOSH, Strain Index) e monitorar.'] : []).concat(!p.length && !c.length ? ['Manter as condições.'] : [])
      };
    },
    metodo: `<h3>WISHA Caution/Hazard Zone Checklist</h3><p>Desenvolvido pelo Washington State Department of Labor & Industries para a regra de ergonomia WAC 296-62-051. Um trabalho na <b>zona de atenção</b> (caution zone) deve ser avaliado; na <b>zona de perigo</b> (hazard zone), a exposição deve ser reduzida abaixo do nível de perigo ou ao grau tecnicamente viável. A avaliação de levantamento pode ser complementada pela calculadora de levantamento WISHA ou pela <a href="#niosh">Equação NIOSH</a>.</p>`,
    refs: ['Washington State Department of Labor & Industries. Caution Zone Jobs Checklist / Hazard Zone Jobs Checklist, WAC 296-62-051, 2000.']
  });

  /* ======================================================================= Questionário Bipolar (Home Office, Cornell) */
  const BP = [
    ['cad', 'Cadeira desconfortável e sem regulagem', 'Cadeira confortável e regulável', 3], ['mesa', 'Mesa em altura inadequada', 'Mesa em altura adequada', 4], ['mon', 'Tela muito baixa ou muito alta', 'Tela na altura dos olhos', 2],
    ['note', 'Notebook sem suporte e sem teclado/mouse externos', 'Notebook com suporte, teclado e mouse externos', 2], ['ilu', 'Iluminação insuficiente ou com reflexos', 'Iluminação adequada', 5], ['ruid', 'Ambiente ruidoso', 'Ambiente silencioso', 3],
    ['temp', 'Temperatura desconfortável', 'Temperatura confortável', 4], ['esp', 'Espaço apertado ou compartilhado', 'Espaço amplo e exclusivo', 3], ['pausa', 'Sem pausas durante a jornada', 'Pausas regulares', 3],
    ['jorn', 'Jornada sem limites definidos', 'Jornada bem definida', 3], ['isol', 'Isolamento da equipe', 'Contato regular com a equipe', 4], ['casa', 'Conflito entre tarefas domésticas e trabalho', 'Equilíbrio entre casa e trabalho', 3],
    ['int', 'Interrupções frequentes', 'Concentração possível', 3], ['equip', 'Equipamentos e conexão instáveis', 'Equipamentos e conexão estáveis', 5]
  ];
  const CORNELL = [['pesc', 'Pescoço'], ['omb', 'Ombros'], ['costS', 'Parte superior das costas'], ['braco', 'Braços'], ['lomb', 'Região lombar'], ['anteb', 'Antebraços'], ['pun', 'Punhos / mãos'], ['quad', 'Quadril / nádegas'], ['coxa', 'Coxas'], ['joel', 'Joelhos'], ['perna', 'Pernas'], ['pe', 'Pés']];
  const CO_DEF = { pesc: { f: 5, s: 2, i: 2 }, omb: { f: 3.5, s: 2, i: 1 }, costS: { f: 1.5, s: 1, i: 1 }, braco: { f: 0, s: 1, i: 1 }, lomb: { f: 10, s: 2, i: 2 }, anteb: { f: 0, s: 1, i: 1 }, pun: { f: 3.5, s: 2, i: 2 }, quad: { f: 1.5, s: 1, i: 1 }, coxa: { f: 0, s: 1, i: 1 }, joel: { f: 0, s: 1, i: 1 }, perna: { f: 1.5, s: 1, i: 1 }, pe: { f: 0, s: 1, i: 1 } };
  E.register({
    id: 'bipolar', cat: 'triagem', sigla: 'Bipolar Home Office', nome: 'Questionário Bipolar – Home Office (Cornell)', menu: 'Questionário Bipolar – Home Office (Cornell)',
    resumo: 'Questionário bipolar baseado em Cornell que identifica os impactos ergonômicos que o home office pode estar causando nos funcionários: condições do posto em casa (escala bipolar de 1 a 7) e desconforto musculoesquelético por região do corpo (CMDQ).',
    normas: ['NR 17 · 17.6.6', 'NR 01 · teletrabalho', 'CLT art. 75-E'], tags: 'teletrabalho home office cornell cmdq desconforto',
    secoes: [
      { t: 'Condições do home office (escala bipolar)', d: 'Para cada par, escolha o ponto entre 1 (situação à esquerda) e 7 (situação à direita) que melhor descreve sua condição.', f: [
        { t: 'num', id: 'diasHO', l: 'Dias de home office por semana', u: 'dias', d: 3, min: 0, max: 7 },
        { t: 'num', id: 'horasHO', l: 'Horas diárias no computador em casa', u: 'h', d: 8, min: 0, max: 24 }
      ].concat(BP.map(([id, a, z, d]) => ({ t: 'range', id: 'bp_' + id, l: `${a} ↔ ${z}`, min: 1, max: 7, step: 1, d, ends: [a, z] }))) },
      { t: 'Desconforto musculoesquelético (Cornell — CMDQ)', d: 'Na última semana de trabalho, com que frequência sentiu dor ou desconforto, qual a intensidade e quanto interferiu no trabalho?', f: [
        { t: 'matrix', id: 'co', rows: CORNELL, d: CO_DEF, extraCol: 'Escore', cols: [
          { id: 'f', l: 'Frequência', o: [[0, 'Nunca'], [1.5, '1–2 vezes/semana'], [3.5, '3–4 vezes/semana'], [5, '1 vez por dia'], [10, 'Várias vezes por dia']], d: 0 },
          { id: 's', l: 'Intensidade', o: [[1, 'Leve'], [2, 'Moderada'], [3, 'Muito desconfortável']], d: 1 },
          { id: 'i', l: 'Interferência', o: [[1, 'Nenhuma'], [2, 'Pouca'], [3, 'Muita']], d: 1 }] }
      ] }
    ],
    calc(v) {
      const bp = BP.map(([id, a, z]) => ({ id, a, z, x: U.n0(v['bp_' + id]) || 4 }));
      const conforto = (mean(bp.map(b => b.x)) - 1) / 6 * 100;
      const reg = CORNELL.map(([id, nome]) => { const r = v.co[id]; const f = U.n0(r.f); const sc = f ? f * U.n0(r.s) * U.n0(r.i) : 0; return { id, nome, sc }; });
      const tot = reg.reduce((s, r) => s + r.sc, 0), maxR = Math.max(...reg.map(r => r.sc));
      const mx = { co: {} }; reg.forEach(r => { const k = r.sc === 0 ? 0 : r.sc < 10 ? 1 : r.sc < 30 ? 2 : 3; mx.co[r.id] = `<span class="lv-pill lv${k}">${fmt(r.sc, 1)}</span>`; });
      let n = maxR < 5 ? 0 : maxR < 20 ? 1 : maxR < 45 ? 2 : 3;
      if (conforto < 35) n = Math.max(n, 2); else if (conforto < 55) n = Math.max(n, 1);
      const piores = bp.filter(b => b.x <= 3).sort((a, b) => a.x - b.x);
      const regTop = reg.filter(r => r.sc >= 10).sort((a, b) => b.sc - a.sc);
      const recs = piores.slice(0, 6).map(b => `Melhorar: ${b.a.toLowerCase()} → ${b.z.toLowerCase()}.`);
      if (regTop.length) recs.push(`Desconforto relevante em ${regTop.map(r => r.nome.toLowerCase()).join(', ')}: orientar ajustes do posto, pausas e encaminhar ao PCMSO se persistir.`);
      recs.push('Fornecer orientação formal e, quando cabível, equipamentos para o teletrabalho (CLT art. 75-D e 75-E) e aplicar o ROSA no posto em casa.');
      return {
        score: fmt(conforto, 0) + '%', scoreNum: conforto, scoreLabel: 'Índice de conforto do home office', scoreSub: `Desconforto Cornell total ${fmt(tot, 1)} · região máx. ${fmt(maxR, 1)}`,
        faixa: { n, rotulo: ['Impacto baixo', 'Impacto moderado', 'Impacto alto', 'Impacto muito alto'][n], txt: ['Condições do home office adequadas e pouco desconforto.', 'Algumas condições do home office e/ou desconfortos merecem ajuste.', 'O home office está causando impacto ergonômico relevante.', 'Impacto ergonômico muito alto do home office; intervir.'][n] },
        gauge: { v: 100 - conforto, min: 0, max: 100, zonas: [25, 45, 65] },
        kpis: [{ l: 'Conforto do posto', v: fmt(conforto, 0) + '%', n: conforto >= 70 ? 0 : conforto >= 55 ? 1 : conforto >= 35 ? 2 : 3 }, { l: 'Itens desfavoráveis (≤ 3)', v: piores.length, n: piores.length > 4 ? 2 : piores.length ? 1 : 0 }, { l: 'Regiões com desconforto', v: reg.filter(r => r.sc > 0).length }, { l: 'Cornell total', v: fmt(tot, 1) }, { l: 'Horas/dia no computador', v: v.horasHO || 0 }],
        charts: [{ title: 'Desconforto por região (Cornell: frequência × intensidade × interferência)', type: 'bar', horizontal: true, h: 300, labels: reg.map(r => r.nome), datasets: [{ label: 'Escore', data: reg.map(r => +r.sc.toFixed(1)), levels: reg.map(r => r.sc === 0 ? 0 : r.sc < 10 ? 1 : r.sc < 30 ? 2 : 3) }] },
          { title: 'Perfil bipolar do home office (1 desfavorável · 7 favorável)', type: 'radar', min: 0, max: 7, h: 290, labels: bp.map(b => b.z.split(' ').slice(0, 2).join(' ')), datasets: [{ label: 'Pontuação', data: bp.map(b => b.x) }] }],
        mxCalc: mx, recs
      };
    },
    metodo: `<h3>Questionário Bipolar para Home Office</h3><p>Combina duas partes. A primeira é uma escala de diferencial semântico (bipolar) de 1 a 7 sobre as condições do posto em casa: mobiliário, equipamentos, ambiente, jornada, pausas, isolamento e conciliação com a vida doméstica. O índice de conforto é a média convertida em 0–100%.</p><p>A segunda é o Cornell Musculoskeletal Discomfort Questionnaire (CMDQ, Hedge et al., Cornell University), em que o escore de cada região é frequência (0; 1,5; 3,5; 5; 10) × intensidade (1–3) × interferência (1–3), máximo 90 por região.</p>`,
    normasTxt: ['<b>NR 17</b>: os requisitos de mobiliário e de trabalho com computador (17.6) também orientam o posto de teletrabalho.', '<b>CLT, art. 75-E</b>: o empregador deve instruir os empregados quanto às precauções a tomar para evitar doenças e acidentes de trabalho no teletrabalho.', '<b>NR 01</b>: os riscos do teletrabalho, inclusive psicossociais, integram o GRO.'],
    refs: ['Hedge, A.; Morimoto, S.; McCrobie, D. Effects of keyboard tray geometry on upper body posture and comfort. Ergonomics, 42(10), 1999 (CMDQ).', 'Cornell University Ergonomics Web — Cornell Musculoskeletal Discomfort Questionnaires.']
  });
})();
