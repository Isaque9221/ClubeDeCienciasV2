export function corLegivel(cor: string): string {
  return `color-mix(in oklab, ${cor}, var(--color-white) var(--mistura-de-contraste, 0%))`;
}
