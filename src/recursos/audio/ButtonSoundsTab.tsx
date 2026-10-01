import React, { useRef, useState } from "react";
import { Volume2, VolumeX, Volume1, Upload, Trash2, Play, Check } from "lucide-react";
import { SOUND_PRESETS } from "@/compartilhado/dados/sound.data";
import { useSound } from "@/compartilhado/hooks/useSound";
import type { SoundPreset } from "@/compartilhado/tipos/sound.types";
import { AUDIO } from "./conteudo";

export function ButtonSoundsTab() {
  const {
    currentSound,
    setSoundPreset,
    volume,
    setVolume,
    soundEnabled,
    setSoundEnabled,
    customSoundName,
    handleCustomFileUpload,
    clearCustomSound,
    playSound,
  } = useSound();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handlePreview = (presetId: SoundPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingPreview(presetId);
    playSound(presetId);
    setTimeout(() => setPlayingPreview(null), 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCustomFileUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-sm font-bold leading-tight text-white">Som ao clicar</h4>
            <p className="mt-0.5 text-[11px] text-stone-400">Resposta sonora nos botões do site</p>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("subtle-click");
              setSoundEnabled(!soundEnabled);
            }}
            role="switch"
            aria-checked={soundEnabled}
            aria-label="Ligar ou desligar o som dos cliques"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
              soundEnabled ? "bg-yellow-400" : "bg-white/10"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-stone-950 transition-transform duration-200 ${
                soundEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {soundEnabled && (
          <div className="mt-3 flex items-center gap-2.5 border-t border-white/[0.06] pt-3">
            <span className="shrink-0 text-stone-400">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </span>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-yellow-400"
              aria-label="Volume dos cliques"
            />

            <span className="w-9 shrink-0 text-right font-mono text-[10px] text-stone-500">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            {SOUND_PRESETS.length} timbres
          </span>
          <span className="text-[10px] text-stone-600">Toque para escolher</span>
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {SOUND_PRESETS.map((preset) => {
            const isSelected = currentSound === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  if (!soundEnabled) setSoundEnabled(true);
                  setSoundPreset(preset.id);
                  playSound(preset.id);
                }}
                className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                  isSelected ? "bg-yellow-400/[0.1]" : "hover:bg-white/[0.04]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isSelected
                      ? "border-yellow-400 bg-yellow-400 text-stone-950"
                      : "border-white/15 text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-xs font-semibold leading-tight transition-colors ${
                      isSelected ? "text-yellow-100" : "text-stone-200 group-hover:text-white"
                    }`}
                  >
                    {preset.name}
                  </span>
                  <span className="block truncate text-[10px] leading-tight text-stone-500">
                    {preset.description}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={(e) => handlePreview(preset.id, e)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
                    playingPreview === preset.id
                      ? "bg-yellow-400 text-stone-950"
                      : "text-stone-500 hover:bg-white/[0.08] hover:text-white"
                  }`}
                  title={AUDIO.cliques.dicaTestar}
                  aria-label={`${AUDIO.cliques.dicaTestar}: ${preset.name}`}
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
          onChange={handleFileChange}
          className="hidden"
        />

        {customSoundName ? (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/[0.07] p-2.5">
            <div className="min-w-0 flex-1">
              <span className="block font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-yellow-400/80">
                Som próprio
              </span>
              <p className="truncate text-xs font-medium text-white">{customSoundName}</p>
            </div>

            <button
              type="button"
              onClick={() => playSound("custom")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-yellow-300 transition-colors hover:bg-yellow-400/20 cursor-pointer"
              title={AUDIO.cliques.dicaTestarCurta}
              aria-label={AUDIO.cliques.dicaTestarCurta}
            >
              <Play className="h-3 w-3 fill-current" />
            </button>

            <button
              type="button"
              onClick={clearCustomSound}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-red-500/15 hover:text-red-400 cursor-pointer"
              title={AUDIO.cliques.dicaRemover}
              aria-label={AUDIO.cliques.dicaRemover}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] py-2.5 text-[11px] font-medium text-stone-400 transition-colors hover:border-yellow-400/40 hover:text-yellow-200 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Usar um som meu (MP3, WAV, OGG)</span>
          </button>
        )}
      </div>
    </div>
  );
}
