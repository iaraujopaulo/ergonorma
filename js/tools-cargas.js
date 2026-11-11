/* Movimentação Manual de Cargas: Equação NIOSH, KIM-LHC, KIM-PP, Liberty Mutual (Snook & Ciriello) e MAPO */
(function () {
  'use strict';
  const E = window.Ergo, U = E.util, { fmt, fmtF, clamp, esc } = U;

  /* ======================================================================= NIOSH */
  const FREQ = [0.2, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const FM = {
    1: { lo: [1, .97, .94, .91, .88, .84, .80, .75, .70, .60, .52, .45, .41, .37, 0, 0, 0], hi: [1, .97, .94, .91, .88, .84, .80, .75, .70, .60, .52, .45, .41, .37, .34, .31, .28] },
    2: { lo: [.95, .92, .88, .84, .79, .72, .60, .50, .42, .35, .30, .26, 0, 0, 0, 0, 0], hi: [.95, .92, .88, .84, .79, .72, .60, .50, .42, .35, .30, .26, .23, .21, 0, 0, 0] },
    8: { lo: [.85, .81, .75, .65, .55, .45, .35, .27, .22, .18, 0, 0, 0, 0, 0, 0, 0], hi: [.85, .81, .75, .65, .55, .45, .35, .27, .22, .18, .15, .13, 0, 0, 0, 0, 0] }
  };
  function fmNiosh(F, dur, V) {
    if (F > 15) return 0;
    let i = FREQ.findIndex(x => F <= x + 1e-9); if (i < 0) return 0;
    return FM[dur][V >= 75 ? 'hi' : 'lo'][i];
  }
  E.register({
    id: 'niosh', cat: 'cargas', sigla: 'NIOSH', nome: 'Equação NIOSH (revisada, 1991)', menu: 'Equação NIOSH',
    resumo: 'Calcula o Limite de Peso Recomendado (LPR/RWL) e o Índice de Levantamento (IL/LI) para tarefas de levantamento manual com as duas mãos (Waters et al., 1993).',
    normas: ['NR 17 · 17.5', 'ISO 11228-1', 'AEP/AET'], tags: 'levantamento carga lpr rwl indice',
    secoes: [
      { t: 'Carga e geometria do levantamento', d: 'Medidas na origem do levantamento (ou no destino, se houver controle significativo).', f: [
        { t: 'num', id: 'L', l: 'Peso da carga (L)', u: 'kg', d: 14, min: 0 },
        { t: 'num', id: 'H', l: 'Distância horizontal (H) — tornozelos às mãos', u: 'cm', d: 40, min: 0, h: 'Mínimo 25 cm, máximo 63 cm.' },
        { t: 'num', id: 'V', l: 'Altura vertical das mãos na origem (V)', u: 'cm', d: 15, min: 0, h: 'Do piso às mãos; máximo 175 cm.' },
        { t: 'num', id: 'D', l: 'Deslocamento vertical (D)', u: 'cm', d: 60, min: 0, h: '|V destino − V origem|, mínimo 25 cm.' },
        { t: 'num', id: 'A', l: 'Ângulo de assimetria (A)', u: 'graus', d: 30, min: 0, max: 180 },
        { t: 'num', id: 'F', l: 'Frequência de levantamentos (F)', u: 'lev./min', d: 2, min: 0, step: 0.1 },
        { t: 'opt', id: 'dur', l: 'Duração contínua da tarefa', o: [[1, 'Até 1 h (com recuperação ≥ 1,2× o tempo de trabalho)'], [2, 'De 1 a 2 h (com recuperação ≥ 0,3×)'], [8, 'De 2 a 8 h']], d: 8 },
        { t: 'opt', id: 'pega', l: 'Qualidade da pega', o: [['boa', 'Boa: alças ou recortes ótimos'], ['razoavel', 'Razoável: alças subótimas ou dedos a 90°'], ['ruim', 'Ruim: sem alças, carga volumosa ou irregular']], d: 'razoavel' }
      ] }
    ],
    calc(v) {
      const L = U.n0(v.L), H = U.n0(v.H), V = U.n0(v.V), D = U.n0(v.D), A = U.n0(v.A), F = U.n0(v.F);
      const HM = H <= 25 ? 1 : H > 63 ? 0 : 25 / H;
      const VM = V > 175 ? 0 : 1 - 0.003 * Math.abs(V - 75);
      const DM = D <= 25 ? 1 : D > 175 ? 0 : 0.82 + 4.5 / D;
      const AM = A > 135 ? 0 : 1 - 0.0032 * A;
      const FMv = F < 0.2 ? fmNiosh(0.2, v.dur, V) : fmNiosh(F, v.dur, V);
      const CM = v.pega === 'boa' ? 1 : v.pega === 'razoavel' ? (V < 75 ? 0.95 : 1) : 0.9;
      const RWL = 23 * HM * VM * DM * AM * FMv * CM;
      const LI = RWL > 0 ? L / RWL : Infinity;
      const n = LI <= 1 ? 0 : LI <= 2 ? 1 : LI <= 3 ? 2 : 3;
      const mult = [['HM', HM], ['VM', VM], ['DM', DM], ['AM', AM], ['FM', FMv], ['CM', CM]];
      const pior = mult.slice().sort((a, b) => a[1] - b[1])[0];
      const DICAS = { HM: 'Aproximar a carga do corpo (reduzir H): eliminar obstáculos e usar caixas menores.', VM: 'Elevar a origem da carga para perto de 75 cm (altura dos punhos), evitando o piso.', DM: 'Reduzir o deslocamento vertical entre origem e destino.', AM: 'Eliminar a torção do tronco reorganizando origem e destino à frente do trabalhador.', FM: 'Reduzir a frequência ou a duração contínua com rodízio e pausas.', CM: 'Melhorar a pega com alças ou recortes nas caixas.' };
      const recs = [DICAS[pior[0]]];
      if (LI > 1) recs.push(`Reduzir o peso para no máximo ${fmt(RWL, 1)} kg ou adotar auxílio mecânico (carrinho, mesa elevatória, talha).`);
      if (LI > 3) recs.push('IL acima de 3: a maioria dos trabalhadores está em risco; intervenção prioritária.');
      if (LI <= 1) recs.push('Tarefa aceitável para a maioria dos trabalhadores saudáveis; manter treinamento sobre técnicas de manuseio.');
      return {
        score: isFinite(LI) ? fmtF(LI, 2) : '∞', scoreNum: isFinite(LI) ? LI : 99, scoreLabel: 'Índice de Levantamento (IL)', scoreSub: `LPR = ${fmtF(RWL, 2)} kg · carga ${fmt(L)} kg`,
        faixa: { n, rotulo: ['IL ≤ 1', '1 < IL ≤ 2', '2 < IL ≤ 3', 'IL > 3'][n], txt: ['Risco baixo: carga dentro do limite recomendado.', 'Risco moderado: parte dos trabalhadores pode estar em risco.', 'Risco alto: tarefa deve ser redesenhada.', 'Risco muito alto: redesenho imediato.'][n] },
        gauge: { v: Math.min(LI, 5), min: 0, max: 5, zonas: [1, 2, 3] },
        kpis: [{ l: 'LPR (RWL)', v: fmtF(RWL, 2) + ' kg' }, { l: 'IL', v: isFinite(LI) ? fmtF(LI, 2) : '∞', n }].concat(mult.map(m => ({ l: m[0], v: fmtF(m[1], 2), n: m[1] >= .85 ? 0 : m[1] >= .7 ? 1 : m[1] >= .5 ? 2 : 3 }))),
        charts: [{ title: 'Multiplicadores (1 = sem redução)', type: 'bar', max: 1, h: 220, labels: mult.map(m => m[0]), datasets: [{ label: 'Valor', data: mult.map(m => +m[1].toFixed(3)), levels: mult.map(m => m[1] >= .85 ? 0 : m[1] >= .7 ? 1 : m[1] >= .5 ? 2 : 3) }] },
          { title: 'Carga real × limite recomendado (kg)', type: 'bar', horizontal: true, h: 140, labels: ['Carga real', 'LPR'], datasets: [{ label: 'kg', data: [L, +RWL.toFixed(2)], levels: [n, 0] }] }],
        recs
      };
    },
    metodo: `<h3>Equação revisada de levantamento</h3><p><b>LPR = LC × HM × VM × DM × AM × FM × CM</b>, com LC = 23 kg. <b>IL = carga / LPR</b>.</p>
      <ul><li>HM = 25/H (H em cm; 1 se H ≤ 25; 0 se H &gt; 63)</li><li>VM = 1 − 0,003 |V − 75|</li><li>DM = 0,82 + 4,5/D</li><li>AM = 1 − 0,0032 A</li><li>FM e CM: tabelas do manual NIOSH (frequência × duração × altura V; pega × V)</li></ul>
      <p>Frequências intermediárias usam o valor tabelado imediatamente superior (critério conservador).</p><p>IL ≤ 1: aceitável para a maioria dos trabalhadores · IL &gt; 1: risco aumentado · IL &gt; 3: risco para a maioria.</p>`,
    refs: ['Waters, T. R. et al. Revised NIOSH equation for the design and evaluation of manual lifting tasks. Ergonomics, 36(7), 1993.', 'NIOSH. Applications Manual for the Revised NIOSH Lifting Equation, 1994 (rev. 2021).']
  });

  /* ======================================================================= KIM-LHC */
  const KIM_TXT = ['Baixo risco: sobrecarga física improvável.', 'Risco aumentado: possível sobrecarga para pessoas menos resilientes.', 'Risco altamente aumentado: sobrecarga provável; redesenho recomendado.', 'Risco alto: sobrecarga física provável; redesenho necessário.'];
  const kimN = x => x < 10 ? 0 : x < 25 ? 1 : x < 50 ? 2 : 3;
  E.register({
    id: 'kimlhc', cat: 'cargas', sigla: 'KIM-LHC', nome: 'KIM – Levantamento e Transporte', menu: 'KIM – Levantamento e Transporte',
    resumo: 'Método dos Indicadores-Chave (BAuA/LASI) para levantar, segurar e transportar cargas: pontuação de tempo × (carga + postura + condições).',
    normas: ['NR 17 · 17.5', 'ISO 11228-1', 'AEP/AET'], tags: 'key indicator method levantar segurar transportar baua',
    secoes: [
      { t: 'Tempo', f: [
        { t: 'opt', id: 'tipo', l: 'Tipo de operação', o: [['lev', 'Levantar ou mover a carga (< 5 s)'], ['seg', 'Segurar a carga (> 5 s)'], ['tra', 'Transportar a carga (> 5 m)']], d: 'lev' },
        { t: 'num', id: 'qtd', l: 'Quantidade por jornada', u: 'vezes / min / m', d: 220, min: 0, h: 'Levantar: nº de operações por dia · Segurar: minutos totais por dia · Transportar: distância total em metros por dia.' }
      ] },
      { t: 'Carga, postura e condições', f: [
        { t: 'opt', id: 'sexo', l: 'Sexo de referência', o: [['m', 'Masculino'], ['f', 'Feminino']], d: 'f' },
        { t: 'num', id: 'peso', l: 'Peso efetivo da carga', u: 'kg', d: 12, min: 0, h: 'Força de ação real sobre o trabalhador (descontar apoio ou ajuda).' },
        { t: 'opt', id: 'post', l: 'Postura e posição da carga', o: [[1, 'Tronco ereto, sem torção; carga próxima ao corpo', 1], [2, 'Leve inclinação ou torção do tronco; carga próxima ao corpo', 2], [4, 'Inclinação acentuada à frente; leve inclinação com torção; carga longe do corpo ou acima dos ombros', 4], [8, 'Inclinação acentuada com torção; carga longe do corpo; estabilidade limitada; agachado ou ajoelhado', 8]], d: 4 },
        { t: 'opt', id: 'cond', l: 'Condições de execução', o: [[0, 'Boas condições ergonômicas: espaço, piso firme e nivelado, iluminação e pega adequadas', 0], [1, 'Espaço restrito ou condições ergonômicas limitadas (piso irregular, pega ruim)', 1], [2, 'Liberdade de movimento muito restrita ou instabilidade da carga', 2]], d: 1 }
      ] }
    ],
    calc(v) {
      const q = U.n0(v.qtd);
      const tab = v.tipo === 'lev' ? [[10, 1], [40, 2], [200, 4], [500, 6], [1000, 8]] : v.tipo === 'seg' ? [[5, 1], [15, 2], [60, 4], [120, 6], [240, 8]] : [[300, 1], [1000, 2], [4000, 4], [8000, 6], [16000, 8]];
      const t = U.faixa(q, tab, 10);
      const p = U.n0(v.peso);
      const lc = v.sexo === 'm' ? U.faixa(p, [[10, 1], [20, 2], [30, 4], [40, 7]], 25) : U.faixa(p, [[5, 1], [10, 2], [15, 4], [25, 7]], 25);
      const soma = lc + U.n0(v.post) + U.n0(v.cond), risco = t * soma, n = kimN(risco);
      const recs = [];
      if (lc >= 4) recs.push('Reduzir o peso unitário da carga ou usar auxílio mecânico.');
      if (v.post >= 4) recs.push('Melhorar a postura: posicionar a carga entre joelhos e ombros, próxima ao corpo e sem torção.');
      if (v.cond >= 1) recs.push('Melhorar o espaço, o piso e a pega da carga.');
      if (t >= 6) recs.push('Reduzir a frequência ou a duração diária com rodízio de tarefas.');
      if (lc === 25) recs.push('Carga acima do limite de referência do método: a tarefa não deve ser realizada manualmente.');
      if (!recs.length) recs.push('Manter as condições e reavaliar em mudanças de processo.');
      return {
        score: risco, scoreLabel: 'Pontuação de risco KIM', scoreSub: `${t} (tempo) × ${soma} (carga + postura + condições)`, faixa: { n, rotulo: 'Faixa de risco ' + (n + 1), txt: KIM_TXT[n] },
        gauge: { v: Math.min(risco, 80), min: 0, max: 80, zonas: [10, 25, 50] },
        kpis: [{ l: 'Pontos de tempo', v: t }, { l: 'Pontos de carga', v: lc, n: lc >= 7 ? 3 : lc >= 4 ? 2 : lc >= 2 ? 1 : 0 }, { l: 'Postura', v: v.post }, { l: 'Condições', v: v.cond }],
        charts: [{ title: 'Composição da soma dos indicadores', type: 'bar', h: 200, labels: ['Carga', 'Postura', 'Condições'], datasets: [{ label: 'Pontos', data: [lc, U.n0(v.post), U.n0(v.cond)] }] }],
        recs
      };
    },
    metodo: `<h3>Key Indicator Method — Lifting, Holding, Carrying</h3><p>Desenvolvido pelo BAuA e pelo LASI (Alemanha, 2001). Pontuação de risco = pontos de tempo × (pontos de carga + postura + condições).</p>
      <table class="table table-sm"><thead><tr><th>Pontuação</th><th>Faixa</th></tr></thead><tbody><tr><td>&lt; 10</td><td>1 — baixo</td></tr><tr><td>10 a &lt; 25</td><td>2 — aumentado</td></tr><tr><td>25 a &lt; 50</td><td>3 — altamente aumentado</td></tr><tr><td>≥ 50</td><td>4 — alto</td></tr></tbody></table>
      <p>Pontos de carga (homens): &lt;10 kg = 1; 10–20 = 2; 20–30 = 4; 30–40 = 7; ≥40 = 25. Mulheres: &lt;5 kg = 1; 5–10 = 2; 10–15 = 4; 15–25 = 7; ≥25 = 25.</p>`,
    refs: ['BAuA/LASI. Leitmerkmalmethode zur Beurteilung von Heben, Halten, Tragen (KIM-LHC), 2001.', 'Steinberg, U. New tools in Germany: development and appliance of the first two KIM. Work, 41, 2012.']
  });

  /* ======================================================================= KIM-PP */
  const PP_CLASSES = [50, 100, 200, 300, 400, 600, 1000, 1300];
  const PP_PTS = {
    rodas: [0.5, 1, 1.5, 2, 3, 4, 5, 10, 25],
    rodizio: [0.5, 1, 2, 3, 4, 5, 10, 25, 25],
    transp: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10],
    carrinho1: [1, 2, 4, 10, 25, 25, 25, 25, 25],
    sem: [2, 4, 10, 25, 25, 25, 25, 25, 25]
  };
  E.register({
    id: 'kimpp', cat: 'cargas', sigla: 'KIM-PP', nome: 'KIM – Empurrar e Puxar', menu: 'KIM – Empurrar e Puxar',
    resumo: 'Método dos Indicadores-Chave (BAuA/LASI) para empurrar e puxar cargas com ou sem equipamento: pontuação de tempo × (massa + posicionamento + postura + condições).',
    normas: ['NR 17 · 17.5', 'ISO 11228-2', 'AEP/AET'], tags: 'key indicator method empurrar puxar carrinho transpaleteira baua',
    secoes: [
      { t: 'Tempo', f: [
        { t: 'opt', id: 'dist', l: 'Tipo de deslocamento', o: [['curto', 'Distâncias curtas ou paradas frequentes (até 5 m)'], ['longo', 'Distâncias longas (mais de 5 m)']], d: 'longo' },
        { t: 'num', id: 'qtd', l: 'Quantidade por jornada', u: 'vezes ou m', d: 2500, min: 0, h: 'Curtas: nº de operações por dia · Longas: distância total percorrida por dia (m).' }
      ] },
      { t: 'Massa e equipamento', f: [
        { t: 'sel', id: 'equip', l: 'Equipamento de transporte', o: [['rodas', 'Carrinho com rodas fixas / transpaleteira em piso liso'], ['rodizio', 'Carrinho com rodízios giratórios'], ['transp', 'Transportador de rolos / mesa com esferas'], ['carrinho1', 'Carrinho de mão (uma roda) / carriola'], ['sem', 'Sem auxílio: arrastar ou rolar a carga']], d: 'rodizio' },
        { t: 'num', id: 'massa', l: 'Massa total movimentada (carga + equipamento)', u: 'kg', d: 320, min: 0 },
        { t: 'opt', id: 'posic', l: 'Precisão de posicionamento e velocidade', o: [[1, 'Baixa precisão e velocidade lenta (< 0,8 m/s)', 1], [2, 'Alta precisão ou velocidade rápida (0,8–1,3 m/s)', 2], [4, 'Alta precisão e velocidade rápida', 4]], d: 2 },
        { t: 'opt', id: 'post', l: 'Postura', o: [[1, 'Tronco ereto, sem torção', 1], [2, 'Tronco levemente inclinado à frente ou torção leve', 2], [4, 'Corpo inclinado na direção do movimento; agachado ou ajoelhado', 4], [8, 'Combinação de inclinação acentuada e torção', 8]], d: 2 },
        { t: 'opt', id: 'cond', l: 'Condições', o: [[0, 'Boas: piso plano, firme, limpo; sem inclinação; rodas em bom estado', 0], [2, 'Piso sujo, levemente irregular ou inclinado até 2°; rodas com desgaste', 2], [4, 'Piso irregular, rampa de 2° a 5°, rodas inadequadas ou travando', 4], [8, 'Rampa acima de 5°, desníveis, carga instável', 8]], d: 2 }
      ] }
    ],
    calc(v) {
      const q = U.n0(v.qtd);
      const t = U.faixa(q, v.dist === 'curto' ? [[10, 1], [40, 2], [200, 4], [500, 6], [1000, 8]] : [[300, 1], [1000, 2], [4000, 4], [8000, 6], [16000, 8]], 10);
      const m = U.n0(v.massa); let i = PP_CLASSES.findIndex(c => m < c); if (i < 0) i = PP_CLASSES.length;
      const pm = PP_PTS[v.equip][i];
      const soma = pm + U.n0(v.posic) + U.n0(v.post) + U.n0(v.cond), risco = t * soma, n = kimN(risco);
      const recs = [];
      if (pm >= 4) recs.push('Reduzir a massa movimentada ou trocar o equipamento por um com melhor rolagem (rodas maiores, motorização).');
      if (v.cond >= 2) recs.push('Manter o piso limpo e nivelado, corrigir rampas e realizar manutenção das rodas.');
      if (v.posic >= 2) recs.push('Reduzir exigência de precisão/velocidade com guias, batentes ou freios.');
      if (v.post >= 4) recs.push('Ajustar a altura das alças (entre cintura e peito) para manter o tronco ereto.');
      if (pm === 25) recs.push('Massa acima do limite de referência para o equipamento: não realizar manualmente.');
      if (!recs.length) recs.push('Manter condições e manutenção preventiva do equipamento.');
      return {
        score: fmt(risco, 1), scoreNum: risco, scoreLabel: 'Pontuação de risco KIM-PP', scoreSub: `${t} (tempo) × ${fmt(soma, 1)} (indicadores)`, faixa: { n, rotulo: 'Faixa de risco ' + (n + 1), txt: KIM_TXT[n] },
        gauge: { v: Math.min(risco, 80), min: 0, max: 80, zonas: [10, 25, 50] },
        kpis: [{ l: 'Pontos de tempo', v: t }, { l: 'Massa', v: fmt(pm, 1), n: pm >= 10 ? 3 : pm >= 4 ? 2 : pm >= 2 ? 1 : 0 }, { l: 'Posicionamento', v: v.posic }, { l: 'Postura', v: v.post }, { l: 'Condições', v: v.cond }],
        charts: [{ title: 'Composição da soma dos indicadores', type: 'bar', h: 200, labels: ['Massa', 'Posicionamento', 'Postura', 'Condições'], datasets: [{ label: 'Pontos', data: [pm, U.n0(v.posic), U.n0(v.post), U.n0(v.cond)] }] }],
        recs
      };
    },
    metodo: `<h3>Key Indicator Method — Pushing and Pulling</h3><p>Desenvolvido pelo BAuA e pelo LASI (Alemanha, 2002). Pontuação de risco = pontos de tempo × (massa + precisão de posicionamento/velocidade + postura + condições). As faixas de risco são as mesmas do KIM-LHC.</p>
      <p>A pontuação de massa depende do tipo de equipamento e da massa total (classes &lt;50, 50–100, 100–200, 200–300, 300–400, 400–600, 600–1000, 1000–1300 e ≥1300 kg). Os valores desta ferramenta seguem a lógica da folha KIM-PP; para laudos, confira com a folha oficial da BAuA na versão adotada pela sua organização.</p>`,
    refs: ['BAuA/LASI. Leitmerkmalmethode zur Beurteilung von Ziehen, Schieben (KIM-PP), 2002.', 'ISO 11228-2:2007 — Ergonomics — Manual handling — Pushing and pulling.']
  });

  /* ======================================================================= Liberty Mutual */
  const PCTS = [90, 75, 50, 25, 10];
  E.register({
    id: 'liberty', cat: 'cargas', sigla: 'Liberty Mutual', nome: 'Liberty Mutual Tables – Snook & Ciriello', menu: 'Liberty Mutual Tables – Snook & Ciriello',
    resumo: 'Tabelas psicofísicas de pesos e forças máximas aceitáveis para levantar, abaixar, empurrar, puxar e transportar. Informe os valores da tabela para a sua tarefa e obtenha a porcentagem da população protegida.',
    normas: ['NR 17 · 17.5', 'ISO 11228-1/-2', 'AEP/AET'], tags: 'snook ciriello psicofisica peso maximo aceitavel empurrar puxar',
    secoes: [
      { t: 'Tarefa', f: [
        { t: 'opt', id: 'tarefa', l: 'Tipo de tarefa', o: [['lev', 'Levantar'], ['aba', 'Abaixar'], ['emp', 'Empurrar'], ['pux', 'Puxar'], ['tra', 'Transportar']], d: 'lev' },
        { t: 'opt', id: 'sexo', l: 'População de referência', o: [['m', 'Masculina'], ['f', 'Feminina']], d: 'f' },
        { t: 'opt', id: 'fase', l: 'Força (empurrar/puxar)', o: [['ini', 'Inicial'], ['sus', 'Sustentada']], d: 'ini', show: v => v.tarefa === 'emp' || v.tarefa === 'pux' },
        { t: 'txt', id: 'cond', l: 'Condições da tabela consultada', d: 'Largura 34 cm, da altura dos nós dos dedos ao ombro, deslocamento 51 cm, 1 levantamento a cada 2 min' },
        { t: 'num', id: 'carga', l: 'Carga ou força real da tarefa', u: 'kg / kgf', d: 11, min: 0 }
      ] },
      { t: 'Valores da tabela (peso ou força máximos aceitáveis)', d: 'Copie da tabela de Snook & Ciriello (1991) ou do calculador Liberty Mutual os valores aceitáveis para cada porcentagem da população. Os valores pré-preenchidos são um exemplo ilustrativo.', f: [
        { t: 'num', id: 'p90', l: 'Aceitável por 90% da população', u: 'kg', d: 9 }, { t: 'num', id: 'p75', l: 'Aceitável por 75%', u: 'kg', d: 12 },
        { t: 'num', id: 'p50', l: 'Aceitável por 50%', u: 'kg', d: 15 }, { t: 'num', id: 'p25', l: 'Aceitável por 25%', u: 'kg', d: 18 }, { t: 'num', id: 'p10', l: 'Aceitável por 10%', u: 'kg', d: 21 },
        { t: 'info', html: 'Calculador oficial: <a href="https://libertymmhtables.libertymutual.com/" target="_blank" rel="noopener">libertymmhtables.libertymutual.com</a> (equações LM-MMH, Potvin et al., 2021).' }
      ] }
    ],
    calc(v) {
      const vals = PCTS.map(p => U.num(v['p' + p]));
      const c = U.n0(v.carga);
      let prot;
      if (vals.some(isNaN)) prot = NaN;
      else if (c <= vals[0]) prot = Math.min(99, 90 + (vals[0] > 0 ? (vals[0] - c) / vals[0] * 9 : 0));
      else if (c >= vals[4]) prot = Math.max(1, 10 - (c - vals[4]) / Math.max(vals[4], 1) * 9);
      else { for (let i = 0; i < 4; i++) if (c >= vals[i] && c <= vals[i + 1]) { const f = (c - vals[i]) / ((vals[i + 1] - vals[i]) || 1); prot = PCTS[i] + (PCTS[i + 1] - PCTS[i]) * f; break; } }
      const idx = vals[0] > 0 ? c / vals[0] : NaN;
      const n = isNaN(prot) ? 0 : prot >= 90 ? 0 : prot >= 75 ? 1 : prot >= 50 ? 2 : 3;
      const recs = [];
      if (prot < 90) recs.push(`Reduzir a carga/força para no máximo ${fmt(vals[0], 1)} kg para proteger 90% da população (critério recomendado por Snook & Ciriello).`);
      if (prot < 75) recs.push('Redesenhar a tarefa: reduzir frequência, distância ou altura de manuseio, ou adotar auxílio mecânico.');
      if (prot >= 90) recs.push('Tarefa aceitável para pelo menos 90% da população de referência.');
      return {
        score: isNaN(prot) ? '—' : fmt(prot, 0) + '%', scoreNum: prot, scoreLabel: 'População protegida', scoreSub: `Carga ${fmt(c, 1)} kg · índice ${fmtF(idx, 2)} (carga / valor 90%)`,
        faixa: { n, rotulo: ['≥ 90% protegidos', '75–90%', '50–75%', '< 50%'][n], txt: ['A carga é aceitável para a grande maioria da população.', 'Parte relevante da população considera a carga excessiva.', 'A carga é excessiva para boa parte da população.', 'A carga é excessiva para a maioria da população.'][n] },
        gauge: { v: isNaN(prot) ? 0 : 100 - prot, min: 0, max: 100, zonas: [10, 25, 50] },
        kpis: [{ l: 'Índice (carga/MAW 90%)', v: fmtF(idx, 2), n }, { l: 'Limite 90%', v: fmt(vals[0], 1) + ' kg' }, { l: 'Limite 75%', v: fmt(vals[1], 1) + ' kg' }, { l: 'Limite 50%', v: fmt(vals[2], 1) + ' kg' }],
        charts: [{ title: 'Peso/força aceitável × porcentagem da população', type: 'line', h: 230, labels: PCTS.map(p => p + '%'), datasets: [{ label: 'Máximo aceitável (tabela)', data: vals, fill: true }, { label: 'Carga real', data: PCTS.map(() => c), dash: true, color: E.corNivel(2), pointRadius: 0 }], legend: true, xTitle: 'População que aceita', yTitle: 'kg / kgf' }],
        recs
      };
    },
    metodo: `<h3>Tabelas de Snook & Ciriello</h3><p>Resultado de experimentos psicofísicos (Liberty Mutual Research Institute) que estimam o peso ou a força máxima que diferentes porcentagens de homens e mulheres consideram aceitável, para levantar, abaixar, empurrar, puxar e transportar, em função da largura da carga, altura, distância, frequência e duração.</p>
      <p>Como os valores dependem de muitas combinações, esta ferramenta recebe os valores da tabela (ou do calculador oficial com as equações LM-MMH) para a condição da tarefa e calcula, por interpolação linear, a porcentagem da população protegida pela carga real. O critério de projeto usual é proteger pelo menos 90% da população; para tarefas existentes, 75% é frequentemente usado como limite mínimo.</p>`,
    refs: ['Snook, S. H.; Ciriello, V. M. The design of manual handling tasks: revised tables of maximum acceptable weights and forces. Ergonomics, 34(9), 1991.', 'Potvin, J. R. et al. The Liberty Mutual manual materials handling (LM-MMH) equations. Ergonomics, 64(8), 2021.']
  });

  /* ======================================================================= MAPO */
  E.register({
    id: 'mapo', cat: 'cargas', sigla: 'MAPO', nome: 'MAPO – Movimentação e Assistência de Pacientes Hospitalizados', menu: 'MAPO – Movimentação de Pacientes',
    resumo: 'Índice de risco para movimentação manual de pacientes em enfermarias, considerando pacientes não colaborativos e parcialmente colaborativos, equipamentos, cadeiras de rodas, ambiente e formação (Battevi, Menoni et al.).',
    normas: ['NR 17 · 17.5', 'NR 32', 'ISO/TR 12296'], tags: 'hospital enfermagem pacientes movimentacao saude',
    secoes: [
      { t: 'Pacientes e equipe', f: [
        { t: 'num', id: 'NC', l: 'Pacientes não colaborativos (NC)', u: 'pacientes', d: 6, min: 0 },
        { t: 'num', id: 'PC', l: 'Pacientes parcialmente colaborativos (PC)', u: 'pacientes', d: 8, min: 0 },
        { t: 'num', id: 'Op', l: 'Operadores que movimentam pacientes nos 3 turnos (Op)', u: 'pessoas', d: 9, min: 1 }
      ] },
      { t: 'Fatores do MAPO', f: [
        { t: 'opt', id: 'LF', l: 'LF · Equipamentos de elevação (para NC)', o: [[4, 'Ausentes ou inadequados e insuficientes', '4'], [2, 'Insuficientes ou inadequados', '2'], [0.5, 'Suficientes e adequados', '0,5']], d: 2 },
        { t: 'opt', id: 'AF', l: 'AF · Auxílios menores (para PC): lençol de transferência, prancha, cinto', o: [[1, 'Ausentes ou insuficientes', '1'], [0.5, 'Suficientes e adequados', '0,5']], d: 1 },
        { t: 'opt', id: 'WF', l: 'WF · Cadeiras de rodas', o: [[0.75, 'Suficientes e adequadas', '0,75'], [1, 'Pequena inadequação', '1'], [1.12, 'Insuficientes ou inadequadas', '1,12'], [1.5, 'Insuficientes e inadequadas', '1,5'], [2, 'Ausentes ou totalmente inadequadas', '2']], d: 1.12 },
        { t: 'opt', id: 'EF', l: 'EF · Ambiente (quartos, banheiros, espaços)', o: [[0.75, 'Adequado', '0,75'], [1.25, 'Parcialmente inadequado', '1,25'], [1.5, 'Inadequado', '1,5']], d: 1.25 },
        { t: 'opt', id: 'TF', l: 'TF · Formação dos operadores', o: [[0.75, 'Formação adequada (curso teórico-prático)', '0,75'], [1, 'Somente informação/folheto', '1'], [2, 'Nenhuma formação', '2']], d: 1 }
      ] }
    ],
    calc(v) {
      const Op = Math.max(U.n0(v.Op), 1), NC = U.n0(v.NC), PC = U.n0(v.PC);
      const a = NC / Op * v.LF, c = PC / Op * v.AF, mult = v.WF * v.EF * v.TF;
      const idx = (a + c) * mult;
      const n = idx <= 1.5 ? 0 : idx <= 5 ? 1 : idx <= 10 ? 2 : 3;
      const recs = [];
      if (v.LF >= 2) recs.push('Adquirir ou adequar elevadores de pacientes (guinchos) em número suficiente para os pacientes não colaborativos.');
      if (v.AF >= 1) recs.push('Disponibilizar auxílios menores (lençóis de transferência, pranchas, cintos) para pacientes parcialmente colaborativos.');
      if (v.WF > 1) recs.push('Substituir ou repor cadeiras de rodas inadequadas.');
      if (v.EF > 1) recs.push('Adequar espaços de quartos e banheiros para uso de equipamentos.');
      if (v.TF > 0.75) recs.push('Realizar formação teórico-prática sobre movimentação de pacientes.');
      if (!recs.length) recs.push('Manter os equipamentos e a formação; monitorar indicadores de saúde da equipe.');
      return {
        score: fmtF(idx, 2), scoreNum: idx, scoreLabel: 'Índice MAPO', scoreSub: `(${fmtF(a, 2)} + ${fmtF(c, 2)}) × ${fmtF(mult, 2)}`,
        faixa: { n, rotulo: ['Risco negligenciável', 'Risco médio', 'Risco alto', 'Risco muito alto'][n], txt: ['0 a 1,5: risco negligenciável.', '1,51 a 5: risco médio; lombalgias podem ter incidência até 2,4 vezes maior.', 'Acima de 5: risco alto; intervenção necessária.', 'Acima de 10: risco muito elevado; intervenção prioritária.'][n] },
        gauge: { v: Math.min(idx, 15), min: 0, max: 15, zonas: [1.5, 5, 10] },
        kpis: [{ l: 'NC/Op × LF', v: fmtF(a, 2) }, { l: 'PC/Op × AF', v: fmtF(c, 2) }, { l: 'WF', v: fmtF(v.WF, 2) }, { l: 'EF', v: fmtF(v.EF, 2) }, { l: 'TF', v: fmtF(v.TF, 2) }],
        charts: [{ title: 'Fatores multiplicadores (1 = neutro)', type: 'bar', h: 200, max: 2, labels: ['LF', 'AF', 'WF', 'EF', 'TF'], datasets: [{ label: 'Fator', data: [v.LF / 2, v.AF, v.WF, v.EF, v.TF], levels: [v.LF >= 4 ? 3 : v.LF >= 2 ? 2 : 0, v.AF >= 1 ? 2 : 0, v.WF > 1.12 ? 2 : v.WF > 0.75 ? 1 : 0, v.EF > 1.25 ? 2 : v.EF > .75 ? 1 : 0, v.TF >= 2 ? 3 : v.TF > .75 ? 1 : 0] }] }],
        recs
      };
    },
    metodo: `<h3>Índice MAPO</h3><p><b>MAPO = (NC/Op × LF + PC/Op × AF) × WF × EF × TF</b></p><p>NC: pacientes totalmente não colaborativos; PC: parcialmente colaborativos; Op: operadores que fazem movimentação nos três turnos. LF e AF refletem a adequação dos equipamentos; WF, EF e TF são multiplicadores de cadeiras de rodas, ambiente e formação.</p><p>0–1,5: negligenciável · 1,51–5: médio · &gt; 5: alto. A ISO/TR 12296 recomenda o MAPO como método de avaliação para unidades de internação. (A faixa “&gt; 10 — muito alto” é usada aqui apenas para priorização.)</p>`,
    refs: ['Battevi, N.; Menoni, O.; Ricci, M. G.; Cairoli, S. MAPO index for risk assessment of patient manual handling in hospital wards. Ergonomics, 49(7), 2006.', 'ISO/TR 12296:2012 — Manual handling of people in the healthcare sector.']
  });
})();
