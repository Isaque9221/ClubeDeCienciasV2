export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function numeroInternacional(telefone: string): string {
  const digitos = somenteDigitos(telefone).replace(/^0+/, "");
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  if (digitos.length >= 12 && digitos.length <= 15) return digitos;
  return "";
}

export function montarLinkDeContato(telefone: string, mensagem: string): string {
  const numero = numeroInternacional(telefone);
  if (!numero) return "";
  const texto = mensagem.trim();
  return texto
    ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
    : `https://wa.me/${numero}`;
}
