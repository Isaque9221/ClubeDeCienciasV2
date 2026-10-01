import type { ElementType } from "react";
import {
  Sparkles,
  Video,
  Quote,
  Users,
  Layers,
  BarChart3,
  HelpCircle,
  Mail,
  GraduationCap,
  Network,
  Megaphone,
  Milestone,
  FlaskConical,
  BookOpen,
  Flag,
} from "lucide-react";
import type { SiteConfig } from "@/compartilhado/contextos/data-context";

export type ChaveDeTexto = {
  [K in keyof SiteConfig]-?: NonNullable<SiteConfig[K]> extends string ? K : never;
}[keyof SiteConfig];

export type TipoDeCampo = "texto" | "paragrafo" | "url" | "imagem" | "lista" | "escolha";

export interface Campo {
  chave: ChaveDeTexto;
  rotulo: string;
  dica?: string;
  tipo?: TipoDeCampo;
  inteiro?: boolean;
  opcoes?: { valor: string; rotulo: string }[];
}

export interface Bloco {
  titulo: string;
  descricao?: string;
  campos: Campo[];
}

export interface PaginaDoEditor {
  id: string;
  rotulo: string;
  icone: ElementType;
  ondeAparece: string;
  blocos: Bloco[];
  blocoEspecial?: "faq" | "aviso" | "fonte";
}

const t = (chave: ChaveDeTexto, rotulo: string, dica?: string): Campo => ({
  chave,
  rotulo,
  dica,
});

const p = (chave: ChaveDeTexto, rotulo: string, dica?: string): Campo => ({
  chave,
  rotulo,
  dica,
  tipo: "paragrafo",
  inteiro: true,
});

const l = (chave: ChaveDeTexto, rotulo: string, dica?: string): Campo => ({
  chave,
  rotulo,
  dica: dica || "Um item por linha.",
  tipo: "lista",
  inteiro: true,
});

