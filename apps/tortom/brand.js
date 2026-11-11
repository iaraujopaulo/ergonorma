/* Identidade visual: símbolo, logotipo e régua de resultado (SVG inline, sem imagens) */
(function () {
  "use strict";

  // Símbolo: um anel (TOR, o que é real) cruzado com um disco cheio (TOM, o máximo permitido).
  // A interseção é a folga entre os dois.
  function mark(h) {
    return '<svg class="mk" viewBox="0 0 88 56" height="' + (h || 40) + '" role="img" aria-label="Símbolo TOR-TOM">' +
      '<defs><clipPath id="mkc"><circle cx="28" cy="28" r="22.5"/></clipPath></defs>' +
      '<circle cx="60" cy="28" r="22.5" fill="var(--mk-b)"/>' +
      '<circle cx="60" cy="28" r="22.5" fill="var(--mk-c)" clip-path="url(#mkc)"/>' +
      '<circle cx="28" cy="28" r="20" fill="none" stroke="var(--mk-a)" stroke-width="5"/>' +
      '</svg>';
  }

  // Logotipo desenhado com formas geométricas: TOR com "O" vazado, TOM com "O" cheio.
  function word(h) {
    var sw = 9;
    return '<svg class="wm" viewBox="0 0 296 56" height="' + (h || 28) + '" role="img" aria-label="TOR-TOM">' +
      '<g fill="none" stroke="var(--wm-a)" stroke-width="' + sw + '" stroke-linejoin="miter">' +
        '<path d="M0 4.5H36M18 4.5V56"/>' +
        '<rect x="50.5" y="4.5" width="27" height="47" rx="13.5"/>' +
        '<path d="M96.5 56V4.5H111A11.5 11.5 0 0 1 111 27.5H96.5M109 27.5L124 56"/>' +
      '</g>' +
      '<path d="M158 0L141 56" stroke="var(--wm-b)" stroke-width="6" fill="none"/>' +
      '<g fill="none" stroke="var(--wm-b)" stroke-width="' + sw + '" stroke-linejoin="bevel">' +
        '<path d="M168 4.5H204M186 4.5V56"/>' +
        '<path d="M260.5 56V4.5L274 33L287.5 4.5V56"/>' +
      '</g>' +
      '<rect x="214" y="0" width="36" height="56" rx="18" fill="var(--wm-b)"/>' +
      '</svg>';
  }

  // Régua de resultado: escala de -20 a +20 (TOR menos TOM) com marcador deslizante.
  function regua(d, rotulo) {
    var X0 = 14, W = 292;
    function px(v) { return X0 + (Math.max(-20, Math.min(20, v)) + 20) / 40 * W; }
    var zonas = [[-20, 0, "#1E9E6A"], [0, 5, "#F2B705"], [5, 15, "#D93A3A"], [15, 20, "#7B3FD1"]];
    var s = '<svg class="regua" viewBox="0 0 320 124" role="img" aria-label="Régua de resultado: ' + rotulo + '">' +
      '<defs><clipPath id="rgc"><rect x="' + X0 + '" y="58" width="' + W + '" height="20" rx="10"/></clipPath></defs>' +
      '<g clip-path="url(#rgc)">';
    zonas.forEach(function (z) {
      s += '<rect x="' + px(z[0]) + '" y="58" width="' + (px(z[1]) - px(z[0])) + '" height="20" fill="' + z[2] + '"/>';
    });
    s += '</g>';
    [-20, -15, -10, -5, 0, 5, 10, 15, 20].forEach(function (v) {
      var big = v % 10 === 0 || v === 5 || v === 15;
      s += '<line x1="' + px(v) + '" y1="84" x2="' + px(v) + '" y2="' + (big ? 94 : 90) + '" stroke="var(--tinta)" stroke-width="1.5"/>';
      if (big) s += '<text x="' + px(v) + '" y="108" text-anchor="middle" class="rg-n">' + (v > 0 ? "+" + v : v) + '</text>';
    });
    var x = px(d), txt = (d > 0 ? "+" : "") + (Math.round(d * 10) / 10).toFixed(1).replace(".", ","), bw = 14 + txt.length * 9;
    var bx = Math.max(2, Math.min(318 - bw, x - bw / 2));
    s += '<line x1="' + x + '" y1="38" x2="' + x + '" y2="86" stroke="var(--tinta)" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="' + bx + '" y="6" width="' + bw + '" height="30" rx="8" fill="var(--tinta)"/>' +
      '<path d="M' + (x - 6) + ' 35L' + x + ' 43L' + (x + 6) + ' 35Z" fill="var(--tinta)"/>' +
      '<text x="' + (bx + bw / 2) + '" y="27" text-anchor="middle" class="rg-v">' + txt + '</text></svg>';
    return s;
  }

  window.BRAND = { mark: mark, word: word, regua: regua };
})();
