import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight, GraduationCap, Award } from "lucide-react";
import { MENTORS, MEMBERS } from "@/compartilhado/dados/members.data";
import { MemberModal } from "@/paginas/membros/componentes";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import { FioDourado, GsapTextReveal, SectionLabel } from "@/compartilhado/componentes";
import { montarPesquisadores } from "./conteudo";
import type { Member } from "@/compartilhado/tipos/member.types";

export interface PesquisadoresSectionProps {
  onOpenMembers?: () => void;
}

function FotoDoMentor({ member }: { member: Member }) {
  const [erro, setErro] = useState(false);
  const temFoto = Boolean(member.image) && !erro;

  return (
    <div
      data-tema="escuro"
      className="relative aspect-[5/6] w-full overflow-hidden rounded-xl bg-superficie"
    >
      {temFoto ? (
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className={`photo-soft h-full w-full object-cover ${member.imagePosition || "object-center"} transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
          onError={() => setErro(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-yellow-400/10 text-ouro">
          <GraduationCap className="h-14 w-14" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}

export function PesquisadoresSection({ onOpenMembers }: PesquisadoresSectionProps) {
  const { playSound } = useSound();
  const { members, mentors, siteConfig } = useData();
  const textos = montarPesquisadores(siteConfig);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const activeMentors = mentors && mentors.length > 0 ? mentors : MENTORS;

  const mentorsList = activeMentors.slice(0, 3);
  const mentorCount = activeMentors.length;
  const totalMembers = members && members.length > 0 ? members.length : MEMBERS.length;

  return (
    <section
      id="pesquisadores"
      className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl sm:rounded-[2.25rem] border border-yellow-400/25 bg-gradient-to-b from-superficie-2 via-fundo to-superficie p-4 sm:p-12 lg:p-16 shadow-[0_20px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(250,204,21,0.08)] select-none"
    >
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.18)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

      <div className="relative z-10 space-y-8 sm:space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <SectionLabel text={textos.etiqueta} />

          <GsapTextReveal
            text={textos.titulo}
            tag="h2"
            type="mask-up"
            className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
            highlightWords={[...textos.palavrasEmDestaque]}
            glowOnView
          />
          <FioDourado />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed"
          >
            {textos.subtitulo}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1 rounded-full border border-white/10 bg-black/40 text-[10px] sm:text-[11px] font-mono text-stone-300">
              <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400" />
              <b className="text-white">{mentorCount}</b> {textos.contadores.mentores}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-[10px] sm:text-[11px] font-mono text-ouro">
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400" />
              {textos.contadores.premio}
            </span>
          </motion.div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {mentorsList.map((member, idx) => (
            <motion.li
              key={member.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <button
                type="button"
                onClick={() => {
                  playSound("pop-bubble");
                  setSelectedMember(member);
                }}
                aria-label={`${textos.botaoPerfil}: ${member.name}`}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-superficie-2 p-2.5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/45 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] cursor-pointer"
              >
                <FotoDoMentor member={member} />

                <div className="flex flex-1 flex-col px-2 pb-1.5 pt-4">
                  <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-ouro">
                    {member.role}
                  </p>
                  <h3 className="mt-1 text-lg sm:text-xl font-extrabold leading-tight tracking-tight text-white">
                    {member.name}
                  </h3>
                  <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-stone-400">
                    <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ouro" />
                    <span>{member.area}</span>
                  </p>

                  {member.quote && (
                    <p className="mt-3 line-clamp-2 border-l-2 border-yellow-400/40 pl-3 text-[13px] italic leading-relaxed text-stone-300">
                      {member.quote}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
                      {textos.rodapeDoCartao}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-ouro">
                      {textos.botaoPerfil}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>

        <div className="text-center pt-2 sm:pt-4">
          <button
            type="button"
            onClick={() => {
              playSound("subtle-click");
              if (onOpenMembers) onOpenMembers();
            }}
            className="group inline-flex items-center gap-2 sm:gap-3 rounded-full px-4 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-yellow-400/20 via-amber-400/15 to-yellow-400/20 border border-yellow-400/50 hover:border-yellow-300 hover:shadow-[0_0_35px_rgba(250,204,21,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg max-w-full text-center"
          >
            <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-ouro shrink-0" />
            <span className="truncate">
              {textos.botaoFinal.replace("{quantidade}", String(totalMembers))}
            </span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 group-hover:translate-x-1.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>

      <MemberModal
        member={selectedMember}
        lista={mentorsList}
        aoTrocar={setSelectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </section>
  );
}
