(function () {
  "use strict";

  var DURACAO_MINIMA = 20700;

  var DURACAO_DA_SAIDA = 650;

  var PACIENCIA_MAXIMA = 25000;

  var ESPERA_LONGA = 5000;

  try {
    var parametros = new URLSearchParams(window.location.search);
    if (parametros.has("previa")) {
      document.documentElement.classList.add("sem-abertura");
      return;
    }
  } catch {}

  var comecouEm = Date.now();
  var siteEstaPronto = false;
  var jaEstaSaindo = false;
  var podeSairAgora = false;
  var cena = null;

  function remover(tela) {
    if (tela.parentNode) tela.parentNode.removeChild(tela);
    document.documentElement.classList.add("sem-abertura");
  }

  function sair() {
    if (jaEstaSaindo) return;
    jaEstaSaindo = true;

    document.removeEventListener("pointerdown", aoInterromper);
    document.removeEventListener("keydown", aoInterromper);

    var tela = document.getElementById("abertura");
    if (!tela) return;

    var duracao = DURACAO_DA_SAIDA;
    if (cena) {
      try {
        duracao = cena.sair();
      } catch {
        cena = null;
      }
    }
    if (!cena) tela.classList.add("abertura--saindo");

    window.setTimeout(function () {
      remover(tela);
    }, duracao);
  }

  function tentarSair() {
    if (!siteEstaPronto) return;

    var jaPassou = Date.now() - comecouEm;
    var falta = podeSairAgora ? 0 : Math.max(0, DURACAO_MINIMA - jaPassou);

    if (falta === 0) sair();
    else window.setTimeout(sair, falta);
  }

  function marcarEspera() {
    if (siteEstaPronto || jaEstaSaindo) return;

    var tela = document.getElementById("abertura");
    if (!tela) return;

    tela.classList.add("abertura--esperando");
    window.setTimeout(function () {
      if (!jaEstaSaindo) tela.classList.add("abertura--demorando");
    }, ESPERA_LONGA);
  }

  window.__abertura = {
    siteMontado: function () {
      siteEstaPronto = true;
      tentarSair();
    },

    pular: function () {
      if (podeSairAgora || jaEstaSaindo) return;
      podeSairAgora = true;

      var tela = document.getElementById("abertura");
      if (tela) tela.classList.add("abertura--pulando");

      tentarSair();
    },

    registrar: function (novaCena) {
      cena = novaCena;
      comecouEm = Date.now();
      window.clearTimeout(esperaMarcada);
      esperaMarcada = window.setTimeout(marcarEspera, DURACAO_MINIMA);
    },
  };

  function aoInterromper() {
    window.__abertura.pular();
  }

  document.addEventListener("pointerdown", aoInterromper);
  document.addEventListener("keydown", aoInterromper);

  document.addEventListener("DOMContentLoaded", function () {
    if (cena || jaEstaSaindo) return;
    var tela = document.getElementById("abertura");
    if (tela) tela.classList.add("abertura--estatica");
  });

  var esperaMarcada = window.setTimeout(marcarEspera, DURACAO_MINIMA);

  window.setTimeout(function () {
    podeSairAgora = true;
    siteEstaPronto = true;
    tentarSair();
  }, PACIENCIA_MAXIMA);
})();
