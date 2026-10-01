export interface PosicaoLivre {
  x: number;
  y: number;
}

export type ModoDePosicao = "windows" | "mobile";

export type PosicoesLivres = Record<string, Partial<Record<ModoDePosicao, PosicaoLivre>>>;

export function lerPosicoes(gravado?: string): PosicoesLivres {
  if (!gravado) return {};
  try {
    const dados = JSON.parse(gravado);
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) return {};

    const limpo: PosicoesLivres = {};
    for (const [id, porModo] of Object.entries(dados as Record<string, unknown>)) {
      if (!porModo || typeof porModo !== "object") continue;
      const entrada: Partial<Record<ModoDePosicao, PosicaoLivre>> = {};
      for (const modo of ["windows", "mobile"] as const) {
        const valor = (porModo as Record<string, unknown>)[modo];
        if (
          valor &&
          typeof valor === "object" &&
          typeof (valor as PosicaoLivre).x === "number" &&
          typeof (valor as PosicaoLivre).y === "number" &&
          Number.isFinite((valor as PosicaoLivre).x) &&
          Number.isFinite((valor as PosicaoLivre).y)
        ) {
          entrada[modo] = {
            x: (valor as PosicaoLivre).x,
            y: (valor as PosicaoLivre).y,
          };
        }
      }
      if (entrada.windows || entrada.mobile) limpo[id] = entrada;
    }
    return limpo;
  } catch {
    return {};
  }
}

export function escreverPosicoes(posicoes: PosicoesLivres): string {
  if (Object.keys(posicoes).length === 0) return "";
  return JSON.stringify(posicoes);
}

export function ajustarNaGrade(valor: number, tamanho: number): number {
  if (tamanho <= 0) return Math.round(valor);
  return Math.round(valor / tamanho) * tamanho;
}
