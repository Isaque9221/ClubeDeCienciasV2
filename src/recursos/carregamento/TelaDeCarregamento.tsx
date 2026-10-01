import { useEffect, useState, useRef, useCallback, useMemo, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Atom,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  CornerDownLeft,
  MapPin,
  Check,
} from "lucide-react";
import { useSound, useData } from "@/compartilhado/hooks";
import { Mira, Tecla } from "@/compartilhado/componentes/PalcoEstelar";
import { CARREGAMENTO, montarCarregamento, type DestinoDoCarregamento } from "./conteudo";

export type LoadingDestination = DestinoDoCarregamento;

interface TelaDeCarregamentoProps {
  onComplete?: (destination?: LoadingDestination) => void;
  onSalto?: (destination: LoadingDestination) => void;
  minDuration?: number;
  isPaused?: boolean;
}

const SUAVE = [0.16, 1, 0.3, 1] as const;

const ouro = (opacidade: number, token = "--cc-ouro") =>
  `color-mix(in oklab, var(${token}) ${Math.round(opacidade * 100)}%, transparent)`;

const PHASES = CARREGAMENTO.fases.map((fase, i, todas) => ({
  range: [i === 0 ? 0 : todas[i - 1].ate + 1, fase.ate] as [number, number],
  title: fase.titulo,
  subtitle: fase.subtitulo,
  tag: fase.etiqueta,
  icon: fase.icone,
  telemetry: fase.telemetria,
}));

const NOTAS_DAS_ETAPAS = [1, 1.26, 1.498, 2];

const LADO_DOS_DESTINOS = [-0.6, -0.2, 0.2, 0.6];

type TextosDoCarregamento = ReturnType<typeof montarCarregamento>;
type Destino = TextosDoCarregamento["destinos"][number];

