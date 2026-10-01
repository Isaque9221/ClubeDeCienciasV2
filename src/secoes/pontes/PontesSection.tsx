import type React from "react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  GraduationCap,
  HeartHandshake,
  School,
  Network,
  Handshake,
  Building2,
} from "lucide-react";
import { FioDourado, GsapTextReveal, SectionLabel } from "@/compartilhado/componentes";
import { useData } from "@/compartilhado/hooks/useData";
import { montarPontes } from "./conteudo";

const ICONES: Record<string, React.ElementType> = {
  Landmark,
  GraduationCap,
  HeartHandshake,
  School,
};

export function PontesSection() {
  const { siteConfig } = useData();
  const textos = montarPontes(siteConfig);

  const totalDeOrganizacoes = textos.grupos.reduce(
    (soma, grupo) => soma + grupo.parceiros.length,
    0
  );

  return (
    <div id="pontes" className="space-y-5 sm:space-y-12 px-3 sm:px-6">
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <SectionLabel text={textos.etiqueta} />

        <GsapTextReveal
          text={textos.titulo}
          tag="h2"
          type="mask-up"
          className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight text-balance"
          highlightWords={[...textos.palavrasEmDestaque]}
          glowOnView
        />
        <FioDourado />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[11px] sm:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed text-pretty"
        >
          {textos.subtitulo}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 pt-0.5 sm:pt-1"
        >
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-white/10 bg-black/40 text-[10.5px] sm:text-[11px] font-mono text-stone-300">
            <Handshake className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-yellow-400" />
            <b className="text-white">{textos.grupos.length}</b> {textos.contadores.frentes}
          </span>
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-[10.5px] sm:text-[11px] font-mono text-ouro">
            <Building2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-yellow-400" />
            <b className="text-white">{totalDeOrganizacoes}</b> {textos.contadores.organizacoes}
          </span>
        </motion.div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col">
        {textos.grupos.map((grupo, idx) => {
          const Icone = ICONES[grupo.icone] || Network;

          return (
            <Fragment key={grupo.id}>
              {idx > 0 && (
                <div aria-hidden className="flex h-2.5 items-stretch pl-[26px] sm:h-5 sm:pl-[52px]">
                  <span className="w-px bg-gradient-to-b from-yellow-400/5 via-yellow-400/50 to-yellow-400/5" />
                </div>
              )}

              <motion.article
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
                className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br from-superficie-2 via-superficie to-superficie-2 transition-colors duration-300 hover:border-yellow-400/45 sm:rounded-3xl"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(250,204,21,0.09)_0%,transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute bottom-5 left-0 top-5 w-[3px] rounded-r-full bg-gradient-to-b from-yellow-400/0 via-yellow-400/70 to-yellow-400/0 opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="pointer-events-none absolute -bottom-3 right-2 select-none text-[3rem] font-black leading-none text-white/[0.025] sm:-bottom-5 sm:right-6 sm:text-[7rem]">
                  {grupo.indice}
                </span>

                <div className="relative grid grid-cols-1 gap-2.5 p-3 sm:gap-6 sm:p-7 md:grid-cols-12 md:items-start">
                  <header className="md:col-span-4 md:border-r md:border-white/[0.07] md:pr-6">
                    <div className="flex items-center gap-2 sm:gap-3.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-400/30 bg-yellow-400/[0.08] text-ouro shadow-[0_0_20px_rgba(250,204,21,0.12)] transition-all duration-300 group-hover:scale-105 group-hover:border-yellow-400/60 group-hover:bg-yellow-400/15 sm:h-12 sm:w-12 sm:rounded-2xl">
                        <Icone className="h-4 w-4 sm:h-6 sm:w-6" />
                      </span>

                      <div className="min-w-0">
                        <span className="block font-mono text-[10px] font-bold tracking-[0.2em] text-yellow-400/70 claro:text-yellow-400 sm:text-[10px] sm:tracking-[0.25em]">
                          {grupo.indice}
                        </span>
                        <h3 className="text-balance text-xs font-black leading-tight text-white transition-colors group-hover:text-yellow-100 sm:text-base">
                          {grupo.titulo}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-2.5 hidden text-[11px] italic leading-relaxed text-stone-400 md:block">
                      {grupo.resumo}
                    </p>
                  </header>

                  <div
                    className={`grid gap-1.5 sm:gap-3 md:col-span-8 ${
                      grupo.parceiros.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {grupo.parceiros.map((parceiro) => (
                      <div
                        key={parceiro.nome}
                        className="rounded-lg border border-white/[0.07] bg-black/40 p-2.5 transition-colors duration-300 hover:border-yellow-400/35 hover:bg-black/60 sm:rounded-2xl sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-balance text-[11px] font-black leading-tight text-white sm:text-sm">
                            {parceiro.nome}
                          </span>
                          <span className="h-1.5 w-1.5 shrink-0 translate-y-1.5 rounded-full bg-yellow-400/70 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
                        </div>

                        <span className="mt-1 inline-block rounded border border-yellow-400/25 bg-yellow-400/[0.08] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-ouro sm:mt-1.5 sm:rounded-md sm:text-[10px]">
                          {parceiro.etiqueta}
                        </span>

                        <p className="mt-1.5 text-[10px] leading-relaxed text-stone-400 sm:mt-2 sm:text-xs">
                          {parceiro.detalhe}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
