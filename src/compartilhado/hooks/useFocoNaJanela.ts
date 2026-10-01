import { useEffect, type RefObject } from "react";

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocoNaJanela(aberta: boolean, janelaRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!aberta) return;
    const anterior = document.activeElement as HTMLElement | null;

    const focaveis = () =>
      Array.from(janelaRef.current?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? []).filter(
        (el) => el.getClientRects().length > 0
      );

    const quadro = requestAnimationFrame(() => {
      const janela = janelaRef.current;
      if (!janela || janela.contains(document.activeElement)) return;
      (focaveis()[0] ?? janela).focus({ preventScroll: true });
    });

    const aoTeclar = (e: KeyboardEvent) => {
      const janela = janelaRef.current;
      if (e.key !== "Tab" || !janela) return;
      const lista = focaveis();
      if (!lista.length) {
        e.preventDefault();
        janela.focus({ preventScroll: true });
        return;
      }
      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];
      const ativo = document.activeElement;
      const fora = !janela.contains(ativo);
      if (e.shiftKey && (ativo === primeiro || fora)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (ativo === ultimo || fora)) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);

    return () => {
      cancelAnimationFrame(quadro);
      document.removeEventListener("keydown", aoTeclar);
      if (anterior?.isConnected) anterior.focus({ preventScroll: true });
    };
  }, [aberta, janelaRef]);
}