function PainelDeCarregamento({ progress, etapa }: { progress: number; etapa: number }) {
  const faseAtual = PHASES[etapa] || PHASES[0];

  const [inicio, fim] = faseAtual.range;
  const dentroDaEtapa = Math.min(1, Math.max(0, (progress - inicio) / (fim - inicio + 1)));
  const trilha = Math.min(1, (etapa + dentroDaEtapa) / (PHASES.length - 1));

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
      transition={{ duration: 0.4, ease: SUAVE }}
      className="relative w-full max-w-[440px] sm:max-w-[480px]"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 0.3, ease: SUAVE }}
        className="pointer-events-none absolute -inset-px rounded-[calc(1.75rem+1px)]"
        style={{
          background: `linear-gradient(140deg, ${ouro(0.55)} 0%, ${ouro(0.1, "--cc-ambar")} 38%, transparent 62%, ${ouro(0.4, "--cc-ouro-claro")} 100%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scaleY: 0.8 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.65, delay: 0.12, ease: SUAVE }}
        style={{ originY: 0.2 }}
        className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-fundo/85 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(rgba(250,204,21,0.12)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
          <div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-300/[0.05] to-transparent"
            style={{ animation: "scan-sweep-x 3.4s ease-out infinite" }}
          />
        </div>
      </motion.div>

      <div className="relative px-6 pt-7 pb-6 text-center sm:px-8 sm:pt-8 sm:pb-7">
        <div className="relative mx-auto flex h-[168px] w-[168px] items-center justify-center">
          <span
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${ouro(0.15)} 0%, ${ouro(0.05, "--cc-ambar")} 42%, transparent 68%)`,
            }}
          />

          <svg viewBox="0 0 168 168" className="absolute inset-0 -rotate-90">
            <circle
              cx="84"
              cy="84"
              r="80"
              fill="none"
              strokeWidth="2"
              style={{ stroke: ouro(0.45) }}
            />
            <circle
              cx="84"
              cy="84"
              r="72"
              fill="none"
              strokeWidth="1"
              strokeDasharray="1.5 9.81"
              style={{ stroke: ouro(0.28) }}
            />
          </svg>

          <svg
            viewBox="0 0 168 168"
            className="absolute inset-0 -rotate-90"
            style={{ filter: "drop-shadow(0 0 3px var(--cc-brilho))" }}
          >
            <circle
              cx="84"
              cy="84"
              r="72"
              fill="none"
              stroke="url(#arcoDeProgresso)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 72}
              strokeDashoffset={2 * Math.PI * 72 * (1 - progress / 100)}
            />
            <defs>
              <linearGradient id="arcoDeProgresso" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--cc-ambar)" }} />
                <stop offset="100%" style={{ stopColor: "var(--cc-ouro-claro)" }} />
              </linearGradient>
            </defs>
          </svg>

          <svg viewBox="0 0 168 168" className="absolute inset-0">
            <g
              strokeWidth="2"
              strokeLinecap="round"
              style={{ stroke: ouro(0.85, "--cc-ouro-claro") }}
            >
              <line x1="84" y1="0" x2="84" y2="9" />
              <line x1="168" y1="84" x2="159" y2="84" />
              <line x1="84" y1="168" x2="84" y2="159" />
              <line x1="0" y1="84" x2="9" y2="84" />
            </g>
          </svg>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `rotate(${progress * 3.6}deg) translateY(-72px)`,
            }}
          >
            <span
              className="block h-2 w-2 rounded-full"
              style={{
                background: "var(--cc-brasa)",
                boxShadow: "0 0 14px 4px var(--cc-brilho)",
              }}
            />
          </div>

          <img
            src="/emblemas/Logo Inicio.png"
            alt=""
            width={116}
            height={116}
            className="relative z-10 h-[116px] w-[116px] rounded-full object-contain"
          />
        </div>

        <p className="relative z-10 mt-4 flex items-baseline justify-center gap-0.5 font-mono tabular-nums">
          <span className="text-[3.25rem] leading-none font-light tracking-tight text-white drop-shadow-[0_0_18px_rgba(250,204,21,0.28)]">
            {progress}
          </span>
          <span className="text-lg text-amber-300/90">%</span>
        </p>

        <p className="relative z-10 mt-2 font-mono text-[11px] font-medium tracking-[0.04em] text-amber-400/75">
          {CARREGAMENTO.rodape.coordenadas}
        </p>

        <div className="relative z-10 mt-6 text-left">
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
            <h2 className="truncate font-semibold text-stone-400">
              {CARREGAMENTO.rodape.barraDeProgresso}
            </h2>
            <span className="shrink-0 tabular-nums text-amber-300/85">
              {String(etapa + 1).padStart(2, "0")}
              <span className="text-stone-600">/</span>
              {String(PHASES.length).padStart(2, "0")}
            </span>
          </div>

          <ol className="relative mt-2.5">
            <span
              aria-hidden="true"
              className="absolute top-[18px] bottom-[18px] left-[11px] w-px bg-white/10"
            />
            <span
              aria-hidden="true"
              className="absolute top-[18px] left-[11px] w-px bg-gradient-to-b from-amber-200 to-amber-500 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
              style={{ height: `calc((100% - 36px) * ${trilha})` }}
            />

            {PHASES.map((fase, i) => {
              const cumprida = i < etapa;
              const agora = i === etapa;
              const IconeDaFase = fase.icon;

              return (
                <li
                  key={fase.tag}
                  aria-current={agora ? "step" : undefined}
                  className="relative flex h-9 items-center gap-3"
                >
                  {agora && (
                    <motion.span
                      layoutId="etapa-em-curso"
                      aria-hidden="true"
                      className="absolute inset-y-0.5 -right-2 -left-2 rounded-lg bg-amber-400/[0.07] ring-1 ring-amber-400/15"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}

                  <span
                    className={`relative z-10 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                      cumprida
                        ? "border-amber-300 bg-amber-400 text-stone-950"
                        : agora
                          ? "border-amber-300 bg-superficie-2 text-amber-200 shadow-[0_0_12px_rgba(250,204,21,0.45)]"
                          : "border-white/15 bg-superficie text-stone-600"
                    }`}
                  >
                    {cumprida ? (
                      <Check className="h-3 w-3" strokeWidth={3.5} />
                    ) : agora ? (
                      <IconeDaFase className="h-3 w-3" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-current" />
                    )}
                  </span>

                  <span
                    className={`relative min-w-0 flex-1 truncate text-[12px] font-semibold tracking-wide uppercase transition-colors duration-300 ${
                      agora ? "text-white" : cumprida ? "text-stone-400" : "text-stone-500"
                    }`}
                  >
                    {fase.title}
                  </span>

                  <span
                    className={`relative hidden shrink-0 font-mono text-[10.5px] tracking-[0.16em] transition-colors duration-300 sm:block ${
                      agora ? "text-amber-300" : cumprida ? "text-amber-400/50" : "text-stone-700"
                    }`}
                  >
                    {fase.tag}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-3 h-[2.5rem] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={etapa}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="line-clamp-2 text-[12px] leading-snug text-stone-300 sm:text-[13px]"
              >
                {faseAtual.subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-3 space-y-2.5">
            <div
              className="relative h-3 w-full"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={CARREGAMENTO.rodape.barraDeProgresso}
            >
              <span
                className="absolute inset-x-0 bottom-0 h-[5px]"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, ${ouro(0.22)} 0 1px, transparent 1px 12px)`,
                  WebkitMaskImage:
                    "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
                  maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
                }}
              />

              <span
                className="absolute inset-x-0 bottom-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${ouro(0.45, "--cc-ambar")} 18%, ${ouro(0.55, "--cc-ouro-claro")} 50%, ${ouro(0.45, "--cc-ambar")} 82%, transparent)`,
                }}
              />

              <span
                className="absolute bottom-0 left-0 h-[2px] rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${ouro(0.15, "--cc-ambar")}, var(--cc-ouro-claro))`,
                  boxShadow: "0 0 10px var(--cc-brilho)",
                }}
              />

              {PHASES.slice(0, -1).map((fase) => {
                const passou = progress >= fase.range[1];
                return (
                  <span
                    key={fase.tag}
                    className="absolute bottom-0 w-px transition-all duration-300"
                    style={{
                      left: `${fase.range[1]}%`,
                      height: passou ? 9 : 5,
                      background: passou ? "var(--cc-ouro-claro)" : "rgba(255,255,255,0.2)",
                      boxShadow: passou ? "0 0 8px var(--cc-brilho)" : "none",
                    }}
                  />
                );
              })}

              <span
                className="absolute bottom-0 h-px w-8 -translate-x-1/2"
                style={{
                  left: `${progress}%`,
                  background: "linear-gradient(90deg, transparent, var(--cc-brasa), transparent)",
                  boxShadow: "0 0 14px 2px var(--cc-brilho)",
                }}
              />
            </div>

            <p className="truncate pt-0.5 text-left font-mono text-[11px] text-stone-400">
              <span className="text-amber-400/70">&gt; </span>
              {faseAtual.telemetry}
              <span className="ml-1 inline-block h-3 w-[2px] translate-y-[2px] animate-pulse bg-amber-400/80" />
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

const ESTRELAS_DO_CRUZEIRO = [
  { nome: "Gácrux", x: 96, y: 20, r: 3.2 },
  { nome: "Ácrux", x: 108, y: 222, r: 4.4 },
  { nome: "Mimosa", x: 22, y: 104, r: 3.8 },
  { nome: "Delta", x: 178, y: 86, r: 2.6 },
  { nome: "Épsilon", x: 150, y: 150, r: 2 },
];

const TRAVES_DO_CRUZEIRO: [number, number][] = [
  [0, 1],
  [2, 3],
];

function CruzeiroDoSul({
  acesas,
  completo,
  recuado,
  saltando,
}: {
  acesas: number;
  completo: boolean;
  recuado: boolean;
  saltando: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: saltando ? 0 : recuado ? 0.4 : 1 }}
      transition={{ duration: saltando ? 0.3 : 0.9, ease: SUAVE }}
      className="pointer-events-none fixed top-[15%] right-[6%] z-10 hidden w-[170px] md:block xl:right-[9%] xl:w-[200px]"
    >
      <svg viewBox="0 0 200 250" className="w-full overflow-visible">
        <defs>
          <filter id="brilho-do-cruzeiro" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {TRAVES_DO_CRUZEIRO.map(([de, ate]) => {
          const a = ESTRELAS_DO_CRUZEIRO[de];
          const b = ESTRELAS_DO_CRUZEIRO[ate];
          const tracada = acesas > Math.max(de, ate);
          return (
            <motion.line
              key={`${de}-${ate}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(254,240,138,0.45)"
              strokeWidth="0.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: tracada ? 1 : 0, opacity: completo ? 0.9 : 0.6 }}
              transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            />
          );
        })}

        {ESTRELAS_DO_CRUZEIRO.map((estrela, i) => {
          const acesa = i < acesas;
          return (
            <g key={estrela.nome}>
              <circle cx={estrela.x} cy={estrela.y} r={1} fill="rgba(255,255,255,0.18)" />
              <motion.g
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: acesa ? 1 : 0, scale: acesa ? 1 : 0.2 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{ transformOrigin: `${estrela.x}px ${estrela.y}px` }}
              >
                <circle
                  cx={estrela.x}
                  cy={estrela.y}
                  r={estrela.r * 2.6}
                  fill="rgba(250,204,21,0.55)"
                  filter="url(#brilho-do-cruzeiro)"
                />
                <circle cx={estrela.x} cy={estrela.y} r={estrela.r} fill="#FEF9C3" />
                {estrela.r >= 3.8 && (
                  <path
                    d={`M${estrela.x - estrela.r * 3.4} ${estrela.y}H${estrela.x + estrela.r * 3.4}M${estrela.x} ${estrela.y - estrela.r * 3.4}V${estrela.y + estrela.r * 3.4}`}
                    stroke="rgba(254,249,195,0.55)"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                  />
                )}
              </motion.g>
            </g>
          );
        })}
      </svg>

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: completo ? 1 : 0, y: completo ? 0 : 4 }}
        transition={{ duration: 0.6, ease: SUAVE }}
        className="mt-3 text-center font-mono text-[10px] tracking-[0.3em] text-amber-300/80"
      >
        {CARREGAMENTO.constelacao}
      </motion.p>
    </motion.div>
  );
}

function EscolhaDeDestino({
  textos,
  foco,
  escolhido,
  aoMirar,
  aoEscolher,
  cartoes,
}: {
  textos: TextosDoCarregamento;
  foco: number;
  escolhido: LoadingDestination | null;
  aoMirar: (indice: number, sempreSoar: boolean) => void;
  aoEscolher: (destino: LoadingDestination) => void;
  cartoes: RefObject<(HTMLButtonElement | null)[]>;
}) {
  const { escolha, destinos } = textos;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="mx-auto max-w-3xl">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: SUAVE }}
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/[0.07] px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.08em] text-amber-300 uppercase sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.22em]"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-300 opacity-70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-amber-300" />
          </span>
          <span className="truncate">{escolha.etiqueta}</span>
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transitionEnd: { filter: "none" },
          }}
          transition={{ duration: 0.8, delay: 0.08, ease: SUAVE }}
          className="mt-4 text-balance text-[2rem] leading-[1.1] font-black tracking-tight text-white sm:mt-5 sm:text-5xl xl:text-[3.5rem]"
        >
          {escolha.titulo}{" "}
          <span className="flame-color-shift-text">{escolha.tituloEmDestaque}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: SUAVE }}
          className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-400 sm:mt-4 sm:text-base"
        >
          {escolha.subtitulo}
        </motion.p>
      </div>

      <div className="mx-auto mt-7 grid w-full max-w-[1320px] grid-cols-1 gap-2.5 text-left sm:mt-10 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5">
        {destinos.map((destino, i) => (
          <CartaoDeDestino
            key={destino.id}
            destino={destino}
            indice={i}
            focado={foco === i && (escolhido === null || escolhido === destino.id)}
            aceso={escolhido === destino.id}
            apagado={escolhido !== null && escolhido !== destino.id}
            escolhendo={escolhido !== null}
            rotuloDoBotao={escolha.botaoDoCard}
            rotuloEscolhido={escolha.cardSelecionado}
            aoMirar={aoMirar}
            aoEscolher={aoEscolher}
            registrar={(el) => {
              cartoes.current[i] = el;
            }}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: escolhido ? 0 : 1 }}
        transition={{ duration: 0.5, delay: escolhido ? 0 : 0.8 }}
        className="mx-auto mt-8 hidden w-fit flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl border border-white/[0.06] bg-black/45 px-5 py-2.5 text-[11px] text-stone-400 backdrop-blur-md sm:flex"
      >
        <span className="inline-flex items-center gap-1.5">
          {destinos.map((d) => (
            <Tecla key={d.id}>{d.tecla}</Tecla>
          ))}
          {escolha.atalho.escolher}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Tecla>
            <ArrowLeft className="h-3 w-3" />
          </Tecla>
          <Tecla>
            <ArrowRight className="h-3 w-3" />
          </Tecla>
          {escolha.atalho.mover}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Tecla>
            <CornerDownLeft className="h-3 w-3" />
          </Tecla>
          {escolha.atalho.entrar}
        </span>
      </motion.p>
    </motion.section>
  );
}

function CartaoDeDestino({
  destino: d,
  indice,
  focado,
  aceso,
  apagado,
  escolhendo,
  rotuloDoBotao,
  rotuloEscolhido,
  aoMirar,
  aoEscolher,
  registrar,
}: {
  destino: Destino;
  indice: number;
  focado: boolean;
  aceso: boolean;
  apagado: boolean;
  escolhendo: boolean;
  rotuloDoBotao: string;
  rotuloEscolhido: string;
  aoMirar: (indice: number, sempreSoar: boolean) => void;
  aoEscolher: (destino: LoadingDestination) => void;
  registrar: (el: HTMLButtonElement | null) => void;
}) {
  const emFoco = focado || aceso;

  return (
    <motion.button
      ref={registrar}
      type="button"
      initial={{ opacity: 0, y: 26 }}
      animate={{
        opacity: apagado ? 0.12 : 1,
        y: 0,
        scale: aceso ? 1.03 : apagado ? 0.96 : 1,
        filter: apagado ? "blur(3px)" : "blur(0px)",
      }}
      transition={{
        duration: aceso || apagado ? 0.35 : 0.75,
        delay: escolhendo ? 0 : 0.22 + indice * 0.08,
        ease: SUAVE,
      }}
      whileHover={escolhendo ? undefined : { y: -6 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => aoMirar(indice, true)}
      onMouseMove={() => {
        if (!focado) aoMirar(indice, false);
      }}
      onFocus={() => aoMirar(indice, false)}
      onClick={() => aoEscolher(d.id)}
      aria-label={`${d.titulo} — ${d.subtitulo}`}
      className={`group relative flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-3 pr-3.5 text-left transition-[border-color,background-color,box-shadow] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080706] sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-[26px] sm:p-0 sm:text-center ${
        focado && !aceso ? "borda-viva" : ""
      } ${
        aceso
          ? "border-amber-300 bg-amber-400/[0.09] shadow-[0_0_80px_-12px_rgba(250,204,21,0.6)]"
          : focado
            ? "border-amber-300/55 bg-superficie/90 shadow-[0_28px_70px_-28px_rgba(250,204,21,0.5)]"
            : "border-white/[0.08] bg-fundo/85 hover:border-white/15"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="absolute inset-0 bg-gradient-to-b from-white/[0.045] to-transparent" />
        <span className="absolute inset-x-0 top-0 hidden h-48 bg-[radial-gradient(rgba(250,204,21,0.14)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_65%_85%_at_50%_0%,black,transparent)] sm:block" />
        <span
          className={`absolute top-0 left-1/2 h-44 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-amber-400/25 blur-3xl transition-opacity duration-500 ${
            emFoco ? "opacity-100" : "opacity-0"
          }`}
        />
        <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,rgba(254,240,138,0.14)_50%,transparent_62%)] transition-transform duration-[900ms] ease-out group-hover:translate-x-full" />
      </span>

      {aceso && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-[inherit] border-2 border-amber-300"
          initial={{ opacity: 0.85, scale: 1 }}
          animate={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.7, ease: SUAVE }}
        />
      )}

      <span className="relative hidden items-center justify-between gap-3 px-5 pt-5 sm:flex">
        <span className="flex min-w-0 items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase">
          <span
            className={`font-bold transition-colors ${emFoco ? "text-amber-300" : "text-amber-400/60"}`}
          >
            {d.numero}
          </span>
          <span className="h-3 w-px shrink-0 bg-white/15" />
          <span className="flex min-w-0 items-center gap-1.5 text-stone-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/80" />
            <span className="truncate">{d.situacao}</span>
          </span>
        </span>
        <Tecla acesa={focado}>{d.tecla}</Tecla>
      </span>

      <span className="relative flex shrink-0 items-center justify-center sm:mt-6">
        <Emblema imagem={d.imagem} focado={focado} aceso={aceso} />
      </span>

      <span className="relative min-w-0 flex-1 sm:mt-6 sm:mb-5 sm:flex-none sm:px-5">
        <span className="block truncate font-mono text-[10.5px] font-bold tracking-[0.2em] text-amber-400/70 uppercase sm:text-[10px]">
          {d.etiqueta}
        </span>
        <span
          className={`mt-0.5 block text-[17px] leading-tight font-bold transition-colors sm:mt-1.5 sm:text-xl ${
            emFoco ? "text-amber-50" : "text-white"
          }`}
        >
          {d.titulo}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-amber-300/85 sm:mt-1">
          {d.destaque}
        </span>
        <span className="mt-3 hidden min-h-[4.9em] text-[13px] leading-relaxed text-stone-400 sm:line-clamp-3">
          {d.subtitulo}
        </span>
      </span>

      <span
        className={`relative hidden w-full items-center justify-center gap-1.5 border-t py-3.5 text-sm font-semibold transition-colors sm:mt-auto sm:flex ${
          aceso
            ? "border-amber-300/40 text-amber-100"
            : focado
              ? "border-amber-400/20 text-amber-200"
              : "border-white/[0.06] text-amber-300/70"
        }`}
      >
        {aceso ? rotuloEscolhido : rotuloDoBotao}
        <ArrowRight
          className={`h-4 w-4 transition-transform duration-300 ${emFoco ? "translate-x-1" : ""}`}
        />
      </span>
      <span
        aria-hidden="true"
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors sm:hidden ${
          emFoco
            ? "border-amber-300 bg-amber-400 text-stone-950"
            : "border-white/10 bg-white/[0.04] text-amber-300"
        }`}
      >
        <ArrowRight className="h-4 w-4" />
      </span>
    </motion.button>
  );
}

function Emblema({ imagem, focado, aceso }: { imagem: string; focado: boolean; aceso: boolean }) {
  const emFoco = focado || aceso;

  return (
    <span className="relative flex h-16 w-16 items-center justify-center sm:h-[116px] sm:w-[116px]">
      <Mira ativa={focado} travada={aceso} folga={10} folgaNoCelular={5} />

      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
          emFoco ? "opacity-100" : "opacity-40"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(250,204,21,0.22) 0%, rgba(245,158,11,0.06) 45%, transparent 70%)",
        }}
      />
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-full border transition-colors duration-300 ${
          aceso ? "border-amber-200" : focado ? "border-amber-300/70" : "border-amber-400/20"
        }`}
      />
      <svg
        viewBox="0 0 116 116"
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full sm:block"
      >
        <circle
          className={emFoco ? "anel-de-graus" : undefined}
          cx="58"
          cy="58"
          r="50"
          fill="none"
          stroke={emFoco ? "rgba(250,204,21,0.5)" : "rgba(250,204,21,0.22)"}
          strokeWidth="1"
          strokeDasharray="1.4 8.42"
        />
      </svg>

      <img
        src={imagem}
        alt=""
        className="relative h-12 w-12 rounded-full object-contain transition-transform duration-500 group-hover:scale-105 sm:h-[84px] sm:w-[84px]"
      />

      {aceso && (
        <motion.span
          aria-hidden="true"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 26 }}
          className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-stone-950 ring-4 ring-superficie-2 sm:right-0 sm:bottom-0 sm:h-8 sm:w-8"
        >
          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3.5} />
        </motion.span>
      )}
    </span>
  );
}

