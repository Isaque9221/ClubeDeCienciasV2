import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const PONTES = {
  etiqueta: "REDE DE PARCERIAS CECLOS · 2026",
  titulo: "Pontes que Construímos",
  palavrasEmDestaque: ["Pontes"],
  subtitulo:
    "As instituições e organizações com quem trocamos, aprendemos e construímos o clube juntos.",

  contadores: {
    frentes: "Frentes de parceria",
    organizacoes: "Organizações parceiras",
  },

  grupos: [
    {
      id: "fomento",
      indice: "01",
      icone: "Landmark",
      titulo: "Financiamento e Fomento",
      resumo: "Quem torna o clube possível.",
      parceiros: [
        {
          nome: "FAPESB · SECTI · SEC",
          etiqueta: "Edital nº 017/2025",
          detalhe: "Programa Bahia Faz Ciência na Escola.",
        },
      ],
    },
    {
      id: "universidades",
      indice: "02",
      icone: "GraduationCap",
      titulo: "Universidades e Grupos de Pesquisa",
      resumo: "Onde nossa pesquisa encontra rigor.",
      parceiros: [
        {
          nome: "UFBA",
          etiqueta: "Grupo de pesquisa",
          detalhe: "Através do grupo de pesquisa do professor Charbel El-Hani.",
        },
        {
          nome: "UEFS",
          etiqueta: "Iniciação Científica Júnior",
          detalhe: "Em parceria nos projetos de Iniciação Científica Júnior.",
        },
      ],
    },
    {
      id: "territorio",
      indice: "03",
      icone: "HeartHandshake",
      titulo: "Organizações do Território",
      resumo: "O saber que já vive no sertão.",
      parceiros: [
        {
          nome: "COOPERAFIS",
          etiqueta: "Cooperativa",
          detalhe: "Cooperativa Regional de Artesãs Fibras do Sertão.",
        },
        {
          nome: "Associação de Moradores da Rua Nova",
          etiqueta: "Comunidade",
          detalhe: "Parceria comunitária no diálogo com o território.",
        },
      ],
    },
    {
      id: "escolar",
      indice: "04",
      icone: "School",
      titulo: "Rede Escolar",
      resumo: "De onde vêm os nossos clubistas.",
      parceiros: [
        {
          nome: "CMESRC",
          etiqueta: "Escola municipal",
          detalhe: "Escola parceira, cujos estudantes também integram o clube.",
        },
      ],
    },
  ],
} as const;

export function montarPontes(siteConfig: SiteConfig) {
  const g = PONTES.grupos;
  return {
    ...PONTES,
    etiqueta: texto(siteConfig.bridgesBadge, PONTES.etiqueta),
    titulo: texto(siteConfig.bridgesTitle, PONTES.titulo),
    subtitulo: texto(siteConfig.bridgesSubtitle, PONTES.subtitulo),
    contadores: {
      frentes: texto(siteConfig.bridgesCounterFronts, PONTES.contadores.frentes),
      organizacoes: texto(siteConfig.bridgesCounterOrgs, PONTES.contadores.organizacoes),
    },
    grupos: [
      {
        ...g[0],
        titulo: texto(siteConfig.bridgesGroup1Title, g[0].titulo),
        resumo: texto(siteConfig.bridgesGroup1Summary, g[0].resumo),
        parceiros: [
          {
            nome: texto(siteConfig.bridgesGroup1PartnerName, g[0].parceiros[0]?.nome || ""),
            etiqueta: texto(
              siteConfig.bridgesGroup1PartnerBadge,
              g[0].parceiros[0]?.etiqueta || ""
            ),
            detalhe: texto(siteConfig.bridgesGroup1PartnerDetail, g[0].parceiros[0]?.detalhe || ""),
          },
        ],
      },
      {
        ...g[1],
        titulo: texto(siteConfig.bridgesGroup2Title, g[1].titulo),
        resumo: texto(siteConfig.bridgesGroup2Summary, g[1].resumo),
        parceiros: [
          {
            nome: texto(siteConfig.bridgesGroup2P1Name, g[1].parceiros[0]?.nome || ""),
            etiqueta: texto(siteConfig.bridgesGroup2P1Badge, g[1].parceiros[0]?.etiqueta || ""),
            detalhe: texto(siteConfig.bridgesGroup2P1Detail, g[1].parceiros[0]?.detalhe || ""),
          },
          {
            nome: texto(siteConfig.bridgesGroup2P2Name, g[1].parceiros[1]?.nome || ""),
            etiqueta: texto(siteConfig.bridgesGroup2P2Badge, g[1].parceiros[1]?.etiqueta || ""),
            detalhe: texto(siteConfig.bridgesGroup2P2Detail, g[1].parceiros[1]?.detalhe || ""),
          },
        ],
      },
      {
        ...g[2],
        titulo: texto(siteConfig.bridgesGroup3Title, g[2].titulo),
        resumo: texto(siteConfig.bridgesGroup3Summary, g[2].resumo),
        parceiros: [
          {
            nome: texto(siteConfig.bridgesGroup3P1Name, g[2].parceiros[0]?.nome || ""),
            etiqueta: texto(siteConfig.bridgesGroup3P1Badge, g[2].parceiros[0]?.etiqueta || ""),
            detalhe: texto(siteConfig.bridgesGroup3P1Detail, g[2].parceiros[0]?.detalhe || ""),
          },
          {
            nome: texto(siteConfig.bridgesGroup3P2Name, g[2].parceiros[1]?.nome || ""),
            etiqueta: texto(siteConfig.bridgesGroup3P2Badge, g[2].parceiros[1]?.etiqueta || ""),
            detalhe: texto(siteConfig.bridgesGroup3P2Detail, g[2].parceiros[1]?.detalhe || ""),
          },
        ],
      },
      {
        ...g[3],
        titulo: texto(siteConfig.bridgesGroup4Title, g[3].titulo),
        resumo: texto(siteConfig.bridgesGroup4Summary, g[3].resumo),
        parceiros: [
          {
            nome: texto(siteConfig.bridgesGroup4PartnerName, g[3].parceiros[0]?.nome || ""),
            etiqueta: texto(
              siteConfig.bridgesGroup4PartnerBadge,
              g[3].parceiros[0]?.etiqueta || ""
            ),
            detalhe: texto(siteConfig.bridgesGroup4PartnerDetail, g[3].parceiros[0]?.detalhe || ""),
          },
        ],
      },
    ],
  };
}
