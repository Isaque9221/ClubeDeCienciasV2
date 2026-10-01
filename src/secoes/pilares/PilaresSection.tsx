import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { querMenosMovimento } from "@/compartilhado/utils/movimento";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import { FioDourado, GsapTextReveal, SectionLabel } from "@/compartilhado/componentes";
import { montarPilares, montarTextosDosPilares } from "./conteudo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function PilaresSection() {
  const { playSound } = useSound();
  const { siteConfig } = useData();
  const pilares = montarPilares(siteConfig);
  const textos = montarTextosDosPilares(siteConfig);

  const [ativo, setAtivo] = useState<string>(pilares[0].id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pillGridRef = useRef<HTMLDivElement>(null);

  const pilarAtual = pilares.find((p) => p.id === ativo) || pilares[0];
  const Icone = pilarAtual.icone;

  useGSAP(
    () => {
      if (!sectionRef.current || !pillGridRef.current || querMenosMovimento()) return;

      gsap.fromTo(
        pillGridRef.current.children,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: pillGridRef.current,
            start: "top 85%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef} id="pilares" className="space-y-5 sm:space-y-10 px-3 sm:px-6">
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
        <SectionLabel text={textos.etiqueta} />
        <GsapTextReveal
          text={textos.titulo}
          tag="h2"
          type="mask-up"
          className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white text-balance"
          highlightWords={[...textos.palavrasEmDestaque]}
          glowOnView
        />
        <FioDourado />
        <p className="text-[11px] sm:text-base text-stone-300 max-w-2xl mx-auto text-pretty">
          {textos.subtitulo}
        </p>
      </div>

      <div
        ref={pillGridRef}
        className="grid grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-3 max-w-5xl mx-auto px-0 sm:px-2"
      >
        {pilares.map((p) => {
          const IconeDaAba = p.icone;
          const estaAtivo = p.id === ativo;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={estaAtivo}
              onClick={() => {
                playSound("subtle-click");
                setAtivo(p.id);
              }}
              className={`group flex min-h-[38px] sm:min-h-[54px] w-full items-center justify-center gap-1.5 sm:gap-2.5 rounded-lg sm:rounded-2xl border px-2 py-1.5 sm:px-4 sm:py-2.5 text-center text-[10px] sm:text-sm font-semibold leading-snug transition-all duration-200 cursor-pointer select-none ${
                estaAtivo
                  ? "border-yellow-400 bg-yellow-400/15 text-ouro shadow-[0_0_20px_rgba(250,204,21,0.25)] scale-[1.02]"
                  : "border-stone-800/90 bg-superficie-2/80 text-stone-400 hover:border-stone-700 hover:bg-superficie-3 hover:text-stone-200"
              }`}
            >
              <IconeDaAba
                className={`h-3 w-3 sm:h-4 sm:w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  estaAtivo ? "text-ouro" : "text-stone-400 group-hover:text-stone-300"
                }`}
              />
              <span className="text-balance">{p.titulo}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pilarAtual.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto rounded-xl sm:rounded-[1.75rem] border border-yellow-400/25 bg-gradient-to-br from-superficie-3 via-superficie to-superficie-3 p-3.5 sm:p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(250,204,21,0.08)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-8 items-center">
            <div className="md:col-span-7 space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="text-lg sm:text-3xl font-black text-ouro">
                  {pilarAtual.numero}
                </span>
                <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-widest text-stone-400 shiny-text">
                  {pilarAtual.tagline}
                </span>
              </div>
              <h3 className="text-base sm:text-3xl md:text-4xl font-black leading-snug text-white text-balance">
                {pilarAtual.titulo} <span className="text-ouro">{pilarAtual.complemento}</span>
              </h3>
              <p className="text-[11px] sm:text-base text-stone-300 leading-relaxed text-pretty">
                {pilarAtual.descricao}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5 pt-0.5 sm:pt-2">
                {pilarAtual.itens.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-medium text-stone-200 bg-superficie rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 border border-stone-800/80 hover:border-yellow-400/30 transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-ouro" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-5 flex justify-center pt-1 sm:pt-0">
              <div className="relative flex h-20 w-20 sm:h-44 sm:w-44 items-center justify-center rounded-xl sm:rounded-3xl border border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_50px_rgba(250,204,21,0.25)]">
                <Icone className="h-10 w-10 sm:h-22 sm:w-22 text-ouro drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
