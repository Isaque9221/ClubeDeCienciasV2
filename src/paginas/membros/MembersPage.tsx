import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Search, X, Star, ChevronRight } from "lucide-react";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import { usePausarForaDaTela } from "@/compartilhado/hooks/usePausarForaDaTela";
import { MEMBER_STATS } from "@/compartilhado/dados/members.data";
import type { Member } from "@/compartilhado/tipos/member.types";
import {
  AmbientParticles,
  MemberModal,
  LeaderCard,
  MemberCard,
  MuralDeMembros,
} from "./componentes";
import {
  CabecalhoDaAba,
  FioDourado,
  GsapTextReveal,
  SectionLabel,
} from "@/compartilhado/componentes";
import { montarCta } from "@/secoes/cta/conteudo";

interface MembersPageProps {
  onBack: () => void;
}

export function MembersPage({ onBack }: MembersPageProps) {
  const { members, mentors, siteConfig } = useData();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [perfil, setPerfil] = useState<{ membro: Member; lista: Member[] } | null>(null);
  const abrirPerfil = (lista: Member[]) => (membro: Member) => setPerfil({ membro, lista });
  const { playSound } = useSound();

  usePausarForaDaTela("#pagina-de-membros section", "membros");

  const pageBadge = siteConfig.membersPageBadge || "Iniciação Científica & Pesquisa no Semiárido";
  const pageTitle = siteConfig.membersPageTitle || "Nossos Membros & Pesquisadores";
  const pageSub =
    siteConfig.membersPageSubtitle ||
    "Conheça os 35 jovens talentos, orientadores e mentores que praticam o método científico, desenvolvem tecnologia e pesquisam semanalmente no CECLOS.";

  const membros = useMemo(() => members.filter((m) => m.category !== "lideranca"), [members]);
  const totalDePesquisadores = membros.length;

  const memberStats = useMemo(
    () =>
      MEMBER_STATS.map((stat) =>
        stat.label === "Integrantes Ativos"
          ? { ...stat, value: String(totalDePesquisadores) }
          : stat
      ),
    [totalDePesquisadores]
  );

  const filteredClubistas = useMemo(() => {
    return membros.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        m.name.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.tag.toLowerCase().includes(q)
      );
    });
  }, [membros, searchQuery]);

  const leaders = useMemo(
    () => members.filter((m) => m.id === "victor" || m.id === "isaque"),
    [members]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      id="pagina-de-membros"
      className="relative isolate min-h-screen w-full overflow-x-hidden text-white font-sans selection:bg-amber-500/30 selection:text-white"
    >
      <AmbientParticles />

      <CabecalhoDaAba
        onVoltar={onBack}
        rotuloVoltar="Voltar ao Início"
        marca="Clube de Ciências"
        titulo="Membros & Equipe"
        contador={`${members.length} Integrantes`}
      />

      <section className="relative z-10 pt-20 pb-8 sm:pt-36 sm:pb-12 px-4 sm:px-6 text-center max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <SectionLabel text={pageBadge} />

        <GsapTextReveal
          text={pageTitle}
          tag="h1"
          type="mask-up"
          className="text-[2.1rem] sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] text-balance"
          highlightWords={["Membros", "Pesquisadores"]}
          glowOnView
        />
        <FioDourado />

        <GsapTextReveal
          text={pageSub}
          tag="p"
          type="words"
          stagger={0.015}
          className="text-[15px] sm:text-lg text-stone-300/90 max-w-2xl mx-auto leading-relaxed text-pretty"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-6 pt-1 sm:pt-4"
        >
          {memberStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-xs"
            >
              <span className="font-mono text-[13px] sm:text-base font-black text-ouro">
                {stat.value}
              </span>
              <span className="text-stone-400 font-medium">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      <MuralDeMembros
        membros={membros}
        total={totalDePesquisadores}
        onSelect={abrirPerfil(membros)}
        titulo={siteConfig.muralTitle}
        destaque={siteConfig.muralHighlight}
        legenda={siteConfig.muralCaption}
      />

      <section className="relative z-10 mx-auto max-w-5xl px-3 sm:px-6 py-5 sm:py-12">
        <div className="mb-4 sm:mb-8 text-center space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-ouro">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
            {siteConfig.membersLeadershipBadge || "Coordenação & Desenvolvimento"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {siteConfig.membersLeadershipTitle || "Liderança do Projeto"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-6">
          {leaders.map((leader, i) => (
            <LeaderCard key={leader.id} member={leader} index={i} onSelect={abrirPerfil(leaders)} />
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-3 sm:px-6 py-5 sm:py-12">
        <div className="mb-4 sm:mb-8 text-center space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-ouro">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
            {siteConfig.membersMentorsBadge || "Corpo Docente & Mentores"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {siteConfig.membersMentorsTitle || "Mentores do Clube"}
          </h2>
          <p className="text-[13px] sm:text-sm text-stone-400 max-w-lg mx-auto text-pretty">
            {siteConfig.membersMentorsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5 max-w-4xl mx-auto">
          {mentors.map((mentor, index) => (
            <MemberCard
              key={mentor.id}
              member={mentor}
              index={index}
              onSelect={abrirPerfil(mentors)}
            />
          ))}
        </div>
      </section>

      <section
        id="equipe-completa"
        className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-16"
      >
        <div className="mb-4 sm:mb-10 text-center space-y-1.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-300">
            <Users className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-ouro-2" />
            <span>
              {siteConfig.membersDirectoryBadge || "Todos Os Membros Do Clube"} ·{" "}
              {totalDePesquisadores} Integrantes
            </span>
          </div>
          <h2 className="text-[1.75rem] sm:text-5xl font-black text-white tracking-tight">
            {siteConfig.membersDirectoryTitle || "Nossos Pesquisadores"}
          </h2>
          <p className="text-[13px] sm:text-base text-stone-400 max-w-xl mx-auto text-pretty">
            {siteConfig.membersDirectorySubtitle}
          </p>
        </div>

        <div className="mb-4 sm:mb-10 max-w-2xl mx-auto">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute z-10 left-3.5 sm:left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-300/70" />
            <input
              type="search"
              data-campo-de-busca=""
              aria-label="Buscar membros por nome ou área"
              aria-keyshortcuts="/"
              enterKeyHint="search"
              placeholder={
                siteConfig.membersSearchPlaceholder || "Buscar por nome, área de pesquisa..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-4 rounded-2xl border border-white/15 bg-black/60 text-white text-base sm:text-[15px] placeholder:text-stone-400 focus:outline-none focus:border-amber-400/70 focus:bg-black/80 focus:ring-4 focus:ring-amber-400/10 transition-all shadow-inner backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[10.5px] sm:text-xs font-mono text-stone-400 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>
              Exibindo <b className="text-ouro font-bold">{filteredClubistas.length}</b> de{" "}
              {totalDePesquisadores} pesquisadores
            </span>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                playSound("subtle-click");
                setSearchQuery("");
              }}
              className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
            >
              Limpar busca
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-5">
          {filteredClubistas.map((member, idx) => (
            <MemberCard
              key={member.id}
              member={member}
              index={idx}
              onSelect={abrirPerfil(filteredClubistas)}
            />
          ))}
        </div>

        {filteredClubistas.length === 0 && (
          <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] max-w-md mx-auto">
            <Users className="w-12 h-12 text-stone-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white">Nenhum membro encontrado</h4>
            <p className="text-xs text-stone-400 mt-1">Tente pesquisar por outro nome.</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 px-5 py-2 rounded-full bg-amber-500 text-black font-bold text-xs cursor-pointer hover:bg-amber-400 transition-colors shadow-md"
            >
              Limpar Busca
            </button>
          </div>
        )}
      </section>

      <section className="relative z-10 mx-auto max-w-4xl px-3 sm:px-6 py-8 sm:py-16 text-center">
        <div className="relative overflow-hidden rounded-xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-superficie-2 via-superficie to-superficie-2 p-4 sm:p-12 shadow-2xl space-y-3 sm:space-y-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)]" />

          <Star className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-ambar animate-pulse" />

          <h3 className="text-xl sm:text-5xl font-black text-white tracking-tight text-balance">
            {siteConfig.membersCtaTitle || "Quer fazer parte dessa história?"}
          </h3>

          <p className="text-[11px] sm:text-base text-stone-300 max-w-lg mx-auto leading-relaxed text-pretty">
            {siteConfig.membersCtaText}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={() => {
                playSound("pop-bubble");
                const link = montarCta(siteConfig).botaoPrincipal.link;
                if (link) {
                  window.open(link, "_blank", "noopener,noreferrer");
                  return;
                }
                onBack();
                const inicio = performance.now();
                const procurar = () => {
                  const el = document.getElementById("junte-se");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                    return;
                  }
                  if (performance.now() - inicio < 3000) {
                    window.setTimeout(procurar, 120);
                  }
                };
                window.setTimeout(procurar, 400);
              }}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-5 py-2.5 sm:px-8 sm:py-3.5 text-[11px] sm:text-sm font-black text-black transition-all cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 35%, #FDE68A 70%, #F59E0B 100%)",
              }}
            >
              <span>{siteConfig.membersCtaBtn || "Inscrever-se no Clube"}</span>
              <ChevronRight className="h-4 w-4 text-black" />
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-5 sm:py-8 text-center text-[10.5px] sm:text-xs text-stone-500 font-mono">
        <p>
          © {new Date().getFullYear()} Clube de Ciências CECLOS · Santa Rita de Cássia, Bahia ·
          Todos os direitos reservados.
        </p>
      </footer>

      <MemberModal
        member={perfil?.membro ?? null}
        lista={perfil?.lista}
        aoTrocar={(membro) => setPerfil((atual) => (atual ? { ...atual, membro } : atual))}
        onClose={() => setPerfil(null)}
      />
    </motion.div>
  );
}
