import { Keyboard } from "lucide-react";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";
import { Janela } from "./componentes/Janela";
import { ATALHOS } from "./acoes";

export function JanelaDeAtalhos() {
  const { janela, fecharJanela, preferencias, abrirJanela } = usePreferencias();

  return (
    <Janela
      aberta={janela === "atalhos"}
      aoFechar={fecharJanela}
      id="atalhos"
      etiqueta="Ajuda"
      titulo="Atalhos do teclado"
      icone={Keyboard}
    >
      <div className="px-4 py-4 sm:px-6">
        <table className="w-full border-separate border-spacing-y-1 text-left text-sm">
          <caption className="sr-only">Atalhos do teclado disponíveis no site</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Teclas</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {ATALHOS.map((atalho) => {
              const desligado =
                "umaTecla" in atalho && atalho.umaTecla && !preferencias.atalhosDeUmaTecla;
              return (
                <tr key={atalho.acao} className={desligado ? "opacity-50" : ""}>
                  <td className="w-32 py-1.5 pr-3 align-top whitespace-nowrap">
                    {atalho.teclas().map((tecla) => (
                      <kbd
                        key={tecla}
                        className="mr-1 inline-flex min-w-7 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs font-semibold text-white"
                      >
                        {tecla}
                      </kbd>
                    ))}
                  </td>
                  <td className="py-1.5 text-stone-300">
                    {atalho.acao}
                    {desligado && <span className="text-stone-400"> (desligado nos Ajustes)</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-white/[0.08] px-4 py-3 text-xs text-stone-400 sm:px-6">
        Os atalhos de uma tecla não funcionam enquanto você digita.{" "}
        <button
          type="button"
          onClick={() => abrirJanela("ajustes")}
          className="cursor-pointer font-semibold text-yellow-300 underline underline-offset-2 hover:text-yellow-200"
        >
          Mudar nos Ajustes
        </button>
      </div>
    </Janela>
  );
}
