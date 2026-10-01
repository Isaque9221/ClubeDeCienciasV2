import { Presentation, Megaphone, Medal, Microscope, Compass, Users } from "lucide-react";
import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto, linhasComoLista } from "@/secoes/_nucleo";

export const PILARES = {
  etiqueta: "Para Além dos Muros",

  titulo: "Oportunidades para além da escola e do clube",

  palavrasEmDestaque: ["Oportunidades"],

  subtitulo:
    "O clube é o ponto de partida. Estas são as portas que a ciência abre para os estudantes do CECLOS fora da sala de aula.",

  lista: [
    {
      id: "feiras",
      numero: "01",
      icone: Presentation,
      cor: "#FACC15",
      titulo: "Feiras de Ciências",
      complemento: "& Mostras",
      tagline: "Da bancada da escola ao palco estadual",
      descricao:
        "Participação em feiras municipais, estaduais e nacionais, ampliando a experiência dos estudantes e enriquecendo seu currículo escolar.",
      itens: [
        "Participação em feiras de ciências, ampliando a experiência dos estudantes.",
        "Apresentação de projetos científicos, estimulando a curiosidade dos alunos.",
        "Feiras de ciências que incentivam o pensamento crítico dos estudantes.",
        "Envolvimento em feiras científicas, valorizando a criatividade dos alunos.",
      ],
    },
    {
      id: "civico",
      numero: "02",
      icone: Megaphone,
      cor: "#FDE047",
      titulo: "Engajamento Cívico",
      complemento: "& Comunidade",
      tagline: "Ciência que vira ação no território",
      descricao:
        "O conhecimento produzido no clube volta para a comunidade: associações, escolas, conselhos e espaços públicos de decisão. Pesquisar é também tomar posição sobre o lugar onde se vive.",
      itens: [
        "Ações que despertam a consciência cidadã dos estudantes.",
        "Engajamento cívico que fortalece a participação social dos jovens.",
        "Práticas que estimulam o senso de responsabilidade coletiva dos alunos.",
        "Envolvimento em causas sociais, promovendo cidadania ativa e consciente.",
      ],
    },
    {
      id: "olimpiadas",
      numero: "03",
      icone: Medal,
      cor: "#FEF08A",
      titulo: "Olimpíadas Científicas",
      complemento: "& Competições",
      tagline: "Treino, prova e medalha",
      descricao:
        "OBMEP, OBA, ONC e outras olimpíadas do conhecimento. Grupos de estudo e simulados preparam os estudantes para competir em pé de igualdade com qualquer escola do país.",
      itens: [
        "Participação em olimpíadas científicas, estimulando o raciocínio lógico dos estudantes.",
        "OBMEP, OBA, ONC e olimpíadas afins",
        "Olimpíadas científicas que despertam o interesse dos alunos pela ciência.",
        "Envolvimento em olimpíadas científicas, valorizando o talento acadêmico dos jovens.",
      ],
    },
    {
      id: "ic-junior",
      numero: "04",
      icone: Microscope,
      cor: "#FBBF24",
      titulo: "Iniciação Científica Júnior",
      complemento: "& Bolsas",
      tagline: "Pesquisa com bolsa ainda no ensino médio",
      descricao:
        "Editais de Iniciação Científica Júnior do CNPq, da FAPESB e das universidades parceiras. Orientação, plano de trabalho e bolsa para quem quer levar a pesquisa a sério antes da graduação.",
      itens: [
        "Iniciação científica que desperta o espírito investigativo dos estudantes.",
        "Primeiros passos na pesquisa, estimulando a curiosidade científica dos jovens.",
        "Parceria com a UEFS e grupos de pesquisa",
        "Envolvimento em pesquisas juniores, cultivando o interesse pela ciência",
      ],
    },
    {
      id: "horizontes",
      numero: "05",
      icone: Compass,
      cor: "#FB923C",
      titulo: "Novos Horizontes Profissionais",
      complemento: "& Carreira",
      tagline: "Descobrir que dá para ser cientista",
      descricao:
        "Conhecer profissões, cursos e caminhos que raramente chegam ao sertão. Visitas, conversas com pesquisadores e orientação sobre ENEM, vestibular e vida universitária.",
      itens: [
        "Novos horizontes profissionais que ampliam as perspectivas de carreira dos estudantes.",
        "Visitas a universidades e laboratórios",
        "Orientação sobre ENEM, SISU e cotas",
        "Rede de contatos para além do município",
      ],
    },
    {
      id: "liderancas",
      numero: "06",
      icone: Users,
      cor: "#F59E0B",
      titulo: "Formação de Lideranças Territoriais",
      complemento: "& Protagonismo",
      tagline: "Quem fica também transforma",
      descricao:
        "Formar jovens capazes de coordenar grupos, falar em público e conduzir projetos no próprio território, assumindo papel de referência para quem vem depois.",
      itens: [
        "Ações que formam lideranças territoriais e fortalecem o protagonismo juvenil.",
        "Formação de líderes locais, estimulando a atuação protagonista dos jovens.",
        "Mediação entre escola e comunidade",
        "Iniciativas que preparam jovens lideranças com foco no protagonismo social.",
      ],
    },
  ],
};

