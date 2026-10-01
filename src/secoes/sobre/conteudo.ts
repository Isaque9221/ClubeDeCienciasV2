import { FlaskConical, Compass, Cpu, Telescope, Atom, Lightbulb, Rocket } from "lucide-react";
import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto, linhasComoLista } from "@/secoes/_nucleo";

export const SOBRE = {
  etiqueta: "Iniciação Científica & Protagonismo Jovem",

  titulo: "O que é o Clube de Ciências?",

  palavrasEmDestaque: ["Clube", "Ciências"],

  descricao:
    "O Clube de Ciências CECLOS é um espaço de aprendizado prático e investigativo no semiárido baiano. Este Clube de Ciências propõe-se enquanto um dispositivo formativo de reconexão ativa entre sujeitos, saberes e território. Aqui o conhecimento científico não se propõe a substituir os saberes tradicionais, mas sim estabelecer com eles um diálogo crítico e produtivo, legitimando suas formas de existência.",

  premio: {
    etiqueta: "Reconhecimento",
    titulo: "Selecionado FECIBA",
    subtitulo: "Feira de Ciências da Bahia",
    logo: "/parceiros/Logo FECIBA.png",
    textoAlternativoDaLogo: "FECIBA Logo",
  },

  chamadaDasAbas: {
    esquerda: "✦ Explore os pilares de conhecimento do Clube:",
    direita: "Interativo · Selecione uma área",
  },

  abas: [
    {
      id: "investigacao",
      icone: FlaskConical,
      titulo: "Pesquisa - Ação Participativa",
      subtitulo: "Pensar e agir junto",
      cor: "#FACC15",
      descricao:
        "O CECLOS não conta com um laboratório de ciências, mas não cruzamos os braços por causa disso: de sala sem condições mínimas de uso, transforma-se em espaço de experimentação, planejamento e reflexão crítica conduzido pelos próprios estudantes. Ali ganham forma os artefatos dos projetos do clube (protótipos, maquetes, relatórios) que tornam visível o conhecimento construído. Além disso, ativamos uma horta escolar que promete ser palco de muitos projetos de intervenção no futuro!",
      itens: [
        "Ciência para o Território: Produção coletiva de conhecimento científico, articulando práticas investigativas e saberes dos sujeitos do campo, em diálogo com a realidade local.",
        "Protagonismo Estudantil: O protagonismo estudantil não é adereço discursivo: é eixo organizador da ação pedagógica, que permite aos jovens se constituírem como sujeitos de investigação, posicionamento e transformação social.",
        "O que é Epistemologia?: Epistemologia é o estudo de como o conhecimento é construído. Partimos do princípio de que a ciência não é uma verdade neutra e definitiva, mas uma prática social, histórica e situada; por isso pode, e deve, dialogar com outros modos de conhecer o mundo.",
        "Não hierarquizamos formas de conhecimento. O rigor da investigação científica e os saberes construídos historicamente no território (agrícolas, culturais, comunitários) se encontram como parceiros de pesquisa, não como fonte e aplicação.",
      ],
    },
    {
      id: "territorio",
      icone: Compass,
      titulo: "Diálogo entre Saberes",
      subtitulo: "Vozes que se escutam",
      cor: "#FDE047",
      descricao:
        "O território não é apenas objeto de estudo, mas instância de produção epistêmica; o clube opera como lugar de convergência entre ciência, cultura e experiência vivida. O território deixa de ser pano de fundo e passa a ser sujeito pedagógico.",
      itens: [
        "Saberes do Território: Reconhecemos, legitimamos e articulamos os saberes locais em nossa práxis, da tradição oral às práticas camponesas transmitidas entre gerações.",
        "Problemas Reais, Pesquisa Real: Investigamos problemas reais do território (ambientais, agrícolas, culturais), analisados pela lente CTSA (Ciência, Tecnologia, Sociedade e Ambiente), em diálogo com os saberes tradicionais que ali se acumularam ao longo de gerações.",
        "Devolutiva ao Território: O conhecimento produzido no clube não fica retido na escola: retorna ao território em forma de ação concreta, construída junto às famílias, associações e escolas que compõem a comunidade.",
        "Convivência com o Semiárido: Ciência e saber popular se encontram no enfrentamento da imprevisibilidade climática, fortalecendo o protagonismo comunitário diante da seca e da irregularidade das chuvas.",
      ],
    },
    {
      id: "tecnologia",
      icone: Cpu,
      titulo: "Educação Intercultural",
      subtitulo: "Aprender com o outro",
      cor: "#FB923C",
      descricao:
        "Justamente por sermos coordenados por um professor vindo da cidade grande, ancoramos nossa prática na educação intercultural: reconhecemos que a verdadeira transformação acontece quando nos dispomos a conhecer e reconhecer a nossa cultura e a do outro de forma contemplativa e respeitosa.",
      itens: [
        "Resgate de Saberes Ameaçados: valorizamos práticas, festas e conhecimentos que correm risco de desaparecer entre gerações, reconhecendo-os como patrimônio vivo do território.",
        "Escola em Rede: o clube se abre para além dos seus próprios estudantes, integrando outras escolas e instituições do território numa mesma comunidade de aprendizagem.",
        "Tradições Populares como Conhecimento: entendemos festas e rituais populares como formas legítimas de saber e identidade, não como folclore a ser apenas observado de fora.",
        "Identidade e Pertencimento: reconhecemos identidades raciais, territoriais, de gênero e de sexualidade, entre outras, como objeto legítimo de investigação científica, incluindo a experiência vivida de quem pesquisa.",
      ],
    },
    {
      id: "astronomia",
      icone: Telescope,
      titulo: "Transdisciplinaridade Transformativa",
      subtitulo: "Saber sem fronteiras",
      cor: "#FEF08A",
      descricao:
        "A complexidade dos problemas socioambientais atuais exige encará-los sob diferentes perspectivas, compartilhando saberes. Entendemos a transdisciplinaridade como aliança entre diferentes formas de saber dedicadas a responder questões candentes, transformando os próprios sujeitos pelas trocas na resolução dos problemas.",
      itens: [
        "Sobreposições Parciais: partimos do princípio de que os sistemas de conhecimento se sobrepõem apenas parcialmente. Mapear onde convergem e onde divergem é o que nos permite encontrar, juntos, as melhores soluções para os problemas do território.'",
        "Parceria Horizontal com a Universidade: construímos parcerias com universidades em que os estudantes atuam como coautores da pesquisa, não como objetos de estudo ou meros agentes no levantamento de dados, combatendo o extrativismo e o paternalismo epistêmico.",
        "Diálogo com o Campo Acadêmico: dialogamos com pesquisadores e grupos de pesquisa como interlocutores ativos, contribuindo também para a produção teórica sobre ciência e educação, e não apenas a recebendo pronta. Nos espaços de troca que o clube fomenta, agentes de saberes locais e pesquisadores visitantes se colocam em pé de igualdade.",
        "Para Além dos Muros da Escola: o conhecimento produzido no clube circula publicamente, recusando a lógica de que a ciência escolar deve ficar confinada à sala de aula.",
      ],
    },
  ],

  rotulosDaAba: {
    pilar: "Pilar de Conhecimento",
  },

  cardsDeMissao: [
    {
      icone: Atom,
      etiqueta: "Missão",
      titulo: "Pesquisa - Ação Participativa",
      subtitulo: "Impacto Social & Educação",
      descricao:
        "Ciência construída com a comunidade, não sobre ela: do problema real do território à ação coletiva que transforma quem pesquisa e quem é pesquisado.",
      cor: "#FACC15",
    },
    {
      icone: Lightbulb,
      etiqueta: "Método",
      titulo: "Diálogo entre Saberes",
      subtitulo: "Aluno como Pesquisador",
      descricao:
        "O território não é cenário, é sujeito pedagógico: reconhecemos, legitimamos e articulamos os saberes que nele se acumulam ao longo de gerações.",
      cor: "#FDE047",
    },
    {
      icone: Rocket,
      etiqueta: "Futuro",
      titulo: "Oportunidades & Feiras",
      subtitulo: "FECIBA & Olimpíadas",
      descricao:
        "Projeção estadual e nacional através da participação em feiras científicas e olimpíadas de conhecimento.",
      cor: "#FEF08A",
    },
  ],

  citacao: {
    frase:
      "A comunicação verdadeira não nos parece estar na exclusiva transferência ou transmissão do conhecimento de um sujeito a outro, mas em sua coparticipação no ato de compreender a significação do significado. ",
    autor: "Paulo Freire, 1969, Extensão ou Comunicação, p. 70",
    local: "Santa Rita de Cássia, Bahia",
  },
};

