import { PaginaInicialWindows } from "@/plataformas/windows";
import type { PropsDaPaginaInicial } from "@/plataformas/tipos";

export function HomePage(props: PropsDaPaginaInicial) {
  return <PaginaInicialWindows {...props} />;
}
