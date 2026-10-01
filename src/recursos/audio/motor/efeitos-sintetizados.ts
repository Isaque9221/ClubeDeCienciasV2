import type { EfeitoSonoro, OpcoesDoEfeito } from "@/compartilhado/tipos/sound.types";

const ruidoPorContexto = new WeakMap<AudioContext, AudioBuffer>();

function ruido(ctx: AudioContext): AudioBuffer {
  const pronto = ruidoPorContexto.get(ctx);
  if (pronto) return pronto;

  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
  ruidoPorContexto.set(ctx, buffer);
  return buffer;
}

function saida(ctx: AudioContext, volume: number, lado = 0): GainNode {
  const ganho = ctx.createGain();
  ganho.gain.value = volume;

  if (lado !== 0 && typeof ctx.createStereoPanner === "function") {
    const panorama = ctx.createStereoPanner();
    panorama.pan.value = Math.max(-1, Math.min(1, lado));
    ganho.connect(panorama).connect(ctx.destination);
  } else {
    ganho.connect(ctx.destination);
  }
  return ganho;
}

interface Nota {
  freq: number;
  inicio: number;
  duracao: number;
  pico: number;
  tipo?: OscillatorType;
  ataque?: number;
  ate?: number;
}

function nota(ctx: AudioContext, destino: AudioNode, n: Nota): void {
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  const ataque = n.ataque ?? 0.005;

  osc.type = n.tipo ?? "sine";
  osc.frequency.setValueAtTime(n.freq, n.inicio);
  if (n.ate) osc.frequency.exponentialRampToValueAtTime(n.ate, n.inicio + n.duracao);

  envelope.gain.setValueAtTime(0.0001, n.inicio);
  envelope.gain.exponentialRampToValueAtTime(n.pico, n.inicio + ataque);
  envelope.gain.exponentialRampToValueAtTime(0.0001, n.inicio + n.duracao);

  osc.connect(envelope).connect(destino);
  osc.start(n.inicio);
  osc.stop(n.inicio + n.duracao + 0.05);
}

function sopro(
  ctx: AudioContext,
  destino: AudioNode,
  inicio: number,
  duracao: number,
  pico: number,
  de: number,
  ate: number
): void {
  const fonte = ctx.createBufferSource();
  fonte.buffer = ruido(ctx);

  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.Q.value = 1.4;
  filtro.frequency.setValueAtTime(de, inicio);
  filtro.frequency.exponentialRampToValueAtTime(ate, inicio + duracao);

  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, inicio);
  envelope.gain.exponentialRampToValueAtTime(pico, inicio + duracao * 0.4);
  envelope.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

  fonte.connect(filtro).connect(envelope).connect(destino);
  fonte.start(inicio);
  fonte.stop(inicio + duracao + 0.05);
}

function eco(ctx: AudioContext, destino: AudioNode): GainNode {
  const entrada = ctx.createGain();
  const atraso = ctx.createDelay(1);
  const retorno = ctx.createGain();
  const molhado = ctx.createGain();

  atraso.delayTime.value = 0.13;
  retorno.gain.value = 0.28;
  molhado.gain.value = 0.3;

  entrada.connect(destino);
  entrada.connect(atraso);
  atraso.connect(retorno).connect(atraso);
  atraso.connect(molhado).connect(destino);
  return entrada;
}

const DO4 = 261.63;
const SOL4 = 392.0;
const DO5 = 523.25;
const MI5 = 659.25;
const SOL5 = 783.99;
const DO6 = 1046.5;
const MI6 = 1318.51;
const SOL6 = 1567.98;

export function tocarEfeitoSintetizado(
  ctx: AudioContext,
  efeito: EfeitoSonoro,
  volume: number,
  { lado = 0, tom = 1 }: OpcoesDoEfeito = {}
): void {
  try {
    const t = ctx.currentTime + 0.01;
    const fim = saida(ctx, Math.max(0.01, Math.min(1, volume)), lado);

    switch (efeito) {
      case "mira": {
        nota(ctx, fim, { freq: SOL6 * tom, inicio: t, duracao: 0.05, pico: 0.22 });
        nota(ctx, fim, { freq: DO6 * 2 * tom, inicio: t + 0.045, duracao: 0.08, pico: 0.17 });
        sopro(ctx, fim, t, 0.03, 0.06, 5000, 9000);
        break;
      }

      case "liga": {
        nota(ctx, fim, { freq: SOL5 * tom, inicio: t, duracao: 0.09, pico: 0.3, tipo: "triangle" });
        nota(ctx, fim, {
          freq: DO6 * tom,
          inicio: t + 0.065,
          duracao: 0.16,
          pico: 0.3,
          tipo: "triangle",
        });
        break;
      }

      case "desliga": {
        nota(ctx, fim, { freq: DO6 * tom, inicio: t, duracao: 0.08, pico: 0.24, tipo: "triangle" });
        nota(ctx, fim, {
          freq: SOL5 * tom,
          inicio: t + 0.06,
          duracao: 0.14,
          pico: 0.2,
          tipo: "triangle",
        });
        break;
      }

      case "confirmar": {
        nota(ctx, fim, { freq: 180, ate: 55, inicio: t, duracao: 0.2, pico: 0.5 });

        const brilho = eco(ctx, fim);
        [DO5, MI5, SOL5, DO6, MI6].forEach((f, i) => {
          const inicio = t + 0.03 + i * 0.05;
          nota(ctx, brilho, {
            freq: f * tom,
            inicio,
            duracao: 0.9 - i * 0.08,
            pico: 0.2,
            ataque: 0.01,
          });
          nota(ctx, brilho, { freq: f * 2 * tom, inicio, duracao: 0.4, pico: 0.035, ataque: 0.01 });
        });

        sopro(ctx, fim, t + 0.05, 0.55, 0.09, 500, 4200);
        break;
      }

      case "etapa": {
        nota(ctx, fim, { freq: DO5 * tom, inicio: t, duracao: 0.7, pico: 0.14, ataque: 0.004 });
        nota(ctx, fim, {
          freq: DO5 * 2.76 * tom,
          inicio: t,
          duracao: 0.28,
          pico: 0.035,
          ataque: 0.003,
        });
        break;
      }

      case "salto": {
        nota(ctx, fim, {
          freq: 90,
          ate: 260,
          inicio: t,
          duracao: 0.6,
          pico: 0.34,
          tipo: "triangle",
          ataque: 0.08,
        });
        sopro(ctx, fim, t, 0.75, 0.18, 300, 6000);

        const brilho = eco(ctx, fim);
        [SOL5, DO6, MI6].forEach((f, i) => {
          nota(ctx, brilho, {
            freq: f,
            inicio: t + 0.32 + i * 0.06,
            duracao: 0.6,
            pico: 0.13,
            ataque: 0.01,
          });
        });
        break;
      }

      case "entrada": {
        const abafado = ctx.createBiquadFilter();
        abafado.type = "lowpass";
        abafado.frequency.value = 1800;
        abafado.connect(fim);

        nota(ctx, abafado, { freq: DO4, inicio: t, duracao: 2.4, pico: 0.12, ataque: 0.5 });
        nota(ctx, abafado, { freq: SOL4, inicio: t + 0.12, duracao: 2.2, pico: 0.09, ataque: 0.5 });
        nota(ctx, abafado, {
          freq: SOL6,
          inicio: t + 0.35,
          duracao: 1.6,
          pico: 0.024,
          ataque: 0.4,
        });
        break;
      }
    }
  } catch (err) {
    console.warn("[efeitos] Não deu para tocar o efeito:", efeito, err);
  }
}
