import type { ReactNode } from "react";
import { useModoPrevia } from "@/compartilhado/hooks/useModoPrevia";
import { ModoDoMapaContext } from "./modo-do-mapa-context";

export function ModoDoMapaProvider({ children }: { children: ReactNode }) {
  const valor = useModoPrevia("windows");

  return (
    <ModoDoMapaContext.Provider value={valor}>
      {children}

      {valor.naPrevia && valor.modoEdicao && valor.grade.ativa && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[9998]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250, 204, 21, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(250, 204, 21, 0.14) 1px, transparent 1px)",
            backgroundSize: `${valor.grade.tamanho}px ${valor.grade.tamanho}px`,
          }}
        />
      )}
    </ModoDoMapaContext.Provider>
  );
}
