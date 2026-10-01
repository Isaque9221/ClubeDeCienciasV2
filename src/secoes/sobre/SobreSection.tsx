import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { CheckCircle2, Quote, Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import { GsapTextReveal, SectionLabel } from "@/compartilhado/componentes";
import { SOBRE, montarSobre } from "./conteudo";
import { corLegivel } from "@/compartilhado/utils/cor-legivel";

interface SobreSectionProps {
  onOpenTrajetoria?: () => void;
}

export function SobreSection({ onOpenTrajetoria }: SobreSectionProps = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const { playSound } = useSound();
  const { siteConfig } = useData();
  const conteudo = montarSobre(siteConfig);

  const [abaAtiva, setAbaAtiva] = useState<number>(0);
  const aba = conteudo.abas[abaAtiva];

  const [pontosAbertos, setPontosAbertos] = useState(false);

  const trocarAba = (indice: number) => {
    setAbaAtiva(indice);
    setPontosAbertos(false);
  };

  return (
    <div
      ref={ref}
      id="sobre-nos"
      className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl sm:rounded-[2.25rem] border border-yellow-400/25 bg-gradient-to-b from-superficie-2 via-fundo to-superficie-2 px-3 py-5 sm:px-10 sm:py-14 md:px-16 md:py-20 shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
    >
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute -top-48 -left-48 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.18)_0%,transparent_70%)] blur-3xl"
      />
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(254,240,138,0.15)_0%,transparent_70%)] blur-3xl"
      />

      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ouro to-transparent opacity-80" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-5 sm:space-y-14">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 sm:gap-8 pb-4 sm:pb-10 border-b border-white/10">
          <div className="space-y-2 sm:space-y-4 max-w-2xl">
            <SectionLabel text={conteudo.etiqueta} alinhamento="esquerda" />

            <GsapTextReveal
              text={conteudo.titulo}
              tag="h2"
              type="mask-up"
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12] text-balance"
              highlightWords={SOBRE.palavrasEmDestaque}
              glowOnView
            />

            <GsapTextReveal
              text={conteudo.descricao}
              tag="p"
              type="words"
              stagger={0.015}
              className="text-[11px] sm:text-base text-stone-300 leading-relaxed max-w-xl text-pretty"
            />

            {onOpenTrajetoria && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound("subtle-click");
                    onOpenTrajetoria();
                  }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-ouro hover:bg-yellow-400/20 hover:border-yellow-400/60 transition-all cursor-pointer group"
                >
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                  <span>Conhecer a trajetória completa do clube</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-3.5 sm:w-3.5"
                  />
                </button>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 flex items-center gap-2.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-yellow-400/35 bg-gradient-to-br from-white/10 to-black/80 p-3 sm:p-5 shadow-xl hover:border-yellow-400/70 hover:shadow-[0_0_30px_rgba(250,204,21,0.25)] transition-all duration-300 group"
          >
            <div
              data-tema="escuro"
              className="flex h-10 w-14 sm:h-14 sm:w-24 shrink-0 items-center justify-center rounded-lg sm:rounded-2xl bg-[#28220f] border border-yellow-400/40 p-1.5 sm:p-2 text-white shadow-[0_0_20px_rgba(250,204,21,0.25)] group-hover:scale-105 transition-transform"
            >
              <img
                src={conteudo.premio.logo}
                alt={conteudo.premio.textoAlternativoDaLogo}
                className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
              />
            </div>
            <div>
              <div className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
                {conteudo.premio.etiqueta}
              </div>
              <div className="text-xs sm:text-base font-black text-white">
                {conteudo.premio.titulo}
              </div>
              <div className="text-[10.5px] sm:text-xs font-semibold text-ouro">
                {conteudo.premio.subtitulo}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-3 sm:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-ouro">
              {conteudo.chamadaDasAbas.esquerda}
            </span>
            <span className="text-[10.5px] sm:text-xs text-stone-400 font-medium">
              {conteudo.chamadaDasAbas.direita}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3.5">
            {conteudo.abas.map((item, idx) => {
              const Icone = item.icone;
              const estaAtiva = abaAtiva === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={estaAtiva}
                  onClick={() => {
                    playSound("subtle-click");
                    trocarAba(idx);
                  }}
                  className={`group relative overflow-hidden flex flex-col justify-between rounded-lg sm:rounded-2xl border p-2 sm:p-4.5 text-left transition-all duration-300 cursor-pointer ${
                    estaAtiva
                      ? "bg-black/95 scale-[1.01] sm:scale-[1.02]"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-yellow-400/30"
                  }`}
                  style={
                    estaAtiva
                      ? {
                          borderColor: `${item.cor}66`,
                          boxShadow: `0 0 25px ${item.cor}40`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between w-full mb-1.5 sm:mb-3">
                    <div
                      className={`flex h-7 w-7 sm:h-11 sm:w-11 items-center justify-center rounded-md sm:rounded-xl border transition-transform duration-300 ${
                        estaAtiva ? "scale-105 sm:scale-110" : "group-hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: estaAtiva
                          ? `${item.cor}20`
                          : "color-mix(in oklab, var(--color-white) 5%, transparent)",
                        borderColor: estaAtiva
                          ? item.cor
                          : "color-mix(in oklab, var(--color-white) 15%, transparent)",
                      }}
                    >
                      <Icone
                        className="h-3.5 w-3.5 sm:h-5 sm:w-5 transition-colors"
                        style={{
                          color: estaAtiva ? corLegivel(item.cor) : "var(--color-stone-400)",
                        }}
                      />
                    </div>
                    <span
                      className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: estaAtiva
                          ? `${item.cor}25`
                          : "color-mix(in oklab, var(--color-white) 5%, transparent)",
                        color: estaAtiva ? corLegivel(item.cor) : "var(--color-stone-500)",
                      }}
                    >
                      0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[10.5px] sm:text-base font-bold text-white transition-colors leading-tight">
                      {item.titulo}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 font-medium mt-0.5 line-clamp-1">
                      {item.subtitulo}
                    </p>
                  </div>

                  {estaAtiva && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 rounded-b-xl sm:rounded-b-2xl"
                      style={{ backgroundColor: item.cor }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={aba.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-xl sm:rounded-3xl border bg-black/90 p-3 sm:p-8 lg:p-10 shadow-2xl"
              style={{ borderColor: `${aba.cor}66` }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom right, ${aba.cor}33, ${aba.cor}1a, transparent)`,
                }}
              />
              <div className="relative mx-auto max-w-3xl space-y-2.5 sm:space-y-5 text-center">
                <div className="flex justify-center">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border"
                    style={{
                      backgroundColor: `${aba.cor}15`,
                      borderColor: `${aba.cor}40`,
                      color: corLegivel(aba.cor),
                    }}
                  >
                    <Sparkles aria-hidden="true" className="h-3 w-3" />
                    {SOBRE.rotulosDaAba.pilar}
                  </span>
                </div>

                <h3 className="text-base sm:text-3xl lg:text-4xl font-black text-white leading-snug text-balance">
                  {aba.titulo}
                </h3>

                <p className="mx-auto max-w-[62ch] text-left text-[11px] sm:text-[17px] text-stone-200 leading-relaxed font-normal text-pretty">
                  {aba.descricao}
                </p>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2 text-left ${
                    pontosAbertos ? "" : "[&>*:nth-child(n+2)]:hidden sm:[&>*:nth-child(n+2)]:flex"
                  }`}
                >
                  {aba.itens.map((item, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-1.5 sm:gap-2 rounded-md sm:rounded-xl border border-white/10 bg-black/60 p-2 sm:p-3 text-[10.5px] sm:text-sm font-medium text-stone-200"
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5"
                        style={{ color: corLegivel(aba.cor) }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {aba.itens.length > 1 && (
                  <button
                    type="button"
                    aria-expanded={pontosAbertos}
                    onClick={() => {
                      playSound("subtle-click");
                      setPontosAbertos((v) => !v);
                    }}
                    className="sm:hidden inline-flex items-center gap-1.5 rounded-full border border-yellow-400/35 bg-yellow-400/10 px-3 py-1.5 text-[10px] font-bold text-ouro transition-colors active:scale-95 cursor-pointer"
                  >
                    {pontosAbertos ? "Mostrar menos" : `Ler mais (${aba.itens.length - 1})`}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        pontosAbertos ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-5 pt-0.5 sm:pt-2">
          {conteudo.cardsDeMissao.map((card, cIdx) => {
            const IconeDoCard = card.icone;
            return (
              <motion.div
                key={card.titulo}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: cIdx * 0.1 }}
                className="group relative overflow-hidden rounded-lg sm:rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.05] to-transparent p-3 sm:p-6 transition-all duration-300 hover:border-yellow-400/50 hover:bg-white/[0.08] shadow-lg"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div
                    className="flex h-7 w-7 sm:h-11 sm:w-11 items-center justify-center rounded-md sm:rounded-xl border bg-black/60 shadow-inner group-hover:scale-110 transition-transform duration-300"
                    style={{ borderColor: `${card.cor}40` }}
                  >
                    <IconeDoCard
                      className="h-3.5 w-3.5 sm:h-5 sm:w-5"
                      style={{ color: corLegivel(card.cor) }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10 bg-white/5 text-stone-300">
                    {card.etiqueta}
                  </span>
                </div>

                <h4 className="text-xs sm:text-lg font-bold text-white group-hover:text-ouro transition-colors">
                  {card.titulo}
                </h4>
                <p className="text-[10.5px] sm:text-xs font-semibold text-ouro mt-0.5">
                  {card.subtitulo}
                </p>
                <p className="text-[10.5px] sm:text-xs text-stone-100 leading-relaxed mt-1.5 sm:mt-2.5">
                  {card.descricao}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative overflow-hidden rounded-lg sm:rounded-2xl border border-yellow-400/35 bg-gradient-to-r from-yellow-400/15 via-black/85 to-amber-300/10 p-3 sm:p-8 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-5">
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-2xl bg-yellow-400/20 border border-yellow-400/40 text-ouro shadow-md">
              <Quote className="h-4 w-4 sm:h-6 sm:w-6 text-ouro" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] sm:text-lg font-semibold italic text-white leading-relaxed text-pretty">
                "{conteudo.citacao.frase}"
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-bold text-ouro uppercase tracking-wider">
                <span>— {conteudo.citacao.autor}</span>
                <span aria-hidden="true" className="text-white/30 hidden sm:inline">
                  •
                </span>
                <span className="text-stone-300">{conteudo.citacao.local}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
