import { SlidersHorizontal } from "lucide-react";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";
import { useSound } from "@/compartilhado/hooks/useSound";
import { Janela } from "./componentes/Janela";
import { ControleSegmentado } from "./componentes/ControleSegmentado";
import { Alternador } from "./componentes/Alternador";
import { teclaDeComando } from "./acoes";

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section aria-label={titulo} className="space-y-3">
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

export function JanelaDeAjustes() {
  const { janela, fecharJanela, preferencias, mudar, restaurar, avisar } = usePreferencias();
  const { soundEnabled, setSoundEnabled, playerVisivel, desligarMusica, ligarMusica } = useSound();

  return (
    <Janela
      aberta={janela === "ajustes"}
      aoFechar={fecharJanela}
      id="ajustes"
      etiqueta={`Preferências · ${teclaDeComando()} ,`}
      titulo="Ajustes"
      icone={SlidersHorizontal}
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
        <Grupo titulo="Texto">
          <ControleSegmentado
            rotulo="Tamanho"
            opcoes={[
              { valor: "padrao", rotulo: "Padrão" },
              { valor: "grande", rotulo: "Grande" },
              { valor: "maior", rotulo: "Maior" },
              { valor: "maximo", rotulo: "Máximo" },
            ]}
            valor={preferencias.tamanhoDoTexto}
            aoMudar={(v) => mudar("tamanhoDoTexto", v)}
          />
          <ControleSegmentado
            rotulo="Fonte"
            descricao="Leitura fácil usa a Atkinson Hyperlegible, feita para baixa visão."
            opcoes={[
              { valor: "padrao", rotulo: "Padrão" },
              { valor: "leitura", rotulo: "Leitura fácil" },
              { valor: "sistema", rotulo: "Do sistema" },
            ]}
            valor={preferencias.fonte}
            aoMudar={(v) => mudar("fonte", v)}
          />
        </Grupo>

        <Grupo titulo="Aparência">
          <ControleSegmentado
            rotulo="Tema"
            descricao="Automático acompanha o claro ou escuro do seu aparelho."
            opcoes={[
              { valor: "auto", rotulo: "Automático" },
              { valor: "claro", rotulo: "Claro" },
              { valor: "escuro", rotulo: "Escuro" },
            ]}
            valor={preferencias.aparencia}
            aoMudar={(v) => mudar("aparencia", v)}
          />
          <ControleSegmentado
            rotulo="Contraste"
            opcoes={[
              { valor: "auto", rotulo: "Automático" },
              { valor: "alto", rotulo: "Alto" },
            ]}
            valor={preferencias.contraste}
            aoMudar={(v) => mudar("contraste", v)}
          />
          <ControleSegmentado
            rotulo="Movimento"
            descricao="Reduzido para as animações, o vídeo de fundo e os letreiros."
            opcoes={[
              { valor: "auto", rotulo: "Automático" },
              { valor: "reduzido", rotulo: "Reduzido" },
            ]}
            valor={preferencias.movimento}
            aoMudar={(v) => mudar("movimento", v)}
          />
        </Grupo>

        <Grupo titulo="Som e teclado">
          <div className="-mx-3">
            <Alternador
              rotulo="Sons dos botões"
              descricao="Um clique curto ao tocar nos botões."
              ligado={soundEnabled}
              aoMudar={setSoundEnabled}
            />
            <Alternador
              rotulo="Player de música"
              descricao="Mostra o botão flutuante da trilha sonora."
              ligado={playerVisivel}
              aoMudar={(ligar) => (ligar ? ligarMusica() : desligarMusica())}
            />
            <Alternador
              rotulo="Atalhos de uma tecla"
              descricao="Liga /, ? e M. Desligue se usar comandos de voz."
              ligado={preferencias.atalhosDeUmaTecla}
              aoMudar={(v) => mudar("atalhosDeUmaTecla", v)}
            />
          </div>
        </Grupo>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-3 sm:px-6">
        <span className="text-xs text-stone-400">Salvo só neste navegador.</span>
        <button
          type="button"
          onClick={() => {
            restaurar();
            avisar("Ajustes restaurados");
          }}
          className="min-h-9 cursor-pointer rounded-lg border border-white/10 px-3 text-xs font-semibold text-stone-300 transition-colors hover:border-yellow-400/40 hover:text-white"
        >
          Restaurar padrões
        </button>
      </div>
    </Janela>
  );
}
