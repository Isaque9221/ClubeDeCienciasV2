import { useId, useRef, type KeyboardEvent } from "react";

export interface OpcaoSegmentada<T extends string> {
  valor: T;
  rotulo: string;
}

interface ControleSegmentadoProps<T extends string> {
  rotulo: string;
  descricao?: string;
  opcoes: OpcaoSegmentada<T>[];
  valor: T;
  aoMudar: (valor: T) => void;
}

export function ControleSegmentado<T extends string>({
  rotulo,
  descricao,
  opcoes,
  valor,
  aoMudar,
}: ControleSegmentadoProps<T>) {
  const id = useId();
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const atual = Math.max(
    0,
    opcoes.findIndex((o) => o.valor === valor)
  );

  const aoTeclar = (e: KeyboardEvent<HTMLButtonElement>) => {
    const passos: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let destino: number | null = null;
    if (e.key in passos) destino = (atual + passos[e.key] + opcoes.length) % opcoes.length;
    if (e.key === "Home") destino = 0;
    if (e.key === "End") destino = opcoes.length - 1;
    if (destino === null) return;
    e.preventDefault();
    aoMudar(opcoes[destino].valor);
    botoes.current[destino]?.focus();
  };

  return (
    <div className="space-y-1.5">
      <div>
        <span id={`${id}-rotulo`} className="block text-sm font-semibold text-white">
          {rotulo}
        </span>
        {descricao && (
          <span id={`${id}-descricao`} className="block text-xs text-stone-400">
            {descricao}
          </span>
        )}
      </div>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-rotulo`}
        aria-describedby={descricao ? `${id}-descricao` : undefined}
        className="grid gap-1 rounded-xl border border-white/[0.08] bg-black/30 p-1"
        style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}
      >
        {opcoes.map((opcao, i) => {
          const marcada = i === atual;
          return (
            <button
              key={opcao.valor}
              ref={(el) => {
                botoes.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={marcada}
              tabIndex={marcada ? 0 : -1}
              onClick={() => aoMudar(opcao.valor)}
              onKeyDown={aoTeclar}
              className={`min-h-9 cursor-pointer rounded-lg px-2 text-xs font-semibold transition-colors ${
                marcada
                  ? "bg-yellow-400 text-stone-950 shadow-sm"
                  : "text-stone-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {opcao.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
