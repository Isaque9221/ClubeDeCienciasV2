import { linkParaCompartilhar, registrarCompartilhamento } from "@/recursos/estatisticas";

export const EVENTO_ABRIR_PLAYER = "ceclos:abrir-player";

export function ehMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}

export function teclaDeComando(): string {
  return ehMac() ? "⌘" : "Ctrl";
}

export const ATALHOS = [
  { teclas: () => [teclaDeComando(), "K"], acao: "Abrir a lista de comandos" },
  {
    teclas: () => ["/"],
    acao: "Buscar: na página de Membros foca a busca; nas outras abre os comandos",
    umaTecla: true,
  },
  { teclas: () => [teclaDeComando(), ","], acao: "Abrir os Ajustes" },
  { teclas: () => ["?"], acao: "Mostrar estes atalhos", umaTecla: true },
  { teclas: () => ["M"], acao: "Tocar ou pausar a música", umaTecla: true },
  { teclas: () => ["Esc"], acao: "Fechar a janela aberta" },
  { teclas: () => ["Tab"], acao: "Ir para o próximo botão ou link" },
  { teclas: () => [ehMac() ? "Ctrl ⌘ F" : "F11"], acao: "Tela cheia (atalho do navegador)" },
] as const;

export function estaEmTelaCheia(): boolean {
  return typeof document !== "undefined" && !!document.fullscreenElement;
}

export async function alternarTelaCheia(): Promise<boolean> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return false;
    }
    await document.documentElement.requestFullscreen();
    return true;
  } catch {
    return estaEmTelaCheia();
  }
}

export async function copiarLink(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(linkParaCompartilhar());
    registrarCompartilhamento("link");
    return true;
  } catch {
    return false;
  }
}

export async function compartilharSite(
  titulo: string
): Promise<"compartilhado" | "copiado" | "falhou"> {
  const url = linkParaCompartilhar();
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, url });
      registrarCompartilhamento("nativo");
      return "compartilhado";
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === "AbortError") return "compartilhado";
    }
  }
  return (await copiarLink()) ? "copiado" : "falhou";
}
