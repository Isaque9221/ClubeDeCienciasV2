import { Telescope, Dna, Cpu, Flame, Atom } from "lucide-react";
import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export type DestinoDoCarregamento = "home" | "projects" | "members" | "admin";

export const CARREGAMENTO = {
  fases: [
    {
      ate: 20,
      titulo: "OBSERVAÇÃO ASTRONÔMICA NO SERTÃO",
      subtitulo: "Mapeando o céu noturno e constelações sobre Santa Rita de Cássia",
      etiqueta: "ASTRONOMIA",
      icone: Telescope,
      telemetria: "SANTA RITA DE CÁSSIA · BAHIA · LAT: 11°00' S | LONG: 44°31' W · ALT: 440m",
    },
    {
      ate: 40,
      titulo: "BIODIVERSIDADE DA CAATINGA",
      subtitulo: "Investigando flora nativa, biotecnologia e solo semiárido",
      etiqueta: "BIOTECNOLOGIA",
      icone: Dna,
      telemetria: "ESTUDO DE CAMPO: BIOMA CAATINGA & TERRITÓRIO DO SISAL",
    },
    {
      ate: 60,
      titulo: "TECNOLOGIA & INOVAÇÃO CIENTÍFICA",
      subtitulo: "Instrumentação, análise de dados e pensamento experimental",
      etiqueta: "INOVAÇÃO",
      icone: Cpu,
      telemetria: "LABORATÓRIO CIENTÍFICO: INSTRUMENTAÇÃO ATIVA",
    },
    {
      ate: 80,
      titulo: "METODOLOGIA & PESQUISA DE CAMPO",
      subtitulo: "Desenvolvimento de projetos investigativos e iniciação científica",
      etiqueta: "PESQUISA",
      icone: Flame,
      telemetria: "PESQUISA CIENTÍFICA E ANÁLISE EXPERIMENTAL",
    },
    {
      ate: 100,
      titulo: "CLUBE DE CIÊNCIAS CECLOS PRONTO",
      subtitulo: "Iniciação científica, metodologia e protagonismo estudantil",
      etiqueta: "CECLOS 2026",
      icone: Atom,
      telemetria: "SISTEMA PRONTO PARA NAVEGAÇÃO CIENTÍFICA",
    },
  ],

  constelacao: "CRUZEIRO DO SUL",

  escolha: {
    etiqueta: "PORTAL CIENTÍFICO CECLOS · SELEÇÃO DE ROTA",
    titulo: "Para onde você",
    tituloEmDestaque: "deseja ir?",
    subtitulo:
      "Selecione seu destino abaixo para explorar pesquisas, projetos e inovações do Clube de Ciências",
    botaoDoCard: "Entrar",
    cardSelecionado: "Entrando…",
    atalho: {
      escolher: "escolher",
      mover: "mover",
      entrar: "entrar",
    },
  },

  destinos: [
    {
      id: "home" as DestinoDoCarregamento,
      tecla: "1",
      letra: "H",
      numero: "01",
      titulo: "Início & Sobre o Clube",
      subtitulo:
        "Portal principal, história do Clube de Ciências CECLOS, pilares científicos e impacto no semiárido.",
      etiqueta: "PORTAL PRINCIPAL",
      destaque: "História & Pilares",
      situacao: "ACESSO LIVRE",
      imagem: "/emblemas/Logo Inicio.png",
    },
    {
      id: "projects" as DestinoDoCarregamento,
      tecla: "2",
      letra: "P",
      numero: "02",
      titulo: "Projetos Científicos",
      subtitulo:
        "Repositório de investigações empíricas, pesquisas da Caatinga, IoT e destaque na FECIBA.",
      etiqueta: "PRODUÇÃO CIENTÍFICA",
      destaque: "Projetos Ativos",
      situacao: "REPOSITÓRIO ATIVO",
      imagem: "/emblemas/Logo Caderno.png",
    },
    {
      id: "members" as DestinoDoCarregamento,
      tecla: "3",
      letra: "M",
      numero: "03",
      titulo: "Nossos Membros",
      subtitulo: "+35 Jovens pesquisadores, orientadores e bolsistas de iniciação científica.",
      etiqueta: "EQUIPE ACADÊMICA",
      destaque: "+35 Pesquisadores",
      situacao: "REDE CONECTADA",
      imagem: "/emblemas/Logo Membros.png",
    },
    {
      id: "admin" as DestinoDoCarregamento,
      tecla: "4",
      letra: "A",
      numero: "04",
      titulo: "Painel Administrativo",
      subtitulo: "Console para gestão do portal, cadastro de projetos, membros e CMS integrado.",
      etiqueta: "GESTÃO & CMS",
      destaque: "Console Central",
      situacao: "ACESSO AUTORIZADO",
      imagem: "/emblemas/Logo Painel ADM.png",
    },
  ],

  rodape: {
    nomeDoClube: "Clube de Ciências CECLOS",
    local: "Santa Rita de Cássia, Bahia · Semiárido Baiano",
    barraDeProgresso: "CARREGANDO PLATAFORMA",
    coordenadas: "11°00′ S · 44°31′ W",
    dicaAtivarAudio: "Ativar Áudio (Tecla S)",
    dicaSilenciarAudio: "Silenciar Áudio (Tecla S)",
    botaoMudo: "Sem som",
    botaoAudio: "Som",
    botaoEntrarDireto: "Entrar Direto",
    botaoPular: "Pular",
    marcaEsquerda: "CECLOS · TERRITÓRIO DO SISAL",
    marcaDireita: "2026 · INICIAÇÃO CIENTÍFICA",
  },
};