export const ESQUEMA_DO_EDITOR: PaginaDoEditor[] = [
  {
    id: "identidade",
    rotulo: "Identidade & Marca",
    icone: Sparkles,
    ondeAparece: "Aba do navegador, rodapé e o selo do topo do site",
    blocoEspecial: "fonte",
    blocos: [
      {
        titulo: "Nome do clube",
        descricao: "Aparece na aba do navegador e no rodapé.",
        campos: [
          t("siteTitle", "Nome do clube", "O nome completo, como no rodapé"),
          t(
            "siteSubtitle",
            "Complemento do nome",
            "Vai depois do nome na aba do navegador. Deixe vazio para não usar"
          ),
          t("tagline", "Frase do selo", "A frase do selo preto no topo do hero"),
          t("locationCity", "Cidade", "Usada no selo do hero e no rodapé"),
        ],
      },
      {
        titulo: "Mídia de fundo",
        campos: [
          {
            chave: "heroVideoUrl",
            rotulo: "Vídeo de fundo do hero",
            dica: "Endereço de um arquivo .mp4",
            tipo: "url",
            inteiro: true,
          },
        ],
      },
    ],
  },

  {
    id: "hero",
    rotulo: "Capa & Botões",
    icone: Video,
    ondeAparece: "A primeira tela do site, com o vídeo de fundo",
    blocos: [
      {
        titulo: "O título gigante",
        descricao: "As três linhas que ficam no meio da capa.",
        campos: [
          t("heroTitleTop", "Linha de cima", "Sai em contorno vazado"),
          t("heroTitleHighlight", "Linha do meio", "A palavra grande dourada"),
          t("heroTitleBottom", "Linha de baixo", "A linha espaçada embaixo"),
        ],
      },
      {
        titulo: "Botão 1 — Junte-se",
        campos: [t("heroBtn1Title", "Título"), t("heroBtn1Subtitle", "Subtítulo")],
      },
      {
        titulo: "Botão 2 — Conheça o Clube",
        campos: [t("heroBtn2Title", "Título"), t("heroBtn2Subtitle", "Subtítulo")],
      },
      {
        titulo: "Botão 3 — Nossos Membros",
        campos: [
          t("heroBtn3Title", "Título"),
          t("heroBtn3Subtitle", "Subtítulo"),
          t("heroBtn3Badge", "Etiqueta", "A tarja pequena dourada"),
        ],
      },
      {
        titulo: "Botão 4 — Projetos",
        campos: [
          t("heroBtn4Title", "Título"),
          t("heroBtn4Subtitle", "Subtítulo"),
          t("heroBtn4Badge", "Etiqueta", "A tarja pequena dourada"),
        ],
      },
      {
        titulo: "Botão 5 — Nossa Trajetória (Dock)",
        campos: [
          t("heroBtnTrajetoriaTitle", "Título"),
          t("heroBtnTrajetoriaSubtitle", "Subtítulo"),
          t("heroBtnTrajetoriaBadge", "Etiqueta", "A tarja pequena dourada"),
        ],
      },
      {
        titulo: 'A lista do "Explorar"',
        descricao: "O botão da barra do topo que abre o mapa do site.",
        campos: [t("exploreLabel", "Nome do botão"), t("exploreTitle", "Título da lista")],
      },
    ],
  },

  {
    id: "sobre",
    rotulo: "Sobre Nós",
    icone: Quote,
    ondeAparece: 'A seção "O que é o Clube de Ciências?"',
    blocos: [
      {
        titulo: "Abertura da seção",
        campos: [
          t("aboutBadge", "Etiqueta"),
          t("aboutTitle", "Título"),
          p("aboutDescription", "Descrição"),
        ],
      },
      {
        titulo: "Selo de prêmio",
        descricao: "O cartão com a logo, ao lado do texto de abertura.",
        campos: [
          t("awardBadge", "Etiqueta"),
          t("awardTitle", "Título"),
          t("awardSubtitle", "Subtítulo"),
          {
            chave: "awardLogo",
            rotulo: "Logo do Prêmio",
            dica: "Caminho da imagem em public/ ou link externo",
            tipo: "imagem",
            inteiro: true,
          },
        ],
      },
      {
        titulo: "Chamada das abas",
        campos: [
          t("aboutTabsCallLeft", "Texto da esquerda"),
          t("aboutTabsCallRight", "Texto da direita"),
        ],
      },
      {
        titulo: "Aba 1",
        campos: [
          t("aboutTab1Title", "Nome da aba"),
          t("aboutTab1Sub", "Linha pequena"),
          p("aboutTab1Desc", "Parágrafo do conteúdo"),
          l("aboutTab1Items", "Itens de destaque", "Lista com marcadores — um por linha"),
        ],
      },
      {
        titulo: "Aba 2",
        campos: [
          t("aboutTab2Title", "Nome da aba"),
          t("aboutTab2Sub", "Linha pequena"),
          p("aboutTab2Desc", "Parágrafo do conteúdo"),
          l("aboutTab2Items", "Itens de destaque", "Lista com marcadores — um por linha"),
        ],
      },
      {
        titulo: "Aba 3",
        campos: [
          t("aboutTab3Title", "Nome da aba"),
          t("aboutTab3Sub", "Linha pequena"),
          p("aboutTab3Desc", "Parágrafo do conteúdo"),
          l("aboutTab3Items", "Itens de destaque", "Lista com marcadores — um por linha"),
        ],
      },
      {
        titulo: "Aba 4",
        campos: [
          t("aboutTab4Title", "Nome da aba"),
          t("aboutTab4Sub", "Linha pequena"),
          p("aboutTab4Desc", "Parágrafo do conteúdo"),
          l("aboutTab4Items", "Itens de destaque", "Lista com marcadores — um por linha"),
        ],
      },
      {
        titulo: "Card de missão 1",
        campos: [
          t("aboutMission1Badge", "Etiqueta"),
          t("aboutMission1Title", "Título"),
          t("aboutMission1Sub", "Subtítulo"),
          p("aboutMission1Desc", "Descrição"),
        ],
      },
      {
        titulo: "Card de missão 2",
        campos: [
          t("aboutMission2Badge", "Etiqueta"),
          t("aboutMission2Title", "Título"),
          t("aboutMission2Sub", "Subtítulo"),
          p("aboutMission2Desc", "Descrição"),
        ],
      },
      {
        titulo: "Card de missão 3",
        campos: [
          t("aboutMission3Badge", "Etiqueta"),
          t("aboutMission3Title", "Título"),
          t("aboutMission3Sub", "Subtítulo"),
          p("aboutMission3Desc", "Descrição"),
        ],
      },
      {
        titulo: "Citação dourada",
        descricao: "O bloco com aspas, no fim da seção.",
        campos: [p("quoteText", "A frase"), t("quoteAuthor", "Autor"), t("quoteLocation", "Lugar")],
      },
    ],
  },

  {
    id: "lideranca",
    rotulo: "Liderança",
    icone: Users,
    ondeAparece: 'A seção "Quem faz a ciência acontecer"',
    blocos: [
      {
        titulo: "Cabeçalho da seção",
        campos: [
          t("teamBadge", "Etiqueta"),
          t("teamTitle", "Título"),
          p("teamSubtitle", "Subtítulo"),
        ],
      },
      {
        titulo: "Líder 1",
        campos: [
          t("leader1Name", "Nome"),
          t("leader1Role", "Cargo"),
          t("leader1SuperTag", "Super-etiqueta"),
          t("leader1Area", "Área de atuação"),
          {
            chave: "leader1Image",
            rotulo: "Foto",
            dica: "Caminho dentro de public/, por exemplo /Victor.jpeg",
            tipo: "imagem",
          },
          t("leader1Tags", "Especialidades", "Separe por vírgula"),
          p("leader1Bio", "Biografia"),
          p("leader1Quote", "Citação"),
        ],
      },
      {
        titulo: "Líder 1 — números de destaque",
        campos: [
          t("leader1Stat1Value", "1º valor"),
          t("leader1Stat1Label", "1º rótulo"),
          t("leader1Stat2Value", "2º valor"),
          t("leader1Stat2Label", "2º rótulo"),
          t("leader1Stat3Value", "3º valor"),
          t("leader1Stat3Label", "3º rótulo"),
        ],
      },
      {
        titulo: "Líder 2",
        campos: [
          t("leader2Name", "Nome"),
          t("leader2Role", "Cargo"),
          t("leader2SuperTag", "Super-etiqueta"),
          t("leader2Area", "Área de atuação"),
          {
            chave: "leader2Image",
            rotulo: "Foto",
            dica: "Caminho dentro de public/",
            tipo: "imagem",
          },
          t("leader2Tags", "Especialidades", "Separe por vírgula"),
          p("leader2Bio", "Biografia"),
          p("leader2Quote", "Citação"),
        ],
      },
      {
        titulo: "Líder 2 — números de destaque",
        campos: [
          t("leader2Stat1Value", "1º valor"),
          t("leader2Stat1Label", "1º rótulo"),
          t("leader2Stat2Value", "2º valor"),
          t("leader2Stat2Label", "2º rótulo"),
          t("leader2Stat3Value", "3º valor"),
          t("leader2Stat3Label", "3º rótulo"),
        ],
      },
    ],
  },

  {
    id: "pilares",
    rotulo: "Pilares",
    icone: Layers,
    ondeAparece: 'A seção "Oportunidades para além da escola"',
    blocos: [
      {
        titulo: "Cabeçalho da seção",
        campos: [
          t("pillarsBadge", "Etiqueta"),
          t("pillarsTitle", "Título"),
          p("pillarsSubtitle", "Subtítulo"),
        ],
      },
      ...[1, 2, 3, 4, 5, 6].map((n) => ({
        titulo: `Pilar ${n}`,
        campos: [
          t(`pillar${n}Title` as ChaveDeTexto, "Título"),
          t(`pillar${n}Sub` as ChaveDeTexto, "Complemento", "Sai em dourado"),
          t(`pillar${n}Tagline` as ChaveDeTexto, "Tagline"),
          p(`pillar${n}Desc` as ChaveDeTexto, "Descrição"),
          l(
            `pillar${n}Items` as ChaveDeTexto,
            "Itens do Pilar",
            "Lista com ícone de verificação — um por linha"
          ),
        ],
      })),
    ],
  },

  {
    id: "mentores",
    rotulo: "Mentores",
    icone: GraduationCap,
    ondeAparece: 'A seção "Nossos Mentores", na página inicial',
    blocos: [
      {
        titulo: "Cabeçalho da seção",
        campos: [
          t("mentorsBadge", "Etiqueta"),
          t("mentorsTitle", "Título"),
          p("mentorsSubtitle", "Subtítulo"),
        ],
      },
      {
        titulo: "Contadores e botões",
        campos: [
          t("mentorsCounterLabel", "Rótulo do contador"),
          t("mentorsAwardLabel", "Selo ao lado"),
          t("mentorsCardFooter", "Rodapé do cartão"),
          t("mentorsProfileBtn", "Botão do cartão"),
          {
            chave: "mentorsDirectoryBtn",
            rotulo: "Botão do diretório",
            dica: "Onde escrever {quantidade}, entra o número de integrantes",
            inteiro: true,
          },
        ],
      },
    ],
  },

  {
    id: "numeros",
    rotulo: "Números & Faixas",
    icone: BarChart3,
    ondeAparece: "A faixa de números e as duas faixas rolantes",
    blocos: [
      ...[1, 2, 3, 4].map((n) => ({
        titulo: `Número ${n}`,
        campos: [
          t(`stat${n}Value` as ChaveDeTexto, "Valor", "Só o número conta sozinho"),
          t(`stat${n}Label` as ChaveDeTexto, "Rótulo"),
          t(`stat${n}Desc` as ChaveDeTexto, "Detalhe"),
        ],
      })),
      {
        titulo: "Faixas rolantes",
        descricao: "O texto que passa deslizando de um lado ao outro.",
        campos: [
          { chave: "ticker1" as ChaveDeTexto, rotulo: "Primeira faixa", inteiro: true },
          { chave: "ticker2" as ChaveDeTexto, rotulo: "Segunda faixa", inteiro: true },
        ],
      },
    ],
  },

  {
    id: "pontes",
    rotulo: "Pontes & Parcerias",
    icone: Network,
    ondeAparece: 'A seção "Pontes que Construímos"',
    blocos: [
      {
        titulo: "Cabeçalho da seção",
        campos: [
          t("bridgesBadge", "Etiqueta"),
          t("bridgesTitle", "Título"),
          p("bridgesSubtitle", "Subtítulo"),
        ],
      },
      {
        titulo: "Contadores",
        campos: [
          t("bridgesCounterFronts", "Rótulo de frentes"),
          t("bridgesCounterOrgs", "Rótulo de organizações"),
        ],
      },
      ...[1, 2, 3, 4].map((n) => ({
        titulo: `Grupo de Parcerias ${n}`,
        campos: [
          t(`bridgeGroup${n}Title` as ChaveDeTexto, "Título do Grupo"),
          p(`bridgeGroup${n}Subtitle` as ChaveDeTexto, "Descrição do Grupo"),
          l(
            `bridgeGroup${n}Partners` as ChaveDeTexto,
            "Parceiros do Grupo",
            "Formato: Nome | Descrição | Sigla (um por linha)"
          ),
        ],
      })),
    ],
  },

  {
    id: "manifesto",
    rotulo: "Manifesto",
    icone: Flag,
    ondeAparece: "O bloco com aspas grandes, antes do FAQ",
    blocos: [
      {
        titulo: "A frase",
        campos: [
          p("manifestoText", "Frase"),
          t("manifestoAuthor", "Autor"),
          t("manifestoSignature", "Assinatura"),
        ],
      },
    ],
  },

  {
    id: "faq",
    rotulo: "Perguntas Frequentes",
    icone: HelpCircle,
    ondeAparece: 'A seção "Tire suas dúvidas"',
    blocoEspecial: "faq",
    blocos: [
      {
        titulo: "Cabeçalho da seção",
        campos: [
          t("faqBadge", "Etiqueta"),
          t("faqTitle", "Título"),
          t("faqTitleHighlight", "Parte dourada do título"),
        ],
      },
    ],
  },

  {
    id: "cta",
    rotulo: "Convite Final",
    icone: Megaphone,
    ondeAparece: 'A caixa dourada "Pronto para explorar o conhecimento?"',
    blocos: [
      {
        titulo: "O convite",
        campos: [
          t("ctaBadge", "Etiqueta"),
          t("ctaTitle", "Título"),
          p("ctaDescription", "Descrição"),
        ],
      },
      {
        titulo: "Botões",
        campos: [
          t("ctaBtnText", "Botão dourado"),
          t("ctaBtnSecondaryText", "Botão escuro"),
          t(
            "ctaPhone",
            "Telefone / WhatsApp do botão dourado",
            "Com DDD, ex.: (77) 99999-9999. O botão abre uma conversa no WhatsApp com este número"
          ),
          p(
            "ctaWhatsappMessage",
            "Mensagem inicial do WhatsApp",
            "O texto que já aparece escrito na conversa quando a pessoa clica"
          ),
          p(
            "ctaBtnMessage",
            "Mensagem ao clicar",
            "Aparece só quando nenhum telefone foi preenchido"
          ),
        ],
      },
    ],
  },

  {
    id: "rodape",
    rotulo: "Rodapé & Contatos",
    icone: Mail,
    ondeAparece: "O rodapé, no fim de toda página",
    blocos: [
      {
        titulo: "Contatos",
        campos: [
          t("contactEmail", "E-mail"),
          t("contactAddress", "Endereço"),
          t("contactInstagram", "Instagram", "O @ do perfil"),
          {
            chave: "contactInstagramUrl" as ChaveDeTexto,
            rotulo: "Link do Instagram",
            tipo: "url" as const,
          },
          t(
            "contactScheduleNotice",
            "Aviso de Horário / Agendamento",
            "Ex: Atendimento sob agendamento"
          ),
        ],
      },
      {
        titulo: "Quadro de telemetria",
        descricao: "O quadrinho escuro com bioma, altitude e relógio.",
        campos: [
          t("biome", "Bioma"),
          t("altitude", "Altitude"),
          t(
            "coordinates",
            "Coordenadas",
            "Aparece só se estiver preenchido. Deixe vazio para esconder"
          ),
        ],
      },
      {
        titulo: "Identidade do rodapé",
        campos: [
          t("footerTopBrand", "Marca da barra de cima"),
          p("footerQuote", "Frase em itálico"),
        ],
      },
      {
        titulo: "Bloco de parceiros",
        campos: [
          t("footerPartnersBadge", "Etiqueta"),
          t("footerPartnersTitle", "Título"),
          p("footerPartnersSubtitle", "Subtítulo"),
          {
            chave: "footerPartnersSpeed" as ChaveDeTexto,
            rotulo: "Ritmo da faixa",
            tipo: "escolha" as const,
            dica: "Os logos deslizam numa faixa unica. A faixa para sozinha quando o visitante passa o mouse, para dar tempo de clicar.",
            opcoes: [
              { valor: "lento", rotulo: "Lento" },
              { valor: "normal", rotulo: "Normal" },
              { valor: "rapido", rotulo: "Rapido" },
            ],
          },
        ],
      },
      {
        titulo: "Títulos das colunas",
        campos: [
          t("footerNavTitle", "Coluna de navegação"),
          t("footerContactsTitle", "Coluna de contatos"),
        ],
      },
      {
        titulo: "Assinatura gigante",
        campos: [
          t("footerSignatureBig", "Linha grande"),
          t("footerSignatureSmall", "Linha pequena"),
        ],
      },
      {
        titulo: "Créditos",
        campos: [t("footerCreditsBrand", "Marca"), t("footerCreditsAuthor", "Autor")],
      },
    ],
  },

  {
    id: "pagina-membros",
    rotulo: "Página de Membros",
    icone: Users,
    ondeAparece: 'A página inteira que abre em "Nossos Membros"',
    blocos: [
      {
        titulo: "Topo da página",
        campos: [
          t("membersPageBadge", "Etiqueta"),
          t("membersPageTitle", "Título"),
          p("membersPageSubtitle", "Subtítulo"),
        ],
      },
      {
        titulo: "Mural de rostos",
        descricao: "A faixa com os retratos em movimento.",
        campos: [
          t("muralTitle", "Início da frase"),
          t("muralHighlight", "Parte dourada da frase"),
          t("muralCaption", "Legenda pequena"),
        ],
      },
      {
        titulo: "Bloco da liderança",
        campos: [t("membersLeadershipBadge", "Etiqueta"), t("membersLeadershipTitle", "Título")],
      },
      {
        titulo: "Bloco dos mentores",
        campos: [
          t("membersMentorsBadge", "Etiqueta"),
          t("membersMentorsTitle", "Título"),
          p("membersMentorsSubtitle", "Subtítulo"),
        ],
      },
      {
        titulo: "Diretório completo",
        campos: [
          t("membersDirectoryBadge", "Etiqueta"),
          t("membersDirectoryTitle", "Título"),
          p("membersDirectorySubtitle", "Subtítulo"),
          t("membersSearchPlaceholder", "Texto do campo de busca"),
        ],
      },
      {
        titulo: "Convite do fim da página",
        campos: [
          t("membersCtaTitle", "Título"),
          p("membersCtaText", "Texto"),
          t("membersCtaBtn", "Botão"),
        ],
      },
    ],
  },

  {
    id: "pagina-projetos",
    rotulo: "Página de Projetos",
    icone: FlaskConical,
    ondeAparece: 'A página inteira que abre em "Projetos Científicos"',
    blocos: [
      {
        titulo: "Topo da página",
        campos: [
          t("projectsBrand", "Marca da barra do topo"),
          t("projectsBadge", "Etiqueta"),
          t("projectsTitle", "Título"),
          p("projectsSubtitle", "Subtítulo"),
        ],
      },
      {
        titulo: "Busca e cartões",
        campos: [
          t("projectsSearchPlaceholder", "Texto do campo de busca"),
          t("projectsCardBtn", "Botão do cartão"),
        ],
      },
      {
        titulo: "Quando a busca não acha nada",
        campos: [t("projectsEmptyTitle", "Título"), p("projectsEmptySubtitle", "Texto")],
      },
      {
        titulo: "Aviso de página em desenvolvimento",
        descricao:
          "Enquanto a página estiver em desenvolvimento, quem clicar em Projetos Científicos vê este aviso no lugar da lista.",
        campos: [
          {
            chave: "projectsStatus" as ChaveDeTexto,
            rotulo: "Situação da página",
            tipo: "escolha" as const,
            dica: 'Troque para "Publicada" quando os projetos estiverem prontos para o público.',
            opcoes: [
              { valor: "desenvolvimento", rotulo: "Em desenvolvimento" },
              { valor: "publicada", rotulo: "Publicada" },
            ],
          },
          t("projectsDevBadge", "Etiqueta do aviso"),
          t("projectsDevTitle", "Título do aviso"),
          p("projectsDevMessage", "Mensagem do aviso"),
        ],
      },
    ],
  },

  {
    id: "pagina-trajetoria",
    rotulo: "Página da Trajetória",
    icone: Milestone,
    ondeAparece: 'A página inteira que abre em "Nossa Trajetória"',
    blocos: [
      {
        titulo: "Barra do topo",
        campos: [t("journeyBrand", "Marca"), t("journeyBackBtn", "Botão de voltar")],
      },
      {
        titulo: "Abertura",
        campos: [
          t("journeyBadge", "Etiqueta"),
          t("journeyTitle", "Título"),
          p("journeySubtitle", "Subtítulo"),
        ],
      },
      {
        titulo: "Contadores de Estatísticas",
        descricao: "Os 4 números em destaque no topo da página de trajetória.",
        campos: [
          t("journeyStat1Value", "1º Valor"),
          t("journeyStat1Label", "1º Rótulo"),
          t("journeyStat2Value", "2º Valor"),
          t("journeyStat2Label", "2º Rótulo"),
          t("journeyStat3Value", "3º Valor"),
          t("journeyStat3Label", "3º Rótulo"),
          t("journeyStat4Value", "4º Valor"),
          t("journeyStat4Label", "4º Rótulo"),
        ],
      },
      ...[1, 2, 3, 4].map((n) => ({
        titulo: `Marco Histórico ${n}`,
        campos: [
          t(`journeyMilestone${n}Year` as ChaveDeTexto, "Ano"),
          t(`journeyMilestone${n}Month` as ChaveDeTexto, "Mês"),
          t(`journeyMilestone${n}Badge` as ChaveDeTexto, "Etiqueta"),
          t(`journeyMilestone${n}Title` as ChaveDeTexto, "Título"),
          p(`journeyMilestone${n}Desc` as ChaveDeTexto, "Descrição"),
          l(
            `journeyMilestone${n}Highlights` as ChaveDeTexto,
            "Conquistas / Destaques",
            "Um destaque por linha"
          ),
        ],
      })),
      {
        titulo: "Fechamento",
        campos: [
          t("journeyFinalBadge", "Etiqueta"),
          t("journeyFinalTitle", "Título"),
          p("journeyFinalText", "Texto"),
          t("journeyFinalBtnProjects", "Botão de projetos"),
          t("journeyFinalBtnMembers", "Botão de membros"),
        ],
      },
    ],
  },

  {
    id: "abertura",
    rotulo: "Tela de Abertura",
    icone: BookOpen,
    ondeAparece: 'A pergunta "Para onde você deseja ir?", ao carregar o site',
    blocos: [
      {
        titulo: "A pergunta",
        campos: [
          t("loadingChoiceBadge", "Etiqueta"),
          t("loadingChoiceTitle", "Início do título"),
          t("loadingChoiceHighlight", "Parte dourada do título"),
          p("loadingChoiceSubtitle", "Subtítulo"),
        ],
      },
      ...[1, 2, 3, 4].map((n) => ({
        titulo: `Card de Destino ${n}`,
        campos: [
          t(`loadingCard${n}Title` as ChaveDeTexto, "Título"),
          t(`loadingCard${n}Subtitle` as ChaveDeTexto, "Subtítulo"),
          t(`loadingCard${n}Badge` as ChaveDeTexto, "Etiqueta"),
          t(`loadingCard${n}Highlight` as ChaveDeTexto, "Destaque (Dourado)"),
          t(`loadingCard${n}Status` as ChaveDeTexto, "Status do Botão"),
          {
            chave: `loadingCard${n}Image` as ChaveDeTexto,
            rotulo: "Imagem do Card",
            dica: "Caminho da imagem em public/ ou link externo",
            tipo: "imagem" as TipoDeCampo,
            inteiro: true,
          },
        ],
      })),
    ],
  },

  {
    id: "avisos",
    rotulo: "Avisos & Chamadas",
    icone: Megaphone,
    ondeAparece: "Uma faixa fina no topo do site, quando ligada",
    blocoEspecial: "aviso",
    blocos: [],
  },
];

export const TOTAL_DE_CAMPOS = ESQUEMA_DO_EDITOR.reduce(
  (soma, pagina) => soma + pagina.blocos.reduce((s, bloco) => s + bloco.campos.length, 0),
  0
);
