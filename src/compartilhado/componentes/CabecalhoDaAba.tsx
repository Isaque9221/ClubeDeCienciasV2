import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useSound } from "@/compartilhado/hooks/useSound";

interface CabecalhoDaAbaProps {
  onVoltar: () => void;
  rotuloVoltar: string;
  marca: string;
  titulo: string;
  contador: ReactNode;
  children?: ReactNode;
}

export function CabecalhoDaAba({
  onVoltar,
  rotuloVoltar,
  marca,
  titulo,
  contador,
  children,
}: CabecalhoDaAbaProps) {
  const { playSound } = useSound();
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const medir = () => setRolou(window.scrollY > 12);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 select-none">
      <div
        className={`vidro relative overflow-hidden border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-500 ${
          rolou
            ? "border-amber-400/20 bg-superficie-2/90 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.9)]"
            : "border-amber-400/10 bg-superficie-3/70 shadow-none"
        }`}
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/[0.07] via-transparent to-amber-500/[0.07]" />
        <span className="pointer-events-none absolute top-0 left-1/2 h-24 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(250,204,21,0.09)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-8 sm:py-3">
          <button
            type="button"
            onClick={() => {
              playSound("subtle-click");
              onVoltar();
            }}
            className="group inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/[0.07] px-3.5 py-2 text-[12.5px] font-semibold text-amber-50 shadow-[inset_0_1px_0_rgba(254,240,138,0.08)] transition-all duration-300 hover:border-amber-300/60 hover:bg-amber-400/15 hover:text-white hover:shadow-[0_0_20px_-4px_rgba(250,204,21,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 active:scale-95 sm:gap-2 sm:px-4 sm:text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-amber-300 transition-transform group-hover:-translate-x-1 sm:h-4 sm:w-4" />
            <span>{rotuloVoltar}</span>
          </button>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-2.5 md:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/30 bg-black/30 shadow-[0_0_18px_-4px_rgba(250,204,21,0.5)]">
              <img
                src="/emblemas/Logo Inicio.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-mono text-[9.5px] font-bold tracking-[0.28em] text-amber-300/70 uppercase">
                {marca}
              </span>
              <span className="mt-1 text-sm font-extrabold tracking-tight text-white">
                {titulo}
              </span>
            </span>
          </div>

          <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-400/15 to-yellow-300/[0.06] px-3 py-1.5 font-mono text-[11px] font-bold text-ouro shadow-[0_0_18px_-6px_rgba(250,204,21,0.5)] sm:text-xs">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
            </span>
            <span className="truncate">{contador}</span>
          </span>
        </div>
      </div>
      {children}
    </header>
  );
}
