export const CHAVES_DE_REMOVIDOS = {
  MEMBROS: "ceclos_removidos_membros_v1",
  MENTORES: "ceclos_removidos_mentores_v1",
  PARCEIROS: "ceclos_removidos_parceiros_v1",
} as const;

export function lerRemovidos(chave: string): Set<string> {
  try {
    const salvo = localStorage.getItem(chave);
    if (!salvo) return new Set();
    const lista: unknown = JSON.parse(salvo);
    if (!Array.isArray(lista)) return new Set();
    return new Set(lista.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function gravarRemovidos(chave: string, ids: Set<string>): void {
  try {
    localStorage.setItem(chave, JSON.stringify([...ids]));
  } catch (e) {
    console.error("Não consegui guardar a lista de apagados:", e);
  }
}

export function marcarComoRemovido(chave: string, id: string): void {
  const atuais = lerRemovidos(chave);
  atuais.add(id);
  gravarRemovidos(chave, atuais);
}

export function desmarcarComoRemovido(chave: string, id: string): void {
  const atuais = lerRemovidos(chave);
  if (!atuais.delete(id)) return;
  gravarRemovidos(chave, atuais);
}

export function limparRemovidos(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch (e) {
    console.error("Não consegui limpar a lista de apagados:", e);
  }
}
