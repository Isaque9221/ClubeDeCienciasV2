import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";
import { useFocoNaJanela } from "@/compartilhado/hooks/useFocoNaJanela";

interface JanelaProps {
  aberta: boolean;
  aoFechar: () => void;
  id: string;
  etiqueta: string;
  titulo: string;
  icone: LucideIcon;
  larguraMaxima?: string;
  semCabecalho?: boolean;
  children: ReactNode;
}

export function Janela({
  aberta,
  aoFechar,
  id,
  etiqueta,
  titulo,
  icone: Icone,
  larguraMaxima = "max-w-lg",
  semCabecalho = false,
  children,
}: JanelaProps) {
  const janelaRef = useRef<HTMLDivElement>(null);
  useFocoNaJanela(aberta, janelaRef);

  useEffect(() => {
    if (!aberta) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        aoFechar();
      }
    };
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowOriginal;
    };
  }, [aberta, aoFechar]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {aberta && (
        <div
          data-nao-imprimir=""
          className="fixed inset-0 z-[99995] flex items-start justify-center overflow-y-auto p-3 pt-[10vh] sm:p-6 sm:pt-[12vh]"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={aoFechar}
            className="fixed inset-0 bg-black/70"
          />
          <motion.div
            ref={janelaRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-titulo`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`vidro vidro-denso relative z-10 w-full ${larguraMaxima} rounded-3xl border text-white outline-none`}
          >
            {semCabecalho ? (
              <h2 id={`${id}-titulo`} className="sr-only">
                {titulo}
              </h2>
            ) : (
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-300">
                    <Icone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-400">
                      {etiqueta}
                    </span>
                    <h2 id={`${id}-titulo`} className="truncate text-lg font-black tracking-tight">
                      {titulo}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={aoFechar}
                  aria-label={`Fechar ${titulo}`}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-stone-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
