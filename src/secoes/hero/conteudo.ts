import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export interface ItemDoExplorar {
  rotulo: string;
  descricao: string;
  icone: string;
  rolarPara?: string;
  abrirPagina?: "trajetoria" | "membros" | "projetos";
  novo?: boolean;
}

export const EXPLORAR: {
  rotulo: string;
  titulo: string;
  musica: {
    desligar: string;
    descricaoDesligar: string;
    ligar: string;
    descricaoLigar: string;
  };
  itens: ItemDoExplorar[];
} = {
  rotulo: "Explorar",
  titulo: "Navegue pelo site",

  musica: {
    desligar: "Desligar música",
    descricaoDesligar: "Para a trilha e esconde o player",
    ligar: "Ligar música",
    descricaoLigar: "Mostra o player de novo",
  },

  itens: [
    {
      rotulo: "Sobre nós",
      descricao: "O que é o Clube de Ciências",
      icone: "Compass",
      rolarPara: "sobre-nos",
    },
    {
      rotulo: "Pilares",
      descricao: "Oportunidades além da escola",
      icone: "Layers",
      rolarPara: "pilares",
    },
    {
      rotulo: "Liderança",
      descricao: "Quem faz a ciência acontecer",
      icone: "Users",
      rolarPara: "equipe",
    },
    {
      rotulo: "Nossos Mentores",
      descricao: "O corpo docente do clube",
      icone: "GraduationCap",
      rolarPara: "pesquisadores",
    },
    {
      rotulo: "Pontes que Construímos",
      descricao: "Parceiros, fomento e território",
      icone: "Network",
      rolarPara: "pontes",
      novo: true,
    },
    {
      rotulo: "Tire suas dúvidas",
      descricao: "As perguntas mais frequentes",
      icone: "HelpCircle",
      rolarPara: "faq",
    },
    {
      rotulo: "Nossa Trajetória",
      descricao: "Linha do tempo e marcos",
      icone: "Milestone",
      abrirPagina: "trajetoria",
    },
    {
      rotulo: "Nossos Membros",
      descricao: "O diretório completo",
      icone: "Users",
      abrirPagina: "membros",
    },
    {
      rotulo: "Projetos Científicos",
      descricao: "Pesquisas e inovações",
      icone: "FlaskConical",
      abrirPagina: "projetos",
    },
  ],
};

export const HERO = {
  videoDeFundo:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4",

  menu: [
    { rotulo: "Sobre nós", rolarPara: "sobre-nos" },
    { rotulo: "Pilares", rolarPara: "pilares" },
    { rotulo: "Trajetória", rolarPara: "trajetoria" },
    { rotulo: "Liderança", rolarPara: "equipe" },
    { rotulo: "Junte-se", rolarPara: "junte-se" },
  ],

  selo: {
    marca: "CECLOS",
    cidade: "Santa Rita de Cássia, Bahia",
    frase: "Iniciação Científica & Protagonismo Jovem",
  },

  titulo: {
    linhaDeCima: "CLUBE DE",
    linhaDoMeio: "CIÊNCIAS",
    linhaDeBaixo: "CECLOS",
  },

  botoes: {
    inscrever: {
      titulo: "Junte-se ao Clube",
      subtitulo: "Iniciação Científica",
      textoDoCursor: "INSCREVER",
      rolarPara: "junte-se",
    },
    conhecer: {
      titulo: "Conheça o Clube",
      subtitulo: "Nossa história & método",
      textoDoCursor: "EXPLORAR",
      rolarPara: "sobre-nos",
    },
    trajetoria: {
      titulo: "Nossa Trajetória",
      subtitulo: "Linha do Tempo & Marcos",
      etiqueta: "2025 - 2026+",
      textoDoCursor: "TRAJETÓRIA",
    },
    membros: {
      titulo: "Nossos Membros",
      subtitulo: "Pesquisadores & Mentores",
      etiqueta: "35 Clubistas",
      textoDoCursor: "VER MEMBROS",
    },
    projetos: {
      titulo: "Projetos Científicos",
      subtitulo: "Pesquisas & Inovações",
      etiqueta: "Repositório",
      textoDoCursor: "PROJETOS",
    },
  },
} as const;

const CIDADE_ANTIGA = "Valente, Bahia";
const SUFIXO_ANTIGO_DO_TITULO = /\s*·?\s*EDUCAÇÃO\s*(&|E)\s*PESQUISA/i;

export function montarExplorar(siteConfig: SiteConfig) {
  return {
    ...EXPLORAR,
    rotulo: texto(siteConfig.exploreLabel, EXPLORAR.rotulo),
    titulo: texto(siteConfig.exploreTitle, EXPLORAR.titulo),
  };
}

export function montarHero(siteConfig: SiteConfig) {
  const cidade = texto(siteConfig.locationCity, HERO.selo.cidade);
  const linhaDeBaixo =
    texto(siteConfig.heroTitleBottom, HERO.titulo.linhaDeBaixo)
      .replace(SUFIXO_ANTIGO_DO_TITULO, "")
      .trim() || HERO.titulo.linhaDeBaixo;

  return {
    videoDeFundo: texto(siteConfig.heroVideoUrl, HERO.videoDeFundo),
    menu: HERO.menu,
    selo: {
      marca: HERO.selo.marca,
      cidade: cidade === CIDADE_ANTIGA ? HERO.selo.cidade : cidade,
      frase: texto(siteConfig.tagline, HERO.selo.frase),
    },
    titulo: {
      linhaDeCima: texto(siteConfig.heroTitleTop, HERO.titulo.linhaDeCima),
      linhaDoMeio: texto(siteConfig.heroTitleHighlight, HERO.titulo.linhaDoMeio),
      linhaDeBaixo,
    },
  };
}

export function montarBotoesDoHero(siteConfig: SiteConfig) {
  const b = HERO.botoes;
  return {
    inscrever: {
      ...b.inscrever,
      titulo: texto(siteConfig.heroBtn1Title, b.inscrever.titulo),
      subtitulo: texto(siteConfig.heroBtn1Subtitle, b.inscrever.subtitulo),
    },
    conhecer: {
      ...b.conhecer,
      titulo: texto(siteConfig.heroBtn2Title, b.conhecer.titulo),
      subtitulo: texto(siteConfig.heroBtn2Subtitle, b.conhecer.subtitulo),
    },
    trajetoria: {
      ...b.trajetoria,
      titulo: texto(siteConfig.heroBtnTrajetoriaTitle, b.trajetoria.titulo),
      subtitulo: texto(siteConfig.heroBtnTrajetoriaSubtitle, b.trajetoria.subtitulo),
      etiqueta: texto(siteConfig.heroBtnTrajetoriaBadge, b.trajetoria.etiqueta),
    },
    membros: {
      ...b.membros,
      titulo: texto(siteConfig.heroBtn3Title, b.membros.titulo),
      subtitulo: texto(siteConfig.heroBtn3Subtitle, b.membros.subtitulo),
      etiqueta: texto(siteConfig.heroBtn3Badge, b.membros.etiqueta),
    },
    projetos: {
      ...b.projetos,
      titulo: texto(siteConfig.heroBtn4Title, b.projetos.titulo),
      subtitulo: texto(siteConfig.heroBtn4Subtitle, b.projetos.subtitulo),
      etiqueta: texto(siteConfig.heroBtn4Badge, b.projetos.etiqueta),
    },
  };
}
