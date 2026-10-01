import { Rocket, Microscope, Award, Radio, Sparkles } from "lucide-react";
import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto, linhasComoLista } from "@/secoes/_nucleo";

export type SituacaoDoMarco = "concluido" | "atual" | "futuro";

export interface MarcoDaTrajetoria {
  ano: string;
  mes: string;
  etiqueta: string;
  titulo: string;
  descricao: string;
  detalhesAdicionais?: string[];
  icone: any;
  destaques: string[];
  situacao: SituacaoDoMarco;
  parcerias?: string[];
}

export const TRAJETORIA = {
  cabecalho: {
    marca: "CECLOS",
    aba: "Trajetória do Clube",
    contador: "{n} Grandes Marcos",
    botaoVoltar: "Voltar ao Início",
  },

  hero: {
    etiqueta: "Linha do Tempo Oficial · CECLOS",
    titulo: "A Trajetória do Nosso Clube",
    palavrasEmDestaque: ["Trajetória", "Clube"],
    subtitulo:
      "Da primeira centelha de Aprendizagem Baseada em Projetos no semiárido baiano até a conquista de bolsas estaduais de Iniciação Científica, parcerias universitárias e submissão a feiras nacionais.",
    estatisticas: [
      { valor: "2025", rotulo: "Ano de Fundação", descricao: "Início com EJA e Eletivas" },
      { valor: "2º Lugar", rotulo: "FAPESB Estadual", descricao: "Entre mais de 200 propostas" },
      { valor: "9+", rotulo: "Projetos FECIBA", descricao: "Triplicando a produção em 1 ano" },
      { valor: "2", rotulo: "Bolsas IC Jr UEFS", descricao: "Pesquisa acadêmica júnior" },
    ],
  },

  filtros: [
    { id: "todos", rotulo: "Todos os Marcos" },
    { id: "2025", rotulo: "2025 · Origem & Fundação" },
    { id: "2026", rotulo: "2026 · Expansão & Parcerias" },
    { id: "futuro", rotulo: "Próximos Passos · Futuro" },
  ],

  marcos: [
    {
      ano: "2025",
      mes: "Março",
      etiqueta: "FUNDAÇÃO & INÍCIO",
      titulo: "Fundação do Clube de Ciências CECLOS",
      descricao:
        "Com o apoio essencial da coordenadora pedagógica da época, Vani, o Professor Victor dá o pontapé inicial aplicando a metodologia de Aprendizagem Baseada em Projetos (ABP) nas disciplinas eletivas do colégio. Nasce o embrião de um centro de investigação científica protagonizado por jovens do interior da Bahia.",
      icone: Rocket,
      destaques: [
        "Três projetos pioneiros iniciados por estudantes da Educação de Jovens e Adultos (EJA)",
        "Seleção e engajamento da primeira turma de jovens cientistas",
        "Elaboração participativa do regimento interno do clube",
      ],
      parcerias: ["Colégio Estadual CECLOS", "Coordenação Pedagógica"],
      situacao: "concluido" as SituacaoDoMarco,
    },
    {
      ano: "2025",
      mes: "Junho — Dezembro",
      etiqueta: "CAPILARIDADE & DESCOBERTA",
      titulo: "2º Semestre de 2025 · Capilaridade e FECIBA",
      descricao:
        "O clube ganha tração e expande horizontes. Com o respaldo da equipe pedagógica, o Prof. Victor pleiteia o fomento do Edital nº 17/2025 da FAPESB voltado a Clubes de Ciências. Os estudantes apresentam seus trabalhos na etapa interterritorial da Feira de Ciências da Bahia (FECIBA) e viajam até Salvador para a grande mostra estadual.",
      icone: Microscope,
      destaques: [
        "Projeto científico aprovado na etapa interterritorial da FECIBA",
        "Viagem de duas estudantes a Salvador para apresentação pública da pesquisa",
        "Criação do grupo de estudos em programação e lógica computacional",
      ],
      parcerias: ["FAPESB (Edital 17/2025)", "FECIBA Interterritorial", "SEC Bahia"],
      situacao: "concluido" as SituacaoDoMarco,
    },
    {
      ano: "2026",
      mes: "Janeiro — Junho",
      etiqueta: "CHANCELA ESTADUAL",
      titulo: "1º Semestre de 2026 · Consolidação e Reconhecimento",
      descricao:
        "O alcance do CECLOS se multiplica expressivamente, mais que dobrando a quantidade de clubistas pesquisadores ativos. Nove projetos autorais são finalizados e submetidos à FECIBA, triplicando os envios em apenas um ano. Além disso, a proposta do clube conquista o 2º lugar geral entre centenas de concorrentes em toda a Bahia no edital da FAPESB.",
      icone: Award,
      destaques: [
        "2º Lugar Estadual no Edital FAPESB entre mais de 200 propostas baianas",
        "Aprovação e concessão de bolsa oficial de fomento ao Professor Coordenador",
        "9 projetos submetidos à FECIBA, marcando um recorde na história da escola",
        "Mais que o dobro de clubistas ativos no quadro de pesquisa",
      ],
      parcerias: ["FAPESB", "FECIBA Estadual", "Comunidade Escolar CECLOS"],
      situacao: "concluido" as SituacaoDoMarco,
    },
    {
      ano: "2026",
      mes: "Julho — Dezembro",
      etiqueta: "AMPLIAÇÃO & PARCERIAS",
      titulo: "2º Semestre de 2026 · Bolsas IC Júnior & Rede Interinstitucional",
      descricao:
        "Fase de expressiva maturidade acadêmica e comunitária. Duas estudantes conquistam bolsas de Iniciação Científica Júnior pela Universidade Estadual de Feira de Santana (UEFS), orientadas pelas Professoras Mariana de Oliveira Araujo e Indianara Lima Silva, conectando o clube a dois conceituados laboratórios universitários. Estudantes do Ensino Fundamental passam a integrar as bancadas de pesquisa, enquanto o clube firma parcerias sólidas com a COOPERAFIS, Associação de Moradores de Santa Rita de Cássia, Fórum de Economia Solidária e Conselho de Meio Ambiente. Para coroar o período, é estabelecida colaboração perene com o grupo de pesquisa do Prof. Dr. Charbel El-Hani (UFBA) e é lançado o ecossistema digital do clube com protótipos de hardware ESP32.",
      icone: Radio,
      destaques: [
        "Bolsas de IC Júnior UEFS para 2 estudantes com orientação das Profas. Mariana de Oliveira Araujo e Indianara Lima Silva",
        "Integração de alunos do Ensino Fundamental, expandindo o clube além do Ensino Médio",
        "Parceria ativa com a COOPERAFIS e Associação de Moradores de Santa Rita de Cássia",
        "Assento e atuação no Fórum de Economia Popular e Solidária e no Conselho Municipal de Meio Ambiente",
        "Parceria de pesquisa perene com o grupo do Prof. Dr. Charbel El-Hani (UFBA)",
        "Desenvolvimento maker com microcontroladores ESP32 e publicação do site com portal digital",
      ],
      parcerias: [
        "UEFS (Profas. Mariana Araujo & Indianara Lima)",
        "UFBA (Grupo Prof. Charbel El-Hani)",
        "COOPERAFIS",
        "Assoc. Moradores Sta. Rita de Cássia",
        "Fórum Economia Solidária",
        "Conselho Mun. Meio Ambiente",
      ],
      situacao: "atual" as SituacaoDoMarco,
    },
    {
      ano: "2026+",
      mes: "Próximos Passos",
      etiqueta: "EXPANSÃO CIENTÍFICA & HORIZONTES",
      titulo: "Projeção Nacional & Feiras Científicas (FEBRACE / Mostratec)",
      descricao:
        "Rumo a feiras de abrangência nacional e internacional. O clube se prepara para submeter pesquisas em periódicos revisados por pares, lançar o 1º volume da Revista Científica CECLOS e capacitar estudantes em astronomia observacional com instrumentação óptica no sertão baiano.",
      icone: Sparkles,
      destaques: [
        "Submissão de artigos e projetos às maiores feiras nacionais: FEBRACE e Mostratec",
        "Editoração e publicação do 1º Volume da Revista Científica CECLOS",
        "Treinamento de clubistas em astronomia observacional e manuseio de telescópios",
        "Captação de novos auxílios e bolsas de pesquisa para alunos de baixa renda do Semiárido",
      ],
      parcerias: ["FEBRACE (USP)", "Mostratec", "Redes de Divulgação Científica"],
      situacao: "futuro" as SituacaoDoMarco,
    },
  ],

  manifestoFinal: {
    etiqueta: "Compromisso com o Conhecimento",
    titulo: "Ciência Feita por e Para a Comunidade",
    texto:
      "A trajetória do Clube de Ciências do CECLOS demonstra que a iniciação científica pública e de qualidade transforma realidades. Quando jovens do sertão baiano têm acesso a método rigoroso, orientação dedicada e laboratórios parceiros, não há fronteiras para as suas descobertas.",
    botaoProjetos: "Ver Projetos Desenvolvidos",
    botaoMembros: "Conhecer Nossos Pesquisadores",
  },
} as const;

