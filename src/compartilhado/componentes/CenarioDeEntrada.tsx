import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTelaPequena } from "@/compartilhado/hooks/useTelaPequena";
import { CantosDaMoldura, HorizonteDoSertao } from "./PalcoEstelar";

const SUAVE = [0.16, 1, 0.3, 1] as const;

export function CenarioDeEntrada({ saltando = false }: { saltando?: boolean }) {
  const telaPequena = useTelaPequena();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const isWarpingRef = useRef(saltando);
  isWarpingRef.current = saltando;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const telaP3 = window.matchMedia?.("(color-gamut: p3)").matches ?? false;
    const telaHDR = window.matchMedia?.("(dynamic-range: high)").matches ?? false;
    const ctx = canvas.getContext("2d", telaP3 ? { colorSpace: "display-p3" } : undefined);
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillStyle = "color(display-p3 1 0 0)";
    const pintaP3 = telaP3 && ctx.fillStyle !== "#000000";

    type Cor = readonly [number, number, number];
    const prepararCor = ([r, g, b]: Cor) =>
      pintaP3
        ? `color(display-p3 ${r} ${g} ${b} / `
        : `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, `;
    const OURO = prepararCor([0.98, 0.8, 0.082]);
    const OURO_CLARO = prepararCor([0.996, 0.941, 0.541]);

    const ganhoHDR = telaHDR ? 1.2 : 1;
    const haloHDR = telaHDR ? 1.5 : 1;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let escala = 1;

    const lerDpr = () => Math.min(window.devicePixelRatio || 1, 2);

    const dimensionar = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = lerDpr();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      escala = Math.min(Math.max(Math.min(width / 1920, height / 1080), 1), 2);
    };
    dimensionar();

    const handleResize = () => dimensionar();

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const maxEstrelas = telaPequena ? 70 : 185;
    const numEstrelas = Math.min(
      Math.floor((width * height) / (6500 * escala * escala)),
      maxEstrelas
    );
    const ligadas = Math.min(numEstrelas, telaPequena ? 20 : 52);

    interface NodeParticle {
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      cintSpeed: number;
      cintFase: number;
      viva: boolean;
      color: string;
      speed: number;
      angle: number;
      distFromCenter: number;
    }

    const CORES_DE_ESTRELA = [OURO_CLARO, OURO, prepararCor([1, 0.984, 0.922])];

    const initialCenterX = width / 2;
    const initialCenterY = height / 2;

    const nodes: NodeParticle[] = Array.from({ length: numEstrelas }).map((_, i) => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const dx = x - initialCenterX;
      const dy = y - initialCenterY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);

      const daConstelacao = i < ligadas;
      const baseAlpha = daConstelacao ? Math.random() * 0.3 + 0.55 : Math.random() * 0.3 + 0.12;

      return {
        x,
        y,
        prevX: x,
        prevY: y,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        radius: daConstelacao ? Math.random() * 1.1 + 0.9 : Math.random() * 0.8 + 0.35,
        alpha: baseAlpha,
        baseAlpha,
        cintSpeed: Math.random() * 1.6 + 0.5,
        cintFase: Math.random() * Math.PI * 2,
        viva: daConstelacao && Math.random() > 0.72,
        color: CORES_DE_ESTRELA[Math.floor(Math.random() * CORES_DE_ESTRELA.length)],
        speed: Math.random() * 1.8 + 1.2,
        angle,
        distFromCenter: dist,
      };
    });

    let warpFactor = 1;

    const paradaPedida = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const render = () => {
      if (lerDpr() !== dpr) dimensionar();

      const curCenterX = width / 2;
      const curCenterY = height / 2;

      if (isWarpingRef.current) {
        ctx.fillStyle = "rgba(8, 7, 6, 0.28)";
        ctx.fillRect(0, 0, width, height);

        warpFactor = Math.min(warpFactor * 1.1 + 0.45, 30);

        const margem = 120 * escala;
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.prevX = n.x;
          n.prevY = n.y;

          n.distFromCenter += n.speed * warpFactor * escala;
          n.x = curCenterX + Math.cos(n.angle) * n.distFromCenter;
          n.y = curCenterY + Math.sin(n.angle) * n.distFromCenter;

          const streakLen = Math.min(warpFactor * 4.5, 140) * escala;
          const tailX = n.x - Math.cos(n.angle) * streakLen;
          const tailY = n.y - Math.sin(n.angle) * streakLen;

          const streakAlpha = Math.min(0.95, (n.distFromCenter / (width * 0.45)) * 0.7 + 0.25);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = `${OURO_CLARO}${streakAlpha})`;
          ctx.lineWidth = Math.min(2.8, n.radius * (1 + warpFactor * 0.05)) * escala;
          ctx.stroke();

          if (n.x < -margem || n.x > width + margem || n.y < -margem || n.y > height + margem) {
            n.distFromCenter = (Math.random() * 50 + 10) * escala;
            n.angle = Math.random() * Math.PI * 2;
            n.x = curCenterX + Math.cos(n.angle) * n.distFromCenter;
            n.y = curCenterY + Math.sin(n.angle) * n.distFromCenter;
            n.prevX = n.x;
            n.prevY = n.y;
          }
        }
      } else {
        ctx.clearRect(0, 0, width, height);
        const mouse = mousePosRef.current;
        const agora = performance.now() / 1000;

        const alcanceLinha = 150 * escala;
        const alcanceCursor = 170 * escala;
        for (let i = 0; i < ligadas; i++) {
          for (let j = i + 1; j < ligadas; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < alcanceLinha) {
              const a = 0.1 * (1 - dist / alcanceLinha);
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `${OURO}${a})`;
              ctx.lineWidth = 0.5 * escala;
              ctx.stroke();
            }
          }

          if (mouse.x > 0 && mouse.y > 0) {
            const mdx = nodes[i].x - mouse.x;
            const mdy = nodes[i].y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < alcanceCursor) {
              const ma = 0.26 * (1 - mDist / alcanceCursor);
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `${OURO_CLARO}${ma})`;
              ctx.lineWidth = 0.75 * escala;
              ctx.stroke();
            }
          }
        }

        nodes.forEach((node) => {
          node.x += node.vx * escala;
          node.y += node.vy * escala;
          if (node.x < 0) node.x = width;
          if (node.x > width) node.x = 0;
          if (node.y < 0) node.y = height;
          if (node.y > height) node.y = 0;

          const curDx = node.x - curCenterX;
          const curDy = node.y - curCenterY;
          node.angle = Math.atan2(curDy, curDx);
          node.distFromCenter = Math.sqrt(curDx * curDx + curDy * curDy);

          const cintilar = 0.72 + 0.28 * Math.sin(agora * node.cintSpeed + node.cintFase);
          node.alpha = Math.min(1, node.baseAlpha * cintilar * ganhoHDR);

          if (node.viva) {
            ctx.shadowColor = `${node.color}0.9)`;
            ctx.shadowBlur = 8 * escala * dpr * haloHDR;
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * escala, 0, Math.PI * 2);
          ctx.fillStyle = `${node.color}${node.alpha})`;
          ctx.fill();

          if (node.viva) ctx.shadowBlur = 0;
        });
      }

      if (paradaPedida) return;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [telaPequena]);

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.75, ease: SUAVE } }}
      transition={{ duration: 0.6, ease: SUAVE }}
      data-tema="escuro"
      className="pointer-events-none fixed inset-0 z-[9990] overflow-hidden bg-fundo-profundo"
    >
      <canvas ref={canvasRef} className="absolute inset-0 opacity-90" />

      <div className="absolute top-1/2 left-1/2 h-[calc(560px*var(--escala-4k))] w-[calc(900px*var(--escala-4k))] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.07),transparent_65%)]" />

      <HorizonteDoSertao
        className={`transition-opacity duration-500 ${saltando ? "opacity-0" : "opacity-100"}`}
      />

      <CantosDaMoldura />

      <div className="grao" />
    </motion.div>
  );
}
