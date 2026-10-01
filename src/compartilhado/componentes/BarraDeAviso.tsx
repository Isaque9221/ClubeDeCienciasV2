import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import { useData } from "@/compartilhado/hooks/useData";

export function BarraDeAviso() {
  const { siteConfig } = useData();

  const texto = (siteConfig.announcementText || "").trim();
  const ligado = Boolean(siteConfig.announcementActive) && texto.length > 0;

  const [dispensado, setDispensado] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("ceclos_aviso_dispensado") || "";
    } catch {
      return "";
    }
  });

  const visivel = ligado && dispensado !== texto;

  const dispensar = () => {
    setDispensado(texto);
    try {
      localStorage.setItem("ceclos_aviso_dispensado", texto);
    } catch {}
  };

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-[95] overflow-hidden border-b border-amber-400/30 bg-gradient-to-r from-amber-400/[0.12] via-amber-400/[0.06] to-amber-400/[0.12]"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-6 sm:py-2">
            <Megaphone className="h-3 w-3 shrink-0 text-amber-400 sm:h-3.5 sm:w-3.5" />

            <p className="min-w-0 flex-1 text-[10.5px] font-semibold leading-snug text-amber-100 sm:text-xs">
              {texto}
            </p>

            <button
              type="button"
              onClick={dispensar}
              aria-label="Fechar aviso"
              className="shrink-0 rounded-full p-1 text-amber-300/70 transition-colors hover:bg-amber-400/15 hover:text-amber-200 cursor-pointer"
            >
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
