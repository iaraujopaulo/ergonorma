/* Biomecânica e Posturas: OWAS, QEC, REBA, ROSA e RULA (manual + análise por IA do ErgoApp) */
(function () {
  'use strict';
  const E = window.Ergo, U = E.util, { fmt, clamp, esc } = U;
  const b = x => x ? 1 : 0;

  /* ======================================================================= RULA */
  /* Tabelas A, B e C extraídas do ErgoApp (wristPostureScoreDic, trunkPostureScoreDic, finalScoreDic) */
  const RULA_A = [[[[1,2],[2,2],[2,3],[3,3]],[[2,2],[2,2],[3,3],[3,3]],[[2,3],[3,3],[3,3],[4,4]]],[[[2,3],[3,3],[3,4],[4,4]],[[3,3],[3,3],[3,4],[4,4]],[[3,4],[4,4],[4,4],[5,5]]],[[[3,3],[4,4],[4,4],[5,5]],[[3,4],[4,4],[4,4],[5,5]],[[4,4],[4,4],[4,5],[5,5]]],[[[4,4],[4,4],[4,5],[5,5]],[[4,4],[4,4],[4,5],[5,5]],[[4,4],[4,5],[5,5],[6,6]]],[[[5,5],[5,5],[5,6],[6,7]],[[5,6],[6,6],[6,7],[7,7]],[[6,6],[6,7],[7,7],[7,8]]],[[[7,7],[7,7],[7,8],[8,9]],[[8,8],[8,8],[8,9],[9,9]],[[9,9],[9,9],[9,9],[9,9]]]];
  const RULA_B = [[[1,2],[2,3],[3,4],[5,5],[6,6],[7,7]],[[2,3],[2,3],[4,5],[5,5],[6,7],[7,7]],[[3,3],[3,4],[4,5],[5,6],[6,7],[7,7]],[[5,5],[5,6],[6,7],[7,7],[7,7],[8,8]],[[7,7],[7,7],[7,8],[8,8],[8,8],[8,8]],[[8,8],[8,8],[8,8],[8,9],[9,9],[9,9]]];
  const RULA_C = [[1,2,3,3,4,5,5],[2,2,3,4,4,5,5],[3,3,3,4,4,5,6],[3,3,3,4,5,6,6],[4,4,4,5,6,7,7],[4,4,5,6,6,7,7],[5,5,6,6,7,7,7],[5,5,6,7,7,7,7]];
  const CARGA = [[0, 'Sem carga ou < 2 kg intermitente', '0'], [1, '2 a 10 kg intermitente', '+1'], [2, '2 a 10 kg estática ou repetida; > 10 kg intermitente', '+2'], [3, '> 10 kg estática ou repetida, ou choques/forças bruscas', '+3']];
  const rulaNivel = s => s <= 2 ? { n: 0, rotulo: 'Nível de ação 1', txt: 'Postura aceitável se não mantida ou repetida por longos períodos.', acao: '' }
    : s <= 4 ? { n: 1, rotulo: 'Nível de ação 2', txt: 'Investigar; mudanças podem ser necessárias.', acao: 'Aprofundar a análise e planejar ajustes no posto.' }
      : s <= 6 ? { n: 2, rotulo: 'Nível de ação 3', txt: 'Investigar e realizar mudanças em breve.', acao: 'Planejar intervenção de curto prazo.' }
        : { n: 3, rotulo: 'Nível de ação 4', txt: 'Investigar e realizar mudanças imediatamente.', acao: 'Intervenção imediata no posto ou no método.' };

  E.register({
    id: 'rula', cat: 'biomecanica', sigla: 'RULA', nome: 'RULA – Rapid Upper Limb Assessment', menu: 'RULA (manual e por IA – ErgoApp)',
    resumo: 'Avaliação rápida de membros superiores, pescoço e tronco (McAtamney & Corlett, 1993). Preencha manualmente ou use a análise automática de postura por IA do ErgoApp (MediaPipe) e importe o resultado.',
    normas: ['NR 17 · 17.3', 'AEP/AET', 'ISO 11226'],
    tags: 'membros superiores postura ia ergoapp mediapipe',
    topo: () => `<section class="embed-card" id="rulaIA">
        <header><div><div class="eyebrow"><i data-lucide="scan-eye"></i> ErgoApp · análise por IA</div><b>Detectar a postura em foto ou vídeo</b></div>
        <div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-sm btn-primary" id="iaOpen"><i data-lucide="camera"></i> Abrir ErgoApp</button><button type="button" class="btn btn-sm btn-signal" id="iaImport" disabled><i data-lucide="download"></i> Importar resultado da IA</button></div></header>
        <div id="iaFrame" hidden><iframe title="ErgoApp — análise RULA por IA" src="about:blank" style="height:880px" loading="lazy"></iframe></div>
        <div class="embed-note">O ErgoApp usa o modelo de pose do MediaPipe, baixado da internet na primeira execução. Ele funciona no site publicado (GitHub Pages, servidor local) e pode não carregar em visualizações com rede restrita. Depois de enviar a imagem e o questionário de pontuações adicionais, clique em “Importar resultado da IA”.</div>
      </section>`,
    bind(cur, form, atualizar) {
      const $ = s => document.querySelector(s);
      const fr = $('#iaFrame iframe');
      $('#iaOpen').onclick = () => { const w = $('#iaFrame'); w.hidden = !w.hidden; if (!w.hidden && fr.src === 'about:blank') fr.src = 'apps/rula-ia/index.html'; $('#iaImport').disabled = false; };
      $('#iaImport').onclick = () => {
        let txt = '';
        try { txt = fr.contentDocument.body.innerText; } catch (e) { E.toast('Não foi possível ler o ErgoApp.', 'err'); return; }
        const pick = (titulo) => { const i = txt.toUpperCase().lastIndexOf(titulo); if (i < 0) return null; const seg = txt.slice(i, i + 220); const d = /Direito:\s*(\d+)/i.exec(seg), e = /Esquerdo:\s*(\d+)/i.exec(seg); return d && e ? [+d[1], +e[1]] : null; };
        const fin = pick('PONTUAÇÃO FINAL'), a = pick('PONTUAÇÃO DOS MEMBROS SUPERIORES');
        const bm = /TRONCO E MEMBROS INFERIORES[\s\S]{0,40}?->\s*:?\s*(\d+)/i.exec(txt);
        if (!fin) { E.toast('Resultado da IA não encontrado. Envie a imagem e clique em “Enviar Avaliação” no ErgoApp.', 'warn'); return; }
        Object.assign(cur.v, { fonte: 'ia', iaD: fin[0], iaE: fin[1], iaAD: a ? a[0] : '', iaAE: a ? a[1] : '', iaB: bm ? +bm[1] : '' });
        E.renderFerramenta(); E.toast('Resultado da IA importado.', 'ok');
      };
    },
    secoes: [
      { t: 'Fonte do resultado', f: [
        { t: 'opt', id: 'fonte', l: 'Como obter a pontuação', o: [['manual', 'Questionário manual (observação do avaliador)'], ['ia', 'Resultado importado do ErgoApp (IA)']], d: 'manual' },
        { t: 'num', id: 'iaD', l: 'IA — pontuação final lado direito', show: v => v.fonte === 'ia', d: '' },
        { t: 'num', id: 'iaE', l: 'IA — pontuação final lado esquerdo', show: v => v.fonte === 'ia', d: '' },
        { t: 'num', id: 'iaAD', l: 'IA — membros superiores (direito)', show: v => v.fonte === 'ia', d: '' },
        { t: 'num', id: 'iaAE', l: 'IA — membros superiores (esquerdo)', show: v => v.fonte === 'ia', d: '' },
        { t: 'num', id: 'iaB', l: 'IA — tronco e membros inferiores', show: v => v.fonte === 'ia', d: '' },
        { t: 'sel', id: 'lado', l: 'Lado avaliado no questionário manual', o: [['D', 'Direito'], ['E', 'Esquerdo']], d: 'D', show: v => v.fonte !== 'ia' }
      ] },
      { t: 'Grupo A — braço, antebraço e punho', d: 'Some os ajustes marcados. Avalie o lado mais exigido.', f: [
        { t: 'opt', id: 'braco', l: 'Braço', o: [[1, '20° de extensão a 20° de flexão', 1], [2, 'Extensão > 20° ou flexão de 20° a 45°', 2], [3, 'Flexão de 45° a 90°', 3], [4, 'Flexão acima de 90°', 4]], d: 3 },
        { t: 'chk', id: 'bElev', l: 'Ombro elevado (+1)', d: false }, { t: 'chk', id: 'bAbd', l: 'Braço abduzido (+1)', d: true },
        { t: 'chk', id: 'bApoio', l: 'Braço apoiado ou pessoa inclinada (−1)', d: false },
        { t: 'opt', id: 'anteb', l: 'Antebraço', o: [[1, 'Flexão de 60° a 100°', 1], [2, 'Flexão < 60° ou > 100°', 2]], d: 2 },
        { t: 'chk', id: 'aLinha', l: 'Cruza a linha média do corpo ou trabalha afastado lateralmente (+1)', d: false, w: 'w-full' },
        { t: 'opt', id: 'punho', l: 'Punho', o: [[1, 'Posição neutra', 1], [2, 'Flexão ou extensão de 0° a 15°', 2], [3, 'Flexão ou extensão acima de 15°', 3]], d: 3 },
        { t: 'chk', id: 'pDesvio', l: 'Desvio radial ou ulnar (+1)', d: true },
        { t: 'opt', id: 'torcao', l: 'Rotação do punho', o: [[1, 'Na faixa média', 1], [2, 'Próxima ao limite', 2]], d: 1, w: 'half' },
        { t: 'chk', id: 'mA', l: 'Uso muscular: postura estática > 1 min ou repetida ≥ 4 vezes/min (+1)', d: true, w: 'w-full' },
        { t: 'opt', id: 'cA', l: 'Força ou carga (braços)', o: CARGA, d: 1 }
      ] },
      { t: 'Grupo B — pescoço, tronco e pernas', f: [
        { t: 'opt', id: 'pesc', l: 'Pescoço', o: [[1, 'Flexão de 0° a 10°', 1], [2, 'Flexão de 10° a 20°', 2], [3, 'Flexão acima de 20°', 3], [4, 'Em extensão', 4]], d: 3 },
        { t: 'chk', id: 'peTor', l: 'Pescoço torcido (+1)', d: false }, { t: 'chk', id: 'peInc', l: 'Pescoço inclinado lateralmente (+1)', d: false },
        { t: 'opt', id: 'tronco', l: 'Tronco', o: [[1, 'Ereto ou sentado bem apoiado', 1], [2, 'Flexão de 0° a 20°', 2], [3, 'Flexão de 20° a 60°', 3], [4, 'Flexão acima de 60°', 4]], d: 2 },
        { t: 'chk', id: 'trTor', l: 'Tronco torcido (+1)', d: false }, { t: 'chk', id: 'trInc', l: 'Tronco inclinado lateralmente (+1)', d: false },
        { t: 'opt', id: 'pernas', l: 'Pernas', o: [[1, 'Apoiadas e equilibradas', 1], [2, 'Não apoiadas ou sem equilíbrio', 2]], d: 1 },
        { t: 'chk', id: 'mB', l: 'Uso muscular: postura estática > 1 min ou repetida ≥ 4 vezes/min (+1)', d: false, w: 'w-full' },
        { t: 'opt', id: 'cB', l: 'Força ou carga (tronco e pernas)', o: CARGA, d: 0 }
      ] }
    ],
    calc(v) {
      if (v.fonte === 'ia') {
        const d = U.num(v.iaD), e = U.num(v.iaE);
        if (isNaN(d) || isNaN(e)) return { score: '—', scoreLabel: 'RULA (IA)', scoreNum: NaN, faixa: { n: 0, rotulo: 'Aguardando IA', txt: 'Abra o ErgoApp, analise a imagem e importe o resultado, ou volte ao questionário manual.' }, kpis: [], charts: [], recs: [] };
        const s = Math.max(d, e), fx = rulaNivel(s);
        return {
          score: s, scoreLabel: 'RULA final (IA)', scoreSub: `Direito ${d} · Esquerdo ${e}`, faixa: fx, gauge: { v: s, min: 1, max: 7, zonas: [2.5, 4.5, 6.5] },
          kpis: [{ l: 'Final direito', v: d, n: rulaNivel(d).n }, { l: 'Final esquerdo', v: e, n: rulaNivel(e).n }, { l: 'Memb. sup. D', v: fmt(U.num(v.iaAD)) }, { l: 'Memb. sup. E', v: fmt(U.num(v.iaAE)) }, { l: 'Tronco e pernas', v: fmt(U.num(v.iaB)) }],
          charts: [{ title: 'Pontuação final por lado (escala 1–7)', type: 'bar', max: 7, h: 200, labels: ['Direito', 'Esquerdo'], datasets: [{ label: 'RULA', data: [d, e], levels: [rulaNivel(d).n, rulaNivel(e).n] }] }],
          recs: recsRula(fx.n, {})
        };
      }
      const ua = clamp(v.braco + b(v.bElev) + b(v.bAbd) - b(v.bApoio), 1, 6);
      const la = clamp(v.anteb + b(v.aLinha), 1, 3);
      const wr = clamp(v.punho + b(v.pDesvio), 1, 4);
      const tw = clamp(v.torcao, 1, 2);
      const A = RULA_A[ua - 1][la - 1][wr - 1][tw - 1];
      const C = A + b(v.mA) + U.n0(v.cA);
      const nk = clamp(v.pesc + b(v.peTor) + b(v.peInc), 1, 6);
      const tr = clamp(v.tronco + b(v.trTor) + b(v.trInc), 1, 6);
      const B = RULA_B[nk - 1][tr - 1][clamp(v.pernas, 1, 2) - 1];
      const D = B + b(v.mB) + U.n0(v.cB);
      const fin = RULA_C[Math.min(C, 8) - 1][Math.min(D, 7) - 1];
      const fx = rulaNivel(fin);
      const seg = [['Braço', ua, 6], ['Antebraço', la, 3], ['Punho', wr, 4], ['Pescoço', nk, 6], ['Tronco', tr, 6], ['Pernas', v.pernas, 2]];
      return {
        score: fin, scoreLabel: 'RULA final', scoreSub: `Lado ${v.lado === 'E' ? 'esquerdo' : 'direito'} · escala 1–7`, faixa: fx,
        gauge: { v: fin, min: 1, max: 7, zonas: [2.5, 4.5, 6.5] },
        kpis: [{ l: 'Postura A', v: A }, { l: 'Escore C (A + músc. + carga)', v: C }, { l: 'Postura B', v: B }, { l: 'Escore D (B + músc. + carga)', v: D }, { l: 'Braço', v: ua }, { l: 'Punho', v: wr }],
        charts: [{ title: 'Pontuação por segmento (proporção do máximo)', type: 'bar', h: 220, max: 100, labels: seg.map(s => s[0]), datasets: [{ label: '% do máximo', data: seg.map(s => Math.round(s[1] / s[2] * 100)), levels: seg.map(s => { const f = s[1] / s[2]; return f <= .34 ? 0 : f <= .5 ? 1 : f <= .75 ? 2 : 3; }) }] }],
        recs: recsRula(fx.n, { ua, wr, nk, tr, carga: v.cA, mA: v.mA })
      };
    },
    metodo: `<h3>Sobre o RULA</h3><p>O RULA (McAtamney & Corlett, 1993) avalia a exposição a fatores de risco posturais de membros superiores, pescoço e tronco, considerando também o uso muscular estático/repetitivo e a força. É aplicado por observação da postura mais crítica ou mais frequente do ciclo.</p>
      <h3>Cálculo</h3><p>Grupo A (braço, antebraço, punho e rotação) → Tabela A, somada ao uso muscular e à carga = escore C. Grupo B (pescoço, tronco e pernas) → Tabela B, somada ao uso muscular e à carga = escore D. A Tabela C combina C e D na pontuação final de 1 a 7. As tabelas são as mesmas do ErgoApp.</p>
      <table class="table table-sm"><thead><tr><th>Pontuação</th><th>Nível de ação</th></tr></thead><tbody><tr><td>1–2</td><td>1 — aceitável</td></tr><tr><td>3–4</td><td>2 — investigar, mudanças podem ser necessárias</td></tr><tr><td>5–6</td><td>3 — investigar e mudar em breve</td></tr><tr><td>7</td><td>4 — investigar e mudar imediatamente</td></tr></tbody></table>
      <h3>Análise por IA (ErgoApp)</h3><p>O ErgoApp detecta 33 pontos do corpo com o MediaPipe Pose, calcula os ângulos de ombro, cotovelo, punho, pescoço e tronco para os dois lados e aplica as tabelas do RULA após o questionário de pontuações adicionais. O resultado pode ser importado para este painel e entrar no relatório e no histórico.</p>`,
    refs: ['McAtamney, L.; Corlett, E. N. RULA: a survey method for the investigation of work-related upper limb disorders. Applied Ergonomics, 24(2), 1993.', 'ErgoApp — análise ergonômica automatizada com MediaPipe (projeto anexado).']
  });
  function recsRula(n, x) {
    const r = [];
    if (x.ua >= 3) r.push('Aproximar o objeto de trabalho e ajustar a altura da bancada para reduzir a elevação do braço.');
    if (x.wr >= 3) r.push('Redesenhar ferramenta/gabarito para manter o punho neutro e eliminar desvios.');
    if (x.nk >= 3) r.push('Posicionar a tarefa visual mais alta ou inclinada para reduzir a flexão do pescoço.');
    if (x.tr >= 3) r.push('Eliminar a flexão do tronco elevando a superfície ou o ponto de pega.');
    if (x.carga >= 2) r.push('Reduzir a força/carga com auxílio mecânico ou divisão da carga.');
    if (x.mA) r.push('Introduzir pausas e alternância de tarefas para reduzir a carga estática/repetitiva.');
    if (n >= 2) r.push('Reavaliar com RULA após as mudanças e registrar no PGR.');
    if (!r.length) r.push('Manter as condições e reavaliar se houver mudanças no posto.');
    return r;
  }

  /* ======================================================================= REBA */
  const REBA_A = [ // [pescoço][tronco][pernas]
    [[1, 2, 3, 4], [2, 3, 4, 5], [2, 4, 5, 6], [3, 5, 6, 7], [4, 6, 7, 8]],
    [[1, 2, 3, 4], [3, 4, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8], [6, 7, 8, 9]],
    [[3, 3, 5, 6], [4, 5, 6, 7], [5, 6, 7, 8], [6, 7, 8, 9], [7, 8, 9, 9]]];
  const REBA_B = [ // [antebraço][braço][punho]
    [[1, 2, 2], [1, 2, 3], [3, 4, 5], [4, 5, 5], [6, 7, 8], [7, 8, 8]],
    [[1, 2, 3], [2, 3, 4], [4, 5, 5], [5, 6, 7], [7, 8, 8], [8, 9, 9]]];
  const REBA_C = [
    [1, 1, 1, 2, 3, 3, 4, 5, 6, 7, 7, 7], [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 7, 8], [2, 3, 3, 3, 4, 5, 6, 7, 7, 8, 8, 8], [3, 4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9],
    [4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9], [6, 6, 6, 7, 8, 8, 9, 9, 10, 10, 10, 10], [7, 7, 7, 8, 9, 9, 9, 10, 10, 11, 11, 11], [8, 8, 8, 9, 10, 10, 10, 10, 10, 11, 11, 11],
    [9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12], [10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12], [11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12], [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]];
  const rebaNivel = s => s === 1 ? { n: 0, rotulo: 'Risco insignificante', txt: 'Risco insignificante; nenhuma ação necessária.' }
    : s <= 3 ? { n: 0, rotulo: 'Risco baixo', txt: 'Risco baixo; ação pode ser necessária.' }
      : s <= 7 ? { n: 1, rotulo: 'Risco médio', txt: 'Risco médio; ação necessária.', acao: 'Planejar melhorias no posto.' }
        : s <= 10 ? { n: 2, rotulo: 'Risco alto', txt: 'Risco alto; ação necessária em breve.', acao: 'Investigar e implementar mudanças em curto prazo.' }
          : { n: 3, rotulo: 'Risco muito alto', txt: 'Risco muito alto; ação imediata.', acao: 'Implementar mudanças imediatamente.' };
  E.register({
    id: 'reba', cat: 'biomecanica', sigla: 'REBA', nome: 'REBA – Rapid Entire Body Assessment', menu: 'REBA – Rapid Entire Body Assessment',
    resumo: 'Avaliação postural do corpo inteiro para tarefas com posturas dinâmicas, instáveis ou variáveis, incluindo carga, pega e atividade (Hignett & McAtamney, 2000).',
    normas: ['NR 17 · 17.3', 'AEP/AET'], tags: 'corpo inteiro postura',
    secoes: [
      { t: 'Grupo A — tronco, pescoço e pernas', f: [
        { t: 'opt', id: 'tronco', l: 'Tronco', o: [[1, 'Ereto', 1], [2, 'Flexão ou extensão de 0° a 20°', 2], [3, 'Flexão de 20° a 60° ou extensão > 20°', 3], [4, 'Flexão acima de 60°', 4]], d: 3 },
        { t: 'chk', id: 'trAj', l: 'Tronco torcido ou inclinado lateralmente (+1)', d: true, w: 'w-full' },
        { t: 'opt', id: 'pesc', l: 'Pescoço', o: [[1, 'Flexão de 0° a 20°', 1], [2, 'Flexão > 20° ou em extensão', 2]], d: 2 },
        { t: 'chk', id: 'peAj', l: 'Pescoço torcido ou inclinado lateralmente (+1)', d: false, w: 'w-full' },
        { t: 'opt', id: 'pernas', l: 'Pernas', o: [[1, 'Apoio bilateral, andando ou sentado', 1], [2, 'Apoio unilateral ou postura instável', 2]], d: 1 },
        { t: 'opt', id: 'joelho', l: 'Flexão dos joelhos', o: [[0, 'Até 30°', '0'], [1, 'De 30° a 60°', '+1'], [2, 'Acima de 60° (exceto sentado)', '+2']], d: 1 },
        { t: 'opt', id: 'carga', l: 'Carga / força', o: [[0, 'Menos de 5 kg', '0'], [1, 'De 5 a 10 kg', '+1'], [2, 'Mais de 10 kg', '+2']], d: 1 },
        { t: 'chk', id: 'choque', l: 'Choque ou aumento rápido de força (+1)', d: false, w: 'w-full' }
      ] },
      { t: 'Grupo B — braço, antebraço e punho', f: [
        { t: 'opt', id: 'braco', l: 'Braço', o: [[1, '20° de extensão a 20° de flexão', 1], [2, 'Extensão > 20° ou flexão de 20° a 45°', 2], [3, 'Flexão de 45° a 90°', 3], [4, 'Flexão acima de 90°', 4]], d: 3 },
        { t: 'chk', id: 'bAbd', l: 'Braço abduzido ou rodado (+1)', d: false }, { t: 'chk', id: 'bElev', l: 'Ombro elevado (+1)', d: false },
        { t: 'chk', id: 'bApoio', l: 'Braço apoiado ou postura a favor da gravidade (−1)', d: false, w: 'w-full' },
        { t: 'opt', id: 'anteb', l: 'Antebraço', o: [[1, 'Flexão de 60° a 100°', 1], [2, 'Flexão < 60° ou > 100°', 2]], d: 1 },
        { t: 'opt', id: 'punho', l: 'Punho', o: [[1, 'Flexão ou extensão de 0° a 15°', 1], [2, 'Flexão ou extensão acima de 15°', 2]], d: 2 },
        { t: 'chk', id: 'pAj', l: 'Punho com desvio lateral ou torção (+1)', d: false, w: 'w-full' },
        { t: 'opt', id: 'pega', l: 'Pega (acoplamento)', o: [[0, 'Boa: alça bem ajustada, pega de força', '0'], [1, 'Razoável: pega aceitável ou com outra parte do corpo', '+1'], [2, 'Ruim: pega possível mas inadequada', '+2'], [3, 'Inaceitável: sem pega, insegura', '+3']], d: 1 }
      ] },
      { t: 'Atividade', f: [
        { t: 'chk', id: 'at1', l: 'Uma ou mais partes do corpo estáticas por mais de 1 minuto (+1)', d: true, w: 'w-full' },
        { t: 'chk', id: 'at2', l: 'Movimentos repetidos em pequena amplitude, mais de 4 vezes por minuto (+1)', d: false, w: 'w-full' },
        { t: 'chk', id: 'at3', l: 'Mudanças rápidas e amplas de postura ou base instável (+1)', d: false, w: 'w-full' }
      ] }
    ],
    calc(v) {
      const tr = clamp(v.tronco + b(v.trAj), 1, 5), nk = clamp(v.pesc + b(v.peAj), 1, 3), lg = clamp(v.pernas + U.n0(v.joelho), 1, 4);
      const tA = REBA_A[nk - 1][tr - 1][lg - 1], sA = tA + U.n0(v.carga) + b(v.choque);
      const ua = clamp(v.braco + b(v.bAbd) + b(v.bElev) - b(v.bApoio), 1, 6), la = clamp(v.anteb, 1, 2), wr = clamp(v.punho + b(v.pAj), 1, 3);
      const tB = REBA_B[la - 1][ua - 1][wr - 1], sB = tB + U.n0(v.pega);
      const tC = REBA_C[clamp(sA, 1, 12) - 1][clamp(sB, 1, 12) - 1];
      const at = b(v.at1) + b(v.at2) + b(v.at3), fin = tC + at, fx = rebaNivel(fin);
      const r = [];
      if (tr >= 3) r.push('Reduzir a flexão do tronco: elevar a carga ou a superfície de trabalho e evitar pegas abaixo dos joelhos.');
      if (lg >= 3) r.push('Evitar agachamento e apoio unilateral; prover plataforma ou banco de apoio.');
      if (ua >= 3) r.push('Diminuir o alcance com reorganização do leiaute do posto.');
      if (v.carga >= 1 || v.pega >= 2) r.push('Melhorar a pega (alças) e reduzir o peso manipulado.');
      if (at) r.push('Reduzir a carga estática e a repetição com pausas e alternância de tarefas.');
      if (!r.length) r.push('Manter condições atuais; reavaliar em mudanças de processo.');
      return {
        score: fin, scoreLabel: 'REBA final', scoreSub: 'escala 1–15', faixa: fx, gauge: { v: fin, min: 1, max: 15, zonas: [3.5, 7.5, 10.5] },
        kpis: [{ l: 'Tabela A', v: tA }, { l: 'Escore A', v: sA }, { l: 'Tabela B', v: tB }, { l: 'Escore B', v: sB }, { l: 'Tabela C', v: tC }, { l: 'Atividade', v: '+' + at }],
        charts: [{ title: 'Contribuição por segmento (% do máximo)', type: 'bar', max: 100, h: 220, labels: ['Tronco', 'Pescoço', 'Pernas', 'Braço', 'Antebraço', 'Punho'], datasets: [{ label: '%', data: [tr / 5, nk / 3, lg / 4, ua / 6, la / 2, wr / 3].map(x => Math.round(x * 100)), levels: [tr / 5, nk / 3, lg / 4, ua / 6, la / 2, wr / 3].map(f => f <= .34 ? 0 : f <= .5 ? 1 : f <= .75 ? 2 : 3) }] }],
        recs: r
      };
    },
    metodo: `<h3>Sobre o REBA</h3><p>Desenvolvido por Hignett e McAtamney (2000) para avaliar posturas imprevisíveis do corpo inteiro, típicas de serviços de saúde e outras atividades com variação postural.</p><h3>Níveis de ação</h3><table class="table table-sm"><tbody><tr><td>1</td><td>Insignificante</td></tr><tr><td>2–3</td><td>Baixo</td></tr><tr><td>4–7</td><td>Médio</td></tr><tr><td>8–10</td><td>Alto</td></tr><tr><td>11–15</td><td>Muito alto</td></tr></tbody></table>`,
    refs: ['Hignett, S.; McAtamney, L. Rapid Entire Body Assessment (REBA). Applied Ergonomics, 31(2), 2000.']
  });

  /* ======================================================================= OWAS */
  const OW = [
    [[1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 2, 2, 3, 1, 1, 1, 1, 1, 2]],
    [[2, 2, 3, 2, 2, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3], [2, 2, 3, 2, 2, 3, 2, 3, 3, 3, 4, 4, 3, 4, 4, 3, 3, 4, 2, 3, 4], [3, 3, 4, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 2, 3, 4]],
    [[1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 4, 4, 4, 1, 1, 1, 1, 1, 1], [2, 2, 3, 1, 1, 1, 1, 1, 2, 4, 4, 4, 4, 4, 4, 3, 3, 3, 1, 1, 1], [2, 2, 3, 1, 1, 1, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1]],
    [[2, 3, 3, 2, 2, 3, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 3, 4], [3, 3, 4, 2, 3, 4, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 3, 4], [4, 4, 4, 2, 3, 4, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 3, 4]]];
  const owCat = (c, br, p, cg) => OW[c - 1][br - 1][(p - 1) * 3 + (cg - 1)];
  const OW_C = [[1, '1 · Ereto'], [2, '2 · Inclinado'], [3, '3 · Torcido'], [4, '4 · Inclinado e torcido']];
  const OW_B = [[1, '1 · Ambos abaixo dos ombros'], [2, '2 · Um no nível ou acima'], [3, '3 · Ambos no nível ou acima']];
  const OW_P = [[1, '1 · Sentado'], [2, '2 · De pé, duas pernas retas'], [3, '3 · De pé, uma perna reta'], [4, '4 · Duas pernas flexionadas'], [5, '5 · Uma perna flexionada'], [6, '6 · Ajoelhado'], [7, '7 · Andando']];
  const OW_L = [[1, '1 · Até 10 kg'], [2, '2 · De 10 a 20 kg'], [3, '3 · Acima de 20 kg']];
  const OW_TXT = ['Postura normal, sem necessidade de medidas.', 'Postura com possibilidade de causar dano: medidas corretivas em futuro próximo.', 'Postura com efeitos danosos: medidas corretivas tão logo quanto possível.', 'Postura extremamente danosa: medidas corretivas imediatas.'];
  E.register({
    id: 'owas', cat: 'biomecanica', sigla: 'OWAS', nome: 'OWAS – Ovako Working Posture Analysing System', menu: 'OWAS',
    resumo: 'Registro de posturas de costas, braços e pernas e da carga ao longo da tarefa (amostragem), com categoria de ação para cada postura e distribuição ponderada pelo tempo (Karhu et al., 1977).',
    normas: ['NR 17 · 17.3', 'AEP/AET'], tags: 'amostragem postura costas pernas',
    secoes: [{ t: 'Posturas observadas', d: 'Registre cada combinação de postura observada e a parcela do tempo do ciclo ou da jornada. O código OWAS tem 4 dígitos: costas, braços, pernas e carga.', f: [
      { t: 'grid', id: 'obs', addLabel: 'Adicionar postura', novo: { desc: '', c: 1, b: 1, p: 2, l: 1, pct: 10 },
        d: [{ desc: 'Pegar caixa no piso', c: 2, b: 1, p: 4, l: 2, pct: 15 }, { desc: 'Montagem na bancada', c: 1, b: 1, p: 2, l: 1, pct: 55 }, { desc: 'Abastecer prateleira superior', c: 3, b: 3, p: 2, l: 1, pct: 10 }, { desc: 'Deslocamento com carrinho', c: 1, b: 1, p: 7, l: 2, pct: 20 }],
        cols: [{ id: 'desc', l: 'Descrição', wd: '180px' }, { id: 'c', l: 'Costas', t: 'sel', o: OW_C, wd: '170px' }, { id: 'b', l: 'Braços', t: 'sel', o: OW_B, wd: '190px' }, { id: 'p', l: 'Pernas', t: 'sel', o: OW_P, wd: '200px' }, { id: 'l', l: 'Carga', t: 'sel', o: OW_L, wd: '140px' }, { id: 'pct', l: '% do tempo', t: 'num' }, { id: 'cat', l: 'Categoria', t: 'calc' }] }
    ] }],
    calc(v) {
      const rows = v.obs || []; const gc = { obs: {} }; const dist = [0, 0, 0, 0]; let tot = 0, maxc = 1;
      rows.forEach((r, i) => { const k = owCat(+r.c || 1, +r.b || 1, +r.p || 1, +r.l || 1); maxc = Math.max(maxc, k); const p = U.n0(r.pct); dist[k - 1] += p; tot += p; gc.obs[i] = { cat: `<span class="lv-pill lv${k - 1}">${r.c}${r.b}${r.p}${r.l} · C${k}</span>` }; });
      const pc = dist.map(x => tot ? x / tot * 100 : 0);
      const pond = tot ? dist.reduce((s, x, i) => s + x * (i + 1), 0) / tot : 0;
      const recs = [];
      rows.forEach(r => { const k = owCat(+r.c || 1, +r.b || 1, +r.p || 1, +r.l || 1); if (k >= 3) recs.push(`Corrigir a postura “${r.desc || r.c + '' + r.b + r.p + r.l}” (categoria ${k}).`); });
      if (pc[2] + pc[3] > 0) recs.push('Priorizar as posturas de categorias 3 e 4 com mudanças no leiaute, altura de pega e auxílios mecânicos.');
      if (!recs.length) recs.push('Posturas em categorias 1 e 2: monitorar e melhorar as de categoria 2 no futuro próximo.');
      if (Math.abs(tot - 100) > 1 && rows.length) recs.push(`A soma do tempo é ${fmt(tot)}%. Ajuste para 100% para uma distribuição precisa.`);
      return {
        score: 'C' + maxc, scoreNum: maxc, scoreLabel: 'Categoria mais crítica', scoreSub: `Índice ponderado ${fmt(pond, 2)} (1–4)`,
        faixa: { n: maxc - 1, rotulo: 'Categoria de ação ' + maxc, txt: OW_TXT[maxc - 1] },
        gauge: { v: pond, min: 1, max: 4, zonas: [1.75, 2.5, 3.25] },
        kpis: pc.map((x, i) => ({ l: 'Categoria ' + (i + 1), v: fmt(x, 0) + '%', s: 'do tempo', n: i })).concat([{ l: 'Posturas registradas', v: rows.length }]),
        charts: [{ title: 'Distribuição do tempo por categoria de ação', type: 'doughnut', h: 220, labels: ['C1', 'C2', 'C3', 'C4'], datasets: [{ data: pc.map(x => +x.toFixed(1)), colors: [0, 1, 2, 3].map(E.corNivel) }] }],
        gridCalc: gc, recs
      };
    },
    metodo: `<h3>Sobre o OWAS</h3><p>Método finlandês (Ovako Oy, 1977) que classifica a postura das costas (4 opções), braços (3), pernas (7) e a carga (3). Cada combinação recebe uma categoria de ação de 1 a 4. A aplicação típica usa amostragem em intervalos regulares (por exemplo, a cada 30 s) e calcula a parcela do tempo em cada postura.</p><h3>Categorias</h3><ol><li>Sem necessidade de medidas.</li><li>Medidas corretivas no futuro próximo.</li><li>Medidas corretivas tão logo quanto possível.</li><li>Medidas corretivas imediatas.</li></ol>`,
    refs: ['Karhu, O.; Kansi, P.; Kuorinka, I. Correcting working postures in industry: a practical method for analysis. Applied Ergonomics, 8(4), 1977.']
  });

  /* ======================================================================= QEC */
  const s2 = (i, j) => 2 * (i + j) - 2;
  const qecNivel = (x, lims) => x <= lims[0] ? 0 : x <= lims[1] ? 1 : x <= lims[2] ? 2 : 3;
  const QN = ['Baixa', 'Moderada', 'Alta', 'Muito alta'];
  E.register({
    id: 'qec', cat: 'biomecanica', sigla: 'QEC', nome: 'QEC – Quick Exposure Check', menu: 'QEC – Quick Exposure Check',
    resumo: 'Combina a observação do avaliador com a percepção do trabalhador para estimar a exposição de costas, ombros/braços, punhos/mãos e pescoço, além de condução, vibração, ritmo e estresse (Li & Buckle).',
    normas: ['NR 17 · 17.3', 'AEP/AET'], tags: 'exposicao trabalhador observador',
    secoes: [
      { t: 'Avaliação do observador', f: [
        { t: 'opt', id: 'A', l: 'A · Costas — postura', o: [[1, 'Quase neutra', 'A1'], [2, 'Moderadamente fletida, torcida ou inclinada', 'A2'], [3, 'Excessivamente fletida, torcida ou inclinada', 'A3']], d: 2 },
        { t: 'opt', id: 'Bm', l: 'B · Costas — tipo de tarefa', o: [['st', 'Sentado ou em pé estático'], ['mv', 'Movimentação de cargas / em movimento']], d: 'mv' },
        { t: 'opt', id: 'B', l: 'B · Frequência de movimento das costas', o: [[1, 'Pouco frequente (≤ 3 vezes/min)', 'B1'], [2, 'Frequente (~8 vezes/min)', 'B2'], [3, 'Muito frequente (≥ 12 vezes/min)', 'B3']], d: 2 },
        { t: 'opt', id: 'C', l: 'C · Ombro/braço — altura das mãos', o: [[1, 'Na altura da cintura ou abaixo', 'C1'], [2, 'Na altura do peito', 'C2'], [3, 'Na altura dos ombros ou acima', 'C3']], d: 2 },
        { t: 'opt', id: 'D', l: 'D · Movimento do ombro/braço', o: [[1, 'Pouco frequente (intermitente)', 'D1'], [2, 'Frequente (regular, com pausas)', 'D2'], [3, 'Muito frequente (quase contínuo)', 'D3']], d: 2 },
        { t: 'opt', id: 'Ep', l: 'E · Punho/mão — postura', o: [[1, 'Quase reto', 'E1'], [2, 'Desviado ou fletido', 'E2']], d: 2 },
        { t: 'opt', id: 'F', l: 'F · Movimentos semelhantes repetidos', o: [[1, '10 vezes/min ou menos', 'F1'], [2, '11 a 20 vezes/min', 'F2'], [3, 'Mais de 20 vezes/min', 'F3']], d: 3 },
        { t: 'opt', id: 'G', l: 'G · Pescoço fletido ou torcido', o: [[1, 'Não', 'G1'], [2, 'Ocasionalmente', 'G2'], [3, 'Continuamente', 'G3']], d: 2 }
      ] },
      { t: 'Avaliação do trabalhador', f: [
        { t: 'opt', id: 'H', l: 'H · Peso máximo manuseado', o: [[1, 'Leve (até 5 kg)', 'H1'], [2, 'Moderado (6 a 10 kg)', 'H2'], [3, 'Pesado (11 a 20 kg)', 'H3'], [4, 'Muito pesado (mais de 20 kg)', 'H4']], d: 2 },
        { t: 'opt', id: 'J', l: 'J · Tempo diário na tarefa', o: [[1, 'Menos de 2 h', 'J1'], [2, 'De 2 a 4 h', 'J2'], [3, 'Mais de 4 h', 'J3']], d: 3 },
        { t: 'opt', id: 'K', l: 'K · Força máxima com uma mão', o: [[1, 'Baixa (até 1 kg)', 'K1'], [2, 'Média (1 a 4 kg)', 'K2'], [3, 'Alta (mais de 4 kg)', 'K3']], d: 2 },
        { t: 'opt', id: 'L', l: 'L · Exigência visual', o: [[1, 'Baixa (quase não precisa ver detalhes)', 'L1'], [2, 'Alta (precisa ver detalhes finos)', 'L2']], d: 2 },
        { t: 'opt', id: 'M', l: 'M · Condução de veículo por dia', o: [[1, 'Menos de 1 h ou nunca', 'M1'], [2, 'De 1 a 4 h', 'M2'], [3, 'Mais de 4 h', 'M3']], d: 1 },
        { t: 'opt', id: 'N', l: 'N · Uso de ferramentas vibratórias', o: [[1, 'Menos de 1 h ou nunca', 'N1'], [2, 'De 1 a 4 h', 'N2'], [3, 'Mais de 4 h', 'N3']], d: 1 },
        { t: 'opt', id: 'P', l: 'P · Dificuldade em acompanhar o ritmo', o: [[1, 'Nunca', 'P1'], [2, 'Às vezes', 'P2'], [3, 'Frequentemente', 'P3']], d: 2 },
        { t: 'opt', id: 'Q', l: 'Q · Estresse no trabalho', o: [[1, 'Nenhum', 'Q1'], [2, 'Baixo', 'Q2'], [3, 'Moderado', 'Q3'], [4, 'Alto', 'Q4']], d: 3 }
      ] }
    ],
    calc(v) {
      const { A, B, C, D, Ep, F, G, H, J, K, L } = v;
      const mov = v.Bm === 'mv';
      const costas = mov ? s2(A, H) + s2(A, J) + s2(H, J) + s2(B, H) + s2(B, J) : s2(A, H) + s2(A, J) + s2(H, J) + s2(B, J);
      const ombro = s2(C, H) + s2(C, J) + s2(H, J) + s2(D, H) + s2(D, J);
      const punho = s2(Ep, K) + s2(Ep, J) + s2(K, J) + s2(F, K) + s2(F, J);
      const pesc = s2(G, J) + s2(L, J);
      const q = x => [1, 4, 9][x - 1];
      const cond = q(v.M), vib = q(v.N), ritmo = q(v.P), estr = [1, 4, 9, 16][v.Q - 1];
      const nC = qecNivel(costas, mov ? [20, 30, 40] : [15, 22, 29]), nO = qecNivel(ombro, [20, 30, 40]), nP = qecNivel(punho, [20, 30, 40]), nN = qecNivel(pesc, [6, 10, 14]);
      const X = costas + ombro + punho + pesc, Xmax = mov ? 176 : 162;
      const pct = X / Xmax * 100;
      const n = pct <= 40 ? 0 : pct <= 50 ? 1 : pct <= 70 ? 2 : 3;
      const acoes = ['Exposição aceitável.', 'Investigar mais.', 'Investigar mais e mudar em breve.', 'Investigar e mudar imediatamente.'];
      const reg = [['Costas', costas, nC], ['Ombro/braço', ombro, nO], ['Punho/mão', punho, nP], ['Pescoço', pesc, nN]];
      const recs = reg.filter(r => r[2] >= 2).map(r => `Exposição ${QN[r[2]].toLowerCase()} em ${r[0].toLowerCase()} (${r[1]} pts): priorizar redução de postura, força e duração.`);
      if (estr >= 9) recs.push('Estresse moderado/alto relatado: investigar fatores psicossociais (HSE-IT ou Ferramentas Psicossociais).');
      if (ritmo >= 9) recs.push('Dificuldade frequente com o ritmo: rever metas e pausas.');
      if (!recs.length) recs.push('Manter acompanhamento; exposição dentro de faixas baixas a moderadas.');
      return {
        score: fmt(pct, 0) + '%', scoreNum: pct, scoreLabel: 'Exposição total (E)', scoreSub: `${X} de ${Xmax} pontos`,
        faixa: { n, rotulo: QN[n], txt: acoes[n] }, gauge: { v: pct, min: 0, max: 100, zonas: [40, 50, 70] },
        kpis: reg.map(r => ({ l: r[0], v: r[1], s: QN[r[2]], n: r[2] })).concat([{ l: 'Condução', v: cond, n: cond >= 9 ? 2 : cond >= 4 ? 1 : 0 }, { l: 'Vibração', v: vib, n: vib >= 9 ? 2 : vib >= 4 ? 1 : 0 }, { l: 'Ritmo', v: ritmo, n: ritmo >= 9 ? 2 : ritmo >= 4 ? 1 : 0 }, { l: 'Estresse', v: estr, n: estr >= 16 ? 3 : estr >= 9 ? 2 : estr >= 4 ? 1 : 0 }]),
        charts: [{ title: 'Exposição por região (% do máximo da região)', type: 'bar', max: 100, h: 220, labels: reg.map(r => r[0]), datasets: [{ label: '%', data: [costas / (mov ? 56 : 44), ombro / 56, punho / 46, pesc / 18].map(x => Math.round(x * 100)), levels: reg.map(r => r[2]) }] }],
        recs
      };
    },
    metodo: `<h3>Sobre o QEC</h3><p>Desenvolvido por Li e Buckle (1999) e revisado por David et al. (2008), o QEC soma pontuações de pares de fatores (postura × carga, postura × duração, carga × duração, frequência × carga, frequência × duração) por região do corpo. A exposição total E é a soma das regiões em relação ao máximo possível.</p>
      <table class="table table-sm"><thead><tr><th>Região</th><th>Baixa</th><th>Moderada</th><th>Alta</th><th>Muito alta</th></tr></thead><tbody><tr><td>Costas (estática)</td><td>8–15</td><td>16–22</td><td>23–29</td><td>30–40</td></tr><tr><td>Costas (movimento)</td><td>10–20</td><td>21–30</td><td>31–40</td><td>41–56</td></tr><tr><td>Ombro/braço</td><td>10–20</td><td>21–30</td><td>31–40</td><td>41–56</td></tr><tr><td>Punho/mão</td><td>10–20</td><td>21–30</td><td>31–40</td><td>41–46</td></tr><tr><td>Pescoço</td><td>4–6</td><td>8–10</td><td>12–14</td><td>16–18</td></tr></tbody></table>
      <p>E ≤ 40%: aceitável · 41–50%: investigar · 51–70%: investigar e mudar em breve · &gt; 70%: mudar imediatamente.</p>`,
    refs: ['Li, G.; Buckle, P. Current techniques for assessing physical exposure to work-related musculoskeletal risks. Ergonomics, 1999.', 'David, G.; Woods, V.; Li, G.; Buckle, P. The development of the Quick Exposure Check (QEC). Applied Ergonomics, 39, 2008.']
  });

  /* ======================================================================= ROSA */
  const RA = [[2, 2, 3, 4, 5, 6, 7, 8], [2, 2, 3, 4, 5, 6, 7, 8], [3, 3, 3, 4, 5, 6, 7, 8], [4, 4, 4, 4, 5, 6, 7, 8], [5, 5, 5, 5, 6, 7, 8, 9], [6, 6, 6, 7, 7, 8, 8, 9], [7, 7, 7, 8, 8, 9, 9, 9]];
  const RB = [[1, 1, 1, 2, 3, 4, 5, 6], [1, 1, 2, 2, 3, 4, 5, 6], [1, 2, 2, 3, 3, 4, 6, 7], [2, 2, 3, 3, 4, 5, 6, 8], [3, 3, 4, 4, 5, 6, 7, 8], [4, 4, 5, 5, 6, 7, 8, 9], [5, 5, 6, 7, 8, 8, 9, 9]];
  const RC = [[1, 1, 1, 2, 3, 4, 5, 6], [1, 1, 2, 3, 4, 5, 6, 7], [1, 2, 2, 3, 4, 5, 6, 7], [2, 3, 3, 3, 5, 6, 7, 8], [3, 4, 4, 5, 5, 6, 7, 8], [4, 5, 5, 6, 6, 7, 8, 9], [5, 6, 6, 7, 7, 8, 8, 9], [6, 7, 7, 8, 8, 9, 9, 9]];
  const DUR = [[-1, 'Menos de 1 h/dia ou menos de 30 min contínuos', '−1'], [0, 'De 1 a 4 h/dia ou de 30 min a 1 h contínua', '0'], [1, 'Mais de 4 h/dia ou mais de 1 h contínua', '+1']];
  const P = (o, k) => (o.find(x => x[0] === k) || [0, 0, 1])[2];
  const R_ALT = [['ok', 'Joelhos a cerca de 90°', 1], ['baixa', 'Muito baixa (joelhos abaixo de 90°)', 2], ['alta', 'Muito alta (joelhos acima de 90°)', 2], ['sem', 'Pés sem contato com o chão', 3]];
  const R_PROF = [['ok', 'Cerca de 8 cm entre a borda do assento e o joelho', 1], ['longo', 'Assento longo (menos de 8 cm)', 2], ['curto', 'Assento curto (mais de 8 cm)', 2]];
  const R_BR = [['ok', 'Cotovelos apoiados alinhados aos ombros, ombros relaxados', 1], ['inad', 'Muito alto (ombros elevados) ou muito baixo (braços sem apoio)', 2]];
  const R_ENC = [['ok', 'Apoio lombar adequado, reclinado entre 95° e 110°', 1], ['lomb', 'Sem apoio lombar ou fora da região lombar', 2], ['inc', 'Reclinado além de 110° ou à frente de 95°', 2], ['sem', 'Sem encosto ou tronco inclinado à frente', 2]];
  const R_MON = [['ok', 'Entre 40 e 75 cm, borda superior na altura dos olhos', 1], ['baixo', 'Muito baixo (abaixo de 30° do olhar)', 2], ['alto', 'Muito alto (extensão do pescoço)', 3]];
  const R_TEL = [['ok', 'Headset ou uma mão no fone com pescoço neutro', 1], ['longe', 'Fora do alcance (mais de 30 cm)', 2]];
  const R_MOU = [['ok', 'Alinhado ao ombro', 1], ['longe', 'Alcance para chegar ao mouse', 2]];
  const R_TEC = [['ok', 'Punhos retos, ombros relaxados', 1], ['ext', 'Punhos estendidos (mais de 15°) ou teclado inclinado', 2]];
  E.register({
    id: 'rosa', cat: 'biomecanica', sigla: 'ROSA', nome: 'ROSA – Rapid Office Strain Assessment', menu: 'ROSA – Rapid Office Strain Assessment',
    resumo: 'Avaliação rápida do posto de trabalho de escritório: cadeira, monitor, telefone, mouse e teclado, com o tempo de uso de cada item (Sonne, Villalta & Andrews, 2012).',
    normas: ['NR 17 · 17.6', 'NR 17 · 17.6.6', 'AEP/AET'], tags: 'escritorio computador cadeira monitor home office',
    secoes: [
      { t: 'Cadeira', f: [
        { t: 'opt', id: 'alt', l: 'Altura do assento', o: R_ALT, d: 'baixa' },
        { t: 'chk', id: 'altEsp', l: 'Espaço insuficiente sob a mesa para as pernas (+1)', d: false }, { t: 'chk', id: 'altNR', l: 'Altura não regulável (+1)', d: false },
        { t: 'opt', id: 'prof', l: 'Profundidade do assento', o: R_PROF, d: 'ok' }, { t: 'chk', id: 'profNR', l: 'Profundidade não regulável (+1)', d: true },
        { t: 'opt', id: 'br', l: 'Apoio de braços', o: R_BR, d: 'inad' },
        { t: 'chk', id: 'brAf', l: 'Apoios muito afastados (+1)', d: false }, { t: 'chk', id: 'brDu', l: 'Superfície dura ou danificada (+1)', d: false }, { t: 'chk', id: 'brNR', l: 'Não regulável (+1)', d: true },
        { t: 'opt', id: 'enc', l: 'Encosto', o: R_ENC, d: 'lomb' },
        { t: 'chk', id: 'encMesa', l: 'Superfície de trabalho alta (ombros elevados) (+1)', d: false }, { t: 'chk', id: 'encNR', l: 'Encosto não regulável (+1)', d: false },
        { t: 'opt', id: 'durCad', l: 'Tempo de uso da cadeira', o: DUR, d: 1 }
      ] },
      { t: 'Monitor e telefone', f: [
        { t: 'opt', id: 'mon', l: 'Monitor', o: R_MON, d: 'baixo' },
        { t: 'chk', id: 'monLonge', l: 'Muito longe (+1)', d: false }, { t: 'chk', id: 'monTor', l: 'Pescoço torcido mais de 30° (+1)', d: false },
        { t: 'chk', id: 'monRef', l: 'Reflexos na tela (+1)', d: true }, { t: 'chk', id: 'monDoc', l: 'Documentos sem suporte (+1)', d: false },
        { t: 'opt', id: 'durMon', l: 'Tempo de uso do monitor', o: DUR, d: 1 },
        { t: 'opt', id: 'tel', l: 'Telefone', o: R_TEL, d: 'ok' },
        { t: 'chk', id: 'telOmb', l: 'Fone apoiado entre ombro e orelha (+2)', d: false }, { t: 'chk', id: 'telVv', l: 'Sem viva-voz ou headset (+1)', d: false },
        { t: 'opt', id: 'durTel', l: 'Tempo de uso do telefone', o: DUR, d: -1 }
      ] },
      { t: 'Mouse e teclado', f: [
        { t: 'opt', id: 'mou', l: 'Mouse', o: R_MOU, d: 'longe' },
        { t: 'chk', id: 'mouNiv', l: 'Mouse e teclado em superfícies diferentes (+2)', d: false }, { t: 'chk', id: 'mouPin', l: 'Pega em pinça / mouse pequeno (+1)', d: false }, { t: 'chk', id: 'mouApo', l: 'Apoio de palma duro ou ponto de pressão (+1)', d: false },
        { t: 'opt', id: 'durMou', l: 'Tempo de uso do mouse', o: DUR, d: 1 },
        { t: 'opt', id: 'tec', l: 'Teclado', o: R_TEC, d: 'ext' },
        { t: 'chk', id: 'tecDes', l: 'Desvio dos punhos ao digitar (+1)', d: false }, { t: 'chk', id: 'tecAlto', l: 'Teclado alto, ombros elevados (+1)', d: false },
        { t: 'chk', id: 'tecAcima', l: 'Alcança objetos acima da cabeça (+1)', d: false }, { t: 'chk', id: 'tecNR', l: 'Teclado sem regulagem (+1)', d: false },
        { t: 'opt', id: 'durTec', l: 'Tempo de uso do teclado', o: DUR, d: 1 }
      ] }
    ],
    calc(v) {
      const sH = P(R_ALT, v.alt) + b(v.altEsp) + b(v.altNR), sD = P(R_PROF, v.prof) + b(v.profNR);
      const ar = P(R_BR, v.br) + b(v.brAf) + b(v.brDu) + b(v.brNR), bk = P(R_ENC, v.enc) + b(v.encMesa) + b(v.encNR);
      const cad = clamp(RA[clamp(sH + sD, 2, 8) - 2][clamp(ar + bk, 2, 9) - 2] + U.n0(v.durCad), 1, 10);
      const mon = clamp(P(R_MON, v.mon) + b(v.monLonge) + b(v.monTor) + b(v.monRef) + b(v.monDoc) + U.n0(v.durMon), 0, 7);
      const tel = clamp(P(R_TEL, v.tel) + 2 * b(v.telOmb) + b(v.telVv) + U.n0(v.durTel), 0, 6);
      const secB = RB[tel][mon];
      const mou = clamp(P(R_MOU, v.mou) + 2 * b(v.mouNiv) + b(v.mouPin) + b(v.mouApo) + U.n0(v.durMou), 0, 7);
      const tec = clamp(P(R_TEC, v.tec) + b(v.tecDes) + b(v.tecAlto) + b(v.tecAcima) + b(v.tecNR) + U.n0(v.durTec), 0, 7);
      const secC = RC[mou][tec];
      const per = Math.max(secB, secC);
      const fin = clamp(Math.max(cad, per), 1, 10);
      const n = fin <= 2 ? 0 : fin <= 4 ? 1 : fin <= 7 ? 2 : 3;
      const recs = [];
      if (cad >= 5) recs.push('Adequar a cadeira: altura com pés apoiados, profundidade regulável, apoio lombar e braços reguláveis (NR 17, 17.6.3).');
      if (mon >= 3) recs.push('Posicionar o monitor a um braço de distância, borda superior na altura dos olhos, sem reflexos.');
      if (mou >= 3 || tec >= 3) recs.push('Aproximar mouse e teclado no mesmo nível, com punhos neutros e ombros relaxados.');
      if (tel >= 3) recs.push('Fornecer headset para uso frequente do telefone.');
      recs.push(fin >= 5 ? 'ROSA ≥ 5: realizar intervenção no posto e reavaliar.' : 'Manter orientação postural e pausas para usuários de computador.');
      return {
        score: fin, scoreLabel: 'ROSA final', scoreSub: 'escala 1–10 (≥ 5 = ação)', faixa: { n, rotulo: ['Risco baixo', 'Risco moderado', 'Risco alto', 'Risco muito alto'][n], txt: fin >= 5 ? 'Pontuação ≥ 5: avaliação adicional e mudanças no posto são necessárias.' : 'Pontuação abaixo de 5: risco baixo, ajustes pontuais podem ajudar.' },
        gauge: { v: fin, min: 1, max: 10, zonas: [2.5, 4.5, 7.5] },
        kpis: [{ l: 'Cadeira (A)', v: cad, n: cad >= 8 ? 3 : cad >= 5 ? 2 : cad >= 3 ? 1 : 0 }, { l: 'Monitor', v: mon }, { l: 'Telefone', v: tel }, { l: 'Monitor + telefone (B)', v: secB }, { l: 'Mouse', v: mou }, { l: 'Teclado', v: tec }, { l: 'Mouse + teclado (C)', v: secC }, { l: 'Periféricos (D)', v: per }],
        charts: [{ title: 'Pontuação por item do posto', type: 'bar', h: 220, max: 10, labels: ['Cadeira', 'Monitor', 'Telefone', 'Mouse', 'Teclado'], datasets: [{ label: 'Pontos', data: [cad, mon, tel, mou, tec], levels: [cad, mon, tel, mou, tec].map(x => x <= 2 ? 0 : x <= 4 ? 1 : x <= 7 ? 2 : 3) }] }],
        recs
      };
    },
    metodo: `<h3>Sobre o ROSA</h3><p>Desenvolvido por Sonne, Villalta e Andrews (2012) para postos de escritório com computador. Avalia cadeira (altura, profundidade, apoio de braços e encosto), monitor, telefone, mouse e teclado, cada um com o tempo diário de uso. As tabelas combinam os itens em seções e na pontuação final de 1 a 10.</p><p>Pontuação final igual ou superior a 5 indica risco alto e necessidade de avaliação e mudanças imediatas.</p>`,
    refs: ['Sonne, M.; Villalta, D. L.; Andrews, D. M. Development and evaluation of an office ergonomic checklist: ROSA. Applied Ergonomics, 43(1), 2012.']
  });
})();
