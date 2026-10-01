import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ArrowUpRight,
  Terminal,
  Compass,
  Mail,
  MapPin,
  ChevronUp,
  Globe2,
  X,
  ExternalLink,
} from "lucide-react";
import { CeuEmExposicao, LogoDoParceiro, Visor } from "@/compartilhado/componentes";
import { useSound } from "@/compartilhado/hooks/useSound";
import { useData } from "@/compartilhado/hooks/useData";
import { useFundoDoLogo } from "@/compartilhado/hooks/useFundoDoLogo";
import { useFocoNaJanela } from "@/compartilhado/hooks/useFocoNaJanela";
import { resolvePartnerLogo } from "@/compartilhado/utils/logo-do-parceiro";
import { NAV_LINKS } from "@/compartilhado/dados/partners.data";
import type { Partner } from "@/compartilhado/tipos/partner.types";
import { RODAPE, montarRodape } from "./conteudo";

export interface RodapeProps {
  onOpenAdmin?: () => void;
  onOpenTrajetoria?: () => void;
}

function QuadroDeTelemetria({
  telemetria,
}: {
  telemetria: ReturnType<typeof montarRodape>["telemetria"];
}) {
  const [horario, setHorario] = useState("");

  useEffect(() => {
    const atualizar = () => {
      const agora = new Date();
      setHorario(
        agora.toLocaleTimeString("pt-BR", {
          timeZone: "America/Bahia",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    atualizar();
    const intervalo = setInterval(atualizar, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="rounded-lg sm:rounded-2xl border border-white/[0.08] bg-black/40 p-2.5 sm:p-4 font-mono text-[10.5px] sm:text-[11px] space-y-1.5 sm:space-y-2 text-stone-400">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
        <span className="text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 text-yellow-400" /> {telemetria.rotuloLocalidade}
        </span>
        <span className="text-ouro font-medium">{telemetria.cidade}</span>
      </div>
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
        <span className="text-stone-500 uppercase tracking-wider">
          {telemetria.rotuloBiomaAltitude}
        </span>
        <span className="text-stone-300">
          {telemetria.bioma} · {telemetria.altitude}
        </span>
      </div>
      {telemetria.coordenadas && (
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
          <span className="text-stone-500 uppercase tracking-wider">
            {telemetria.rotuloCoordenadas}
          </span>
          <span className="text-stone-300">{telemetria.coordenadas}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
        <span className="text-stone-500 uppercase tracking-wider">{telemetria.rotuloHorario}</span>
        <span className="text-stone-200">
          {horario || "00:00:00"} {telemetria.sufixoDoHorario}
        </span>
      </div>
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-stone-500 uppercase tracking-wider">{telemetria.rotuloStatus}</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {telemetria.statusOnline}
        </span>
      </div>
    </div>
  );
}

function LinhaDeContato({
  valor,
  rotulo,
  icon: Icon,
  tipo = "copiar",
  textos,
}: {
  valor: string;
  rotulo: string;
  icon: React.ElementType;
  tipo?: "copiar" | "email";
  textos: typeof RODAPE.contatos;
}) {
  const [copiado, setCopiado] = useState(false);
  const { playSound } = useSound();

  const aoClicar = (e: React.MouseEvent) => {
    if (tipo === "email" && valor.includes("@")) {
      playSound("pop-bubble");
      window.location.href = `mailto:${valor}`;
      return;
    }
    e.preventDefault();
    navigator.clipboard.writeText(valor);
    playSound("pop-bubble");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2400);
  };

  return (
    <div
      onClick={aoClicar}
      className="group relative flex items-center justify-between gap-2 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-yellow-400/30 hover:bg-yellow-400/[0.03] transition-all duration-300 cursor-pointer"
      title={tipo === "email" ? textos.dicaEnviarEmail : textos.dicaCopiar}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg border border-white/[0.1] bg-white/[0.03] text-stone-400 group-hover:text-yellow-300 group-hover:border-yellow-400/40 group-hover:bg-yellow-400/10 transition-all duration-300 shadow-sm">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-stone-500 group-hover:text-amber-300/80 transition-colors">
            {rotulo}
          </p>
          <p className="font-mono text-[10.5px] sm:text-xs text-stone-200 group-hover:text-white transition-colors break-words">
            {valor}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {copiado ? (
          <motion.span
            key="copiado"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1 shrink-0 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30"
          >
            <Check className="h-3 w-3" /> {textos.acaoCopiado}
          </motion.span>
        ) : (
          <span className="font-mono text-[10px] text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 group-hover:text-amber-400">
            {tipo === "email" ? (
              <>
                {textos.acaoEnviar} <ArrowUpRight className="h-3 w-3" />
              </>
            ) : (
              <>
                {textos.acaoCopiar} <Copy className="h-3 w-3" />
              </>
            )}
          </span>
        )}
      </AnimatePresence>
    </div>
  );
}

const PARTNER_WEBSITES: Record<string, string> = {
  cnpq: "https://www.gov.br/cnpq",
  fapesp: "https://fapesp.br",
  ufba: "https://www.ufba.br",
  uefs: "https://www.uefs.br",
  lefhbio: "https://lefhbio.uefs.br",
  feciba: "http://feciba.educacao.ba.gov.br",
};

function PartnerModal({ partner, onClose }: { partner: Partner | null; onClose: () => void }) {
  const { playSound } = useSound();
  const [montado, setMontado] = useState(false);
  const janelaRef = useRef<HTMLDivElement>(null);
  useFocoNaJanela(!!partner, janelaRef);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!partner) return;

    const overflowOriginal = document.body.style.overflow;
    const paddingOriginal = document.body.style.paddingRight;
    const larguraDaBarra = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (larguraDaBarra > 0) {
      document.body.style.paddingRight = `${larguraDaBarra}px`;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.body.style.paddingRight = paddingOriginal;
      window.removeEventListener("keydown", handleKey);
    };
  }, [partner, onClose]);

  const logoUrl = partner ? resolvePartnerLogo(partner) : "";
  const fundoDoLogo = useFundoDoLogo(logoUrl || undefined);

  if (!montado || typeof document === "undefined") return null;
  const websiteUrl = partner
    ? PARTNER_WEBSITES[partner.id] ||
      "https://www.google.com/search?q=" + encodeURIComponent(partner.fullName)
    : "";

  return createPortal(
    <AnimatePresence>
      {partner && (
        <div
          className="fixed inset-0 z-[99990] grid place-items-center p-3 sm:p-6"
          style={{ position: "fixed", inset: 0, zIndex: 99990 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              playSound("subtle-click");
              onClose();
            }}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
            style={{ position: "fixed", inset: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            ref={janelaRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-do-parceiro"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-superficie-2 p-4 text-left shadow-[0_30px_80px_rgba(0,0,0,0.9)] sm:p-7"
          >
            <button
              type="button"
              onClick={() => {
                playSound("subtle-click");
                onClose();
              }}
              className="absolute right-3 top-3 rounded-lg p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer sm:right-4 sm:top-4"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-3 pr-8 sm:mb-5 sm:gap-4">
              <span
                className={`placa-do-logo placa-do-logo--${fundoDoLogo} h-16 w-20 shrink-0 p-2.5 sm:h-20 sm:w-24 sm:p-3`}
              >
                <LogoDoParceiro
                  partner={partner}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                />
              </span>
              <div className="min-w-0">
                <span className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-yellow-400 sm:text-[10px]">
                  {partner.category} · {partner.type}
                </span>
                <h3
                  id="titulo-do-parceiro"
                  className="mt-0.5 text-base font-bold text-white sm:text-xl"
                >
                  {partner.name}
                </h3>
                <p className="line-clamp-2 text-[11px] text-stone-300 sm:text-xs">
                  {partner.fullName}
                </p>
              </div>
            </div>

            <p className="mb-5 text-xs font-light leading-relaxed text-stone-300 sm:mb-6 sm:text-sm">
              {partner.desc}
            </p>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3.5 sm:pt-4">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-yellow-400 transition-colors hover:text-yellow-300 sm:text-xs"
              >
                <span>Acessar portal oficial</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  playSound("subtle-click");
                  onClose();
                }}
                className="rounded-xl bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/15 cursor-pointer sm:px-4 sm:py-2 sm:text-xs"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function FichaDoParceiro({
  partner,
  repetida,
  onSelecionar,
}: {
  partner: Partner;
  repetida: boolean;
  onSelecionar: () => void;
}) {
  const logoUrl = resolvePartnerLogo(partner);
  const fundo = useFundoDoLogo(logoUrl);

  return (
    <button
      type="button"
      tabIndex={repetida ? -1 : 0}
      aria-hidden={repetida || undefined}
      onClick={onSelecionar}
      className="ficha-parceiro group"
      aria-label={`${partner.name} — ${partner.fullName}`}
    >
      <span className={`placa-do-logo placa-do-logo--${fundo} ficha-parceiro__palco`}>
        <LogoDoParceiro partner={partner} className="logo-parceiro" />
      </span>

      <span className="ficha-parceiro__nome">{partner.name}</span>
      <span className="ficha-parceiro__area">{partner.category}</span>
    </button>
  );
}

export function Rodape({ onOpenAdmin, onOpenTrajetoria }: RodapeProps) {
  const { partners, siteConfig } = useData();

  const ritmo = siteConfig.footerPartnersSpeed?.trim() || "normal";
  const LARGURA_DA_FICHA = 244;

  const repeticoes = Math.max(1, Math.ceil(1800 / Math.max(1, partners.length * LARGURA_DA_FICHA)));

  const parceirosDaFaixa = Array.from({ length: repeticoes }).flatMap(() => partners);

  const pixelsPorSegundo = ritmo === "lento" ? 28 : ritmo === "rapido" ? 95 : 55;

  const duracaoDaFaixa = Math.max(
    12,
    Math.round((parceirosDaFaixa.length * LARGURA_DA_FICHA) / pixelsPorSegundo)
  );
  const { playSound } = useSound();
  const [partnerSelecionado, setPartnerSelecionado] = useState<Partner | null>(null);
  const conteudo = montarRodape(siteConfig);

  const voltarAoTopo = () => {
    playSound("pop-bubble");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rolarAte = (id: string) => {
    playSound("subtle-click");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative w-screen ml-[calc(50%-50vw)] -mb-2 sm:-mb-4 overflow-hidden border-t border-yellow-400/25 bg-fundo-profundo text-stone-300 shadow-[0_-20px_80px_rgba(0,0,0,0.6)] mt-5 sm:mt-12 select-none">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-yellow-400/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="relative z-10 border-b border-white/[0.08] bg-black/40 py-2.5 sm:py-3.5 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-12 lg:px-16 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </span>
            <span className="font-bold tracking-widest text-ouro uppercase">
              {conteudo.marcaDoTopo}
            </span>
          </div>
          <span className="hidden font-mono text-[11px] tracking-[0.18em] text-stone-500 uppercase sm:inline">
            {RODAPE.telemetria.cidade} · {RODAPE.telemetria.bioma}
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-3 sm:px-10 lg:px-16 py-7 sm:py-16 border-b border-white/[0.07]">
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-12 space-y-1.5 sm:space-y-2">
          <span className="text-[10.5px] sm:text-[11px] font-mono tracking-[0.18em] sm:tracking-[0.25em] text-yellow-400/90 claro:text-yellow-400 uppercase font-semibold">
            {conteudo.parceiros.etiqueta}
          </span>
          <h3 className="text-lg sm:text-3xl lg:text-4xl font-black tracking-tight text-white text-balance">
            {conteudo.parceiros.titulo}
          </h3>
          <p className="text-[10.5px] sm:text-sm text-stone-400 font-light leading-relaxed text-pretty">
            {conteudo.parceiros.subtitulo}
          </p>
        </div>

        <div
          className="faixa-parceiros"
          style={
            {
              "--faixa-duracao": `${duracaoDaFaixa}s`,
            } as React.CSSProperties
          }
        >
          <div className="faixa-parceiros__trilho">
            {[0, 1].map((copia) => (
              <div key={copia} className="faixa-parceiros__metade" aria-hidden={copia === 1}>
                {parceirosDaFaixa.map((partner, i) => (
                  <FichaDoParceiro
                    key={`${copia}-${i}-${partner.id}`}
                    partner={partner}
                    repetida={copia === 1 || i >= partners.length}
                    onSelecionar={() => {
                      playSound("subtle-click");
                      setPartnerSelecionado(partner);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-3 sm:px-12 lg:px-16 py-5 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-10 lg:gap-14">
          <div className="md:col-span-5 space-y-2.5 sm:space-y-5">
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-ouro font-bold uppercase">
                {RODAPE.identidade.etiqueta}
              </span>
              <h2 className="text-sm sm:text-xl font-black tracking-tight text-white uppercase mt-0.5 sm:mt-1">
                {conteudo.identidade.nomeDoClube}
              </h2>
            </div>

            <p className="font-serif italic text-[10.5px] sm:text-sm text-stone-400 leading-relaxed border-l-2 border-yellow-400/40 pl-2.5 sm:pl-3.5">
              "{conteudo.identidade.frase}"
            </p>

            <QuadroDeTelemetria telemetria={conteudo.telemetria} />

            <div className="pt-1">
              <a
                href={conteudo.identidade.linkDoInstagram}
                target="_blank"
                rel="noreferrer"
                onClick={() => playSound("pop-bubble")}
                className="group inline-flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] font-mono text-[11px] sm:text-xs text-stone-300 hover:text-white transition-all shadow-sm max-w-full"
              >
                <span className="text-stone-400 group-hover:text-yellow-300 truncate">
                  {RODAPE.identidade.rotuloDoInstagram}
                </span>
                <span className="text-ouro font-bold truncate">
                  {conteudo.identidade.instagram}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-stone-500 group-hover:text-yellow-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-stone-400 pb-2 border-b border-white/[0.08] font-bold">
              <Compass className="h-3.5 w-3.5 text-yellow-400" />
              <span>{conteudo.navegacao.titulo}</span>
            </div>
            <ul className="space-y-1 sm:space-y-1.5">
              {NAV_LINKS.map((link, idx) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (link.id === "trajetoria") {
                        if (onOpenTrajetoria) onOpenTrajetoria();
                        return;
                      }
                      rolarAte(link.id);
                    }}
                    className="group flex items-center justify-between text-[11px] sm:text-[13px] text-stone-400 hover:text-ouro transition-colors duration-200 cursor-pointer text-left w-full py-2 sm:py-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[10px] text-stone-500 group-hover:text-yellow-400 transition-colors"
                      >
                        0{idx + 1}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-stone-600 opacity-0 group-hover:opacity-100 group-hover:text-yellow-400 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-stone-400 pb-2 border-b border-white/[0.08] font-bold">
              <Mail className="h-3.5 w-3.5 text-yellow-400" />
              <span>{conteudo.contatos.titulo}</span>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              <LinhaDeContato
                rotulo={RODAPE.contatos.rotuloEmail}
                valor={conteudo.contatos.email}
                icon={Mail}
                tipo="email"
                textos={RODAPE.contatos}
              />
              <LinhaDeContato
                rotulo={RODAPE.contatos.rotuloEndereco}
                valor={conteudo.contatos.endereco}
                icon={MapPin}
                tipo="copiar"
                textos={RODAPE.contatos}
              />
              <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] font-mono text-[10px] sm:text-[11px] text-stone-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                <span>{RODAPE.contatos.aviso}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden border-t border-white/[0.08] py-5 sm:py-14 select-none bg-gradient-to-b from-black/40 via-yellow-400/[0.03] to-black/60">
        <CeuEmExposicao polo={[0.5, 0.5]} giro={[10, 70]} quantidade={1.4} intensidade={0.75} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-28 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.18)_0%,transparent_70%)] blur-3xl" />
        <Visor folga={12} tamanho={16} />

        <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 sm:px-12 lg:px-16 flex flex-col items-center justify-center text-center">
          <span className="block font-black text-[clamp(1.3rem,7vw,5.6rem)] tracking-tight uppercase flame-color-shift-text leading-none select-none drop-shadow-[0_10px_35px_rgba(250,204,21,0.35)]">
            {conteudo.assinatura.linhaGrande}
          </span>
          <span className="block font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.55em] text-ouro uppercase mt-1.5 sm:mt-2.5 opacity-90 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
            {conteudo.assinatura.linhaPequena}
          </span>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/[0.08] bg-fundo-profundo">
        <div className="mx-auto w-full max-w-[1800px] px-3 sm:px-12 lg:px-16 py-3 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 font-mono text-[10.5px] sm:text-[11px] text-stone-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 sm:gap-x-3 gap-y-1">
            <span className="text-stone-400 font-semibold">
              © {new Date().getFullYear()} {conteudo.creditos.marca}
            </span>
            <span aria-hidden="true" className="text-stone-700">
              ·
            </span>
            <span>{RODAPE.creditos.cidade}</span>
            <span aria-hidden="true" className="text-stone-700">
              ·
            </span>
            <span>
              {RODAPE.creditos.prefixoDoAutor}{" "}
              <span className="text-stone-300 font-semibold">{conteudo.creditos.autor}</span>
            </span>
            {onOpenAdmin && (
              <>
                <span aria-hidden="true" className="text-stone-700">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playSound("mechanical");
                    onOpenAdmin();
                  }}
                  className="text-stone-500 hover:text-yellow-400 transition-colors cursor-pointer inline-flex min-h-6 items-center gap-1.5 hover:underline"
                  title={RODAPE.creditos.dicaDoBotaoAdmin}
                >
                  <Terminal className="h-3 w-3 text-yellow-400/80" />
                  <span>{RODAPE.creditos.botaoAdmin}</span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={voltarAoTopo}
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-stone-400 hover:text-ouro transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-yellow-400/40 bg-white/[0.02]"
          >
            <span>{RODAPE.creditos.botaoVoltarAoTopo}</span>
            <ChevronUp className="h-3.5 w-3.5 text-stone-500 group-hover:text-yellow-400 group-hover:-translate-y-0.5 transition-all" />
          </button>
        </div>
      </div>

      <PartnerModal partner={partnerSelecionado} onClose={() => setPartnerSelecionado(null)} />
    </footer>
  );
}
