import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const MANIFESTO = {
  frase:
    "Os filósofos apenas interpretaram o mundo de diferentes maneiras; o que importa é transformá-lo.",

  autor: "Karl Marx, A Ideologia Alemã, p. 535",

  palavrasEmDestaque: ["mundo", "transformá-lo"],

  assinatura: "Clube de Ciências CECLOS",
};

export function montarManifesto(siteConfig: SiteConfig) {
  return {
    ...MANIFESTO,
    frase: texto(siteConfig.manifestoText, MANIFESTO.frase),
    autor: texto(siteConfig.manifestoAuthor, MANIFESTO.autor),
    assinatura: texto(siteConfig.manifestoSignature, MANIFESTO.assinatura),
  };
}
