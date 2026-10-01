export interface StudentUser {
  id: string;
  name: string;
  email?: string;
  schoolYear: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
}

export type ProjectStatus = "draft" | "in_progress" | "review" | "approved" | "featured";

export type ProjectPillar =
  "investigacao" | "tecnologia" | "astronomia" | "biotecnologia" | "geral";

export interface ProjectFeedback {
  author: string;
  comment: string;
  badge?:
    "Destaque Científico" | "Aprovado para FECIBA" | "Revisão Solicitada" | "Projeto Exemplar";
  evaluatedAt: string;
}

export interface ProjectMethodologyClassification {
  nature?: "basica" | "aplicada";
  objective?: "exploratoria" | "descritiva" | "explicativa";
  approach?: "quantitativa" | "qualitativa" | "mista";
  procedure?: string;
  logicalMethod?: string;
}

export interface StudentProject {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentImage?: string;
  studentRole?: string;
  studentGrade?: string;
  title: string;
  emoji: string;
  coverGradient?: string;
  coverImage?: string;
  pillar: ProjectPillar;
  status: ProjectStatus;
  summary: string;
  content: string;
  methodology: {
    problemStatement: string;
    hypothesis: string;
    materials: string;
    results: string;
    references: string;
    classification?: ProjectMethodologyClassification;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  adminFeedback?: ProjectFeedback;
}
