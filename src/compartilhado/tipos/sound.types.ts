export type SoundPreset =
  | "click-modern"
  | "bubble-pop"
  | "switch-tactile"
  | "crystal-tap"
  | "snap-crisp"
  | "soft-pillow"
  | "studio-confirm"
  | "zen-bell"
  | "pop-bubble"
  | "mechanical"
  | "subtle-click"
  | "cyber-chirp"
  | "glass-chime"
  | "retro-8bit"
  | "soft-wave"
  | "custom";

export type BgMusicPreset = "playlist" | "custom";

export type EfeitoSonoro =
  "entrada" | "mira" | "liga" | "desliga" | "confirmar" | "etapa" | "salto";

export interface OpcoesDoEfeito {
  lado?: number;
  tom?: number;
  mesmoMudo?: boolean;
}

export interface SoundPresetInfo {
  id: SoundPreset;
  name: string;
  description: string;
  audioUrl?: string;
}

export interface MusicTrack {
  id: number;
  title: string;
  duration: string;
  startSeconds: number;
  description?: string;
  audioUrl?: string;
}

export type PlantasiaTrack = MusicTrack;

export interface PlaylistInfo {
  id: string;
  title: string;
  artist: string;
  year?: string;
  category: string;
  description: string;
  youtubeId: string;
  coverImage?: string;
  accentColor: "emerald" | "amber" | "cyan" | "purple" | "blue";
  tracks: MusicTrack[];
}

export interface SoundContextType {
  currentSound: SoundPreset;
  setSoundPreset: (preset: SoundPreset) => void;
  volume: number;
  setVolume: (vol: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  customSoundUrl: string | null;
  customSoundName: string | null;
  handleCustomFileUpload: (file: File) => void;
  clearCustomSound: () => void;
  playSound: (overridePreset?: SoundPreset) => void;
  tocarEfeito: (efeito: EfeitoSonoro, opcoes?: OpcoesDoEfeito) => void;

  bgMusicEnabled: boolean;
  setBgMusicEnabled: (enabled: boolean) => void;
  bgMusicPreset: BgMusicPreset;
  setBgMusicPreset: (preset: BgMusicPreset) => void;
  bgMusicVolume: number;
  setBgMusicVolume: (vol: number) => void;
  customBgMusicUrl: string | null;
  customBgMusicName: string | null;
  handleCustomBgMusicUpload: (file: File) => void;
  clearCustomBgMusic: () => void;
  isBgMusicPlaying: boolean;
  toggleBgMusicPlay: () => void;

  playerVisivel: boolean;
  desligarMusica: () => void;
  ligarMusica: () => void;
  obterAudioDeFundo: () => HTMLAudioElement | null;

  activePlaylist: PlaylistInfo;
  selectedTrack: MusicTrack;
  selectPlaylist: (playlistId: string) => void;
  selectTrack: (track: MusicTrack, playlistId?: string, shouldPlay?: boolean) => void;

  selectedPlantasiaTrack: PlantasiaTrack;
  selectPlantasiaTrack: (track: PlantasiaTrack) => void;
}
