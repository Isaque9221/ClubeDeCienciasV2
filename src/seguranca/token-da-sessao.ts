let tokenDaSessao: string | null = null;

export function guardarTokenDaSessao(token: string): void {
  const limpo = token.trim();
  tokenDaSessao = limpo || null;
}

export function lerTokenDaSessao(): string | null {
  return tokenDaSessao;
}

export function esquecerTokenDaSessao(): void {
  tokenDaSessao = null;
}
