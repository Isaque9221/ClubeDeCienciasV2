import { motion } from "framer-motion";
import { ArrowLeft, Cpu, FileText, FlaskConical, Microscope } from "lucide-react";
import { useSound } from "@/compartilhado/hooks";
import { FioDourado, GsapTextReveal, SectionLabel } from "@/compartilhado/componentes";
import type { montarProjetos } from "./conteudo";

type ConteudoEmDesenvolvimento = ReturnType<typeof montarProjetos>["emDesenvolvimento"];

interface EmDesenvolvimentoProps {
  conteudo: ConteudoEmDesenvolvimento;
  onBack: () => void;
}

const ICONES_DO_QUE_VEM = [Microscope, FileText, Cpu];

const BOLHAS = [
  { x: -10, atraso: 0, tamanho: 6 },
  { x: 6, atraso: 0.8, tamanho: 4 },
  { x: -2, atraso: 1.6, tamanho: 5 },
];

const SUAVE = [0.16, 1, 0.3, 1] as const;

export function EmDesenvolvimento({ conteudo, onBack }: EmDesenvolvimentoProps) {
  const { playSound } = useSound();

  return (
    <section
      role="status"
      aria-live="polite"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-16 pt-24 sm:px-8 sm:pb-24 sm:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[860px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.13),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_42%,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: SUAVE }}
        className="relative mx-auto w-full max-w-2xl text-center"
      >
        <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center sm:mb-9 sm:h-28 sm:w-28">
          <span className="absolute inset-0 rounded-full border border-yellow-400/25 bg-yellow-400/[0.06] shadow-[0_0_60px_rgba(250,204,21,0.18)]" />
          <motion.span
            aria-hidden="true"
            className="absolute -inset-3 rounded-full border border-dashed border-yellow-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute -inset-3"
            animate={{ rotate: -360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 shadow-[0_0_14px_rgba(250,204,21,0.95)]" />
          </motion.span>

          {BOLHAS.map((bolha, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute left-1/2 top-[34%] rounded-full border border-yellow-200/70 bg-yellow-200/20"
              style={{ width: bolha.tamanho, height: bolha.tamanho, marginLeft: bolha.x }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: [0, -30] }}
              transition={{
                duration: 2.4,
                delay: bolha.atraso,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          <FlaskConical className="relative h-10 w-10 text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.55)] sm:h-12 sm:w-12" />
        </div>

        <SectionLabel text={conteudo.etiqueta} />

        <GsapTextReveal
          text={conteudo.titulo}
          tag="h1"
          type="mask-up"
          className="mt-4 text-[2rem] font-black leading-[1.08] tracking-tight text-white text-balance sm:mt-6 sm:text-6xl"
          highlightWords={conteudo.palavrasEmDestaque}
          glowOnView
        />
        <FioDourado />

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-300 text-pretty sm:mt-6 sm:text-lg">
          {conteudo.mensagem}
        </p>

        <div className="mx-auto mt-8 max-w-md sm:mt-10">
          <div className="mb-2 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-stone-500 sm:text-[11px]">
            <span>{conteudo.rotuloDoProgresso}</span>
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-yellow-400"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-yellow-300 to-transparent"
              initial={{ left: "-35%" }}
              animate={{ left: "105%" }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="mt-10 sm:mt-14">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-yellow-400/80 sm:text-[11px]">
            {conteudo.rotuloDoQueVem}
          </span>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 text-left sm:grid-cols-3 sm:gap-3">
            {conteudo.oQueVem.map((item, i) => {
              const Icone = ICONES_DO_QUE_VEM[i % ICONES_DO_QUE_VEM.length];
              return (
                <motion.li
                  key={item.titulo}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 + i * 0.12, ease: SUAVE }}
                  className="group flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-colors hover:border-yellow-400/35 hover:bg-yellow-400/[0.04] sm:flex-col sm:gap-2.5 sm:p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-yellow-400/25 bg-yellow-400/[0.08] text-yellow-300">
                    <Icone className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">{item.titulo}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-stone-400">
                      {item.descricao}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
          <button
            type="button"
            onClick={() => {
              playSound("subtle-click");
              onBack();
            }}
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-stone-950 shadow-[0_4px_30px_rgba(250,204,21,0.35)] transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, #FFFBEB 0%, #FEF08A 35%, #FDE047 70%, #FACC15 100%)",
            }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {conteudo.botaoVoltar}
          </button>
          <p className="font-mono text-[11px] text-stone-500">{conteudo.rodape}</p>
        </div>
      </motion.div>
    </section>
  );
}
