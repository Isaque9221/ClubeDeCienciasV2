import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Award,
  Users,
  FlaskConical,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { useSound, useData } from "@/compartilhado/hooks";
import { useTelaPequena } from "@/compartilhado/hooks/useTelaPequena";
import {
  CabecalhoDaAba,
  FioDourado,
  GsapTextReveal,
  SectionLabel,
} from "@/compartilhado/componentes";
import { TRAJETORIA, montarTrajetoria } from "./conteudo";

type Marco = ReturnType<typeof montarTrajetoria>["marcos"][number];

interface TrajetoriaPageProps {
  onBack: () => void;
  onOpenProjects?: () => void;
  onOpenMembers?: () => void;
}

export function TrajetoriaPage({ onBack, onOpenProjects, onOpenMembers }: TrajetoriaPageProps) {
  const { playSound } = useSound();
  const telaPequena = useTelaPequena();
  const { siteConfig } = useData();
  const textos = montarTrajetoria(siteConfig);
  const [filtroAtivo, setFiltroAtivo] = useState<string>("todos");

  const paginaRef = useRef<HTMLDivElement>(null);
  const linhaRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: progressoDaLinha } = useScroll({
    target: linhaRef,
    offset: ["start 75%", "end 60%"],
  });
  const alturaDoFeixe = useSpring(progressoDaLinha, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });
  const alturaEmPorcento = useTransform(
    alturaDoFeixe,
    (v) => `${Math.max(0, Math.min(1, v)) * 100}%`
  );

  const { scrollYProgress: progressoDoHero } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(progressoDoHero, [0, 1], [0, telaPequena ? 40 : 110]);
  const heroOpacidade = useTransform(progressoDoHero, [0, 0.8], [1, 0.15]);
  const brilhoY = useTransform(progressoDoHero, [0, 1], [0, telaPequena ? 60 : 200]);

  const marcosFiltrados = useMemo(() => {
    const lista = textos.marcos || TRAJETORIA.marcos;
    if (filtroAtivo === "todos") return lista;
    if (filtroAtivo === "2025") {
      return lista.filter((m) => m.ano === "2025");
    }
    if (filtroAtivo === "2026") {
      return lista.filter((m) => m.ano === "2026");
    }
    if (filtroAtivo === "futuro") {
      return lista.filter((m) => m.situacao === "futuro" || m.ano.includes("+"));
    }
    return lista;
  }, [filtroAtivo, textos.marcos]);

  return (
    <motion.div
      ref={paginaRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="relative isolate min-h-screen w-full overflow-x-hidden text-stone-100 font-sans selection:bg-yellow-500/30 selection:text-white"
    >
      <motion.div
        style={{ y: brilhoY }}
        className="pointer-events-none fixed -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.12)_0%,transparent_70%)] blur-3xl z-0"
      />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[600px] w-[600px] bg-[radial-gradient(circle_at_bottom_right,rgba(254,240,138,0.06)_0%,transparent_70%)] blur-3xl z-0" />

      <CabecalhoDaAba
        onVoltar={onBack}
        rotuloVoltar={textos.cabecalho.botaoVoltar}
        marca={textos.cabecalho.marca}
        titulo={TRAJETORIA.cabecalho.aba}
        contador={TRAJETORIA.cabecalho.contador.replace("{n}", String(TRAJETORIA.marcos.length))}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-3 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
        <motion.div
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacidade }}
          className="mx-auto max-w-3xl space-y-4 text-center sm:space-y-5"
        >
          <SectionLabel text={textos.hero.etiqueta} />

          <GsapTextReveal
            text={textos.hero.titulo}
            tag="h1"
            type="mask-up"
            className="text-[1.7rem] font-black leading-[1.1] tracking-tight text-white text-balance sm:text-5xl md:text-6xl"
            highlightWords={[...TRAJETORIA.hero.palavrasEmDestaque]}
            glowOnView
          />
          <FioDourado />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xs leading-relaxed text-stone-300 text-pretty sm:text-base"
          >
            {textos.hero.subtitulo}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-2 pt-3 text-left sm:grid-cols-4 sm:gap-4 sm:pt-4"
          >
            {(textos.hero.estatisticas || TRAJETORIA.hero.estatisticas).map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 transition-colors hover:border-yellow-400/40 hover:bg-white/[0.06] sm:rounded-2xl sm:p-4"
              >
                <div className="font-mono text-base font-black tracking-tight text-ouro sm:text-2xl">
                  {stat.valor}
                </div>
                <div className="mt-0.5 text-[10px] font-bold leading-tight text-white sm:text-xs">
                  {stat.rotulo}
                </div>
                <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-stone-400 sm:mt-1 sm:line-clamp-1 sm:text-[10px]">
                  {stat.descricao}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-2 pt-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-stone-500 sm:text-[10px]"
          >
            <span>Role para percorrer a linha do tempo</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-3 w-3 text-yellow-400" />
            </motion.span>
          </motion.div>
        </motion.div>

        <div className="sticky top-[62px] z-30 mx-auto mt-10 flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5 rounded-3xl border border-white/[0.08] vidro p-1.5 sm:top-[80px] sm:mt-16 sm:gap-1.5 sm:rounded-full sm:p-1.5">
          {TRAJETORIA.filtros.map((filtro) => {
            const ativo = filtroAtivo === filtro.id;
            return (
              <button
                key={filtro.id}
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  setFiltroAtivo(filtro.id);
                }}
                className={`relative min-h-[36px] rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-200 cursor-pointer sm:px-4 sm:py-2 sm:text-[13px] ${
                  ativo
                    ? "text-stone-950"
                    : "border border-white/10 bg-white/[0.04] text-stone-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {ativo && (
                  <motion.span
                    layoutId="filtroDaTrajetoria"
                    className="absolute inset-0 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 font-bold">{filtro.rotulo}</span>
              </button>
            );
          })}
        </div>

        <div ref={linhaRef} className="relative mx-auto mt-8 max-w-4xl sm:mt-14">
          <div className="pointer-events-none absolute bottom-6 left-[13px] top-2 w-px bg-white/[0.07] sm:left-1/2 sm:-translate-x-1/2" />

          <motion.div
            style={{ height: alturaEmPorcento }}
            className="pointer-events-none absolute left-[13px] top-2 w-px origin-top bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(250,204,21,0.8)] sm:left-1/2 sm:-translate-x-1/2"
          >
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-yellow-200 shadow-[0_0_16px_6px_rgba(250,204,21,0.55)]" />
          </motion.div>

          <div className="space-y-8 sm:space-y-20">
            <AnimatePresence mode="popLayout">
              {marcosFiltrados.map((marco, idx) => (
                <MarcoDaLinha
                  key={marco.titulo}
                  marco={marco}
                  idx={idx}
                  telaPequena={telaPequena}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-14 max-w-4xl space-y-4 overflow-hidden rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-superficie-2 via-superficie to-superficie-2 p-5 text-center shadow-2xl sm:mt-24 sm:space-y-6 sm:rounded-3xl sm:p-10"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.1)_0%,transparent_65%)]" />

          <div className="relative inline-flex items-center gap-1.5 rounded-full border border-yellow-400/35 bg-yellow-400/10 px-2.5 py-1 text-[10px] font-semibold text-ouro sm:gap-2 sm:px-3 sm:text-xs">
            <Award className="h-3 w-3 text-yellow-400 sm:h-3.5 sm:w-3.5" />
            <span>{textos.manifestoFinal.etiqueta}</span>
          </div>

          <h2 className="relative text-xl font-black tracking-tight text-white text-balance sm:text-3xl">
            {textos.manifestoFinal.titulo}
          </h2>

          <p className="relative mx-auto max-w-2xl text-xs leading-relaxed text-stone-300 text-pretty sm:text-sm">
            {textos.manifestoFinal.texto}
          </p>

          <div className="relative flex flex-wrap items-center justify-center gap-2 pt-1 sm:gap-3 sm:pt-2">
            {onOpenProjects && (
              <button
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  onOpenProjects();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3.5 py-2 text-[11px] font-bold text-stone-950 shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all hover:bg-yellow-300 active:scale-95 cursor-pointer sm:gap-2 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{textos.manifestoFinal.botaoProjetos}</span>
              </button>
            )}

            {onOpenMembers && (
              <button
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  onOpenMembers();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold text-white transition-all hover:border-yellow-400/50 hover:bg-white/[0.08] active:scale-95 cursor-pointer sm:gap-2 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <Users className="h-3.5 w-3.5 text-ouro sm:h-4 sm:w-4" />
                <span>{textos.manifestoFinal.botaoMembros}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playSound("subtle-click");
                onBack();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-[11px] text-stone-400 transition-colors hover:text-white cursor-pointer sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <span>Voltar à Página Inicial</span>
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function MarcoDaLinha({
  marco,
  idx,
  telaPequena,
}: {
  marco: Marco;
  idx: number;
  telaPequena: boolean;
}) {
  const Icone = marco.icone;
  const ehPar = idx % 2 === 0;
  const cartaoRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cartaoRef,
    offset: ["start end", "end start"],
  });
  const deslocamento = telaPequena ? 0 : ehPar ? 34 : -34;
  const paralaxeBruto = useTransform(scrollYProgress, [0, 1], [deslocamento, -deslocamento]);
  const paralaxe = useSpring(paralaxeBruto, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001,
  });

  const corDaBorda =
    marco.situacao === "atual"
      ? "border-yellow-400/70 bg-gradient-to-br from-yellow-400/[0.12] via-superficie-2 to-superficie shadow-[0_0_40px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400/30"
      : marco.situacao === "concluido"
        ? "border-white/[0.09] bg-superficie-2/95 hover:border-emerald-400/40 hover:bg-superficie-3"
        : "border-purple-900/40 bg-gradient-to-br from-purple-950/15 via-superficie-2 to-fundo-profundo hover:border-purple-400/40";

  return (
    <motion.div
      ref={cartaoRef}
      layout
      initial={{ opacity: 0, y: 45, filter: "blur(6px)" }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transitionEnd: { filter: "none" },
      }}
      viewport={{ once: true, margin: "-60px" }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col items-stretch gap-3 pl-9 sm:flex-row sm:items-center sm:gap-10 sm:pl-0 ${
        ehPar ? "sm:flex-row-reverse" : ""
      }`}
    >
      <div className="hidden sm:block sm:w-1/2 sm:self-start">
        <div
          className={`sticky top-24 ${ehPar ? "sm:text-left sm:pl-10" : "sm:text-right sm:pr-10"}`}
        >
          <span className="block font-mono text-xl font-black leading-none text-white/[0.14] sm:text-6xl md:text-7xl">
            {marco.ano}
          </span>
          <span className="mt-1 hidden font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400/70 sm:block sm:text-xs">
            {marco.mes}
          </span>
        </div>
      </div>

      <div
        className={`absolute left-[7px] top-1.5 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 sm:left-1/2 sm:top-1/2 sm:h-12 sm:w-12 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-2 ${
          marco.situacao === "atual"
            ? "border-yellow-400 bg-fundo text-ouro shadow-[0_0_20px_rgba(250,204,21,0.7)]"
            : marco.situacao === "concluido"
              ? "border-emerald-400/80 bg-fundo text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.35)]"
              : "border-purple-400/60 bg-fundo text-purple-300 shadow-[0_0_14px_rgba(192,132,252,0.3)]"
        }`}
      >
        <Icone className="hidden h-5 w-5 sm:block" />
        {marco.situacao === "atual" && (
          <span className="absolute inset-0 animate-ping rounded-full border border-yellow-400/60 sm:rounded-2xl" />
        )}
      </div>

      <motion.div style={{ y: paralaxe }} className="w-full sm:w-1/2">
        <div
          className={`group relative space-y-2.5 overflow-hidden rounded-xl border p-3.5 shadow-xl transition-colors duration-300 sm:space-y-4 sm:rounded-3xl sm:p-7 ${corDaBorda} ${
            marco.situacao === "atual" ? "borda-viva borda-viva--dentro" : ""
          }`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-px ${
              marco.situacao === "atual"
                ? "bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                : marco.situacao === "concluido"
                  ? "bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                  : "bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
            }`}
          />

          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-amber-300 sm:gap-1.5 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-[10.5px]">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {marco.mes} · {marco.ano}
            </span>

            <span
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest sm:px-2.5 sm:py-1 sm:text-[11px] ${
                marco.situacao === "concluido"
                  ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                  : marco.situacao === "atual"
                    ? "border border-yellow-400/50 bg-yellow-400/20 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.3)]"
                    : "border border-purple-500/30 bg-purple-500/15 text-purple-300"
              }`}
            >
              {marco.situacao === "atual" && (
                <span className="h-1 w-1 animate-ping rounded-full bg-yellow-400 sm:h-1.5 sm:w-1.5" />
              )}
              {marco.situacao === "concluido" && (
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 sm:h-3 sm:w-3" />
              )}
              {marco.etiqueta}
            </span>
          </div>

          <h2 className="text-sm font-bold leading-snug text-white transition-colors group-hover:text-ouro text-balance sm:text-xl">
            {marco.titulo}
          </h2>

          <p className="text-[11px] leading-relaxed text-stone-300 text-pretty sm:text-sm">
            {marco.descricao}
          </p>

          <div className="space-y-1.5 border-t border-white/[0.08] pt-2.5 sm:space-y-2 sm:pt-3">
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-stone-400 sm:text-[10px]">
              Conquistas &amp; Ações Principais:
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              {marco.destaques.map((destaque, dIdx) => (
                <motion.div
                  key={dIdx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + dIdx * 0.07 }}
                  className="flex items-start gap-1.5 text-[10.5px] leading-snug text-stone-300 sm:gap-2 sm:text-xs sm:leading-normal"
                >
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-yellow-400 sm:h-3.5 sm:w-3.5" />
                  <span>{destaque}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {marco.parcerias && marco.parcerias.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 border-t border-white/[0.05] pt-2 sm:gap-1.5">
              <span className="mr-0.5 font-mono text-[10px] text-stone-500 sm:text-[11px]">
                Articulação:
              </span>
              {marco.parcerias.map((parceria, pIdx) => (
                <span
                  key={pIdx}
                  className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-stone-300 transition-colors hover:border-yellow-400/30 sm:rounded-md sm:px-2 sm:text-[11px]"
                >
                  {parceria}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
