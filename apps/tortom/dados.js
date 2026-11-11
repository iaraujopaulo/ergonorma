/* Dados extraídos do APK TOR-TOM MMSS (Dart AOT, via blutter): tabelas, faixas e textos. */
window.D = {
  titulo: "TOR-TOM MMSS – Membros Superiores",
  // FR: [grupo, descrição, [atos não diversificados, atos diversificados, pausas regulares >25% da jornada]]
  FR_cols: ["Atos operacionais não diversificados", "Atos operacionais diversificados", "Pausas regulares maiores que 25% da jornada"],
  FR: [
    ["Movimentos muito lentos", "Mãos desocupadas durante a maior parte do tempo - sem exercício regular", [0,0,0]],
    ["Movimentos muito lentos", "Movimentos bem lentos; com pausas frequentes", [0,0,0]],
    ["Movimentos muito lentos", "Movimentos bem lentos; sem pausas ou pausas infrequentes", [2,0,0]],
    ["Movimentos muito lentos", "Movimentos lentos", [4,2,2]],
    ["Movimentos de baixa velocidade", "Movimentos regulares de baixa velocidade; pausas curtas frequentes", [6,2,2]],
    ["Movimentos de baixa velocidade", "Movimentos regulares de baixa velocidade - sem pausas ou pausas infrequentes", [8,4,4]],
    ["Movimentos de velocidade normal", "Movimentos regulares de velocidade normal; com pausas", [10,4,4]],
    ["Movimentos de velocidade normal", "Movimentos regulares de velocidade normal - sem pausas ou pausas infrequentes", [12,6,6]],
    ["Movimentos de alta velocidade", "Movimentos regulares rápidos; com pausas", [14,6,6]],
    ["Movimentos de alta velocidade", "Movimentos regulares rápidos; sem pausas ou pausas infrequentes", [16,8,8]],
    ["Movimentos de alta velocidade", "Movimentos muito rápidos; demanda de trabalho contínua", [18,10,10]],
    ["Movimentos de alta velocidade", "Dificuldade de manter o ritmo ou de vencer a demanda de produção", [20,10,10]]
  ],
  FF_cols: ["Frequência > 20 por minuto", "Frequência ≥ 8 por minuto", "Frequência < 8 por minuto"],
  FF: [
    ["Supra-máximo: extremo ou feito aos arrancos", [50,50,50]],
    ["Muito intenso: mudança na expressão facial", [50,40,30]],
    ["Intenso: usa tronco, ombro e outros agrupamentos musculares", [30,20,16]],
    ["Moderado: nítido esforço, não caracterizado nos itens anteriores", [20,14,10]],
    ["Leve: algum esforço, pouco detectável", [6,6,4]],
    ["Nenhum esforço", [0,0,0]]
  ],
  // FPM: faixas de carga (peso kg × distância m × vezes n/h) -> desconto %
  FPM_lim: [25, 62, 125, 250, 500, 750, 1125, 2250],
  FPM_A: [0, 0, 4, 6, 8, 10, 14, 20, 20],      // padrão
  FPM_B: [0, 6, 10, 16, 20, 24, 28, 28, 28],   // "sentado ou de pé com postura forçada da coluna"
  // FPD: postura em desvio. valor × multiplicador do tempo; resultado = máximo
  FPD_tempo: [["Até 25% do tempo", 0.5], ["De 25% a 50% do tempo", 0.75], ["Acima de 50% do tempo", 1]],
  FPD: [
    ["Pescoço", [
      ["Pescoço extensão moderada","pescoco-extensao-moderada.JPG",10],["Pescoço desvio nítido extensão","pescoco-desvio-nitido-extensao.JPG",20],
      ["Pescoço flexão moderada","pescoco-flexao-moderada.JPG",10],["Pescoço desvio nítido flexão","pescoco-desvio-nitido-flexao.JPG",20],
      ["Pescoço rotação moderada","pescoco-rotacao-moderada.JPG",10],["Pescoço desvio nítido rotação","pescoco-desvio-nitido-rotacao.JPG",20],
      ["Pescoço inclinação moderada","pescoco-inclinacao-moderada.JPG",10],["Pescoço desvio nítido inclinação","pescoco-desvio-nitido-inclinacao.JPG",20]]],
    ["Coluna", [
      ["Coluna flexão moderada","coluna-flexao-moderada.JPG",10],["Coluna desvio nítido flexão","coluna-desvio-nitido-flexao.JPG",20],
      ["Coluna inclinação moderada","coluna-inclinacao-moderada.JPG",10],["Coluna desvio nítido inclinação lateral","coluna-desvio-nitido-inclinacao-lateral.JPG",20],
      ["Coluna torção moderada","coluna-torcao-moderada.JPG",10],["Coluna desvio nítido torção","coluna-desvio-nitido-torcao.JPG",20]]],
    ["Braço/Ombro", [
      ["Braço abdução moderada","braco-abducao-moderada.JPG",10],["Braço flexão moderada","braco-flexao-moderada.JPG",10],
      ["Ombro desvio nítido abdução","ombro-desvio-nitido-abducao.JPG",20],["Ombro desvio nítido flexão","ombro-desvio-nitido-flexao.JPG",20]]],
    ["Mão/Punho", [
      ["Mão flexão moderada","mao-flexao-moderada.JPG",10],["Punho desvio nítido flexão","punho-desvio-nitido-flexao.JPG",20],
      ["Mão extensão moderada","mao-extensao-moderada.JPG",10],["Punho desvio nítido extensão","punho-desvio-nitido-extensao.JPG",20],
      ["Mão desvio ulnar moderado","mao-desvio-ulnar-moderado.JPG",10],["Punho desvio ulnar nítido","punho-desvio-ulnar-nitido.JPG",20]]]
  ],
  // FEE: esforço estático; resultado = máximo. Colunas: >90%, 71–90%, 51–70% da jornada ou ciclo
  FEE_cols: ["Acima de 90% da jornada ou ciclo", "De 71% a 90% da jornada ou ciclo", "De 51% a 70% da jornada ou ciclo"],
  FEE: [
    ["Corpo mantido fora do eixo vertical","corpo-mantido-fora-do-eixo-vertical.png",[40,28,20]],
    ["Tronco mantido torcido","tronco-mantido-torcido.png",[20,14,10]],
    ["Pescoço mantido inclinado ou torcido em desvio fixo (moderado)","pescoco-mantido-inclinado-ou-torcido-em-desvio-fixo.png",[10,6,4]],
    ["Pescoço mantido inclinado ou torcido em desvio fixo (nítido)","pescoco-mantido-inclinado-ou-torcido-em-desvio-fixo.png",[20,10,6]],
    ["Pescoço mantido estendido ou fletido em desvio fixo (moderado)","pescoco-mantido-estendido-ou-fletido-em-desvio-fixo.png",[4,2,2]],
    ["Pescoço mantido estendido ou fletido em desvio fixo (nítido)","pescoco-mantido-estendido-ou-fletido-em-desvio-fixo.png",[20,10,6]],
    ["Sentado estático","sentado-estatico.png",[10,6,4]],
    ["Acuidade visual intensa para perto","acuidade-visual-intensa-para-perto.png",[20,14,10]],
    ["Trabalho sentado, posto informatizado (boas condições ergonômicas)","trabalho-sentado-posto-de-trabalho-informatizado.png",[8,4,2]],
    ["Trabalho sentado, posto informatizado (condições medianas ou ruins)","trabalho-sentado-posto-de-trabalho-informatizado.png",[20,14,10]],
    ["Trabalho mantido acima do nível dos ombros","trabalho-mantido-acima-do-nivel-dos-ombros.png",[20,14,10]],
    ["Braços suspensos sem movimentação","braco-suspensos-sem-movimentacao.png",[20,14,10]],
    ["Antebraços suspensos sem movimentação","antebracos-suspensos-sem-movimentacao.png",[4,2,0]],
    ["Sustentação de cargas","sustentacao-de-cargas.png",[20,14,10]],
    ["Contração estática com alta carga mental","contracao-esstatica-alta-carga-mental.png",[20,14,10]]
  ],
  FCM: [
    "Pressão de tempo constante","Alta concentração mental constante",
    "Operação crítica na posição de trabalho com alto impacto na qualidade do produto ou na segurança das pessoas",
    "Posição estrangulada, gargalo","Operação com risco significativo de acidente pessoal","Atendimento de reclamações",
    "Necessidade de atualização constante quanto ao tipo de serviço","Esforço mental constante visando superar dificuldades tecnológicas",
    "Ter que fazer montagem com o material em movimento","Pressão de fila","Iluminação inadequada e necessidade de perceber detalhes"
  ],
  // FPB: informativo no app (não entra na soma da TOM; gera alertas)
  FPB: [
    ["Alternado, sentado e de pé", 0],
    ["De pé, tronco na vertical, apoiado em banco de apoio das nádegas – sem tapete", 10],
    ["De pé, tronco na vertical, apoiado em banco de apoio das nádegas – com tapete", 6],
    ["De pé, tronco na vertical, parado ou andando pouco, sem refeição – sem tapete", 22],
    ["De pé, tronco na vertical, parado ou andando pouco, sem refeição – com tapete", 18],
    ["De pé, tronco na vertical, parado ou andando pouco, com refeição – sem tapete", 20],
    ["De pé, tronco na vertical, parado ou andando pouco, com refeição – com tapete", 16],
    ["De pé, tronco encurvado", 40],
    ["Sentado, bem sentado", 10], ["Sentado, mal sentado", 20],
    ["Andando, sem impedimento", 10], ["Andando, com impedimento", 28]
  ],
  PONDERACAO: [["Predomínio de mecanismos de regulação (+5)", 5], ["Equivalência graus de dificuldade/mecanismos de regulação", 0], ["Predomínio de graus de dificuldade (−5)", -5]],
  PAUSAS: ["Tempo de refeição remunerado","Banheiro","Ginástica","Café","Tempos de Recuperação de fadiga","Outras"],
  // Faixas de TOR − TOM
  T: {
    ok: "Nesta condição de trabalho é pouco provável a ocorrência de desconforto, dificuldade ou fadiga.",
    ok2: "Nesta condição de trabalho é pouco provável a ocorrência de desconforto, dificuldade ou fadiga.\nPode ser estudada alguma forma de aumentar a ocupação do trabalhador de forma a se otimizar a produtividade.",
    b1: "A taxa de ocupação real está um pouco acima do adequado. Assim, é provável haver queixas de desconforto, dificuldade e fadiga, bem como dolorimento. Procure ajustar a TOR de forma que se torne menor que a TOM (ou igual) e resolva as dificuldades existentes.",
    b2: "Sobrecarga de trabalho de baixo grau. É possível haver queixas de desconforto, dificuldade e fadiga, especialmente entre pessoas mais susceptíveis, ou numa variação de tipo de produção, comum em empresas; ou quando não tiver sido adicionado o percentual de imprevisibilidade ao tempo básico.\nCabe à Medicina do Trabalho manter atenção sobre os trabalhadores.\nObservação: O percentual de 3% dedicado à imprevisibilidade (unavoidable delays) deve ser considerado como porcentagem adicionada ao tempo básico, pois se refere a pequenas interrupções que não podem ser previstas. Uma boa prescrição de trabalho deve considerar esse percentual, pois as imprevisibilidades durante o trabalho, na grande maioria das tarefas, de fato ocorrem.",
    b3: "Organização do trabalho desajustada. É provável haver queixas de desconforto, dificuldade, fadiga, bem como dor e até mesmo afastamento. Tomar medidas para melhorar a engenharia do posto de trabalho; instituir rodízio com tarefas diferentes ou instituir os tempos de recuperação de fadiga necessários.",
    b4: "Organização do trabalho muito desajustada. É provável haver queixas de desconforto, dificuldade, fadiga, bem como dor e até mesmo afastamento. Tomar medidas urgentes para melhorar a engenharia do posto de trabalho; instituir rodízio com tarefas diferentes ou instituir as pausas necessárias.",
    b5: "Organização do trabalho extremamente desajustada. É provável haver queixas de desconforto, dificuldade, fadiga, bem como dor, afastamento e até lesões importantes. Verifique quais foram os fatores mais críticos. Tomar medidas urgentes para melhorar a engenharia do posto de trabalho; instituir com urgência o rodízio com tarefas diferentes; instituir os tempos de recuperação de fadiga necessários."
  },
  ALERTAS: {
    cab: "Restrição por conta de exigência intensa:",
    pernas: "Deve ser estudada alguma forma de reduzir o desconforto relacionado à existência de postura fatigante para as pernas/coluna durante a jornada de trabalho.",
    eng: "Devem ser instituídas melhorias de engenharia visando a redução do esforço:",
    FR: "Fator Repetitividade: Altíssima repetitividade.",
    FF: "Fator Força: Esforços muito intensos.",
    FPM: "Fator Peso Movimentado: Levantamento de cargas acima dos limites aceitáveis.",
    FEE: "Fator Esforço Estático: Corpo mantido fora do eixo vertical.",
    FPB: "Fator Postura Básica: Corpo mantido fora do eixo vertical."
  }
};
