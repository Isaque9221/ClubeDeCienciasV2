import { useEffect, useState } from "react";

export function useForaDoHero(): boolean {
  const [fora, setFora] = useState(true);

  useEffect(() => {
    const medir = () => {
      const hero = document.getElementById("hero");
      if (!hero) {
        setFora(true);
        return;
      }
      const caixa = hero.getBoundingClientRect();
      setFora(caixa.bottom < window.innerHeight * 0.6);
    };

    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    const relogio = window.setInterval(medir, 700);

    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
      window.clearInterval(relogio);
    };
  }, []);

  return fora;
}
