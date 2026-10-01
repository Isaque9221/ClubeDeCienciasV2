import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Member } from "@/compartilhado/tipos/member.types";
import { getIconComponent } from "@/compartilhado/utils/icons";
import { resolveMemberArea, hasCustomQuote } from "@/compartilhado/utils/member";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useFocoNaJanela } from "@/compartilhado/hooks/useFocoNaJanela";
import { corLegivel } from "@/compartilhado/utils/cor-legivel";

interface MemberModalProps {
  member: Member | null;
  onClose: () => void;
  lista?: Member[];
  aoTrocar?: (membro: Member) => void;
}

const DISTANCIA_DO_GESTO = 70;

function primeiroNome(membro: Member): string {
  return membro.name.replace(/^Prof(a)?.s+/, "").split(" ")[0];
}

export function MemberModal({ member, onClose, lista, aoTrocar }: MemberModalProps) {
  const { playSound } = useSound();
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const janelaRef = useRef<HTMLDivElement>(null);
  useFocoNaJanela(!!member, janelaRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [member]);

  useEffect(() => {
    if (!member) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [member, onClose]);

  const posicao = member && lista ? lista.findIndex((m) => m.id === member.id) : -1;
  const podeNavegar = !!aoTrocar && !!lista && lista.length > 1 && posicao >= 0;
  const anterior = podeNavegar ? lista[(posicao - 1 + lista.length) % lista.length] : null;
  const proximo = podeNavegar ? lista[(posicao + 1) % lista.length] : null;

  const irPara = (destino: Member | null) => {
    if (!destino || !aoTrocar) return;
    playSound("subtle-click");
    aoTrocar(destino);
  };

  useEffect(() => {
    if (!podeNavegar) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") irPara(proximo);
      if (e.key === "ArrowLeft") irPara(anterior);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  useEffect(() => {
    for (const vizinho of [anterior, proximo]) {
      if (vizinho?.image) {
        const imagem = new Image();
        imagem.src = vizinho.image;
      }
    }
  }, [anterior, proximo]);

  const displayArea = member ? resolveMemberArea(member) : "";
  const showQuote = member ? hasCustomQuote(member) : false;

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {member && (
        <div
          className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99990] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99990,
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              playSound("subtle-click");
              onClose();
            }}
            className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-xl"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            ref={janelaRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-do-perfil"
            aria-roledescription={podeNavegar ? "carrossel de perfis" : undefined}
            onClick={(e) => e.stopPropagation()}
            drag={podeNavegar ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragSnapToOrigin
            onDragEnd={(_evento, gesto) => {
              if (gesto.offset.x <= -DISTANCIA_DO_GESTO) irPara(proximo);
              else if (gesto.offset.x >= DISTANCIA_DO_GESTO) irPara(anterior);
            }}
            className="relative z-10 w-full max-w-3xl my-auto max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-yellow-400/40 bg-gradient-to-b from-superficie-3 via-superficie to-fundo-profundo shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(250,204,21,0.2)]"
            style={{
              boxShadow: `0 0 80px ${member.color}25, 0 30px 90px rgba(0,0,0,0.9)`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                playSound("subtle-click");
                onClose();
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white/90 hover:text-white hover:border-yellow-400 hover:bg-yellow-400/25 transition-all cursor-pointer shadow-lg"
              title="Fechar (Esc)"
              aria-label="Fechar perfil"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-0">
              <div
                data-tema="escuro"
                className="sm:col-span-5 relative h-52 sm:h-auto min-h-[200px] sm:min-h-[300px] overflow-hidden bg-stone-950"
              >
                {member.image && !imgError ? (
                  <motion.img
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    draggable={false}
                    src={member.image}
                    alt={member.name}
                    className={`photo-soft photo-soft-lg h-full w-full object-cover ${
                      member.imagePosition || "object-center"
                    }`}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-b from-stone-900 to-black p-6 sm:p-8">
                    <div
                      className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-2xl sm:rounded-3xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                      style={{ backgroundColor: `${member.color}15` }}
                    >
                      {(() => {
                        const Icon = getIconComponent(member.iconName);
                        return (
                          <Icon
                            className="h-12 w-12 sm:h-16 sm:w-16"
                            style={{ color: corLegivel(member.color) }}
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-14 sm:h-16 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10.5px] sm:text-[10px] font-mono font-black uppercase tracking-widest backdrop-blur-md border shadow-lg"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.75)",
                      borderColor: `${member.color}60`,
                      color: corLegivel(member.color),
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: member.color }}
                    />
                    Nº {member.num || "00"}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-7 p-4 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10.5px] sm:text-[10px] font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: `${member.color}15`,
                        borderColor: `${member.color}40`,
                        color: corLegivel(member.color),
                      }}
                    >
                      {(() => {
                        const Icon = getIconComponent(member.iconName);
                        return <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
                      })()}
                      {member.role}
                    </span>
                  </div>

                  <div>
                    <h3
                      id="titulo-do-perfil"
                      className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight"
                    >
                      {member.name}
                    </h3>
                    <div className="mt-1.5 sm:mt-2 space-y-0.5">
                      <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-ambar flex items-center gap-1.5">
                        <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-ambar" />
                        {member.category === "lideranca"
                          ? "Área de Atuação & Docência:"
                          : "Profissão dos Sonhos:"}
                      </p>
                      <p className="text-xs sm:text-sm font-mono text-ouro-2 font-semibold">
                        {displayArea}
                      </p>
                    </div>
                  </div>

                  {showQuote && (
                    <div
                      className="relative rounded-xl sm:rounded-2xl border p-3 sm:p-4 backdrop-blur-sm"
                      style={{
                        backgroundColor: `${member.color}08`,
                        borderColor: `${member.color}30`,
                      }}
                    >
                      <p className="text-[11px] sm:text-sm italic text-stone-200 leading-relaxed">
                        "{member.quote}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="border-t border-white/10 pt-3 sm:pt-4 flex items-center justify-between text-[11px] sm:text-xs text-stone-400 font-mono">
                    <span className="flex items-center gap-1.5 text-stone-300">
                      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
                      Membro Ativo · CECLOS
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-ouro-2">{member.tag}</span>
                  </div>

                  {podeNavegar && anterior && proximo && (
                    <nav
                      aria-label="Outros perfis"
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 p-1"
                    >
                      <button
                        type="button"
                        onClick={() => irPara(anterior)}
                        aria-label={`Perfil anterior: ${anterior.name}`}
                        title="Anterior (←)"
                        className="group flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-left text-xs font-semibold text-stone-300 transition-colors hover:bg-yellow-400/10 hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4 shrink-0 text-ouro transition-transform group-hover:-translate-x-0.5" />
                        <span className="truncate">{primeiroNome(anterior)}</span>
                      </button>
                      <span
                        aria-live="polite"
                        className="shrink-0 px-1 font-mono text-[11px] tabular-nums text-stone-400"
                      >
                        {posicao + 1} de {lista!.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => irPara(proximo)}
                        aria-label={`Próximo perfil: ${proximo.name}`}
                        title="Próximo (→)"
                        className="group flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-end gap-1.5 rounded-lg px-2.5 text-right text-xs font-semibold text-stone-300 transition-colors hover:bg-yellow-400/10 hover:text-white"
                      >
                        <span className="truncate">{primeiroNome(proximo)}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-ouro transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </nav>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
