import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { querMenosMovimento } from "@/compartilhado/utils/movimento";
import { AnimatedNumber, Visor } from "@/compartilhado/componentes";
import { useData } from "@/compartilhado/hooks/useData";
import { montarEstatisticas } from "./conteudo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function EstatisticasSection() {
  const { siteConfig } = useData();
  const estatisticas = montarEstatisticas(siteConfig);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current || querMenosMovimento()) return;

      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl sm:rounded-[1.75rem] border border-yellow-400/25 bg-gradient-to-r from-superficie-2 via-fundo to-superficie-2 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(250,204,21,0.06)]"
    >
      <Visor folga={10} tamanho={14} />
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10"
      >
        {estatisticas.map((item, i) => (
          <div
            key={item.rotulo + i}
            className="group relative p-2.5 sm:p-7 md:p-10 text-center transition-all duration-300 hover:bg-yellow-400/[0.04]"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-yellow-400/0 via-yellow-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/35 to-transparent transition-all duration-500 group-hover:inset-x-2 group-hover:via-yellow-300/80"
            />
            <div className="text-lg sm:text-4xl md:text-5xl font-black tracking-tight text-ouro group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              <AnimatedNumber value={item.numero} />
            </div>
            <div className="mt-1 sm:mt-2 text-[10px] sm:text-sm font-bold leading-tight text-white group-hover:text-yellow-100 transition-colors">
              {item.rotulo}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs leading-snug text-stone-400 group-hover:text-stone-300 transition-colors">
              {item.detalhe}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
