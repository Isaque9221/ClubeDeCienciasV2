import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  PreferenciasContext,
  PREFERENCIAS_PADRAO,
  type JanelaDoSistema,
  type Preferencias,
} from "./preferencias-context";

export const CHAVE_DAS_PREFERENCIAS = "ceclos_preferencias";

const VALIDOS: { [K in keyof Preferencias]: readonly Preferencias[K][] } = {
  aparencia: ["auto", "claro", "escuro"],
  tamanhoDoTexto: ["padrao", "grande", "maior", "maximo"],
  fonte: ["padrao", "leitura", "sistema"],
  contraste: ["auto", "alto"],
  movimento: ["auto", "reduzido"],
  atalhosDeUmaTecla: [true, false],
};

function lerPreferencias(): Preferencias {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_DAS_PREFERENCIAS) || "{}");
    const lidas = { ...PREFERENCIAS_PADRAO };
    for (const chave of Object.keys(VALIDOS) as (keyof Preferencias)[]) {
      const valor = salvas?.[chave];
      if ((VALIDOS[chave] as readonly unknown[]).includes(valor)) {
        (lidas as Record<string, unknown>)[chave] = valor;
      }
    }
    return lidas;
  } catch {
    return { ...PREFERENCIAS_PADRAO };
  }
}

function useConsulta(consulta: string): boolean {
  const [bate, setBate] = useState(
    () => typeof window !== "undefined" && (window.matchMedia?.(consulta).matches ?? false)
  );
  useEffect(() => {
    const lista = window.matchMedia?.(consulta);
    if (!lista) return;
    const mudou = () => setBate(lista.matches);
    lista.addEventListener("change", mudou);
    return () => lista.removeEventListener("change", mudou);
  }, [consulta]);
  return bate;
}

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState<Preferencias>(lerPreferencias);
  const [janela, setJanela] = useState<JanelaDoSistema | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const temporizador = useRef<number | undefined>(undefined);

  const sistemaMenosMovimento = useConsulta("(prefers-reduced-motion: reduce)");
  const sistemaMaisContraste = useConsulta("(prefers-contrast: more)");
  const sistemaClaro = useConsulta("(prefers-color-scheme: light)");

  const menosMovimento = preferencias.movimento === "reduzido" || sistemaMenosMovimento;
  const altoContraste = preferencias.contraste === "alto" || sistemaMaisContraste;
  const esquema: "claro" | "escuro" =
    preferencias.aparencia === "auto"
      ? sistemaClaro
        ? "claro"
        : "escuro"
      : preferencias.aparencia;

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.esquema = esquema;
    const cor = esquema === "claro" ? "#f7f3ea" : "#0c0a09";
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", cor));

    const antesDeImprimir = () => {
      raiz.dataset.esquema = "claro";
    };
    const depoisDeImprimir = () => {
      raiz.dataset.esquema = esquema;
    };
    window.addEventListener("beforeprint", antesDeImprimir);
    window.addEventListener("afterprint", depoisDeImprimir);
    return () => {
      window.removeEventListener("beforeprint", antesDeImprimir);
      window.removeEventListener("afterprint", depoisDeImprimir);
    };
  }, [esquema]);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.texto = preferencias.tamanhoDoTexto;
    raiz.dataset.fonte = preferencias.fonte;
    if (altoContraste) raiz.dataset.contraste = "alto";
    else delete raiz.dataset.contraste;
    if (menosMovimento) raiz.dataset.movimento = "reduzido";
    else delete raiz.dataset.movimento;
  }, [preferencias.tamanhoDoTexto, preferencias.fonte, altoContraste, menosMovimento]);

  const mudar = useCallback(<K extends keyof Preferencias>(chave: K, valor: Preferencias[K]) => {
    setPreferencias((atuais) => {
      const novas = { ...atuais, [chave]: valor };
      try {
        localStorage.setItem(CHAVE_DAS_PREFERENCIAS, JSON.stringify(novas));
      } catch {}
      return novas;
    });
  }, []);

  const restaurar = useCallback(() => {
    setPreferencias({ ...PREFERENCIAS_PADRAO });
    try {
      localStorage.removeItem(CHAVE_DAS_PREFERENCIAS);
    } catch {}
  }, []);

  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setAviso(null), 3200);
  }, []);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const abrirJanela = useCallback((nova: JanelaDoSistema) => setJanela(nova), []);
  const fecharJanela = useCallback(() => setJanela(null), []);

  const valor = useMemo(
    () => ({
      preferencias,
      mudar,
      restaurar,
      menosMovimento,
      altoContraste,
      esquema,
      janela,
      abrirJanela,
      fecharJanela,
      aviso,
      avisar,
    }),
    [
      esquema,
      preferencias,
      mudar,
      restaurar,
      menosMovimento,
      altoContraste,
      janela,
      abrirJanela,
      fecharJanela,
      aviso,
      avisar,
    ]
  );

  return <PreferenciasContext.Provider value={valor}>{children}</PreferenciasContext.Provider>;
}
