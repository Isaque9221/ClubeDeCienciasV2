import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const TICKER = {
  primeiraFaixa:
    "CIÊNCIA NO SEMIÁRIDO · DESTAQUE FECIBA ESTADUAL · ROBÓTICA & IOT · BIOTECNOLOGIA · ASTRONOMIA · CECLOS 2026",

  segundaFaixa:
    "INICIAÇÃO CIENTÍFICA JÚNIOR · PROTAGONISMO ESTUDANTIL · PRODUÇÃO CIENTÍFICA · CECLOS 2026",
};

export function montarTicker(siteConfig: SiteConfig) {
  return {
    primeiraFaixa: texto(siteConfig.ticker1, TICKER.primeiraFaixa),
    segundaFaixa: texto(siteConfig.ticker2, TICKER.segundaFaixa),
  };
}
