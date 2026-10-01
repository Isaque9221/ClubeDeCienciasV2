import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  X,
  SlidersHorizontal,
  Play,
  Pause,
  Headphones,
  MousePointerClick,
  Volume2,
} from "lucide-react";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useForaDoHero, useFocoNaJanela } from "@/compartilhado/hooks";
import { useTelaPequena } from "@/compartilhado/hooks/useTelaPequena";
import { SOUND_PRESETS } from "@/compartilhado/dados/sound.data";
import { ButtonSoundsTab } from "./ButtonSoundsTab";
import { BgMusicTab } from "./BgMusicTab";
import { AUDIO } from "./conteudo";
import { EVENTO_ABRIR_PLAYER } from "@/recursos/sistema/acoes";

const ABAS = [
  { id: "bgmusic" as const, rotulo: AUDIO.janela.abaTrilha, icone: Music },
  { id: "buttons" as const, rotulo: AUDIO.janela.abaCliques, icone: MousePointerClick },
];

export const SoundSelectorModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"bgmusic" | "buttons">("bgmusic");
  const [mounted, setMounted] = useState(false);
  const janelaRef = useRef<HTMLDivElement>(null);
  useFocoNaJanela(isOpen, janelaRef);

  const {
    currentSound,
    isBgMusicPlaying,
    toggleBgMusicPlay,
    selectedTrack,
    activePlaylist,
    playSound,
    playerVisivel,
  } = useSound();

  const telaPequena = useTelaPequena();
  const foraDoHero = useForaDoHero();

  useEffect(() => {
    setMounted(true);
    const abrir = () => setIsOpen(true);
    window.addEventListener(EVENTO_ABRIR_PLAYER, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_PLAYER, abrir);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentPresetInfo = SOUND_PRESETS.find((p) => p.id === currentSound);

  const escondido = telaPequena && !foraDoHero;

  return (
    <>
      <AnimatePresence>
        {playerVisivel && (
          <motion.div
            key="player-flutuante"
            data-nao-imprimir=""
            className="fixed bottom-4 right-4 z-[90] flex items-center select-none"
            data-sound-control="true"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{
              opacity: escondido ? 0 : 1,
              y: escondido ? 16 : 0,
              scale: escondido ? 0.9 : 1,
              pointerEvents: escondido ? "none" : "auto",
            }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="group/player flex items-center gap-1 rounded-full border vidro p-1 transition-colors duration-300 hover:border-yellow-400/40">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound("subtle-click");
                  toggleBgMusicPlay();
                }}
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 cursor-pointer ${
                  isBgMusicPlaying
                    ? "bg-yellow-400 text-stone-950"
                    : "bg-white/[0.07] text-stone-200 hover:bg-white/[0.12]"
                }`}
                title={isBgMusicPlaying ? "Pausar música" : "Tocar música"}
                aria-label={isBgMusicPlaying ? "Pausar música" : "Tocar música"}
              >
                {isBgMusicPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current translate-x-[1px]" />
                )}

                {isBgMusicPlaying && (
                  <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-yellow-400/60" />
                )}
              </button>

              {isBgMusicPlaying && (
                <span className="equalizador ml-1 text-yellow-400/90" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  setIsOpen(true);
                }}
                className="hidden sm:flex max-w-0 items-center overflow-hidden whitespace-nowrap text-left opacity-0 transition-all duration-300 ease-out group-hover/player:max-w-[190px] group-hover/player:pl-1.5 group-hover/player:pr-1 group-hover/player:opacity-100 cursor-pointer"
                tabIndex={-1}
                aria-hidden="true"
              >
                <span className="flex flex-col min-w-0">
                  <span className="truncate text-[11px] font-semibold text-white leading-tight">
                    {(selectedTrack?.title || "Plantasia").replace(/^\s*\d{1,3}\s*[.)\-–]\s*/, "")}
                  </span>
                  <span className="truncate text-[10.5px] font-mono text-stone-400 leading-tight">
                    {isBgMusicPlaying ? "Tocando agora" : "Trilha sonora"}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  setIsOpen(true);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-white/[0.08] hover:text-yellow-300 cursor-pointer"
                title={AUDIO.botaoFlutuante.dica}
                aria-label={AUDIO.botaoFlutuante.dica}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
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
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-2xl"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 14 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  ref={janelaRef}
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="titulo-do-player"
                  className="relative z-10 my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-superficie bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(250,204,21,0.08),transparent_70%)] p-4 sm:p-6 text-stone-100 shadow-[0_30px_80px_rgba(0,0,0,0.9)] space-y-4 sm:space-y-5"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3 sm:pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/20 to-amber-500/5 text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
                        <Headphones className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-yellow-400/80">
                          CECLOS · Áudio
                        </span>
                        <h3
                          id="titulo-do-player"
                          className="truncate text-base sm:text-lg font-black tracking-tight text-white"
                        >
                          Escolha sua trilha
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-stone-400 transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                      title={AUDIO.janela.dicaDeFechar}
                      aria-label={AUDIO.janela.dicaDeFechar}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Configurações de áudio"
                    className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-black/40 p-1"
                  >
                    {ABAS.map((aba) => {
                      const ativa = activeTab === aba.id;
                      const Icone = aba.icone;
                      return (
                        <button
                          key={aba.id}
                          id={`aba-do-player-${aba.id}`}
                          type="button"
                          role="tab"
                          aria-selected={ativa}
                          aria-controls="painel-do-player"
                          tabIndex={ativa ? 0 : -1}
                          onClick={() => {
                            playSound("subtle-click");
                            setActiveTab(aba.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                            e.preventDefault();
                            const outra = ABAS.find((a) => a.id !== aba.id);
                            if (!outra) return;
                            setActiveTab(outra.id);
                            document.getElementById(`aba-do-player-${outra.id}`)?.focus();
                          }}
                          className={`relative flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer ${
                            ativa ? "text-stone-950" : "text-stone-400 hover:text-stone-100"
                          }`}
                        >
                          {ativa && (
                            <motion.span
                              layoutId="aba-do-player"
                              className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-400 shadow-[0_4px_16px_rgba(250,204,21,0.3)]"
                              transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            />
                          )}
                          <Icone className="relative z-10 h-3.5 w-3.5" />
                          <span className="relative z-10">{aba.rotulo}</span>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeTab}
                      id="painel-do-player"
                      role="tabpanel"
                      aria-labelledby={`aba-do-player-${activeTab}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {activeTab === "bgmusic" ? <BgMusicTab /> : <ButtonSoundsTab />}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3 font-mono text-[10px] text-stone-500">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Volume2 className="h-3 w-3 shrink-0 text-yellow-400/70" />
                      <span className="truncate">
                        {activeTab === "bgmusic"
                          ? activePlaylist?.title || "Plantasia"
                          : currentPresetInfo?.name || "Clique Moderno"}
                      </span>
                    </span>
                    <span className="shrink-0 text-stone-500">Web Audio</span>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
