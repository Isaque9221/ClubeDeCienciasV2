import { createContext } from "react";

export type TamanhoDoTexto = "padrao" | "grande" | "maior" | "maximo";
export type FonteDeLeitura = "padrao" | "leitura" | "sistema";
export type Aparencia = "auto" | "claro" | "escuro";

export interface Preferencias {
  aparencia: Aparencia;
  tamanhoDoTexto: TamanhoDoTexto;
  fonte: FonteDeLeitura;
  contraste: "auto" | "alto";
  movimento: "auto" | "reduzido";
  atalhosDeUmaTecla: boolean;
}

export type JanelaDoSistema = "ajustes" | "comandos" | "atalhos" | "privacidade";

export interface PreferenciasContextType {
  preferencias: Preferencias;
  mudar: <K extends keyof Preferencias>(chave: K, valor: Preferencias[K]) => void;
  restaurar: () => void;
  menosMovimento: boolean;
  altoContraste: boolean;
  esquema: "claro" | "escuro";
  janela: JanelaDoSistema | null;
  abrirJanela: (janela: JanelaDoSistema) => void;
  fecharJanela: () => void;
  aviso: string | null;
  avisar: (texto: string) => void;
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  aparencia: "auto",
  tamanhoDoTexto: "padrao",
  fonte: "padrao",
  contraste: "auto",
  movimento: "auto",
  atalhosDeUmaTecla: true,
};

export const PreferenciasContext = createContext<PreferenciasContextType | undefined>(undefined);
