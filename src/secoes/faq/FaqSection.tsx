import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import { FioDourado, GsapTextReveal, SectionLabel } from "@/compartilhado/componentes";
import { montarFaq, montarTextosDoFaq } from "./conteudo";

export function FaqSection() {
  const [aberta, setAberta] = useState<number | null>(0);
  const { playSound } = useSound();
  const { siteConfig } = useData();
  const perguntas = montarFaq(siteConfig);
  const textos = montarTextosDoFaq(siteConfig);

  return (
    <div id="faq" className="mx-auto max-w-3xl space-y-4 sm:space-y-8 px-3 sm:px-4">
      <div className="text-center">
        <SectionLabel text={textos.etiqueta} />
        <GsapTextReveal
          text={`${textos.titulo} ${textos.tituloEmDestaque}`}
          tag="h2"
          type="mask-up"
          className="text-xl sm:text-4xl font-black text-white mt-2 sm:mt-3 text-balance"
          highlightWords={textos.tituloEmDestaque.split(" ")}
          highlightClass="golden-metallic-text"
        />
        <FioDourado className="mt-3 sm:mt-5" />
      </div>

      <div className="space-y-1.5 sm:space-y-3">
        {perguntas.map((item, i) => (
          <motion.div
            key={item.id ?? i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className={`overflow-hidden rounded-lg sm:rounded-2xl border transition-all duration-300 ${
              aberta === i
                ? "border-yellow-400/50 bg-superficie-3 shadow-[0_0_25px_rgba(250,204,21,0.1)]"
                : "border-stone-800/80 bg-superficie/80 hover:border-stone-700"
            }`}
          >
            <button
              type="button"
              id={`pergunta-${i}`}
              aria-expanded={aberta === i}
              aria-controls={`resposta-${i}`}
              onClick={() => {
                playSound("pop-bubble");
                setAberta(aberta === i ? null : i);
              }}
              className="flex w-full items-center justify-between gap-2 p-2.5 sm:p-6 text-left text-[11px] sm:text-base font-semibold text-stone-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className={aberta === i ? "text-yellow-100 font-bold" : ""}>
                {item.pergunta}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 transition-all duration-300 ${
                  aberta === i ? "rotate-180 text-ouro" : "text-stone-500"
                }`}
              />
            </button>
            <AnimatePresence>
              {aberta === i && (
                <motion.div
                  id={`resposta-${i}`}
                  role="region"
                  aria-labelledby={`pergunta-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-white/5 px-2.5 sm:px-6 pb-3 pt-2 sm:pb-5 sm:pt-4 text-[10.5px] sm:text-sm text-stone-300 leading-relaxed"
                >
                  {item.resposta}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
