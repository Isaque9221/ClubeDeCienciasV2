import { useId } from "react";

interface AlternadorProps {
  rotulo: string;
  descricao?: string;
  ligado: boolean;
  aoMudar: (ligado: boolean) => void;
}

export function Alternador({ rotulo, descricao, ligado, aoMudar }: AlternadorProps) {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-labelledby={`${id}-rotulo`}
      aria-describedby={descricao ? `${id}-descricao` : undefined}
      onClick={() => aoMudar(!ligado)}
      className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
    >
      <span className="min-w-0">
        <span id={`${id}-rotulo`} className="block text-sm font-semibold text-white">
          {rotulo}
        </span>
        {descricao && (
          <span id={`${id}-descricao`} className="block text-xs text-stone-400">
            {descricao}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-10 shrink-0 rounded-full border transition-colors ${
          ligado ? "border-yellow-400 bg-yellow-400" : "border-white/20 bg-white/10"
        }`}
      >
        <span
          className={`absolute top-[1px] left-[1px] h-5 w-5 rounded-full bg-[#fffdf9] shadow transition-transform ${
            ligado ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