const CAMPOS_DO_PAINEL = [
  {
    titulo: "pillar1Title",
    complemento: "pillar1Sub",
    tagline: "pillar1Tagline",
    descricao: "pillar1Desc",
    itens: "pillar1Items",
  },
  {
    titulo: "pillar2Title",
    complemento: "pillar2Sub",
    tagline: "pillar2Tagline",
    descricao: "pillar2Desc",
    itens: "pillar2Items",
  },
  {
    titulo: "pillar3Title",
    complemento: "pillar3Sub",
    tagline: "pillar3Tagline",
    descricao: "pillar3Desc",
    itens: "pillar3Items",
  },
  {
    titulo: "pillar4Title",
    complemento: "pillar4Sub",
    tagline: "pillar4Tagline",
    descricao: "pillar4Desc",
    itens: "pillar4Items",
  },
  {
    titulo: "pillar5Title",
    complemento: "pillar5Sub",
    tagline: "pillar5Tagline",
    descricao: "pillar5Desc",
    itens: "pillar5Items",
  },
  {
    titulo: "pillar6Title",
    complemento: "pillar6Sub",
    tagline: "pillar6Tagline",
    descricao: "pillar6Desc",
    itens: "pillar6Items",
  },
] as const satisfies ReadonlyArray<Record<string, keyof SiteConfig>>;

export function montarPilares(siteConfig: SiteConfig) {
  return PILARES.lista.map((pilar, i) => {
    const campos = CAMPOS_DO_PAINEL[i];
    if (!campos) return pilar;

    return {
      ...pilar,
      titulo: texto(siteConfig[campos.titulo] as string | undefined, pilar.titulo),
      complemento: texto(siteConfig[campos.complemento] as string | undefined, pilar.complemento),
      tagline: texto(siteConfig[campos.tagline] as string | undefined, pilar.tagline),
      descricao: texto(siteConfig[campos.descricao] as string | undefined, pilar.descricao),
      itens: linhasComoLista(siteConfig[campos.itens] as string | undefined, pilar.itens),
    };
  });
}

export type Pilar = ReturnType<typeof montarPilares>[number];

export function montarTextosDosPilares(siteConfig: SiteConfig) {
  return {
    etiqueta: texto(siteConfig.pillarsBadge, PILARES.etiqueta),
    titulo: texto(siteConfig.pillarsTitle, PILARES.titulo),
    subtitulo: texto(siteConfig.pillarsSubtitle, PILARES.subtitulo),
    palavrasEmDestaque: PILARES.palavrasEmDestaque,
  };
}
