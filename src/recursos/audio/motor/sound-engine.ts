import type { SoundPreset } from "@/compartilhado/tipos/sound.types";

export function ensureAudioContext(ctx: AudioContext): void {
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

export const SOUND_AUDIO_URLS: Record<string, string> = {
  "click-modern": "/sons/cliques/click-modern.mp3",
  "bubble-pop": "/sons/cliques/bubble-pop.mp3",
  "switch-tactile": "/sons/cliques/switch-tactile.mp3",
  "crystal-tap": "/sons/cliques/crystal-tap.mp3",
  "snap-crisp": "/sons/cliques/snap-crisp.mp3",
  "soft-pillow": "/sons/cliques/soft-pillow.mp3",
  "studio-confirm": "/sons/cliques/studio-confirm.mp3",
  "zen-bell": "/sons/cliques/zen-bell.mp3",

  "subtle-click": "/sons/cliques/click-modern.mp3",
  "pop-bubble": "/sons/cliques/bubble-pop.mp3",
  mechanical: "/sons/cliques/switch-tactile.mp3",
  "glass-chime": "/sons/cliques/crystal-tap.mp3",
  "cyber-chirp": "/sons/cliques/snap-crisp.mp3",
  "soft-wave": "/sons/cliques/soft-pillow.mp3",
  "retro-8bit": "/sons/cliques/studio-confirm.mp3",
};

export class ClickSoundEngine {
  private static instance: ClickSoundEngine | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();

  public static getInstance(): ClickSoundEngine {
    if (!ClickSoundEngine.instance) {
      ClickSoundEngine.instance = new ClickSoundEngine();
    }
    return ClickSoundEngine.instance;
  }

  public preload(ctx: AudioContext): void {
    ensureAudioContext(ctx);
    Object.entries(SOUND_AUDIO_URLS).forEach(([key, url]) => {
      this.loadBuffer(ctx, key, url);
    });
  }

  public async loadBuffer(
    ctx: AudioContext,
    key: string,
    url: string
  ): Promise<AudioBuffer | null> {
    if (this.buffers.has(key)) return this.buffers.get(key)!;
    if (this.loadingPromises.has(key)) return this.loadingPromises.get(key)!;

    const promise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        this.buffers.set(key, audioBuf);
        return audioBuf;
      } catch (err) {
        console.warn(`[ClickSoundEngine] Could not load sound ${key} from ${url}:`, err);
        return null;
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  public play(ctx: AudioContext, preset: SoundPreset, vol: number): void {
    try {
      ensureAudioContext(ctx);
      const soundKey = preset in SOUND_AUDIO_URLS ? preset : "click-modern";
      const clampedVol = Math.max(0.01, Math.min(1, vol));
      const buffer = this.buffers.get(soundKey);

      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(clampedVol, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }

      const url = SOUND_AUDIO_URLS[soundKey] || "/sons/cliques/click-modern.mp3";
      this.loadBuffer(ctx, soundKey, url);
      const audio = new Audio(url);
      audio.volume = clampedVol;
      audio.play().catch(() => {});
    } catch (err) {
      console.error("[ClickSoundEngine] Error playing sound:", err);
    }
  }
}

export const clickSoundEngine = ClickSoundEngine.getInstance();

export function playSynthesizerSound(ctx: AudioContext, preset: SoundPreset, vol: number): void {
  clickSoundEngine.play(ctx, preset, vol);
}

export class AmbientSynthesizerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private intervalId: number | null = null;

  constructor() {}

  public start(ctx: AudioContext, volume: number = 0.5): void {
    if (this.isRunning) return;
    this.ctx = ctx;
    ensureAudioContext(ctx);

    const master = ctx.createGain();
    master.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;
    this.isRunning = true;

    const scale = [261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 783.99];

    const playRandomPad = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      try {
        const now = this.ctx.currentTime;
        const rootFreq = scale[Math.floor(Math.random() * scale.length)];

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = "sine";
        osc2.type = "triangle";
        osc1.frequency.setValueAtTime(rootFreq, now);
        osc2.frequency.setValueAtTime(rootFreq * 1.003, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 2);
        filter.frequency.linearRampToValueAtTime(500, now + 5.5);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 1.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 7);
        osc2.stop(now + 7);
      } catch {}
    };

    playRandomPad();
    this.intervalId = window.setInterval(playRandomPad, 3200);
  }

  public setVolume(vol: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
  }

  public get active(): boolean {
    return this.isRunning;
  }
}
