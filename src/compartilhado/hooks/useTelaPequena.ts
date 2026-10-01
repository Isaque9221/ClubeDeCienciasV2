import { useEffect, useState } from "react";

const CONSULTA = "(max-width: 639.98px)";

export function useTelaPequena(): boolean {
  const [pequena, setPequena] = useState(
    () => typeof window !== "undefined" && window.matchMedia(CONSULTA).matches
  );

  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA);
    const medir = () => setPequena(consulta.matches);
    medir();
    consulta.addEventListener("change", medir);
    return () => consulta.removeEventListener("change", medir);
  }, []);

  return pequena;
}
