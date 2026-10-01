import { createContext } from "react";
import type {
  StudentProject,
  StudentUser,
  ProjectFeedback,
  ProjectStatus,
} from "@/compartilhado/tipos/project.types";

export interface ProjectsContextType {
  projects: StudentProject[];
  getStudentProjects: (studentId: string) => StudentProject[];
  getProjectById: (id: string) => StudentProject | undefined;
  createProject: (data: Partial<StudentProject>, student?: Partial<StudentUser>) => StudentProject;
  updateProject: (id: string, data: Partial<StudentProject>) => void;
  deleteProject: (id: string) => void;
  addAdminFeedback: (projectId: string, feedback: ProjectFeedback) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  resetProjects: () => void;
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const PROJECTS_STORAGE_KEY = "ceclos_student_projects_v5";
