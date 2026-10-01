import { motion } from "framer-motion";

export interface TickerProps {
  texto: string;
  aoContrario?: boolean;
}

export function Ticker({ texto, aoContrario = false }: TickerProps) {
  return (
    <div className="overflow-hidden py-1.5 sm:py-3 border-y border-yellow-400/20 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent">
      <motion.div
        animate={{ x: aoContrario ? [0, 800] : [0, -800] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-4 sm:gap-8 text-[10.5px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] text-white/50 claro:text-white/75"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            aria-hidden={i > 0 || undefined}
            className="flex items-center gap-4 sm:gap-8"
          >
            <span>{texto}</span>
            <span aria-hidden="true" className="text-ouro">
              •
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
