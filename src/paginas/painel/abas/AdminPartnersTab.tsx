import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Search, X, Building2 } from "lucide-react";
import { useData } from "@/compartilhado/hooks/useData";
import { useSound } from "@/compartilhado/hooks/useSound";
import type { Partner } from "@/compartilhado/tipos/partner.types";
import { LogoDoParceiro } from "@/compartilhado/componentes/LogoDoParceiro";

export function AdminPartnersTab() {
  const { partners, addPartner, updatePartner, deletePartner } = useData();
  const { playSound } = useSound();

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [formData, setFormData] = useState<Omit<Partner, "id">>({
    name: "",
    fullName: "",
    category: "Fomento à Pesquisa",
    type: "Federal",
    color: "#F59E0B",
    desc: "",
    logo: "",
  });

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      selectedType === "all" || p.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    playSound("subtle-click");
    setEditingPartner(null);
    setFormData({
      name: "",
      fullName: "",
      category: "Fomento à Pesquisa",
      type: "Federal",
      color: "#F59E0B",
      desc: "",
      logo: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Partner) => {
    playSound("subtle-click");
    setEditingPartner(p);
    setFormData({
      name: p.name,
      fullName: p.fullName,
      category: p.category,
      type: p.type,
      color: p.color,
      desc: p.desc,
      logo: p.logo,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound("pop-bubble");
    if (editingPartner) {
      updatePartner(editingPartner.id, formData);
    } else {
      addPartner(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o parceiro "${name}"?`)) {
      playSound("subtle-click");
      deletePartner(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121216] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Parcerias & Fomento Científico</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-stone-300">
              {partners.length}
            </span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Instituições governamentais, universidades e agências parceiras do CECLOS.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Parceria</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por sigla, nome ou categoria..."
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

        <div className="flex items-center gap-1.5 bg-[#141419] p-1 rounded-xl border border-white/[0.08] w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "Todos" },
            { id: "federal", label: "Federal" },
            { id: "estadual", label: "Estadual" },
            { id: "laboratório", label: "Laboratórios" },
          ].map((type) => {
            const isSel = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  setSelectedType(type.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSel
                    ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                    : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <AnimatePresence>
          {filteredPartners.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-2xl border border-white/[0.08] bg-[#141419] p-4 sm:p-5 space-y-3 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl border border-white/[0.1] bg-[#0E0E12] flex items-center justify-center p-2 shrink-0">
                      {p.logo ? (
                        <LogoDoParceiro
                          partner={p}
                          alt={p.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-amber-400" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-stone-400 bg-white/5 border-white/10">
                          {p.type}
                        </span>
                      </h4>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    {p.category}
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">{p.desc}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-amber-400/30 text-stone-300 hover:text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-1.5 rounded-lg border border-white/[0.08] hover:border-rose-500/30 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Excluir parceiro"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/[0.08] rounded-2xl p-6 bg-white/[0.01]">
          <Building2 className="h-8 w-8 text-stone-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-300">Nenhum parceiro encontrado</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Tente ajustar a busca ou o tipo selecionado.
          </p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#141419] p-6 text-stone-100 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingPartner ? "Editar Parceria" : "Nova Parceria Institucional"}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Preencha os dados da instituição fomentadora.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Sigla / Nome Curto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                    placeholder="Ex: FAPESB, IFBA, SEC-BA"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Nome Completo da Instituição
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                    placeholder="Ex: Fundação de Amparo à Pesquisa do Estado da Bahia"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">
                      Esfera / Âmbito
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs cursor-pointer"
                    >
                      <option value="Federal">Federal</option>
                      <option value="Estadual">Estadual</option>
                      <option value="Municipal">Municipal</option>
                      <option value="Laboratório">Laboratório / Centro</option>
                      <option value="Privada">Iniciativa Privada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">
                      Categoria de Apoio
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                      placeholder="Ex: Fomento à Pesquisa"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    URL ou Caminho do Logo (SVG / PNG)
                  </label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                    placeholder="Ex: /partners/fapesb.svg ou link HTTPS..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">
                    Descrição do Apoio / Papel da Parceria
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-white focus:border-amber-400 focus:outline-none text-xs"
                    placeholder="Descreva como a instituição apoia bolsas, infraestrutura ou mentoria..."
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
                    {editingPartner ? "Salvar Alterações" : "Cadastrar Parceiro"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
