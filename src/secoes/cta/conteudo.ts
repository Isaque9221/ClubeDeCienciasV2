import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";
import { montarLinkDeContato } from "./contato";

export const CTA = {
  etiqueta: "Iniciação Científica no CECLOS",

  titulo: "Pronto para explorar o conhecimento?",

  palavrasEmDestaque: ["explorar", "conhecimento"],

  descricao:
    "Venha fazer parte do Clube de Ciências. Desenvolva projetos investigativos, aplique métodos inovadores e faça a ciência acontecer!",

  botaoPrincipal: {
    texto: "Participar do Clube",
    telefone: "+55 75 9705-9889",
    mensagemDoWhatsApp:
      "Olá! Vim pelo site do Clube de Ciências CECLOS e quero participar do clube.",
    mensagemAoClicar:
      "Para se inscrever, procure a coordenação do CECLOS ou envie um e-mail com seus dados e projeto!",
  },

  botaoSecundario: {
    texto: "Voltar ao Início",
  },
};

export function montarCta(siteConfig: SiteConfig) {
  const telefone = texto(siteConfig.ctaPhone, CTA.botaoPrincipal.telefone);
  const mensagemDoWhatsApp = texto(
    siteConfig.ctaWhatsappMessage,
    CTA.botaoPrincipal.mensagemDoWhatsApp
  );

  return {
    ...CTA,
    etiqueta: texto(siteConfig.ctaBadge, CTA.etiqueta),
    titulo: texto(siteConfig.ctaTitle, CTA.titulo),
    descricao: texto(siteConfig.ctaDescription, CTA.descricao),
    botaoPrincipal: {
      ...CTA.botaoPrincipal,
      texto: texto(siteConfig.ctaBtnText, CTA.botaoPrincipal.texto),
      telefone,
      mensagemDoWhatsApp,
      link: montarLinkDeContato(telefone, mensagemDoWhatsApp),
      mensagemAoClicar: texto(siteConfig.ctaBtnMessage, CTA.botaoPrincipal.mensagemAoClicar),
    },
    botaoSecundario: {
      ...CTA.botaoSecundario,
      texto: texto(siteConfig.ctaBtnSecondaryText, CTA.botaoSecundario.texto),
    },
  };
}
