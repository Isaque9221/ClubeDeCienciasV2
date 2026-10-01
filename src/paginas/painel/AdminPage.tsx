import React, { Fragment, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Eye,
  EyeOff,
  Clock,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  Building2,
  Lock,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Atom,
  Sparkles,
  AlertTriangle,
  KeyRound,
  Construction,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useData, useProjects, useSound } from "@/compartilhado/hooks";
import { CeuEstrelado, CantosDaMoldura } from "@/compartilhado/componentes";
import {
  verifyMasterToken,
  needsRehash,
  hashPassword,
  createSession,
  verifySession,
  clearSession,
  remainingLockoutSeconds,
  registerFailedAttempt,
  resetAttempts,
  createInteractionTimer,
  isHoneypotTriggered,
  guardarTokenDaSessao,
  esquecerTokenDaSessao,
} from "@/seguranca";
import {
  AdminMembersTab,
  AdminPartnersTab,
  AdminSettingsTab,
  AdminProjectsTab,
  AdminSiteEditorTab,
  AdminEstatisticasTab,
  AdminMapaTab,
} from "./abas";
import {
  acharArea,
  areaEstaPronta,
  mudarSituacao,
} from "@/compartilhado/dados/areas-em-desenvolvimento";
import { ADMIN } from "./conteudo";
import { TOTAL_DE_CAMPOS } from "./esquema-do-editor";

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab =
  "mapa" | "site_editor" | "members" | "projects" | "partners" | "estatisticas" | "settings";

const NAV_ITEMS = ADMIN.menu.map((item) => ({
  id: item.id,
  label: item.rotulo,
  category: item.grupo,
  icon: item.icone,
  desc: item.descricao,
  bloqueado: "emDesenvolvimento" in item && item.emDesenvolvimento === true,
}));

function descricaoDoItem(item: (typeof NAV_ITEMS)[number], quantosMembros: number) {
  return item.id === "members" ? `${quantosMembros} ${item.desc}` : item.desc;
}

const CHAVE_DO_MENU = "ceclos_admin_menu_recolhido";

const DURACAO_DO_AVISO = 2800;

const MENU_ABERTO = 272;
const MENU_RECOLHIDO = 78;

const LARGURA_DO_MENU_FIXO = 768;

function AreaEmDesenvolvimento({ titulo, aoLiberar }: { titulo: string; aoLiberar: () => void }) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-amber-400/25 bg-[#121110] px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
        <Construction className="h-8 w-8" />
      </span>
      <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/70">
        {titulo}
      </p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
        {ADMIN.bloqueado.titulo}
      </h2>
      <p className="mt-1 text-sm font-semibold text-amber-300">{ADMIN.bloqueado.subtitulo}</p>
      <p className="mt-4 max-w-sm text-xs leading-relaxed text-stone-400">
        {ADMIN.bloqueado.detalhe}
      </p>
      <button
        type="button"
        onClick={aoLiberar}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-300"
      >
        <CheckCircle2 className="h-4 w-4" />
        {ADMIN.bloqueado.liberar}
      </button>
    </div>
  );
}

