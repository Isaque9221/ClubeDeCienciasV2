import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Command, CornerDownLeft, Search } from "lucide-react";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";
import { Janela } from "./componentes/Janela";

export interface Comando {
  id: string;
  grupo: string;
  rotulo: string;
  descricao?: string;
  atalho?: string[];
  palavras?: string;
  executar: () => void;
}

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function PaletaDeComandos({ comandos }: { comandos: Comando[] }) {
  const { janela, fecharJanela } = usePreferencias();
  const aberta = janela === "comandos";
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState(0);
  const listaRef = useRef<HTMLDivElement>(null);

  const filtrados = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    if (!termos.length) return comandos;
    return comandos.filter((c) => {
      const alvo = normalizar(`${c.rotulo} ${c.descricao ?? ""} ${c.palavras ?? ""} ${c.grupo}`);
      return termos.every((t) => alvo.includes(t));
    });
  }, [busca, comandos]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, { comando: Comando; indice: number }[]>();
    filtrados.forEach((comando, indice) => {
      const lista = mapa.get(comando.grupo) ?? [];
      lista.push({ comando, indice });
      mapa.set(comando.grupo, lista);
    });
    return [...mapa.entries()];
  }, [filtrados]);

  const fechar = () => {
    setBusca("");
    setAtivo(0);
    fecharJanela();
  };

  const executar = (comando: Comando | undefined) => {
    if (!comando) return;
    fechar();
    window.setTimeout(comando.executar, 60);
  };

  useEffect(() => {
    listaRef.current
      ?.querySelector(`[data-indice="${ativo}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [ativo]);

  const aoTeclar = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filtrados.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((i) => (i + 1) % filtrados.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((i) => (i - 1 + filtrados.length) % filtrados.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      executar(filtrados[ativo]);
    }
  };

  const idDoAtivo = filtrados[ativo] ? `comando-${filtrados[ativo].id}` : undefined;

  return (
    <Janela
      aberta={aberta}
      aoFechar={fechar}
      id="comandos"
      etiqueta="Comandos"
      titulo="Comandos do site"
      icone={Command}
      larguraMaxima="max-w-xl"
      semCabecalho
    >
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 sm:px-5">
        <Search className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-label="Buscar comando ou seção"
          aria-expanded="true"
          aria-controls="lista-de-comandos"
          aria-autocomplete="list"
          aria-activedescendant={idDoAtivo}
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setAtivo(0);
          }}
          onKeyDown={aoTeclar}
          placeholder="Buscar comando ou seção… (ex.: música, membros)"
          className="h-14 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-stone-400 focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-stone-300 sm:inline">
          Esc
        </kbd>
      </div>

      <div
        ref={listaRef}
        id="lista-de-comandos"
        role="listbox"
        aria-label="Comandos"
        className="max-h-[55vh] overflow-y-auto p-2"
      >
        {grupos.map(([grupo, itens]) => (
          <div key={grupo} role="group" aria-labelledby={`grupo-${grupo}`}>
            <div
              id={`grupo-${grupo}`}
              role="presentation"
              className="px-2.5 pt-2.5 pb-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400"
            >
              {grupo}
            </div>
            {itens.map(({ comando, indice }) => {
              const selecionado = indice === ativo;
              return (
                <div
                  key={comando.id}
                  id={`comando-${comando.id}`}
                  data-indice={indice}
                  role="option"
                  aria-selected={selecionado}
                  onMouseMove={() => setAtivo(indice)}
                  onClick={() => executar(comando)}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 ${
                    selecionado ? "bg-yellow-400/15 text-white" : "text-stone-200"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{comando.rotulo}</span>
                    {comando.descricao && (
                      <span className="block truncate text-xs text-stone-400">
                        {comando.descricao}
                      </span>
                    )}
                  </span>
                  {comando.atalho && (
                    <span className="hidden shrink-0 gap-1 sm:flex" aria-hidden="true">
                      {comando.atalho.map((tecla) => (
                        <kbd
                          key={tecla}
                          className="rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-stone-300"
                        >
                          {tecla}
                        </kbd>
                      ))}
                    </span>
                  )}
                  {selecionado && (
                    <CornerDownLeft
                      className="h-3.5 w-3.5 shrink-0 text-yellow-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {!filtrados.length && (
          <p className="px-3 py-8 text-center text-sm text-stone-400">
            Nada encontrado para “{busca}”. Tente “música”, “membros” ou “ajustes”.
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-white/[0.08] px-4 py-2.5 text-[11px] text-stone-400 sm:px-5">
        <span>↑ ↓ para escolher</span>
        <span>Enter para abrir</span>
        <span className="ml-auto" aria-live="polite">
          {filtrados.length} {filtrados.length === 1 ? "comando" : "comandos"}
        </span>
      </div>
    </Janela>
  );
}
