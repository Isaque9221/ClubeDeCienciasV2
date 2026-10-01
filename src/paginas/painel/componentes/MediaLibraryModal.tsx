import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Image as ImageIcon, ExternalLink, Check, Sparkles } from "lucide-react";
import { MEDIA_ASSETS } from "./media-assets";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  currentValue?: string;
  fieldLabel?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentValue = "",
  fieldLabel = "Imagem",
}: MediaLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<"todas" | "logos" | "membros" | "outros">("todas");
  const [customUrl, setCustomUrl] = useState("");

  const itensFiltrados = useMemo(() => {
    return MEDIA_ASSETS.filter((item) => {
      const matchCat = categoria === "todas" || item.category === categoria;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, categoria]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121110] shadow-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-white/10 bg-[#171615]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Biblioteca de Mídias</span>
                    <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-300">
                      {fieldLabel}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Selecione um arquivo local do site ou insira uma URL personalizada.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Ou digite/cole aqui um link externo de imagem (ex: https://... ou /meu-arquivo.png)"
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-stone-600 focus:border-amber-400/60 focus:outline-none"
              />
              <button
                type="button"
                disabled={!customUrl.trim()}
                onClick={() => {
                  if (customUrl.trim()) {
                    onSelect(customUrl.trim());
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Usar Link</span>
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filtrar por nome do arquivo ou pessoa..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-xs text-white placeholder-stone-600 focus:border-amber-400/50 focus:outline-none"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { id: "todas", label: "Todas" },
                    { id: "logos", label: "Logos & Selos" },
                    { id: "membros", label: "Membros" },
                    { id: "outros", label: "Outros" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoria(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      categoria === cat.id
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        : "bg-white/[0.04] text-stone-400 hover:text-stone-200 border border-transparent"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {itensFiltrados.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs">
                Nenhuma imagem encontrada com esse termo de busca.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {itensFiltrados.map((item) => {
                  const isSelected = currentValue === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        onSelect(item.path);
                        onClose();
                      }}
                      className={`group relative flex flex-col rounded-xl border p-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                          : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center p-2">
                        <img
                          src={item.path}
                          alt={item.label}
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="mt-2 min-w-0">
                        <p className="truncate text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </p>
                        <p className="truncate text-[10px] text-stone-400">{item.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/10 bg-[#171615] flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Dica: você também pode usar links de imagens externas hospedadas na web.</span>
            </span>
            <span className="font-mono text-stone-500">{itensFiltrados.length} disponíveis</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
