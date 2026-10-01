import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Play, Pause } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { querMenosMovimento } from "@/compartilhado/utils/movimento";
import { Visor } from "@/compartilhado/componentes";
import { DockDesktop } from "./DockDesktop";
import { MenuExplorar } from "./MenuExplorar";
import { useSound, useData, usePreferencias } from "@/compartilhado/hooks";
import { montarHero } from "./conteudo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HeroDesktopProps {
  onOpenMembers?: () => void;
  onOpenProjects?: () => void;
  onOpenTrajetoria?: () => void;
}

export function HeroDesktop({ onOpenMembers, onOpenProjects, onOpenTrajetoria }: HeroDesktopProps) {
  const { playSound } = useSound();
  const { siteConfig } = useData();
  const conteudo = montarHero(siteConfig);

  const heroRef = useRef<HTMLElement>(null);
  const emVista = useInView(heroRef, { margin: "200px 0px" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const { menosMovimento } = usePreferencias();
  const [videoPausado, setVideoPausado] = useState(menosMovimento);

  useEffect(() => {
    if (menosMovimento) setVideoPausado(true);
  }, [menosMovimento]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPausado) video.pause();
    else video.play().catch(() => {});
  }, [videoPausado, conteudo.videoDeFundo]);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!heroRef.current || querMenosMovimento()) return;

      if (videoRef.current) {
        gsap.to(videoRef.current, {
          yPercent: 18,
          scale: 1.12,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          yPercent: -12,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      id="hero"
      data-tema="escuro"
      className="relative w-full max-w-[1920px] mx-auto overflow-hidden h-auto min-h-[calc(100svh-1rem)] sm:min-h-[calc(100svh-2rem)] lg:h-[calc(100vh-2rem)] lg:min-h-[700px] lg:max-h-[1080px]"
    >
      <div className="relative flex flex-col w-full min-h-[calc(100svh-1rem)] sm:min-h-[calc(100svh-2rem)] lg:block lg:min-h-0 lg:h-full overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-2xl bg-fundo">
        <video
          ref={videoRef}
          key={conteudo.videoDeFundo}
          autoPlay={!videoPausado}
          aria-hidden="true"
          data-nao-imprimir=""
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover scale-[1.02] filter brightness-[0.85] contrast-[1.05] will-change-transform"
          src={conteudo.videoDeFundo}
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2)_0%,rgba(12,10,9,0.75)_65%,rgba(12,10,9,0.96)_100%)] z-[2]" />

        <button
          type="button"
          data-nao-imprimir=""
          onClick={() => setVideoPausado((pausado) => !pausado)}
          aria-label={videoPausado ? "Tocar o vídeo de fundo" : "Pausar o vídeo de fundo"}
          title={videoPausado ? "Tocar o vídeo de fundo" : "Pausar o vídeo de fundo"}
          className="vidro absolute left-4 top-20 z-40 flex h-9 w-9 lg:left-8 lg:top-8 cursor-pointer items-center justify-center rounded-full border text-stone-200 transition-colors hover:text-white sm:left-6 lg:top-6"
        >
          {videoPausado ? (
            <Play className="h-3.5 w-3.5 translate-x-[1px] fill-current" aria-hidden="true" />
          ) : (
            <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          )}
        </button>
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-black/75 via-black/35 to-transparent z-[2]" />
        <Visor folga={16} tamanho={18} className="hidden sm:block" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-fundo via-fundo/70 to-transparent z-[2]" />

        <div className="pointer-events-none absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(254,240,138,0.06)_0%,transparent_70%)] blur-3xl z-[2]" />

        <header
          data-nao-imprimir=""
          className="absolute left-1/2 top-0 z-40 -translate-x-1/2 w-full flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none"
        >
          <nav className="pointer-events-auto relative inline-flex items-center gap-1 sm:gap-2 rounded-full vidro border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_12px_36px_rgba(0,0,0,0.7),0_0_25px_rgba(250,204,21,0.08)] whitespace-nowrap flex-nowrap transition-all duration-300 hover:border-amber-400/40">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

            {conteudo.menu
              .filter((m) => m.rolarPara !== "junte-se")
              .map((item) => {
                const isTrajetoria = item.rolarPara === "trajetoria";

                return (
                  <button
                    type="button"
                    key={item.rolarPara}
                    onClick={(e) => {
                      e.preventDefault();
                      playSound("subtle-click");
                      if (isTrajetoria) {
                        if (onOpenTrajetoria) onOpenTrajetoria();
                        return;
                      }
                      const target = document.getElementById(item.rolarPara);
                      if (target) target.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`relative hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer shrink-0 ${
                      isTrajetoria
                        ? "text-yellow-200 bg-yellow-400/15 border border-yellow-400/40 hover:bg-yellow-400/25 shadow-[0_0_15px_rgba(250,204,21,0.2)] font-bold"
                        : "text-stone-300 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <span>{item.rotulo}</span>
                    {isTrajetoria && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#FACC15]"
                      />
                    )}
                  </button>
                );
              })}

            <div className="hidden lg:block h-4 w-[1px] bg-white/15 mx-0.5 sm:mx-1 shrink-0" />

            <MenuExplorar
              onOpenMembers={onOpenMembers}
              onOpenProjects={onOpenProjects}
              onOpenTrajetoria={onOpenTrajetoria}
            />

            <div className="h-4 w-[1px] bg-white/15 mx-0.5 sm:mx-1 shrink-0" />

            {conteudo.menu
              .filter((m) => m.rolarPara === "junte-se")
              .map((item) => (
                <button
                  type="button"
                  key={item.rolarPara}
                  onClick={(e) => {
                    e.preventDefault();
                    playSound("subtle-click");
                    const target = document.getElementById(item.rolarPara);
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-tight text-stone-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.55)] hover:shadow-[0_0_28px_rgba(250,204,21,0.85)] cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 ml-0.5"
                >
                  <span>{item.rotulo}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-stone-950 stroke-[3]" />
                </button>
              ))}
          </nav>
        </header>

        <div
          ref={contentRef}
          className="relative flex-1 lg:absolute lg:inset-0 z-20 flex flex-col items-center justify-center px-4 text-center will-change-transform pt-32 pb-6 sm:pt-32 sm:pb-10 lg:pt-16 lg:pb-48 lg:-translate-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-3 inline-flex max-w-full items-center gap-2.5 rounded-full border border-yellow-400/25 bg-black/55 backdrop-blur-md px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(250,204,21,0.12)]"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <span className="text-white/95 font-bold">{conteudo.selo.marca}</span>
            <span aria-hidden="true" className="text-stone-500">
              •
            </span>
            <span className="text-ouro font-medium truncate">{conteudo.selo.cidade}</span>
            <span aria-hidden="true" className="text-stone-500 hidden sm:inline">
              •
            </span>
            <span className="text-stone-300 hidden sm:inline font-medium truncate">
              {conteudo.selo.frase}
            </span>
          </motion.div>

          <h1 className="sr-only">
            {[
              conteudo.titulo.linhaDeCima,
              conteudo.titulo.linhaDoMeio,
              conteudo.titulo.linhaDeBaixo,
            ]
              .filter(Boolean)
              .join(" ")}
          </h1>

          <div
            aria-hidden="true"
            className="relative max-w-5xl leading-none select-none flex flex-col items-center"
          >
            {emVista &&
              [...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{
                    opacity: 0,
                    x: (i - 2.5) * 80,
                    y: 30,
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: [-10, -90 - i * 15],
                    x: (i - 2.5) * 80 + (i % 2 === 0 ? 20 : -20),
                    scale: [0.6, 1.3, 0.3],
                  }}
                  transition={{
                    duration: 3.5 + i * 0.4,
                    repeat: Infinity,
                    delay: 0.4 + i * 0.3,
                    ease: "easeOut",
                  }}
                  className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-yellow-300 blur-[0.5px] shadow-[0_0_10px_#FACC15] z-0"
                  style={{
                    left: `${50 + (i - 2.5) * 14}%`,
                    top: "50%",
                  }}
                />
              ))}

            <span className="revelar-texto mb-1" data-visivel="">
              <span className="revelar-mascara">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1.1,
                    delay: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="block font-black tracking-[-0.03em] text-[8vw] sm:text-[6.5vw] md:text-[5vw] uppercase"
                  style={{
                    color: "var(--color-ouro)",
                    filter:
                      "url(#contorno-do-titulo) drop-shadow(0 0 12px rgba(250, 204, 21, 0.25))",
                  }}
                >
                  {conteudo.titulo.linhaDeCima}
                </motion.span>
              </span>
            </span>

            <svg aria-hidden="true" width="0" height="0" className="absolute">
              <filter
                id="contorno-do-titulo"
                x="-5%"
                y="-20%"
                width="110%"
                height="140%"
                colorInterpolationFilters="sRGB"
              >
                <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="gorda" />
                <feMorphology in="SourceAlpha" operator="erode" radius="1" result="magra" />
                <feComposite in="gorda" in2="magra" operator="out" result="faixa" />
                <feFlood floodColor="rgba(254, 240, 138, 0.85)" />
                <feComposite in2="faixa" operator="in" />
              </filter>
            </svg>

            <div
              data-visivel=""
              className="revelar-texto relative z-10 inline-flex items-center justify-center whitespace-nowrap px-3 py-1 font-black tracking-tight select-none text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[8.8vw] will-change-transform overflow-visible"
            >
              {conteudo.titulo.linhaDoMeio.split("").map((char, index) => (
                <span key={index} className="revelar-mascara">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 1.1,
                      delay: 0.45 + index * 0.045,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="inline-block cursor-default transition-transform duration-200 hover:-translate-y-2 hover:scale-110">
                      <span className="inline-block flame-color-shift-text drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                        {char}
                      </span>
                    </span>
                  </motion.span>
                </span>
              ))}

              <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
                {emVista && (
                  <motion.div
                    initial={{ x: "-150%", opacity: 0 }}
                    animate={{ x: "250%", opacity: [0, 0.9, 0] }}
                    transition={{
                      duration: 1.3,
                      delay: 0.9,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] blur-sm"
                  />
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.85,
                delay: 0.75,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 w-full"
            >
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
                className="hidden sm:block flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/70 to-yellow-300 origin-right shadow-[0_0_10px_rgba(250,204,21,0.7)]"
              />

              <motion.div
                initial={{ letterSpacing: "0.2em", opacity: 0, filter: "blur(8px)" }}
                animate={{
                  letterSpacing: "0.55em",
                  opacity: 1,
                  filter: "blur(0px)",
                  transitionEnd: { filter: "none" },
                }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-black text-ouro uppercase tracking-[0.35em] sm:tracking-[0.5em] md:tracking-[0.55em] text-[7vw] sm:text-[4.8vw] md:text-[3.4vw] lg:text-[2.5vw] shrink-0"
                style={{
                  textShadow:
                    "0 0 25px rgba(250, 204, 21, 0.85), 0 0 55px rgba(234, 179, 8, 0.5), 0 2px 10px rgba(0, 0, 0, 0.9)",
                }}
              >
                {conteudo.titulo.linhaDeBaixo}
              </motion.div>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
                className="hidden sm:block flex-1 h-[1.5px] bg-gradient-to-l from-transparent via-amber-400/70 to-yellow-300 origin-left shadow-[0_0_10px_rgba(250,204,21,0.7)]"
              />
            </motion.div>
          </div>
        </div>

        <DockDesktop
          onOpenMembers={onOpenMembers}
          onOpenProjects={onOpenProjects}
          onOpenTrajetoria={onOpenTrajetoria}
        />
      </div>
    </section>
  );
}
