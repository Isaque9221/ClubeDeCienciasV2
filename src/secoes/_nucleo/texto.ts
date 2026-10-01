export function texto(doPainel: string | undefined, padrao: string = ""): string {
  const valor = doPainel?.trim();
  return valor !== undefined && valor !== "" ? valor : (padrao ?? "");
}
