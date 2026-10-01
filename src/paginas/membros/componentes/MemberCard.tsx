import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, ShieldCheck } from "lucide-react";
import { corLegivel } from "@/compartilhado/utils/cor-legivel";
import type { Member } from "@/compartilhado/tipos/member.types";
import { getIconComponent } from "@/compartilhado/utils/icons";
import { useSound } from "@/compartilhado/hooks/useSound";
import { resolveMemberArea, hasCustomQuote } from "@/compartilhado/utils/member";

interface MemberCardProps {
  member: Member;
  index: number;
  onSelect: (m: Member) => void;
}

export function MemberCard({ member, index, onSelect }: MemberCardProps) {
  const { playSound } = useSound();
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotX = -((mouseY - height / 2) / (height / 2)) * 6;
    const rotY = ((mouseX - width / 2) / (width / 2)) * 6;

    setTilt({ x: rotX, y: rotY });
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.22,
    });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const Icon = getIconComponent(member.iconName);
  const hasPhoto = Boolean(member.image) && !imgError;

  const showQuote = hasCustomQuote(member);
  const displayArea = resolveMemberArea(member);

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.04 }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          playSound("pop-bubble");
          onSelect(member);
        }}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
          transition: isHovered
            ? "transform 0.12s ease-out, border-color 0.3s ease, box-shadow 0.3s ease"
            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[26px] border border-white/[0.12] bg-gradient-to-b from-superficie-3 via-superficie-2 to-fundo-profundo shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:border-amber-400/70 hover:shadow-[0_25px_60px_rgba(245,158,11,0.25),0_0_20px_rgba(250,204,21,0.12)] cursor-pointer select-none"
      >
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-2xl sm:rounded-[26px] transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(380px circle at ${glare.x}% ${glare.y}%, rgba(254, 240, 138, 0.35) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%)`,
          }}
        />

        <div
          className="pointer-events-none absolute top-0 inset-x-6 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${member.color || "#FACC15"} 50%, transparent 100%)`,
            boxShadow: `0 0 16px ${member.color || "#FACC15"}`,
          }}
        />

        <div
          className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(350px circle at 50% 0%, ${member.color || "#FACC15"}18, transparent 75%)`,
          }}
        />

        <div className="relative z-10 p-2 pb-0 sm:p-3.5">
          <div
            data-tema="escuro"
            className="relative w-full aspect-[4/4.4] sm:aspect-[4/4.5] rounded-xl sm:rounded-[20px] overflow-hidden bg-fundo-profundo border border-white/[0.12] shadow-inner group-hover:border-amber-400/40 transition-all duration-300"
          >
            <div className="pointer-events-none absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-amber-400/60 z-20" />
            <div className="pointer-events-none absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-amber-400/60 z-20" />
            <div className="pointer-events-none absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-amber-400/60 z-20" />
            <div className="pointer-events-none absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-amber-400/60 z-20" />

            {hasPhoto ? (
              <img
                src={member.image}
                alt={member.name}
                className={`photo-soft photo-soft-sm h-full w-full object-cover ${
                  member.imagePosition || "object-center"
                } transition-transform duration-700 ease-out group-hover:scale-106`}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="relative flex h-full w-full flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 backdrop-blur-md shadow-inner transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${member.color}18`,
                    borderColor: `${member.color}45`,
                  }}
                >
                  <Icon className="h-8 w-8 text-white/90" />
                </div>
                <span className="mt-3 text-[11px] font-mono font-bold uppercase tracking-widest text-ouro-2">
                  CECLOS · Lab
                </span>
              </div>
            )}

            <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 px-3 py-1.5 rounded-full shadow-[0_4px_20px_rgba(250,204,21,0.5)] active:scale-95 transition-transform">
                <span>Explorar</span>
                <ArrowUpRight className="h-3 w-3 text-black stroke-[3]" />
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>

        <div className="relative z-10 p-2.5 pt-2 sm:p-4 sm:pt-3 flex flex-col justify-between flex-1 space-y-2 sm:space-y-3.5">
          <div className="space-y-1.5 sm:space-y-2">
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              <span className="truncate" style={{ color: corLegivel(member.color) }}>
                {member.role.replace("Jovem Cientista", "Pesquisador")}
              </span>
              <span className="shrink-0 text-stone-500 tabular-nums">
                · Nº {member.num || (index + 1).toString().padStart(2, "0")}
              </span>
            </p>
            <h4 className="text-[13px] sm:text-base font-black text-white tracking-tight leading-snug group-hover:text-ouro transition-colors line-clamp-2 sm:min-h-[2.75em]">
              {member.name || "Pesquisador CECLOS"}
            </h4>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                <span>
                  {member.category === "lideranca" ? "Área de Atuação:" : "Profissão dos Sonhos:"}
                </span>
              </div>
              <p className="text-xs font-mono line-clamp-1 transition-colors font-semibold text-stone-300 group-hover:text-white">
                {displayArea}
              </p>
            </div>

            {showQuote && (
              <p className="text-[10.5px] sm:text-[11px] text-stone-400 italic line-clamp-1 border-l-2 border-amber-400/40 pl-1.5 sm:pl-2 mt-1">
                "{member.quote}"
              </p>
            )}
          </div>

          <div className="pt-2 sm:pt-3 border-t border-white/[0.08] flex items-center justify-between gap-1.5 text-[10.5px] sm:text-[11px] font-mono">
            <div className="flex min-w-0 items-center gap-1 sm:gap-1.5 text-stone-400">
              <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-medium text-stone-300 sm:max-w-[130px]">
                {member.tag || "CECLOS · 2026"}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-amber-400/80 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all text-[10px] sm:text-xs font-bold">
              <span className="hidden sm:inline text-[10px] uppercase font-mono tracking-widest">
                Ver
              </span>
              <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