const LOCAL_ANTIGO = "Valente, Bahia";

export function montarSobre(siteConfig: SiteConfig) {
  const local = texto(siteConfig.quoteLocation, SOBRE.citacao.local);

  return {
    etiqueta: texto(siteConfig.aboutBadge, SOBRE.etiqueta),
    titulo: texto(siteConfig.aboutTitle, SOBRE.titulo),
    descricao: texto(siteConfig.aboutDescription, SOBRE.descricao),
    premio: {
      ...SOBRE.premio,
      etiqueta: texto(siteConfig.awardBadge, SOBRE.premio.etiqueta),
      titulo: texto(siteConfig.awardTitle, SOBRE.premio.titulo),
      subtitulo: texto(siteConfig.awardSubtitle, SOBRE.premio.subtitulo),
      logo: texto(siteConfig.awardLogo, SOBRE.premio.logo),
    },
    citacao: {
      frase: texto(siteConfig.quoteText, SOBRE.citacao.frase),
      autor: texto(siteConfig.quoteAuthor, SOBRE.citacao.autor),
      local: local === LOCAL_ANTIGO ? SOBRE.citacao.local : local,
    },
    chamadaDasAbas: {
      esquerda: texto(siteConfig.aboutTabsCallLeft, SOBRE.chamadaDasAbas.esquerda),
      direita: texto(siteConfig.aboutTabsCallRight, SOBRE.chamadaDasAbas.direita),
    },
    abas: montarAbas(siteConfig),
    cardsDeMissao: montarCardsDeMissao(siteConfig),
  };
}