const CHAVE_DA_ROTA_ESCOLHIDA = "ceclos_rota_ja_escolhida";

function jaEscolheuRotaAntes(): boolean {
  try {
    return localStorage.getItem(CHAVE_DA_ROTA_ESCOLHIDA) === "sim";
  } catch {
    return false;
  }
}

export function TelaDeCarregamento({
  onComplete,
  onSalto,
  minDuration = 2200,
  isPaused = false,
}: TelaDeCarregamentoProps) {
  const { tocarEfeito, soundEnabled, setSoundEnabled } = useSound();
  const { siteConfig } = useData();

  const textos = useMemo(() => montarCarregamento(siteConfig), [siteConfig]);
  const destinos = textos.destinos;

  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<LoadingDestination | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const lastPhaseRef = useRef<number>(-1);
  const isCompletingRef = useRef(false);
  const cartoes = useRef<(HTMLButtonElement | null)[]>([]);

  const tocarRef = useRef(tocarEfeito);
  tocarRef.current = tocarEfeito;
  const focoRef = useRef(focusedIndex);
  focoRef.current = focusedIndex;

  const alternarSom = useCallback(() => {
    if (soundEnabled) {
      tocarEfeito("desliga");
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      tocarEfeito("liga", { mesmoMudo: true });
    }
  }, [soundEnabled, setSoundEnabled, tocarEfeito]);

  const mirar = useCallback((indice: number, sempreSoar: boolean) => {
    if (isCompletingRef.current) return;
    if (focoRef.current === indice && !sempreSoar) return;
    tocarRef.current("mira", { lado: LADO_DOS_DESTINOS[indice] ?? 0, tom: 1 + indice * 0.06 });
    setFocusedIndex(indice);
  }, []);

  const triggerCompletion = useCallback(
    (destination: LoadingDestination = "home") => {
      if (isCompletingRef.current) return;
      isCompletingRef.current = true;
      try {
        localStorage.setItem(CHAVE_DA_ROTA_ESCOLHIDA, "sim");
      } catch {}
      setSelectedDestination(destination);
      const indice = destinos.findIndex((d) => d.id === destination);
      if (indice !== -1) setFocusedIndex(indice);
      onSalto?.(destination);
      tocarRef.current("salto");

      setTimeout(() => {
        setIsFinished(true);
        if (onComplete) onComplete(destination);
      }, 760);
    },
    [onComplete, onSalto, destinos]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();

      if (key === "s") {
        alternarSom();
        return;
      }
      if (isFinished) return;

      const sobreUmBotao = e.target instanceof Element && !!e.target.closest("button");

      if (showDestinationPicker) {
        const moverPara = (indice: number) => {
          e.preventDefault();
          cartoes.current[indice]?.focus();
          mirar(indice, false);
        };

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          moverPara((focoRef.current + 1) % destinos.length);
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          moverPara((focoRef.current - 1 + destinos.length) % destinos.length);
          return;
        }

        const pelaTecla = destinos.find(
          (d) => e.key === d.tecla || e.code === `Numpad${d.tecla}` || key === d.letra.toLowerCase()
        );
        if (pelaTecla) {
          e.preventDefault();
          triggerCompletion(pelaTecla.id);
        } else if ((e.key === "Enter" || e.key === " ") && !sobreUmBotao) {
          e.preventDefault();
          triggerCompletion(destinos[focoRef.current]?.id ?? "home");
        } else if (e.key === "Escape") {
          e.preventDefault();
          triggerCompletion("home");
        }
      } else if (e.key === "Escape" || (e.key === "Enter" && !sobreUmBotao)) {
        e.preventDefault();
        triggerCompletion("home");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDestinationPicker, isFinished, triggerCompletion, alternarSom, mirar, destinos]);

  const tempoJaCorrido = useRef(0);
  const triggerCompletionRef = useRef(triggerCompletion);
  triggerCompletionRef.current = triggerCompletion;

  useEffect(() => {
    if (isPaused) return;

    const retomadaEm = performance.now();
    let quadro = 0;

    const medir = () => {
      const corrido = tempoJaCorrido.current + (performance.now() - retomadaEm);
      const pct = Math.min(Math.floor((corrido / minDuration) * 100), 100);

      setProgress(pct);

      const phaseIdx = PHASES.findIndex((p) => pct >= p.range[0] && pct <= p.range[1]);
      const safeIdx = phaseIdx !== -1 ? phaseIdx : PHASES.length - 1;

      if (safeIdx !== lastPhaseRef.current) {
        if (lastPhaseRef.current !== -1) {
          tocarRef.current("etapa", { tom: NOTAS_DAS_ETAPAS[safeIdx - 1] ?? 1 });
        }
        lastPhaseRef.current = safeIdx;
        setCurrentPhaseIndex(safeIdx);
      }

      if (pct >= 100) {
        tempoJaCorrido.current = minDuration;
        if (jaEscolheuRotaAntes()) {
          triggerCompletionRef.current("home");
          return;
        }
        setShowDestinationPicker(true);
        return;
      }

      quadro = requestAnimationFrame(medir);
    };

    quadro = requestAnimationFrame(medir);

    return () => {
      cancelAnimationFrame(quadro);
      tempoJaCorrido.current = Math.min(
        tempoJaCorrido.current + (performance.now() - retomadaEm),
        minDuration
      );
    };
  }, [minDuration, isPaused]);

  const { rodape } = CARREGAMENTO;
  const saltando = selectedDestination !== null;

  return (
    <AnimatePresence mode="wait" propagate>
      {!isFinished && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.985,
            filter: "blur(8px)",
            transition: { duration: 0.75, ease: SUAVE },
          }}
          data-tema="escuro"
          className={`tela-de-carregamento fixed inset-0 z-[9999] flex h-[100dvh] w-screen flex-col overflow-y-auto p-3 text-white select-none sm:p-5 lg:p-6 xl:p-8 ${
            saltando ? "pointer-events-none" : ""
          }`}
        >
          <CruzeiroDoSul
            acesas={currentPhaseIndex + 1}
            completo={progress >= 100}
            recuado={showDestinationPicker}
            saltando={saltando}
          />

          {saltando && (
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
              <div className="h-[340px] w-[340px] animate-[warp-expand_0.75s_cubic-bezier(0.16,1,0.3,1)_forwards] rounded-full border-2 border-amber-300/80 bg-radial from-amber-300/40 via-amber-500/15 to-transparent shadow-[0_0_120px_rgba(250,204,21,0.7)]" />
            </div>
          )}

          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: SUAVE }}
            className="escala-4k relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 border-b border-white/[0.07] pb-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] sm:flex">
                <Atom className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] leading-tight font-extrabold tracking-wide text-white uppercase sm:truncate sm:text-sm">
                  {rodape.nomeDoClube}
                </p>
                <p className="hidden items-center gap-1 font-mono text-[10px] text-stone-400 sm:flex">
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-amber-400" />
                  <span className="truncate">{rodape.local}</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                aria-label={rodape.botaoAudio}
                onClick={alternarSom}
                title={soundEnabled ? rodape.dicaSilenciarAudio : rodape.dicaAtivarAudio}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 text-stone-300 transition-colors hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-amber-300" />
                ) : (
                  <VolumeX className="h-4 w-4 text-stone-500" />
                )}
                <span className="hidden font-mono text-[11px] sm:inline">
                  {soundEnabled ? rodape.botaoAudio : rodape.botaoMudo}
                </span>
                <span className="hidden sm:inline-flex">
                  <Tecla>S</Tecla>
                </span>
              </button>

              <button
                type="button"
                onClick={() => triggerCompletion("home")}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-400/10 px-3 text-xs font-semibold whitespace-nowrap text-amber-200 transition-colors hover:bg-amber-400/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                {showDestinationPicker ? rodape.botaoEntrarDireto : rodape.botaoPular}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.header>

          <div className="escala-4k relative z-20 mx-auto my-auto flex w-full max-w-[1600px] flex-col items-center py-5 text-center sm:py-6">
            <AnimatePresence mode="wait">
              {!showDestinationPicker ? (
                <PainelDeCarregamento key="painel" progress={progress} etapa={currentPhaseIndex} />
              ) : (
                <EscolhaDeDestino
                  key="destinos"
                  textos={textos}
                  foco={focusedIndex}
                  escolhido={selectedDestination}
                  aoMirar={mirar}
                  aoEscolher={triggerCompletion}
                  cartoes={cartoes}
                />
              )}
            </AnimatePresence>
          </div>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: saltando ? 0 : 1 }}
            transition={{ duration: 0.6, delay: saltando ? 0 : 0.3 }}
            className="escala-4k relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-center gap-3 pt-2 font-mono text-[10px] tracking-wide text-stone-500 sm:justify-between sm:text-[11px]"
          >
            <span className="hidden sm:inline">{rodape.marcaEsquerda}</span>
            <span className="hidden sm:inline">{rodape.marcaDireita}</span>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
