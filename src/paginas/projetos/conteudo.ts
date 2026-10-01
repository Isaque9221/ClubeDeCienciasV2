import { Layers, Cpu, Dna, FlaskConical, Telescope } from "lucide-react";
import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const PROJETOS = {
  cabecalho: {
    botaoVoltarAoInicio: "Voltar ao Início",
    botaoVoltarAosProjetos: "Voltar aos Projetos",
    marca: "CLUBE DE CIÊNCIAS",
    aba: "Projetos Científicos",
    contador: "{quantidade} Projetos",
  },

  lista: {
    etiqueta: "Repositório de Pesquisas",
    titulo: "Projetos & Iniciação Científica",
    palavrasEmDestaque: ["Iniciação", "Científica"],
    subtitulo:
      "Conheça as pesquisas empíricas, estudos botânicos e inovações em IoT desenvolvidos pelos jovens cientistas do CECLOS.",
    campoDeBusca: "Buscar por projeto, aluno ou série...",
    botaoDoCard: "Ir para o Projeto",
    rotuloDoProjeto: "Projeto:",
  },

  filtros: [
    { id: "todos", rotulo: "Todos", icone: Layers },
    { id: "tecnologia", rotulo: "Tecnologia & IoT", icone: Cpu },
    { id: "biotecnologia", rotulo: "Biotecnologia", icone: Dna },
    { id: "investigacao", rotulo: "Investigação & Campo", icone: FlaskConical },
    { id: "astronomia", rotulo: "Astronomia", icone: Telescope },
  ],

  semResultados: {
    titulo: "Nenhum projeto encontrado",
    subtitulo: 'Tente buscar por outro termo ou selecione "Todos".',
  },

  ficha: {
    voltarParaLista: "← Voltar para Lista",
    tipoDeDocumento: "Caderno de Iniciação Científica",
    autor: "Jovem Cientista Autor(a)",
    serie: "Ensino Médio",
    selo: "Aprovado FECIBA",
    linhaDoPilar: "Clube de Ciências CECLOS · Pilar:",
    tipoDeTrabalho: "Projeto de Pesquisa Escrito",
    dataDeRegistro: "Data de Registro:",
    resumo: "Resumo do Projeto",
    metodologia: "Formulação & Metodologia",
    problema: "Problema de Pesquisa:",
    hipotese: "Hipótese Formulada:",
    materiais: "Materiais & Métodos:",
    resultados: "Resultados Obtidos:",
    textoIntegral: "Texto Integral do Projeto",
    textoIntegralVazio: "<p>Sem registros detalhados adicionais neste caderno de pesquisa.</p>",
    referencias: "Referências Bibliográficas:",
    parecer: "Parecer:",
    botaoVoltar: "Voltar para Lista de Projetos",
  },

  idIgnorado: "proj-demo-guest",

  emDesenvolvimento: {
    situacao: "desenvolvimento",
    etiqueta: "Em fase de desenvolvimento",
    titulo: "Projetos Científicos",
    palavrasEmDestaque: ["Científicos"],
    mensagem:
      "Esta área está em fase de desenvolvimento. Em breve você vai poder explorar as pesquisas, os cadernos de campo e as inovações criadas pelos jovens cientistas do CECLOS.",
    rotuloDoProgresso: "Montando o laboratório",
    oQueVem: [
      { titulo: "Pesquisas de campo", descricao: "Estudos da Caatinga e do semiárido" },
      { titulo: "Cadernos científicos", descricao: "Metodologia, hipóteses e resultados" },
      { titulo: "Inovação & tecnologia", descricao: "Protótipos, IoT e experimentos" },
    ],
    rotuloDoQueVem: "O que vem por aí",
    botaoVoltar: "Voltar ao Início",
    rodape: "Volte em breve — boa ciência leva tempo.",
  },
};

export function comQuantidade(modelo: string, quantidade: number): string {
  return modelo.replace("{quantidade}", String(quantidade));
}

export function montarProjetos(siteConfig: SiteConfig) {
  return {
    ...PROJETOS,
    cabecalho: {
      ...PROJETOS.cabecalho,
      marca: texto(siteConfig.projectsBrand, PROJETOS.cabecalho.marca),
    },
    lista: {
      ...PROJETOS.lista,
      etiqueta: texto(siteConfig.projectsBadge, PROJETOS.lista.etiqueta),
      titulo: texto(siteConfig.projectsTitle, PROJETOS.lista.titulo),
      subtitulo: texto(siteConfig.projectsSubtitle, PROJETOS.lista.subtitulo),
      campoDeBusca: texto(siteConfig.projectsSearchPlaceholder, PROJETOS.lista.campoDeBusca),
      botaoDoCard: texto(siteConfig.projectsCardBtn, PROJETOS.lista.botaoDoCard),
    },
    emDesenvolvimento: {
      ...PROJETOS.emDesenvolvimento,
      ativo: texto(siteConfig.projectsStatus, PROJETOS.emDesenvolvimento.situacao) !== "publicada",
      etiqueta: texto(siteConfig.projectsDevBadge, PROJETOS.emDesenvolvimento.etiqueta),
      titulo: texto(siteConfig.projectsDevTitle, PROJETOS.emDesenvolvimento.titulo),
      mensagem: texto(siteConfig.projectsDevMessage, PROJETOS.emDesenvolvimento.mensagem),
    },
    semResultados: {
      titulo: texto(siteConfig.projectsEmptyTitle, PROJETOS.semResultados.titulo),
      subtitulo: texto(siteConfig.projectsEmptySubtitle, PROJETOS.semResultados.subtitulo),
    },
  };
}
