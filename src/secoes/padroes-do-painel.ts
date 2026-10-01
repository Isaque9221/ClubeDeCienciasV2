import { HERO } from "./hero/conteudo";
import { TICKER } from "./ticker/conteudo";
import { SOBRE } from "./sobre/conteudo";
import { ESTATISTICAS } from "./estatisticas/conteudo";
import { PILARES } from "./pilares/conteudo";
import { EQUIPE } from "./equipe/conteudo";
import { FAQ } from "./faq/conteudo";
import { CTA } from "./cta/conteudo";
import { RODAPE } from "./rodape/conteudo";
import { MANIFESTO } from "./manifesto/conteudo";
import { PESQUISADORES } from "./pesquisadores/conteudo";
import { PONTES } from "./pontes/conteudo";
import { TRAJETORIA } from "../paginas/trajetoria/conteudo";
import { PROJETOS } from "../paginas/projetos/conteudo";
import { EXPLORAR } from "./hero/conteudo";
import { CARREGAMENTO } from "../recursos/carregamento/conteudo";
import { listaComoLinhas } from "./_nucleo/listas";

const [pilar1, pilar2, pilar3, pilar4, pilar5, pilar6] = PILARES.lista;
const [numero1, numero2, numero3, numero4] = ESTATISTICAS.lista;
const [lider1, lider2] = EQUIPE.lideres;
const [aba1, aba2, aba3, aba4] = SOBRE.abas;
const [missao1, missao2, missao3] = SOBRE.cardsDeMissao;
const [pGrupo1, pGrupo2, pGrupo3, pGrupo4] = PONTES.grupos;
const [dest1, dest2, dest3, dest4] = CARREGAMENTO.destinos;
const [tStat1, tStat2, tStat3, tStat4] = TRAJETORIA.hero.estatisticas;
const [tMarco1, tMarco2, tMarco3, tMarco4] = TRAJETORIA.marcos;

