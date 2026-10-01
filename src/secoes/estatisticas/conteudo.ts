import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const ESTATISTICAS = {
  lista: [
    { numero: "35+", rotulo: "Clubistas", detalhe: "Membros ativos" },
    { numero: "17+", rotulo: "Projetos", detalhe: "8 Em pausa, 2 Piloto-Legado" },
    { numero: "2025", rotulo: "Fundação", detalhe: "Ano de abertura" },
    {
      numero: "FECIBA",
      rotulo: "Reconhecimento",
      detalhe:
        "3 Seleções/Aprovações: Etapa Interterritorial da FECIBA 2025 e 2026 e Resumo aprovado no VII Seminário do Sisal; mais o 2º lugar no edital FAPESB/SECTI/SEC nº 017/2025",
    },
  ],
};

const CAMPOS_DO_PAINEL = [
  { numero: "stat1Value", rotulo: "stat1Label", detalhe: "stat1Desc" },
  { numero: "stat2Value", rotulo: "stat2Label", detalhe: "stat2Desc" },
  { numero: "stat3Value", rotulo: "stat3Label", detalhe: "stat3Desc" },
  { numero: "stat4Value", rotulo: "stat4Label", detalhe: "stat4Desc" },
] as const satisfies ReadonlyArray<Record<string, keyof SiteConfig>>;

export function montarEstatisticas(siteConfig: SiteConfig) {
  return ESTATISTICAS.lista.map((item, i) => {
    const campos = CAMPOS_DO_PAINEL[i];
    if (!campos) return item;
    return {
      numero: texto(siteConfig[campos.numero] as string | undefined, item.numero),
      rotulo: texto(siteConfig[campos.rotulo] as string | undefined, item.rotulo),
      detalhe: texto(siteConfig[campos.detalhe] as string | undefined, item.detalhe),
    };
  });
}
