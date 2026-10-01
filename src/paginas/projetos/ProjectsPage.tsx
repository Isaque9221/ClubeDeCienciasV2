import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  Search,
  X,
  ArrowUpRight,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Quote,
  FileText,
  Hash,
} from "lucide-react";
import { useSound, useProjects, useData } from "@/compartilhado/hooks";
import {
  CabecalhoDaAba,
  FioDourado,
  GsapTextReveal,
  SectionLabel,
} from "@/compartilhado/componentes";
import type { StudentProject } from "@/compartilhado/tipos/project.types";
import { comQuantidade, montarProjetos } from "./conteudo";
import { EmDesenvolvimento } from "./EmDesenvolvimento";
import { purificarHtml } from "@/seguranca";
import { corLegivel } from "@/compartilhado/utils/cor-legivel";

interface ProjectsPageProps {
  onBack: () => void;
}

const CORES_DO_PILAR: Record<string, { rotulo: string; cor: string }> = {
  tecnologia: { rotulo: "Tecnologia & IoT", cor: "#60A5FA" },
  biotecnologia: { rotulo: "Biotecnologia", cor: "#34D399" },
  investigacao: { rotulo: "Investigação & Campo", cor: "#FBBF24" },
  astronomia: { rotulo: "Astronomia", cor: "#C084FC" },
  geral: { rotulo: "Iniciação Científica", cor: "#FACC15" },
};

function pilarDe(p: string) {
  return CORES_DO_PILAR[p] || CORES_DO_PILAR.geral;
}

