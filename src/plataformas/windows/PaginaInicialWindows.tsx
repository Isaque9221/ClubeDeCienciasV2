import type { ReactNode } from "react";
import { useData } from "@/compartilhado/hooks/useData";
import { useModoPrevia } from "@/compartilhado/hooks/useModoPrevia";
import { usePausarForaDaTela } from "@/compartilhado/hooks/usePausarForaDaTela";
import { Arrastavel } from "@/compartilhado/componentes/Arrastavel";
import { acharSecao } from "@/secoes/mapa-do-site";
import {
  Hero,
  Ticker,
  SobreSection,
  EstatisticasSection,
  PilaresSection,
  EquipeSection,
  PesquisadoresSection,
  PontesSection,
  ManifestoSection,
  FaqSection,
  CtaSection,
  Rodape,
} from "@/secoes";
import { montarTicker } from "@/secoes/ticker";
import { lerMapa } from "@/secoes/mapa-do-site";
import type { PropsDaPaginaInicial } from "../tipos";

export function PaginaInicialWindows({
  onOpenMembers,
  onOpenProjects,
  onOpenTrajetoria,
  onOpenAdmin,
}: PropsDaPaginaInicial) {
  const { siteConfig } = useData();
  const { ordemDeTeste } = useModoPrevia();
  const faixas = montarTicker(siteConfig);

  const mapa = lerMapa(ordemDeTeste ?? siteConfig.layoutSections);

  const desenhos: Record<string, ReactNode> = {
    ticker1: <Ticker texto={faixas.primeiraFaixa} />,
    sobre: <SobreSection onOpenTrajetoria={onOpenTrajetoria} />,
    estatisticas: <EstatisticasSection />,
    pilares: <PilaresSection />,
    equipe: <EquipeSection />,
    pesquisadores: <PesquisadoresSection onOpenMembers={onOpenMembers} />,
    pontes: <PontesSection />,
    manifesto: <ManifestoSection />,
    ticker2: <Ticker texto={faixas.segundaFaixa} aoContrario />,
    faq: <FaqSection />,
    cta: <CtaSection />,
  };

  const doMeio = mapa.filter((i) => i.visivel && i.id !== "hero" && i.id !== "rodape");

  usePausarForaDaTela("[data-secao]", doMeio.map((i) => i.id).join(","));

  return (
    <div className="relative isolate min-h-screen w-full max-w-[1920px] mx-auto p-2 sm:p-4 space-y-6 sm:space-y-10">
      <a href="#conteudo-da-pagina" className="pular-para-o-conteudo">
        Pular para o conteúdo
      </a>

      <Arrastavel id="secao:hero" rotulo="Abertura (Hero)" dataSecao="hero">
        <Hero
          onOpenMembers={onOpenMembers}
          onOpenProjects={onOpenProjects}
          onOpenTrajetoria={onOpenTrajetoria}
        />
      </Arrastavel>

      <section
        id="conteudo-da-pagina"
        tabIndex={-1}
        aria-label="Conteúdo"
        className="w-full space-y-16 sm:space-y-24 py-8 md:py-14 text-stone-100 outline-none"
      >
        {doMeio.map((item) =>
          desenhos[item.id] ? (
            <Arrastavel
              key={item.id}
              id={`secao:${item.id}`}
              rotulo={acharSecao(item.id)?.rotulo ?? item.id}
              dataSecao={item.id}
            >
              {desenhos[item.id]}
            </Arrastavel>
          ) : null
        )}
      </section>

      <Arrastavel id="secao:rodape" rotulo="Rodapé & Instituições" dataSecao="rodape">
        <Rodape onOpenAdmin={onOpenAdmin} onOpenTrajetoria={onOpenTrajetoria} />
      </Arrastavel>
    </div>
  );
}
