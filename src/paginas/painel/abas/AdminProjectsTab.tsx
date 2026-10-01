import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Award,
  GraduationCap,
  Calendar,
  User,
  Trash2,
  X,
  BookOpen,
  Plus,
  Edit2,
  Check,
  Tag,
  FileText,
} from "lucide-react";
import { useProjects, useSound } from "@/compartilhado/hooks";
import type {
  StudentProject,
  ProjectFeedback,
  ProjectPillar,
  ProjectStatus,
} from "@/compartilhado/tipos/project.types";

const PILLAR_MAP: Record<ProjectPillar, { label: string; color: string }> = {
  investigacao: {
    label: "Investigação & Exp.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  tecnologia: {
    label: "Tecnologia & IA",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  astronomia: {
    label: "Astronomia & Cosmos",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  biotecnologia: {
    label: "Biotec & Caatinga",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  geral: { label: "Ciências Gerais", color: "text-stone-400 bg-stone-500/10 border-stone-500/20" },
};

const STATUS_MAP: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "text-stone-400 bg-white/5 border-white/10" },
  in_progress: {
    label: "Em Investigação",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  review: {
    label: "Aguardando Parecer",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  approved: {
    label: "Aprovado",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  featured: {
    label: "★ Destaque FECIBA",
    color: "text-yellow-300 bg-yellow-400/15 border-yellow-400/30",
  },
};

const DEFAULT_PROJECT_FORM = {
  title: "",
  emoji: "🔬",
  studentName: "",
  studentGrade: "1º Ano - Ensino Médio",
  pillar: "investigacao" as ProjectPillar,
  status: "in_progress" as ProjectStatus,
  summary: "",
  content: "",
  problemStatement: "",
  hypothesis: "",
  materials: "",
  results: "",
  references: "",
  tagsString: "iniciação-científica, semiárido, ceclos",
};

export function AdminProjectsTab() {
  const { projects, createProject, updateProject, deleteProject, addAdminFeedback } = useProjects();
  const { playSound } = useSound();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [activeProject, setActiveProject] = useState<StudentProject | null>(null);
  const [feedbackAuthor, setFeedbackAuthor] = useState("Prof. Victor Montalvão Moreno");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackBadge, setFeedbackBadge] =
    useState<ProjectFeedback["badge"]>("Aprovado para FECIBA");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState(DEFAULT_PROJECT_FORM);
  const [formSavedToast, setFormSavedToast] = useState(false);

  useEffect(() => {
    if (activeProject || isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeProject, isEditModalOpen]);

  const totalProjects = projects.length;
  const inProgressCount = projects.filter((p) => p.status === "in_progress").length;
  const inReviewCount = projects.filter((p) => p.status === "review").length;
  const approvedCount = projects.filter(
    (p) => p.status === "approved" || p.status === "featured"
  ).length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPillar = selectedPillar === "all" ? true : p.pillar === selectedPillar;

    const matchesStatus = selectedStatus === "all" ? true : p.status === selectedStatus;

    return matchesSearch && matchesPillar && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    playSound("pop-bubble");
    setEditingProjectId(null);
    setProjectForm(DEFAULT_PROJECT_FORM);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (project: StudentProject) => {
    playSound("pop-bubble");
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      emoji: project.emoji || "🔬",
      studentName: project.studentName,
      studentGrade: project.studentGrade || "1º Ano - Ensino Médio",
      pillar: project.pillar,
      status: project.status,
      summary: project.summary,
      content: project.content || "",
      problemStatement: project.methodology?.problemStatement || "",
      hypothesis: project.methodology?.hypothesis || "",
      materials: project.methodology?.materials || "",
      results: project.methodology?.results || "",
      references: project.methodology?.references || "",
      tagsString: (project.tags || []).join(", "),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    playSound("pop-bubble");

    const tags = projectForm.tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const methodology = {
      problemStatement: projectForm.problemStatement,
      hypothesis: projectForm.hypothesis,
      materials: projectForm.materials,
      results: projectForm.results,
      references: projectForm.references,
    };

    if (editingProjectId) {
      updateProject(editingProjectId, {
        title: projectForm.title,
        emoji: projectForm.emoji,
        studentName: projectForm.studentName,
        studentGrade: projectForm.studentGrade,
        pillar: projectForm.pillar,
        status: projectForm.status,
        summary: projectForm.summary,
        content: projectForm.content,
        methodology,
        tags,
      });
    } else {
      createProject({
        studentId: `std-${Date.now()}`,
        studentName: projectForm.studentName,
        studentGrade: projectForm.studentGrade,
        title: projectForm.title,
        emoji: projectForm.emoji,
        pillar: projectForm.pillar,
        status: projectForm.status,
        summary: projectForm.summary,
        content: projectForm.content || projectForm.summary,
        methodology,
        tags,
      });
    }

    setFormSavedToast(true);
    setTimeout(() => setFormSavedToast(false), 2000);
    setIsEditModalOpen(false);
  };

  const handleOpenEvaluateModal = (project: StudentProject) => {
    playSound("pop-bubble");
    setActiveProject(project);
    setFeedbackComment(project.adminFeedback?.comment || "");
    setFeedbackAuthor(project.adminFeedback?.author || "Prof. Victor Montalvão Moreno");
    setFeedbackBadge(project.adminFeedback?.badge || "Aprovado para FECIBA");
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    playSound("pop-bubble");
    addAdminFeedback(activeProject.id, {
      author: feedbackAuthor,
      comment: feedbackComment,
      badge: feedbackBadge,
      evaluatedAt: new Date().toISOString().split("T")[0],
    });

    setActiveProject(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Excluir permanentemente o projeto "${title}"?`)) {
      playSound("subtle-click");
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121216] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Cadernos de Pesquisa dos Alunos</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-stone-300">
              {totalProjects}
            </span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Acompanhamento metodológico, diários de bordo e avaliação para feiras de ciências.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-stone-300 font-semibold">{inProgressCount}</span>
            <span className="text-stone-500">Em curso</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-semibold">{inReviewCount}</span>
            <span className="text-amber-400/80">Avaliação</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-semibold">{approvedCount}</span>
            <span className="text-emerald-400/80">Aprovados</span>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {formSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Projeto salvo com sucesso no banco de dados local!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por título, aluno ou tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-white/[0.08] bg-[#141419] text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400/60 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/[0.08] bg-[#141419] text-xs text-stone-300 focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Pilares</option>
            <option value="investigacao">Investigação & Exp.</option>
            <option value="tecnologia">Tecnologia & IA</option>
            <option value="astronomia">Astronomia & Cosmos</option>
            <option value="biotecnologia">Biotec & Caatinga</option>
            <option value="geral">Ciências Gerais</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/[0.08] bg-[#141419] text-xs text-stone-300 focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="in_progress">Em Investigação</option>
            <option value="review">Aguardando Avaliação</option>
            <option value="approved">Aprovado</option>
            <option value="featured">Destaque FECIBA</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/[0.08] rounded-2xl p-6 bg-white/[0.01]">
            <BookOpen className="h-8 w-8 text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-300">Nenhum projeto encontrado</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Tente modificar os termos de busca ou filtros aplicados.
            </p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const pillarInfo = PILLAR_MAP[proj.pillar] || {
              label: proj.pillar,
              color: "text-stone-400 bg-white/5 border-white/10",
            };
            const statusInfo = STATUS_MAP[proj.status] || {
              label: proj.status,
              color: "text-stone-400 bg-white/5 border-white/10",
            };

            return (
              <div
                key={proj.id}
                className="rounded-2xl border border-white/[0.08] bg-[#141419] hover:border-white/20 p-4 sm:p-5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg">{proj.emoji}</span>
                    <h4 className="font-bold text-sm text-white truncate max-w-md">{proj.title}</h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillarInfo.color}`}
                    >
                      {pillarInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {proj.summary || "Sem resumo cadastrado."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-stone-400" />
                      <strong className="text-stone-300">{proj.studentName}</strong>
                      {proj.studentGrade && (
                        <span className="text-stone-500">({proj.studentGrade})</span>
                      )}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-stone-400" />
                      <span>Atualizado: {proj.updatedAt}</span>
                    </span>
                    {proj.adminFeedback && (
                      <>
                        <span>•</span>
                        <span className="text-amber-300 font-medium flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {proj.adminFeedback.badge}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(proj)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                    title="Editar projeto e metodologia"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEvaluateModal(proj)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-stone-950 border border-amber-400/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Avaliar Pesquisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(proj.id, proj.title)}
                    className="p-2 rounded-xl border border-white/[0.08] hover:border-rose-500/30 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Excluir projeto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isEditModalOpen && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
                onClick={() => setIsEditModalOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl max-h-[92vh] rounded-3xl border border-white/[0.12] bg-[#121216] text-stone-100 shadow-2xl flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#16161C]">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{projectForm.emoji}</span>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {editingProjectId
                            ? "Editar Projeto Científico"
                            : "Cadastrar Novo Projeto"}
                        </h3>
                        <p className="text-[11px] text-stone-400">
                          Preencha as informações do projeto e a fundamentação metodológica.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSaveProjectForm}
                    className="flex-1 overflow-y-auto p-6 space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block font-semibold text-stone-300 mb-1">
                          Título do Projeto *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectForm.title}
                          onChange={(e) =>
                            setProjectForm({ ...projectForm, title: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                          placeholder="Ex: Biofiltro de Sisal para Purificação Hídrica"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Ícone / Emoji
                        </label>
                        <input
                          type="text"
                          value={projectForm.emoji}
                          onChange={(e) =>
                            setProjectForm({ ...projectForm, emoji: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-center"
                          placeholder="🔬"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Nome do(a) Aluno(a) / Pesquisador(a) *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectForm.studentName}
                          onChange={(e) =>
                            setProjectForm({ ...projectForm, studentName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                          placeholder="Ex: Laura Silva"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Série / Ano Escolar
                        </label>
                        <select
                          value={projectForm.studentGrade}
                          onChange={(e) =>
                            setProjectForm({ ...projectForm, studentGrade: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                          <option value="1º Ano - Ensino Médio">1º Ano - Ensino Médio</option>
                          <option value="2º Ano - Ensino Médio">2º Ano - Ensino Médio</option>
                          <option value="3º Ano - Ensino Médio">3º Ano - Ensino Médio</option>
                          <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Pilar Científico
                        </label>
                        <select
                          value={projectForm.pillar}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              pillar: e.target.value as ProjectPillar,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                          <option value="investigacao">Investigação & Experimentos</option>
                          <option value="tecnologia">Tecnologia & IA</option>
                          <option value="astronomia">Astronomia & Cosmos</option>
                          <option value="biotecnologia">Biotecnologia & Caatinga</option>
                          <option value="geral">Ciências Gerais</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Status do Projeto
                        </label>
                        <select
                          value={projectForm.status}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              status: e.target.value as ProjectStatus,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                          <option value="draft">Rascunho</option>
                          <option value="in_progress">Em Investigação</option>
                          <option value="review">Aguardando Avaliação</option>
                          <option value="approved">Aprovado</option>
                          <option value="featured">★ Destaque FECIBA</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Resumo da Pesquisa *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={projectForm.summary}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, summary: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                        placeholder="Apresentação concisa do objeto de pesquisa, relevância para a Caatinga e impacto pretendido..."
                      />
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] space-y-3">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Caderno de Metodologia Científica</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-stone-400 mb-1">
                            Problema de Pesquisa
                          </label>
                          <textarea
                            rows={2}
                            value={projectForm.problemStatement}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                problemStatement: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                            placeholder="Qual questão a pesquisa pretende responder?"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-400 mb-1">
                            Hipótese Inicial
                          </label>
                          <textarea
                            rows={2}
                            value={projectForm.hypothesis}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                hypothesis: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                            placeholder="O que se espera comprovar ou refutar?"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-stone-400 mb-1">
                            Materiais & Métodos
                          </label>
                          <textarea
                            rows={2}
                            value={projectForm.materials}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                materials: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                            placeholder="Insumos, equipamentos de laboratório, reagentes..."
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-400 mb-1">
                            Resultados Esperados / Obtidos
                          </label>
                          <textarea
                            rows={2}
                            value={projectForm.results}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                results: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                            placeholder="Dados coletados, gráficos, observações quantitativas..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-400 mb-1">
                          Referências Bibliográficas
                        </label>
                        <input
                          type="text"
                          value={projectForm.references}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              references: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                          placeholder="Autores, artigos científicos, normas da ABNT..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-stone-400" />
                        <span>Tags (separadas por vírgula)</span>
                      </label>
                      <input
                        type="text"
                        value={projectForm.tagsString}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            tagsString: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none"
                        placeholder="ex: biologia, caatinga, sustentabilidade"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 font-semibold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all cursor-pointer shadow-md active:scale-98 flex items-center gap-1.5"
                      >
                        <Check className="h-4 w-4 stroke-[2.5]" />
                        <span>{editingProjectId ? "Atualizar Projeto" : "Cadastrar Projeto"}</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeProject && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
                onClick={() => setActiveProject(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg max-h-[90vh] rounded-3xl border border-white/[0.12] bg-[#121216] text-stone-100 shadow-2xl flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#16161C]">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Parecer Pedagógico do Orientador
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Avaliação científica para o aluno e submissão a feiras.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveProject(null)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="p-3 rounded-xl bg-[#0E0E12] border border-white/[0.08] space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{activeProject.emoji}</span>
                        <span className="font-bold text-white truncate">{activeProject.title}</span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        Pesquisador(a):{" "}
                        <strong className="text-stone-300">{activeProject.studentName}</strong>
                      </p>
                    </div>

                    <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Nome do Orientador / Avaliador
                        </label>
                        <input
                          type="text"
                          required
                          value={feedbackAuthor}
                          onChange={(e) => setFeedbackAuthor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                          placeholder="Ex: Prof. Victor Montalvão Moreno"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Chancela / Selo de Reconhecimento
                        </label>
                        <select
                          value={feedbackBadge}
                          onChange={(e) =>
                            setFeedbackBadge(e.target.value as ProjectFeedback["badge"])
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs cursor-pointer"
                        >
                          <option value="Aprovado para FECIBA">Aprovado para FECIBA 2026</option>
                          <option value="Destaque Científico">Destaque Científico CECLOS</option>
                          <option value="Revisão Solicitada">Revisão Solicitada</option>
                          <option value="Projeto Exemplar">Projeto Exemplar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Comentários & Orientações Pedagógicas
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                          placeholder="Descreva pontos fortes da metodologia, rigor dos dados e recomendações para o avanço da pesquisa..."
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setActiveProject(null)}
                          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 font-semibold transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all cursor-pointer shadow-sm active:scale-98"
                        >
                          Emitir Parecer Oficial
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
