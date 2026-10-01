import { estaNaPrevia } from "@/compartilhado/utils/previa";

const ENDERECO = "/api/estatisticas";
const CHAVE_DO_VISITANTE = "ceclos_visitante";
const CHAVE_DA_VISITA = "ceclos_visita";
const PARAMETRO_DE_ORIGEM = "via";
const VIA_COMPARTILHAMENTO = "compartilhado";
const ESPERA_ANTES_DE_ENVIAR = 1500;

export type Dispositivo = "celular" | "tablet" | "computador";
export type Origem =
  "direto" | "compartilhado" | "whatsapp" | "instagram" | "facebook" | "google" | "outro-site";
export type MeioDeCompartilhamento = "nativo" | "link";

type NavegadorComExtras = Navigator & {
  globalPrivacyControl?: boolean;
  userAgentData?: { mobile?: boolean };
};

function idAleatorio(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

function lerOuCriar(armazenamento: () => Storage, chave: string): { id: string; novo: boolean } {
  try {
    const guardado = armazenamento().getItem(chave);
    if (guardado && /^[A-Za-z0-9-]{8,64}$/.test(guardado)) return { id: guardado, novo: false };
    const id = idAleatorio();
    armazenamento().setItem(chave, id);
    return { id, novo: true };
  } catch {
    return { id: idAleatorio(), novo: true };
  }
}

export function podeRegistrar(): boolean {
  if (import.meta.env.DEV) return false;
  if (typeof window === "undefined" || typeof fetch !== "function") return false;
  const navegador = navigator as NavegadorComExtras;
  if (navegador.globalPrivacyControl === true || navegador.doNotTrack === "1") return false;
  if (navegador.webdriver) return false;
  if (/bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navegador.userAgent)) return false;
  return !estaNaPrevia();
}

export function dispositivoAtual(): Dispositivo {
  const navegador = navigator as NavegadorComExtras;
  const ua = navegador.userAgent || "";
  const ipadComoMac = /Macintosh/.test(ua) && navegador.maxTouchPoints > 1;
  if (/iPad|Tablet/i.test(ua) || ipadComoMac || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return "tablet";
  }
  if (navegador.userAgentData?.mobile || /Mobi|iPhone|iPod|Android|Opera Mini|IEMobile/i.test(ua)) {
    return "celular";
  }
  return "computador";
}

export function origemDaVisita(endereco: string, referencia: string, ua: string): Origem {
  try {
    if (new URL(endereco).searchParams.get(PARAMETRO_DE_ORIGEM) === VIA_COMPARTILHAMENTO) {
      return "compartilhado";
    }
  } catch {}
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";

  let deOnde = "";
  try {
    deOnde = referencia ? new URL(referencia).hostname : "";
  } catch {}
  let daqui = "";
  try {
    daqui = new URL(endereco).hostname;
  } catch {}

  if (!deOnde || deOnde === daqui) return "direto";
  if (/whatsapp/i.test(deOnde)) return "whatsapp";
  if (/instagram/i.test(deOnde)) return "instagram";
  if (/facebook|^fb\.|\.fb\.|messenger/i.test(deOnde)) return "facebook";
  if (/google/i.test(deOnde)) return "google";
  return "outro-site";
}

function limparEndereco(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(PARAMETRO_DE_ORIGEM)) return;
    url.searchParams.delete(PARAMETRO_DE_ORIGEM);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  } catch {}
}

function enviar(dados: Record<string, string>): void {
  try {
    fetch(ENDERECO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch {}
}

function quandoOcioso(tarefa: () => void): void {
  const ocioso = (window as Window & { requestIdleCallback?: (f: () => void) => number })
    .requestIdleCallback;
  window.setTimeout(() => (ocioso ? ocioso(tarefa) : tarefa()), ESPERA_ANTES_DE_ENVIAR);
}

export function registrarVisita(): void {
  if (typeof window === "undefined") return;
  const origem = origemDaVisita(window.location.href, document.referrer, navigator.userAgent);
  limparEndereco();
  if (!podeRegistrar()) return;

  const visita = lerOuCriar(() => sessionStorage, CHAVE_DA_VISITA);
  if (!visita.novo) return;
  const visitante = lerOuCriar(() => localStorage, CHAVE_DO_VISITANTE);

  quandoOcioso(() =>
    enviar({
      tipo: "visita",
      visita: visita.id,
      visitante: visitante.id,
      dispositivo: dispositivoAtual(),
      origem,
    })
  );
}

export function registrarCompartilhamento(meio: MeioDeCompartilhamento): void {
  if (!podeRegistrar()) return;
  enviar({
    tipo: "compartilhamento",
    visita: lerOuCriar(() => sessionStorage, CHAVE_DA_VISITA).id,
    visitante: lerOuCriar(() => localStorage, CHAVE_DO_VISITANTE).id,
    meio,
  });
}

export function linkParaCompartilhar(): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(PARAMETRO_DE_ORIGEM, VIA_COMPARTILHAMENTO);
  return url.toString();
}

export const CHAVES_DAS_ESTATISTICAS = [CHAVE_DO_VISITANTE, CHAVE_DA_VISITA] as const;
