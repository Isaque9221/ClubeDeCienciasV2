import { useEffect } from "react";

export function usePausarForaDaTela(seletor: string, chave: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const vigia = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          entrada.target.toggleAttribute("data-fora-da-tela", !entrada.isIntersecting);
        }
      },
      { rootMargin: "300px 0px" }
    );

    const alvos = document.querySelectorAll(seletor);
    alvos.forEach((el) => vigia.observe(el));

    return () => {
      vigia.disconnect();
      alvos.forEach((el) => el.removeAttribute("data-fora-da-tela"));
    };
  }, [seletor, chave]);
}
