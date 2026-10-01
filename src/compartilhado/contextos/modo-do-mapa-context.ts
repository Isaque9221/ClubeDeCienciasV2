import { createContext } from "react";
import type { GradeDoMapa } from "@/compartilhado/hooks/useModoPrevia";

export interface ModoDoMapaContextType {
  naPrevia: boolean;
  ordemDeTeste: string | null;
  posicoesDeTeste: string | null;
  modoEdicao: boolean;
  grade: GradeDoMapa;
  elementoSelecionado: string | null;
  avisarSelecao: (id: string | null) => void;
  avisarMovimento: (id: string, modo: "windows" | "mobile", x: number, y: number) => void;
}

export const ModoDoMapaContext = createContext<ModoDoMapaContextType | undefined>(undefined);