export function montarTrajetoria(siteConfig: SiteConfig) {
  return {
    cabecalho: {
      ...TRAJETORIA.cabecalho,
      marca: texto(siteConfig.journeyBrand, TRAJETORIA.cabecalho.marca),
      botaoVoltar: texto(siteConfig.journeyBackBtn, TRAJETORIA.cabecalho.botaoVoltar),
    },
    hero: {
      ...TRAJETORIA.hero,
      etiqueta: texto(siteConfig.journeyBadge, TRAJETORIA.hero.etiqueta),
      titulo: texto(siteConfig.journeyTitle, TRAJETORIA.hero.titulo),
      subtitulo: texto(siteConfig.journeySubtitle, TRAJETORIA.hero.subtitulo),
      estatisticas: [
        {
          valor: texto(siteConfig.journeyStat1Value, TRAJETORIA.hero.estatisticas[0].valor),
          rotulo: texto(siteConfig.journeyStat1Label, TRAJETORIA.hero.estatisticas[0].rotulo),
          descricao: texto(siteConfig.journeyStat1Desc, TRAJETORIA.hero.estatisticas[0].descricao),
        },
        {
          valor: texto(siteConfig.journeyStat2Value, TRAJETORIA.hero.estatisticas[1].valor),
          rotulo: texto(siteConfig.journeyStat2Label, TRAJETORIA.hero.estatisticas[1].rotulo),
          descricao: texto(siteConfig.journeyStat2Desc, TRAJETORIA.hero.estatisticas[1].descricao),
        },
        {
          valor: texto(siteConfig.journeyStat3Value, TRAJETORIA.hero.estatisticas[2].valor),
          rotulo: texto(siteConfig.journeyStat3Label, TRAJETORIA.hero.estatisticas[2].rotulo),
          descricao: texto(siteConfig.journeyStat3Desc, TRAJETORIA.hero.estatisticas[2].descricao),
        },
        {
          valor: texto(siteConfig.journeyStat4Value, TRAJETORIA.hero.estatisticas[3].valor),
          rotulo: texto(siteConfig.journeyStat4Label, TRAJETORIA.hero.estatisticas[3].rotulo),
          descricao: texto(siteConfig.journeyStat4Desc, TRAJETORIA.hero.estatisticas[3].descricao),
        },
      ],
    },
    marcos: [
      {
        ...TRAJETORIA.marcos[0],
        ano: texto(siteConfig.journeyMilestone1Year, TRAJETORIA.marcos[0].ano),
        mes: texto(siteConfig.journeyMilestone1Month, TRAJETORIA.marcos[0].mes),
        etiqueta: texto(siteConfig.journeyMilestone1Badge, TRAJETORIA.marcos[0].etiqueta),
        titulo: texto(siteConfig.journeyMilestone1Title, TRAJETORIA.marcos[0].titulo),
        descricao: texto(siteConfig.journeyMilestone1Desc, TRAJETORIA.marcos[0].descricao),
        destaques: linhasComoLista(
          siteConfig.journeyMilestone1Highlights,
          TRAJETORIA.marcos[0].destaques
        ),
      },
      {
        ...TRAJETORIA.marcos[1],
        ano: texto(siteConfig.journeyMilestone2Year, TRAJETORIA.marcos[1].ano),
        mes: texto(siteConfig.journeyMilestone2Month, TRAJETORIA.marcos[1].mes),
        etiqueta: texto(siteConfig.journeyMilestone2Badge, TRAJETORIA.marcos[1].etiqueta),
        titulo: texto(siteConfig.journeyMilestone2Title, TRAJETORIA.marcos[1].titulo),
        descricao: texto(siteConfig.journeyMilestone2Desc, TRAJETORIA.marcos[1].descricao),
        destaques: linhasComoLista(
          siteConfig.journeyMilestone2Highlights,
          TRAJETORIA.marcos[1].destaques
        ),
      },
      {
        ...TRAJETORIA.marcos[2],
        ano: texto(siteConfig.journeyMilestone3Year, TRAJETORIA.marcos[2].ano),
        mes: texto(siteConfig.journeyMilestone3Month, TRAJETORIA.marcos[2].mes),
        etiqueta: texto(siteConfig.journeyMilestone3Badge, TRAJETORIA.marcos[2].etiqueta),
        titulo: texto(siteConfig.journeyMilestone3Title, TRAJETORIA.marcos[2].titulo),
        descricao: texto(siteConfig.journeyMilestone3Desc, TRAJETORIA.marcos[2].descricao),
        destaques: linhasComoLista(
          siteConfig.journeyMilestone3Highlights,
          TRAJETORIA.marcos[2].destaques
        ),
      },
      {
        ...TRAJETORIA.marcos[3],
        ano: texto(siteConfig.journeyMilestone4Year, TRAJETORIA.marcos[3].ano),
        mes: texto(siteConfig.journeyMilestone4Month, TRAJETORIA.marcos[3].mes),
        etiqueta: texto(siteConfig.journeyMilestone4Badge, TRAJETORIA.marcos[3].etiqueta),
        titulo: texto(siteConfig.journeyMilestone4Title, TRAJETORIA.marcos[3].titulo),
        descricao: texto(siteConfig.journeyMilestone4Desc, TRAJETORIA.marcos[3].descricao),
        destaques: linhasComoLista(
          siteConfig.journeyMilestone4Highlights,
          TRAJETORIA.marcos[3].destaques
        ),
      },
    ],
    manifestoFinal: {
      etiqueta: texto(siteConfig.journeyFinalBadge, TRAJETORIA.manifestoFinal.etiqueta),
      titulo: texto(siteConfig.journeyFinalTitle, TRAJETORIA.manifestoFinal.titulo),
      texto: texto(siteConfig.journeyFinalText, TRAJETORIA.manifestoFinal.texto),
      botaoProjetos: texto(
        siteConfig.journeyFinalBtnProjects,
        TRAJETORIA.manifestoFinal.botaoProjetos
      ),
      botaoMembros: texto(
        siteConfig.journeyFinalBtnMembers,
        TRAJETORIA.manifestoFinal.botaoMembros
      ),
    },
  };
}
