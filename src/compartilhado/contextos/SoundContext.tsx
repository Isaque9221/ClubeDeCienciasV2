import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type {
  SoundPreset,
  BgMusicPreset,
  MusicTrack,
  PlaylistInfo,
  EfeitoSonoro,
  OpcoesDoEfeito,
} from "@/compartilhado/tipos/sound.types";
import { SoundContext } from "@/compartilhado/contextos/sound-context";
import {
  playSynthesizerSound,
  ensureAudioContext,
  AmbientSynthesizerEngine,
  clickSoundEngine,
} from "@/recursos/audio/motor/sound-engine";
import { tocarEfeitoSintetizado } from "@/recursos/audio/motor/efeitos-sintetizados";
import { PLAYLISTS_CATALOG } from "@/compartilhado/dados/sound.data";
import { validateUpload, UPLOAD_RULES } from "@/seguranca";

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSound, setCurrentSoundState] = useState<SoundPreset>(() => {
    return (localStorage.getItem("app_sound_preset") as SoundPreset) || "click-modern";
  });

  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem("app_sound_volume");
    return saved !== null ? parseFloat(saved) : 0.7;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem("app_sound_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [customSoundUrl, setCustomSoundUrl] = useState<string | null>(() => {
    return localStorage.getItem("app_custom_sound_url") || null;
  });

  const [customSoundName, setCustomSoundName] = useState<string | null>(() => {
    return localStorage.getItem("app_custom_sound_name") || null;
  });

  const [activePlaylist, setActivePlaylist] = useState<PlaylistInfo>(() => {
    const savedId = localStorage.getItem("app_bg_playlist_id");
    const found = PLAYLISTS_CATALOG.find((p) => p.id === savedId);
    return found || PLAYLISTS_CATALOG[0];
  });

  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(() => {
    return activePlaylist.tracks[0];
  });

  const [bgMusicEnabled, setBgMusicEnabledState] = useState<boolean>(false);

  const [bgMusicPreset, setBgMusicPresetState] = useState<BgMusicPreset>(() => {
    return (localStorage.getItem("app_bg_music_preset") as BgMusicPreset) || "playlist";
  });

  const [bgMusicVolume, setBgMusicVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem("app_bg_music_volume");
    return saved !== null ? parseFloat(saved) : 0.75;
  });

  const [customBgMusicUrl, setCustomBgMusicUrl] = useState<string | null>(() => {
    return localStorage.getItem("app_custom_bg_music_url") || null;
  });

  const [customBgMusicName, setCustomBgMusicName] = useState<string | null>(() => {
    return localStorage.getItem("app_custom_bg_music_name") || null;
  });

  const [playerVisivel, setPlayerVisivel] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("app_player_oculto") !== "true";
  });

  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState<boolean>(false);
  const isBgMusicPlayingRef = useRef<boolean>(false);
  isBgMusicPlayingRef.current = isBgMusicPlaying;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const customAudioBufferRef = useRef<AudioBuffer | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientSynthRef = useRef<AmbientSynthesizerEngine>(new AmbientSynthesizerEngine());
  const lastPlayTimeRef = useRef<number>(0);

  const activePlaylistRef = useRef(activePlaylist);
  activePlaylistRef.current = activePlaylist;
  const selectedTrackRef = useRef(selectedTrack);
  selectedTrackRef.current = selectedTrack;
  const bgMusicVolumeRef = useRef(bgMusicVolume);
  bgMusicVolumeRef.current = bgMusicVolume;

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      clickSoundEngine.preload(audioCtxRef.current);
    }
    ensureAudioContext(audioCtxRef.current);
    return audioCtxRef.current;
  }, []);

  const decodeCustomAudio = useCallback(
    async (dataUrl: string) => {
      try {
        const ctx = getAudioContext();
        const response = await fetch(dataUrl);
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > UPLOAD_RULES.audio.maxBytes) {
          customAudioBufferRef.current = null;
          return;
        }
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        customAudioBufferRef.current = decoded;
      } catch (err) {
        console.error("Erro ao decodificar áudio customizado:", err);
        customAudioBufferRef.current = null;
      }
    },
    [getAudioContext]
  );

  useEffect(() => {
    if (customSoundUrl) {
      decodeCustomAudio(customSoundUrl);
    }
  }, [customSoundUrl, decodeCustomAudio]);

  const setSoundPreset = useCallback((preset: SoundPreset) => {
    setCurrentSoundState(preset);
    localStorage.setItem("app_sound_preset", preset);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    localStorage.setItem("app_sound_volume", clamped.toString());
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem("app_sound_enabled", enabled.toString());
  }, []);

  const handleCustomFileUpload = useCallback(
    (file: File) => {
      if (!validateUpload(file, "audio").ok) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setCustomSoundUrl(result);
          setCustomSoundName(file.name);
          setSoundPreset("custom");
          try {
            localStorage.setItem("app_custom_sound_url", result);
            localStorage.setItem("app_custom_sound_name", file.name);
          } catch {
            console.warn("Storage quota exceeded");
          }
          decodeCustomAudio(result);
        }
      };
      reader.readAsDataURL(file);
    },
    [setSoundPreset, decodeCustomAudio]
  );

  const clearCustomSound = useCallback(() => {
    setCustomSoundUrl(null);
    setCustomSoundName(null);
    customAudioBufferRef.current = null;
    localStorage.removeItem("app_custom_sound_url");
    localStorage.removeItem("app_custom_sound_name");
    if (currentSound === "custom") {
      setSoundPreset("click-modern");
    }
  }, [currentSound, setSoundPreset]);
  const playNativeAudio = useCallback((audioUrl: string, vol: number) => {
    if (!bgAudioRef.current) {
      bgAudioRef.current = new Audio();
      bgAudioRef.current.preload = "auto";
    }

    const audio = bgAudioRef.current;
    audio.volume = Math.max(0, Math.min(1, vol));

    const isSameSrc =
      audio.src === audioUrl ||
      audio.src.endsWith(audioUrl) ||
      audio.src.endsWith(encodeURI(audioUrl)) ||
      decodeURIComponent(audio.src).endsWith(decodeURIComponent(audioUrl));

    if (!isSameSrc) {
      audio.src = audioUrl;
      audio.currentTime = 0;
    }

    setIsBgMusicPlaying(true);
    isBgMusicPlayingRef.current = true;
    setBgMusicEnabledState(true);
    try {
      localStorage.setItem("app_bg_music_enabled", "true");
    } catch {}

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsBgMusicPlaying(true);
          isBgMusicPlayingRef.current = true;
          ambientSynthRef.current.stop();
        })
        .catch((err) => {
          console.warn("Reprodução de música cancelada ou não permitida:", err);
          ambientSynthRef.current.stop();
          setIsBgMusicPlaying(false);
          isBgMusicPlayingRef.current = false;
        });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("app_bg_music_enabled", "false");
    } catch {}

    if (!bgAudioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = bgMusicVolumeRef.current;
      bgAudioRef.current = audio;

      audio.onended = () => {
        if (!isBgMusicPlayingRef.current) return;
        const currentPlaylist = activePlaylistRef.current;
        const currentTrack = selectedTrackRef.current;
        const currentIndex = currentPlaylist.tracks.findIndex((t) => t.id === currentTrack.id);
        const nextTrack =
          currentPlaylist.tracks[(currentIndex + 1) % currentPlaylist.tracks.length];
        if (nextTrack && nextTrack.audioUrl) {
          audio.src = nextTrack.audioUrl;
          audio.volume = bgMusicVolumeRef.current;
          audio.currentTime = 0;
          if (isBgMusicPlayingRef.current) {
            audio
              .play()
              .then(() => {
                setSelectedTrack(nextTrack);
                setIsBgMusicPlaying(true);
                isBgMusicPlayingRef.current = true;
              })
              .catch(() => {
                setIsBgMusicPlaying(false);
                isBgMusicPlayingRef.current = false;
              });
          }
        }
      };

      audio.onplay = () => {
        setIsBgMusicPlaying(true);
        isBgMusicPlayingRef.current = true;
        setBgMusicEnabledState(true);
      };

      audio.onpause = () => {
        ambientSynthRef.current.stop();
        setIsBgMusicPlaying(false);
        isBgMusicPlayingRef.current = false;
      };
    }
  }, []);

  const selectPlaylist = useCallback(
    (playlistId: string) => {
      const found = PLAYLISTS_CATALOG.find((p) => p.id === playlistId);
      if (found) {
        setActivePlaylist(found);
        const firstTrack = found.tracks[0];
        setSelectedTrack(firstTrack);
        setBgMusicPresetState("playlist");
        try {
          localStorage.setItem("app_bg_playlist_id", found.id);
        } catch {}

        if (isBgMusicPlayingRef.current && firstTrack && firstTrack.audioUrl) {
          setBgMusicEnabledState(true);
          try {
            localStorage.setItem("app_bg_music_enabled", "true");
          } catch {}
          playNativeAudio(firstTrack.audioUrl, bgMusicVolumeRef.current);
        } else if (bgAudioRef.current && firstTrack?.audioUrl) {
          bgAudioRef.current.src = firstTrack.audioUrl;
          bgAudioRef.current.currentTime = 0;
        }
      }
    },
    [playNativeAudio]
  );

  const selectTrack = useCallback(
    (track: MusicTrack, playlistId?: string, shouldPlay?: boolean) => {
      let targetPlaylist = activePlaylist;
      if (playlistId && playlistId !== activePlaylist.id) {
        const found = PLAYLISTS_CATALOG.find((p) => p.id === playlistId);
        if (found) {
          targetPlaylist = found;
          setActivePlaylist(found);
          try {
            localStorage.setItem("app_bg_playlist_id", found.id);
          } catch {}
        }
      }

      setSelectedTrack(track);

      const trackUrl =
        track.audioUrl || targetPlaylist.tracks.find((t) => t.id === track.id)?.audioUrl;

      const mustPlay = shouldPlay !== undefined ? shouldPlay : isBgMusicPlayingRef.current;

      if (mustPlay && trackUrl) {
        setBgMusicPresetState("playlist");
        setBgMusicEnabledState(true);
        try {
          localStorage.setItem("app_bg_music_enabled", "true");
        } catch {}
        playNativeAudio(trackUrl, bgMusicVolumeRef.current);
      } else if (bgAudioRef.current && trackUrl) {
        bgAudioRef.current.src = trackUrl;
        bgAudioRef.current.currentTime = 0;
      }
    },
    [activePlaylist, playNativeAudio]
  );

  const stopBgMusic = useCallback(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    ambientSynthRef.current.stop();
    setIsBgMusicPlaying(false);
    isBgMusicPlayingRef.current = false;
    setBgMusicEnabledState(false);
    try {
      localStorage.setItem("app_bg_music_enabled", "false");
    } catch {}
  }, []);

  const startBgMusic = useCallback(() => {
    setBgMusicEnabledState(true);
    try {
      localStorage.setItem("app_bg_music_enabled", "true");
    } catch {}

    if (bgMusicPreset === "custom" && customBgMusicUrl) {
      playNativeAudio(customBgMusicUrl, bgMusicVolumeRef.current);
    } else {
      const trackUrl = selectedTrack.audioUrl || activePlaylist.tracks[0]?.audioUrl;
      if (trackUrl) {
        playNativeAudio(trackUrl, bgMusicVolumeRef.current);
      }
    }
  }, [
    bgMusicPreset,
    customBgMusicUrl,
    selectedTrack.audioUrl,
    activePlaylist.tracks,
    playNativeAudio,
  ]);

  const setBgMusicEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        startBgMusic();
      } else {
        stopBgMusic();
      }
    },
    [startBgMusic, stopBgMusic]
  );

  const setBgMusicPreset = useCallback((preset: BgMusicPreset) => {
    setBgMusicPresetState(preset);
    localStorage.setItem("app_bg_music_preset", preset);
  }, []);

  const setBgMusicVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setBgMusicVolumeState(clamped);
    localStorage.setItem("app_bg_music_volume", clamped.toString());
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = clamped;
    }
    ambientSynthRef.current.setVolume(clamped);
  }, []);

  const handleCustomBgMusicUpload = useCallback(
    (file: File) => {
      if (!validateUpload(file, "audio").ok) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setCustomBgMusicUrl(result);
          setCustomBgMusicName(file.name);
          setBgMusicPreset("custom");
          setBgMusicEnabled(true);

          try {
            localStorage.setItem("app_custom_bg_music_url", result);
            localStorage.setItem("app_custom_bg_music_name", file.name);
          } catch {
            console.warn("Storage quota exceeded for custom music file");
          }
        }
      };
      reader.readAsDataURL(file);
    },
    [setBgMusicPreset, setBgMusicEnabled]
  );

  const clearCustomBgMusic = useCallback(() => {
    setCustomBgMusicUrl(null);
    setCustomBgMusicName(null);
    localStorage.removeItem("app_custom_bg_music_url");
    localStorage.removeItem("app_custom_bg_music_name");
    setBgMusicPreset("playlist");
    selectPlaylist(PLAYLISTS_CATALOG[0].id);
  }, [setBgMusicPreset, selectPlaylist]);

  const toggleBgMusicPlay = useCallback(() => {
    if (isBgMusicPlaying) {
      stopBgMusic();
    } else {
      startBgMusic();
    }
  }, [isBgMusicPlaying, startBgMusic, stopBgMusic]);

  const obterAudioDeFundo = useCallback(() => bgAudioRef.current, []);

  const desligarMusica = useCallback(() => {
    stopBgMusic();
    setPlayerVisivel(false);
    try {
      localStorage.setItem("app_player_oculto", "true");
    } catch {}
  }, [stopBgMusic]);

  const ligarMusica = useCallback(() => {
    setPlayerVisivel(true);
    try {
      localStorage.setItem("app_player_oculto", "false");
    } catch {}
  }, []);

  const playSound = useCallback(
    (overridePreset?: SoundPreset) => {
      if (!soundEnabled && !overridePreset) return;

      const nowMs = performance.now();
      if (nowMs - lastPlayTimeRef.current < 25) return;
      lastPlayTimeRef.current = nowMs;

      const presetToPlay = overridePreset || currentSound;
      const vol = volume;

      const ctx = getAudioContext();
      ensureAudioContext(ctx);

      if (presetToPlay === "custom") {
        if (customAudioBufferRef.current) {
          try {
            const source = ctx.createBufferSource();
            source.buffer = customAudioBufferRef.current;

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(vol, ctx.currentTime);

            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(0);
          } catch (err) {
            console.error("Erro ao reproduzir áudio via BufferSource:", err);
          }
        } else if (customSoundUrl) {
          const audio = new Audio(customSoundUrl);
          audio.volume = vol;
          audio.play().catch(() => {});
        } else {
          playSynthesizerSound(ctx, "click-modern", vol);
        }
      } else {
        playSynthesizerSound(ctx, presetToPlay, vol);
      }
    },
    [soundEnabled, currentSound, volume, customSoundUrl, getAudioContext]
  );

  const tocarEfeito = useCallback(
    (efeito: EfeitoSonoro, opcoes: OpcoesDoEfeito = {}) => {
      if (!soundEnabled && !opcoes.mesmoMudo) return;

      const ativacao = navigator.userActivation;
      if (ativacao && !ativacao.hasBeenActive) return;

      const ctx = getAudioContext();
      if (ctx.state === "running" || ativacao?.isActive) {
        tocarEfeitoSintetizado(ctx, efeito, volume, opcoes);
        return;
      }

      const pedido = performance.now();
      ctx
        .resume()
        .then(() => {
          if (performance.now() - pedido < 200) {
            tocarEfeitoSintetizado(ctx, efeito, volume, opcoes);
          }
        })
        .catch(() => {});
    },
    [soundEnabled, volume, getAudioContext]
  );

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const sessao = navigator.mediaSession;
    const titulo = selectedTrack.title.replace(/^\s*\d{1,3}\s*[.)\-–]\s*/, "");
    try {
      sessao.metadata = new MediaMetadata({
        title: titulo,
        artist: activePlaylist.artist,
        album: activePlaylist.title,
        artwork: activePlaylist.coverImage
          ? [{ src: activePlaylist.coverImage, sizes: "512x512", type: "image/jpeg" }]
          : [],
      });
      sessao.playbackState = isBgMusicPlaying ? "playing" : "paused";
    } catch {}

    const pularPara = (passo: number) => {
      const faixas = activePlaylist.tracks;
      const atual = faixas.findIndex((t) => t.id === selectedTrack.id);
      const proxima = faixas[(atual + passo + faixas.length) % faixas.length];
      if (proxima) selectTrack(proxima, activePlaylist.id, true);
    };
    const acoes: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => !isBgMusicPlaying && toggleBgMusicPlay()],
      ["pause", () => isBgMusicPlaying && toggleBgMusicPlay()],
      ["nexttrack", () => pularPara(1)],
      ["previoustrack", () => pularPara(-1)],
    ];
    for (const [acao, fazer] of acoes) {
      try {
        sessao.setActionHandler(acao, fazer);
      } catch {}
    }
    return () => {
      for (const [acao] of acoes) {
        try {
          sessao.setActionHandler(acao, null);
        } catch {}
      }
    };
  }, [activePlaylist, selectedTrack, isBgMusicPlaying, toggleBgMusicPlay, selectTrack]);

  const value = useMemo(
    () => ({
      currentSound,
      setSoundPreset,
      volume,
      setVolume,
      soundEnabled,
      setSoundEnabled,
      customSoundUrl,
      customSoundName,
      handleCustomFileUpload,
      clearCustomSound,
      playSound,
      tocarEfeito,
      bgMusicEnabled,
      setBgMusicEnabled,
      bgMusicPreset,
      setBgMusicPreset,
      bgMusicVolume,
      setBgMusicVolume,
      customBgMusicUrl,
      customBgMusicName,
      handleCustomBgMusicUpload,
      clearCustomBgMusic,
      isBgMusicPlaying,
      toggleBgMusicPlay,
      playerVisivel,
      desligarMusica,
      ligarMusica,
      obterAudioDeFundo,
      activePlaylist,
      selectedTrack,
      selectPlaylist,
      selectTrack,
      selectedPlantasiaTrack: selectedTrack,
      selectPlantasiaTrack: selectTrack,
    }),
    [
      currentSound,
      setSoundPreset,
      volume,
      setVolume,
      soundEnabled,
      setSoundEnabled,
      customSoundUrl,
      customSoundName,
      handleCustomFileUpload,
      clearCustomSound,
      playSound,
      tocarEfeito,
      bgMusicEnabled,
      setBgMusicEnabled,
      bgMusicPreset,
      setBgMusicPreset,
      bgMusicVolume,
      setBgMusicVolume,
      customBgMusicUrl,
      customBgMusicName,
      handleCustomBgMusicUpload,
      clearCustomBgMusic,
      isBgMusicPlaying,
      toggleBgMusicPlay,
      playerVisivel,
      desligarMusica,
      ligarMusica,
      obterAudioDeFundo,
      activePlaylist,
      selectedTrack,
      selectPlaylist,
      selectTrack,
    ]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};
