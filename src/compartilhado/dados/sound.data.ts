import type { SoundPresetInfo, PlaylistInfo, MusicTrack } from "@/compartilhado/tipos/sound.types";

export const SOUND_PRESETS: SoundPresetInfo[] = [
  {
    id: "click-modern",
    name: "Clique Moderno",
    description: "Feedback límpido, discreto e tátil de interface moderna",
    audioUrl: "/sons/cliques/click-modern.mp3",
  },
  {
    id: "bubble-pop",
    name: "Pop & Bolha",
    description: "Estalo orgânico de bolha d'água, divertido e suave",
    audioUrl: "/sons/cliques/bubble-pop.mp3",
  },
  {
    id: "switch-tactile",
    name: "Switch Mecânico",
    description: "Clique tátil autêntico de switch mecânico de precisão",
    audioUrl: "/sons/cliques/switch-tactile.mp3",
  },
  {
    id: "crystal-tap",
    name: "Toque de Cristal",
    description: "Ressonância acústica límpida de sino e vidro lapidado",
    audioUrl: "/sons/cliques/crystal-tap.mp3",
  },
  {
    id: "snap-crisp",
    name: "Snap Digital",
    description: "Estalo digital nítido, seco e ultra-responsivo",
    audioUrl: "/sons/cliques/snap-crisp.mp3",
  },
  {
    id: "soft-pillow",
    name: "Toque Aveludado",
    description: "Amortecimento suave e calmo para navegação elegante",
    audioUrl: "/sons/cliques/soft-pillow.mp3",
  },
  {
    id: "studio-confirm",
    name: "Studio Confirm",
    description: "Feedback profissional de confirmação padrão estúdio",
    audioUrl: "/sons/cliques/studio-confirm.mp3",
  },
  {
    id: "zen-bell",
    name: "Sino Zen",
    description: "Campainha harmônica oriental suave para foco e paz",
    audioUrl: "/sons/cliques/zen-bell.mp3",
  },
];

const PLANTASIA_YOUTUBE_ID = "SZkR3PyHTs0";

const PLANTASIA_TRACKS: MusicTrack[] = [
  {
    id: 1,
    title: "01. Plantasia",
    duration: "3:21",
    startSeconds: 0,
    audioUrl: "/sons/plantasia/01%20Plantasia.mp3",
    description:
      "Sintetizadores analógicos Moog quentes e texturas botânicas cósmicas de abertura.",
  },
  {
    id: 2,
    title: "02. Symphony for a Spider Plant",
    duration: "2:41",
    startSeconds: 201,
    audioUrl: "/sons/plantasia/02%20Symphony%20for%20a%20Spider%20Plant.mp3",
    description: "Harmonia barroca botânica em sintetizador Moog modular para crescimento vegetal.",
  },
  {
    id: 3,
    title: "03. Baby's Tears Blues",
    duration: "3:03",
    startSeconds: 362,
    audioUrl: "/sons/plantasia/03%20Baby's%20Tears%20Blues.mp3",
    description: "Melodia relaxante e envolvente com modulações suaves para observação e estudos.",
  },
  {
    id: 4,
    title: "04. Ode to an African Violet",
    duration: "4:03",
    startSeconds: 545,
    audioUrl: "/sons/plantasia/04%20Ode%20to%20an%20African%20Violet.mp3",
    description: "Arranjos etéreos e contemplativos de Moog clássico dos anos 70.",
  },
  {
    id: 5,
    title: "05. Concerto for Philodendron & Pothos",
    duration: "3:09",
    startSeconds: 788,
    audioUrl: "/sons/plantasia/05%20Concerto%20for%20Philodendron%20and%20Pothos.mp3",
    description: "Contraponto rítmico vibrante e orgânico para mentes ativas em laboratório.",
  },
  {
    id: 6,
    title: "06. Rhapsody in Green",
    duration: "3:28",
    startSeconds: 977,
    audioUrl: "/sons/plantasia/06%20Rhapsody%20in%20Green.mp3",
    description: "Variações sonoras cintilantes para foco, leitura e investigação científica.",
  },
  {
    id: 7,
    title: "07. Swingin' Spathiphyllums",
    duration: "2:57",
    startSeconds: 1185,
    audioUrl: "/sons/plantasia/07%20Swingin'%20Spathiphyllums.mp3",
    description: "Ritmo leve e futurista com modulações analógicas exclusivas.",
  },
  {
    id: 8,
    title: "08. You Don't Have to Walk on Water to Water Your Begonias",
    duration: "2:31",
    startSeconds: 1362,
    audioUrl: "/sons/plantasia/08%20You%20Don't%20Have%20to%20Walk%20a%20Begonia.mp3",
    description: "Composição lúdica e inspiradora para experimentação e criatividade.",
  },
  {
    id: 9,
    title: "09. A Mellow Mood for Maidenhair",
    duration: "2:17",
    startSeconds: 1512,
    audioUrl: "/sons/plantasia/09%20A%20Mellow%20Mood%20for%20Maidenhair.mp3",
    description:
      "Atmosfera calma e meditativa ideal para leitura de diários de bordo e relatórios.",
  },
  {
    id: 10,
    title: "10. Music to Soothe the Savage Snake Plant",
    duration: "3:23",
    startSeconds: 1649,
    audioUrl: "/sons/plantasia/10%20Music%20to%20Soothe%20the%20Savage%20Snake%20Plant.mp3",
    description: "Clímax analógico envolvente com os timbres lendários do sintetizador Moog.",
  },
];

export const PLAYLISTS_CATALOG: PlaylistInfo[] = [
  {
    id: "plantasia",
    title: "Mother Earth's Plantasia",
    artist: "Mort Garson (1976)",
    year: "1976",
    category: "Moog Modular & Plant Music",
    description:
      "O lendário álbum de 1976 composto por Mort Garson em sintetizadores Moog — música quente e orgânica para plantas e para quem as ama. Trilha sonora oficial do Clube de Ciências CECLOS.",
    youtubeId: PLANTASIA_YOUTUBE_ID,
    coverImage: "/sons/plantasia/capa.jpg",
    accentColor: "emerald",
    tracks: PLANTASIA_TRACKS,
  },
];
