import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Search,
  Trash2,
  Edit2,
  Users,
  X,
  Copy,
  Check,
  ImageIcon,
  LayoutGrid,
  List,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Hash,
  RotateCcw,
  ArrowUpDown,
  Info,
} from "lucide-react";
import { useData } from "@/compartilhado/hooks/useData";
import { useSound } from "@/compartilhado/hooks/useSound";
import type { Member, MemberCategory } from "@/compartilhado/tipos/member.types";

export function AdminMembersTab() {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    reorderMembers,
    moveMember,
    renumberMembers,
    resetMembers,
  } = useData();
  const { playSound } = useSound();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [dragOverMemberId, setDragOverMemberId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after">("before");

  const [movingMember, setMovingMember] = useState<Member | null>(null);
  const [targetPositionInput, setTargetPositionInput] = useState<string>("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    if (isModalOpen || movingMember) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, movingMember]);

  const [formData, setFormData] = useState<Omit<Member, "id">>({
    name: "",
    role: "",
    area: "",
    image: "",
    imagePosition: "object-[center_20%]",
    iconName: "FlaskConical",
    color: "#F59E0B",
    quote: "",
    tag: "Pesquisador · CECLOS 2026",
    category: "biotec_quimica",
    num: "01",
  });

  const filteredMembers = members.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.area.toLowerCase().includes(search.toLowerCase()) ||
      m.tag.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenAdd = () => {
    playSound("subtle-click");
    setEditingMember(null);
    setFormData({
      name: "",
      role: "Pesquisador Jr.",
      area: "Iniciação Científica",
      image: "",
      imagePosition: "object-[center_20%]",
      iconName: "FlaskConical",
      color: "#F59E0B",
      quote: "Explorando os mistérios da ciência no semiárido.",
      tag: "Pesquisador · CECLOS 2026",
      category: "biotec_quimica",
      num: String(members.length + 1).padStart(2, "0"),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    playSound("subtle-click");
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      area: member.area,
      image: member.image,
      imagePosition: member.imagePosition || "object-[center_20%]",
      iconName: member.iconName,
      color: member.color,
      quote: member.quote,
      tag: member.tag,
      category: member.category,
      num: member.num,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound("pop-bubble");
    if (editingMember) {
      updateMember(editingMember.id, formData);
      showToast(`Alterações de ${formData.name} salvas!`);
    } else {
      addMember(formData);
      showToast(`${formData.name} cadastrado com sucesso!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover ${name} do sistema?`)) {
      playSound("subtle-click");
      deleteMember(id);
      showToast(`${name} removido do sistema.`);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    playSound("pop-bubble");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedMemberId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    playSound("subtle-click");
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedMemberId || draggedMemberId === targetId) return;

    const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isGrid = viewMode === "grid";

    let isBefore = false;
    if (isGrid) {
      const midpointX = targetRect.left + targetRect.width / 2;
      isBefore = e.clientX < midpointX;
    } else {
      const midpointY = targetRect.top + targetRect.height / 2;
      isBefore = e.clientY < midpointY;
    }

    setDragOverMemberId(targetId);
    setDropPosition(isBefore ? "before" : "after");
  };

  const handleDragLeave = () => {};

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedMemberId || draggedMemberId === targetId) {
      setDraggedMemberId(null);
      setDragOverMemberId(null);
      return;
    }

    const fromIndex = members.findIndex((m) => m.id === draggedMemberId);
    if (fromIndex === -1) return;

    const updated = [...members];
    const [movedItem] = updated.splice(fromIndex, 1);

    let targetIndex = updated.findIndex((m) => m.id === targetId);
    if (dropPosition === "after") {
      targetIndex += 1;
    }

    updated.splice(targetIndex, 0, movedItem);
    reorderMembers(updated);
    playSound("pop-bubble");
    showToast(`✓ ${movedItem.name} movido para a posição #${targetIndex + 1}!`);

    setDraggedMemberId(null);
    setDragOverMemberId(null);
  };

  const handleDragEnd = () => {
    setDraggedMemberId(null);
    setDragOverMemberId(null);
  };

  const handleOpenMoveModal = (member: Member) => {
    playSound("subtle-click");
    const currentIdx = members.findIndex((m) => m.id === member.id);
    setMovingMember(member);
    setTargetPositionInput(String(currentIdx + 1));
  };

  const handleConfirmMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingMember) return;

    const newPos = parseInt(targetPositionInput, 10);
    if (isNaN(newPos) || newPos < 1 || newPos > members.length) {
      alert(`Por favor, insira uma posição válida entre 1 e ${members.length}.`);
      return;
    }

    const fromIdx = members.findIndex((m) => m.id === movingMember.id);
    const toIdx = newPos - 1;

    if (fromIdx !== -1 && fromIdx !== toIdx) {
      moveMember(fromIdx, toIdx);
      playSound("glass-chime");
      showToast(`✓ ${movingMember.name} colocado na posição #${newPos}!`);
    }

    setMovingMember(null);
  };

  const handleMoveStep = (memberId: string, direction: -1 | 1) => {
    const idx = members.findIndex((m) => m.id === memberId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= members.length) return;

    playSound("subtle-click");
    moveMember(idx, targetIdx);
    const memberName = members[idx].name;
    showToast(`✓ ${memberName} movido para #${targetIdx + 1}`);
  };

  const handleMoveToExtreme = (memberId: string, position: "top" | "bottom") => {
    const idx = members.findIndex((m) => m.id === memberId);
    if (idx === -1) return;
    const targetIdx = position === "top" ? 0 : members.length - 1;
    if (idx === targetIdx) return;

    playSound("glass-chime");
    moveMember(idx, targetIdx);
    const memberName = members[idx].name;
    showToast(
      `✓ ${memberName} movido para o ${position === "top" ? "topo (1º lugar)" : "fim da lista"}!`
    );
  };

  const handleRenumberAll = () => {
    playSound("glass-chime");
    renumberMembers();
    showToast("✓ Todos os IDs (01, 02...) foram renumerados em sequência!");
  };

  const handleResetOrder = () => {
    if (
      confirm(
        "Deseja restaurar a ordem original de fábrica dos estudantes? Suas alterações de ordenação serão redefinidas."
      )
    ) {
      playSound("pop-bubble");
      resetMembers();
      showToast("Ordem dos estudantes restaurada com sucesso!");
    }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-6 right-6 z-[99999] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#181715] border border-amber-400/40 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.25)] text-xs font-semibold"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.08] bg-[#121216]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Membros & Equipe de Pesquisa</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-amber-300 border border-amber-400/20">
              {members.length} Integrantes
            </span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Arraste os cards ou utilize os controles para posicionar como quiser.</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRenumberAll}
            title="Atualiza o código dos cards (01, 02...) seguindo a ordem atual"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-stone-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
          >
            <Hash className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Renumerar IDs</span>
          </button>

          <button
            type="button"
            onClick={handleResetOrder}
            title="Restaura a ordem inicial padrão"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-stone-400 hover:text-stone-200 font-medium text-xs transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Restaurar Ordem</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <UserPlus className="h-4 w-4" />
            <span>Novo Membro</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Filtrar por nome, cargo ou área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-white/[0.08] bg-[#141419] text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400/60 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium bg-[#141419] px-3 py-1.5 rounded-xl border border-white/[0.08]">
            <ArrowUpDown className="h-3 w-3 text-amber-400" />
            <span>{members.length} cards ordenáveis</span>
          </div>

          <div className="flex items-center gap-1 bg-[#141419] p-1 rounded-xl border border-white/[0.08] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white/[0.08] text-white"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white/[0.08] text-white"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title="Visualização em Tabela"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {search && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs">
          <Info className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            Filtro de busca ativo ({filteredMembers.length} resultados). Para reorganizar a lista
            completa por arrastar e soltar, limpe a pesquisa.
          </span>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="ml-auto underline font-bold hover:text-white cursor-pointer shrink-0"
          >
            Limpar busca
          </button>
        </div>
      )}

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMembers.map((member) => {
            const globalIndex = members.findIndex((m) => m.id === member.id);
            const positionNumber = globalIndex + 1;
            const isFirst = globalIndex === 0;
            const isLast = globalIndex === members.length - 1;
            const isBeingDragged = draggedMemberId === member.id;
            const isDragOver = dragOverMemberId === member.id;

            return (
              <div
                key={member.id}
                draggable={!search}
                onDragStart={(e) => handleDragStart(e, member.id)}
                onDragOver={(e) => handleDragOver(e, member.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, member.id)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-2xl border transition-all flex flex-col justify-between p-4 space-y-3 bg-[#141419] select-none ${
                  isBeingDragged
                    ? "opacity-30 scale-95 border-dashed border-amber-400"
                    : isDragOver
                      ? dropPosition === "before"
                        ? "border-t-4 border-amber-400 bg-amber-400/5 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                        : "border-b-4 border-amber-400 bg-amber-400/5 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                      : "border-white/[0.08] hover:border-amber-400/40 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06] text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenMoveModal(member)}
                      title={`Posição #${positionNumber} de ${members.length}. Clique para mover para qualquer posição.`}
                      className="group/pos flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 hover:text-amber-200 font-mono font-bold text-[11px] transition-all cursor-pointer"
                    >
                      <Hash className="h-3 w-3 text-amber-400 group-hover/pos:scale-110 transition-transform" />
                      <span>{String(positionNumber).padStart(2, "0")}</span>
                      <span className="text-[10px] text-amber-400/70 ml-0.5 group-hover/pos:text-amber-200">
                        Mover
                      </span>
                    </button>

                    <div className="flex items-center gap-0.5 bg-black/40 rounded-lg p-0.5 border border-white/[0.06]">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveToExtreme(member.id, "top")}
                        title="Mover para o 1º lugar (Início)"
                        className={`p-1 rounded-md transition-colors ${
                          isFirst
                            ? "text-stone-600 cursor-not-allowed"
                            : "text-stone-400 hover:text-amber-300 hover:bg-white/[0.08] cursor-pointer"
                        }`}
                      >
                        <ChevronsUp className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveStep(member.id, -1)}
                        title="Subir 1 posição"
                        className={`p-1 rounded-md transition-colors ${
                          isFirst
                            ? "text-stone-600 cursor-not-allowed"
                            : "text-stone-400 hover:text-amber-300 hover:bg-white/[0.08] cursor-pointer"
                        }`}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveStep(member.id, 1)}
                        title="Descer 1 posição"
                        className={`p-1 rounded-md transition-colors ${
                          isLast
                            ? "text-stone-600 cursor-not-allowed"
                            : "text-stone-400 hover:text-amber-300 hover:bg-white/[0.08] cursor-pointer"
                        }`}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveToExtreme(member.id, "bottom")}
                        title="Mover para o último lugar"
                        className={`p-1 rounded-md transition-colors ${
                          isLast
                            ? "text-stone-600 cursor-not-allowed"
                            : "text-stone-400 hover:text-amber-300 hover:bg-white/[0.08] cursor-pointer"
                        }`}
                      >
                        <ChevronsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div
                      title="Clique e arraste para reposicionar o card"
                      className="flex items-center gap-1 text-stone-500 hover:text-amber-400 px-1.5 py-1 rounded-md hover:bg-white/[0.04] transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/[0.1] bg-stone-900 shrink-0">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`h-full w-full object-cover ${
                            member.imagePosition || "object-[center_20%]"
                          }`}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-sm text-stone-400 bg-stone-800">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{member.name}</h4>
                      <p className="text-[11px] text-stone-400 truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1 text-xs">
                    <p className="text-[11px] text-stone-300 truncate">
                      <span className="text-stone-500 font-medium">Área: </span>
                      {member.area || <span className="italic text-stone-600">não preenchida</span>}
                    </p>
                    {member.quote && (
                      <p className="text-[11px] text-stone-400 italic truncate">"{member.quote}"</p>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-stone-500 font-mono truncate max-w-[130px]">
                    {member.tag}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(member.id, `${member.name} - ${member.role}`)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Copiar dados"
                    >
                      {copiedId === member.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-[#141419] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-28">Posição</th>
                  <th className="py-3 px-4">Membro</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4">Área de Pesquisa</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredMembers.map((member) => {
                  const globalIndex = members.findIndex((m) => m.id === member.id);
                  const positionNumber = globalIndex + 1;
                  const isFirst = globalIndex === 0;
                  const isLast = globalIndex === members.length - 1;
                  const isBeingDragged = draggedMemberId === member.id;
                  const isDragOver = dragOverMemberId === member.id;

                  return (
                    <tr
                      key={member.id}
                      draggable={!search}
                      onDragStart={(e) => handleDragStart(e, member.id)}
                      onDragOver={(e) => handleDragOver(e, member.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, member.id)}
                      onDragEnd={handleDragEnd}
                      className={`hover:bg-white/[0.02] transition-colors select-none ${
                        isBeingDragged
                          ? "opacity-30 bg-amber-400/5"
                          : isDragOver
                            ? dropPosition === "before"
                              ? "border-t-2 border-amber-400 bg-amber-400/10"
                              : "border-b-2 border-amber-400 bg-amber-400/10"
                            : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            title="Arrastar linha para reordenar"
                            className="cursor-grab active:cursor-grabbing text-stone-500 hover:text-amber-400 p-0.5"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenMoveModal(member)}
                            title={`Posição #${positionNumber}. Clique para alterar.`}
                            className="px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 cursor-pointer"
                          >
                            #{String(positionNumber).padStart(2, "0")}
                          </button>

                          <div className="flex items-center">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveStep(member.id, -1)}
                              title="Subir"
                              className={`p-1 ${
                                isFirst
                                  ? "text-stone-600"
                                  : "text-stone-400 hover:text-white cursor-pointer"
                              }`}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveStep(member.id, 1)}
                              title="Descer"
                              className={`p-1 ${
                                isLast
                                  ? "text-stone-600"
                                  : "text-stone-400 hover:text-white cursor-pointer"
                              }`}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/[0.1] bg-stone-900 shrink-0">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className={`h-full w-full object-cover ${
                                member.imagePosition || "object-[center_20%]"
                              }`}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-xs text-stone-400">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-white truncate max-w-[150px]">
                          {member.name}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-300 font-medium">{member.role}</td>

                      <td className="py-3 px-4 text-stone-400 truncate max-w-[200px]">
                        {member.area}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(member.id, member.name)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/[0.08] rounded-2xl p-6 bg-white/[0.01]">
          <Users className="h-8 w-8 text-stone-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-300">Nenhum membro encontrado</p>
          <p className="text-xs text-stone-500 mt-0.5">Tente ajustar o termo de pesquisa.</p>
        </div>
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {movingMember && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden"
                onClick={() => setMovingMember(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-[#141419] text-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#181820]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Mover Card de Estudante</h3>
                        <p className="text-[11px] text-stone-400">
                          Defina a posição exata de exibição no site.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMovingMember(null)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleConfirmMove} className="p-6 space-y-5 text-xs">
                    <div className="flex items-center gap-3.5 bg-[#0E0E12] p-3.5 rounded-2xl border border-white/[0.08]">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/[0.1] bg-stone-900 shrink-0">
                        {movingMember.image ? (
                          <img
                            src={movingMember.image}
                            alt={movingMember.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-stone-400 font-bold text-sm">
                            {movingMember.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{movingMember.name}</p>
                        <p className="text-[11px] text-stone-400 truncate">{movingMember.role}</p>
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-mono text-amber-300">
                          Posição atual: #{members.findIndex((m) => m.id === movingMember.id) + 1}{" "}
                          de {members.length}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1.5">
                        Qual posição você deseja colocar este estudante?
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-amber-400">
                          #
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={members.length}
                          required
                          autoFocus
                          value={targetPositionInput}
                          onChange={(e) => setTargetPositionInput(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-amber-400/40 bg-[#0E0E12] text-white text-sm font-mono font-bold focus:outline-none focus:border-amber-400 transition-colors"
                          placeholder={`1 a ${members.length}`}
                        />
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Digite qualquer número entre 1 e {members.length}.
                      </p>
                    </div>

                    <div>
                      <span className="block text-[11px] font-medium text-stone-400 mb-2">
                        Atalhos rápidos de posição:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setTargetPositionInput("1")}
                          className="py-2 px-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-amber-400/10 hover:border-amber-400/30 text-stone-300 hover:text-amber-200 font-semibold text-[11px] transition-all cursor-pointer text-center"
                        >
                          1º (Início)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTargetPositionInput(String(Math.ceil(members.length / 2)))
                          }
                          className="py-2 px-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-amber-400/10 hover:border-amber-400/30 text-stone-300 hover:text-amber-200 font-semibold text-[11px] transition-all cursor-pointer text-center"
                        >
                          #{Math.ceil(members.length / 2)} (Meio)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetPositionInput(String(members.length))}
                          className="py-2 px-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-amber-400/10 hover:border-amber-400/30 text-stone-300 hover:text-amber-200 font-semibold text-[11px] transition-all cursor-pointer text-center"
                        >
                          #{members.length} (Final)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setMovingMember(null)}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 font-semibold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all cursor-pointer shadow-sm active:scale-98 flex items-center gap-1.5"
                      >
                        <Check className="h-4 w-4" />
                        <span>Mover para Posição</span>
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
            {isModalOpen && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
                onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-xl max-h-[90vh] rounded-3xl border border-white/[0.12] bg-[#121216] text-stone-100 shadow-2xl flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#16161C]">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {editingMember ? "Editar Membro" : "Novo Membro da Equipe"}
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Os dados sincronizam automaticamente com a página inicial.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6 space-y-4 text-xs"
                  >
                    <div className="flex items-center gap-3.5 bg-[#0E0E12] p-3 rounded-xl border border-white/[0.08]">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/[0.1] bg-stone-900 shrink-0">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-stone-400 font-bold text-sm">
                            {formData.name.charAt(0) || <ImageIcon className="h-4 w-4" />}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">
                          {formData.name || "Nome Completo"}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">
                          {formData.role || "Função"} · {formData.area || "Área"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                        placeholder="Ex: Maria Eduarda Silva"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Cargo / Função
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                          placeholder="Ex: Pesquisadora Jr."
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-300 mb-1">
                          Categoria Científica
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value as MemberCategory,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs cursor-pointer"
                        >
                          <option value="biotec_quimica">Biotecnologia & Química</option>
                          <option value="astronomia_fisica">Astronomia & Física</option>
                          <option value="tecnologia_robotica">Tecnologia & IA</option>
                          <option value="terra_exatas">Ciências da Terra & Exatas</option>
                          <option value="lideranca">Liderança / Coordenação</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Profissão dos sonhos (alunos) · Área de atuação (professores)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                        placeholder="Ex: Microbiologia da Caatinga"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-stone-300">
                          Caminho ou URL da Foto{" "}
                          <span className="text-amber-400/80 font-normal">(obrigatório)</span>
                        </label>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                          <span>Exemplos:</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, image: "/membros/Victor.png" })
                            }
                            className="text-amber-300 hover:underline cursor-pointer"
                          >
                            Victor
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, image: "/membros/Isaque.jpg" })
                            }
                            className="text-amber-300 hover:underline cursor-pointer"
                          >
                            Isaque
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                        placeholder="Ex: /Victor.png ou link HTTPS..."
                        title="Todo integrante precisa de foto para aparecer no site."
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Citação ou Frase Científica
                      </label>
                      <textarea
                        rows={2}
                        value={formData.quote}
                        onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                        placeholder="Ex: A curiosidade transforma o semiárido."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 font-semibold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all cursor-pointer shadow-sm active:scale-98"
                      >
                        {editingMember ? "Salvar Alterações" : "Cadastrar Membro"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