export const PADROES_DO_PAINEL = {
  siteTitle: RODAPE.identidade.nomeDoClube,
  siteSubtitle: HERO.titulo.linhaDeBaixo,
  tagline: HERO.selo.frase,
  locationCity: HERO.selo.cidade,
  heroVideoUrl: HERO.videoDeFundo,
  fontFamily: "Inter",
  primaryColor: "amber",

  heroTitleTop: HERO.titulo.linhaDeCima,
  heroTitleHighlight: HERO.titulo.linhaDoMeio,
  heroTitleBottom: HERO.titulo.linhaDeBaixo,
  heroBtn1Title: HERO.botoes.inscrever.titulo,
  heroBtn1Subtitle: HERO.botoes.inscrever.subtitulo,
  heroBtn2Title: HERO.botoes.conhecer.titulo,
  heroBtn2Subtitle: HERO.botoes.conhecer.subtitulo,
  heroBtn3Title: HERO.botoes.membros.titulo,
  heroBtn3Subtitle: HERO.botoes.membros.subtitulo,
  heroBtn3Badge: HERO.botoes.membros.etiqueta,
  heroBtn4Title: HERO.botoes.projetos.titulo,
  heroBtn4Subtitle: HERO.botoes.projetos.subtitulo,
  heroBtn4Badge: HERO.botoes.projetos.etiqueta,

  aboutBadge: SOBRE.etiqueta,
  aboutTitle: SOBRE.titulo,
  aboutDescription: SOBRE.descricao,
  awardTitle: SOBRE.premio.titulo,
  awardSubtitle: SOBRE.premio.subtitulo,
  awardBadge: SOBRE.premio.etiqueta,

  leader1Name: lider1.nome,
  leader1Role: lider1.cargo,
  leader1Area: lider1.area,
  leader1Bio: lider1.bio,
  leader1Image: lider1.foto,
  leader1Quote: lider1.citacao,
  leader1SuperTag: lider1.superEtiqueta,
  leader1Tags: lider1.etiquetas.join(", "),
  leader1Stat1Value: lider1.destaques?.[0]?.valor || "",
  leader1Stat1Label: lider1.destaques?.[0]?.rotulo || "",
  leader1Stat2Value: lider1.destaques?.[1]?.valor || "",
  leader1Stat2Label: lider1.destaques?.[1]?.rotulo || "",
  leader1Stat3Value: lider1.destaques?.[2]?.valor || "",
  leader1Stat3Label: lider1.destaques?.[2]?.rotulo || "",

  leader2Name: lider2.nome,
  leader2Role: lider2.cargo,
  leader2Area: lider2.area,
  leader2Bio: lider2.bio,
  leader2Image: lider2.foto,
  leader2Quote: lider2.citacao,
  leader2SuperTag: lider2.superEtiqueta,
  leader2Tags: lider2.etiquetas.join(", "),
  leader2Stat1Value: lider2.destaques?.[0]?.valor || "",
  leader2Stat1Label: lider2.destaques?.[0]?.rotulo || "",
  leader2Stat2Value: lider2.destaques?.[1]?.valor || "",
  leader2Stat2Label: lider2.destaques?.[1]?.rotulo || "",
  leader2Stat3Value: lider2.destaques?.[2]?.valor || "",
  leader2Stat3Label: lider2.destaques?.[2]?.rotulo || "",

  pillar1Title: pilar1.titulo,
  pillar1Sub: pilar1.complemento,
  pillar1Tagline: pilar1.tagline,
  pillar1Desc: pilar1.descricao,

  pillar2Title: pilar2.titulo,
  pillar2Sub: pilar2.complemento,
  pillar2Tagline: pilar2.tagline,
  pillar2Desc: pilar2.descricao,

  pillar3Title: pilar3.titulo,
  pillar3Sub: pilar3.complemento,
  pillar3Tagline: pilar3.tagline,
  pillar3Desc: pilar3.descricao,

  pillar4Title: pilar4.titulo,
  pillar4Sub: pilar4.complemento,
  pillar4Tagline: pilar4.tagline,
  pillar4Desc: pilar4.descricao,

  pillar5Title: pilar5.titulo,
  pillar5Sub: pilar5.complemento,
  pillar5Tagline: pilar5.tagline,
  pillar5Desc: pilar5.descricao,

  pillar6Title: pilar6.titulo,
  pillar6Sub: pilar6.complemento,
  pillar6Tagline: pilar6.tagline,
  pillar6Desc: pilar6.descricao,

  stat1Value: numero1.numero,
  stat1Label: numero1.rotulo,
  stat1Desc: numero1.detalhe,
  stat2Value: numero2.numero,
  stat2Label: numero2.rotulo,
  stat2Desc: numero2.detalhe,
  stat3Value: numero3.numero,
  stat3Label: numero3.rotulo,
  stat3Desc: numero3.detalhe,
  stat4Value: numero4.numero,
  stat4Label: numero4.rotulo,
  stat4Desc: numero4.detalhe,

  ticker1: TICKER.primeiraFaixa,
  ticker2: TICKER.segundaFaixa,

  quoteText: SOBRE.citacao.frase,
  quoteAuthor: SOBRE.citacao.autor,
  quoteLocation: SOBRE.citacao.local,

  ctaBadge: CTA.etiqueta,
  ctaTitle: CTA.titulo,
  ctaDescription: CTA.descricao,
  ctaBtnText: CTA.botaoPrincipal.texto,

  contactEmail: RODAPE.contatos.email,
  contactAddress: RODAPE.contatos.endereco,
  contactInstagram: RODAPE.identidade.instagram,
  contactInstagramUrl: RODAPE.identidade.linkDoInstagram,
  coordinates: "11°38′10″ S, 39°16′37″ W",
  altitude: RODAPE.telemetria.altitude,
  biome: RODAPE.telemetria.bioma,
  footerQuote: RODAPE.identidade.frase,

  membersPageTitle: "Nossos Pesquisadores & Mentores",
  membersPageSubtitle:
    "Estudantes e orientadores comprometidos com a investigação científica, inovação e desenvolvimento regional.",
  membersPageBadge: "35 Clubistas Integrados",

  exploreLabel: EXPLORAR.rotulo,
  exploreTitle: EXPLORAR.titulo,

  aboutTabsCallLeft: SOBRE.chamadaDasAbas.esquerda,
  aboutTabsCallRight: SOBRE.chamadaDasAbas.direita,

  aboutTab1Title: aba1.titulo,
  aboutTab1Sub: aba1.subtitulo,
  aboutTab1Desc: aba1.descricao,
  aboutTab2Title: aba2.titulo,
  aboutTab2Sub: aba2.subtitulo,
  aboutTab2Desc: aba2.descricao,
  aboutTab3Title: aba3.titulo,
  aboutTab3Sub: aba3.subtitulo,
  aboutTab3Desc: aba3.descricao,
  aboutTab4Title: aba4.titulo,
  aboutTab4Sub: aba4.subtitulo,
  aboutTab4Desc: aba4.descricao,

  aboutMission1Badge: missao1.etiqueta,
  aboutMission1Title: missao1.titulo,
  aboutMission1Sub: missao1.subtitulo,
  aboutMission1Desc: missao1.descricao,
  aboutMission2Badge: missao2.etiqueta,
  aboutMission2Title: missao2.titulo,
  aboutMission2Sub: missao2.subtitulo,
  aboutMission2Desc: missao2.descricao,
  aboutMission3Badge: missao3.etiqueta,
  aboutMission3Title: missao3.titulo,
  aboutMission3Sub: missao3.subtitulo,
  aboutMission3Desc: missao3.descricao,

  pillarsBadge: PILARES.etiqueta,
  pillarsTitle: PILARES.titulo,
  pillarsSubtitle: PILARES.subtitulo,

  teamBadge: EQUIPE.etiqueta,
  teamTitle: EQUIPE.titulo,
  teamSubtitle: EQUIPE.subtitulo,

  faqBadge: FAQ.etiqueta,
  faqTitle: FAQ.titulo,
  faqTitleHighlight: FAQ.tituloEmDestaque,

  mentorsBadge: PESQUISADORES.etiqueta,
  mentorsTitle: PESQUISADORES.titulo,
  mentorsSubtitle: PESQUISADORES.subtitulo,
  mentorsCounterLabel: PESQUISADORES.contadores.mentores,
  mentorsAwardLabel: PESQUISADORES.contadores.premio,
  mentorsCardFooter: PESQUISADORES.rodapeDoCartao,
  mentorsProfileBtn: PESQUISADORES.botaoPerfil,
  mentorsDirectoryBtn: PESQUISADORES.botaoFinal,

  bridgesBadge: PONTES.etiqueta,
  bridgesTitle: PONTES.titulo,
  bridgesSubtitle: PONTES.subtitulo,
  bridgesCounterFronts: PONTES.contadores.frentes,
  bridgesCounterOrgs: PONTES.contadores.organizacoes,

  manifestoText: MANIFESTO.frase,
  manifestoAuthor: MANIFESTO.autor,
  manifestoSignature: MANIFESTO.assinatura,

  ctaBtnSecondaryText: CTA.botaoSecundario.texto,
  ctaBtnMessage: CTA.botaoPrincipal.mensagemAoClicar,
  ctaPhone: CTA.botaoPrincipal.telefone,
  ctaWhatsappMessage: CTA.botaoPrincipal.mensagemDoWhatsApp,

  footerTopBrand: RODAPE.marcaDoTopo,
  footerPartnersBadge: RODAPE.parceiros.etiqueta,
  footerPartnersTitle: RODAPE.parceiros.titulo,
  footerPartnersSubtitle: RODAPE.parceiros.subtitulo,
  footerPartnersColumns: "6",
  layoutSections: "",
  elementPositions: "",
  footerPartnersAlign: "centro",
  footerNavTitle: RODAPE.navegacao.titulo,
  footerContactsTitle: RODAPE.contatos.titulo,
  footerSignatureBig: RODAPE.assinatura.linhaGrande,
  footerSignatureSmall: RODAPE.assinatura.linhaPequena,
  footerCreditsBrand: RODAPE.creditos.marca,
  footerCreditsAuthor: RODAPE.creditos.autor,

  journeyBackBtn: TRAJETORIA.cabecalho.botaoVoltar,
  journeyBrand: TRAJETORIA.cabecalho.marca,
  journeyBadge: TRAJETORIA.hero.etiqueta,
  journeyTitle: TRAJETORIA.hero.titulo,
  journeySubtitle: TRAJETORIA.hero.subtitulo,
  journeyFinalBadge: TRAJETORIA.manifestoFinal.etiqueta,
  journeyFinalTitle: TRAJETORIA.manifestoFinal.titulo,
  journeyFinalText: TRAJETORIA.manifestoFinal.texto,
  journeyFinalBtnProjects: TRAJETORIA.manifestoFinal.botaoProjetos,
  journeyFinalBtnMembers: TRAJETORIA.manifestoFinal.botaoMembros,

  projectsBrand: PROJETOS.cabecalho.marca,
  projectsBadge: PROJETOS.lista.etiqueta,
  projectsTitle: PROJETOS.lista.titulo,
  projectsSubtitle: PROJETOS.lista.subtitulo,
  projectsSearchPlaceholder: PROJETOS.lista.campoDeBusca,
  projectsCardBtn: PROJETOS.lista.botaoDoCard,
  projectsEmptyTitle: PROJETOS.semResultados.titulo,
  projectsEmptySubtitle: PROJETOS.semResultados.subtitulo,
  projectsStatus: PROJETOS.emDesenvolvimento.situacao,
  mapStatus: "desenvolvimento",
  projectsDevBadge: PROJETOS.emDesenvolvimento.etiqueta,
  projectsDevTitle: PROJETOS.emDesenvolvimento.titulo,
  projectsDevMessage: PROJETOS.emDesenvolvimento.mensagem,

  muralTitle: "Uma turma inteira",
  muralHighlight: "fazendo ciência",
  muralCaption: "Cada rosto abre a ficha completa",
  membersLeadershipBadge: "Coordenação & Desenvolvimento",
  membersLeadershipTitle: "Liderança do Projeto",
  membersMentorsBadge: "Corpo Docente & Mentores",
  membersMentorsTitle: "Mentores do Clube",
  membersMentorsSubtitle:
    "Professores que orientam e guiam os jovens cientistas na formulação de hipóteses e pesquisa de campo.",
  membersDirectoryBadge: "Todos Os Membros Do Clube",
  membersDirectoryTitle: "Nossos Pesquisadores",
  membersDirectorySubtitle:
    "Clique em qualquer card para ver a foto ampliada, área de atuação e foco de pesquisa.",
  membersSearchPlaceholder: "Buscar por nome, área de pesquisa...",
  membersCtaTitle: "Quer fazer parte dessa história?",
  membersCtaText:
    "O Clube de Ciências CECLOS está sempre aberto a novas mentes curiosas, pesquisadores e apoiadores da educação no semiárido.",
  membersCtaBtn: "Inscrever-se no Clube",

  loadingChoiceBadge: CARREGAMENTO.escolha.etiqueta,
  loadingChoiceTitle: CARREGAMENTO.escolha.titulo,
  loadingChoiceHighlight: CARREGAMENTO.escolha.tituloEmDestaque,
  loadingChoiceSubtitle: CARREGAMENTO.escolha.subtitulo,

  heroBtnTrajetoriaTitle: HERO.botoes.trajetoria.titulo,
  heroBtnTrajetoriaSubtitle: HERO.botoes.trajetoria.subtitulo,
  heroBtnTrajetoriaBadge: HERO.botoes.trajetoria.etiqueta,

  awardLogo: SOBRE.premio.logo,
  aboutTab1Items: listaComoLinhas(aba1.itens),
  aboutTab2Items: listaComoLinhas(aba2.itens),
  aboutTab3Items: listaComoLinhas(aba3.itens),
  aboutTab4Items: listaComoLinhas(aba4.itens),

  pillar1Items: listaComoLinhas(pilar1.itens),
  pillar2Items: listaComoLinhas(pilar2.itens),
  pillar3Items: listaComoLinhas(pilar3.itens),
  pillar4Items: listaComoLinhas(pilar4.itens),
  pillar5Items: listaComoLinhas(pilar5.itens),
  pillar6Items: listaComoLinhas(pilar6.itens),

  bridgesGroup1Title: pGrupo1.titulo,
  bridgesGroup1Summary: pGrupo1.resumo,
  bridgesGroup1PartnerName: pGrupo1.parceiros[0]?.nome || "",
  bridgesGroup1PartnerBadge: pGrupo1.parceiros[0]?.etiqueta || "",
  bridgesGroup1PartnerDetail: pGrupo1.parceiros[0]?.detalhe || "",

  bridgesGroup2Title: pGrupo2.titulo,
  bridgesGroup2Summary: pGrupo2.resumo,
  bridgesGroup2P1Name: pGrupo2.parceiros[0]?.nome || "",
  bridgesGroup2P1Badge: pGrupo2.parceiros[0]?.etiqueta || "",
  bridgesGroup2P1Detail: pGrupo2.parceiros[0]?.detalhe || "",
  bridgesGroup2P2Name: pGrupo2.parceiros[1]?.nome || "",
  bridgesGroup2P2Badge: pGrupo2.parceiros[1]?.etiqueta || "",
  bridgesGroup2P2Detail: pGrupo2.parceiros[1]?.detalhe || "",

  bridgesGroup3Title: pGrupo3.titulo,
  bridgesGroup3Summary: pGrupo3.resumo,
  bridgesGroup3P1Name: pGrupo3.parceiros[0]?.nome || "",
  bridgesGroup3P1Badge: pGrupo3.parceiros[0]?.etiqueta || "",
  bridgesGroup3P1Detail: pGrupo3.parceiros[0]?.detalhe || "",
  bridgesGroup3P2Name: pGrupo3.parceiros[1]?.nome || "",
  bridgesGroup3P2Badge: pGrupo3.parceiros[1]?.etiqueta || "",
  bridgesGroup3P2Detail: pGrupo3.parceiros[1]?.detalhe || "",

  bridgesGroup4Title: pGrupo4.titulo,
  bridgesGroup4Summary: pGrupo4.resumo,
  bridgesGroup4PartnerName: pGrupo4.parceiros[0]?.nome || "",
  bridgesGroup4PartnerBadge: pGrupo4.parceiros[0]?.etiqueta || "",
  bridgesGroup4PartnerDetail: pGrupo4.parceiros[0]?.detalhe || "",

  contactScheduleNotice: RODAPE.contatos.aviso,

  loadingCard1Title: dest1.titulo,
  loadingCard1Subtitle: dest1.subtitulo,
  loadingCard1Badge: dest1.etiqueta,
  loadingCard1Highlight: dest1.destaque,
  loadingCard1Status: dest1.situacao,
  loadingCard1Image: dest1.imagem,

  loadingCard2Title: dest2.titulo,
  loadingCard2Subtitle: dest2.subtitulo,
  loadingCard2Badge: dest2.etiqueta,
  loadingCard2Highlight: dest2.destaque,
  loadingCard2Status: dest2.situacao,
  loadingCard2Image: dest2.imagem,

  loadingCard3Title: dest3.titulo,
  loadingCard3Subtitle: dest3.subtitulo,
  loadingCard3Badge: dest3.etiqueta,
  loadingCard3Highlight: dest3.destaque,
  loadingCard3Status: dest3.situacao,
  loadingCard3Image: dest3.imagem,

  loadingCard4Title: dest4.titulo,
  loadingCard4Subtitle: dest4.subtitulo,
  loadingCard4Badge: dest4.etiqueta,
  loadingCard4Highlight: dest4.destaque,
  loadingCard4Status: dest4.situacao,
  loadingCard4Image: dest4.imagem,

  journeyStat1Value: tStat1.valor,
  journeyStat1Label: tStat1.rotulo,
  journeyStat1Desc: tStat1.descricao,
  journeyStat2Value: tStat2.valor,
  journeyStat2Label: tStat2.rotulo,
  journeyStat2Desc: tStat2.descricao,
  journeyStat3Value: tStat3.valor,
  journeyStat3Label: tStat3.rotulo,
  journeyStat3Desc: tStat3.descricao,
  journeyStat4Value: tStat4.valor,
  journeyStat4Label: tStat4.rotulo,
  journeyStat4Desc: tStat4.descricao,

  journeyMilestone1Year: tMarco1.ano,
  journeyMilestone1Month: tMarco1.mes,
  journeyMilestone1Badge: tMarco1.etiqueta,
  journeyMilestone1Title: tMarco1.titulo,
  journeyMilestone1Desc: tMarco1.descricao,
  journeyMilestone1Highlights: listaComoLinhas(tMarco1.destaques),

  journeyMilestone2Year: tMarco2.ano,
  journeyMilestone2Month: tMarco2.mes,
  journeyMilestone2Badge: tMarco2.etiqueta,
  journeyMilestone2Title: tMarco2.titulo,
  journeyMilestone2Desc: tMarco2.descricao,
  journeyMilestone2Highlights: listaComoLinhas(tMarco2.destaques),

  journeyMilestone3Year: tMarco3.ano,
  journeyMilestone3Month: tMarco3.mes,
  journeyMilestone3Badge: tMarco3.etiqueta,
  journeyMilestone3Title: tMarco3.titulo,
  journeyMilestone3Desc: tMarco3.descricao,
  journeyMilestone3Highlights: listaComoLinhas(tMarco3.destaques),

  journeyMilestone4Year: tMarco4.ano,
  journeyMilestone4Month: tMarco4.mes,
  journeyMilestone4Badge: tMarco4.etiqueta,
  journeyMilestone4Title: tMarco4.titulo,
  journeyMilestone4Desc: tMarco4.descricao,
  journeyMilestone4Highlights: listaComoLinhas(tMarco4.destaques),

  faqs: FAQ.perguntas.map((item) => ({
    id: item.id,
    question: item.pergunta,
    answer: item.resposta,
  })),
};
