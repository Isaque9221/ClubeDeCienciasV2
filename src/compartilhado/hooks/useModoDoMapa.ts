import { useContext } from "react";
import {
  ModoDoMapaContext,
  type ModoDoMapaContextType,
} from "@/compartilhado/contextos/modo-do-mapa-context";

export function useModoDoMapa(): ModoDoMapaContextType {
  const context = useContext(ModoDoMapaContext);
  if (!context) {
    throw new Error("useModoDoMapa must be used within a ModoDoMapaProvider");
  }
  return context;
}
