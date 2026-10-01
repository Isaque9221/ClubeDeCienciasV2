import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, GraduationCap } from "lucide-react";
import type { Member } from "@/compartilhado/tipos/member.types";
import { getIconComponent } from "@/compartilhado/utils/icons";
import { useSound } from "@/compartilhado/hooks/useSound";

interface LeaderCardProps {
  member: Member;
  index: number;
  onSelect: (m: Member) => void;
}

const ROTULO_DE_ENSINO = "Área de Orientação & Pesquisa:";
const ROTULO_DE_PROFISSAO = "Profissão & Foco de Desenvolvimento:";

function ensina(member: { role?: string }): boolean {
  return /professor|orientador|mentor|docente/i.test(member.role ?? "");
}

export function LeaderCard({ member, index, onSelect }: LeaderCardProps) {
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

    const rotX = -((mouseY - height / 2) / (height / 2)) * 4;
    const rotY = ((mouseX - width / 2) / (width / 2)) * 4;

    setTilt({ x: rotX, y: rotY });
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.18,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
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
            ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)`
            : "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)",
          transition: isHovered
            ? "transform 0.12s ease-out, border-color 0.3s ease, box-shadow 0.3s ease"
            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        className="group relative flex h-full flex-col md:flex-row overflow-hidden rounded-2xl sm:rounded-[32px] border border-white/[0.14] bg-gradient-to-b from-superficie-3 via-superficie-2 to-fundo-profundo shadow-[0_25px_70px_rgba(0,0,0,0.95)] hover:border-amber-400/70 hover:shadow-[0_30px_90px_rgba(245,158,11,0.25),0_0_30px_rgba(250,204,21,0.1)] cursor-pointer select-none"
      >
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-2xl sm:rounded-[32px] transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(550px circle at ${glare.x}% ${glare.y}%, rgba(254, 240, 138, 0.28) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 70%)`,
          }}
        />

        <div
          className="pointer-events-none absolute top-0 inset-x-8 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${member.color || "#FACC15"} 50%, transparent 100%)`,
            boxShadow: `0 0 20px ${member.color || "#FACC15"}`,
          }}
        />

        <div
          className="pointer-events-none absolute -inset-2 rounded-2xl sm:rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl z-0"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${member.color}25 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 w-full md:w-[250px] lg:w-[270px] p-2.5 sm:p-4 md:pr-0 shrink-0">
          <div
            data-tema="escuro"
            className="relative w-full h-[200px] sm:h-[280px] md:h-full md:min-h-[250px] rounded-xl sm:rounded-[24px] overflow-hidden bg-fundo-profundo border border-white/[0.14] shadow-inner group-hover:border-amber-400/40 transition-colors"
          >
            <div className="pointer-events-none absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-amber-400/70 z-20" />
            <div className="pointer-events-none absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-amber-400/70 z-20" />
            <div className="pointer-events-none absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-amber-400/70 z-20" />
            <div className="pointer-events-none absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-amber-400/70 z-20" />

            {hasPhoto ? (
              <img
                src={member.image}
                alt={member.name}
                className={`photo-soft photo-soft-lg h-full w-full object-cover ${
                  member.imagePosition || "object-center"
                } transition-transform duration-700 ease-out group-hover:scale-106`}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-stone-900">
                <Icon className="h-14 w-14 sm:h-24 sm:w-24 text-stone-600" />
              </div>
            )}

            <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 px-3.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(250,204,21,0.5)]">
                <span>Ver Perfil Completo</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-black stroke-[3]" />
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-between p-3 sm:p-6 md:p-7 space-y-3 sm:space-y-4">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-mono font-bold uppercase tracking-wider sm:tracking-widest text-ouro">
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-ambar" />
              <span>{member.tag}</span>
            </div>

            <div>
              <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-[1.1] group-hover:text-ouro transition-colors text-balance">
                {member.name}
              </h3>
              {member.area && (
                <div className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1">
                  <span className="text-[10.5px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-ambar flex items-center gap-1 sm:gap-1.5">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-ambar" />
                    {ensina(member) ? ROTULO_DE_ENSINO : ROTULO_DE_PROFISSAO}
                  </span>
                  <p className="text-[10px] sm:text-sm font-mono text-ouro-2 font-semibold">
                    {member.area}
                  </p>
                </div>
              )}
            </div>

            {member.quote && (
              <div
                className="relative rounded-lg sm:rounded-2xl border p-2.5 sm:p-4 backdrop-blur-md shadow-inner"
                style={{
                  backgroundColor: `${member.color}0A`,
                  borderColor: `${member.color}35`,
                }}
              >
                <p className="text-[10.5px] sm:text-sm italic font-medium text-stone-200 leading-relaxed">
                  "{member.quote}"
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-2.5 sm:pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(member.area || "")
                .split(" · ")
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md sm:rounded-xl border border-white/10 bg-white/[0.04] px-1.5 py-0.5 sm:px-3 sm:py-1 text-[10.5px] sm:text-[11px] font-medium text-stone-300 backdrop-blur-md"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-ambar" />
                    {tag}
                  </span>
                ))}
            </div>

            <div className="inline-flex items-center gap-1 sm:gap-1.5 text-[10.5px] sm:text-xs font-mono font-bold text-ouro-2 group-hover:translate-x-1 transition-transform">
              <span>Abrir Ficha de Orientador</span>
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
