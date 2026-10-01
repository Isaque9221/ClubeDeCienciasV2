import { useEffect, useRef, type CSSProperties } from "react";
import { useInView } from "framer-motion";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { querMenosMovimento } from "@/compartilhado/utils/movimento";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

const VOLTA = Math.PI * 2;
const GRAU = Math.PI / 180;
const PASSO_DO_REDESENHO = 0.3 * GRAU;

const CORES_DA_NOITE = [
  { peso: 0.36, rgb: "255,251,235" },
  { peso: 0.22, rgb: "254,243,199" },
  { peso: 0.15, rgb: "253,230,138" },
  { peso: 0.1, rgb: "250,204,21" },
  { peso: 0.08, rgb: "251,146,60" },
  { peso: 0.09, rgb: "191,219,254" },
];

const CORES_DO_PAPEL = [
  { peso: 0.4, rgb: "122,79,6" },
  { peso: 0.25, rgb: "110,52,8" },
  { peso: 0.2, rgb: "87,83,78" },
  { peso: 0.15, rgb: "146,64,14" },
];

interface Estrela {
  raio: number;
  angulo: number;
  espessura: number;
  brilho: number;
  corDaNoite: string;
  corDoPapel: string;
  forte: boolean;
}

function escolherCor(paleta: typeof CORES_DA_NOITE, sorteio: number) {
  let soma = 0;
  for (const cor of paleta) {
    soma += cor.peso;
    if (sorteio <= soma) return cor.rgb;
  }
  return paleta[0].rgb;
}

function progressoDaSecao(elemento: HTMLElement) {
  const caixa = elemento.getBoundingClientRect();
  const altura = window.innerHeight || 1;
  return Math.min(1, Math.max(0, (altura - caixa.top) / (altura + caixa.height)));
}

function progressoDaPagina() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  return total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
}

interface CeuEmExposicaoProps {
  className?: string;
  polo?: [number, number];
  modo?: "secao" | "pagina";
  giro?: [number, number];
  quantidade?: number;
  intensidade?: number;
  nitidez?: number;
}

