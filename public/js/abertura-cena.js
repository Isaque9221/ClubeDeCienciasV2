(function () {
  "use strict";

  var tela = document.getElementById("abertura");
  var controle = window.__abertura;
  if (!tela || !controle || document.documentElement.classList.contains("sem-abertura")) return;

  var gsap = window.gsap;
  var SplitText = window.SplitText;
  var DrawSVGPlugin = window.DrawSVGPlugin;
  var ScrambleTextPlugin = window.ScrambleTextPlugin;

  ["gsap", "SplitText", "DrawSVGPlugin", "ScrambleTextPlugin"].forEach(function (nome) {
    try {
      delete window[nome];
    } catch {}
  });

  var canvas = tela.querySelector(".ab-estrelas");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (!gsap || !SplitText || !DrawSVGPlugin || !ScrambleTextPlugin || !ctx) {
    tela.classList.add("abertura--estatica");
    return;
  }

  gsap.registerPlugin(SplitText, DrawSVGPlugin, ScrambleTextPlugin);

  var reduzido = false;
  try {
    reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {}

  function um(seletor) {
    return tela.querySelector(seletor);
  }

  function todos(seletor) {
    return Array.prototype.slice.call(tela.querySelectorAll(seletor));
  }

  var VOLTA = Math.PI * 2;
  var GRAU = Math.PI / 180;
  var GIRO_FINAL = 70;
  var SOMBRA_DO_LOGO = "drop-shadow(0px 0px 14px rgba(250, 204, 21, 0.28))";
  var temConica = typeof ctx.createConicGradient === "function";

  var CORES = [
    { peso: 0.36, rgb: "255,251,235" },
    { peso: 0.22, rgb: "254,243,199" },
    { peso: 0.15, rgb: "253,230,138" },
    { peso: 0.1, rgb: "250,204,21" },
    { peso: 0.08, rgb: "251,146,60" },
    { peso: 0.09, rgb: "191,219,254" },
  ];

  var ceu = { acender: 0, giro: 0, rastro: 1, cabeca: 1 };
  var estrelas = [];
  var largura = 0;
  var altura = 0;
  var densidade = 1;
  var raioMaximo = 1;
  var polo = { x: 0, y: 0 };

  var tarjas = todos(".ab-tarja");
  var via = um(".ab-via-lactea");
  var cadente = um(".ab-cadente");
  var aurora = um(".ab-aurora");
  var horizonteLonge = um(".ab-horizonte--longe");
  var horizontePerto = um(".ab-horizonte--perto");
  var poeira = um(".ab-poeira");
  var poloFlare = um(".ab-polo-flare");
  var poloBrilho = um(".ab-polo-brilho");
  var poloRotulo = um(".ab-polo-rotulo");
  var poloGuia = um(".ab-polo-guia path");
  var poloNome = um(".ab-polo-nome");
  var poloNota = um(".ab-polo-nota");
  var caixaDasPalavras = um(".ab-palavras");
  var local = um(".ab-local");
  var localNome = um(".ab-local-nome");
  var localSub = um(".ab-local-sub");
  var palco = um(".ab-palco");
  var medalhao = um(".ab-medalhao");
  var anelLinha = um(".ab-anel-linha");
  var anelMarcas = um(".ab-anel-marcas");
  var anelCardeais = um(".ab-anel-cardeais");
  var logo = um(".ab-logo");
  var aura = um(".ab-aura");
  var ondas = todos(".ab-onda");
  var titulo = um(".ab-titulo");
  var sigla = um(".ab-sigla");
  var traco = um(".ab-traco");
  var legenda = um(".ab-legenda");
  var cantos = todos(".ab-canto");
  var textosDoHud = todos(".ab-hud-texto");
  var relogio = um(".ab-hud--cd");
  var pular = um(".ab-pular");
  var iris = um(".ab-iris");
  var irisAnel = um(".ab-iris-anel");

  function sortearCor() {
    var sorte = Math.random();
    var soma = 0;
    for (var i = 0; i < CORES.length; i++) {
      soma += CORES[i].peso;
      if (sorte <= soma) return CORES[i].rgb;
    }
    return CORES[0].rgb;
  }

  function medir() {
    var caixa = tela.getBoundingClientRect();
    var centro = medalhao.getBoundingClientRect();
    largura = caixa.width;
    altura = caixa.height;
    densidade = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(largura * densidade));
    canvas.height = Math.max(1, Math.round(altura * densidade));
    polo.x = centro.left - caixa.left + centro.width / 2;
    polo.y = centro.top - caixa.top + centro.height / 2;
    raioMaximo = Math.hypot(Math.max(polo.x, largura - polo.x), Math.max(polo.y, altura - polo.y));
    tela.style.setProperty("--polo-x", polo.x.toFixed(1) + "px");
    tela.style.setProperty("--polo-y", polo.y.toFixed(1) + "px");
  }

  function criarEstrelas() {
    var total = Math.round(Math.min(620, Math.max(200, (largura * altura) / 2300)));
    for (var i = 0; i < total; i++) {
      var forca = Math.pow(Math.random(), 3);
      var distancia = Math.sqrt(Math.random());
      estrelas.push({
        raio: 0.02 + distancia * 0.98,
        angulo: Math.random() * VOLTA,
        espessura: 0.45 + forca * 1.6,
        brilho: 0.24 + forca * 0.7,
        cor: sortearCor(),
        limiar: 0.04 + distancia * 0.76 + Math.random() * 0.14,
        fase: Math.random() * VOLTA,
        ritmo: 0.8 + Math.random() * 2.2,
        forte: forca > 0.7,
      });
    }
  }

  function desenhar() {
    var agora = performance.now() / 1000;
    ctx.setTransform(densidade, 0, 0, densidade, 0, 0);
    ctx.clearRect(0, 0, largura, altura);
    if (ceu.acender <= 0) return;

    var giro = ceu.giro * GRAU;
    var fracao = giro / VOLTA;
    var comRastro = giro > 0.002 && ceu.rastro > 0.01;
    ctx.lineCap = "round";

    for (var i = 0; i < estrelas.length; i++) {
      var estrela = estrelas[i];
      var surgiu = (ceu.acender - estrela.limiar) / 0.1;
      if (surgiu <= 0) continue;
      if (surgiu > 1) surgiu = 1;

      var raio = estrela.raio * raioMaximo;
      var luz =
        surgiu * estrela.brilho * (0.78 + 0.22 * Math.sin(agora * estrela.ritmo + estrela.fase));
      var fim = estrela.angulo + giro;

      if (comRastro) {
        if (temConica) {
          var gradiente = ctx.createConicGradient(estrela.angulo, polo.x, polo.y);
          gradiente.addColorStop(0, "rgba(" + estrela.cor + ",0)");
          gradiente.addColorStop(
            fracao,
            "rgba(" + estrela.cor + "," + (luz * ceu.rastro).toFixed(3) + ")"
          );
          gradiente.addColorStop(Math.min(1, fracao + 0.002), "rgba(" + estrela.cor + ",0)");
          ctx.strokeStyle = gradiente;
        } else {
          ctx.strokeStyle =
            "rgba(" + estrela.cor + "," + (luz * ceu.rastro * 0.55).toFixed(3) + ")";
        }
        ctx.lineWidth = estrela.espessura;
        ctx.beginPath();
        ctx.arc(polo.x, polo.y, raio, estrela.angulo, fim);
        ctx.stroke();
      }

      var cabeca = luz * ceu.cabeca;
      if (cabeca < 0.01) continue;

      var x = polo.x + raio * Math.cos(fim);
      var y = polo.y + raio * Math.sin(fim);

      if (estrela.forte) {
        ctx.fillStyle = "rgba(" + estrela.cor + "," + (cabeca * 0.18).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(x, y, estrela.espessura * 3.4, 0, VOLTA);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(" + estrela.cor + "," + cabeca.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(x, y, estrela.espessura * 0.72 + 0.25, 0, VOLTA);
      ctx.fill();
    }
  }

  function dois(numero) {
    return (numero < 10 ? "0" : "") + numero;
  }

  function atualizarRelogio() {
    var segundos = Math.round((ceu.giro / 15) * 3600);
    relogio.textContent =
      dois(Math.floor(segundos / 3600)) +
      ":" +
      dois(Math.floor((segundos % 3600) / 60)) +
      ":" +
      dois(segundos % 60);
  }

  function esvaziar(elemento) {
    var texto = elemento.textContent;
    elemento.textContent = "";
    return texto;
  }

  function alturaDaTarja() {
    return parseFloat(getComputedStyle(tela).getPropertyValue("--tarja")) || 0.2;
  }

  medir();
  criarEstrelas();

  var palavras = todos(".ab-palavra").map(function (elemento) {
    return {
      elemento: elemento,
      letras: SplitText.create(elemento.querySelector(".ab-palavra-texto"), {
        type: "chars",
        mask: "chars",
      }).chars,
      indice: elemento.querySelector(".ab-palavra-indice"),
      traco: elemento.querySelector(".ab-palavra-traco"),
      nota: elemento.querySelector(".ab-palavra-nota"),
    };
  });
  var letrasDoTitulo = SplitText.create(titulo, { type: "chars", mask: "chars" }).chars;
  var letrasDoLocal = SplitText.create(localNome, { type: "chars" }).chars;

  var textoDoPolo = esvaziar(poloNome);
  var notaDoPolo = esvaziar(poloNota);
  var textoDoLocal = esvaziar(localSub);
  var textosIniciaisDoHud = textosDoHud.map(function (elemento) {
    return elemento === relogio ? relogio.textContent : esvaziar(elemento);
  });
  var espacoDaSigla = getComputedStyle(sigla).letterSpacing;

  gsap.set(tarjas, { scaleY: 1 });
  gsap.set(poloBrilho, { scale: 0.2, rotation: -30 });
  gsap.set(poloFlare, { scaleX: 0.1 });
  gsap.set(horizonteLonge, { yPercent: 45 });
  gsap.set(horizontePerto, { yPercent: 80 });
  gsap.set(aurora, { yPercent: 22 });
  gsap.set(cadente, { rotation: -26.57 });
  gsap.set(palco, { scale: 1.06 });
  gsap.set(anelLinha, { drawSVG: "0%" });
  gsap.set(anelMarcas, { scale: 0.86, svgOrigin: "100 100" });
  gsap.set(logo, { scale: 0.72, filter: "blur(14px) " + SOMBRA_DO_LOGO });
  gsap.set(letrasDoTitulo, { yPercent: 115 });
  gsap.set(traco, { scaleX: 0 });

  var tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  tl.to(poloBrilho, { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: "expo.out" }, 0.15)
    .to(poloFlare, { opacity: 1, scaleX: 1, duration: 1.2, ease: "expo.out" }, 0.2)
    .to(tarjas, { scaleY: alturaDaTarja, duration: 1.4, ease: "expo.inOut" }, 0.35)
    .to(poloRotulo, { opacity: 1, duration: 0.2, ease: "none" }, 0.9)
    .fromTo(
      poloGuia,
      { drawSVG: "0%" },
      { drawSVG: "100%", duration: 0.9, ease: "power2.inOut" },
      0.9
    )
    .to(
      poloNome,
      { scrambleText: { text: textoDoPolo, chars: "αβγδσλμπ0123456789", speed: 0.5 }, duration: 1 },
      1.2
    )
    .to(
      poloNota,
      { scrambleText: { text: notaDoPolo, chars: "lowerCase", speed: 0.5 }, duration: 1 },
      1.4
    )
    .to(ceu, { acender: 1, duration: 3.6, ease: "power1.inOut" }, 1)
    .to(via, { opacity: 1, duration: 2.8, ease: "power1.out" }, 1.4)
    .to(poloFlare, { opacity: 0.3, scaleX: 0.72, duration: 1.6, ease: "power2.inOut" }, 1.5)
    .to(poloBrilho, { opacity: 0.85, scale: 0.6, duration: 1.6, ease: "power2.inOut" }, 1.5)
    .to(cantos, { opacity: 1, duration: 0.5, stagger: 0.07, ease: "power1.out" }, 1.8)
    .to(textosDoHud, { opacity: 1, duration: 0.3, stagger: 0.1, ease: "none" }, 2)
    .to(pular, { opacity: 1, duration: 0.8, ease: "power1.out" }, 2.4)
    .to(tarjas, { scaleY: 0, duration: 1, ease: "expo.inOut" }, 3.3)
    .to(poloRotulo, { opacity: 0, y: -6, duration: 0.6, ease: "power2.in" }, 3.5);

  textosDoHud.forEach(function (elemento, i) {
    if (elemento === relogio) return;
    tl.to(
      elemento,
      {
        scrambleText: {
          text: textosIniciaisDoHud[i],
          chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          speed: 0.6,
        },
        duration: 1.1,
        ease: "none",
      },
      2 + i * 0.15
    );
  });

  tl.to(
    ceu,
    { giro: GIRO_FINAL, duration: 12.6, ease: "sine.inOut", onUpdate: atualizarRelogio },
    3.4
  )
    .to(poloBrilho, { opacity: 0.3, scale: 0.4, duration: 1.4, ease: "power2.inOut" }, 3.6)
    .to(poloFlare, { opacity: 0, scaleX: 0.5, duration: 1.4, ease: "power2.inOut" }, 3.6)
    .to(caixaDasPalavras, { opacity: 1, duration: 0.8, ease: "power1.out" }, 3.7);

  palavras.forEach(function (palavra, i) {
    var inicio = 4 + i * 2.55;
    var saida = inicio + 1.85;
    tl.set(palavra.elemento, { opacity: 1 }, inicio)
      .fromTo(
        palavra.letras,
        { yPercent: 115 },
        { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.035 },
        inicio
      )
      .fromTo(
        palavra.indice,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6 },
        inicio + 0.05
      )
      .fromTo(
        palavra.traco,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "expo.out" },
        inicio + 0.25
      )
      .fromTo(
        palavra.nota,
        { opacity: 0, y: 10, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
        inicio + 0.35
      )
      .to(
        palavra.letras,
        { yPercent: -115, duration: 0.5, ease: "power3.in", stagger: 0.02 },
        saida
      )
      .to(
        [palavra.indice, palavra.nota],
        { opacity: 0, y: -8, duration: 0.4, ease: "power2.in" },
        saida
      )
      .to(palavra.traco, { scaleX: 0, duration: 0.45, ease: "power3.in" }, saida)
      .set(palavra.elemento, { opacity: 0 }, inicio + 2.55);
  });

  tl.to(caixaDasPalavras, { opacity: 0, duration: 0.7, ease: "power1.in" }, 13.6)
    .to(horizonteLonge, { opacity: 1, duration: 0.8, ease: "none" }, 13.4)
    .to(horizonteLonge, { yPercent: 0, duration: 2.4, ease: "expo.out" }, 13.4)
    .to(horizontePerto, { opacity: 1, duration: 0.6, ease: "none" }, 13.55)
    .to(horizontePerto, { yPercent: 0, duration: 2.4, ease: "expo.out" }, 13.55)
    .to(aurora, { opacity: 1, yPercent: 0, duration: 2.6, ease: "power2.out" }, 13.6)
    .to(poeira, { opacity: 1, duration: 1.2, ease: "none" }, 14)
    .to(local, { opacity: 1, duration: 0.01, ease: "none" }, 14.1)
    .fromTo(
      letrasDoLocal,
      { opacity: 0, y: 18, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        stagger: { each: 0.035, from: "center" },
      },
      14.1
    )
    .to(
      localSub,
      {
        scrambleText: { text: textoDoLocal, chars: "upperCase", speed: 0.5 },
        duration: 1,
        ease: "none",
      },
      14.5
    )
    .to(cadente, { opacity: 1, duration: 0.12, ease: "none" }, 14.6)
    .to(cadente, { x: -300, y: 150, duration: 0.95, ease: "power1.in" }, 14.6)
    .to(cadente, { opacity: 0, duration: 0.45, ease: "power1.in" }, 15.1)
    .to(
      letrasDoLocal,
      {
        opacity: 0,
        y: -12,
        filter: "blur(6px)",
        duration: 0.5,
        stagger: { each: 0.02, from: "edges" },
        ease: "power2.in",
      },
      15.9
    )
    .to(localSub, { opacity: 0, duration: 0.4, ease: "power2.in" }, 15.9);

  tl.to(ceu, { rastro: 0.42, cabeca: 0.8, duration: 1.8, ease: "power2.inOut" }, 15.8)
    .to(palco, { opacity: 1, duration: 0.6, ease: "none" }, 15.9)
    .to(palco, { scale: 1, duration: 3.6, ease: "expo.out" }, 16.1)
    .to(poloBrilho, { opacity: 1, scale: 1.4, duration: 0.35, ease: "power2.out" }, 16.1)
    .to(poloBrilho, { opacity: 0, scale: 0.8, duration: 0.9, ease: "power2.in" }, 16.45)
    .to(poloFlare, { opacity: 1, scaleX: 1.1, duration: 0.3, ease: "power2.out" }, 16.1)
    .to(poloFlare, { opacity: 0, scaleX: 1.3, duration: 1, ease: "power2.in" }, 16.4)
    .to(anelLinha, { drawSVG: "100%", duration: 1.3, ease: "expo.inOut" }, 16.2)
    .to(
      logo,
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px) " + SOMBRA_DO_LOGO,
        duration: 1.2,
        ease: "expo.out",
      },
      16.45
    )
    .to(anelMarcas, { opacity: 1, scale: 1, duration: 1, ease: "expo.out" }, 16.6)
    .to(aura, { opacity: 1, duration: 1.4, ease: "power1.out" }, 16.6)
    .to(anelCardeais, { opacity: 1, duration: 0.5, ease: "none" }, 17);

  ondas.forEach(function (onda, i) {
    var inicio = 16.55 + i * 0.28;
    tl.fromTo(onda, { scale: 0.7 }, { scale: 2.7, duration: 1.7, ease: "power2.out" }, inicio)
      .fromTo(onda, { opacity: 0 }, { opacity: 0.9, duration: 0.16, ease: "none" }, inicio)
      .to(onda, { opacity: 0, duration: 1.3, ease: "power1.out" }, inicio + 0.18);
  });

  tl.to(
    letrasDoTitulo,
    { yPercent: 0, duration: 1, ease: "expo.out", stagger: { each: 0.035, from: "center" } },
    16.9
  )
    .fromTo(
      sigla,
      { opacity: 0, letterSpacing: "1.1em", marginRight: "-1.1em" },
      {
        opacity: 1,
        letterSpacing: espacoDaSigla,
        marginRight: "-" + espacoDaSigla,
        duration: 1.3,
        ease: "expo.out",
        clearProps: "letterSpacing,marginRight",
      },
      17.4
    )
    .to(traco, { scaleX: 1, duration: 1, ease: "expo.inOut" }, 17.7)
    .fromTo(legenda, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8 }, 18.1)
    .to(
      letrasDoTitulo,
      {
        color: "#fde047",
        duration: 0.25,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
        stagger: 0.04,
      },
      18.9
    );

  function aplicarIris(raio) {
    var mascara =
      "radial-gradient(circle at " +
      polo.x.toFixed(1) +
      "px " +
      polo.y.toFixed(1) +
      "px, transparent " +
      raio.toFixed(1) +
      "px, #000 " +
      (raio + 30).toFixed(1) +
      "px)";
    tela.style.webkitMaskImage = mascara;
    tela.style.maskImage = mascara;
    irisAnel.setAttribute("r", (raio + 24).toFixed(1));
  }

  function aoRedimensionar() {
    medir();
    if (reduzido) desenhar();
  }

  function limpar() {
    gsap.ticker.remove(desenhar);
    window.removeEventListener("resize", aoRedimensionar);
    tl.kill();
  }

  function sair() {
    tl.pause();

    if (reduzido) {
      gsap.to(tela, { opacity: 0, duration: 0.35, ease: "none", onComplete: limpar });
      return 380;
    }

    var abertura = { raio: 0 };
    irisAnel.setAttribute("cx", polo.x.toFixed(1));
    irisAnel.setAttribute("cy", polo.y.toFixed(1));

    var saida = gsap.timeline({ onComplete: limpar });
    saida
      .to(
        palco,
        { opacity: 0, scale: 1.12, filter: "blur(10px)", duration: 0.5, ease: "power2.in" },
        0
      )
      .to([pular, caixaDasPalavras, local], { opacity: 0, duration: 0.3, ease: "none" }, 0)
      .to(iris, { opacity: 1, duration: 0.15, ease: "none" }, 0.25)
      .to(
        abertura,
        {
          raio: raioMaximo + 80,
          duration: 1,
          ease: "power2.in",
          onUpdate: function () {
            aplicarIris(abertura.raio);
          },
        },
        0.25
      );

    return Math.round(saida.duration() * 1000) + 30;
  }

  window.addEventListener("resize", aoRedimensionar);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      aoRedimensionar();
    });
  }

  controle.registrar({ sair: sair });

  if (reduzido) {
    tl.progress(1);
    desenhar();
  } else {
    gsap.ticker.add(desenhar);
    tl.play();
  }
})();
