export const PARAMETRO_DA_PREVIA = "previa";

export function estaNaPrevia(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has(PARAMETRO_DA_PREVIA);
  } catch {
    return false;
  }
}

export function enderecoDaPrevia(): string {
  const raiz = import.meta.env.BASE_URL || "/";
  return `${raiz}?${PARAMETRO_DA_PREVIA}=1`;
}

export const RECADO_DO_MAPA = "ceclos:mapa";

export type RecadoDoMapa =
  | { tipo: typeof RECADO_DO_MAPA; acao: "ordem"; valor: string }
  | { tipo: typeof RECADO_DO_MAPA; acao: "ir"; id: string }
  | { tipo: typeof RECADO_DO_MAPA; acao: "pronta"; modo?: "windows" | "mobile" }
  | { tipo: typeof RECADO_DO_MAPA; acao: "selecionou"; id: string | null }
  | { tipo: typeof RECADO_DO_MAPA; acao: "selecao"; id: string | null }
  | { tipo: typeof RECADO_DO_MAPA; acao: "posicoes"; valor: string }
  | {
      tipo: typeof RECADO_DO_MAPA;
      acao: "moveu";
      id: string;
      modo: "windows" | "mobile";
      x: number;
      y: number;
    }
  | { tipo: typeof RECADO_DO_MAPA; acao: "modo-edicao"; ativo: boolean }
  | { tipo: typeof RECADO_DO_MAPA; acao: "grade"; tamanho: number; ativa: boolean };

export function ehRecadoDoMapa(dados: unknown): dados is RecadoDoMapa {
  return (
    typeof dados === "object" &&
    dados !== null &&
    (dados as { tipo?: unknown }).tipo === RECADO_DO_MAPA
  );
}
