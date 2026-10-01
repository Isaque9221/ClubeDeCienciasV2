import { useCallback, useEffect, useState } from "react";
import { RECADO_DO_MAPA, ehRecadoDoMapa, estaNaPrevia } from "@/compartilhado/utils/previa";

export interface GradeDoMapa {
  tamanho: number;
  ativa: boolean;
}

const GRADE_PADRAO: GradeDoMapa = { tamanho: 8, ativa: true };

export function useModoPrevia(deviceModeReal?: "windows" | "mobile") {
  const [naPrevia] = useState(() => estaNaPrevia());
  const [ordemDeTeste, setOrdemDeTeste] = useState<string | null>(null);
  const [posicoesDeTeste, setPosicoesDeTeste] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [grade, setGrade] = useState<GradeDoMapa>(GRADE_PADRAO);
  const [elementoSelecionado, setElementoSelecionado] = useState<string | null>(null);

  const avisar = useCallback((recado: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    window.parent?.postMessage({ tipo: RECADO_DO_MAPA, ...recado }, window.location.origin);
  }, []);

  const avisarSelecao = useCallback(
    (id: string | null) => {
      avisar({ acao: "selecionou", id });
    },
    [avisar]
  );

  const avisarMovimento = useCallback(
    (id: string, modo: "windows" | "mobile", x: number, y: number) => {
      avisar({ acao: "moveu", id, modo, x, y });
    },
    [avisar]
  );

  useEffect(() => {
    if (!naPrevia || typeof window === "undefined") return;

    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!ehRecadoDoMapa(e.data)) return;

      if (e.data.acao === "ordem") {
        setOrdemDeTeste(e.data.valor);
        return;
      }

      if (e.data.acao === "posicoes") {
        setPosicoesDeTeste(e.data.valor);
        return;
      }

      if (e.data.acao === "selecao") {
        setElementoSelecionado(e.data.id);
        return;
      }

      if (e.data.acao === "modo-edicao") {
        setModoEdicao(e.data.ativo);
        if (!e.data.ativo) setElementoSelecionado(null);
        return;
      }

      if (e.data.acao === "grade") {
        setGrade({ tamanho: e.data.tamanho, ativa: e.data.ativa });
        return;
      }

      if (e.data.acao === "ir") {
        const alvo = document.querySelector<HTMLElement>(`[data-secao="${CSS.escape(e.data.id)}"]`);
        if (!alvo) return;

        alvo.scrollIntoView({ behavior: "smooth", block: "center" });

        alvo.classList.add("secao-em-foco");
        window.setTimeout(() => alvo.classList.remove("secao-em-foco"), 1600);
      }
    };

    window.addEventListener("message", aoReceber);

    avisar({ acao: "pronta", modo: deviceModeReal });

    return () => window.removeEventListener("message", aoReceber);
  }, [naPrevia, avisar, deviceModeReal]);

  return {
    naPrevia,
    ordemDeTeste,
    posicoesDeTeste,
    modoEdicao,
    grade,
    elementoSelecionado,
    avisarSelecao,
    avisarMovimento,
  };
}
