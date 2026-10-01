import { lazy, Suspense, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import { SoundProvider } from "@/compartilhado/contextos/SoundContext";
import { PreferenciasProvider } from "@/compartilhado/contextos/PreferenciasProvider";
import { DataProvider } from "@/compartilhado/contextos/DataContext";
import { ProjectsProvider } from "@/compartilhado/contextos/ProjectsContext";
import {
  ScrollProgressBar,
  BarraDeAviso,
  CenarioDeEntrada,
  FundoDoSite,
} from "@/compartilhado/componentes";
import { TargetCursor } from "@/plataformas/windows";
import { TelaDeCarregamento } from "@/recursos/carregamento";
import { SoundSelectorModal } from "@/recursos/audio";
import { useData, usePreferencias, useSound } from "@/compartilhado/hooks";
import {
  AvisoRapido,
  JanelaDeAjustes,
  JanelaDeAtalhos,
  JanelaDePrivacidade,
  PaletaDeComandos,
  useAtalhosGlobais,
  useComandosDoSite,
} from "@/recursos/sistema";
import { ModoDoMapaProvider } from "@/compartilhado/contextos/ModoDoMapaProvider";
import { HomePage } from "@/paginas/inicio";
import { MembersPage } from "@/paginas/membros";
import { ProjectsPage } from "@/paginas/projetos";
import { TrajetoriaPage } from "@/paginas/trajetoria";

const AdminPage = lazy(() =>
  import("@/paginas/painel/AdminPage").then((m) => ({ default: m.AdminPage }))
);

type Page = "home" | "members" | "projects" | "admin" | "trajetoria";

const NOME_DA_PAGINA: Record<Page, string> = {
  home: "",
  members: "Membros",
  projects: "Projetos",
  trajetoria: "Trajetória",
  admin: "Painel",
};

const SAIDA_DE_PAGINA = { duration: 0.3, ease: [0.4, 0, 1, 1] as const };
const ENTRADA_DE_PAGINA = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const };

const VARIANTES_DA_PAGINA: Variants = {
  fora: { opacity: 0, filter: "blur(6px)" },
  dentro: {
    opacity: 1,
    filter: "blur(0px)",
    transition: ENTRADA_DE_PAGINA,
    transitionEnd: { filter: "none" },
  },
  saindo: (coberta: boolean) => ({
    opacity: 0,
    transition: coberta ? { duration: 0 } : SAIDA_DE_PAGINA,
  }),
};
const PAGINA = {
  variants: VARIANTES_DA_PAGINA,
  initial: "fora",
  animate: "dentro",
  exit: "saindo",
};
const CAMADA_DA_PAGINA = "relative z-[1] outline-none";

function estaNaPreviaNoInicio(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has("previa");
  } catch {
    return false;
  }
}

