import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/compartilhado/hooks/useData";
import { FioDourado, GsapTextReveal, SectionLabel } from "@/compartilhado/componentes";
import { montarEquipe, montarTextosDaEquipe, type Lider } from "./conteudo";

export function EquipeSection() {
  const { siteConfig } = useData();
  const lideres = [...montarEquipe(siteConfig)].sort(
    (a, b) => Number(b.emDestaque) - Number(a.emDestaque)
  );
  const textos = montarTextosDaEquipe(siteConfig);

  return (
    <section id="equipe" aria-labelledby="titulo-da-equipe" className="relative py-4 sm:py-10">
      <div className="mx-auto mb-8 max-w-3xl space-y-3 px-4 text-center sm:mb-12">
        <SectionLabel text={textos.etiqueta} />
        <div id="titulo-da-equipe">
          <GsapTextReveal
            text={textos.titulo}
            tag="h2"
            type="mask-up"
            className="text-3xl font-bold leading-[1.1] tracking-tight text-balance text-white sm:text-5xl"
            highlightWords={[...textos.palavrasEmDestaque]}
          />
        </div>
        <FioDourado />
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-pretty text-stone-400 sm:text-lg">
          {textos.subtitulo}
        </p>
      </div>

      <div className="mx-auto grid max-w-lg grid-cols-1 gap-5 px-4 sm:gap-6 sm:px-6 lg:max-w-[70rem] lg:grid-cols-5">
        {lideres.map((lider, idx) => (
          <CardDeLider key={lider.id} lider={lider} idx={idx} />
        ))}
      </div>
    </section>
  );
}

function CardDeLider({ lider, idx }: { lider: Lider; idx: number }) {
  const [erroNaFoto, setErroNaFoto] = useState(false);
  const IconeDaCategoria = lider.categoria.icone;
  const destaque = lider.emDestaque;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col overflow-hidden rounded-[28px] border bg-superficie transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)] ${
        destaque
          ? "border-yellow-400/40 hover:border-yellow-400/70 lg:col-span-3"
          : "border-white/10 hover:border-white/20 lg:col-span-2"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-superficie-2 ${
          destaque ? "aspect-[4/3] lg:aspect-[16/10]" : "aspect-[4/3]"
        }`}
      >
        {lider.foto && !erroNaFoto ? (
          <img
            src={lider.foto}
            alt={lider.nome}
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover object-[50%_30%] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            onError={() => setErroNaFoto(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <IconeDaCategoria aria-hidden="true" className="h-16 w-16 text-stone-600" />
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-1.5 ${destaque ? "p-6 sm:p-8" : "p-5 sm:p-7"}`}>
        <p className="text-xs font-semibold text-yellow-400 sm:text-sm">{lider.cargo}</p>
        <h3
          className={`font-bold leading-tight tracking-tight text-white ${
            destaque ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          {lider.nome}
        </h3>
        <p className="text-sm text-stone-400">{lider.area}</p>

        {lider.bio && (
          <p
            className={`mt-3 leading-relaxed text-pretty text-stone-300 ${
              destaque ? "text-[15px] sm:text-base" : "text-sm sm:text-[15px]"
            }`}
          >
            {lider.bio}
          </p>
        )}

        {lider.citacao && (
          <blockquote className="mt-auto pt-4 text-sm italic text-stone-400">
            “{lider.citacao}”
          </blockquote>
        )}
      </div>
    </motion.article>
  );
}
