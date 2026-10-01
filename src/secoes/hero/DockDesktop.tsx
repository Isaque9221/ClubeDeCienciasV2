import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Users, FlaskConical, Milestone } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useData } from "@/compartilhado/hooks/useData";
import { montarBotoesDoHero } from "./conteudo";

export interface DockDesktopProps {
  onOpenMembers?: () => void;
  onOpenProjects?: () => void;
  onOpenTrajetoria?: () => void;
}

function rolarAte(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function DockDesktop({ onOpenMembers, onOpenProjects, onOpenTrajetoria }: DockDesktopProps) {
  const { siteConfig } = useData();
  const botoes = montarBotoesDoHero(siteConfig);

  const dockContainerRef = useRef<HTMLDivElement>(null);
  const btn1Ref = useRef<HTMLButtonElement>(null);
  const btn2Ref = useRef<HTMLButtonElement>(null);
  const btn3Ref = useRef<HTMLButtonElement>(null);
  const btn4Ref = useRef<HTMLButtonElement>(null);
  const btn5Ref = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const buttons = [
        btn1Ref.current,
        btn2Ref.current,
        btn3Ref.current,
        btn4Ref.current,
        btn5Ref.current,
      ].filter(Boolean) as HTMLButtonElement[];

      const cleanups: (() => void)[] = [];

      buttons.forEach((btn) => {
        const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
          const { left, top, width, height } = btn.getBoundingClientRect();
          const x = e.clientX - left - width / 2;
          const y = e.clientY - top - height / 2;
          xTo(x * 0.22);
          yTo(y * 0.22);
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        btn.addEventListener("mousemove", handleMouseMove);
        btn.addEventListener("mouseleave", handleMouseLeave);

        cleanups.push(() => {
          btn.removeEventListener("mousemove", handleMouseMove);
          btn.removeEventListener("mouseleave", handleMouseLeave);
        });
      });

      return () => cleanups.forEach((c) => c());
    },
    { scope: dockContainerRef }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      data-nao-imprimir=""
      className="relative lg:absolute lg:bottom-0 lg:left-0 lg:right-0 z-30 px-3 pb-3 sm:px-6 sm:pb-6 md:px-8 md:pb-7"
    >
      <div
        ref={dockContainerRef}
        className="mx-auto max-w-7xl rounded-2xl md:rounded-3xl border border-white/10 vidro shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2.5 sm:p-3.5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <button
            ref={btn1Ref}
            type="button"
            data-cursor-text={botoes.inscrever.textoDoCursor}
            onClick={() => rolarAte(botoes.inscrever.rolarPara)}
            className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl sm:rounded-2xl font-extrabold text-stone-950 transition-shadow duration-300 active:scale-[0.97] cursor-pointer shadow-[0_4px_25px_rgba(250,204,21,0.35)] will-change-transform px-4 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-base"
            style={{
              background:
                "linear-gradient(135deg, #FFFBEB 0%, #FEF08A 35%, #FDE047 70%, #FACC15 100%)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="relative z-10 leading-tight font-black text-stone-950 truncate text-sm">
                {botoes.inscrever.titulo}
              </span>
              <span className="relative z-10 text-[11px] font-semibold text-stone-800 truncate">
                {botoes.inscrever.subtitulo}
              </span>
            </div>
            <span className="relative z-10 flex shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-stone-950/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-stone-950/20 h-7 w-7 sm:h-9 sm:w-9">
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-stone-950" />
            </span>
          </button>

          <button
            ref={btn2Ref}
            type="button"
            data-cursor-text={botoes.conhecer.textoDoCursor}
            onClick={() => rolarAte(botoes.conhecer.rolarPara)}
            className="group relative flex flex-col items-start justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] text-left transition-all duration-300 hover:bg-white/[0.07] hover:border-yellow-400/40 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] active:scale-[0.97] cursor-pointer will-change-transform px-4 sm:px-5 py-3.5 sm:py-4 gap-1.5 sm:gap-2"
          >
            <div className="flex items-center justify-between w-full">
              <Compass className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-ouro group-hover:scale-110 transition-transform" />
              <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-stone-400 -rotate-45 group-hover:text-white transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div className="min-w-0 w-full">
              <span className="block font-bold text-sm text-white group-hover:text-yellow-100 transition-colors truncate">
                {botoes.conhecer.titulo}
              </span>
              <span className="block text-[11px] text-stone-400 truncate">
                {botoes.conhecer.subtitulo}
              </span>
            </div>
          </button>

          <button
            ref={btn3Ref}
            type="button"
            data-cursor-text={botoes.trajetoria.textoDoCursor}
            onClick={onOpenTrajetoria}
            className="group relative flex flex-col items-start justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-yellow-400/35 bg-gradient-to-br from-yellow-400/10 via-black/40 to-amber-300/5 text-left transition-all duration-300 hover:border-yellow-300/70 hover:shadow-[0_0_25px_rgba(250,204,21,0.25)] active:scale-[0.97] cursor-pointer will-change-transform px-4 sm:px-5 py-3.5 sm:py-4 gap-1.5 sm:gap-2"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <Milestone className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-ouro group-hover:scale-110 transition-transform" />
                <span className="rounded-full bg-yellow-400/15 border border-yellow-400/30 px-1.5 py-0.5 text-[10.5px] font-bold text-ouro uppercase tracking-wider">
                  {botoes.trajetoria.etiqueta}
                </span>
              </div>
              <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-ouro -rotate-45 group-hover:text-white transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div className="min-w-0 w-full">
              <span className="block font-bold text-sm text-white group-hover:text-yellow-100 transition-colors truncate">
                {botoes.trajetoria.titulo}
              </span>
              <span className="block text-[11px] text-ouro/80 truncate">
                {botoes.trajetoria.subtitulo}
              </span>
            </div>
          </button>

          <button
            ref={btn4Ref}
            type="button"
            data-cursor-text={botoes.membros.textoDoCursor}
            onClick={onOpenMembers}
            className="group relative flex flex-col items-start justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-yellow-400/35 bg-gradient-to-br from-yellow-400/10 via-black/40 to-amber-300/5 text-left transition-all duration-300 hover:border-yellow-300/70 hover:shadow-[0_0_25px_rgba(250,204,21,0.25)] active:scale-[0.97] cursor-pointer will-change-transform px-4 sm:px-5 py-3.5 sm:py-4 gap-1.5 sm:gap-2"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-ouro group-hover:scale-110 transition-transform" />
                <span className="rounded-full bg-yellow-400/15 border border-yellow-400/30 px-1.5 py-0.5 text-[10.5px] font-bold text-ouro uppercase tracking-wider">
                  {botoes.membros.etiqueta}
                </span>
              </div>
              <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-ouro -rotate-45 group-hover:text-white transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div className="min-w-0 w-full">
              <span className="block font-bold text-sm text-white group-hover:text-yellow-100 transition-colors truncate">
                {botoes.membros.titulo}
              </span>
              <span className="block text-[11px] text-ouro/80 truncate">
                {botoes.membros.subtitulo}
              </span>
            </div>
          </button>

          <button
            ref={btn5Ref}
            type="button"
            data-cursor-text={botoes.projetos.textoDoCursor}
            onClick={onOpenProjects}
            className="group relative flex flex-col items-start justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-yellow-400/35 bg-gradient-to-br from-yellow-400/15 via-black/40 to-amber-300/10 text-left transition-all duration-300 hover:border-yellow-300/80 hover:shadow-[0_0_25px_rgba(250,204,21,0.25)] active:scale-[0.97] cursor-pointer will-change-transform px-4 sm:px-5 py-3.5 sm:py-4 gap-1.5 sm:gap-2"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <FlaskConical className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-ouro group-hover:scale-110 transition-transform" />
                <span className="rounded-full bg-yellow-400/20 border border-yellow-400/40 px-1.5 py-0.5 text-[10.5px] font-bold text-ouro uppercase tracking-wider">
                  {botoes.projetos.etiqueta}
                </span>
              </div>
              <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-ouro -rotate-45 group-hover:text-white transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div className="min-w-0 w-full">
              <span className="block font-bold text-sm text-white group-hover:text-yellow-100 transition-colors truncate">
                {botoes.projetos.titulo}
              </span>
              <span className="block text-[11px] text-ouro/90 font-medium truncate">
                {botoes.projetos.subtitulo}
              </span>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
