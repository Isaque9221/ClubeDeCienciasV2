import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Crosshair,
  Eye,
  EyeOff,
  Grid3x3,
  Hand,
  Lock,
  Maximize2,
  Move,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useData } from "@/compartilhado/hooks";
import { acharSecao, ehFixa, escreverMapa, lerMapa, type ItemDoMapa } from "@/secoes/mapa-do-site";
import {
  ajustarNaGrade,
  escreverPosicoes,
  lerPosicoes,
  type ModoDePosicao,
  type PosicoesLivres,
} from "@/secoes/posicoes-livres";
import { RECADO_DO_MAPA, ehRecadoDoMapa, enderecoDaPrevia } from "@/compartilhado/utils/previa";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 1.4;

const LARGURA_DA_PREVIA = 1440;

const TAMANHOS_DE_GRADE = [4, 8, 16, 24, 32];

const SECAO_PARA_PAGINA_DO_EDITOR: Record<string, string> = {
  hero: "hero",
  sobre: "sobre",
  estatisticas: "numeros",
  pilares: "pilares",
  equipe: "lideranca",
  pesquisadores: "mentores",
  pontes: "pontes",
  manifesto: "manifesto",
  faq: "faq",
  cta: "cta",
  rodape: "rodape",
};

interface AdminMapaTabProps {
  onEditarTextos?: (paginaId: string) => void;
}

function rotuloDaPeca(id: string): string {
  if (id.startsWith("secao:")) {
    return acharSecao(id.slice("secao:".length))?.rotulo ?? id;
  }
  return id;
}

