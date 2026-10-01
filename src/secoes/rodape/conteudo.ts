import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const RODAPE = {
  marcaDoTopo: "CECLOS",

  parceiros: {
    etiqueta: "REDE DE COOPERAÇÃO CIENTÍFICA & FOMENTO",
    titulo: "Instituições que Impulsionam o CLUBE",
    palavrasEmDestaque: ["CLUBE", "Impulsionam"],
    subtitulo:
      "Alianças de prestígio com agências federais e estaduais de fomento, universidades públicas de excelência, laboratórios avançados e mostras científicas que abrem portas reais para os nossos jovens pesquisadores.",
    contador: "✦ {quantidade} Instituições Parceiras",
    tipoPadrao: "Instituição Parceira",
    vinculo: "Vínculo Ativo",
    chancela: "Cooperação",
  },

  identidade: {
    etiqueta: "ESTAÇÃO CIENTÍFICA",
    nomeDoClube: "Clube de Ciências CECLOS",
    frase: "Onde a curiosidade sertaneja encontra o método científico.",
    rotuloDoInstagram: "Instagram Oficial:",
    instagram: "@clubececlos",
    linkDoInstagram: "https://www.instagram.com/clubececlos/",
  },

  telemetria: {
    rotuloLocalidade: "LOCALIDADE",
    rotuloBiomaAltitude: "BIOMA / ALTITUDE",
    rotuloCoordenadas: "COORDENADAS",
    rotuloHorario: "HORÁRIO DE BRASÍLIA",
    rotuloStatus: "STATUS DO SITE",
    statusOnline: "ONLINE",
    sufixoDoHorario: "(UTC-3)",
    cidade: "SANTA RITA DE CÁSSIA, BA",
    bioma: "BIOMA CAATINGA",
    altitude: "ALT 440M",
  },

  navegacao: {
    titulo: "Navegação",
  },

  contatos: {
    titulo: "Canais Oficiais",
    rotuloEmail: "Endereço Eletrônico",
    email: "victor.moreno1@enova.educacao.ba.gov.br",
    rotuloEndereco: "Sede & Localização",
    endereco: "Santa Rita de Cássia, Bahia · Brasil",
    aviso: "Encontros presenciais nas Quartas-Feiras às 17:30, 15 em 15 dias.",
    dicaEnviarEmail: "Clique para enviar e-mail",
    dicaCopiar: "Clique para copiar",
    acaoCopiado: "Copiado!",
    acaoEnviar: "Enviar",
    acaoCopiar: "Copiar",
  },

  assinatura: {
    linhaGrande: "CLUBE DE CIÊNCIAS",
    linhaPequena: "CECLOS",
  },

  creditos: {
    marca: "CECLOS",
    cidade: "Santa Rita de Cássia, BA",
    prefixoDoAutor: "Arquitetura por",
    autor: "Isaque Bomfim",
    botaoAdmin: "terminal_adm",
    dicaDoBotaoAdmin: "Terminal ADM [Ctrl + Shift + A]",
    botaoVoltarAoTopo: "RETORNAR AO TOPO",
  },
};

const CIDADES_ANTIGAS = ["VALENTE, BA", "Valente, Bahia"];
const ENDERECO_ANTIGO = /Valente,\s*Bahia/gi;
const EMAILS_ANTIGOS = ["ceclos.ciencias@gmail.com"];
const INSTAGRAMS_ANTIGOS = ["@ceclos.ciencias", "ceclos.ciencias"];
const LINKS_ANTIGOS_DO_INSTAGRAM = [
  "https://instagram.com",
  "https://instagram.com/",
  "https://www.instagram.com",
  "https://www.instagram.com/",
];

export function comQuantidade(modelo: string, quantidade: number): string {
  return modelo.replace("{quantidade}", String(quantidade));
}

export function montarRodape(siteConfig: SiteConfig) {
  const cidade = texto(siteConfig.locationCity, RODAPE.telemetria.cidade);

  return {
    identidade: {
      ...RODAPE.identidade,
      nomeDoClube: texto(siteConfig.siteTitle, RODAPE.identidade.nomeDoClube),
      frase: texto(siteConfig.footerQuote, RODAPE.identidade.frase),
      instagram: INSTAGRAMS_ANTIGOS.includes(texto(siteConfig.contactInstagram).toLowerCase())
        ? RODAPE.identidade.instagram
        : texto(siteConfig.contactInstagram, RODAPE.identidade.instagram),
      linkDoInstagram: LINKS_ANTIGOS_DO_INSTAGRAM.includes(
        texto(siteConfig.contactInstagramUrl).toLowerCase()
      )
        ? RODAPE.identidade.linkDoInstagram
        : texto(siteConfig.contactInstagramUrl, RODAPE.identidade.linkDoInstagram),
    },
    telemetria: {
      ...RODAPE.telemetria,
      cidade: CIDADES_ANTIGAS.includes(cidade) ? RODAPE.telemetria.cidade : cidade.toUpperCase(),
      bioma: texto(siteConfig.biome, RODAPE.telemetria.bioma),
      altitude: texto(siteConfig.altitude, RODAPE.telemetria.altitude),
      coordenadas: texto(siteConfig.coordinates, ""),
    },
    marcaDoTopo: texto(siteConfig.footerTopBrand, RODAPE.marcaDoTopo),
    parceiros: {
      ...RODAPE.parceiros,
      etiqueta: texto(siteConfig.footerPartnersBadge, RODAPE.parceiros.etiqueta),
      titulo: texto(siteConfig.footerPartnersTitle, RODAPE.parceiros.titulo),
      subtitulo: texto(siteConfig.footerPartnersSubtitle, RODAPE.parceiros.subtitulo),
    },
    navegacao: {
      ...RODAPE.navegacao,
      titulo: texto(siteConfig.footerNavTitle, RODAPE.navegacao.titulo),
    },
    assinatura: {
      linhaGrande: texto(siteConfig.footerSignatureBig, RODAPE.assinatura.linhaGrande),
      linhaPequena: texto(siteConfig.footerSignatureSmall, RODAPE.assinatura.linhaPequena),
    },
    creditos: {
      ...RODAPE.creditos,
      marca: texto(siteConfig.footerCreditsBrand, RODAPE.creditos.marca),
      autor: texto(siteConfig.footerCreditsAuthor, RODAPE.creditos.autor),
    },
    contatos: {
      ...RODAPE.contatos,
      titulo: texto(siteConfig.footerContactsTitle, RODAPE.contatos.titulo),
      email: EMAILS_ANTIGOS.includes(texto(siteConfig.contactEmail).toLowerCase())
        ? RODAPE.contatos.email
        : texto(siteConfig.contactEmail, RODAPE.contatos.email),
      endereco: texto(siteConfig.contactAddress, RODAPE.contatos.endereco).replace(
        ENDERECO_ANTIGO,
        "Santa Rita de Cássia, Bahia"
      ),
      aviso: texto(siteConfig.contactScheduleNotice, RODAPE.contatos.aviso),
    },
  };
}
