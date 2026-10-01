import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  ChevronRight,
  Type,
  Megaphone,
  CircleDot,
  Eraser,
  Download,
  Upload,
  Image as ImageIcon,
  Database,
} from "lucide-react";
import { useData } from "@/compartilhado/hooks/useData";
import { useSound } from "@/compartilhado/hooks/useSound";
import { DEFAULT_CONFIG } from "@/compartilhado/contextos/data-context";
import type { FAQItem, SiteConfig } from "@/compartilhado/contextos/data-context";
import { MediaLibraryModal } from "../componentes/MediaLibraryModal";
import {
  ESQUEMA_DO_EDITOR,
  TOTAL_DE_CAMPOS,
  type Campo,
  type ChaveDeTexto,
  type PaginaDoEditor,
} from "../esquema-do-editor";

const FONTES = [
  { id: "Inter", nome: "Inter", desc: "Neutra, legível e elegante" },
  { id: "Outfit", nome: "Outfit", desc: "Geométrica e futurista" },
  { id: "Plus Jakarta Sans", nome: "Plus Jakarta Sans", desc: "Visual de software" },
  { id: "Space Grotesk", nome: "Space Grotesk", desc: "Científica e experimental" },
  { id: "Syne", nome: "Syne", desc: "Expressiva, para títulos" },
  { id: "Poppins", nome: "Poppins", desc: "Amigável e arredondada" },
  { id: "Cinzel", nome: "Cinzel", desc: "Clássica e solene" },
];

type Formulario = Record<string, string>;

const CHAVES = Array.from(
  new Set(
    ESQUEMA_DO_EDITOR.flatMap((pagina) =>
      pagina.blocos.flatMap((bloco) => bloco.campos.map((c) => c.chave))
    )
  )
) as ChaveDeTexto[];

function montarFormulario(config: SiteConfig): Formulario {
  const inicial: Formulario = {};
  for (const chave of CHAVES) {
    inicial[chave] =
      (config[chave] as string | undefined) ??
      ((DEFAULT_CONFIG[chave] as string | undefined) || "");
  }
  inicial.fontFamily = config.fontFamily || DEFAULT_CONFIG.fontFamily || "Inter";
  inicial.announcementText = config.announcementText ?? DEFAULT_CONFIG.announcementText ?? "";
  return inicial;
}

interface AdminSiteEditorTabProps {
  paginaInicial?: string;
}