export function CeuEmExposicao({
  className = "",
  polo = [0.5, 0.45],
  modo = "secao",
  giro = [4, 64],
  quantidade = 1.8,
  intensidade = 1,
  nitidez = 1.5,
}: CeuEmExposicaoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poloX, poloY] = polo;
  const [giroInicial, giroFinal] = giro;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const temConica = typeof ctx.createConicGradient === "function";
    const estrelas: Estrela[] = [];
    let largura = 0;
    let altura = 0;
    let densidade = 1;
    let raioMaximo = 1;
    let centroX = 0;
    let centroY = 0;
    let visivel = false;
    let quadro = 0;
    let ultimoAngulo = -1;
    let ultimoTema = "";
    const parado = querMenosMovimento();

    const noEscuro = () =>
      !!canvas.closest('[data-tema="escuro"]') ||
      document.documentElement.dataset.esquema !== "claro";

    const medir = () => {
      const caixa = canvas.getBoundingClientRect();
      largura = caixa.width;
      altura = caixa.height;
      densidade = Math.min(window.devicePixelRatio || 1, nitidez);
      canvas.width = Math.max(1, Math.round(largura * densidade));
      canvas.height = Math.max(1, Math.round(altura * densidade));
      centroX = largura * poloX;
      centroY = altura * poloY;
      canvas.style.transformOrigin = `${centroX}px ${centroY}px`;
      raioMaximo = Math.hypot(
        Math.max(centroX, largura - centroX),
        Math.max(centroY, altura - centroY)
      );
      if (estrelas.length === 0) {
        const total = Math.round(
          Math.min(420, Math.max(60, ((largura * altura) / 10000) * quantidade))
        );
        for (let i = 0; i < total; i++) {
          const forca = Math.pow(Math.random(), 3);
          const sorteio = Math.random();
          estrelas.push({
            raio: 0.03 + Math.sqrt(Math.random()) * 0.97,
            angulo: Math.random() * VOLTA,
            espessura: 0.45 + forca * 1.5,
            brilho: 0.26 + forca * 0.7,
            corDaNoite: escolherCor(CORES_DA_NOITE, sorteio),
            corDoPapel: escolherCor(CORES_DO_PAPEL, sorteio),
            forte: forca > 0.7,
          });
        }
      }
    };

    const desenhar = () => {
      quadro = 0;
      if (!largura || !altura) return;
      const escuro = noEscuro();
      const forcaDoTema = (escuro ? 1 : 0.55) * intensidade;
      const progresso = parado
        ? 0.6
        : modo === "pagina"
          ? progressoDaPagina()
          : progressoDaSecao(canvas);
      const angulo = (giroInicial + (giroFinal - giroInicial) * progresso) * GRAU;
      const tema = escuro ? "noite" : "papel";
      if (Math.abs(angulo - ultimoAngulo) < PASSO_DO_REDESENHO && tema === ultimoTema) {
        canvas.style.transform = `rotate(${(angulo - ultimoAngulo).toFixed(5)}rad)`;
        return;
      }
      ultimoAngulo = angulo;
      ultimoTema = tema;
      canvas.style.transform = "";
      const fracao = angulo / VOLTA;

      ctx.setTransform(densidade, 0, 0, densidade, 0, 0);
      ctx.clearRect(0, 0, largura, altura);
      ctx.lineCap = "round";

      for (const estrela of estrelas) {
        const cor = escuro ? estrela.corDaNoite : estrela.corDoPapel;
        const raio = estrela.raio * raioMaximo;
        const luz = estrela.brilho * forcaDoTema;
        const fim = estrela.angulo + angulo;

        if (angulo > 0.002) {
          if (temConica) {
            const gradiente = ctx.createConicGradient(estrela.angulo, centroX, centroY);
            gradiente.addColorStop(0, `rgba(${cor},0)`);
            gradiente.addColorStop(fracao, `rgba(${cor},${(luz * 0.85).toFixed(3)})`);
            gradiente.addColorStop(Math.min(1, fracao + 0.002), `rgba(${cor},0)`);
            ctx.strokeStyle = gradiente;
          } else {
            ctx.strokeStyle = `rgba(${cor},${(luz * 0.45).toFixed(3)})`;
          }
          ctx.lineWidth = escuro ? estrela.espessura : estrela.espessura * 0.7;
          ctx.beginPath();
          ctx.arc(centroX, centroY, raio, estrela.angulo, fim);
          ctx.stroke();
        }

        const x = centroX + raio * Math.cos(fim);
        const y = centroY + raio * Math.sin(fim);

        if (escuro && estrela.forte) {
          ctx.fillStyle = `rgba(${cor},${(luz * 0.18).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, estrela.espessura * 3.2, 0, VOLTA);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${cor},${Math.min(1, luz).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, estrela.espessura * 0.7 + 0.2, 0, VOLTA);
        ctx.fill();
      }
    };

    const pedirDesenho = () => {
      if (!visivel || quadro) return;
      quadro = requestAnimationFrame(desenhar);
    };

    const aoRedimensionar = () => {
      medir();
      ultimoAngulo = -1;
      pedirDesenho();
    };

    medir();

    const observador = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      ultimoAngulo = -1;
      pedirDesenho();
    });
    observador.observe(canvas);

    const observadorDoTema = new MutationObserver(pedirDesenho);
    observadorDoTema.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-esquema"],
    });

    window.addEventListener("resize", aoRedimensionar);
    if (!parado) window.addEventListener("scroll", pedirDesenho, { passive: true });

    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
      observadorDoTema.disconnect();
      window.removeEventListener("resize", aoRedimensionar);
      window.removeEventListener("scroll", pedirDesenho);
    };
  }, [poloX, poloY, modo, giroInicial, giroFinal, quantidade, intensidade, nitidez]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-nao-imprimir=""
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

export function TextoEmCodigo({ texto, className = "" }: { texto: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const apareceu = useInView(ref, { once: true });

  const parado = querMenosMovimento();

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || !apareceu || parado) return;
    const animacao = gsap.to(elemento, {
      duration: Math.min(1.4, 0.5 + texto.length * 0.025),
      ease: "none",
      scrambleText: { text: texto, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", speed: 0.6 },
    });
    return () => {
      animacao.kill();
      elemento.textContent = texto;
    };
  }, [apareceu, parado, texto]);

  return (
    <span className={className}>
      <span className="sr-only">{texto}</span>
      <span
        key={texto}
        ref={ref}
        aria-hidden="true"
        style={{ visibility: apareceu || parado ? "visible" : "hidden" }}
      >
        {texto}
      </span>
    </span>
  );
}

interface VisorProps {
  className?: string;
  folga?: number;
  tamanho?: number;
}

export function Visor({ className = "", folga = 14, tamanho = 22 }: VisorProps) {
  const estilo = {
    "--visor-folga": `${folga}px`,
    "--visor-tamanho": `${tamanho}px`,
  } as CSSProperties;

  return (
    <div aria-hidden="true" className={`visor ${className}`} style={estilo}>
      <span className="visor__canto visor__canto--ce" />
      <span className="visor__canto visor__canto--cd" />
      <span className="visor__canto visor__canto--be" />
      <span className="visor__canto visor__canto--bd" />
    </div>
  );
}

export function FioDourado({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const apareceu = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-visivel={apareceu ? "" : undefined}
      className={`fio-dourado ${className}`}
    />
  );
}
