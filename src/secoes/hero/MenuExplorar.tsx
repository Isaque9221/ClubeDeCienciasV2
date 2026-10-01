import type React from "react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Check,
  Compass,
  Layers,
  Milestone,
  Users,
  GraduationCap,
  Network,
  Megaphone,
  BookOpen,
  FlaskConical,
  HelpCircle,
  Music,
  Command,
  SlidersHorizontal,
  SunMoon,
  Sun,
  Moon,
} from "lucide-react";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";
import { teclaDeComando } from "@/recursos/sistema/acoes";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import type { Aparencia } from "@/compartilhado/contextos/preferencias-context";
import { montarExplorar, type ItemDoExplorar } from "./conteudo";

const ICONES: Record<string, React.ElementType> = {
  Compass,
  Layers,
  Milestone,
  Users,
  GraduationCap,
  Network,
  Megaphone,
  BookOpen,
  FlaskConical,
  HelpCircle,
};

const TEMAS: { valor: Aparencia; rotulo: string; icone: React.ElementType }[] = [
  { valor: "auto", rotulo: "Automático", icone: SunMoon },
  { valor: "claro", rotulo: "Claro", icone: Sun },
  { valor: "escuro", rotulo: "Escuro", icone: Moon },
];

const LINHA =
  "group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-left outline-none transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-[var(--foco)]";

function secaoEmVista(ids: string[]): string | null {
  const meio = window.innerHeight * 0.4;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= meio && r.bottom > meio) return id;
  }
  return null;
}

function Titulo({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      role="presentation"
      className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-stone-400"
    >
      {children}
    </div>
  );
}

export interface MenuExplorarProps {
  compacto?: boolean;
  onOpenMembers?: () => void;
  onOpenProjects?: () => void;
  onOpenTrajetoria?: () => void;
}