export function ProjectsPage({ onBack }: ProjectsPageProps) {
  const { projects } = useProjects();
  const { playSound } = useSound();
  const { siteConfig } = useData();
  const PROJETOS = montarProjetos(siteConfig);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>("todos");
  const [selectedProject, setSelectedProject] = useState<StudentProject | null>(null);

  const artigoRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progressoDeLeitura = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedProject]);

  const idIgnorado = PROJETOS.idIgnorado;
  const validProjects = useMemo(() => {
    return projects.filter((p) => p.id !== idIgnorado);
  }, [projects, idIgnorado]);

  const filteredProjects = useMemo(() => {
    return validProjects.filter((p) => {
      const matchesPillar = selectedPillar === "todos" ? true : p.pillar === selectedPillar;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        (p.studentGrade && p.studentGrade.toLowerCase().includes(q)) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));
      return matchesPillar && matchesSearch;
    });
  }, [validProjects, selectedPillar, searchQuery]);

  const [capa, ...restante] = useMemo(() => {
    const destaque = filteredProjects.find((p) => p.status === "featured");
    if (!destaque) return filteredProjects;
    return [destaque, ...filteredProjects.filter((p) => p.id !== destaque.id)];
  }, [filteredProjects]);

  const ficha = PROJETOS.ficha;
  const emDesenvolvimento = PROJETOS.emDesenvolvimento;

  const abrir = (proj: StudentProject) => {
    playSound("pop-bubble");
    setSelectedProject(proj);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative isolate min-h-screen w-full overflow-x-hidden text-stone-100 font-sans selection:bg-yellow-500/30 selection:text-white"
    >
      <CabecalhoDaAba
        onVoltar={() => {
          if (selectedProject) {
            setSelectedProject(null);
          } else {
            onBack();
          }
        }}
        rotuloVoltar={
          selectedProject
            ? PROJETOS.cabecalho.botaoVoltarAosProjetos
            : PROJETOS.cabecalho.botaoVoltarAoInicio
        }
        marca={PROJETOS.cabecalho.marca}
        titulo={PROJETOS.cabecalho.aba}
        contador={
          emDesenvolvimento.ativo
            ? emDesenvolvimento.etiqueta
            : comQuantidade(PROJETOS.cabecalho.contador, validProjects.length)
        }
      >
        {selectedProject && (
          <motion.div
            style={{ scaleX: progressoDeLeitura }}
            className="h-[2px] origin-left bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500"
          />
        )}
      </CabecalhoDaAba>

      {emDesenvolvimento.ativo ? (
        <EmDesenvolvimento conteudo={emDesenvolvimento} onBack={onBack} />
      ) : (
        <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key="project-view"
              ref={artigoRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-3xl px-3 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-32"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3 sm:pb-4">
                <button
                  type="button"
                  onClick={() => {
                    playSound("subtle-click");
                    setSelectedProject(null);
                  }}
                  className="group inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-yellow-400 transition-colors hover:text-ouro cursor-pointer sm:gap-2 sm:text-xs"
                >
                  <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1 sm:h-4 sm:w-4" />
                  <span>{ficha.voltarParaLista}</span>
                </button>

                <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-stone-500 sm:text-xs">
                  <FileText className="h-3 w-3" />
                  <span className="hidden xs:inline">{ficha.tipoDeDocumento}</span>
                </span>
              </div>

              <header className="space-y-3 pt-6 sm:space-y-5 sm:pt-10">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider sm:px-3 sm:py-1 sm:text-[11px]"
                    style={{
                      borderColor: `${pilarDe(selectedProject.pillar).cor}55`,
                      backgroundColor: `${pilarDe(selectedProject.pillar).cor}14`,
                      color: corLegivel(pilarDe(selectedProject.pillar).cor),
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: pilarDe(selectedProject.pillar).cor,
                      }}
                    />
                    {pilarDe(selectedProject.pillar).rotulo}
                  </span>

                  {selectedProject.status === "featured" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10.5px] font-bold text-amber-300 sm:px-3 sm:py-1 sm:text-[11px]">
                      <Award className="h-3 w-3" /> {ficha.selo}
                    </span>
                  )}
                </div>

                <h1 className="text-xl font-black leading-[1.15] tracking-tight text-white text-balance sm:text-4xl md:text-5xl">
                  {selectedProject.title}
                </h1>

                {selectedProject.summary && (
                  <p className="text-sm leading-relaxed text-stone-300 text-pretty sm:text-lg">
                    {selectedProject.summary}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-white/[0.08] py-3 sm:gap-x-5 sm:py-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-yellow-400/50 bg-black sm:h-11 sm:w-11">
                      {selectedProject.studentImage ? (
                        <img
                          src={selectedProject.studentImage}
                          alt={selectedProject.studentName}
                          className="photo-soft h-full w-full object-cover object-center"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-yellow-300">
                          {selectedProject.studentName.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-400/80 sm:text-[10px]">
                        {ficha.autor}
                      </span>
                      <span className="block truncate text-xs font-bold text-white sm:text-sm">
                        {selectedProject.studentName}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400 sm:text-xs">
                    <GraduationCap className="h-3.5 w-3.5 text-stone-500" />
                    {selectedProject.studentGrade || ficha.serie}
                  </span>

                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400 sm:text-xs">
                    <Calendar className="h-3.5 w-3.5 text-stone-500" />
                    {selectedProject.updatedAt || selectedProject.createdAt}
                  </span>
                </div>
              </header>

              <article className="space-y-8 pt-8 sm:space-y-12 sm:pt-12">
                {selectedProject.methodology && (
                  <section className="space-y-4 sm:space-y-6">
                    <SecaoDoArtigo numero="01" titulo={ficha.metodologia} />

                    <div className="space-y-4 sm:space-y-5">
                      <BlocoDeMetodo
                        rotulo={ficha.problema}
                        texto={selectedProject.methodology.problemStatement}
                      />
                      <BlocoDeMetodo
                        rotulo={ficha.hipotese}
                        texto={selectedProject.methodology.hypothesis}
                      />
                      <BlocoDeMetodo
                        rotulo={ficha.materiais}
                        texto={selectedProject.methodology.materials}
                      />
                      <BlocoDeMetodo
                        rotulo={ficha.resultados}
                        texto={selectedProject.methodology.results}
                        destaque
                      />
                    </div>
                  </section>
                )}

                <section className="space-y-4 sm:space-y-6">
                  <SecaoDoArtigo numero="02" titulo={ficha.textoIntegral} />
                  <div
                    className="prose prose-invert max-w-none text-sm leading-relaxed text-stone-300 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-yellow-100 prose-p:leading-relaxed prose-strong:text-yellow-300 prose-a:text-yellow-400 sm:text-base"
                    dangerouslySetInnerHTML={{
                      __html: purificarHtml(selectedProject.content || ficha.textoIntegralVazio),
                    }}
                  />
                </section>

                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-stone-600" />
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-stone-400 sm:text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedProject.methodology?.references && (
                  <div className="space-y-1.5 border-t border-white/[0.08] pt-5 font-mono text-[11px] text-stone-400 sm:text-xs">
                    <span className="font-bold uppercase tracking-wider text-stone-300">
                      {ficha.referencias}
                    </span>
                    <p className="italic leading-relaxed">
                      {selectedProject.methodology.references}
                    </p>
                  </div>
                )}

                {selectedProject.adminFeedback && (
                  <div className="space-y-2 rounded-2xl border-l-2 border-yellow-400 bg-yellow-400/[0.04] p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ouro sm:text-xs">
                        <Quote className="h-3.5 w-3.5" />
                        {ficha.parecer} {selectedProject.adminFeedback.author}
                      </span>
                      {selectedProject.adminFeedback.badge && (
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300 sm:text-[10px]">
                          {selectedProject.adminFeedback.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs italic leading-relaxed text-stone-300 sm:text-sm">
                      &ldquo;{selectedProject.adminFeedback.comment}&rdquo;
                    </p>
                  </div>
                )}
              </article>

              <div className="pt-10 text-center sm:pt-14">
                <button
                  type="button"
                  onClick={() => {
                    playSound("subtle-click");
                    setSelectedProject(null);
                  }}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-bold text-stone-200 transition-all hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-white active:scale-95 cursor-pointer sm:px-7 sm:py-3 sm:text-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 sm:h-4 sm:w-4" />
                  <span>{ficha.botaoVoltar}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="projects-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <section className="relative overflow-hidden px-3 pb-8 pt-20 sm:px-6 sm:pb-14 sm:pt-36">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.1)_0%,transparent_65%)] blur-3xl" />

                <div className="relative mx-auto max-w-4xl space-y-4 text-center sm:space-y-6">
                  <SectionLabel text={PROJETOS.lista.etiqueta} />

                  <GsapTextReveal
                    text={PROJETOS.lista.titulo}
                    tag="h1"
                    type="mask-up"
                    className="text-[1.7rem] font-black leading-[1.1] tracking-tight text-white text-balance sm:text-5xl md:text-6xl"
                    highlightWords={PROJETOS.lista.palavrasEmDestaque}
                    glowOnView
                  />
                  <FioDourado />

                  <p className="mx-auto max-w-2xl text-xs font-light leading-relaxed text-stone-400 text-pretty sm:text-base">
                    {PROJETOS.lista.subtitulo}
                  </p>

                  <div className="mx-auto max-w-xl pt-1 sm:pt-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                      <input
                        type="search"
                        data-campo-de-busca=""
                        aria-label="Buscar projetos"
                        aria-keyshortcuts="/"
                        enterKeyHint="search"
                        placeholder={PROJETOS.lista.campoDeBusca}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-9 text-base text-white placeholder-stone-400 transition-all focus:border-yellow-400/60 focus:outline-none sm:rounded-2xl sm:py-3 sm:text-sm"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 transition-colors hover:text-white cursor-pointer"
                          aria-label="Limpar busca"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {PROJETOS.filtros.map((filtro) => {
                      const Icone = filtro.icone;
                      const isActive = selectedPillar === filtro.id;
                      return (
                        <button
                          key={filtro.id}
                          type="button"
                          onClick={() => {
                            playSound("subtle-click");
                            setSelectedPillar(filtro.id);
                          }}
                          className={`relative flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors cursor-pointer sm:min-h-[36px] sm:px-4 sm:py-1.5 sm:text-xs ${
                            isActive
                              ? "text-stone-950"
                              : "border border-white/[0.08] bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="filtroDePilar"
                              className="absolute inset-0 rounded-full bg-yellow-400"
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 34,
                              }}
                            />
                          )}
                          <Icone className="relative z-10 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="relative z-10 font-bold">{filtro.rotulo}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="mx-auto max-w-6xl px-3 pb-16 sm:px-6 sm:pb-28">
                {filteredProjects.length === 0 ? (
                  <div className="space-y-2 rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.01] py-14 text-center sm:py-20">
                    <p className="text-xs font-semibold text-stone-400 sm:text-sm">
                      {PROJETOS.semResultados.titulo}
                    </p>
                    <p className="text-[11px] text-stone-500 sm:text-xs">
                      {PROJETOS.semResultados.subtitulo}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-7">
                    {capa && (
                      <CartaoEmDestaque
                        proj={capa}
                        onAbrir={abrir}
                        serie={ficha.serie}
                        botao={PROJETOS.lista.botaoDoCard}
                      />
                    )}

                    {restante.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                        {restante.map((proj, idx) => (
                          <CartaoDeProjeto
                            key={proj.id}
                            proj={proj}
                            idx={idx}
                            onAbrir={abrir}
                            serie={ficha.serie}
                            rotuloDoProjeto={PROJETOS.lista.rotuloDoProjeto}
                            botao={PROJETOS.lista.botaoDoCard}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

function SecaoDoArtigo({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div className="flex items-baseline gap-2.5 border-b border-white/[0.08] pb-2.5 sm:gap-3.5 sm:pb-3">
      <span className="font-mono text-lg font-black leading-none text-yellow-400/25 sm:text-2xl">
        {numero}
      </span>
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ouro sm:text-xs">
        {titulo}
      </h2>
    </div>
  );
}

function BlocoDeMetodo({
  rotulo,
  texto,
  destaque = false,
}: {
  rotulo: string;
  texto?: string;
  destaque?: boolean;
}) {
  if (!texto) return null;

  return (
    <div className="space-y-1.5">
      <h3
        className={`font-mono text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
          destaque ? "text-emerald-400" : "text-yellow-400"
        }`}
      >
        {rotulo}
      </h3>
      <p
        className={`border-l pl-3 text-xs leading-relaxed text-stone-300 text-pretty sm:text-[15px] ${
          destaque ? "border-emerald-500/30" : "border-white/10"
        }`}
      >
        {texto}
      </p>
    </div>
  );
}

function CartaoEmDestaque({
  proj,
  onAbrir,
  serie,
  botao,
}: {
  proj: StudentProject;
  onAbrir: (p: StudentProject) => void;
  serie: string;
  botao: string;
}) {
  const pilar = pilarDe(proj.pillar);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onAbrir(proj)}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-superficie-2 via-superficie to-fundo text-left transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-pointer sm:flex-row sm:rounded-3xl"
    >
      <span
        className="absolute inset-x-0 top-0 h-px opacity-60 transition-opacity duration-300 group-hover:opacity-100 sm:inset-y-0 sm:left-0 sm:h-auto sm:w-px"
        style={{ backgroundColor: pilar.cor }}
      />

      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-black sm:h-auto sm:w-64 md:w-80">
        {proj.studentImage ? (
          <img
            src={proj.studentImage}
            alt={proj.studentName}
            className="photo-soft h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-yellow-950/40 to-stone-950 text-3xl font-black text-yellow-300/60">
            {proj.studentName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-superficie via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-superficie" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:gap-5 sm:p-8">
        <div className="space-y-2 sm:space-y-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-stone-950 sm:px-2.5 sm:text-[10px]">
              <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Em destaque
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider sm:px-2.5 sm:text-[10px]"
              style={{
                borderColor: `${pilar.cor}55`,
                backgroundColor: `${pilar.cor}14`,
                color: corLegivel(pilar.cor),
              }}
            >
              {pilar.rotulo}
            </span>
          </div>

          <h2 className="text-base font-black leading-snug tracking-tight text-white transition-colors group-hover:text-ouro text-balance sm:text-2xl md:text-3xl">
            {proj.title}
          </h2>

          <p className="line-clamp-3 text-[11px] leading-relaxed text-stone-400 text-pretty sm:text-sm">
            {proj.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
          <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-stone-400 sm:gap-2 sm:text-xs">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
            <span className="truncate font-semibold text-stone-200">{proj.studentName}</span>
            <span className="text-stone-600">·</span>
            <span className="truncate font-mono">{proj.studentGrade || serie}</span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-1 text-[10px] font-bold text-ouro transition-all group-hover:bg-yellow-400 group-hover:text-stone-950 sm:px-3.5 sm:py-1.5 sm:text-xs">
            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{botao}</span>
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-3.5 sm:w-3.5" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function CartaoDeProjeto({
  proj,
  idx,
  onAbrir,
  serie,
  rotuloDoProjeto,
  botao,
}: {
  proj: StudentProject;
  idx: number;
  onAbrir: (p: StudentProject) => void;
  serie: string;
  rotuloDoProjeto: string;
  botao: string;
}) {
  const pilar = pilarDe(proj.pillar);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (idx % 6) * 0.05 }}
      onClick={() => onAbrir(proj)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-superficie text-left transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/45 hover:shadow-[0_16px_40px_rgba(0,0,0,0.55)] cursor-pointer sm:rounded-2xl"
    >
      <span
        className="absolute inset-x-0 top-0 h-px opacity-50 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: pilar.cor }}
      />

      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:gap-3.5 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black sm:h-11 sm:w-11 sm:rounded-xl">
            {proj.studentImage ? (
              <img
                src={proj.studentImage}
                alt={proj.studentName}
                loading="lazy"
                className="photo-soft photo-soft-sm h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-yellow-950/50 to-stone-950 text-[11px] font-black text-yellow-300/70">
                {proj.studentName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-bold leading-tight text-white sm:text-sm">
              {proj.studentName}
            </span>
            <span className="block truncate font-mono text-[10.5px] leading-tight text-stone-500 sm:text-[10px]">
              {proj.studentGrade || serie}
            </span>
          </div>

          <span
            className="shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide sm:text-[11px]"
            style={{
              borderColor: `${pilar.cor}45`,
              backgroundColor: `${pilar.cor}12`,
              color: corLegivel(pilar.cor),
            }}
          >
            {pilar.rotulo.split(" ")[0]}
          </span>
        </div>

        <div className="flex-1 space-y-1.5 border-t border-white/[0.06] pt-2.5 sm:pt-3.5">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500 sm:text-[10px]">
            {rotuloDoProjeto}
          </span>
          <h3 className="line-clamp-2 text-xs font-bold leading-snug text-white transition-colors group-hover:text-ouro text-balance sm:text-base">
            {proj.title}
          </h3>
          <p className="line-clamp-2 text-[10.5px] leading-relaxed text-stone-500 sm:text-xs">
            {proj.summary}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5 sm:pt-3">
          <span className="flex items-center gap-1 font-mono text-[10.5px] text-stone-500 sm:text-[10px]">
            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {proj.updatedAt || proj.createdAt}
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ouro transition-transform group-hover:translate-x-0.5 sm:text-xs">
            <span>{botao}</span>
            <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
