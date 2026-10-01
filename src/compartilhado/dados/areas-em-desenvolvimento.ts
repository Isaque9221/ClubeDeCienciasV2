import type { SiteConfig } from "@/compartilhado/contextos/data-context";

export type ChaveDaSituacao = "projectsStatus" | "mapStatus";

export interface AreaQuePodeEstarEmDesenvolvimento {
  id: "projetos" | "mapa";
  nome: string;
  onde: string;
  chave: ChaveDaSituacao;
  valorPronta: string;
  valorEmDesenvolvimento: string;
  rotuloPronta: string;
}

export const AREAS_EM_DESENVOLVIMENTO: AreaQuePodeEstarEmDesenvolvimento[] = [
  {
    id: "projetos",
    nome: "Página de Projetos Científicos",
    onde: "No site: quem abre Projetos vê o aviso “em desenvolvimento” no lugar da lista.",
    chave: "projectsStatus",
    valorPronta: "publicada",
    valorEmDesenvolvimento: "desenvolvimento",
    rotuloPronta: "Publicada",
  },
  {
    id: "mapa",
    nome: "Mapa do Site",
    onde: "No painel: o editor que muda a ordem e a posição das seções da página inicial.",
    chave: "mapStatus",
    valorPronta: "pronta",
    valorEmDesenvolvimento: "desenvolvimento",
    rotuloPronta: "Liberado",
  },
];

export function acharArea(id: AreaQuePodeEstarEmDesenvolvimento["id"]) {
  return AREAS_EM_DESENVOLVIMENTO.find((area) => area.id === id)!;
}

export function areaEstaPronta(
  siteConfig: SiteConfig,
  area: AreaQuePodeEstarEmDesenvolvimento
): boolean {
  return (siteConfig[area.chave] ?? "").trim() === area.valorPronta;
}

export function mudarSituacao(
  area: AreaQuePodeEstarEmDesenvolvimento,
  pronta: boolean
): Partial<SiteConfig> {
  return { [area.chave]: pronta ? area.valorPronta : area.valorEmDesenvolvimento };
}
