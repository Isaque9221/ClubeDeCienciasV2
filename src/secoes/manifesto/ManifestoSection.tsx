import { Quote } from "lucide-react";
import { CeuEmExposicao, FioDourado, GsapTextReveal, Visor } from "@/compartilhado/componentes";
import { useData } from "@/compartilhado/hooks/useData";
import { montarManifesto } from "./conteudo";

export function ManifestoSection() {
  const { siteConfig } = useData();
  const MANIFESTO = montarManifesto(siteConfig);

  return (
    <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl sm:rounded-[2.25rem] border border-yellow-400/25 bg-gradient-to-r from-superficie-2 via-fundo to-superficie-2 px-4 py-8 sm:px-8 sm:py-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(250,204,21,0.08)]">
      <CeuEmExposicao polo={[0.5, 0.5]} giro={[6, 72]} quantidade={1.6} intensidade={0.8} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_58%_at_center,var(--color-superficie-2)_0%,color-mix(in_oklab,var(--color-superficie-2)_55%,transparent)_55%,transparent_100%)]" />
      <Visor folga={18} tamanho={20} />
      <div className="relative z-10 max-w-3xl mx-auto space-y-3 sm:space-y-6">
        <Quote className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-yellow-400 opacity-75 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
        <GsapTextReveal
          text={MANIFESTO.frase}
          tag="h2"
          type="mask-up"
          stagger={0.03}
          className="text-base sm:text-4xl font-black text-white leading-snug sm:leading-tight text-balance"
          highlightWords={MANIFESTO.palavrasEmDestaque}
          glowOnView
        />
        <FioDourado />
        <div className="space-y-1 sm:space-y-2 pt-0.5 sm:pt-1">
          {MANIFESTO.autor && (
            <p className="text-[10px] sm:text-sm font-semibold text-stone-300">
              — {MANIFESTO.autor}
            </p>
          )}
          {MANIFESTO.assinatura && (
            <p className="text-[10.5px] sm:text-xs font-bold text-ouro uppercase tracking-widest shiny-text">
              {MANIFESTO.assinatura}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
