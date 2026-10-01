import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  X,
  Leaf,
} from "lucide-react";
import { useSound } from "@/compartilhado/hooks/useSound";
import { AUDIO } from "./conteudo";

const CAPA_PADRAO = "/sons/plantasia/capa.jpg";

function Equalizador() {
  return (
    <span className="equalizador" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function tituloLimpo(titulo: string) {
  return titulo.replace(/^\s*\d{1,3}\s*[.)\-–]\s*/, "");
}

function segundosDe(duracao: string | undefined): number {
  if (!duracao) return 0;
  const [min, seg] = duracao.split(":").map((n) => parseInt(n, 10));
  if (!Number.isFinite(min) || !Number.isFinite(seg)) return 0;
  return min * 60 + seg;
}

function formatarTempo(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const total = Math.floor(segundos);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function BarraDeProgresso() {
  const { obterAudioDeFundo, selectedTrack, isBgMusicPlaying } = useSound();
  const [tempo, setTempo] = useState(0);
  const [duracaoReal, setDuracaoReal] = useState(0);

  useEffect(() => {
    const audio = obterAudioDeFundo();
    if (!audio) return;

    const atualizar = () => {
      setTempo(audio.currentTime || 0);
      setDuracaoReal(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    atualizar();
    const eventos = ["timeupdate", "loadedmetadata", "durationchange", "emptied", "seeked"];
    eventos.forEach((evento) => audio.addEventListener(evento, atualizar));
    return () => {
      eventos.forEach((evento) => audio.removeEventListener(evento, atualizar));
    };
  }, [obterAudioDeFundo, selectedTrack.id, isBgMusicPlaying]);

  const duracao = duracaoReal || segundosDe(selectedTrack.duration);
  const podeBuscar = duracaoReal > 0;
  const porcentagem = duracao > 0 ? Math.min(100, (tempo / duracao) * 100) : 0;

  return (
    <div className="mt-4">
      <input
        type="range"
        min={0}
        max={duracao || 1}
        step={0.1}
        value={Math.min(tempo, duracao || 1)}
        disabled={!podeBuscar}
        onChange={(e) => {
          const audio = obterAudioDeFundo();
          const valor = parseFloat(e.target.value);
          if (audio && podeBuscar) {
            audio.currentTime = valor;
            setTempo(valor);
          }
        }}
        className="controle-de-audio w-full"
        style={{ "--preenchido": `${porcentagem}%` } as CSSProperties}
        aria-label="Posição da faixa"
        aria-valuetext={`${formatarTempo(tempo)} de ${formatarTempo(duracao)}`}
      />
      <div className="mt-1 flex justify-between font-mono text-[10.5px] tabular-nums text-stone-500">
        <span>{formatarTempo(tempo)}</span>
        <span>{formatarTempo(duracao)}</span>
      </div>
    </div>
  );
}

export function BgMusicTab() {
  const {
    bgMusicVolume,
    setBgMusicVolume,
    isBgMusicPlaying,
    toggleBgMusicPlay,
    activePlaylist,
    selectedTrack,
    selectTrack,
    playSound,
  } = useSound();

  const [search, setSearch] = useState("");

  const tracks = useMemo(() => activePlaylist?.tracks || [], [activePlaylist]);
  const currentIndex = tracks.findIndex((t) => t.id === selectedTrack?.id);

  const trocarFaixa = (passo: 1 | -1) => {
    playSound("subtle-click");
    if (tracks.length === 0) return;
    const indice = (currentIndex + passo + tracks.length) % tracks.length;
    selectTrack(tracks[indice], activePlaylist.id, isBgMusicPlaying);
  };

  const faixasFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return tracks
      .map((track, indice) => ({ track, numero: indice + 1 }))
      .filter(
        ({ track }) =>
          !termo ||
          track.title.toLowerCase().includes(termo) ||
          (track.description || "").toLowerCase().includes(termo)
      );
  }, [tracks, search]);

  const capa = activePlaylist?.coverImage || CAPA_PADRAO;
  const IconeDoVolume = bgMusicVolume === 0 ? VolumeX : bgMusicVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="space-y-4">
      <section
        aria-label="Tocando agora"
        className="relative isolate overflow-hidden rounded-2xl border border-white/[0.09] p-4 sm:p-5"
      >
        <img
          src={capa}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full scale-125 object-cover opacity-40 blur-2xl saturate-150"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-superficie/80 via-superficie/85 to-superficie/95" />

        <div className="flex items-center gap-4">
          <div
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.6)] ring-1 transition-[box-shadow] duration-500 sm:h-24 sm:w-24 ${
              isBgMusicPlaying ? "ring-yellow-400/70" : "ring-white/10"
            }`}
          >
            <img
              src={capa}
              alt={activePlaylist.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = CAPA_PADRAO;
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {isBgMusicPlaying ? (
                <span className="text-yellow-400">
                  <Equalizador />
                </span>
              ) : (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-500" />
              )}
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-yellow-200/80">
                {isBgMusicPlaying ? "Tocando agora" : "Em espera"}
                {currentIndex >= 0 && (
                  <span className="text-stone-500">
                    {" "}
                    · {String(currentIndex + 1).padStart(2, "0")}/
                    {String(tracks.length).padStart(2, "0")}
                  </span>
                )}
              </span>
            </div>

            <h4 className="mt-1 line-clamp-2 text-base font-black leading-tight tracking-tight text-white sm:text-lg">
              {tituloLimpo(selectedTrack?.title || "Plantasia")}
            </h4>
            <p className="mt-0.5 truncate text-xs text-stone-300">
              {activePlaylist.title}
              <span className="mx-1.5 text-stone-600">·</span>
              <span className="text-stone-400">{activePlaylist.artist}</span>
            </p>
          </div>
        </div>

        {selectedTrack?.description && (
          <p className="mt-3 line-clamp-2 text-[11.5px] leading-relaxed text-stone-400">
            {selectedTrack.description}
          </p>
        )}

        <BarraDeProgresso />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => trocarFaixa(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
              title={AUDIO.trilha.dicaAnterior}
              aria-label={AUDIO.trilha.dicaAnterior}
            >
              <SkipBack className="h-4 w-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSound("subtle-click");
                toggleBgMusicPlay();
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 text-stone-950 shadow-[0_6px_22px_rgba(250,204,21,0.35)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title={isBgMusicPlaying ? AUDIO.trilha.botaoPausar : AUDIO.trilha.botaoTocar}
              aria-label={isBgMusicPlaying ? AUDIO.trilha.botaoPausar : AUDIO.trilha.botaoTocar}
            >
              {isBgMusicPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px] fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => trocarFaixa(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
              title={AUDIO.trilha.dicaProxima}
              aria-label={AUDIO.trilha.dicaProxima}
            >
              <SkipForward className="h-4 w-4 fill-current" />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:max-w-[190px]">
            <button
              type="button"
              onClick={() => setBgMusicVolume(bgMusicVolume === 0 ? 0.75 : 0)}
              className="shrink-0 text-stone-400 transition-colors hover:text-white cursor-pointer"
              title={AUDIO.trilha.rotuloDoVolume}
              aria-label={bgMusicVolume === 0 ? "Ativar som" : "Silenciar"}
            >
              <IconeDoVolume className="h-4 w-4" />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(bgMusicVolume * 100)}
              onChange={(e) => setBgMusicVolume(parseInt(e.target.value, 10) / 100)}
              className="controle-de-audio controle-de-audio--volume w-full min-w-[70px]"
              style={
                {
                  "--preenchido": `${Math.round(bgMusicVolume * 100)}%`,
                } as CSSProperties
              }
              aria-label={AUDIO.trilha.rotuloDoVolume}
            />
          </div>
        </div>
      </section>

      <section aria-label="Faixas do álbum" className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
            <span className="truncate font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              {tracks.length} faixas · {activePlaylist.year || activePlaylist.category}
            </span>
          </div>

          <div className="relative w-36 shrink-0 sm:w-48">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
            <input
              type="search"
              placeholder={AUDIO.trilha.campoDeBusca}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/[0.1] bg-black/40 py-1.5 pl-8 pr-7 text-xs text-white placeholder-stone-500 transition-colors focus:border-yellow-400/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              aria-label={AUDIO.trilha.campoDeBusca}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white cursor-pointer"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <ul className="lista-de-faixas max-h-[15.5rem] space-y-1 overflow-y-auto pr-1">
          {faixasFiltradas.map(({ track, numero }) => {
            const selecionada = selectedTrack?.id === track.id;
            const tocandoEsta = selecionada && isBgMusicPlaying;

            return (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => {
                    playSound("subtle-click");
                    if (selecionada) {
                      toggleBgMusicPlay();
                    } else {
                      selectTrack(track, activePlaylist.id, true);
                    }
                  }}
                  aria-current={selecionada ? "true" : undefined}
                  aria-label={`${tocandoEsta ? "Pausar" : "Tocar"} ${tituloLimpo(track.title)}`}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all duration-300 cursor-pointer ${
                    selecionada
                      ? "border-yellow-400/35 bg-gradient-to-r from-yellow-400/[0.14] via-yellow-400/[0.06] to-transparent"
                      : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]"
                  }`}
                >
                  {selecionada && (
                    <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
                  )}

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold transition-colors ${
                      selecionada
                        ? "bg-yellow-400 text-stone-950"
                        : "bg-white/[0.05] text-stone-400 group-hover:bg-white/[0.1] group-hover:text-white"
                    }`}
                  >
                    {tocandoEsta ? (
                      <>
                        <span className="group-hover:hidden">
                          <Equalizador />
                        </span>
                        <Pause className="hidden h-3.5 w-3.5 fill-current group-hover:block" />
                      </>
                    ) : (
                      <>
                        <span className="group-hover:hidden">
                          {String(numero).padStart(2, "0")}
                        </span>
                        <Play className="hidden h-3.5 w-3.5 translate-x-[1px] fill-current group-hover:block" />
                      </>
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] font-semibold leading-tight transition-colors ${
                        selecionada ? "text-yellow-100" : "text-stone-200 group-hover:text-white"
                      }`}
                    >
                      {tituloLimpo(track.title)}
                    </span>
                    {track.description && (
                      <span className="mt-0.5 block truncate text-[11px] leading-tight text-stone-500">
                        {track.description}
                      </span>
                    )}
                  </span>

                  <span
                    className={`shrink-0 font-mono text-[11px] tabular-nums ${
                      selecionada ? "text-yellow-300/90" : "text-stone-500"
                    }`}
                  >
                    {track.duration}
                  </span>
                </button>
              </li>
            );
          })}

          {faixasFiltradas.length === 0 && (
            <li className="py-8 text-center font-mono text-[11px] text-stone-500">
              Nenhuma faixa encontrada.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
