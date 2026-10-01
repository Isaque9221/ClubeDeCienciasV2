import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import {
  CeuEmExposicao,
  FioDourado,
  GsapTextReveal,
  SectionLabel,
  Visor,
} from "@/compartilhado/componentes";
import { CTA, montarCta } from "./conteudo";

export function CtaSection() {
  const { playSound } = useSound();
  const { siteConfig } = useData();
  const conteudo = montarCta(siteConfig);

  const btnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const btn = btnRef.current;
      if (!btn) return;

      const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });

      const handleMouseMove = (e: MouseEvent) => {
        const { left, top, width, height } = btn.getBoundingClientRect();
        const x = e.clientX - left - width / 2;
        const y = e.clientY - top - height / 2;
        xTo(x * 0.28);
        yTo(y * 0.28);
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      const parent = btn.parentElement;
      if (parent) {
        parent.addEventListener("mousemove", handleMouseMove);
        parent.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          parent.removeEventListener("mousemove", handleMouseMove);
          parent.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      id="junte-se"
      data-tema="escuro"
      className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl sm:rounded-[2.25rem]"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #161412 0%, #1c1813 50%, #161412 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(250,204,21,0.18) 0%, transparent 65%)",
        }}
      />
      <CeuEmExposicao polo={[0.5, 0.46]} giro={[8, 78]} quantidade={2} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 48% 56% at 50% 46%, rgba(22,20,18,0.86) 0%, rgba(22,20,18,0.5) 55%, transparent 100%)",
        }}
      />
      <div className="grao" />
      <div className="absolute inset-0 border border-yellow-400/25 rounded-[inherit] pointer-events-none" />
      <Visor folga={20} />

      <div className="relative z-10 px-5 py-12 sm:px-14 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl space-y-4 sm:space-y-6"
        >
          <SectionLabel text={conteudo.etiqueta} />

          <GsapTextReveal
            text={conteudo.titulo}
            tag="h2"
            type="mask-up"
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white text-balance"
            highlightWords={CTA.palavrasEmDestaque}
            glowOnView
          />
          <FioDourado />

          <GsapTextReveal
            text={conteudo.descricao}
            tag="p"
            type="words"
            stagger={0.02}
            className="text-sm sm:text-lg text-stone-300 leading-relaxed text-pretty"
          />

          <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-4 pt-2 sm:pt-4">
            <button
              ref={btnRef}
              type="button"
              onClick={() => {
                playSound("pop-bubble");
                const link = conteudo.botaoPrincipal.link;
                if (link) {
                  window.open(link, "_blank", "noopener,noreferrer");
                  return;
                }
                alert(conteudo.botaoPrincipal.mensagemAoClicar);
              }}
              aria-label={
                conteudo.botaoPrincipal.link
                  ? `${conteudo.botaoPrincipal.texto} — abre conversa no WhatsApp`
                  : conteudo.botaoPrincipal.texto
              }
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-sm font-extrabold text-stone-950 transition-shadow duration-300 active:scale-95 cursor-pointer shadow-[0_4px_30px_rgba(250,204,21,0.4)] will-change-transform"
              style={{
                background:
                  "linear-gradient(135deg, #FFFBEB 0%, #FEF08A 35%, #FDE047 70%, #FACC15 100%)",
              }}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 font-black">{conteudo.botaoPrincipal.texto}</span>
              <ArrowUpRight className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-stone-950" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSound("subtle-click");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900/80 px-4 py-2.5 sm:px-6 sm:py-4 text-xs sm:text-sm font-semibold text-stone-300 transition-all hover:bg-stone-800 hover:text-white hover:border-yellow-400/30 active:scale-95 cursor-pointer"
            >
              {conteudo.botaoSecundario.texto}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
