import { useMemo, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Award } from "lucide-react";
import type { Member } from "@/compartilhado/tipos/member.types";
import { getIconComponent } from "@/compartilhado/utils/icons";
import { useSound } from "@/compartilhado/hooks/useSound";
import { AnimatedNumber } from "@/compartilhado/componentes";

export interface MuralDeMembrosProps {
  membros: Member[];
  total: number;
  onSelect: (m: Member) => void;
  titulo?: string;
  destaque?: string;
  legenda?: string;
}

function Retrato({ membro, onSelect }: { membro: Member; onSelect: (m: Member) => void }) {
  const { playSound } = useSound();
  const [erro, setErro] = useState(false);
  const temFoto = Boolean(membro.image) && !erro;
  const Icone = getIconComponent(membro.iconName);

  return (
    <button
      type="button"
      onClick={() => {
        playSound("pop-bubble");
        onSelect(membro);
      }}
      aria-label={`Abrir a ficha de ${membro.name}`}
      data-tema="escuro"
      className="group/rosto pointer-events-auto relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-fundo-profundo outline-none transition-[border-color,box-shadow,transform] duration-300 hover:z-10 hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-[0_12px_32px_rgba(0,0,0,0.75),0_0_24px_rgba(245,158,11,0.35)] focus-visible:z-10 focus-visible:border-amber-400 cursor-pointer sm:h-28 sm:w-[5.25rem] sm:rounded-xl"
    >
      <span className="block h-full w-full [filter:saturate(0.85)_brightness(0.94)] transition-[filter] duration-500 group-hover/rosto:[filter:saturate(1.08)_brightness(1.06)] group-focus-visible/rosto:[filter:saturate(1.08)_brightness(1.06)]">
        {temFoto ? (
          <img
            src={membro.image}
            alt=""
            loading="lazy"
            className={`photo-soft photo-soft-sm h-full w-full object-cover ${
              membro.imagePosition || "object-center"
            } transition-transform duration-700 ease-out group-hover/rosto:scale-105`}
            onError={() => setErro(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-b from-stone-900 to-black">
            <Icone className="h-5 w-5 text-stone-700 sm:h-7 sm:w-7" />
          </span>
        )}
      </span>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-1.5 pb-1 pt-4 transition-transform duration-300 ease-out sm:translate-y-full sm:group-hover/rosto:translate-y-0 sm:group-focus-visible/rosto:translate-y-0">
        <span className="block truncate text-[10.5px] font-bold leading-tight text-white sm:text-[10.5px]">
          {membro.name.split(" ")[0]}
        </span>
        {membro.num && (
          <span className="block truncate font-mono text-[10px] leading-tight text-amber-300/90 sm:text-[11px]">
            Nº {membro.num}
          </span>
        )}
      </span>

      <span className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-transform duration-300 group-hover/rosto:scale-x-100" />
    </button>
  );
}

function Fileira({
  membros,
  onSelect,
  duracao,
  aoContrario = false,
  parado,
  profundidade = 0,
  opacidade = 1,
  className = "",
}: {
  membros: Member[];
  onSelect: (m: Member) => void;
  duracao: number;
  aoContrario?: boolean;
  parado: boolean;
  profundidade?: number;
  opacidade?: number;
  className?: string;
}) {
  if (membros.length === 0) return null;

  const lista = parado ? membros : [...membros, ...membros];

  return (
    <div
      className={`pointer-events-none flex overflow-hidden ${className}`}
      style={{
        transform: `translateZ(${profundidade}px)`,
        opacity: opacidade,
      }}
    >
      <div
        className={`pointer-events-none flex shrink-0 gap-2 pr-2 sm:gap-3 sm:pr-3 ${parado ? "" : "mural-fileira"}`}
        data-sentido={aoContrario ? "reverso" : "normal"}
        style={{ "--mural-duracao": `${duracao}s` } as CSSProperties}
      >
        {lista.map((membro, i) => (
          <Retrato key={`${membro.id}-${i}`} membro={membro} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

const DECLARACAO = {
  frase: "Ciência de verdade, feita na escola pública do",
  destaque: "semiárido baiano.",

  provas: ["FECIBA 2025 · 2026", "2º lugar · Edital FAPESB 017/2025", "VII Seminário do Sisal"],
};

export function MuralDeMembros({
  membros,
  total,
  onSelect,
  titulo = "Uma turma inteira",
  destaque = "fazendo ciência",
  legenda = "Cada rosto abre a ficha completa",
}: MuralDeMembrosProps) {
  const reduzirMovimento = useReducedMotion();

  const fileiras = useMemo(() => {
    const comFoto = membros.filter((m) => m.image);
    const semFoto = membros.filter((m) => !m.image);
    const lista = [...comFoto, ...semFoto];

    const grupos: Member[][] = [[], [], []];
    lista.forEach((m, i) => grupos[i % 3].push(m));
    return grupos;
  }, [membros]);

  if (membros.length === 0) return null;

  return (
    <section className="relative z-10 my-8 overflow-hidden border-y border-amber-400/20 bg-fundo-profundo sm:my-16">
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[760px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] blur-3xl" />

      <div className="relative grid items-center gap-6 py-8 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="px-4 text-center sm:px-8 lg:pl-14 lg:pr-0 lg:text-left"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/[0.07] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ouro sm:px-3.5 sm:py-1 sm:text-[10px]">
            <Sparkles className="h-2.5 w-2.5 text-amber-400 sm:h-3 sm:w-3" />
            CECLOS · 2026
          </span>

          <h2 className="mt-2.5 text-xl font-black leading-[1.06] tracking-tight text-white text-balance sm:mt-4 sm:text-4xl lg:text-5xl xl:text-6xl">
            {titulo} <span className="golden-metallic-text">{destaque}</span>
          </h2>

          <div className="mt-4 flex items-center justify-center gap-3 sm:mt-6 sm:gap-4 lg:justify-start">
            <span className="font-mono text-4xl font-black leading-[0.85] text-ouro drop-shadow-[0_0_24px_rgba(245,158,11,0.4)] sm:text-6xl lg:text-7xl">
              <AnimatedNumber value={String(total)} />
            </span>

            <span className="border-l border-amber-400/30 pl-3 text-left sm:pl-4">
              <span className="block text-[10px] font-black uppercase leading-tight tracking-[0.16em] text-white sm:text-sm">
                integrantes
              </span>
              <span className="block font-mono text-[10px] uppercase leading-tight tracking-[0.14em] text-stone-500 sm:text-[11px]">
                ativos no clube
              </span>
            </span>
          </div>

          <div className="mx-auto mt-4 max-w-md border-l-2 border-amber-400/60 pl-3 text-left sm:mt-6 sm:pl-4 lg:mx-0">
            <p className="text-sm font-bold leading-snug text-white text-balance sm:text-lg">
              {DECLARACAO.frase} <span className="golden-metallic-text">{DECLARACAO.destaque}</span>
            </p>

            <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
              {DECLARACAO.provas.map((prova) => (
                <span
                  key={prova}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ouro sm:rounded-lg sm:px-2 sm:py-1 sm:text-[11px]"
                >
                  <Award className="h-2.5 w-2.5 shrink-0 text-amber-400 sm:h-3 sm:w-3" />
                  {prova}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400 sm:mt-6 sm:text-[11px]">
            {legenda}
          </p>
        </motion.div>

        <div className="mural-palco relative overflow-hidden sm:[perspective-origin:0%_50%] sm:[perspective:1400px]">
          <div className="mural-parede pointer-events-none py-2 [transform:rotate(-2deg)] sm:[transform-style:preserve-3d] sm:[transform:rotateY(11deg)_rotateZ(-2.5deg)]">
            <div className="pointer-events-none space-y-2 sm:space-y-3">
              <Fileira
                membros={fileiras[0]}
                onSelect={onSelect}
                duracao={68}
                parado={!!reduzirMovimento}
                profundidade={-55}
                opacidade={0.72}
              />
              <Fileira
                membros={fileiras[1]}
                onSelect={onSelect}
                duracao={54}
                aoContrario
                parado={!!reduzirMovimento}
              />
              <Fileira
                membros={fileiras[2]}
                onSelect={onSelect}
                duracao={82}
                parado={!!reduzirMovimento}
                profundidade={-28}
                opacidade={0.86}
                className="max-sm:hidden"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-fundo-profundo to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-fundo-profundo via-fundo-profundo/70 to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-x-0 -top-1 h-7 bg-gradient-to-b from-fundo-profundo to-transparent sm:h-14" />
          <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-7 bg-gradient-to-t from-fundo-profundo to-transparent sm:h-14" />
        </div>
      </div>
    </section>
  );
}
