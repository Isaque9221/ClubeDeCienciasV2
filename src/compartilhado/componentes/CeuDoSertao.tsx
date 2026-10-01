import { useEffect, useRef } from "react";
import { querMenosMovimento } from "@/compartilhado/utils/movimento";

const VOLTA = Math.PI * 2;
const AREA_DE_REFERENCIA = 2560 * 1440;

const CORES = [
  { peso: 0.42, rgb: "255,251,235" },
  { peso: 0.22, rgb: "254,243,199" },
  { peso: 0.14, rgb: "253,230,138" },
  { peso: 0.12, rgb: "219,234,254" },
  { peso: 0.1, rgb: "251,191,36" },
];

type Sorteio = () => number;

function sorteador(semente: number): Sorteio {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(sorte: Sorteio) {
  const u = Math.max(sorte(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(VOLTA * sorte());
}

function cor(sorte: Sorteio) {
  const valor = sorte();
  let soma = 0;
  for (const item of CORES) {
    soma += item.peso;
    if (valor <= soma) return item.rgb;
  }
  return CORES[0].rgb;
}

interface Ponto {
  x: number;
  y: number;
  raio: number;
  luz: number;
  cor: string;
}

interface Camada {
  deslocamento: number;
  estrelas: Ponto[];
  desenharExtras?: (ctx: CanvasRenderingContext2D, largura: number, altura: number) => void;
}

const BANDA = { x0: -0.1, y0: 0.82, x1: 1.1, y1: 0.12, largura: 0.075 };

function pontoNaBanda(sorte: Sorteio, espalhamento: number) {
  const t = sorte();
  const x = BANDA.x0 + (BANDA.x1 - BANDA.x0) * t;
  const y = BANDA.y0 + (BANDA.y1 - BANDA.y0) * t;
  const dx = BANDA.x1 - BANDA.x0;
  const dy = BANDA.y1 - BANDA.y0;
  const comprimento = Math.hypot(dx, dy);
  const desvio = normal(sorte) * BANDA.largura * espalhamento;
  return { x: x + (-dy / comprimento) * desvio, y: y + (dx / comprimento) * desvio, t };
}

function criarCamadas(): Camada[] {
  const sorte = sorteador(20250314);

  const distantes: Ponto[] = [];
  for (let i = 0; i < 900; i++) {
    distantes.push({
      x: sorte(),
      y: sorte(),
      raio: 0.25 + sorte() * 0.35,
      luz: 0.16 + sorte() * 0.32,
      cor: cor(sorte),
    });
  }
  for (let i = 0; i < 1800; i++) {
    const p = pontoNaBanda(sorte, 1);
    distantes.push({
      x: p.x,
      y: p.y,
      raio: 0.2 + sorte() * 0.3,
      luz: 0.08 + sorte() * 0.26,
      cor: cor(sorte),
    });
  }

  const nuvens = Array.from({ length: 26 }, () => {
    const p = pontoNaBanda(sorte, 0.55);
    return { x: p.x, y: p.y, raio: 0.06 + sorte() * 0.1, forca: 0.5 + sorte() * 0.5 };
  });
  const poeiras = Array.from({ length: 9 }, () => {
    const p = pontoNaBanda(sorte, 0.25);
    return {
      x: p.x,
      y: p.y,
      raio: 0.02 + sorte() * 0.035,
      alongamento: 2.4 + sorte() * 2,
    };
  });

  const medios: Ponto[] = [];
  for (let i = 0; i < 260; i++) {
    medios.push({
      x: sorte(),
      y: sorte(),
      raio: 0.5 + sorte() * 0.5,
      luz: 0.34 + sorte() * 0.4,
      cor: cor(sorte),
    });
  }

  const brilhantes: Ponto[] = [];
  for (let i = 0; i < 44; i++) {
    brilhantes.push({
      x: sorte(),
      y: sorte(),
      raio: 0.85 + sorte() * 0.7,
      luz: 0.6 + sorte() * 0.4,
      cor: cor(sorte),
    });
  }

  const inclinacao = Math.atan2(BANDA.y1 - BANDA.y0, BANDA.x1 - BANDA.x0);

  return [
    {
      deslocamento: 24,
      estrelas: distantes,
      desenharExtras: (ctx, largura, altura) => {
        const escala = Math.max(largura, altura);
        for (const nuvem of nuvens) {
          const x = nuvem.x * largura;
          const y = nuvem.y * altura;
          const raio = nuvem.raio * escala;
          const gradiente = ctx.createRadialGradient(x, y, 0, x, y, raio);
          gradiente.addColorStop(0, `rgba(254,243,199,${(0.07 * nuvem.forca).toFixed(3)})`);
          gradiente.addColorStop(0.45, `rgba(250,204,21,${(0.03 * nuvem.forca).toFixed(3)})`);
          gradiente.addColorStop(1, "rgba(250,204,21,0)");
          ctx.fillStyle = gradiente;
          ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
        }
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        for (const poeira of poeiras) {
          const x = poeira.x * largura;
          const y = poeira.y * altura;
          const raio = poeira.raio * escala;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(inclinacao);
          ctx.scale(poeira.alongamento, 1);
          const gradiente = ctx.createRadialGradient(0, 0, 0, 0, 0, raio);
          gradiente.addColorStop(0, "rgba(0,0,0,0.55)");
          gradiente.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gradiente;
          ctx.beginPath();
          ctx.arc(0, 0, raio, 0, VOLTA);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      },
    },
    { deslocamento: 52, estrelas: medios },
    { deslocamento: 90, estrelas: brilhantes },
  ];
}

function desenharCamada(
  canvas: HTMLCanvasElement,
  camada: Camada,
  indice: number,
  proporcao: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const caixa = canvas.getBoundingClientRect();
  const largura = caixa.width;
  const altura = caixa.height;
  const nitidez = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(largura * nitidez));
  canvas.height = Math.max(1, Math.round(altura * nitidez));
  ctx.setTransform(nitidez, 0, 0, nitidez, 0, 0);
  ctx.clearRect(0, 0, largura, altura);

  const quantas = Math.ceil(camada.estrelas.length * Math.min(1, proporcao));
  for (let i = 0; i < quantas; i++) {
    const estrela = camada.estrelas[i];
    const x = estrela.x * largura;
    const y = estrela.y * altura;

    if (indice === 2) {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, estrela.raio * 7);
      halo.addColorStop(0, `rgba(${estrela.cor},${(estrela.luz * 0.28).toFixed(3)})`);
      halo.addColorStop(1, `rgba(${estrela.cor},0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(
        x - estrela.raio * 7,
        y - estrela.raio * 7,
        estrela.raio * 14,
        estrela.raio * 14
      );

      if (estrela.raio > 1.45) {
        const raio = estrela.raio * 9;
        ctx.strokeStyle = `rgba(${estrela.cor},${(estrela.luz * 0.24).toFixed(3)})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - raio, y);
        ctx.lineTo(x + raio, y);
        ctx.moveTo(x, y - raio);
        ctx.lineTo(x, y + raio);
        ctx.stroke();
      }
    }

    ctx.fillStyle = `rgba(${estrela.cor},${estrela.luz.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, estrela.raio, 0, VOLTA);
    ctx.fill();
  }

  camada.desenharExtras?.(ctx, largura, altura);
}

export function CeuDoSertao() {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    const camadas = criarCamadas();
    const parado = querMenosMovimento();
    let quadro = 0;
    let adiado = 0;

    const desenharTudo = () => {
      const proporcao = (window.innerWidth * window.innerHeight) / AREA_DE_REFERENCIA;
      camadas.forEach((camada, i) => {
        const canvas = refs.current[i];
        if (canvas) desenharCamada(canvas, camada, i, Math.max(0.35, proporcao));
      });
    };

    const mover = () => {
      quadro = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progresso = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      camadas.forEach((camada, i) => {
        const canvas = refs.current[i];
        if (canvas) {
          canvas.style.transform = `translate3d(0, ${(-progresso * camada.deslocamento).toFixed(1)}px, 0)`;
        }
      });
    };

    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(mover);
    };

    const aoRedimensionar = () => {
      window.clearTimeout(adiado);
      adiado = window.setTimeout(() => {
        desenharTudo();
        mover();
      }, 150);
    };

    desenharTudo();
    mover();
    window.addEventListener("resize", aoRedimensionar);
    if (!parado) window.addEventListener("scroll", aoRolar, { passive: true });

    return () => {
      cancelAnimationFrame(quadro);
      window.clearTimeout(adiado);
      window.removeEventListener("resize", aoRedimensionar);
      window.removeEventListener("scroll", aoRolar);
    };
  }, []);

  return (
    <div className="ceu-do-sertao" aria-hidden="true">
      {[24, 52, 90].map((deslocamento, i) => (
        <canvas
          key={deslocamento}
          ref={(elemento) => {
            refs.current[i] = elemento;
          }}
          className="ceu-do-sertao__camada"
          style={{ height: `calc(100% + ${deslocamento}px)` }}
        />
      ))}
    </div>
  );
}
