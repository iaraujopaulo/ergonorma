/* Membros Superiores e Repetitividade: OCRA, Strain Index, Suzanne Rodgers, TLV HAL e TOR-TOM */
(function () {
  'use strict';
  const E = window.Ergo, U = E.util, { fmt, fmtF, clamp, esc } = U;

  /* ======================================================================= Strain Index */
  E.register({
    id: 'strain', cat: 'membros', sigla: 'Strain Index', nome: 'Strain Index – Moore & Garg', menu: 'Strain Index – Moore & Garg',
    resumo: 'Índice de esforço para extremidades superiores distais (mão, punho, antebraço e cotovelo) pelo produto de seis multiplicadores (Moore & Garg, 1995).',
    normas: ['NR 17 · 17.4.3', 'NR 17 · 17.7', 'AEP/AET'], tags: 'punho mao cotovelo distal moore garg',
    secoes: [{ t: 'Variáveis da tarefa', f: [
      { t: 'opt', id: 'IE', l: 'Intensidade do esforço', o: [[1, 'Leve: pouco esforço perceptível (Borg ≤ 2)', '1'], [3, 'Um pouco pesado: esforço perceptível (Borg 3)', '3'], [6, 'Pesado: esforço evidente, sem mudança na expressão facial (Borg 4–5)', '6'], [9, 'Muito pesado: mudança na expressão facial (Borg 6–7)', '9'], [13, 'Próximo ao máximo: usa ombro ou tronco (Borg > 7)', '13']], d: 6 },
      { t: 'num', id: 'DEp', l: 'Duração do esforço (% do ciclo)', u: '%', d: 45, min: 0, max: 100 },
      { t: 'num', id: 'EMn', l: 'Esforços por minuto', u: '/min', d: 12, min: 0 },
      { t: 'opt', id: 'HWP', l: 'Postura de mão/punho', o: [[1, 'Muito boa: perfeitamente neutra', '1,0'], [1.01, 'Boa: próxima à neutra', '1,0'], [1.5, 'Razoável: desvio perceptível', '1,5'], [2, 'Ruim: desvio acentuado', '2,0'], [3, 'Muito ruim: próximo ao extremo', '3,0']], d: 1.5 },
      { t: 'opt', id: 'SW', l: 'Velocidade de trabalho', o: [[1, 'Muito lenta (≤ 80% do ritmo normal)', '1,0'], [1.001, 'Lenta (81–90%)', '1,0'], [1.002, 'Razoável (91–100%)', '1,0'], [1.5, 'Rápida (101–115%), apressada mas acompanha', '1,5'], [2, 'Muito rápida (> 115%), dificuldade em acompanhar', '2,0']], d: 1.5 },
      { t: 'num', id: 'DDh', l: 'Duração da tarefa por dia', u: 'h', d: 7, min: 0, step: 0.5 }
    ] }],
    calc(v) {
      const IE = v.IE, DE = U.faixa(U.n0(v.DEp), [[10, .5], [30, 1], [50, 1.5], [80, 2]], 3), EM = U.faixa(U.n0(v.EMn), [[4, .5], [9, 1], [15, 1.5], [20, 2]], 3);
      const HWP = Math.round(v.HWP * 10) / 10, SW = Math.round(v.SW * 10) / 10;
      const h = U.n0(v.DDh), DD = h <= 1 ? .25 : h <= 2 ? .5 : h <= 4 ? .75 : h < 8 ? 1 : 1.5;
      const SI = IE * DE * EM * HWP * SW * DD;
      const n = SI <= 3 ? 0 : SI <= 5 ? 1 : SI <= 7 ? 2 : 3;
      const m = [['Intensidade', IE], ['Duração', DE], ['Esforços/min', EM], ['Postura', HWP], ['Velocidade', SW], ['Duração/dia', DD]];
      const recs = [];
      if (IE >= 6) recs.push('Reduzir a força exigida: ferramentas com melhor pega, alavancas, ferramentas motorizadas ou dispositivos de fixação.');
      if (EM >= 1.5) recs.push('Reduzir a frequência de esforços com redistribuição do trabalho entre as mãos ou automação de etapas.');
      if (HWP >= 1.5) recs.push('Corrigir o desvio do punho reposicionando a peça ou usando ferramenta com cabo angulado.');
      if (SW >= 1.5) recs.push('Revisar o ritmo de trabalho e a meta de produção.');
      if (DD >= 1) recs.push('Reduzir o tempo diário na tarefa com rodízio para atividades com outros grupos musculares.');
      if (n === 0) recs.push('Tarefa provavelmente segura; manter acompanhamento.');
      return {
        score: fmtF(SI, 2), scoreNum: SI, scoreLabel: 'Strain Index (SI)', scoreSub: m.map(x => fmt(x[1], 2)).join(' × '),
        faixa: { n, rotulo: ['Provavelmente seguro', 'Incerto', 'Algum risco', 'Perigoso'][n], txt: ['SI ≤ 3: tarefa provavelmente segura.', 'SI entre 3 e 5: risco incerto; investigar.', 'SI entre 5 e 7: tarefa associada a algum risco de distúrbios distais.', 'SI > 7: tarefa provavelmente perigosa.'][n] },
        gauge: { v: Math.min(SI, 15), min: 0, max: 15, zonas: [3, 5, 7] },
        kpis: m.map(x => ({ l: x[0], v: fmt(x[1], 2) })),
        charts: [{ title: 'Multiplicadores', type: 'bar', h: 210, labels: m.map(x => x[0]), datasets: [{ label: 'Multiplicador', data: m.map(x => x[1]), levels: m.map(x => x[1] <= 1 ? 0 : x[1] <= 1.5 ? 1 : x[1] <= 3 ? 2 : 3) }] }],
        recs
      };
    },
    metodo: `<h3>Strain Index</h3><p><b>SI = IE × DE × EM × HWP × SW × DD</b> (Moore & Garg, 1995).</p><table class="table table-sm"><thead><tr><th>Variável</th><th>Faixas → multiplicador</th></tr></thead><tbody><tr><td>Intensidade</td><td>leve 1 · um pouco pesado 3 · pesado 6 · muito pesado 9 · máximo 13</td></tr><tr><td>Duração (% do ciclo)</td><td>&lt;10: 0,5 · 10–29: 1 · 30–49: 1,5 · 50–79: 2 · ≥80: 3</td></tr><tr><td>Esforços/min</td><td>&lt;4: 0,5 · 4–8: 1 · 9–14: 1,5 · 15–19: 2 · ≥20: 3</td></tr><tr><td>Postura</td><td>muito boa/boa 1 · razoável 1,5 · ruim 2 · muito ruim 3</td></tr><tr><td>Velocidade</td><td>muito lenta/lenta/razoável 1 · rápida 1,5 · muito rápida 2</td></tr><tr><td>Duração diária</td><td>≤1 h: 0,25 · 1–2 h: 0,5 · 2–4 h: 0,75 · 4–8 h: 1 · ≥8 h: 1,5</td></tr></tbody></table><p>SI ≤ 3 provavelmente seguro · 3–7 incerto/algum risco · &gt; 7 provavelmente perigoso.</p>`,
    refs: ['Moore, J. S.; Garg, A. The Strain Index: a proposed method to analyze jobs for risk of distal upper extremity disorders. AIHA Journal, 56(5), 1995.']
  });

  /* ======================================================================= TLV HAL */
  E.register({
    id: 'tlvhal', cat: 'membros', sigla: 'TLV HAL', nome: 'TLV HAL – Nível de Atividade Manual (ACGIH)', menu: 'TLV HAL – ACGIH',
    resumo: 'Limite de exposição da ACGIH para atividade manual: combina o Nível de Atividade Manual (HAL) e a força de pico normalizada (NPF) e compara com o limite de ação e o TLV.',
    normas: ['NR 17 · 17.4.3', 'ACGIH TLV', 'NR 09'], tags: 'hand activity level acgih forca pico',
    secoes: [
      { t: 'Nível de atividade manual (HAL)', f: [
        { t: 'opt', id: 'modo', l: 'Como determinar o HAL', o: [['obs', 'Escala observacional (0 a 10)'], ['calc', 'Calcular pela frequência e pelo ciclo de trabalho']], d: 'calc' },
        { t: 'range', id: 'halObs', l: 'HAL observado', min: 0, max: 10, step: .5, d: 6, ends: ['0 · mãos ociosas', '10 · máxima rapidez contínua'], show: v => v.modo === 'obs' },
        { t: 'num', id: 'freq', l: 'Frequência de esforços', u: 'esforços/s', d: 0.5, step: .05, min: 0, show: v => v.modo === 'calc' },
        { t: 'num', id: 'duty', l: 'Ciclo de trabalho (tempo com esforço)', u: '% do ciclo', d: 50, min: 1, max: 100, show: v => v.modo === 'calc' }
      ] },
      { t: 'Força de pico normalizada (NPF)', f: [
        { t: 'range', id: 'npf', l: 'NPF (escala 0 a 10 — Borg CR-10 ou % da força máxima / 10)', min: 0, max: 10, step: .5, d: 4, ends: ['0 · nenhuma força', '10 · força máxima'] },
        { t: 'info', html: 'O NPF pode ser estimado pela escala de Borg CR-10 respondida pelo trabalhador ou observada, ou medido como força exigida / força máxima voluntária × 10.' }
      ] }
    ],
    calc(v) {
      let hal;
      if (v.modo === 'obs') hal = U.n0(v.halObs);
      else { const F = U.n0(v.freq), D = clamp(U.n0(v.duty), 1, 100), f = Math.pow(F, 1.31); hal = clamp(6.56 * Math.log(D) * (f / (1 + 3.18 * f)), 0, 10); }
      const npf = U.n0(v.npf);
      const ratio = hal >= 10 ? Infinity : npf / (10 - hal);
      const n = ratio < 0.36 ? 0 : ratio < 0.56 ? 1 : ratio < 0.8 ? 2 : 3;
      const linhas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const recs = [];
      if (ratio >= 0.36) recs.push('Acima do limite de ação: implantar controles gerais (vigilância de saúde, treinamento) e reduzir a exposição.');
      if (ratio >= 0.56) recs.push('Acima do TLV: aplicar controles de engenharia e organizacionais para reduzir o HAL (frequência/ciclo) ou a força de pico.');
      if (npf >= 5) recs.push('Reduzir a força de pico com ferramentas melhores, peças mais leves ou eliminação de esforços de pinça.');
      if (hal >= 6) recs.push('Reduzir a frequência e aumentar a recuperação dentro do ciclo.');
      if (!recs.length) recs.push('Exposição abaixo do limite de ação.');
      return {
        score: isFinite(ratio) ? fmtF(ratio, 2) : '∞', scoreNum: isFinite(ratio) ? ratio : 9, scoreLabel: 'NPF / (10 − HAL)', scoreSub: `HAL ${fmt(hal, 1)} · NPF ${fmt(npf, 1)} · LA 0,36 · TLV 0,56`,
        faixa: { n, rotulo: ['Abaixo do LA', 'Entre LA e TLV', 'Acima do TLV', 'Muito acima do TLV'][n], txt: ['Exposição abaixo do limite de ação.', 'Entre o limite de ação e o TLV: controles gerais e monitoramento.', 'Acima do TLV: controles específicos necessários.', 'Muito acima do TLV: intervenção prioritária.'][n] },
        gauge: { v: Math.min(ratio, 1.2), min: 0, max: 1.2, zonas: [0.36, 0.56, 0.8] },
        kpis: [{ l: 'HAL', v: fmt(hal, 1) }, { l: 'NPF', v: fmt(npf, 1) }, { l: 'NPF máx. no LA', v: fmt(0.36 * (10 - hal), 1) }, { l: 'NPF máx. no TLV', v: fmt(0.56 * (10 - hal), 1) }],
        charts: [{ title: 'Posição em relação ao limite de ação e ao TLV', type: 'scatter', h: 240, xmin: 0, xmax: 10, max: 10, xTitle: 'HAL', yTitle: 'NPF', legend: true, labels: [],
          datasets: [{ label: 'TLV', data: linhas.map(h => ({ x: h, y: 0.56 * (10 - h) })), showLine: true, pointRadius: 0, color: E.corNivel(2) }, { label: 'Limite de ação', data: linhas.map(h => ({ x: h, y: 0.36 * (10 - h) })), showLine: true, pointRadius: 0, dash: true, color: E.corNivel(1) }, { label: 'Tarefa', data: [{ x: +hal.toFixed(2), y: npf }], pointRadius: 7, showLine: false }] }],
        recs
      };
    },
    metodo: `<h3>TLV para atividade manual (ACGIH)</h3><p>O HAL é avaliado de 0 a 10 por observação ou calculado pela equação de Radwin et al. (2015): <b>HAL = 6,56 · ln(D) · [F<sup>1,31</sup> / (1 + 3,18 · F<sup>1,31</sup>)]</b>, com D = ciclo de trabalho (%) e F = frequência (esforços/s).</p><p>O TLV corresponde a <b>NPF / (10 − HAL) = 0,56</b> e o limite de ação a <b>0,36</b>. Acima do limite de ação recomendam-se controles gerais; acima do TLV, controles específicos.</p>`,
    refs: ['ACGIH. TLVs and BEIs — Hand Activity (documentação vigente).', 'Radwin, R. G. et al. A frequency–duty cycle equation for the ACGIH hand activity level. Ergonomics, 58(2), 2015.']
  });

  /* ======================================================================= Suzanne Rodgers */
  const SR_PRIO = { 111: 0, 112: 0, 113: 0, 121: 0, 131: 0, 211: 0, 212: 0, 311: 0, 122: 1, 123: 1, 132: 1, 213: 1, 221: 1, 222: 1, 231: 1, 312: 1, 133: 2, 223: 2, 232: 2, 313: 2, 321: 2, 322: 2, 233: 3, 323: 3, 331: 3, 332: 3, 333: 3 };
  const SR_REG = [['pesc', 'Pescoço'], ['omb', 'Ombros'], ['cost', 'Costas'], ['bra', 'Braços / cotovelos'], ['pun', 'Punhos / mãos / dedos'], ['per', 'Pernas / joelhos'], ['tor', 'Tornozelos / pés / dedos']];
  const SR_DEF = { pesc: { e: 2, d: 2, f: 2 }, omb: { e: 2, d: 3, f: 2 }, cost: { e: 1, d: 2, f: 1 }, bra: { e: 2, d: 2, f: 3 }, pun: { e: 3, d: 2, f: 3 }, per: { e: 1, d: 3, f: 1 }, tor: { e: 1, d: 1, f: 1 } };
  const SR_N = ['Baixa', 'Moderada', 'Alta', 'Muito alta'];
  E.register({
    id: 'rodgers', cat: 'membros', sigla: 'Suzanne Rodgers', nome: 'Suzanne Rodgers – Fadiga Muscular', menu: 'Suzanne Rodgers – Fadiga Muscular',
    resumo: 'Método de avaliação de fadiga muscular em tarefas repetitivas: para cada região do corpo, combina nível de esforço, duração contínua e frequência e define a prioridade de mudança (Rodgers, 1992).',
    normas: ['NR 17 · 17.4.3', 'AEP/AET'], tags: 'muscle fatigue assessment fadiga prioridade',
    secoes: [{ t: 'Regiões do corpo', d: 'Esforço: 1 leve · 2 moderado · 3 pesado. Duração do esforço contínuo: 1 < 6 s · 2 de 6 a 20 s · 3 > 20 s. Frequência: 1 < 1/min · 2 de 1 a 5/min · 3 > 5 a 15/min.', f: [
      { t: 'matrix', id: 'm', rows: SR_REG, d: SR_DEF, extraCol: 'Prioridade', cols: [
        { id: 'e', l: 'Esforço', o: [[1, '1 · Leve'], [2, '2 · Moderado'], [3, '3 · Pesado']], d: 1 },
        { id: 'd', l: 'Duração', o: [[1, '1 · < 6 s'], [2, '2 · 6–20 s'], [3, '3 · > 20 s']], d: 1 },
        { id: 'f', l: 'Frequência', o: [[1, '1 · < 1/min'], [2, '2 · 1–5/min'], [3, '3 · > 5–15/min']], d: 1 }] }
    ] }],
    calc(v) {
      const res = SR_REG.map(([id, nome]) => { const r = v.m[id]; const code = '' + r.e + r.d + r.f; return { id, nome, code, p: SR_PRIO[code] != null ? SR_PRIO[code] : 0 }; });
      const max = Math.max(...res.map(r => r.p));
      const mx = { m: {} }; res.forEach(r => mx.m[r.id] = `<span class="lv-pill lv${r.p}">${r.code} · ${SR_N[r.p]}</span>`);
      const recs = res.filter(r => r.p >= 2).map(r => `${r.nome} (código ${r.code}): reduzir primeiro o fator de maior valor — esforço, duração ou frequência.`);
      if (!recs.length) recs.push('Prioridade baixa ou moderada em todas as regiões; monitorar.');
      return {
        score: SR_N[max], scoreNum: max, scoreLabel: 'Maior prioridade de mudança', scoreSub: res.filter(r => r.p === max).map(r => r.nome).join(', '),
        faixa: { n: max, rotulo: 'Prioridade ' + SR_N[max].toLowerCase(), txt: ['Baixa prioridade de mudança.', 'Prioridade moderada: considerar mudanças.', 'Prioridade alta: mudanças em breve.', 'Prioridade muito alta: mudanças imediatas.'][max] },
        gauge: { v: max + .5, min: 0, max: 4, zonas: [1, 2, 3] },
        kpis: [0, 1, 2, 3].map(n => ({ l: 'Regiões ' + SR_N[n].toLowerCase(), v: res.filter(r => r.p === n).length, n })),
        charts: [{ title: 'Prioridade por região (0 baixa · 3 muito alta)', type: 'bar', horizontal: true, max: 3, h: 250, labels: res.map(r => r.nome), datasets: [{ label: 'Prioridade', data: res.map(r => r.p + .2), levels: res.map(r => r.p) }] }],
        mxCalc: mx, recs
      };
    },
    metodo: `<h3>Muscle Fatigue Assessment</h3><p>Proposto por Suzanne Rodgers (1988/1992), parte do princípio de que a fadiga muscular acumulada em tarefas repetitivas aumenta o risco de lesões. Para cada região, o código de três dígitos (esforço, duração, frequência) define a prioridade de mudança:</p><ul><li><b>Baixa</b>: 111, 112, 113, 121, 131, 211, 212, 311</li><li><b>Moderada</b>: 122, 123, 132, 213, 221, 222, 231, 312</li><li><b>Alta</b>: 133, 223, 232, 313, 321, 322</li><li><b>Muito alta</b>: 233, 323, 331, 332, 333</li></ul><p>A redução do fator de maior pontuação costuma trazer o maior benefício.</p>`,
    refs: ['Rodgers, S. H. A functional job evaluation technique. Occupational Medicine: State of the Art Reviews, 7(4), 1992.', 'Bernard, T. E. Muscle Fatigue Assessment (University of South Florida).']
  });

  /* ======================================================================= OCRA checklist */
  const OCRA_FREQ = [[20, 0, 0], [30, 1, 0], [40, 3, 1], [50, 6, 3], [60, 8, 4], [70, 9, 5]];
  function ocraFreq(a) { if (a <= 20) return 0; for (let i = 1; i < OCRA_FREQ.length; i++) { const [x0, y0] = OCRA_FREQ[i - 1], [x1, y1] = OCRA_FREQ[i]; if (a <= x1) return y0 + (y1 - y0) * (a - x0) / (x1 - x0); } return 10; }
  const OCRA_MULT = [[60, 0.5], [120, 0.5], [180, 0.65], [240, 0.75], [300, 0.85], [360, 0.925], [420, 0.95], [480, 1], [539, 1.2], [599, 1.5], [659, 2]];
  E.register({
    id: 'ocra', cat: 'membros', sigla: 'OCRA', nome: 'OCRA – Checklist de Ações Repetitivas', menu: 'OCRA – Checklist',
    resumo: 'Checklist OCRA (Colombini & Occhipinti) para tarefas repetitivas de membros superiores: recuperação, frequência, força, posturas, estereotipia e fatores complementares, ajustados pela duração.',
    normas: ['NR 17 · 17.4.3', 'ISO 11228-3', 'AEP/AET'], tags: 'occupational repetitive actions colombini',
    secoes: [
      { t: 'Recuperação e frequência', f: [
        { t: 'opt', id: 'rec', l: 'Fator recuperação', o: [[0, 'Pausa de ≥ 8–10 min a cada hora (contando o almoço) ou recuperação dentro do ciclo', '0'], [2, '4 interrupções além do almoço em turno de 7–8 h', '2'], [3, '3 interrupções além do almoço em turno de 7–8 h', '3'], [4, '2 interrupções além do almoço em turno de 7–8 h', '4'], [6, '1 interrupção além do almoço, ou 3 sem almoço', '6'], [10, 'Nenhuma pausa real, exceto alguns minutos', '10']], d: 6 },
        { t: 'num', id: 'acoes', l: 'Ações técnicas por minuto (dinâmicas)', u: 'ações/min', d: 46, min: 0 },
        { t: 'chk', id: 'pausasCurtas', l: 'Há interrupções curtas e frequentes no ciclo (reduz a pontuação de frequência)', d: false, w: 'w-full' },
        { t: 'opt', id: 'estat', l: 'Ações estáticas (segurar objeto)', o: [[0, 'Nenhuma ou < 2/3 do ciclo', '0'], [2.5, 'Objeto mantido por ≥ 5 s em 2/3 do ciclo', '2,5'], [4.5, 'Objeto mantido por ≥ 5 s em 3/3 do ciclo', '4,5']], d: 0 }
      ] },
      { t: 'Força', f: [
        { t: 'opt', id: 'forca', l: 'Uso de força (Borg CR-10)', o: [[0, 'Sem uso de força relevante', '0'], [2, 'Moderada (Borg 3–4) em ~1/3 do tempo', '2'], [4, 'Moderada em ~50% do tempo', '4'], [6, 'Moderada em mais de 50% do tempo', '6'], [8, 'Moderada em quase todo o tempo', '8'], [16, 'Intensa (Borg ≥ 5) em ~10% do tempo', '16'], [24, 'Intensa em ~20% do tempo', '24'], [32, 'Intensa em ≥ 1/3 do tempo / quase máxima', '32']], d: 4 }
      ] },
      { t: 'Posturas e estereotipia', d: 'Considere o membro mais exigido.', f: [
        { t: 'opt', id: 'omb', l: 'Ombro (braço elevado ~80°)', o: [[0, 'Raramente', '0'], [1, '~10% do tempo', '1'], [2, '~1/3 do tempo', '2'], [6, 'Mais da metade do tempo', '6'], [12, 'Quase todo o tempo', '12']], d: 2 },
        { t: 'opt', id: 'cot', l: 'Cotovelo (flexo-extensão ou prono-supinação amplas)', o: [[0, 'Raramente', '0'], [2, '~1/3 do tempo', '2'], [4, 'Mais da metade', '4'], [8, 'Quase todo o tempo', '8']], d: 2 },
        { t: 'opt', id: 'pun', l: 'Punho (flexão/extensão ou desvio extremos)', o: [[0, 'Raramente', '0'], [2, '~1/3 do tempo', '2'], [4, 'Mais da metade', '4'], [8, 'Quase todo o tempo', '8']], d: 4 },
        { t: 'opt', id: 'mao', l: 'Mão (pinça, pega em gancho ou com dedos estendidos)', o: [[0, 'Raramente', '0'], [2, '~1/3 do tempo', '2'], [4, 'Mais da metade', '4'], [8, 'Quase todo o tempo', '8']], d: 4 },
        { t: 'opt', id: 'est', l: 'Estereotipia', o: [[0, 'Gestos variados', '0'], [1.5, 'Mesmos gestos em mais da metade do tempo ou ciclo de 8 a 15 s', '1,5'], [3, 'Mesmos gestos quase todo o tempo ou ciclo < 8 s', '3']], d: 1.5 }
      ] },
      { t: 'Fatores complementares e duração', f: [
        { t: 'opt', id: 'comp', l: 'Fatores complementares', o: [[0, 'Nenhum', '0'], [1, 'Luvas inadequadas, vibração ocasional, compressão ou exigência de precisão em parte do tempo', '1'], [2, 'Um fator presente mais de 1/3 do tempo (vibração, golpes, frio, compressão)', '2'], [3, 'Dois ou mais fatores ou ritmo imposto pela máquina', '3']], d: 1 },
        { t: 'num', id: 'dur', l: 'Tempo líquido de trabalho repetitivo no turno', u: 'min', d: 440, min: 0 }
      ] }
    ],
    calc(v) {
      let fq = ocraFreq(U.n0(v.acoes)); if (v.pausasCurtas) fq = Math.max(0, fq - 1); fq = Math.max(fq, U.n0(v.estat)); fq = Math.min(fq, 10);
      const post = Math.max(U.n0(v.omb), U.n0(v.cot), U.n0(v.pun), U.n0(v.mao)) + U.n0(v.est);
      const base = U.n0(v.rec) + fq + U.n0(v.forca) + post + U.n0(v.comp);
      const d = U.n0(v.dur); const mult = U.faixa(d, OCRA_MULT.map(([m, x]) => [m + 0.001, x]), 2);
      const sc = base * mult;
      const n = sc <= 7.5 ? 0 : sc <= 11 ? 1 : sc <= 22.5 ? 2 : 3;
      const rot = sc <= 7.5 ? 'Aceitável (verde)' : sc <= 11 ? 'Muito leve / incerto (amarelo)' : sc <= 14 ? 'Risco leve (vermelho claro)' : sc <= 22.5 ? 'Risco médio (vermelho)' : 'Risco alto (roxo)';
      const comps = [['Recuperação', U.n0(v.rec)], ['Frequência', fq], ['Força', U.n0(v.forca)], ['Postura', post], ['Complementares', U.n0(v.comp)]];
      const recs = [];
      if (U.n0(v.rec) >= 4) recs.push('Distribuir pausas de recuperação ao longo do turno (idealmente 8–10 min a cada hora).');
      if (fq >= 3) recs.push('Reduzir o número de ações técnicas por minuto: rebalancear a linha ou eliminar ações desnecessárias.');
      if (U.n0(v.forca) >= 4) recs.push('Reduzir a força exigida com ferramentas adequadas e manutenção.');
      if (post >= 4) recs.push('Corrigir posturas de punho, mão e ombro pelo reposicionamento das peças e ferramentas.');
      if (v.est >= 1.5) recs.push('Enriquecer a tarefa com rodízio para quebrar a estereotipia.');
      if (n === 0) recs.push('Risco aceitável; manter as condições.');
      return {
        score: fmt(sc, 1), scoreNum: sc, scoreLabel: 'Índice Checklist OCRA', scoreSub: `(${fmt(base, 1)}) × ${fmt(mult, 3)} (duração)`,
        faixa: { n, rotulo: rot, txt: rot + '.', acao: n >= 2 ? 'Melhorias no posto, na organização e vigilância da saúde são necessárias.' : '' },
        gauge: { v: Math.min(sc, 35), min: 0, max: 35, zonas: [7.5, 11, 22.5] },
        kpis: comps.map(c => ({ l: c[0], v: fmt(c[1], 1) })).concat([{ l: 'Multiplicador de duração', v: fmt(mult, 3) }]),
        charts: [{ title: 'Contribuição de cada fator', type: 'bar', h: 220, labels: comps.map(c => c[0]), datasets: [{ label: 'Pontos', data: comps.map(c => +c[1].toFixed(2)) }] }],
        recs
      };
    },
    metodo: `<h3>Checklist OCRA</h3><p><b>Índice = (Recuperação + Frequência + Força + Postura + Complementares) × Multiplicador de duração</b>. A postura é o maior valor entre ombro, cotovelo, punho e mão, somado à estereotipia.</p><p>A pontuação de frequência é interpolada a partir das ações técnicas por minuto (20 → 0, 30 → 1, 40 → 3, 50 → 6, 60 → 8, 70 → 9, &gt;70 → 10).</p><table class="table table-sm"><tbody><tr><td>≤ 7,5</td><td>Aceitável</td></tr><tr><td>7,6–11</td><td>Muito leve / incerto</td></tr><tr><td>11,1–14</td><td>Leve</td></tr><tr><td>14,1–22,5</td><td>Médio</td></tr><tr><td>&gt; 22,5</td><td>Alto</td></tr></tbody></table>`,
    refs: ['Colombini, D.; Occhipinti, E. Risk Analysis and Management of Repetitive Actions: A Guide for Applying the OCRA System. CRC Press, 2016.', 'ISO 11228-3:2007 — Handling of low loads at high frequency.']
  });

  /* ======================================================================= TOR-TOM */
  const TT_T = {
    ok: 'Nesta condição de trabalho é pouco provável a ocorrência de desconforto, dificuldade ou fadiga.',
    ok2: 'Pouco provável a ocorrência de desconforto, dificuldade ou fadiga. Pode ser estudada alguma forma de aumentar a ocupação do trabalhador.',
    b1: 'A taxa de ocupação real está um pouco acima do adequado: é provável haver queixas de desconforto, dificuldade e fadiga.',
    b2: 'Sobrecarga de trabalho de baixo grau. É possível haver queixas, especialmente entre pessoas mais suscetíveis.',
    b3: 'Organização do trabalho desajustada: queixas de dor e até afastamento são prováveis.',
    b4: 'Organização do trabalho muito desajustada: medidas urgentes de engenharia, rodízio ou pausas.',
    b5: 'Organização do trabalho extremamente desajustada: risco de lesões importantes; medidas urgentes.'
  };
  function ttFaixa(d) {
    if (d < -15) return { n: 0, rotulo: 'Seguro (verde)', txt: TT_T.ok2 };
    if (d <= 0) return { n: 0, rotulo: 'Seguro (verde)', txt: TT_T.ok };
    if (d <= 2) return { n: 1, rotulo: 'Atenção (amarelo)', txt: TT_T.b1 };
    if (d <= 5) return { n: 1, rotulo: 'Atenção (amarelo)', txt: TT_T.b2 };
    if (d <= 10) return { n: 2, rotulo: 'Risco (vermelho)', txt: TT_T.b3 };
    if (d <= 15) return { n: 2, rotulo: 'Risco (vermelho)', txt: TT_T.b4 };
    return { n: 3, rotulo: 'Crítico (roxo)', txt: TT_T.b5 };
  }
  E.register({
    id: 'tortom', cat: 'membros', sigla: 'TOR-TOM', nome: 'TOR-TOM – Membros Superiores', menu: 'TOR-TOM – Membros Superiores',
    resumo: 'Compara a Taxa de Ocupação Real (TOR) com a Taxa de Ocupação Máxima (TOM) admissível para trabalho com membros superiores (Couto). Use o aplicativo TOR-TOM integrado e importe o resultado para o painel e o relatório.',
    normas: ['NR 17 · 17.4.3', 'NR 17 · 17.4.1', 'AEP/AET'], tags: 'couto taxa de ocupacao pausas repetitividade',
    topo: () => `<section class="embed-card">
        <header><div><div class="eyebrow"><i data-lucide="smartphone"></i> Aplicativo TOR-TOM MMSS</div><b>Avaliação passo a passo com imagens de referência</b></div>
        <button type="button" class="btn btn-sm btn-signal" id="ttImport"><i data-lucide="download"></i> Importar resultado do aplicativo</button></header>
        <iframe id="ttFrame" title="Aplicativo TOR-TOM" src="apps/tortom/index.html" style="height:760px"></iframe>
        <div class="embed-note">Preencha o aplicativo até a tela de resultado e clique em “Importar resultado do aplicativo”. Os fatores são copiados para os campos abaixo, que também podem ser preenchidos diretamente.</div>
      </section>`,
    bind(cur) {
      const btn = document.getElementById('ttImport'); if (!btn) return;
      btn.onclick = () => {
        let f;
        try { f = document.getElementById('ttFrame').contentWindow.__TT.fatores(); } catch (e) { E.toast('Aplicativo TOR-TOM ainda não carregou.', 'warn'); return; }
        Object.assign(cur.v, { FR: f.FR, FF: f.FF, FPM: f.FPM, FPD: f.FPD, FEE: f.FEE, FCM: f.FCM, FPB: f.FPB, pond: f.pond == null ? 0 : [5, 0, -5][f.pond], modoTor: f.torConhecida ? 'direto' : 'calc', torDireto: f.torManual, PR: +f.PR.toFixed(2), ABEE: +f.ABEE.toFixed(2), PI: f.PI, PCEC: f.PCEC, TM: f.TM, jornada: f.jornada || '' });
        if (f.ativ) cur.ident.atividade = f.ativ;
        E.renderFerramenta(); E.toast(f.completo ? 'Resultado do TOR-TOM importado.' : 'Dados importados (a avaliação no aplicativo ainda não chegou ao resultado).', 'ok');
      };
    },
    secoes: [
      { t: 'TOM — fatores de redução (%)', d: 'TOM = 95 − FR − FF − FPM − FPD − FEE − FCM ± ponderação.', f: [
        { t: 'num', id: 'FR', l: 'FR · Fator repetitividade', u: '%', d: 6 }, { t: 'num', id: 'FF', l: 'FF · Fator força', u: '%', d: 6 },
        { t: 'num', id: 'FPM', l: 'FPM · Fator peso movimentado', u: '%', d: 0 }, { t: 'num', id: 'FPD', l: 'FPD · Fator postura em desvio', u: '%', d: 7.5 },
        { t: 'num', id: 'FEE', l: 'FEE · Fator esforço estático', u: '%', d: 4 }, { t: 'num', id: 'FCM', l: 'FCM · Fator carga mental', u: '%', d: 3 },
        { t: 'sel', id: 'pond', l: 'Ponderação da TOM', o: [[5, 'Predomínio de mecanismos de regulação (+5)'], [0, 'Equivalência entre dificuldades e regulação (0)'], [-5, 'Predomínio de graus de dificuldade (−5)']], d: 0 },
        { t: 'num', id: 'FPB', l: 'FPB · Postura básica (informativo, gera alerta)', u: 'pts', d: 10 }
      ] },
      { t: 'TOR — taxa de ocupação real (%)', f: [
        { t: 'opt', id: 'modoTor', l: 'Como obter a TOR', o: [['calc', 'Calcular: 100 − PR − ABEE − PI − PCEC − TM'], ['direto', 'Informar o valor da TOR']], d: 'calc' },
        { t: 'num', id: 'torDireto', l: 'TOR informada', u: '%', d: 80, show: v => v.modoTor === 'direto' },
        { t: 'num', id: 'jornada', l: 'Jornada', u: 'min', d: 528, show: v => v.modoTor === 'calc' },
        { t: 'num', id: 'PR', l: 'PR · Pausas regulares', u: '% da jornada', d: 13.6, show: v => v.modoTor === 'calc' },
        { t: 'num', id: 'ABEE', l: 'ABEE · Atividades de baixa exigência ergonômica', u: '%', d: 3, show: v => v.modoTor === 'calc' },
        { t: 'num', id: 'PI', l: 'PI · Pausas irregulares', u: '%', d: 2, show: v => v.modoTor === 'calc' },
        { t: 'num', id: 'PCEC', l: 'PCEC · Pausas curtíssimas entre ciclos', u: '%', d: 1, show: v => v.modoTor === 'calc' },
        { t: 'num', id: 'TM', l: 'TM · Tempo de máquina', u: '%', d: 0, show: v => v.modoTor === 'calc' }
      ] }
    ],
    calc(v) {
      const fat = ['FR', 'FF', 'FPM', 'FPD', 'FEE', 'FCM'].map(k => [k, U.n0(v[k])]);
      const TOM = 95 - fat.reduce((s, x) => s + x[1], 0) + U.n0(v.pond);
      const comps = ['PR', 'ABEE', 'PI', 'PCEC', 'TM'].map(k => [k, U.n0(v[k])]);
      const TOR = v.modoTor === 'direto' ? U.n0(v.torDireto) : 100 - comps.reduce((s, x) => s + x[1], 0);
      const d = Math.round((TOR - TOM) * 10) / 10, fx = ttFaixa(d);
      const alertas = [];
      if (U.n0(v.FR) >= 10) alertas.push('Fator repetitividade: altíssima repetitividade.');
      if (U.n0(v.FF) >= 20) alertas.push('Fator força: esforços muito intensos.');
      if (U.n0(v.FEE) >= 20) alertas.push('Fator esforço estático: corpo mantido fora do eixo vertical.');
      if (U.n0(v.FPB) >= 20) alertas.push('Fator postura básica: postura fatigante para pernas/coluna.');
      const recs = [];
      if (d > 0) recs.push(`Reduzir a TOR em pelo menos ${fmt(d, 1)} pontos percentuais (pausas de recuperação, rodízio ou redução do conteúdo repetitivo) ou aumentar a TOM pela melhoria dos fatores.`);
      const pior = fat.slice().sort((a, b) => b[1] - a[1])[0];
      if (pior[1] > 0) recs.push(`O fator que mais reduz a TOM é ${pior[0]} (${fmt(pior[1], 1)}%): priorize melhorias de engenharia sobre ele.`);
      alertas.forEach(a => recs.push('Melhoria de engenharia necessária — ' + a));
      if (U.n0(v.FPB) > 5) recs.push('Estudar formas de reduzir o desconforto da postura básica de pernas e coluna durante a jornada.');
      if (d <= 0) recs.push('Condição adequada; manter as pausas e a organização atual.');
      return {
        score: (d > 0 ? '+' : '') + fmt(d, 1), scoreNum: d, scoreLabel: 'TOR − TOM', scoreSub: `TOR ${fmt(TOR, 1)}% · TOM ${fmt(TOM, 1)}%`,
        faixa: fx, gauge: { v: clamp(d, -20, 20), min: -20, max: 20, zonas: [0, 5, 15] },
        kpis: [{ l: 'TOR (ocupação real)', v: fmt(TOR, 1) + '%' }, { l: 'TOM (ocupação máxima)', v: fmt(TOM, 1) + '%' }, { l: 'Folga / sobrecarga', v: (d > 0 ? '+' : '') + fmt(d, 1), n: fx.n }, { l: 'Alertas', v: alertas.length, n: alertas.length ? 2 : 0 }],
        charts: [{ title: 'TOR × TOM (%)', type: 'bar', horizontal: true, h: 140, max: 100, labels: ['TOR', 'TOM'], datasets: [{ label: '%', data: [+TOR.toFixed(1), +TOM.toFixed(1)], levels: [fx.n, 0] }] },
          { title: 'Fatores que reduzem a TOM (%)', type: 'bar', h: 210, labels: fat.map(f => f[0]), datasets: [{ label: '%', data: fat.map(f => f[1]) }] }],
        recs
      };
    },
    metodo: `<h3>TOR-TOM (Couto)</h3><p>Compara a Taxa de Ocupação Real do trabalhador (TOR — percentual da jornada efetivamente ocupado) com a Taxa de Ocupação Máxima admissível (TOM), que parte de 95% e desconta os fatores de repetitividade (FR), força (FF), peso movimentado (FPM), postura em desvio (FPD), esforço estático (FEE) e carga mental (FCM), com ponderação de ±5.</p><p><b>TOR = 100 − PR − ABEE − PI − PCEC − TM</b></p><table class="table table-sm"><thead><tr><th>TOR − TOM</th><th>Interpretação</th></tr></thead><tbody><tr><td>≤ 0</td><td>Verde — pouco provável desconforto</td></tr><tr><td>0 a 5</td><td>Amarelo — sobrecarga leve</td></tr><tr><td>5 a 15</td><td>Vermelho — organização desajustada</td></tr><tr><td>&gt; 15</td><td>Roxo — extremamente desajustada</td></tr></tbody></table><p>O aplicativo integrado é o TOR-TOM MMSS anexado, com as tabelas e textos do método e imagens de referência das posturas.</p>`,
    refs: ['Couto, H. A. Ergonomia do corpo e do cérebro no trabalho. Ergo Editora, 2014.', 'Aplicativo TOR-TOM MMSS – Membros Superiores (projeto anexado).']
  });
})();
