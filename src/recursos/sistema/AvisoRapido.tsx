import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";

export function AvisoRapido() {
  const { aviso } = usePreferencias();

  return (
    <div
      role="status"
      aria-live="polite"
      data-nao-imprimir=""
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[99996] flex justify-center px-4"
    >
      <AnimatePresence>
        {aviso && (
          <motion.span
            key={aviso}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="vidro vidro-denso inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-white"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            {aviso}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