export function AdminSiteEditorTab({ paginaInicial }: AdminSiteEditorTabProps = {}) {
  const { siteConfig, updateSiteConfig } = useData();
  const { playSound } = useSound();

  const [paginaAtiva, setPaginaAtiva] = useState<string>(
    () =>
      (paginaInicial && ESQUEMA_DO_EDITOR.some((p) => p.id === paginaInicial)
        ? paginaInicial
        : undefined) ?? ESQUEMA_DO_EDITOR[0].id
  );
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Formulario>(() => montarFormulario(siteConfig));
  const [faqs, setFaqs] = useState<FAQItem[]>(() =>
    siteConfig.faqs?.length ? siteConfig.faqs : DEFAULT_CONFIG.faqs || []
  );
  const [avisoAtivo, setAvisoAtivo] = useState<boolean>(Boolean(siteConfig.announcementActive));
  const [estado, setEstado] = useState<"parado" | "salvando" | "salvo">("parado");
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Alterações salvas");

  const [midiaModalAberta, setMidiaModalAberta] = useState(false);
  const [campoDeMidiaAtivo, setCampoDeMidiaAtivo] = useState<Campo | null>(null);
  const [usoArmazenamento, setUsoArmazenamento] = useState<{ kb: number; pct: number }>({
    kb: 0,
    pct: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sujoRef = useRef(false);
  const formRef = useRef(form);
  formRef.current = form;
  const avisoRef = useRef(avisoAtivo);
  avisoRef.current = avisoAtivo;
  const faqsRef = useRef(faqs);
  faqsRef.current = faqs;

  const gravar = useCallback(() => {
    updateSiteConfig({
      ...(formRef.current as Partial<SiteConfig>),
      faqs: faqsRef.current,
      announcementActive: avisoRef.current,
    });
  }, [updateSiteConfig]);

  useEffect(() => {
    if (!sujoRef.current) return;
    setEstado("salvando");
    const t = setTimeout(() => {
      gravar();
      setEstado("salvo");
    }, 600);
    return () => clearTimeout(t);
  }, [form, faqs, avisoAtivo, gravar]);

  useEffect(() => {
    const aoSair = () => {
      if (sujoRef.current) gravar();
    };
    window.addEventListener("beforeunload", aoSair);
    return () => {
      window.removeEventListener("beforeunload", aoSair);
      if (sujoRef.current) gravar();
    };
  }, [gravar]);

  const mudar = (chave: string, valor: string) => {
    sujoRef.current = true;
    setForm((prev) => ({ ...prev, [chave]: valor }));
  };

  const alterado = useCallback(
    (chave: string) => {
      const padrao = (DEFAULT_CONFIG[chave as keyof SiteConfig] as string) || "";
      return (form[chave] || "") !== padrao;
    },
    [form]
  );

  const devolverPadrao = (chave: string) => {
    playSound("subtle-click");
    mudar(chave, (DEFAULT_CONFIG[chave as keyof SiteConfig] as string) || "");
  };

  const salvarTudo = () => {
    playSound("pop-bubble");
    gravar();
    sujoRef.current = false;
    setEstado("salvo");
    setToastMsg("Alterações salvas com sucesso");
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const restaurarTudo = () => {
    if (
      !confirm(
        "Isto devolve TODOS os textos, fontes e mídias do site ao original de fábrica. Deseja continuar?"
      )
    )
      return;
    playSound("pop-bubble");
    setForm(montarFormulario(DEFAULT_CONFIG));
    setFaqs(DEFAULT_CONFIG.faqs || []);
    setAvisoAtivo(Boolean(DEFAULT_CONFIG.announcementActive));
    updateSiteConfig(DEFAULT_CONFIG);
    setToastMsg("Configuração restaurada ao padrão");
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  useEffect(() => {
    try {
      let total = 0;
      for (const k in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, k)) {
          total += (localStorage[k].length + k.length) * 2;
        }
      }
      const kb = Math.round(total / 1024);
      const pct = Math.min(100, Math.round((total / (5 * 1024 * 1024)) * 100));
      setUsoArmazenamento({ kb, pct });
    } catch {}
  }, [form, faqs, avisoAtivo]);

  const exportarBackup = () => {
    playSound("pop-bubble");
    const dados = {
      formato: "ceclos-site-config-v16",
      geradoEm: new Date().toISOString(),
      config: formRef.current,
      faqs: faqsRef.current,
      announcementActive: avisoRef.current,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-ceclos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMsg("Backup JSON exportado com sucesso");
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const importarBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = (evento) => {
      try {
        const conteudo = JSON.parse(evento.target?.result as string);
        if (conteudo && typeof conteudo === "object") {
          const novaConfig = conteudo.config || conteudo;
          playSound("pop-bubble");
          sujoRef.current = true;
          setForm((prev) => ({ ...prev, ...novaConfig }));
          if (Array.isArray(conteudo.faqs)) {
            setFaqs(conteudo.faqs);
          }
          if (typeof conteudo.announcementActive === "boolean") {
            setAvisoAtivo(conteudo.announcementActive);
          }
          updateSiteConfig({
            ...novaConfig,
            ...(conteudo.faqs ? { faqs: conteudo.faqs } : {}),
            ...(typeof conteudo.announcementActive === "boolean"
              ? { announcementActive: conteudo.announcementActive }
              : {}),
          });
          setToastMsg("Backup importado com sucesso");
          setToast(true);
          setTimeout(() => setToast(false), 2500);
        }
      } catch {
        alert("Erro ao ler o arquivo de backup JSON.");
      }
    };
    reader.readAsText(arquivo);
    e.target.value = "";
  };

  const abrirModalDeMidia = (campo: Campo) => {
    playSound("subtle-click");
    setCampoDeMidiaAtivo(campo);
    setMidiaModalAberta(true);
  };

  const termo = busca.trim().toLowerCase();

  const resultados = useMemo(() => {
    if (!termo) return null;
    const achados: { pagina: PaginaDoEditor; campo: Campo }[] = [];
    for (const pagina of ESQUEMA_DO_EDITOR) {
      for (const bloco of pagina.blocos) {
        for (const campo of bloco.campos) {
          const alvo = `${campo.rotulo} ${bloco.titulo} ${pagina.rotulo} ${
            form[campo.chave] || ""
          }`.toLowerCase();
          if (alvo.includes(termo)) achados.push({ pagina, campo });
        }
      }
    }
    return achados;
  }, [termo, form]);

  const pagina = ESQUEMA_DO_EDITOR.find((p) => p.id === paginaAtiva) || ESQUEMA_DO_EDITOR[0];

  const mexidosPorPagina = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const p of ESQUEMA_DO_EDITOR) {
      mapa[p.id] = p.blocos.reduce(
        (s, b) => s + b.campos.filter((c) => alterado(c.chave)).length,
        0
      );
    }
    return mapa;
  }, [alterado]);

  const totalMexido = Object.values(mexidosPorPagina).reduce((a, b) => a + b, 0);

  const addFaq = () => {
    playSound("subtle-click");
    sujoRef.current = true;
    setFaqs((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: "Nova pergunta",
        answer: "Resposta da nova pergunta...",
      },
    ]);
  };

  const editarFaq = (id: string, campo: "question" | "answer", v: string) => {
    sujoRef.current = true;
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: v } : f)));
  };

  const apagarFaq = (id: string) => {
    playSound("subtle-click");
    sujoRef.current = true;
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="fixed right-5 top-5 z-[100] flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-[#13201a] px-3.5 py-2 text-xs font-bold text-emerald-300 shadow-2xl"
          >
            <Check className="h-4 w-4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-white/[0.08] bg-[#121110] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="flex flex-wrap items-center gap-2 text-base font-bold text-white">
              <span>Editor do Site</span>
              <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-300">
                {TOTAL_DE_CAMPOS} campos
              </span>
              {totalMexido > 0 && (
                <span className="rounded-md border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[11px] font-medium text-sky-300">
                  {totalMexido} alterado{totalMexido > 1 ? "s" : ""}
                </span>
              )}
            </h3>
            <p className="mt-0.5 text-xs text-stone-400">
              Tudo o que está escrito no site, organizado por onde aparece. Guarda sozinho enquanto
              você digita.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span
              className={`hidden items-center gap-1.5 font-mono text-[11px] sm:flex ${
                estado === "salvando"
                  ? "text-amber-300"
                  : estado === "salvo"
                    ? "text-emerald-400"
                    : "text-stone-500"
              }`}
            >
              <CircleDot
                className={`h-3 w-3 ${
                  estado === "salvando"
                    ? "animate-spin text-amber-400"
                    : estado === "salvo"
                      ? "text-emerald-400"
                      : "text-stone-500"
                }`}
              />
              {estado === "salvando"
                ? "salvando..."
                : estado === "salvo"
                  ? "sincronizado"
                  : "sem alterações"}
            </span>

            <div
              title={`Armazenamento seguro local: ${usoArmazenamento.kb} KB utilizados (${usoArmazenamento.pct}% da cota)`}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] text-stone-400"
            >
              <Database className="h-3 w-3 text-stone-500" />
              <span>{usoArmazenamento.kb} KB</span>
            </div>

            <button
              type="button"
              onClick={exportarBackup}
              title="Exportar cópia de segurança em arquivo JSON"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-stone-300 transition-colors hover:border-amber-400/40 hover:text-amber-300 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Exportar JSON</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importarBackup}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Restaurar cópia de segurança a partir de um arquivo JSON"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-stone-300 transition-colors hover:border-amber-400/40 hover:text-amber-300 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Importar JSON</span>
            </button>

            <button
              type="button"
              onClick={restaurarTudo}
              title="Voltar tudo ao original de fábrica"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-stone-300 transition-colors hover:border-rose-400/40 hover:text-rose-300 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>

            <button
              type="button"
              onClick={salvarTudo}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-300 cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.2)] active:scale-95"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Salvar</span>
            </button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar um campo em todo o site — por nome ou pelo texto escrito nele"
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-9 text-xs text-white placeholder-stone-600 transition-colors focus:border-amber-400/50 focus:outline-none"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {resultados ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#121110] p-4 sm:p-5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-stone-500">
            {resultados.length} campo{resultados.length === 1 ? "" : "s"} encontrado
            {resultados.length === 1 ? "" : "s"}
          </p>

          {resultados.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-600">Nada com esse termo.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {resultados.map(({ pagina: pg, campo }) => (
                <CampoDoEditor
                  key={campo.chave}
                  campo={campo}
                  valor={form[campo.chave] || ""}
                  alterado={alterado(campo.chave)}
                  caminho={pg.rotulo}
                  onChange={(v) => mudar(campo.chave, v)}
                  onRestaurar={() => devolverPadrao(campo.chave)}
                  onAbrirBiblioteca={() => abrirModalDeMidia(campo)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="lg:sticky lg:top-20 lg:self-start">
            <div className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {ESQUEMA_DO_EDITOR.map((p) => {
                const Icone = p.icone;
                const ativo = p.id === paginaAtiva;
                const mexidos = mexidosPorPagina[p.id] || 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      playSound("subtle-click");
                      setPaginaAtiva(p.id);
                    }}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer lg:w-full ${
                      ativo
                        ? "border border-amber-400/30 bg-amber-400/15 text-amber-300"
                        : "border border-transparent text-stone-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <Icone
                      className={`h-4 w-4 shrink-0 ${ativo ? "text-amber-400" : "text-stone-500"}`}
                    />
                    <span className="whitespace-nowrap lg:whitespace-normal">{p.rotulo}</span>
                    {mexidos > 0 && (
                      <span
                        title={`${mexidos} campo(s) alterado(s)`}
                        className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={pagina.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-2.5 rounded-2xl border border-white/[0.08] bg-[#121110] px-4 py-3">
                <pagina.icone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white">{pagina.rotulo}</h4>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-400">
                    <ChevronRight className="h-3 w-3 shrink-0 text-stone-600" />
                    {pagina.ondeAparece}
                  </p>
                </div>
              </div>

              {pagina.blocoEspecial === "fonte" && (
                <BlocoDeFonte
                  atual={form.fontFamily}
                  onEscolher={(id) => {
                    playSound("subtle-click");
                    mudar("fontFamily", id);
                  }}
                />
              )}

              {pagina.blocos.map((bloco) => {
                const mexidos = bloco.campos.filter((c) => alterado(c.chave)).length;
                return (
                  <section
                    key={bloco.titulo}
                    className="rounded-2xl border border-white/[0.08] bg-[#121110] p-4 sm:p-5"
                  >
                    <div className="mb-3.5 flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                        {bloco.titulo}
                      </h5>
                      {mexidos > 0 && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                      {bloco.descricao && (
                        <span className="ml-auto hidden text-[11px] text-stone-500 sm:block">
                          {bloco.descricao}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {bloco.campos.map((campo) => (
                        <CampoDoEditor
                          key={campo.chave}
                          campo={campo}
                          valor={form[campo.chave] || ""}
                          alterado={alterado(campo.chave)}
                          onChange={(v) => mudar(campo.chave, v)}
                          onRestaurar={() => devolverPadrao(campo.chave)}
                          onAbrirBiblioteca={() => abrirModalDeMidia(campo)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {pagina.blocoEspecial === "faq" && (
                <BlocoDoFaq
                  faqs={faqs}
                  onAdicionar={addFaq}
                  onEditar={editarFaq}
                  onApagar={apagarFaq}
                />
              )}

              {pagina.blocoEspecial === "aviso" && (
                <BlocoDeAviso
                  ligado={avisoAtivo}
                  texto={form.announcementText || ""}
                  onLigar={(v) => {
                    playSound("subtle-click");
                    sujoRef.current = true;
                    setAvisoAtivo(v);
                  }}
                  onTexto={(v) => mudar("announcementText", v)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {campoDeMidiaAtivo && (
        <MediaLibraryModal
          isOpen={midiaModalAberta}
          onClose={() => {
            setMidiaModalAberta(false);
            setCampoDeMidiaAtivo(null);
          }}
          currentValue={form[campoDeMidiaAtivo.chave] || ""}
          fieldLabel={campoDeMidiaAtivo.rotulo}
          onSelect={(caminhoEscolhido) => {
            mudar(campoDeMidiaAtivo.chave, caminhoEscolhido);
          }}
        />
      )}
    </div>
  );
}

function CampoDoEditor({
  campo,
  valor,
  alterado,
  caminho,
  onChange,
  onRestaurar,
  onAbrirBiblioteca,
}: {
  campo: Campo;
  valor: string;
  alterado: boolean;
  caminho?: string;
  onChange: (v: string) => void;
  onRestaurar: () => void;
  onAbrirBiblioteca?: () => void;
}) {
  const longo = campo.tipo === "paragrafo";
  const ehLista = campo.tipo === "lista";
  const ehImagem = campo.tipo === "imagem";
  const ehEscolha = campo.tipo === "escolha";

  const classeBase =
    "w-full rounded-xl border bg-black/40 px-3 py-2 text-xs text-white placeholder-stone-600 transition-colors focus:outline-none " +
    (alterado
      ? "border-sky-400/30 focus:border-sky-400/70"
      : "border-white/10 focus:border-amber-400/50");

  const itensLista = useMemo(
    () =>
      ehLista && valor
        ? valor
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
    [ehLista, valor]
  );

  return (
    <div className={campo.inteiro || longo || ehLista || ehImagem ? "sm:col-span-2" : ""}>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-[11px] font-semibold text-stone-300">{campo.rotulo}</label>

        {caminho && (
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10.5px] text-stone-500">
            {caminho}
          </span>
        )}

        {alterado && (
          <button
            type="button"
            onClick={onRestaurar}
            title="Voltar ao texto original"
            className="ml-auto flex items-center gap-1 font-mono text-[10.5px] text-stone-500 transition-colors hover:text-amber-300 cursor-pointer"
          >
            <Eraser className="h-2.5 w-2.5" />
            original
          </button>
        )}
      </div>

      {ehImagem ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={valor}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/emblemas/Logo Inicio.png ou https://..."
              className={`${classeBase} flex-1 font-mono`}
            />
            {onAbrirBiblioteca && (
              <button
                type="button"
                onClick={onAbrirBiblioteca}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20 cursor-pointer"
                title="Abrir biblioteca de mídias"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Biblioteca</span>
              </button>
            )}
          </div>

          {valor && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-2">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/60 p-1 flex items-center justify-center">
                <img
                  src={valor}
                  alt=""
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs text-white">{valor}</p>
                <p className="text-[10px] text-stone-400">Prévia do recurso visual</p>
              </div>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-white/10 hover:text-rose-400 transition-colors cursor-pointer"
                title="Remover imagem"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : ehLista ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-mono text-stone-400">
              {itensLista.length}{" "}
              {itensLista.length === 1 ? "item configurado" : "itens configurados"}
            </span>
            <span className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-amber-300 border border-amber-400/20">
              1 item por linha
            </span>
          </div>
          <textarea
            rows={4}
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite um item por linha..."
            className={`${classeBase} font-mono resize-y leading-relaxed`}
          />
        </div>
      ) : longo ? (
        <textarea
          rows={3}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={`${classeBase} resize-y leading-relaxed`}
        />
      ) : ehEscolha ? (
        <select
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={`${classeBase} cursor-pointer appearance-none bg-[right_0.6rem_center] bg-no-repeat pr-8`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2378716c' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E\")",
            backgroundSize: "12px 8px",
          }}
        >
          {(campo.opcoes ?? []).map((o) => (
            <option key={o.valor} value={o.valor} className="bg-[#14120f]">
              {o.rotulo}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={campo.tipo === "url" ? "url" : "text"}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={classeBase}
        />
      )}

      {campo.dica && <p className="mt-1 text-[10px] leading-snug text-stone-600">{campo.dica}</p>}
    </div>
  );
}

function BlocoDeFonte({ atual, onEscolher }: { atual: string; onEscolher: (id: string) => void }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#121110] p-4 sm:p-5">
      <div className="mb-3.5 flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
        <Type className="h-3.5 w-3.5 text-amber-400" />
        <h5 className="text-xs font-bold uppercase tracking-wider text-stone-200">Fonte do site</h5>
        <span className="ml-auto hidden text-[11px] text-stone-500 sm:block">
          Vale para todos os textos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {FONTES.map((f) => {
          const ativa = atual === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onEscolher(f.id)}
              className={`rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                ativa
                  ? "border-amber-400/50 bg-amber-400/10"
                  : "border-white/10 bg-black/30 hover:border-white/20"
              }`}
            >
              <span
                className={`block text-sm font-bold ${ativa ? "text-amber-200" : "text-white"}`}
                style={{ fontFamily: `"${f.id}", sans-serif` }}
              >
                {f.nome}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-stone-500">{f.desc}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BlocoDoFaq({
  faqs,
  onAdicionar,
  onEditar,
  onApagar,
}: {
  faqs: FAQItem[];
  onAdicionar: () => void;
  onEditar: (id: string, campo: "question" | "answer", v: string) => void;
  onApagar: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#121110] p-4 sm:p-5">
      <div className="mb-3.5 flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
        <h5 className="text-xs font-bold uppercase tracking-wider text-stone-200">As perguntas</h5>
        <span className="font-mono text-[11px] text-stone-500">{faqs.length}</span>
        <button
          type="button"
          onClick={onAdicionar}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition-colors hover:bg-amber-400/20 cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          Nova pergunta
        </button>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, i) => (
          <div key={faq.id} className="rounded-xl border border-white/[0.07] bg-black/30 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-[10px] text-stone-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => onEditar(faq.id, "question", e.target.value)}
                placeholder="A pergunta"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors focus:border-amber-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onApagar(faq.id)}
                title="Apagar pergunta"
                className="shrink-0 rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-rose-500/15 hover:text-rose-400 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <textarea
              rows={2}
              value={faq.answer}
              onChange={(e) => onEditar(faq.id, "answer", e.target.value)}
              placeholder="A resposta"
              className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs leading-relaxed text-stone-300 transition-colors focus:border-amber-400/50 focus:outline-none"
            />
          </div>
        ))}

        {faqs.length === 0 && (
          <p className="py-8 text-center text-xs text-stone-600">Nenhuma pergunta ainda.</p>
        )}
      </div>
    </section>
  );
}

function BlocoDeAviso({
  ligado,
  texto,
  onLigar,
  onTexto,
}: {
  ligado: boolean;
  texto: string;
  onLigar: (v: boolean) => void;
  onTexto: (v: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#121110] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="min-w-0">
          <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-200">
            <Megaphone className="h-3.5 w-3.5 text-amber-400" />
            Faixa de aviso
          </h5>
          <p className="mt-1 text-[11px] leading-snug text-stone-500">
            Uma tarja fina no topo do site, para recados curtos e temporários. Quem fecha só volta a
            ver quando o texto mudar.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={ligado}
          aria-label="Ligar ou desligar a faixa de aviso"
          onClick={() => onLigar(!ligado)}
          className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            ligado ? "bg-amber-400" : "bg-white/10"
          }`}
        >
          <span
            className={`inline-block h-4.5 w-4.5 transform rounded-full bg-stone-950 transition-transform ${
              ligado ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="pt-3.5">
        <label className="mb-1 block text-[11px] font-semibold text-stone-300">O recado</label>
        <textarea
          rows={2}
          value={texto}
          onChange={(e) => onTexto(e.target.value)}
          placeholder="Ex.: Inscrições abertas até 30 de março!"
          className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs leading-relaxed text-white placeholder-stone-600 transition-colors focus:border-amber-400/50 focus:outline-none"
        />
        <p className="mt-1 text-[10px] text-stone-600">
          A faixa só aparece com a chave ligada E com texto escrito.
        </p>
      </div>
    </section>
  );
}