function AppContent() {
  const { siteConfig } = useData();
  const [page, setPage] = useState<Page>("home");

  const [isLoading, setIsLoading] = useState(() => !estaNaPreviaNoInicio());

  const [saltando, setSaltando] = useState(false);

  const cenario = (
    <AnimatePresence>
      {isLoading && <CenarioDeEntrada key="cenario" saltando={saltando} />}
    </AnimatePresence>
  );

  const trocouDePagina = useRef(false);

  const navigate = useCallback(
    (to: Page) => {
      if (to === page) return;
      trocouDePagina.current = true;
      try {
        window.history.pushState({ pagina: to }, "");
      } catch {}
      setPage(to);
    },
    [page]
  );

  const { toggleBgMusicPlay } = useSound();
  const comandos = useComandosDoSite({ paginaAtual: page, irPara: navigate });
  useAtalhosGlobais({
    ativo: !isLoading && page !== "admin",
    alternarMusica: toggleBgMusicPlay,
  });

  const focarPagina = (definicao: unknown) => {
    if (definicao !== "dentro" || !trocouDePagina.current) return;
    document.getElementById("conteudo")?.focus({ preventScroll: true });
  };

  useEffect(() => {
    try {
      window.history.replaceState({ pagina: "home" }, "");
    } catch {}
    const aoVoltar = (e: PopStateEvent) => {
      const destino = (e.state as { pagina?: Page } | null)?.pagina ?? "home";
      trocouDePagina.current = true;
      setPage(destino in NOME_DA_PAGINA ? destino : "home");
    };
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  useEffect(() => {
    if (siteConfig.siteTitle) {
      const sub = siteConfig.siteSubtitle?.trim();
      const repetido = !!sub && siteConfig.siteTitle.toLowerCase().includes(sub.toLowerCase());
      const base = sub && !repetido ? `${siteConfig.siteTitle} · ${sub}` : siteConfig.siteTitle;
      const nome = NOME_DA_PAGINA[page];
      document.title = nome ? `${nome} · ${siteConfig.siteTitle}` : base;
    }
    const font = siteConfig.fontFamily || "Inter";
    document.documentElement.style.fontFamily = `"${font}", sans-serif`;
    document.body.style.fontFamily = `"${font}", sans-serif`;
  }, [siteConfig.fontFamily, siteConfig.siteTitle, siteConfig.siteSubtitle, page]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setPage((prev) => (prev === "admin" ? "home" : "admin"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <ScrollProgressBar />
      <BarraDeAviso />
      <FundoDoSite />

      <TargetCursor
        color="var(--cursor)"
        spinDuration={6}
        spinSize={30}
        cornerLength={8}
        padding={6}
      />

      {cenario}

      <AnimatePresence>
        {isLoading && (
          <TelaDeCarregamento
            isPaused={false}
            onSalto={(dest) => {
              setSaltando(true);
              navigate(dest as Page);
            }}
            onComplete={(dest) => {
              setIsLoading(false);
              setSaltando(false);
              if (dest) {
                navigate(dest as Page);
              }
            }}
            minDuration={2200}
          />
        )}
      </AnimatePresence>

      <AnimatePresence
        mode="wait"
        custom={isLoading}
        onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" })}
      >
        {page === "home" && (
          <motion.main
            key="home"
            id="conteudo"
            tabIndex={-1}
            aria-label="Início"
            className={CAMADA_DA_PAGINA}
            onAnimationStart={focarPagina}
            {...PAGINA}
          >
            <HomePage
              onOpenMembers={() => navigate("members")}
              onOpenProjects={() => navigate("projects")}
              onOpenTrajetoria={() => navigate("trajetoria")}
              onOpenAdmin={() => navigate("admin")}
            />
          </motion.main>
        )}

        {page === "trajetoria" && (
          <motion.main
            key="trajetoria"
            id="conteudo"
            tabIndex={-1}
            aria-label="Trajetória"
            className={CAMADA_DA_PAGINA}
            onAnimationStart={focarPagina}
            {...PAGINA}
          >
            <TrajetoriaPage
              onBack={() => navigate("home")}
              onOpenProjects={() => navigate("projects")}
              onOpenMembers={() => navigate("members")}
            />
          </motion.main>
        )}

        {page === "projects" && (
          <motion.main
            key="projects"
            id="conteudo"
            tabIndex={-1}
            aria-label="Projetos"
            className={CAMADA_DA_PAGINA}
            onAnimationStart={focarPagina}
            {...PAGINA}
          >
            <ProjectsPage onBack={() => navigate("home")} />
          </motion.main>
        )}

        {page === "members" && (
          <motion.main
            key="members"
            id="conteudo"
            tabIndex={-1}
            aria-label="Membros"
            className={CAMADA_DA_PAGINA}
            onAnimationStart={focarPagina}
            {...PAGINA}
          >
            <MembersPage onBack={() => navigate("home")} />
          </motion.main>
        )}

        {page === "admin" && (
          <motion.main
            key="admin"
            id="conteudo"
            tabIndex={-1}
            aria-label="Painel"
            data-tema="escuro"
            className={CAMADA_DA_PAGINA}
            onAnimationStart={focarPagina}
            {...PAGINA}
          >
            <Suspense fallback={null}>
              <AdminPage onBack={() => navigate("home")} />
            </Suspense>
          </motion.main>
        )}
      </AnimatePresence>

      <SoundSelectorModal />
      <PaletaDeComandos comandos={comandos} />
      <JanelaDeAjustes />
      <JanelaDeAtalhos />
      <JanelaDePrivacidade />
      <AvisoRapido />
    </>
  );
}

function MovimentoDoSite({ children }: { children: ReactNode }) {
  const { menosMovimento } = usePreferencias();
  return (
    <MotionConfig reducedMotion={menosMovimento ? "always" : "never"}>{children}</MotionConfig>
  );
}

export default function App() {
  return (
    <PreferenciasProvider>
      <MovimentoDoSite>
        <DataProvider>
          <ProjectsProvider>
            <SoundProvider>
              <ModoDoMapaProvider>
                <AppContent />
              </ModoDoMapaProvider>
            </SoundProvider>
          </ProjectsProvider>
        </DataProvider>
      </MovimentoDoSite>
    </PreferenciasProvider>
  );
}
