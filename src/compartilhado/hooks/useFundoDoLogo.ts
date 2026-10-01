import { useEffect, useState } from "react";

export type FundoDoLogo = "claro" | "escuro";

const LIMITE_DE_BRILHO = 0.4;
const LADO_DA_AMOSTRA = 48;

const cache = new Map<string, FundoDoLogo>();
const pendentes = new Map<string, Promise<FundoDoLogo>>();

function brilhoRelativo(r: number, g: number, b: number): number {
  const canal = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function medirFundo(src: string): Promise<FundoDoLogo> {
  const emAndamento = pendentes.get(src);
  if (emAndamento) return emAndamento;

  const promessa = new Promise<FundoDoLogo>((resolve) => {
    if (typeof document === "undefined") {
      resolve("claro");
      return;
    }

    const imagem = new Image();
    imagem.decoding = "async";
    if (/^https?:\/\//i.test(src) && !src.startsWith(window.location.origin)) {
      imagem.crossOrigin = "anonymous";
    }

    imagem.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = LADO_DA_AMOSTRA;
        canvas.height = LADO_DA_AMOSTRA;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve("claro");
          return;
        }
        ctx.drawImage(imagem, 0, 0, LADO_DA_AMOSTRA, LADO_DA_AMOSTRA);
        const { data } = ctx.getImageData(0, 0, LADO_DA_AMOSTRA, LADO_DA_AMOSTRA);

        let soma = 0;
        let peso = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alfa = data[i + 3] / 255;
          if (alfa < 0.35) continue;
          soma += brilhoRelativo(data[i], data[i + 1], data[i + 2]) * alfa;
          peso += alfa;
        }

        if (peso === 0) {
          resolve("claro");
          return;
        }
        resolve(soma / peso > LIMITE_DE_BRILHO ? "escuro" : "claro");
      } catch {
        resolve("claro");
      }
    };
    imagem.onerror = () => resolve("claro");
    imagem.src = src;
  }).then((fundo) => {
    cache.set(src, fundo);
    pendentes.delete(src);
    return fundo;
  });

  pendentes.set(src, promessa);
  return promessa;
}

export function useFundoDoLogo(src: string | undefined): FundoDoLogo {
  const [fundo, setFundo] = useState<FundoDoLogo>(() => (src && cache.get(src)) || "claro");

  useEffect(() => {
    if (!src) return;
    const conhecido = cache.get(src);
    if (conhecido) {
      setFundo(conhecido);
      return;
    }
    let ativo = true;
    medirFundo(src).then((resultado) => {
      if (ativo) setFundo(resultado);
    });
    return () => {
      ativo = false;
    };
  }, [src]);

  return fundo;
}
