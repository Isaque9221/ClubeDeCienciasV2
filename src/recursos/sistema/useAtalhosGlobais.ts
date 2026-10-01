import { useEffect } from "react";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";

function estaDigitando(alvo: EventTarget | null): boolean {
  return (
    alvo instanceof HTMLElement &&
    (alvo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName))
  );
}

export function useAtalhosGlobais({
  ativo,
  alternarMusica,
}: {
  ativo: boolean;
  alternarMusica: () => void;
}) {
  const { preferencias, abrirJanela, janela } = usePreferencias();

  useEffect(() => {
    if (!ativo) return;

    const aoTeclar = (e: KeyboardEvent) => {
      const comando = e.ctrlKey || e.metaKey;
      if (comando && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        abrirJanela("comandos");
        return;
      }
      if (comando && !e.shiftKey && !e.altKey && e.key === ",") {
        e.preventDefault();
        abrirJanela("ajustes");
        return;
      }

      if (comando || e.altKey || janela || !preferencias.atalhosDeUmaTecla) return;
      if (estaDigitando(e.target) || document.querySelector('[role="dialog"]')) return;

      if (e.key === "/") {
        e.preventDefault();
        const campo = document.querySelector<HTMLInputElement>("[data-campo-de-busca]");
        if (campo) campo.focus();
        else abrirJanela("comandos");
      } else if (e.key === "?") {
        e.preventDefault();
        abrirJanela("atalhos");
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        alternarMusica();
      }
    };

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ativo, alternarMusica, abrirJanela, janela, preferencias.atalhosDeUmaTecla]);
}
