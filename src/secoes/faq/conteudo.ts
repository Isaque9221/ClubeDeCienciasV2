import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const FAQ = {
  etiqueta: "Perguntas Frequentes",

  titulo: "Tire suas",
  tituloEmDestaque: "dúvidas",

  perguntas: [
    {
      id: "faq-1",
      pergunta: "Quem pode participar do Clube de Ciências?",
      resposta:
        "Estudantes regularmente matriculados no CECLOS e escolas parceiras da rede básica, com interesse por pesquisa, método científico, tecnologia ou inovação.",
    },
    {
      id: "faq-2",
      pergunta: "Preciso ter conhecimento prévio em programação ou laboratório?",
      resposta:
        "Não! O clube é um espaço de formação. Temos trilhas introdutórias de nivelamento para que você aprenda do zero com suporte dos orientadores e clubistas veteranos.",
    },
    {
      id: "faq-3",
      pergunta: "Como funcionam os encontros e horários?",
      resposta:
        "Os encontros presenciais ocorrem quinzenalmente no contraturno escolar, no CECLOS, além de mentorias assíncronas e desenvolvimento contínuo de projetos.",
    },
    {
      id: "faq-4",
      pergunta: "O Clube emite certificado ou conta como atividade extracurricular?",
      resposta:
        "Sim. A participação regular conta com emissão de certificado de horas de iniciação científica júnior, válido para histórico escolar e olimpíadas.",
    },
    {
      id: "faq-5",
      pergunta: "Quais projetos já foram desenvolvidos?",
      resposta:
        "Projetos de biotecnologia com espécies da Caatinga, automação com Arduino para monitoramento escolar, experimentos de microbiologia e iniciativas selecionadas na FECIBA.",
    },
  ],
};

export function montarFaq(siteConfig: SiteConfig) {
  const doPainel = siteConfig.faqs;
  if (doPainel && doPainel.length > 0) {
    return doPainel.map((item) => ({
      id: item.id,
      pergunta: item.question,
      resposta: item.answer,
    }));
  }
  return FAQ.perguntas;
}

export function montarTextosDoFaq(siteConfig: SiteConfig) {
  return {
    etiqueta: texto(siteConfig.faqBadge, FAQ.etiqueta),
    titulo: texto(siteConfig.faqTitle, FAQ.titulo),
    tituloEmDestaque: texto(siteConfig.faqTitleHighlight, FAQ.tituloEmDestaque),
  };
}