export function montarCarregamento(siteConfig: SiteConfig) {
  const d = CARREGAMENTO.destinos;
  return {
    ...CARREGAMENTO,
    escolha: {
      ...CARREGAMENTO.escolha,
      etiqueta: texto(siteConfig.loadingChoiceBadge, CARREGAMENTO.escolha.etiqueta),
      titulo: texto(siteConfig.loadingChoiceTitle, CARREGAMENTO.escolha.titulo),
      tituloEmDestaque: texto(
        siteConfig.loadingChoiceHighlight,
        CARREGAMENTO.escolha.tituloEmDestaque
      ),
      subtitulo: texto(siteConfig.loadingChoiceSubtitle, CARREGAMENTO.escolha.subtitulo),
    },
    destinos: [
      {
        ...d[0],
        titulo: texto(siteConfig.loadingCard1Title, d[0].titulo),
        subtitulo: texto(siteConfig.loadingCard1Subtitle, d[0].subtitulo),
        etiqueta: texto(siteConfig.loadingCard1Badge, d[0].etiqueta),
        destaque: texto(siteConfig.loadingCard1Highlight, d[0].destaque),
        situacao: texto(siteConfig.loadingCard1Status, d[0].situacao),
        imagem: texto(siteConfig.loadingCard1Image, d[0].imagem),
      },
      {
        ...d[1],
        titulo: texto(siteConfig.loadingCard2Title, d[1].titulo),
        subtitulo: texto(siteConfig.loadingCard2Subtitle, d[1].subtitulo),
        etiqueta: texto(siteConfig.loadingCard2Badge, d[1].etiqueta),
        destaque: texto(siteConfig.loadingCard2Highlight, d[1].destaque),
        situacao: texto(siteConfig.loadingCard2Status, d[1].situacao),
        imagem: texto(siteConfig.loadingCard2Image, d[1].imagem),
      },
      {
        ...d[2],
        titulo: texto(siteConfig.loadingCard3Title, d[2].titulo),
        subtitulo: texto(siteConfig.loadingCard3Subtitle, d[2].subtitulo),
        etiqueta: texto(siteConfig.loadingCard3Badge, d[2].etiqueta),
        destaque: texto(siteConfig.loadingCard3Highlight, d[2].destaque),
        situacao: texto(siteConfig.loadingCard3Status, d[2].situacao),
        imagem: texto(siteConfig.loadingCard3Image, d[2].imagem),
      },
      {
        ...d[3],
        titulo: texto(siteConfig.loadingCard4Title, d[3].titulo),
        subtitulo: texto(siteConfig.loadingCard4Subtitle, d[3].subtitulo),
        etiqueta: texto(siteConfig.loadingCard4Badge, d[3].etiqueta),
        destaque: texto(siteConfig.loadingCard4Highlight, d[3].destaque),
        situacao: texto(siteConfig.loadingCard4Status, d[3].situacao),
        imagem: texto(siteConfig.loadingCard4Image, d[3].imagem),
      },
    ],
  };
}
