import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const PESQUISADORES = {
  etiqueta: "CORPO DOCENTE & CIENTÍFICO CECLOS · 2026",
  titulo: "Nossos Mentores",
  palavrasEmDestaque: ["Mentores"],
  subtitulo:
    "Conheça os professores orientadores que transformam a iniciação científica na Bahia com rigor metodológico e paixão pelo conhecimento.",
  contadores: {
    mentores: "Professores Mentores",
    premio: "Destaque FECIBA",
  },
  rodapeDoCartao: "Corpo Docente",
  botaoPerfil: "Ver Perfil",
  botaoFinal: "Ver Diretório Completo ({quantidade} Integrantes)",
};

export function comQuantidade(modelo: string, quantidade: number): string {
  return modelo.replace("{quantidade}", String(quantidade));
}

export function montarPesquisadores(siteConfig: SiteConfig) {
  return {
    ...PESQUISADORES,
    etiqueta: texto(siteConfig.mentorsBadge, PESQUISADORES.etiqueta),
    titulo: texto(siteConfig.mentorsTitle, PESQUISADORES.titulo),
    subtitulo: texto(siteConfig.mentorsSubtitle, PESQUISADORES.subtitulo),
    contadores: {
      mentores: texto(siteConfig.mentorsCounterLabel, PESQUISADORES.contadores.mentores),
      premio: texto(siteConfig.mentorsAwardLabel, PESQUISADORES.contadores.premio),
    },
    rodapeDoCartao: texto(siteConfig.mentorsCardFooter, PESQUISADORES.rodapeDoCartao),
    botaoPerfil: texto(siteConfig.mentorsProfileBtn, PESQUISADORES.botaoPerfil),
    botaoFinal: texto(siteConfig.mentorsDirectoryBtn, PESQUISADORES.botaoFinal),
  };
}
