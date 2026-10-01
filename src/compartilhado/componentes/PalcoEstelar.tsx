import { useId, type CSSProperties, type ReactNode } from "react";

export function CeuEstrelado({ className = "" }: { className?: string }) {
  return (
    <div className={`ceu-estrelado z-0 ${className}`} aria-hidden="true">
      <span className="ceu-poeira" />
    </div>
  );
}

export function CantosDaMoldura() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <span className="absolute top-[14px] left-[14px] h-[22px] w-[22px] border-t-2 border-l-2 border-amber-400/30" />
      <span className="absolute top-[14px] right-[14px] h-[22px] w-[22px] border-t-2 border-r-2 border-amber-400/30" />
      <span className="absolute bottom-[14px] left-[14px] h-[22px] w-[22px] border-b-2 border-l-2 border-amber-400/30" />
      <span className="absolute bottom-[14px] right-[14px] h-[22px] w-[22px] border-b-2 border-r-2 border-amber-400/30" />
    </div>
  );
}

export function HorizonteDoSertao({ className = "" }: { className?: string }) {
  const brilho = `hz-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[clamp(120px,24vh,230px)] ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        className="block h-full w-full"
      >
        <defs>
          <linearGradient id={brilho} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b45309" stopOpacity="0" />
            <stop offset=".45" stopColor="#b45309" stopOpacity=".07" />
            <stop offset=".64" stopColor="#f59e0b" stopOpacity=".2" />
          </linearGradient>
        </defs>
        <rect width="1440" height="200" fill={`url(#${brilho})`} />
        <path
          fill="#0a0806"
          d="M0 200V134C90 126 170 120 260 124C360 129 430 112 540 114C650 116 700 130 800 128C910 126 980 106 1100 110C1210 114 1290 126 1360 122C1400 120 1425 123 1440 124V200Z"
        />
        <path
          fill="none"
          stroke="#fde68a"
          strokeOpacity=".22"
          d="M0 134C90 126 170 120 260 124C360 129 430 112 540 114C650 116 700 130 800 128C910 126 980 106 1100 110C1210 114 1290 126 1360 122C1400 120 1425 123 1440 124"
        />
        <g fill="none" stroke="#0a0806" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth="6" d="M648 118V92M648 108H657V99" />
          <path strokeWidth="5" d="M1180 112V92M1180 103H1172V96" />
          <path strokeWidth="4" d="M420 122V106M420 114H426V109" />
        </g>
        <path
          fill="#040303"
          d="M0 200V162C140 158 260 164 400 160C560 155 700 163 860 159C1020 155 1160 162 1300 158C1370 156 1410 159 1440 158V200Z"
        />
        <g fill="none" stroke="#040303" strokeLinecap="round" strokeLinejoin="round">
          <path strokeWidth="13" d="M170 164V74" />
          <path strokeWidth="10" d="M170 126H150V98M170 110H191V82" />
          <path strokeWidth="11" d="M892 162V90" />
          <path strokeWidth="8" d="M892 130H875V108M892 116H908V96" />
          <path strokeWidth="14" d="M1110 162V62" />
          <path strokeWidth="10" d="M1110 120H1087V90M1110 102H1134V72" />
          <path strokeWidth="8" d="M1110 136H1129V120" />
          <path strokeWidth="10" d="M1272 160V98" />
          <path strokeWidth="7" d="M1272 134H1257V114" />
          <path strokeWidth="9" d="M330 162V118" />
          <path strokeWidth="6" d="M330 144H343V129" />
          <path strokeWidth="5" d="M522 162V132" />
          <path
            strokeWidth="3"
            d="M522 142L502 120L492 114M522 140L542 114L554 108M522 134L517 110M502 120L498 108M542 114L548 102"
          />
        </g>
        <g fill="#040303">
          <circle cx="238" cy="160" r="10" />
          <circle cx="252" cy="155" r="12" />
          <circle cx="267" cy="160" r="9" />
          <circle cx="968" cy="159" r="11" />
          <circle cx="984" cy="153" r="13" />
          <circle cx="1000" cy="159" r="10" />
          <circle cx="1352" cy="157" r="9" />
          <circle cx="1364" cy="153" r="11" />
          <circle cx="1377" cy="158" r="8" />
          <circle cx="700" cy="161" r="7" />
          <circle cx="711" cy="158" r="9" />
        </g>
      </svg>
    </div>
  );
}

export function Mira({
  ativa,
  travada,
  folga = 12,
  folgaNoCelular = 4,
}: {
  ativa: boolean;
  travada: boolean;
  folga?: number;
  folgaNoCelular?: number;
}) {
  const recuo = travada ? 3 : ativa ? 0 : -6;
  const cor = travada
    ? "border-amber-200 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)]"
    : "border-amber-300";
  const base = `pointer-events-none absolute h-3 w-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:h-4 sm:w-4 ${cor} ${
    ativa || travada ? "opacity-100" : "opacity-0"
  }`;
  const folgas = {
    "--folga": `${-folgaNoCelular}px`,
    "--folga-sm": `${-folga}px`,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [--f:var(--folga)] sm:[--f:var(--folga-sm)]"
      style={folgas}
    >
      <span
        className={`${base} top-[var(--f)] left-[var(--f)] rounded-tl-md border-t-2 border-l-2`}
        style={{ transform: `translate(${recuo}px, ${recuo}px)` }}
      />
      <span
        className={`${base} top-[var(--f)] right-[var(--f)] rounded-tr-md border-t-2 border-r-2`}
        style={{ transform: `translate(${-recuo}px, ${recuo}px)` }}
      />
      <span
        className={`${base} bottom-[var(--f)] left-[var(--f)] rounded-bl-md border-b-2 border-l-2`}
        style={{ transform: `translate(${recuo}px, ${-recuo}px)` }}
      />
      <span
        className={`${base} right-[var(--f)] bottom-[var(--f)] rounded-br-md border-r-2 border-b-2`}
        style={{ transform: `translate(${-recuo}px, ${-recuo}px)` }}
      />
    </span>
  );
}

export function Tecla({ children, acesa = false }: { children: ReactNode; acesa?: boolean }) {
  return (
    <kbd
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-b-2 px-1.5 font-mono text-[10px] font-bold transition-colors duration-300 ${
        acesa
          ? "border-amber-300/60 bg-amber-400/15 text-amber-200"
          : "border-white/10 bg-white/[0.04] text-stone-400"
      }`}
    >
      {children}
    </kbd>
  );
}