const CAMPOS_DAS_ABAS = [
  {
    titulo: "aboutTab1Title",
    subtitulo: "aboutTab1Sub",
    descricao: "aboutTab1Desc",
    itens: "aboutTab1Items",
  },
  {
    titulo: "aboutTab2Title",
    subtitulo: "aboutTab2Sub",
    descricao: "aboutTab2Desc",
    itens: "aboutTab2Items",
  },
  {
    titulo: "aboutTab3Title",
    subtitulo: "aboutTab3Sub",
    descricao: "aboutTab3Desc",
    itens: "aboutTab3Items",
  },
  {
    titulo: "aboutTab4Title",
    subtitulo: "aboutTab4Sub",
    descricao: "aboutTab4Desc",
    itens: "aboutTab4Items",
  },
] as const;

const CAMPOS_DOS_CARDS = [
  {
    etiqueta: "aboutMission1Badge",
    titulo: "aboutMission1Title",
    subtitulo: "aboutMission1Sub",
    descricao: "aboutMission1Desc",
  },
  {
    etiqueta: "aboutMission2Badge",
    titulo: "aboutMission2Title",
    subtitulo: "aboutMission2Sub",
    descricao: "aboutMission2Desc",
  },
  {
    etiqueta: "aboutMission3Badge",
    titulo: "aboutMission3Title",
    subtitulo: "aboutMission3Sub",
    descricao: "aboutMission3Desc",
  },
] as const;

function montarAbas(siteConfig: SiteConfig) {
  return SOBRE.abas.map((aba, i) => {
    const campos = CAMPOS_DAS_ABAS[i];
    if (!campos) return aba;
    return {
      ...aba,
      titulo: texto(siteConfig[campos.titulo], aba.titulo),
      subtitulo: texto(siteConfig[campos.subtitulo], aba.subtitulo),
      descricao: texto(siteConfig[campos.descricao], aba.descricao),
      itens: linhasComoLista(siteConfig[campos.itens], aba.itens),
    };
  });
}

function montarCardsDeMissao(siteConfig: SiteConfig) {
  return SOBRE.cardsDeMissao.map((card, i) => {
    const campos = CAMPOS_DOS_CARDS[i];
    if (!campos) return card;
    return {
      ...card,
      etiqueta: texto(siteConfig[campos.etiqueta], card.etiqueta),
      titulo: texto(siteConfig[campos.titulo], card.titulo),
      subtitulo: texto(siteConfig[campos.subtitulo], card.subtitulo),
      descricao: texto(siteConfig[campos.descricao], card.descricao),
    };
  });
}
