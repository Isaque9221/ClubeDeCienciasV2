import { useContext } from "react";
import {
  PreferenciasContext,
  type PreferenciasContextType,
} from "@/compartilhado/contextos/preferencias-context";

export function usePreferencias(): PreferenciasContextType {
  const context = useContext(PreferenciasContext);
  if (!context) {
    throw new Error("usePreferencias must be used within a PreferenciasProvider");
  }
  return context;
}