export function AdminPage({ onBack }: AdminPageProps) {
  const { siteConfig, members, partners, erroDeSalvamento, updateSiteConfig } = useData();
  const { projects } = useProjects();
  const { playSound } = useSound();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [digits, setDigits] = useState<string[]>(Array(10).fill(""));
  const [showDigits, setShowDigits] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(() => remainingLockoutSeconds());
  const [honeypot, setHoneypot] = useState("");
  const [capsLigado, setCapsLigado] = useState(false);
  const hasHumanDelay = useRef(createInteractionTimer());
  const [activeTab, setActiveTab] = useState<AdminTab>("site_editor");
  const [paginaDoEditor, setPaginaDoEditor] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [menuPedidoRecolhido, setMenuPedidoRecolhido] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(CHAVE_DO_MENU) === "1";
    } catch {
      return false;
    }
  });
  const [telaLarga, setTelaLarga] = useState(
    () => typeof window === "undefined" || window.innerWidth >= LARGURA_DO_MENU_FIXO
  );
  const [avisoBloqueado, setAvisoBloqueado] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkInitialSession = async () => {
      const masterHash = siteConfig.masterTokenHash;
      if (!masterHash) return;
      if (await verifySession(masterHash)) {
        setIsAuthenticated(true);
      } else {
        clearSession();
      }
    };
    checkInitialSession();
  }, [siteConfig.masterTokenHash]);

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer(remainingLockoutSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  useEffect(() => {
    if (!isAuthenticated && lockoutTimer <= 0) {
      inputRefs.current[0]?.focus();
    }
  }, [isAuthenticated, lockoutTimer]);

  useEffect(() => {
    const medir = () => setTelaLarga(window.innerWidth >= LARGURA_DO_MENU_FIXO);
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  useEffect(() => {
    if (!avisoBloqueado) return;
    const t = setTimeout(() => setAvisoBloqueado(null), DURACAO_DO_AVISO);
    return () => clearTimeout(t);
  }, [avisoBloqueado]);

  const menuRecolhido = menuPedidoRecolhido && telaLarga;

  const alternarMenu = () => {
    playSound("subtle-click");
    setMenuPedidoRecolhido((antes: boolean) => {
      const agora = !antes;
      try {
        localStorage.setItem(CHAVE_DO_MENU, agora ? "1" : "0");
      } catch {}
      return agora;
    });
  };

  const handleDigitChange = (index: number, value: string) => {
    if (lockoutTimer > 0 || isVerifying) return;

    const cleanChar = value.replace(/[^a-zA-Z0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);

    if (cleanChar) {
      playSound("subtle-click");
      if (index < 9) {
        inputRefs.current[index + 1]?.focus();
      } else {
        validateToken(newDigits.join(""));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLigado(e.getModifierState("CapsLock"));
    }
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 9) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "Enter") {
      validateToken(digits.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0 || isVerifying) return;

    const pastedData = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "");
    if (!pastedData) return;

    const newDigits = Array(10).fill("");
    for (let i = 0; i < Math.min(10, pastedData.length); i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    playSound("subtle-click");

    if (pastedData.length >= 10) {
      inputRefs.current[9]?.focus();
      validateToken(newDigits.join(""));
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const rejectAttempt = () => {
    playSound("subtle-click");
    setAuthError(true);
    setLockoutTimer(registerFailedAttempt());
    setTimeout(() => setAuthError(false), 1500);
  };

  const validateToken = async (tokenToTest: string) => {
    if (lockoutTimer > 0 || isVerifying) return;

    if (isHoneypotTriggered(honeypot) || !hasHumanDelay.current()) {
      rejectAttempt();
      return;
    }

    const masterHash = siteConfig.masterTokenHash;
    setIsVerifying(true);
    const isValid = await verifyMasterToken(tokenToTest.trim(), masterHash);
    setIsVerifying(false);

    if (isValid && masterHash) {
      playSound("pop-bubble");
      if (needsRehash(masterHash)) {
        const hashAtualizado = await hashPassword(tokenToTest.trim());
        await createSession(hashAtualizado);
        updateSiteConfig({ masterTokenHash: hashAtualizado });
      } else {
        await createSession(masterHash);
      }
      guardarTokenDaSessao(tokenToTest);
      resetAttempts();
      setIsAuthenticated(true);
      setAuthError(false);
      setLockoutTimer(0);
    } else {
      rejectAttempt();
    }
  };

  const handleLogout = () => {
    playSound("subtle-click");
    clearSession();
    esquecerTokenDaSessao();
    setIsAuthenticated(false);
    setDigits(Array(10).fill(""));
  };

  const irPara = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.bloqueado) {
      playSound("subtle-click");
      setAvisoBloqueado(item.label);
      return;
    }
    playSound("subtle-click");
    setActiveTab(item.id);
    setIsMobileSidebarOpen(false);
  };

  const areaDoMapa = acharArea("mapa");
  const mapaPronto = areaEstaPronta(siteConfig, areaDoMapa);
  const itensDoMenu = NAV_ITEMS.map((item) =>
    item.id === "mapa" && mapaPronto
      ? { ...item, bloqueado: false, desc: ADMIN.mapaLiberado.descricao }
      : item
  );
  const currentNav = itensDoMenu.find((n) => n.id === activeTab);
  const preenchidos = digits.filter(Boolean).length;
  const completo = digits.join("").length === 10;

  const contagemDoMenu: Record<string, number> = {
    site_editor: TOTAL_DE_CAMPOS,
    members: members.length,
    projects: projects.length,
    partners: partners.length,
  };

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#080706] p-4 text-white selection:bg-amber-500/30 selection:text-white">
        <CeuEstrelado />
        <CantosDaMoldura />

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="escala-4k relative z-10 w-full max-w-lg"
        >
          <div className="rounded-3xl border border-white/10 bg-[#100F0E]/90 p-5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8 md:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="relative flex h-[88px] w-[88px] items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.16)_0%,transparent_68%)]" />
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 88 88"
                  aria-hidden="true"
                  style={{ filter: "drop-shadow(0 0 5px rgba(250,204,21,0.55))" }}
                >
                  <circle
                    cx="44"
                    cy="44"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="1.5"
                  />
                  <motion.circle
                    cx="44"
                    cy="44"
                    r="42"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="2"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    initial={{ strokeDashoffset: 1 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                  />
                  <circle
                    className="anel-de-graus"
                    cx="44"
                    cy="44"
                    r="36"
                    fill="none"
                    stroke="rgba(250,204,21,0.34)"
                    strokeWidth="1"
                    strokeDasharray="1.3 6.78"
                  />
                </svg>
                <KeyRound className="relative h-8 w-8 text-amber-300" />
              </span>

              <span className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/70">
                {ADMIN.entrada.etiqueta}
              </span>

              <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {ADMIN.entrada.titulo}{" "}
                <span className="flame-color-shift-text">{ADMIN.entrada.tituloEmDestaque}</span>
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-stone-400 sm:text-sm">
                {ADMIN.entrada.subtitulo}
              </p>
            </div>

            <div className="mt-7 space-y-3.5">
              <input
                type="text"
                name="empresa"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div
                className={`flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 ${
                  authError ? "animate-shake" : ""
                }`}
              >
                {digits.map((digit, idx) => (
                  <Fragment key={idx}>
                    {idx === 5 && (
                      <span className="mx-0.5 h-px w-2 shrink-0 rounded bg-white/20 sm:w-3" />
                    )}
                    <input
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type={showDigits ? "text" : "password"}
                      inputMode="text"
                      autoComplete="off"
                      aria-label={`Dígito ${idx + 1} de 10`}
                      maxLength={1}
                      value={digit}
                      disabled={lockoutTimer > 0 || isVerifying}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className={`h-11 min-w-0 max-w-[34px] flex-1 rounded-xl border p-0 text-center font-mono text-sm font-extrabold transition-all focus:outline-none sm:h-13 sm:max-w-[42px] sm:text-lg ${
                        authError
                          ? "border-rose-500 bg-rose-500/10 text-rose-300 ring-2 ring-rose-500/20"
                          : digit
                            ? "border-amber-400/80 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_rgba(250,204,21,0.15)]"
                            : "border-white/10 bg-black/50 text-white hover:border-white/20 focus:border-amber-400 focus:bg-amber-400/5 focus:ring-2 focus:ring-amber-400/20"
                      }`}
                      placeholder="•"
                    />
                  </Fragment>
                ))}
              </div>

              <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                  initial={false}
                  animate={{ width: `${preenchidos * 10}%` }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ boxShadow: "0 0 10px rgba(250,204,21,0.5)" }}
                />
              </div>

              <div className="flex items-center justify-between px-0.5 text-xs text-stone-400">
                <button
                  type="button"
                  onClick={() => setShowDigits((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/5 hover:text-stone-100"
                >
                  {showDigits ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-stone-400" />
                      <span>{ADMIN.entrada.ocultarDigitos}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-stone-400" />
                      <span>{ADMIN.entrada.exibirDigitos}</span>
                    </>
                  )}
                </button>

                <span className="font-mono text-[11px] text-stone-300">
                  {ADMIN.entrada.preenchidos.replace("{n}", String(preenchidos))}
                </span>
              </div>

              <AnimatePresence>
                {capsLigado && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-300"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Caps Lock está ligado
                  </motion.p>
                )}
              </AnimatePresence>

              {authError && (
                <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {ADMIN.entrada.erro}
                </p>
              )}

              {lockoutTimer > 0 && (
                <div className="space-y-1 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs text-rose-300">
                  <p className="font-bold">{ADMIN.entrada.travado}</p>
                  <p className="font-mono text-[11px]">
                    {ADMIN.entrada.travadoAguarde.replace("{s}", String(lockoutTimer))}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={!completo || lockoutTimer > 0 || isVerifying}
                onClick={() => validateToken(digits.join(""))}
                className={`group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${
                  completo && lockoutTimer === 0
                    ? "bg-amber-400 text-stone-950 shadow-[0_0_25px_rgba(250,204,21,0.25)] hover:bg-amber-300"
                    : "cursor-not-allowed border border-white/5 bg-white/5 text-stone-400"
                }`}
              >
                {completo && lockoutTimer === 0 && (
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.45)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full" />
                )}
                {isVerifying ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-950 border-t-transparent" />
                    <span>{ADMIN.entrada.validando}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>{ADMIN.entrada.entrar}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  onBack();
                }}
                className="w-full cursor-pointer rounded-xl py-2.5 text-xs font-semibold text-stone-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                ← {ADMIN.entrada.voltar}
              </button>
            </div>
          </div>

          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-stone-600">
            {ADMIN.entrada.rodape}
          </p>
        </motion.div>
      </div>
    );
  }

  const grupos = [
    { chave: "gestao" as const, titulo: ADMIN.painel.grupos.gestao },
    { chave: "sistema" as const, titulo: ADMIN.painel.grupos.sistema },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0A0908] text-white selection:bg-amber-500/30 selection:text-white">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-64 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(250,204,21,0.07) 0%, transparent 70%)",
        }}
      />

      <aside
        style={
          {
            "--menu": `${menuRecolhido ? MENU_RECOLHIDO : MENU_ABERTO}px`,
          } as React.CSSProperties
        }
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col justify-between border-r border-white/10 bg-[#100F0E]/95 backdrop-blur-xl transition-all duration-300 md:w-[var(--menu)] md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div
            className={`flex h-16 shrink-0 items-center border-b border-white/10 ${
              menuRecolhido ? "justify-center px-2" : "justify-between px-4"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-400/25 to-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(250,204,21,0.18)]">
                <Atom className="h-[18px] w-[18px]" />
              </div>
              {!menuRecolhido && (
                <div className="min-w-0">
                  <span className="block truncate font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white">
                    {ADMIN.painel.marca}
                  </span>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="font-mono text-[10.5px] font-bold tracking-[0.12em] text-emerald-400">
                      {ADMIN.painel.estado}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!menuRecolhido && (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Fechar o menu"
                className="rounded-lg p-1.5 text-stone-400 hover:text-white md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav className={`flex-1 space-y-5 py-4 ${menuRecolhido ? "px-2" : "px-3"}`}>
            {grupos.map(({ chave, titulo }) => (
              <div key={chave} className="space-y-1">
                {menuRecolhido ? (
                  <span className="mx-auto mb-2 block h-px w-6 bg-white/10" />
                ) : (
                  <span className="block px-3 pb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-stone-500">
                    {titulo}
                  </span>
                )}

                {itensDoMenu
                  .filter((item) => item.category === chave)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const contagem = contagemDoMenu[item.id];

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => irPara(item)}
                        title={menuRecolhido ? item.label : undefined}
                        aria-current={isActive ? "page" : undefined}
                        className={`group relative flex w-full cursor-pointer items-center overflow-hidden rounded-xl text-xs font-semibold transition-all ${
                          menuRecolhido ? "justify-center px-0 py-3" : "gap-2.5 px-3 py-2.5"
                        } ${
                          isActive
                            ? "bg-gradient-to-r from-amber-400/20 via-amber-400/[0.07] to-transparent text-amber-200"
                            : item.bloqueado
                              ? "text-stone-500 hover:bg-white/[0.03] hover:text-stone-400"
                              : "text-stone-300 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <span
                          className={`absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-amber-400 transition-transform duration-300 ${
                            isActive ? "scale-y-100" : "scale-y-0"
                          }`}
                        />

                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-amber-400"
                              : item.bloqueado
                                ? "text-stone-600"
                                : "text-stone-400 group-hover:text-stone-200"
                          }`}
                        />

                        {!menuRecolhido && (
                          <>
                            <span className="min-w-0 flex-1 text-left">
                              <span className="block truncate">{item.label}</span>
                              <span
                                className={`mt-0.5 block truncate text-[10px] font-normal ${
                                  isActive ? "text-amber-200/60" : "text-stone-500"
                                }`}
                              >
                                {descricaoDoItem(item, members.length)}
                              </span>
                            </span>

                            {item.bloqueado ? (
                              <span className="flex shrink-0 items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wide text-amber-400/80">
                                <Lock className="h-2.5 w-2.5" />
                                {ADMIN.bloqueado.etiqueta}
                              </span>
                            ) : (
                              contagem !== undefined && (
                                <span
                                  className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                    isActive
                                      ? "bg-amber-400/25 text-amber-100"
                                      : "bg-white/10 text-stone-300"
                                  }`}
                                >
                                  {contagem}
                                </span>
                              )
                            )}
                          </>
                        )}

                        {menuRecolhido && item.bloqueado && (
                          <span className="absolute top-1.5 right-1.5 text-amber-400/70">
                            <Lock className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))}
          </nav>
        </div>

        <div
          className={`shrink-0 space-y-2 border-t border-white/10 bg-[#0C0B0A] py-3 ${
            menuRecolhido ? "px-2" : "px-3"
          }`}
        >
          {menuRecolhido ? (
            <>
              <div
                title={`${ADMIN.painel.usuario.nome} · ${ADMIN.painel.usuario.cargo}`}
                className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/20 text-xs font-bold text-amber-300"
              >
                {ADMIN.painel.usuario.iniciais}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title={ADMIN.barraSuperior.bloquear}
                className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-rose-300 transition-colors hover:bg-rose-500/20"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/20 text-xs font-bold text-amber-300">
                  {ADMIN.painel.usuario.iniciais}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">
                    {ADMIN.painel.usuario.nome}
                  </p>
                  <p className="truncate text-[10px] text-stone-400">
                    {ADMIN.painel.usuario.cargo}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition-all hover:bg-rose-500/20"
              >
                <Lock className="h-3.5 w-3.5 text-rose-400" />
                <span>{ADMIN.barraSuperior.bloquear}</span>
              </button>

              <p className="px-1 pt-0.5 text-center font-mono text-[10.5px] uppercase tracking-wider text-stone-600">
                {ADMIN.painel.atalho}
              </p>
            </>
          )}

          <button
            type="button"
            onClick={alternarMenu}
            title={menuRecolhido ? ADMIN.painel.expandir : ADMIN.painel.recolher}
            className="hidden w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/5 py-2 text-[10px] font-semibold text-stone-500 transition-colors hover:bg-white/[0.04] hover:text-stone-200 md:flex"
          >
            {menuRecolhido ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <>
                <PanelLeftClose className="h-3.5 w-3.5" />
                <span>{ADMIN.painel.recolher}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <div
        className="relative z-10 flex min-w-0 flex-1 flex-col transition-all duration-300 md:pl-[var(--menu)]"
        style={
          {
            "--menu": `${menuRecolhido ? MENU_RECOLHIDO : MENU_ABERTO}px`,
          } as React.CSSProperties
        }
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0A0908]/85 px-3 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Abrir o menu"
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-stone-300 hover:text-white md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 items-center gap-1.5 text-xs">
              <span className="hidden text-stone-500 sm:inline">CECLOS</span>
              <ChevronRight className="hidden h-3 w-3 shrink-0 text-stone-700 sm:inline" />
              <span className="hidden text-stone-500 sm:inline">Painel</span>
              <ChevronRight className="hidden h-3 w-3 shrink-0 text-stone-700 sm:inline" />
              <span className="truncate font-bold text-amber-300">
                {currentNav?.label || ADMIN.menu[1].rotulo}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-stone-300 sm:flex">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>{currentTime || "00:00:00"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound("subtle-click");
                onBack();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-stone-200 transition-all hover:bg-white/[0.09] hover:text-white"
            >
              <span>{ADMIN.barraSuperior.verSite}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title={ADMIN.barraSuperior.bloquear}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 shadow-sm transition-all hover:bg-rose-500/20 active:scale-[0.98]"
            >
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 p-3 sm:p-8">
          {erroDeSalvamento && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-rose-200">{ADMIN.painel.erroDeSalvamento}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-rose-300/90">
                  {erroDeSalvamento}
                </p>
              </div>
            </div>
          )}

          {currentNav && (
            <div className="flex items-center gap-3 pt-1.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                <currentNav.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                  {currentNav.label}
                </h1>
                <p className="truncate text-[11px] text-stone-500">
                  {descricaoDoItem(currentNav, members.length)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {[
              {
                id: "site_editor" as const,
                rotulo: ADMIN.painel.atalhos.campos,
                valor: TOTAL_DE_CAMPOS,
                Icone: Sparkles,
                cor: "text-sky-400",
              },
              {
                id: "members" as const,
                rotulo: ADMIN.painel.atalhos.membros,
                valor: members.length,
                Icone: Users,
                cor: "text-amber-400",
              },
              {
                id: "projects" as const,
                rotulo: ADMIN.painel.atalhos.projetos,
                valor: projects.length,
                Icone: BookOpen,
                cor: "text-emerald-400",
              },
              {
                id: "partners" as const,
                rotulo: ADMIN.painel.atalhos.parcerias,
                valor: partners.length,
                Icone: Building2,
                cor: "text-purple-400",
              },
            ].map(({ id, rotulo, valor, Icone, cor }) => {
              const ativo = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    playSound("subtle-click");
                    setActiveTab(id);
                  }}
                  title={`${ADMIN.painel.atalhos.abrir}: ${rotulo}`}
                  className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${
                    ativo
                      ? "border-amber-400/50 bg-gradient-to-br from-amber-400/15 via-[#161411] to-[#121110] shadow-[0_0_24px_-4px_rgba(250,204,21,0.18)]"
                      : "border-white/[0.08] bg-[#121110] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045]"
                  }`}
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-px transition-opacity ${
                      ativo
                        ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-100"
                        : "opacity-0"
                    }`}
                  />

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      ativo
                        ? "border-amber-400/40 bg-amber-400/20 text-amber-300"
                        : `border-white/10 bg-black/40 ${cor}`
                    }`}
                  >
                    <Icone className="h-4 w-4" />
                  </div>

                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-lg font-black leading-none tracking-tight text-white">
                      {valor}
                    </span>
                    <span className="mt-1 block truncate text-[11px] font-medium text-stone-400 transition-colors group-hover:text-stone-300">
                      {rotulo}
                    </span>
                  </span>

                  <ArrowRight
                    className={`h-3.5 w-3.5 shrink-0 transition-all ${
                      ativo
                        ? "text-amber-400 opacity-100"
                        : "-translate-x-1 text-stone-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="pt-0.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {activeTab === "mapa" &&
                  (mapaPronto ? (
                    <AdminMapaTab
                      onEditarTextos={(pagina) => {
                        setPaginaDoEditor(pagina);
                        setActiveTab("site_editor");
                      }}
                    />
                  ) : (
                    <AreaEmDesenvolvimento
                      titulo={ADMIN.menu[0].rotulo}
                      aoLiberar={() => {
                        playSound("pop-bubble");
                        updateSiteConfig(mudarSituacao(areaDoMapa, true));
                      }}
                    />
                  ))}
                {activeTab === "site_editor" && (
                  <AdminSiteEditorTab paginaInicial={paginaDoEditor} />
                )}
                {activeTab === "members" && <AdminMembersTab />}
                {activeTab === "projects" && <AdminProjectsTab />}
                {activeTab === "partners" && <AdminPartnersTab />}
                {activeTab === "estatisticas" && <AdminEstatisticasTab />}
                {activeTab === "settings" && <AdminSettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {avisoBloqueado && (
          <motion.div
            key="aviso-bloqueado"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 left-1/2 z-[70] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-amber-400/30 bg-[#161411]/95 px-4 py-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <Construction className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{avisoBloqueado}</p>
              <p className="text-[11px] text-amber-300/90">{ADMIN.bloqueado.aviso}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