export function MenuExplorar({
  compacto = false,
  onOpenMembers,
  onOpenProjects,
  onOpenTrajetoria,
}: MenuExplorarProps) {
  const { playSound, playerVisivel, desligarMusica, ligarMusica } = useSound();
  const { siteConfig } = useData();
  const EXPLORAR = montarExplorar(siteConfig);
  const { abrirJanela, preferencias, mudar } = usePreferencias();
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, right: 0, esquerda: 0, estreito: false });
  const [atual, setAtual] = useState<string | null>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const secoes = EXPLORAR.itens.filter((item) => item.rolarPara);
  const paginas = EXPLORAR.itens.filter((item) => item.abrirPagina);

  const itensDoMenu = () =>
    Array.from(painelRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);

  const fechar = (devolverFoco: boolean) => {
    setAberto(false);
    if (devolverFoco) botaoRef.current?.focus();
  };

  useEffect(() => {
    if (!aberto) return;

    const quadro = requestAnimationFrame(() => itensDoMenu()[0]?.focus({ preventScroll: true }));

    const cliqueFora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (botaoRef.current?.contains(alvo)) return;
      if (painelRef.current?.contains(alvo)) return;
      setAberto(false);
    };
    const tecla = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const aoRolar = (e: Event) => {
      if (painelRef.current?.contains(e.target as Node)) return;
      setAberto(false);
    };

    document.addEventListener("mousedown", cliqueFora);
    document.addEventListener("keydown", tecla);
    window.addEventListener("scroll", aoRolar, true);
    window.addEventListener("resize", aoRolar);
    return () => {
      cancelAnimationFrame(quadro);
      document.removeEventListener("mousedown", cliqueFora);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", aoRolar, true);
      window.removeEventListener("resize", aoRolar);
    };
  }, [aberto, compacto]);

  const alternar = () => {
    playSound("subtle-click");
    setAberto((estavaAberto) => {
      if (!estavaAberto && botaoRef.current) {
        setAtual(secaoEmVista(secoes.map((s) => s.rolarPara as string)));
        const r = botaoRef.current.getBoundingClientRect();
        const largura = Math.min(496, window.innerWidth - 24);
        setPosicao({
          top: r.bottom + 10,
          right: Math.max(8, window.innerWidth - r.right),
          esquerda: Math.min(
            Math.max(12, r.left + r.width / 2 - largura / 2),
            window.innerWidth - largura - 12
          ),
          estreito: window.innerWidth < 640,
        });
      }
      return !estavaAberto;
    });
  };

  const aoTeclarNoMenu = (e: KeyboardEvent<HTMLDivElement>) => {
    const itens = itensDoMenu();
    const agora = itens.indexOf(document.activeElement as HTMLElement);
    const irPara = (i: number) => {
      e.preventDefault();
      itens[(i + itens.length) % itens.length]?.focus();
    };
    if (e.key === "ArrowDown") irPara(agora + 1);
    else if (e.key === "ArrowUp") irPara(agora - 1);
    else if (e.key === "Home") irPara(0);
    else if (e.key === "End") irPara(itens.length - 1);
    else if (e.key === "Tab") setAberto(false);
  };

  const abrirItem = (item: ItemDoExplorar) => {
    playSound("subtle-click");
    fechar(false);

    if (item.abrirPagina === "trajetoria") {
      onOpenTrajetoria?.();
      return;
    }
    if (item.abrirPagina === "membros") {
      onOpenMembers?.();
      return;
    }
    if (item.abrirPagina === "projetos") {
      onOpenProjects?.();
      return;
    }
    if (item.rolarPara) {
      const alvo = document.getElementById(item.rolarPara);
      if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
    }
  };

  const alternarMusica = () => {
    playSound("subtle-click");
    if (playerVisivel) {
      desligarMusica();
    } else {
      ligarMusica();
    }
  };

  const escolherTema = (valor: Aparencia) => {
    playSound("subtle-click");
    mudar("aparencia", valor);
  };

  const abrirSistema = (janela: "ajustes" | "comandos") => {
    playSound("subtle-click");
    fechar(false);
    abrirJanela(janela);
  };

  const lista = (
    <>
      <div role="group" aria-labelledby={`${id}-nesta-pagina`}>
        <Titulo id={`${id}-nesta-pagina`}>Nesta página</Titulo>
        <div
          className={compacto || posicao.estreito ? "grid grid-cols-1" : "grid grid-cols-2 gap-x-1"}
        >
          {secoes.map((item) => {
            const Icone = ICONES[item.icone] || Compass;
            const aqui = atual === item.rolarPara;
            return (
              <button
                key={item.rotulo}
                type="button"
                role="menuitem"
                tabIndex={-1}
                title={item.descricao}
                aria-current={aqui ? "location" : undefined}
                onClick={() => abrirItem(item)}
                className={`${LINHA} min-h-9`}
              >
                <Icone
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 ${aqui ? "text-yellow-400" : "text-stone-400 group-hover:text-white"}`}
                />
                <span
                  className={`min-w-0 flex-1 truncate text-[13px] ${aqui ? "font-semibold text-white" : "font-medium text-stone-200 group-hover:text-white"}`}
                >
                  {item.rotulo}
                </span>
                {aqui && (
                  <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div role="separator" className="mx-2.5 my-1.5 h-px bg-white/10" />

      <div role="group" aria-labelledby={`${id}-paginas`}>
        <Titulo id={`${id}-paginas`}>Páginas</Titulo>
        {paginas.map((item) => {
          const Icone = ICONES[item.icone] || Compass;
          return (
            <button
              key={item.rotulo}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => abrirItem(item)}
              className={`${LINHA} min-h-12 py-1.5`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
                <Icone aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-semibold text-white">
                    {item.rotulo}
                  </span>
                  {item.novo && (
                    <span className="shrink-0 rounded-full bg-yellow-400 px-1.5 text-[10px] font-bold text-stone-950">
                      Novo
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-stone-400">{item.descricao}</span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
              />
            </button>
          );
        })}
      </div>

      <div role="separator" className="mx-2.5 my-1.5 h-px bg-white/10" />

      <div role="group" aria-labelledby={`${id}-tema`}>
        <Titulo id={`${id}-tema`}>Tema</Titulo>
        <div className="mx-1.5 mb-1 grid grid-cols-3 gap-1 rounded-xl bg-black/25 p-1">
          {TEMAS.map((tema) => {
            const marcado = preferencias.aparencia === tema.valor;
            return (
              <button
                key={tema.valor}
                type="button"
                role="menuitemradio"
                tabIndex={-1}
                aria-checked={marcado}
                onClick={() => escolherTema(tema.valor)}
                className={`flex min-h-10 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--foco)] sm:flex-row sm:gap-1.5 sm:text-xs ${
                  marcado
                    ? "bg-yellow-400 text-stone-950 shadow-sm"
                    : "text-stone-300 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <tema.icone aria-hidden="true" className="h-3.5 w-3.5" />
                {tema.rotulo}
              </button>
            );
          })}
        </div>
      </div>

      <div role="separator" className="mx-2.5 my-1.5 h-px bg-white/10" />

      <div
        className={compacto || posicao.estreito ? "grid grid-cols-1" : "grid grid-cols-3 gap-x-1"}
      >
        <button
          type="button"
          role="menuitemcheckbox"
          tabIndex={-1}
          aria-checked={playerVisivel}
          onClick={alternarMusica}
          className={`${LINHA} min-h-9`}
        >
          <Music
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-stone-400 group-hover:text-white"
          />
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-200 group-hover:text-white">
            Música
          </span>
          <span
            aria-hidden="true"
            className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${playerVisivel ? "bg-yellow-400" : "bg-white/15"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-[#fffdf9] shadow transition-transform ${playerVisivel ? "translate-x-3" : ""}`}
            />
          </span>
        </button>
        {[
          {
            rotulo: "Ajustes…",
            icone: SlidersHorizontal,
            atalho: `${teclaDeComando()} ,`,
            teclas: "Control+, Meta+,",
            janela: "ajustes" as const,
          },
          {
            rotulo: "Comandos…",
            icone: Command,
            atalho: `${teclaDeComando()} K`,
            teclas: "Control+K Meta+K",
            janela: "comandos" as const,
          },
        ].map((item) => (
          <button
            key={item.rotulo}
            type="button"
            role="menuitem"
            tabIndex={-1}
            aria-keyshortcuts={item.teclas}
            onClick={() => abrirSistema(item.janela)}
            className={`${LINHA} min-h-9`}
          >
            <item.icone
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-stone-400 group-hover:text-white"
            />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-200 group-hover:text-white">
              {item.rotulo}
            </span>
            <kbd className="hidden shrink-0 font-sans text-[11px] text-stone-400 sm:inline">
              {item.atalho}
            </kbd>
          </button>
        ))}
      </div>
    </>
  );

  const molduraDoPainel =
    "vidro vidro-denso rounded-[22px] border p-1.5 text-left select-none overflow-y-auto overscroll-contain";

  const painel = (
    <motion.div
      ref={painelRef}
      id={`${id}-menu`}
      role="menu"
      aria-label={EXPLORAR.titulo}
      onKeyDown={aoTeclarNoMenu}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      style={{
        top: posicao.top,
        maxHeight: `calc(100dvh - ${posicao.top + 16}px)`,
        ...(compacto
          ? { right: posicao.right }
          : posicao.estreito
            ? { left: 12, right: 12 }
            : { left: posicao.esquerda, width: 496 }),
      }}
      className={
        compacto
          ? `fixed z-[999] w-[17.5rem] max-w-[calc(100vw-1rem)] origin-top-right ${molduraDoPainel}`
          : `fixed z-[999] origin-top ${molduraDoPainel}`
      }
    >
      {lista}
    </motion.div>
  );

  return (
    <div className="relative shrink-0">
      <button
        ref={botaoRef}
        type="button"
        onClick={alternar}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !aberto) {
            e.preventDefault();
            alternar();
          }
        }}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-controls={aberto ? `${id}-menu` : undefined}
        title={EXPLORAR.titulo}
        className={
          compacto
            ? `flex items-center gap-1 px-2 py-1 rounded-full text-[10.5px] font-bold tracking-tight cursor-pointer transition-colors shrink-0 border ${
                aberto
                  ? "border-amber-400/60 bg-amber-400/20 text-yellow-200"
                  : "border-white/10 bg-white/[0.05] text-stone-200 hover:text-white"
              }`
            : `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-tight cursor-pointer transition-all duration-200 border ${
                aberto
                  ? "border-amber-400/60 bg-amber-400/20 text-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  : "border-white/10 bg-white/[0.04] text-stone-300 hover:text-white hover:bg-white/[0.08] hover:border-amber-400/30"
              }`
        }
      >
        <LayoutGrid
          aria-hidden="true"
          className={`${compacto ? "h-3 w-3" : "h-3.5 w-3.5"} text-yellow-400 shrink-0`}
        />
        <span>{EXPLORAR.rotulo}</span>
        <ChevronDown
          aria-hidden="true"
          className={`${compacto ? "h-2.5 w-2.5" : "h-3 w-3"} text-stone-400 transition-transform duration-200 ${
            aberto ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <nav aria-label="Explorar o site">
            <AnimatePresence>{aberto && painel}</AnimatePresence>
          </nav>,
          document.body
        )}
    </div>
  );
}