export function AdminMapaTab({ onEditarTextos }: AdminMapaTabProps) {
  const { siteConfig, updateSiteConfig } = useData();

  const [itens, setItens] = useState<ItemDoMapa[]>(() => lerMapa(siteConfig.layoutSections));
  const [posicoes, setPosicoes] = useState<PosicoesLivres>(() =>
    lerPosicoes(siteConfig.elementPositions)
  );
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(true);

  const [modoEdicaoDePosicoes, setModoEdicaoDePosicoes] = useState(false);
  const [grade, setGrade] = useState<{ tamanho: number; ativa: boolean }>({
    tamanho: 8,
    ativa: true,
  });
  const [elementoSelecionado, setElementoSelecionado] = useState<string | null>(null);

  const [zoom, setZoom] = useState(0.5);
  const [deslocamento, setDeslocamento] = useState({ x: 0, y: 0 });
  const arrastando = useRef<{ x: number; y: number } | null>(null);

  const janelaRef = useRef<HTMLIFrameElement>(null);
  const mesaRef = useRef<HTMLDivElement>(null);
  const previaPronta = useRef(false);

  const ordemAtual = useMemo(() => escreverMapa(itens), [itens]);
  const posicoesAtuais = useMemo(() => escreverPosicoes(posicoes), [posicoes]);
  const modoDaPeca: ModoDePosicao = "windows";

  const estadoAtual = useRef({ itens, posicoes, modoEdicaoDePosicoes, grade });
  useEffect(() => {
    estadoAtual.current = { itens, posicoes, modoEdicaoDePosicoes, grade };
  }, [itens, posicoes, modoEdicaoDePosicoes, grade]);

  const avisarPrevia = useCallback((recado: Record<string, unknown>) => {
    const janela = janelaRef.current?.contentWindow;
    if (!janela || !previaPronta.current) return;
    janela.postMessage({ tipo: RECADO_DO_MAPA, ...recado }, window.location.origin);
  }, []);

  useEffect(() => {
    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!ehRecadoDoMapa(e.data)) return;

      if (e.data.acao === "pronta") {
        previaPronta.current = true;
        const atual = estadoAtual.current;
        avisarPrevia({ acao: "ordem", valor: escreverMapa(atual.itens) });
        avisarPrevia({ acao: "posicoes", valor: escreverPosicoes(atual.posicoes) });
        avisarPrevia({ acao: "modo-edicao", ativo: atual.modoEdicaoDePosicoes });
        avisarPrevia({ acao: "grade", tamanho: atual.grade.tamanho, ativa: atual.grade.ativa });
        return;
      }

      if (e.data.acao === "selecionou") {
        setElementoSelecionado(e.data.id);
        avisarPrevia({ acao: "selecao", id: e.data.id });
        return;
      }

      if (e.data.acao === "moveu") {
        const { id, modo: modoDaMensagem, x, y } = e.data;
        setPosicoes((atual) => {
          const proximo: PosicoesLivres = { ...atual };
          const entrada = { ...(proximo[id] ?? {}) };

          if (x === 0 && y === 0) {
            delete entrada[modoDaMensagem as ModoDePosicao];
          } else {
            entrada[modoDaMensagem as ModoDePosicao] = { x, y };
          }

          if (Object.keys(entrada).length === 0) {
            delete proximo[id];
          } else {
            proximo[id] = entrada;
          }
          return proximo;
        });
        setSalvo(false);
      }
    };

    window.addEventListener("message", aoReceber);
    return () => window.removeEventListener("message", aoReceber);
  }, [avisarPrevia]);

  useEffect(() => {
    avisarPrevia({ acao: "ordem", valor: ordemAtual });
  }, [ordemAtual, avisarPrevia]);

  useEffect(() => {
    avisarPrevia({ acao: "posicoes", valor: posicoesAtuais });
  }, [posicoesAtuais, avisarPrevia]);

  useEffect(() => {
    avisarPrevia({ acao: "modo-edicao", ativo: modoEdicaoDePosicoes });
    if (!modoEdicaoDePosicoes) setElementoSelecionado(null);
  }, [modoEdicaoDePosicoes, avisarPrevia]);

  useEffect(() => {
    avisarPrevia({ acao: "grade", tamanho: grade.tamanho, ativa: grade.ativa });
  }, [grade, avisarPrevia]);

  const mover = (indice: number, direcao: -1 | 1) => {
    setItens((atual) => {
      const alvo = indice + direcao;
      if (alvo < 0 || alvo >= atual.length) return atual;
      if (ehFixa(atual[indice].id) || ehFixa(atual[alvo].id)) return atual;

      const copia = [...atual];
      [copia[indice], copia[alvo]] = [copia[alvo], copia[indice]];
      return copia;
    });
    setSalvo(false);
  };

  const alternarVisibilidade = (id: string) => {
    if (ehFixa(id)) return;
    setItens((atual) => atual.map((i) => (i.id === id ? { ...i, visivel: !i.visivel } : i)));
    setSalvo(false);
  };

  const selecionar = (id: string) => {
    setSelecionado(id);
    avisarPrevia({ acao: "ir", id });
  };

  const selecionarElemento = (id: string | null) => {
    setElementoSelecionado(id);
    avisarPrevia({ acao: "selecao", id });
  };

  const moverElemento = (id: string, dx: number, dy: number) => {
    setPosicoes((atual) => {
      const atualDaPeca = atual[id]?.[modoDaPeca] ?? { x: 0, y: 0 };
      const x = ajustarNaGrade(atualDaPeca.x + dx, grade.ativa ? grade.tamanho : 1);
      const y = ajustarNaGrade(atualDaPeca.y + dy, grade.ativa ? grade.tamanho : 1);
      const proximo: PosicoesLivres = { ...atual };
      const entrada = { ...(proximo[id] ?? {}) };
      if (x === 0 && y === 0) {
        delete entrada[modoDaPeca];
      } else {
        entrada[modoDaPeca] = { x, y };
      }
      if (Object.keys(entrada).length === 0) delete proximo[id];
      else proximo[id] = entrada;
      return proximo;
    });
    setSalvo(false);
  };

  const restaurarPosicaoDoElemento = (id: string) => {
    setPosicoes((atual) => {
      const proximo: PosicoesLivres = { ...atual };
      const entrada = { ...(proximo[id] ?? {}) };
      delete entrada[modoDaPeca];
      if (Object.keys(entrada).length === 0) delete proximo[id];
      else proximo[id] = entrada;
      return proximo;
    });
    setSalvo(false);
  };

  const limparTodasAsPosicoes = () => {
    if (Object.keys(posicoes).length === 0) return;
    if (!confirm("Isto devolve TODAS as peças arrastadas ao lugar original. Deseja continuar?"))
      return;
    setPosicoes({});
    setSalvo(false);
  };

  const salvar = () => {
    updateSiteConfig({
      layoutSections: ordemAtual,
      elementPositions: posicoesAtuais,
    });
    setSalvo(true);
  };

  const restaurar = () => {
    setItens(lerMapa(""));
    setSalvo(false);
  };

  const aoPressionar = (e: React.MouseEvent) => {
    if (e.target !== mesaRef.current) return;
    arrastando.current = {
      x: e.clientX - deslocamento.x,
      y: e.clientY - deslocamento.y,
    };
  };

  useEffect(() => {
    const aoMover = (e: MouseEvent) => {
      if (!arrastando.current) return;
      setDeslocamento({
        x: e.clientX - arrastando.current.x,
        y: e.clientY - arrastando.current.y,
      });
    };
    const aoSoltar = () => {
      arrastando.current = null;
    };

    window.addEventListener("mousemove", aoMover);
    window.addEventListener("mouseup", aoSoltar);
    return () => {
      window.removeEventListener("mousemove", aoMover);
      window.removeEventListener("mouseup", aoSoltar);
    };
  }, []);

  useEffect(() => {
    const mesa = mesaRef.current;
    if (!mesa) return;

    const aoGirar = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.0012)));
    };

    mesa.addEventListener("wheel", aoGirar, { passive: false });
    return () => mesa.removeEventListener("wheel", aoGirar);
  }, []);

  const enquadrar = () => {
    setZoom(0.5);
    setDeslocamento({ x: 0, y: 0 });
  };

  const visiveis = itens.filter((i) => i.visivel).length;
  const totalDePecasMovidas = Object.keys(posicoes).length;

  const pecaSelecionada = elementoSelecionado;
  const offsetDaPecaSelecionada =
    pecaSelecionada != null ? (posicoes[pecaSelecionada]?.[modoDaPeca] ?? { x: 0, y: 0 }) : null;
  const idDaSecaoSelecionada = pecaSelecionada?.startsWith("secao:")
    ? pecaSelecionada.slice("secao:".length)
    : null;
  const paginaDoEditorDaSelecao = idDaSecaoSelecionada
    ? SECAO_PARA_PAGINA_DO_EDITOR[idDaSecaoSelecionada]
    : undefined;

  const passoDoNudge = grade.ativa ? grade.tamanho : 1;

  return (
    <div className="flex h-full min-h-[560px] flex-col gap-3 lg:flex-row">
      <div
        ref={mesaRef}
        onMouseDown={aoPressionar}
        className={`mesa-do-mapa relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0908] ${
          modoEdicaoDePosicoes ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 p-3">
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setModoEdicaoDePosicoes(false)}
                title="Navegar: usar o site normalmente na janelinha"
                className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors ${
                  !modoEdicaoDePosicoes
                    ? "bg-amber-400 text-black"
                    : "text-stone-400 hover:text-amber-300"
                }`}
              >
                <Hand className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Navegar</span>
              </button>
              <button
                type="button"
                onClick={() => setModoEdicaoDePosicoes(true)}
                title="Editar posições: arrastar qualquer peça de lugar"
                className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors ${
                  modoEdicaoDePosicoes
                    ? "bg-amber-400 text-black"
                    : "text-stone-400 hover:text-amber-300"
                }`}
              >
                <Move className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Editar posições</span>
              </button>
            </div>

            {modoEdicaoDePosicoes && (
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setGrade((g) => ({ ...g, ativa: !g.ativa }))}
                  title={
                    grade.ativa ? "Desligar a grade de alinhamento" : "Ligar a grade de alinhamento"
                  }
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    grade.ativa ? "bg-amber-400 text-black" : "text-stone-400 hover:text-amber-300"
                  }`}
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!grade.ativa}
                  onClick={() =>
                    setGrade((g) => {
                      const idx = TAMANHOS_DE_GRADE.indexOf(g.tamanho);
                      const proximo = TAMANHOS_DE_GRADE[(idx + 1) % TAMANHOS_DE_GRADE.length];
                      return { ...g, tamanho: proximo };
                    })
                  }
                  title="Tamanho da grade"
                  className="h-7 min-w-9 rounded-lg px-1.5 font-mono text-[10px] font-bold text-stone-300 transition-colors hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {grade.tamanho}px
                </button>
                {totalDePecasMovidas > 0 && (
                  <>
                    <span className="mx-0.5 h-4 w-px bg-white/10" />
                    <button
                      type="button"
                      onClick={limparTodasAsPosicoes}
                      title="Devolver todas as peças ao lugar original"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - 0.1))}
              title="Afastar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:text-amber-300"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-[10px] text-stone-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + 0.1))}
              title="Aproximar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:text-amber-300"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="mx-0.5 h-4 w-px bg-white/10" />
            <button
              type="button"
              onClick={enquadrar}
              title="Enquadrar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:text-amber-300"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div
          className="absolute left-1/2 top-1/2 origin-center transition-transform duration-200 ease-out"
          style={{
            transform: `translate(-50%, -50%) translate(${deslocamento.x}px, ${deslocamento.y}px) scale(${zoom})`,
          }}
        >
          <div
            className="overflow-hidden rounded-xl border border-white/15 bg-[#0c0a09] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
            style={{ width: LARGURA_DA_PREVIA, height: 900 }}
          >
            <iframe
              ref={janelaRef}
              src={enderecoDaPrevia()}
              title="Prévia do site"
              className="h-full w-full border-0"
            />
          </div>
        </div>

        <p className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-center font-mono text-[10px] text-stone-600">
          {modoEdicaoDePosicoes
            ? "Arraste qualquer peça na janelinha para movê-la · duplo clique devolve ao lugar"
            : "Arraste o fundo para mover · roda do mouse para aproximar"}
        </p>
      </div>

      <div className="flex w-full flex-col rounded-2xl border border-white/10 bg-[#0e0d0b] lg:w-[340px]">
        {modoEdicaoDePosicoes && pecaSelecionada && offsetDaPecaSelecionada && (
          <div className="border-b border-white/10 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  <Move className="h-3 w-3" />
                  Peça selecionada
                </span>
                <h3 className="mt-0.5 truncate text-sm font-bold text-white">
                  {rotuloDaPeca(pecaSelecionada)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => selecionarElemento(null)}
                title="Fechar"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mt-1.5 font-mono text-[10px] text-stone-500">
              Posição: X {offsetDaPecaSelecionada.x}px · Y {offsetDaPecaSelecionada.y}px
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <span />
              <button
                type="button"
                onClick={() => moverElemento(pecaSelecionada, 0, -passoDoNudge)}
                title="Mover para cima"
                className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-stone-300 transition-colors hover:border-amber-400/40 hover:text-amber-300"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <span />
              <button
                type="button"
                onClick={() => moverElemento(pecaSelecionada, -passoDoNudge, 0)}
                title="Mover para a esquerda"
                className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-stone-300 transition-colors hover:border-amber-400/40 hover:text-amber-300"
              >
                <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => restaurarPosicaoDoElemento(pecaSelecionada)}
                title="Devolver ao lugar original"
                className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-stone-400 transition-colors hover:border-rose-400/40 hover:text-rose-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moverElemento(pecaSelecionada, passoDoNudge, 0)}
                title="Mover para a direita"
                className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-stone-300 transition-colors hover:border-amber-400/40 hover:text-amber-300"
              >
                <ArrowUp className="h-3.5 w-3.5 rotate-90" />
              </button>
              <span />
              <button
                type="button"
                onClick={() => moverElemento(pecaSelecionada, 0, passoDoNudge)}
                title="Mover para baixo"
                className="flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-stone-300 transition-colors hover:border-amber-400/40 hover:text-amber-300"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <span />
            </div>

            {onEditarTextos && paginaDoEditorDaSelecao && (
              <button
                type="button"
                onClick={() => onEditarTextos(paginaDoEditorDaSelecao)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[12px] font-bold text-amber-300 transition-colors hover:bg-amber-400/20"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar textos e imagens desta seção
              </button>
            )}
          </div>
        )}

        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Seções da página</h3>
            <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-amber-300">
              Beta
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
            {modoEdicaoDePosicoes
              ? "Clique numa peça na janelinha para selecioná-la, ou numa seção aqui embaixo para ir até ela."
              : "Arraste a ordem com as setas e ligue ou desligue cada seção. A janelinha ao lado muda na hora; o site muda quando você salvar."}
          </p>
          <p className="mt-2 flex items-center gap-2 font-mono text-[10px] text-stone-600">
            <span>
              {visiveis} de {itens.length} seções visíveis
            </span>
            {totalDePecasMovidas > 0 && (
              <>
                <span className="text-stone-700">·</span>
                <span className="flex items-center gap-1 text-amber-400/80">
                  <Move className="h-2.5 w-2.5" />
                  {totalDePecasMovidas}{" "}
                  {totalDePecasMovidas === 1 ? "peça movida" : "peças movidas"}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {itens.map((item, i) => {
            const secao = acharSecao(item.id);
            if (!secao) return null;
            const fixa = ehFixa(item.id);
            const ativo = selecionado === item.id;
            const temPosicao = Boolean(posicoes[`secao:${item.id}`]?.[modoDaPeca]);

            return (
              <div
                key={item.id}
                onClick={() => {
                  selecionar(item.id);
                  if (modoEdicaoDePosicoes) selecionarElemento(`secao:${item.id}`);
                }}
                className={`group cursor-pointer rounded-xl border p-2.5 transition-colors ${
                  ativo || (modoEdicaoDePosicoes && elementoSelecionado === `secao:${item.id}`)
                    ? "border-amber-400/50 bg-amber-400/[0.07]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
                } ${item.visivel ? "" : "opacity-45"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center font-mono text-[10px] text-stone-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[12px] font-semibold text-white">
                        {secao.rotulo}
                      </span>
                      {fixa && (
                        <Lock className="h-3 w-3 shrink-0 text-stone-600" aria-label="Seção fixa" />
                      )}
                      {temPosicao && (
                        <Move
                          className="h-3 w-3 shrink-0 text-amber-400/80"
                          aria-label="Peça fora do lugar original"
                        />
                      )}
                    </div>
                    <p className="truncate text-[10px] text-stone-500">{secao.descricao}</p>
                  </div>

                  {modoEdicaoDePosicoes ? (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selecionar(item.id);
                          selecionarElemento(`secao:${item.id}`);
                        }}
                        title="Selecionar esta peça"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-amber-300"
                      >
                        <Crosshair className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          mover(i, -1);
                        }}
                        disabled={fixa || i === 0}
                        title="Subir"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          mover(i, 1);
                        }}
                        disabled={fixa || i === itens.length - 1}
                        title="Descer"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          alternarVisibilidade(item.id);
                        }}
                        disabled={fixa}
                        title={item.visivel ? "Esconder do site" : "Mostrar no site"}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        {item.visivel ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selecionar(item.id);
                        }}
                        title="Achar na janelinha"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-white/5 hover:text-amber-300"
                      >
                        <Crosshair className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={salvar}
            disabled={salvo}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors ${
              salvo
                ? "cursor-default bg-white/[0.04] text-stone-600"
                : "cursor-pointer bg-amber-400 text-black hover:bg-amber-300"
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            {salvo ? "Tudo salvo" : "Salvar no site"}
          </button>

          <button
            type="button"
            onClick={restaurar}
            title="Voltar à ordem de fábrica"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-500 transition-colors hover:border-amber-400/40 hover:text-amber-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
