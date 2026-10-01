export interface ItemDeLista {
  id: string;
  [campo: string]: string;
}

function ehListaUtil(valor: unknown, minimo: number): valor is ItemDeLista[] {
  if (!Array.isArray(valor)) return false;
  if (valor.length < minimo) return false;
  return valor.every((i) => i !== null && typeof i === "object" && !Array.isArray(i));
}

export function listaDeTextos(doPainel: unknown, padrao: readonly string[], minimo = 0): string[] {
  if (!ehListaUtil(doPainel, minimo)) return [...padrao];
  return doPainel
    .map((item) => (typeof item.texto === "string" ? item.texto.trim() : ""))
    .filter(Boolean);
}

export function listaDeItens<T extends object>(
  doPainel: unknown,
  padrao: readonly T[],
  campos: readonly (keyof T & string)[],
  minimo = 1
): T[] {
  if (padrao.length === 0) return [];
  if (!ehListaUtil(doPainel, Math.max(minimo, 1))) return [...padrao];

  return doPainel.map((item, i) => {
    const base = padrao[i] ?? padrao[padrao.length - 1];
    const resultado = { ...base } as T;

    for (const campo of campos) {
      const valor = item[campo];
      if (typeof valor === "string" && valor.trim() !== "") {
        (resultado as Record<string, unknown>)[campo] = valor;
      }
    }
    return resultado;
  });
}

export function linhasComoLista(doPainel: unknown, padrao: readonly string[]): string[] {
  if (typeof doPainel !== "string") return [...padrao];
  const linhas = doPainel
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return linhas.length > 0 ? linhas : [...padrao];
}

export function listaComoLinhas(itens: readonly string[]): string {
  return itens.join("\n");
}
