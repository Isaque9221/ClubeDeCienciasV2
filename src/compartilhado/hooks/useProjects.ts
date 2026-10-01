import { useContext } from "react";
import {
  ProjectsContext,
  type ProjectsContextType,
} from "@/compartilhado/contextos/projects-context";

export function useProjects(): ProjectsContextType {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects deve ser usado dentro de um ProjectsProvider");
  }
  return context;
}
