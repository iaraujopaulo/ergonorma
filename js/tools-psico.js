/* Psicossociais, Cognitivos e Carga Mental: ERGOS, Ferramentas Psicossociais e Cognitivas (NR 01), HSE-IT, ITRA e NASA-TLX */
(function () {
  'use strict';
  const E = window.Ergo, U = E.util, { fmt, fmtF, clamp, esc, mean } = U;
  /* respostas de exemplo variadas e reprodutíveis */
  const varia = (base, i, min, max) => clamp(base + ((i * 7 + 3) % 3) - 1, min, max);
  const nomeN = ['Baixo', 'Moderado', 'Alto', 'Muito alto'];

  /* ======================================================================= Psicossociais e Cognitivos (NR 01) */
  const PS_DIMS = {
    dem: 'Demandas e ritmo de trabalho', cog: 'Exigências cognitivas', emo: 'Exigências emocionais', aut: 'Autonomia e controle', apo: 'Apoio social (chefia e colegas)', rec: 'Reconhecimento e recompensas',
    pap: 'Clareza de papel', jus: 'Justiça e comunicação organizacional', tfm: 'Conflito trabalho–vida pessoal', ins: 'Insegurança e gestão de mudanças', ass: 'Assédio, discriminação e violência', sau: 'Saúde e bem-estar percebidos'
  };
  const PS_ITENS = [
    ['dem', 'Tenho mais trabalho do que consigo fazer no tempo disponível.'], ['dem', 'Preciso trabalhar em ritmo acelerado.'], ['dem', 'Faço horas extras ou levo trabalho para casa para dar conta.'],
    ['cog', 'Preciso manter atenção intensa por longos períodos.'], ['cog', 'Sou interrompido com frequência e preciso retomar tarefas.'], ['cog', 'Preciso tomar decisões difíceis rapidamente.'], ['cog', 'Preciso memorizar muitas informações, sistemas ou procedimentos.'],
    ['emo', 'Lido com pessoas irritadas, em sofrimento ou agressivas.'], ['emo', 'Preciso esconder minhas emoções no trabalho.'], ['emo', 'O trabalho me deixa emocionalmente esgotado.'],
    ['aut', 'Posso influenciar a forma de realizar meu trabalho.', 1], ['aut', 'Posso decidir quando fazer pausas.', 1], ['aut', 'Participo das decisões que afetam meu trabalho.', 1],
    ['apo', 'Recebo ajuda da chefia quando preciso.', 1], ['apo', 'Meus colegas me apoiam nas dificuldades.', 1], ['apo', 'Recebo retorno sobre a qualidade do meu trabalho.', 1],
    ['rec', 'Meu trabalho é reconhecido e valorizado.', 1], ['rec', 'A remuneração é compatível com minhas responsabilidades.', 1], ['rec', 'Tenho perspectivas de desenvolvimento na organização.', 1],
    ['pap', 'Sei exatamente o que se espera de mim.', 1], ['pap', 'As metas e prioridades são claras.', 1], ['pap', 'Recebo ordens ou instruções contraditórias.'],
    ['jus', 'Os conflitos são resolvidos de forma justa.', 1], ['jus', 'As informações importantes chegam a tempo.', 1], ['jus', 'Sou tratado com respeito pela organização.', 1],
    ['tfm', 'O trabalho atrapalha minha vida pessoal ou familiar.'], ['tfm', 'Recebo mensagens ou cobranças fora do horário de trabalho.'], ['tfm', 'Tenho dificuldade para me desligar do trabalho.'],
    ['ins', 'Tenho medo de perder o emprego.'], ['ins', 'Mudanças são feitas sem consulta ou explicação.'], ['ins', 'Sinto insegurança quanto a mudanças de função, turno ou condições.'],
    ['ass', 'Sofro ou presencio humilhações, gritos ou ameaças.'], ['ass', 'Sofro ou presencio comentários ou condutas de cunho sexual indesejados.'], ['ass', 'Sofro ou presencio discriminação (gênero, raça, idade, deficiência, orientação).'],
    ['sau', 'Sinto cansaço excessivo ao fim da jornada.'], ['sau', 'Tenho dificuldades para dormir por causa do trabalho.'], ['sau', 'Sinto-me tenso ou ansioso por causa do trabalho.']
  ];
  const PS_DEF = { dem: 3, cog: 3, emo: 2, aut: 1, apo: 2, rec: 2, pap: 3, jus: 2, tfm: 2, ins: 1, ass: 0, sau: 2 };
  const psItens = PS_ITENS.map(([dim, txt, pos], i) => ({ id: 'ps' + (i + 1), dim, txt, pos: !!pos, d: dim === 'ass' ? (i === 31 ? 1 : 0) : varia(PS_DEF[dim], i, 0, 4) }));
  const PS_MED = {
    dem: 'Dimensionar a equipe e as metas pela carga real (AET), com margem para variabilidade.', cog: 'Reduzir interrupções, criar períodos protegidos de concentração e simplificar sistemas.', emo: 'Oferecer suporte e preparo para atendimento difícil; protocolos para situações de agressão.',
    aut: 'Ampliar a margem de manobra: participação na definição de métodos, ritmo e pausas.', apo: 'Capacitar lideranças em gestão de pessoas e criar rotinas de apoio entre pares.', rec: 'Rever políticas de reconhecimento, remuneração e desenvolvimento.',
    pap: 'Definir claramente atribuições, metas e canais de decisão; eliminar ordens contraditórias.', jus: 'Instituir comunicação transparente e procedimentos justos de solução de conflitos.', tfm: 'Política de desconexão e limites para contato fora do horário.',
    ins: 'Comunicar e consultar previamente sobre mudanças organizacionais.', ass: 'Canal de denúncia sigiloso, apuração e medidas contra assédio e violência (Lei 14.457/2022 e NR 05).', sau: 'Encaminhar ao PCMSO, oferecer apoio psicológico e acompanhar indicadores de afastamento.'
  };
  E.register({
    id: 'psicossocial', cat: 'psico', sigla: 'Psicossocial NR 01', nome: 'Ferramentas Psicossociais e Cognitivas – NR 01', menu: 'Ferramentas Psicossociais e Cognitivas (NR 01)',
    resumo: 'Questionário de identificação dos fatores de risco psicossociais e cognitivos relacionados ao trabalho, para o GRO/PGR conforme a NR 01 (item 1.5.3.1.4) e a NR 17 (17.4): demandas, autonomia, apoio, reconhecimento, assédio, carga cognitiva e outros.',
    normas: ['NR 01 · 1.5.3.1.4', 'NR 17 · 17.4', 'GRO/PGR', 'ISO 45003'], tags: 'psicossocial cognitivo assedio estresse nr01 burnout',
    secoes: [
      { t: 'Aplicação', f: [
        { t: 'sel', id: 'modo', l: 'Forma de aplicação', o: [['grupo', 'Média de respostas de um grupo (GHE/setor)'], ['ind', 'Entrevista individual'], ['obs', 'Avaliação técnica por observação e entrevistas']], d: 'grupo' },
        { t: 'num', id: 'resp', l: 'Número de respondentes', u: 'pessoas', d: 14, min: 1 },
        { t: 'info', html: 'Garanta anonimato e sigilo das respostas individuais. Para grupos, registre a resposta mais frequente (moda) ou a média arredondada de cada item.' }
      ] },
      { t: 'Questionário', d: 'Com que frequência cada situação ocorre no trabalho?', f: [
        { t: 'likert', id: 'q', agrupar: true, dims: PS_DIMS, escala: [[0, 'Nunca'], [1, 'Raramente'], [2, 'Às vezes'], [3, 'Frequen­temente'], [4, 'Sempre']], itens: psItens }
      ] }
    ],
    calc(v) {
      const dims = Object.keys(PS_DIMS).map(k => {
        const its = psItens.filter(i => i.dim === k);
        const r = mean(its.map(i => { const x = U.n0(v[i.id]); return i.pos ? 4 - x : x; })) / 4 * 100;
        return { k, nome: PS_DIMS[k], r, n: r < 25 ? 0 : r < 50 ? 1 : r < 75 ? 2 : 3 };
      });
      const ass = dims.find(d => d.k === 'ass');
      if (ass.r > 0 && ass.n < 2) ass.n = 2;
      const idx = mean(dims.map(d => d.r));
      let n = idx < 25 ? 0 : idx < 50 ? 1 : idx < 75 ? 2 : 3;
      if (dims.some(d => d.n >= 2)) n = Math.max(n, 2);
      if (dims.some(d => d.n === 3)) n = 3;
      const crit = dims.filter(d => d.n >= 2).sort((a, b) => b.r - a.r);
      const recs = crit.map(d => `${d.nome} (${fmt(d.r, 0)}%): ${PS_MED[d.k]}`);
      recs.push('Registrar os fatores identificados no inventário de riscos do PGR e acompanhar com indicadores (absenteísmo, afastamentos, rotatividade).');
      if (ass.r > 0) recs.unshift('Há relato de assédio, discriminação ou violência: tratar com prioridade e sigilo, independentemente da média geral.');
      return {
        score: fmt(idx, 0) + '%', scoreNum: idx, scoreLabel: 'Índice de risco psicossocial', scoreSub: `${crit.length} dimensão(ões) em nível alto ou muito alto · ${v.resp || 1} respondente(s)`,
        faixa: { n, rotulo: 'Risco ' + nomeN[n].toLowerCase(), txt: crit.length ? 'Fatores psicossociais com risco alto: incluir no PGR e definir medidas organizacionais.' : 'Sem dimensões em nível alto; manter monitoramento.' },
        gauge: { v: idx, min: 0, max: 100, zonas: [25, 50, 75] },
        kpis: dims.slice().sort((a, b) => b.r - a.r).slice(0, 6).map(d => ({ l: d.nome, v: fmt(d.r, 0) + '%', n: d.n })),
        charts: [{ title: 'Perfil de risco por dimensão (0–100%)', type: 'radar', max: 100, h: 300, labels: dims.map(d => d.nome.split(' (')[0].replace('Exigências ', 'Exig. ')), datasets: [{ label: 'Risco %', data: dims.map(d => +d.r.toFixed(1)) }] },
          { title: 'Dimensões ordenadas por risco', type: 'bar', horizontal: true, max: 100, h: 300, labels: dims.slice().sort((a, b) => b.r - a.r).map(d => d.nome), datasets: [{ label: 'Risco %', data: dims.slice().sort((a, b) => b.r - a.r).map(d => +d.r.toFixed(1)), levels: dims.slice().sort((a, b) => b.r - a.r).map(d => d.n) }] }],
        recs
      };
    },
    metodo: `<h3>Fatores psicossociais no GRO</h3><p>A atualização da NR 01 (Portaria MTE nº 1.419/2024) explicitou que o gerenciamento de riscos ocupacionais deve abranger os fatores de riscos psicossociais relacionados ao trabalho. A NR 17 (17.4) já exige que a organização do trabalho considere as exigências cognitivas e o conteúdo das tarefas.</p>
      <h3>Como calcular</h3><p>Escala de frequência de 0 (nunca) a 4 (sempre). Itens positivos (autonomia, apoio, reconhecimento, clareza, justiça) são invertidos. O risco da dimensão é a média convertida em 0–100%: &lt; 25% baixo · 25–49% moderado · 50–74% alto · ≥ 75% muito alto. Qualquer relato de assédio, discriminação ou violência eleva a dimensão a pelo menos “alto”.</p>
      <p>O questionário é um instrumento de triagem inspirado em modelos reconhecidos (COPSOQ, HSE-IT, ISO 45003). Para diagnósticos aprofundados use também o <a href="#hseit">HSE-IT</a> e o <a href="#itra">ITRA</a>.</p>`,
    normasTxt: ['<b>NR 01, 1.5.3.1.4</b>: o GRO deve abranger os riscos que decorrem dos agentes físicos, químicos e biológicos, de acidentes e dos fatores ergonômicos, incluindo os fatores de risco psicossociais relacionados ao trabalho.', '<b>NR 17, 17.4.1</b>: a organização do trabalho deve levar em consideração as normas de produção, o modo operatório, a exigência de tempo, o ritmo, o conteúdo das tarefas e as exigências cognitivas.', '<b>ISO 45003:2021</b>: diretrizes para a gestão de riscos psicossociais.'],
    refs: ['Brasil. NR 01 (Portaria MTE nº 1.419/2024) e Guia de fatores de riscos psicossociais relacionados ao trabalho (MTE, 2025).', 'ISO 45003:2021 — Psychological health and safety at work.', 'Kristensen, T. S. et al. The Copenhagen Psychosocial Questionnaire (COPSOQ). Scand J Work Environ Health, 2005.']
  });

  /* ======================================================================= HSE-IT */
  const HSE_DIMS = { dem: 'Demandas', con: 'Controle', che: 'Apoio da chefia', col: 'Apoio dos colegas', rel: 'Relacionamentos', car: 'Cargo / função', mud: 'Comunicação e mudanças' };
  const HSE = [
    ['car', 'Tenho clareza sobre o que se espera de mim no trabalho.'], ['con', 'Posso decidir quando fazer uma pausa.'], ['dem', 'Grupos diferentes no trabalho exigem de mim coisas difíceis de conciliar.', 1], ['car', 'Eu sei como fazer o meu trabalho.'],
    ['rel', 'Estou sujeito a assédio pessoal na forma de palavras ou comportamentos grosseiros.', 1], ['dem', 'Tenho prazos impossíveis de cumprir.', 1], ['col', 'Se o trabalho fica difícil, meus colegas me ajudam.'], ['che', 'Recebo informações e suporte que me ajudam no trabalho que faço.'],
    ['dem', 'Tenho que trabalhar muito intensamente.', 1], ['con', 'Tenho poder de decisão sobre a minha velocidade de trabalho.'], ['car', 'Tenho clareza das minhas tarefas e responsabilidades.'], ['dem', 'Tenho que deixar de lado algumas tarefas porque tenho muita coisa para fazer.', 1],
    ['car', 'Os objetivos e metas do meu setor são claros para mim.'], ['rel', 'Existe atrito ou desentendimento entre os colegas.', 1], ['con', 'Tenho liberdade de escolha de como fazer meu trabalho.'], ['dem', 'Não tenho possibilidade de fazer pausas suficientes.', 1],
    ['car', 'Eu vejo como o meu trabalho se encaixa nos objetivos da empresa.'], ['dem', 'Sou pressionado a trabalhar em horários longos.', 1], ['con', 'Tenho liberdade para escolher o que faço no trabalho.'], ['dem', 'Tenho que trabalhar muito rápido.', 1],
    ['rel', 'Sinto que sou perseguido no trabalho.', 1], ['dem', 'As pressões de tempo são irreais.', 1], ['che', 'Posso confiar no meu chefe quando eu tiver problemas no trabalho.'], ['col', 'Meus colegas me ajudam e me dão apoio quando eu preciso.'],
    ['con', 'Minhas sugestões são consideradas sobre como fazer meu trabalho.'], ['mud', 'Tenho oportunidades suficientes para questionar os chefes sobre mudanças no trabalho.'], ['col', 'No trabalho, os meus colegas demonstram o respeito que mereço.'], ['mud', 'As pessoas são sempre consultadas sobre mudanças no trabalho.'],
    ['che', 'Quando algo no trabalho me perturba ou irrita, posso falar com meu chefe.'], ['con', 'Meu horário de trabalho pode ser flexível.'], ['col', 'Os colegas estão disponíveis para escutar os meus problemas de trabalho.'], ['mud', 'Quando são feitas mudanças no trabalho, tenho clareza de como elas funcionarão na prática.'],
    ['che', 'Recebo apoio durante trabalhos que podem ser emocionalmente exigentes.'], ['rel', 'Os relacionamentos no trabalho são tensos.', 1], ['che', 'Meu chefe me incentiva no trabalho.']
  ];
  const hseItens = HSE.map(([dim, txt, neg], i) => ({ id: 'h' + (i + 1), dim, txt: txt, neg: !!neg, d: neg ? varia(dim === 'dem' ? 4 : 2, i, 1, 5) : varia(dim === 'con' ? 2 : dim === 'car' ? 4 : 3, i, 1, 5) }));
  const HSE_MED = { dem: 'Ajustar metas, prazos e efetivo à capacidade real; evitar jornadas longas.', con: 'Aumentar a participação e a autonomia sobre ritmo, método e pausas.', che: 'Capacitar chefias em apoio, feedback e escuta.', col: 'Promover trabalho em equipe e apoio entre pares.', rel: 'Política contra assédio e procedimentos para conflitos.', car: 'Clarificar papéis, responsabilidades e objetivos.', mud: 'Consultar e comunicar antes e durante as mudanças.' };
  E.register({
    id: 'hseit', cat: 'psico', sigla: 'HSE-IT', nome: 'HSE-IT – Indicador de Estresse Ocupacional', menu: 'HSE-IT',
    resumo: 'Health and Safety Executive Indicator Tool: 35 itens em 7 dimensões (demandas, controle, apoio da chefia e dos colegas, relacionamentos, cargo e mudanças) para identificar fontes de estresse relacionado ao trabalho.',
    normas: ['NR 01 · fatores psicossociais', 'NR 17 · 17.4', 'GRO/PGR'], tags: 'estresse health safety executive management standards',
    secoes: [{ t: 'Questionário (35 itens)', d: 'Pense nos últimos 6 meses. Itens de demandas e relacionamentos são invertidos no cálculo: em todas as dimensões, quanto maior a média, melhor.', f: [
      { t: 'likert', id: 'q', agrupar: true, dims: HSE_DIMS, escala: [[1, 'Nunca'], [2, 'Raramente'], [3, 'Às vezes'], [4, 'Frequen­temente'], [5, 'Sempre']], itens: hseItens.slice().sort((a, b) => Object.keys(HSE_DIMS).indexOf(a.dim) - Object.keys(HSE_DIMS).indexOf(b.dim)) }
    ] }],
    calc(v) {
      const dims = Object.keys(HSE_DIMS).map(k => {
        const m = mean(hseItens.filter(i => i.dim === k).map(i => { const x = U.n0(v[i.id]) || 3; return i.neg ? 6 - x : x; }));
        return { k, nome: HSE_DIMS[k], m, n: m >= 3.5 ? 0 : m >= 3 ? 1 : m >= 2.5 ? 2 : 3 };
      });
      const geral = mean(dims.map(d => d.m));
      const n = Math.max(geral >= 3.5 ? 0 : geral >= 3 ? 1 : geral >= 2.5 ? 2 : 3, dims.some(d => d.n >= 3) ? 2 : 0);
      const crit = dims.filter(d => d.n >= 2).sort((a, b) => a.m - b.m);
      const recs = crit.map(d => `${d.nome} (média ${fmtF(d.m, 2)}): ${HSE_MED[d.k]}`);
      recs.push('Discutir os resultados com grupos focais de trabalhadores e definir ações no PGR (abordagem dos Management Standards do HSE).');
      return {
        score: fmtF(geral, 2), scoreNum: geral, scoreLabel: 'Média geral (1 a 5)', scoreSub: 'quanto maior, melhor',
        faixa: { n, rotulo: ['Situação favorável', 'Atenção', 'Risco', 'Risco crítico'][n], txt: crit.length ? `${crit.length} dimensão(ões) abaixo de 3,0: fontes de estresse relevantes.` : 'Nenhuma dimensão em nível de risco.' },
        gauge: { v: 5 - geral, min: 0, max: 4, zonas: [1.5, 2, 2.5] },
        kpis: dims.map(d => ({ l: d.nome, v: fmtF(d.m, 2), n: d.n })),
        charts: [{ title: 'Média por dimensão (1 = pior · 5 = melhor)', type: 'radar', min: 1, max: 5, h: 290, labels: dims.map(d => d.nome), datasets: [{ label: 'Média', data: dims.map(d => +d.m.toFixed(2)) }] }],
        recs
      };
    },
    metodo: `<h3>HSE Management Standards Indicator Tool</h3><p>Instrumento do Health and Safety Executive (Reino Unido) com 35 itens em sete dimensões: Demandas (8), Controle (6), Apoio da chefia (5), Apoio dos colegas (4), Relacionamentos (4), Cargo (5) e Mudanças (3). Validado no Brasil por Lucca e Sobral (2017).</p><p>Escala de 1 a 5; os itens negativos (demandas e relacionamentos) são invertidos. Referência de leitura adotada: média ≥ 3,5 favorável · 3,0–3,49 atenção · 2,5–2,99 risco · &lt; 2,5 risco crítico. Para comparação com o benchmark do HSE use os percentis da população de referência.</p>`,
    refs: ['Cousins, R. et al. Management Standards and work-related stress in the UK: practical development. Work & Stress, 18(2), 2004.', 'Lucca, S. R.; Sobral, R. C. Avaliação do estresse ocupacional: validação do HSE-IT no Brasil. Rev. Bras. Med. Trab., 2017.']
  });

  /* ======================================================================= ITRA */
  const mk = (pref, defs, base, min, max) => { const out = []; let i = 0; Object.entries(defs).forEach(([dim, list]) => list.forEach(txt => { i++; out.push({ id: pref + i, dim, txt, d: varia(base[dim], i, min, max) }); })); return out; };
  const EACT_D = { org: 'Organização do trabalho', cond: 'Condições de trabalho', rel: 'Relações socioprofissionais' };
  const EACT = mk('ea', {
    org: ['O ritmo de trabalho é excessivo.', 'As tarefas são cumpridas com pressão de prazos.', 'Existe forte cobrança por resultados.', 'As normas para execução das tarefas são rígidas.', 'Existe fiscalização do desempenho.', 'O número de pessoas é insuficiente para realizar as tarefas.', 'As tarefas são repetitivas.'],
    cond: ['As condições de trabalho são precárias.', 'O ambiente físico é desconfortável.', 'Existe muito barulho no ambiente de trabalho.', 'O mobiliário existente no local de trabalho é inadequado.', 'Os instrumentos de trabalho são insuficientes.', 'O posto de trabalho é inadequado para a realização das tarefas.', 'Os equipamentos necessários são precários.'],
    rel: ['As tarefas não estão claramente definidas.', 'A autonomia é inexistente.', 'A distribuição das tarefas é injusta.', 'Os funcionários são excluídos das decisões.', 'Existem dificuldades na comunicação entre chefia e subordinados.', 'Existem disputas profissionais no local de trabalho.', 'Falta apoio das chefias para o meu desenvolvimento profissional.']
  }, { org: 4, cond: 3, rel: 3 }, 1, 5);
  const ECHT_D = { fis: 'Custo físico', cog: 'Custo cognitivo', afe: 'Custo afetivo' };
  const ECHT = mk('ec', {
    fis: ['Usar a força física.', 'Usar os braços de forma contínua.', 'Ficar em posição curvada.', 'Caminhar.', 'Ser obrigado a ficar em pé.', 'Ter que manusear objetos pesados.', 'Fazer esforço físico.'],
    cog: ['Desenvolver macetes.', 'Ter que resolver problemas.', 'Ser obrigado a lidar com imprevistos.', 'Fazer previsão de acontecimentos.', 'Usar a visão de forma contínua.', 'Usar a memória.', 'Ter desafios intelectuais.'],
    afe: ['Ter controle das emoções.', 'Ter que lidar com ordens contraditórias.', 'Ter custo emocional.', 'Ser obrigado a lidar com a agressividade dos outros.', 'Disfarçar os sentimentos.', 'Ser obrigado a ter bom humor.', 'Ser obrigado a cuidar da aparência física.']
  }, { fis: 4, cog: 3, afe: 2 }, 1, 5);
  const EIPST_D = { rp: 'Realização profissional (prazer)', le: 'Liberdade de expressão (prazer)', ep: 'Esgotamento profissional (sofrimento)', fr: 'Falta de reconhecimento (sofrimento)' };
  const EIPST = mk('ei', {
    rp: ['Satisfação.', 'Motivação.', 'Orgulho pelo que faço.', 'Bem-estar.', 'Realização profissional.', 'Valorização.'],
    le: ['Liberdade com a chefia para negociar o que precisa.', 'Liberdade para falar sobre o meu trabalho com os colegas.', 'Solidariedade entre os colegas.', 'Confiança entre os colegas.', 'Liberdade para usar a minha criatividade.'],
    ep: ['Esgotamento emocional.', 'Estresse.', 'Insatisfação.', 'Sobrecarga.', 'Frustração.', 'Insegurança.', 'Medo.'],
    fr: ['Falta de reconhecimento de meu esforço.', 'Falta de reconhecimento do meu desempenho.', 'Desvalorização.', 'Indignação.', 'Inutilidade.', 'Desqualificação.', 'Injustiça.']
  }, { rp: 3, le: 3, ep: 4, fr: 3 }, 0, 6);
  const EADRT_D = { fis: 'Danos físicos', soc: 'Danos sociais', psi: 'Danos psicológicos' };
  const EADRT = mk('ed', {
    fis: ['Dores no corpo.', 'Dores nos braços.', 'Dor de cabeça.', 'Distúrbios digestivos.', 'Dores nas costas.', 'Alterações do sono.', 'Dores nas pernas.'],
    soc: ['Insensibilidade em relação aos colegas.', 'Dificuldades nas relações fora do trabalho.', 'Vontade de ficar sozinho.', 'Conflitos nas relações familiares.', 'Impaciência com as pessoas em geral.'],
    psi: ['Amargura.', 'Sensação de vazio.', 'Mau humor.', 'Vontade de desistir de tudo.', 'Tristeza.', 'Irritação com tudo.', 'Dúvida sobre a capacidade de fazer as tarefas.']
  }, { fis: 4, soc: 2, psi: 2 }, 1, 7);
  const cls3 = (m) => m >= 3.7 ? { n: 2, c: 'Grave' } : m >= 2.3 ? { n: 1, c: 'Crítico' } : { n: 0, c: 'Satisfatório' };
  E.register({
    id: 'itra', cat: 'psico', sigla: 'ITRA', nome: 'ITRA – Inventário sobre Trabalho e Riscos de Adoecimento', menu: 'ITRA',
    resumo: 'Inventário de Mendes e Ferreira com quatro escalas: contexto de trabalho (EACT), custo humano (ECHT), indicadores de prazer e sofrimento (EIPST) e danos relacionados ao trabalho (EADRT).',
    normas: ['NR 01 · fatores psicossociais', 'NR 17 · 17.4', 'GRO/PGR'], tags: 'mendes ferreira prazer sofrimento danos contexto custo humano',
    secoes: [
      { t: 'EACT — Contexto de trabalho', d: '1 = Nunca · 5 = Sempre', f: [{ t: 'likert', id: 'eact', agrupar: true, dims: EACT_D, escala: [[1, 'Nunca'], [2, 'Raramente'], [3, 'Às vezes'], [4, 'Frequen­temente'], [5, 'Sempre']], itens: EACT }] },
      { t: 'ECHT — Custo humano do trabalho', d: '1 = Nada exigido · 5 = Totalmente exigido', f: [{ t: 'likert', id: 'echt', agrupar: true, dims: ECHT_D, escala: [[1, 'Nada'], [2, 'Pouco'], [3, 'Mais ou menos'], [4, 'Bastante'], [5, 'Totalmente']], itens: ECHT }] },
      { t: 'EIPST — Prazer e sofrimento no trabalho', d: 'Frequência nos últimos 6 meses: 0 = nenhuma vez · 6 = seis ou mais vezes', f: [{ t: 'likert', id: 'eipst', agrupar: true, dims: EIPST_D, escala: [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6+']], itens: EIPST }] },
      { t: 'EADRT — Danos relacionados ao trabalho', d: 'Frequência nos últimos 6 meses: 1 = nenhuma vez · 7 = seis ou mais vezes', f: [{ t: 'likert', id: 'eadrt', agrupar: true, dims: EADRT_D, escala: [[1, '0'], [2, '1'], [3, '2'], [4, '3'], [5, '4'], [6, '5'], [7, '6+']], itens: EADRT }] }
    ],
    calc(v) {
      const media = (its, dim) => mean(its.filter(i => i.dim === dim).map(i => U.n0(v[i.id])));
      const fat = [];
      Object.entries(EACT_D).forEach(([k, n]) => { const m = media(EACT, k); fat.push({ esc: 'EACT', nome: n, m, ...cls3(m) }); });
      Object.entries(ECHT_D).forEach(([k, n]) => { const m = media(ECHT, k); fat.push({ esc: 'ECHT', nome: n, m, ...cls3(m) }); });
      Object.entries(EIPST_D).forEach(([k, n]) => { const m = media(EIPST, k); const prazer = k === 'rp' || k === 'le'; const c = prazer ? (m >= 4 ? { n: 0, c: 'Satisfatório' } : m > 2 ? { n: 1, c: 'Crítico' } : { n: 2, c: 'Grave' }) : (m >= 4 ? { n: 2, c: 'Grave' } : m > 2 ? { n: 1, c: 'Crítico' } : { n: 0, c: 'Satisfatório' }); fat.push({ esc: 'EIPST', nome: n, m, ...c }); });
      Object.entries(EADRT_D).forEach(([k, n]) => { const m = media(EADRT, k); const c = m > 4.1 ? { n: 3, c: 'Presença de doença ocupacional' } : m >= 3.1 ? { n: 2, c: 'Grave' } : m >= 2 ? { n: 1, c: 'Crítico' } : { n: 0, c: 'Suportável' }; fat.push({ esc: 'EADRT', nome: n, m, ...c }); });
      const max = Math.max(...fat.map(f => f.n));
      const graves = fat.filter(f => f.n >= 2);
      const recs = graves.map(f => `${f.esc} — ${f.nome}: ${f.c.toLowerCase()} (média ${fmtF(f.m, 2)}). Priorizar medidas sobre a organização e as condições de trabalho relacionadas.`);
      if (fat.some(f => f.esc === 'EADRT' && f.n >= 2)) recs.push('Danos relatados em nível grave: encaminhar ao PCMSO e investigar nexo com o trabalho.');
      recs.push('Restituir os resultados aos trabalhadores e construir o plano de ação de forma participativa.');
      return {
        score: graves.length, scoreNum: max, scoreLabel: 'Fatores em nível grave', scoreSub: `${fat.filter(f => f.n === 1).length} crítico(s) · ${fat.length} fatores avaliados`,
        faixa: { n: max, rotulo: ['Satisfatório', 'Crítico', 'Grave', 'Adoecimento'][max], txt: ['Contexto, custos e danos em níveis satisfatórios.', 'Há fatores críticos: situação-limite que exige providências a curto e médio prazo.', 'Há fatores graves: forte risco de adoecimento; providências imediatas.', 'Danos indicam presença de adoecimento relacionado ao trabalho.'][max] },
        gauge: { v: max + .5, min: 0, max: 4, zonas: [1, 2, 3] },
        kpis: fat.map(f => ({ l: f.esc + ' · ' + f.nome.replace(/ \(.*\)/, ''), v: fmtF(f.m, 2), s: f.c, n: f.n })),
        charts: [{ title: 'Classificação por fator (0 satisfatório · 3 adoecimento)', type: 'bar', horizontal: true, max: 3, h: 360, labels: fat.map(f => f.esc + ' · ' + f.nome.replace(/ \(.*\)/, '')), datasets: [{ label: 'Nível', data: fat.map(f => f.n + .2), levels: fat.map(f => f.n) }] }],
        recs
      };
    },
    metodo: `<h3>ITRA</h3><p>Desenvolvido por Ana Magnólia Mendes e Mário César Ferreira (2003, revisado em 2007), avalia a inter-relação entre trabalho e processo de adoecimento.</p>
      <ul><li><b>EACT e ECHT</b> (1–5): acima de 3,7 grave · 2,3 a 3,69 crítico · abaixo de 2,29 satisfatório.</li><li><b>EIPST</b> (0–6): prazer — acima de 4 satisfatório, 2,1 a 3,9 crítico, abaixo de 2 grave; sofrimento — acima de 4 grave, 2,1 a 3,9 crítico, abaixo de 2 satisfatório.</li><li><b>EADRT</b> (1–7): acima de 4,1 presença de doenças ocupacionais · 3,1 a 4,0 grave · 2,0 a 3,0 crítico · abaixo de 1,9 suportável.</li></ul><p>Esta versão reúne itens representativos de cada fator. Para pesquisas formais, utilize a versão integral validada.</p>`,
    refs: ['Mendes, A. M.; Ferreira, M. C. Inventário sobre o Trabalho e Riscos de Adoecimento – ITRA. In: Mendes, A. M. (org.). Psicodinâmica do trabalho: teoria, método e pesquisas. Casa do Psicólogo, 2007.']
  });

  /* ======================================================================= NASA-TLX */
  const TLX = { md: 'Exigência mental', pd: 'Exigência física', td: 'Exigência temporal', op: 'Desempenho', ef: 'Esforço', fr: 'Frustração' };
  const TLX_DESC = { md: 'Quanta atividade mental e perceptiva foi exigida (pensar, decidir, lembrar, procurar)?', pd: 'Quanta atividade física foi exigida (empurrar, puxar, girar, controlar)?', td: 'Quanta pressão de tempo você sentiu pelo ritmo da tarefa?', op: 'Quão bem-sucedido você acha que foi? (0 = perfeito · 100 = fracasso)', ef: 'Quanto esforço (mental e físico) você precisou fazer para atingir seu nível de desempenho?', fr: 'Quão inseguro, desencorajado, irritado ou estressado você se sentiu?' };
  const PARES = [['md', 'pd'], ['md', 'td'], ['md', 'op'], ['md', 'ef'], ['md', 'fr'], ['pd', 'td'], ['pd', 'op'], ['pd', 'ef'], ['pd', 'fr'], ['td', 'op'], ['td', 'ef'], ['td', 'fr'], ['op', 'ef'], ['op', 'fr'], ['ef', 'fr']];
  E.register({
    id: 'nasatlx', cat: 'psico', sigla: 'NASA-TLX', nome: 'NASA-TLX – Carga Mental de Trabalho', menu: 'NASA-TLX – Carga Mental',
    resumo: 'Índice de carga de trabalho percebida pelo trabalhador em seis dimensões (mental, física, temporal, desempenho, esforço e frustração), ponderadas por 15 comparações entre pares (Hart & Staveland, 1988).',
    normas: ['NR 17 · 17.4.1', 'NR 01 · fatores psicossociais', 'ISO 10075'], tags: 'workload carga mental percebida',
    secoes: [
      { t: 'Avaliação das dimensões (0 a 100)', d: 'Aplicada ao trabalhador logo após a tarefa.', f: Object.keys(TLX).map(k => ({ t: 'range', id: k, l: TLX[k], h: TLX_DESC[k], min: 0, max: 100, step: 5, d: { md: 75, pd: 30, td: 70, op: 40, ef: 65, fr: 45 }[k], ends: k === 'op' ? ['Perfeito', 'Fracasso'] : ['Muito baixa', 'Muito alta'] })).concat([{ t: 'chk', id: 'raw', l: 'Usar o Raw TLX (média simples, sem ponderação)', d: false, w: 'w-full' }]) },
      { t: 'Comparações entre pares', d: 'Em cada par, qual fator contribuiu mais para a carga de trabalho nesta tarefa?', f: [
        { t: 'pairs', id: 'p', pares: PARES, nomes: TLX, d: ['md', 'md', 'md', 'md', 'md', 'td', 'op', 'ef', 'fr', 'td', 'td', 'td', 'ef', 'fr', 'ef'], show: v => !v.raw }
      ] }
    ],
    calc(v) {
      const ks = Object.keys(TLX);
      const w = Object.fromEntries(ks.map(k => [k, 0]));
      PARES.forEach((_, i) => { const x = v['p_' + i]; if (w[x] != null) w[x]++; });
      const raw = mean(ks.map(k => U.n0(v[k])));
      const pond = ks.reduce((s, k) => s + w[k] * U.n0(v[k]), 0) / 15;
      const idx = v.raw ? raw : pond;
      const n = idx < 30 ? 0 : idx < 50 ? 1 : idx < 70 ? 2 : 3;
      const contrib = ks.map(k => v.raw ? U.n0(v[k]) / 6 : w[k] * U.n0(v[k]) / 15);
      const top = ks.map((k, i) => [k, contrib[i]]).sort((a, b) => b[1] - a[1]).slice(0, 2);
      const DIC = { md: 'Reduzir a exigência mental: simplificar informações, apoiar decisões e reduzir interrupções.', pd: 'Reduzir a exigência física com auxílios e melhorias do posto.', td: 'Rever a pressão de tempo: metas, prazos e efetivo.', op: 'Melhorar o retorno sobre o desempenho e os meios para realizar a tarefa.', ef: 'Reduzir o esforço com treinamento, ferramentas e organização.', fr: 'Investigar fontes de frustração (falhas de sistema, conflitos, ordens contraditórias).' };
      return {
        score: fmt(idx, 1), scoreNum: idx, scoreLabel: v.raw ? 'Raw TLX' : 'TLX ponderado', scoreSub: v.raw ? 'média simples das 6 dimensões' : `Raw TLX ${fmt(raw, 1)}`,
        faixa: { n, rotulo: 'Carga ' + ['baixa', 'moderada', 'alta', 'muito alta'][n], txt: ['Carga de trabalho percebida baixa.', 'Carga moderada.', 'Carga alta: investigar as dimensões dominantes.', 'Carga muito alta: risco de fadiga e erros; intervir.'][n] },
        gauge: { v: idx, min: 0, max: 100, zonas: [30, 50, 70] },
        kpis: ks.map((k, i) => ({ l: TLX[k], v: U.n0(v[k]), s: v.raw ? '' : 'peso ' + w[k] })),
        charts: [{ title: 'Perfil das dimensões (0–100)', type: 'radar', max: 100, h: 270, labels: ks.map(k => TLX[k]), datasets: [{ label: 'Avaliação', data: ks.map(k => U.n0(v[k])) }] },
          { title: 'Contribuição para o índice', type: 'bar', h: 200, labels: ks.map(k => TLX[k].replace('Exigência ', 'Exig. ')), datasets: [{ label: 'Pontos', data: contrib.map(x => +x.toFixed(1)) }] }],
        recs: top.map(t => DIC[t[0]]).concat([n >= 2 ? 'Aprofundar com a AET e incluir a carga mental no inventário de riscos do PGR.' : 'Reaplicar após mudanças relevantes na tarefa.'])
      };
    },
    metodo: `<h3>NASA Task Load Index</h3><p>Desenvolvido pelo Human Performance Group do NASA Ames Research Center (Hart & Staveland, 1988). Cada dimensão é avaliada de 0 a 100; os pesos (0 a 5) vêm de 15 comparações entre pares. <b>TLX = Σ (peso × avaliação) / 15</b>. O Raw TLX é a média simples.</p><p>Faixas de leitura usadas aqui (referência, não norma): &lt; 30 baixa · 30–49 moderada · 50–69 alta · ≥ 70 muito alta. Compare preferencialmente entre tarefas e antes/depois de mudanças.</p>`,
    refs: ['Hart, S. G.; Staveland, L. E. Development of NASA-TLX: results of empirical and theoretical research. Advances in Psychology, 52, 1988.', 'ISO 10075-1:2017 — Ergonomic principles related to mental workload.']
  });

  /* ======================================================================= ERGOS */
  const ERG = [
    ['pt', 'Pressão de tempo', 'Prazos, ritmo imposto, metas por hora.', 7], ['at', 'Atenção / concentração', 'Nível e duração da atenção exigida.', 8], ['cx', 'Complexidade e rapidez das decisões', 'Quantidade de alternativas e consequências das decisões.', 6],
    ['in', 'Quantidade de informação', 'Volume de sinais, telas, documentos a processar.', 6], ['mo', 'Monotonia', 'Tarefas repetitivas, ciclo curto, pouco conteúdo.', 7], ['au', 'Falta de iniciativa / autonomia', 'Pouca possibilidade de organizar o próprio trabalho.', 6],
    ['is', 'Isolamento', 'Pouca possibilidade de comunicação com colegas.', 3], ['ho', 'Horário de trabalho', 'Turnos, trabalho noturno, horas extras.', 4], ['re', 'Responsabilidade / consequência de erros', 'Segurança de pessoas, perdas materiais e de qualidade.', 6],
    ['rl', 'Relações dependentes do trabalho', 'Atendimento ao público, conflitos, cobranças.', 4]
  ];
  E.register({
    id: 'ergos', cat: 'psico', sigla: 'ERGOS', nome: 'ERGOS – Carga Mental', menu: 'ERGOS – Carga Mental',
    resumo: 'Perfil de carga mental do posto em dez fatores (pressão de tempo, atenção, complexidade, informação, monotonia, autonomia, isolamento, horário, responsabilidade e relações), em escala de 0 (satisfatório) a 10 (nocivo).',
    normas: ['NR 17 · 17.4.1', 'NR 01 · fatores psicossociais', 'ISO 10075-2'], tags: 'carga mental perfil fatores organizacionais',
    secoes: [{ t: 'Fatores de carga mental', d: 'Atribua de 0 a 10 a partir de observação e entrevistas: 0–2 satisfatório · 3–5 aceitável · 6–8 incômodo · 9–10 nocivo.', f: ERG.map(([id, l, h, d]) => ({ t: 'range', id, l, h, min: 0, max: 10, step: 1, d, ends: ['0 · satisfatório', '10 · nocivo'] })) }],
    calc(v) {
      const vals = ERG.map(e => ({ id: e[0], nome: e[1], x: U.n0(v[e[0]]) }));
      const m = mean(vals.map(x => x.x));
      const nocivos = vals.filter(x => x.x >= 9).length, incom = vals.filter(x => x.x >= 6 && x.x < 9).length;
      let n = m < 3 ? 0 : m < 6 ? 1 : m < 8 ? 2 : 3;
      if (nocivos) n = Math.max(n, 2);
      if (nocivos >= 3) n = 3;
      const lvl = x => x <= 2 ? 0 : x <= 5 ? 1 : x <= 8 ? 2 : 3;
      const recs = vals.filter(x => x.x >= 6).sort((a, b) => b.x - a.x).map(x => `${x.nome} (${x.x}): intervir na organização do trabalho para reduzir este fator.`);
      if (!recs.length) recs.push('Perfil de carga mental aceitável; manter acompanhamento.');
      return {
        score: fmt(m, 1), scoreNum: m, scoreLabel: 'Média do perfil (0–10)', scoreSub: `${nocivos} nocivo(s) · ${incom} incômodo(s)`,
        faixa: { n, rotulo: ['Satisfatório', 'Aceitável', 'Incômodo', 'Nocivo'][n], txt: ['Carga mental satisfatória.', 'Carga mental aceitável, com pontos de melhoria.', 'Carga mental incômoda: fatores devem ser corrigidos.', 'Carga mental nociva: intervenção prioritária.'][n] },
        gauge: { v: m, min: 0, max: 10, zonas: [3, 6, 8] },
        kpis: vals.slice().sort((a, b) => b.x - a.x).slice(0, 6).map(x => ({ l: x.nome, v: x.x, n: lvl(x.x) })),
        charts: [{ title: 'Perfil ERGOS (0 satisfatório · 10 nocivo)', type: 'radar', max: 10, h: 300, labels: vals.map(x => x.nome.split(' / ')[0].split(' e ')[0]), datasets: [{ label: 'Pontuação', data: vals.map(x => x.x) }] }],
        recs
      };
    },
    metodo: `<h3>Método ERGOS</h3><p>Método de perfil de posto (família de métodos como LEST e ERGOS) que avalia fatores de carga mental e psicossociais em escala de 0 a 10 a partir da observação e de entrevistas. O resultado é um perfil que permite identificar os fatores a corrigir e comparar postos.</p><p>0–2 satisfatório · 3–5 aceitável/débil · 6–8 incômodo (moléstia média) · 9–10 nocivo.</p>`,
    refs: ['Guélaud, F. et al. Pour une analyse des conditions du travail ouvrier dans l’entreprise (método LEST). Armand Colin, 1975.', 'ISO 10075-2:2024 — Design principles related to mental workload.']
  });
})();
