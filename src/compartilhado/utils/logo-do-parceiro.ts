import { atualizarCaminho } from "./caminhos-publicos";

const LOGO_RECORTADO: Record<string, string> = {
  cnpq: "/parceiros/cnpq.png",
  fapesp: "/parceiros/fapesp.png",
  ufba: "/parceiros/ufba.png",
  lefhbio: "/parceiros/lefhbio.png",
  uefs: "/parceiros/uefs.png",
  feciba: "/parceiros/feciba.png",
};

const LOGO_DE_FABRICA = new Set([
  "/parceiros/Logo CNPq.png",
  "/parceiros/Logo FAPESP.png",
  "/parceiros/Logo UFBA.png",
  "/parceiros/Logo LEFHBio.jpg",
  "/parceiros/Logo UEFS.png",
  "/parceiros/Logo FECIBA.png",
  ...Object.values(LOGO_RECORTADO),
]);

export function resolvePartnerLogo(partner: { id: string; logo?: string }): string {
  const logo = atualizarCaminho((partner.logo || "").trim());
  if (logo && !LOGO_DE_FABRICA.has(logo)) return logo;
  return LOGO_RECORTADO[partner.id] || logo || "/parceiros/cnpq.png";
}

export function logoReservaDoParceiro(partner: { id: string }): string | null {
  return LOGO_RECORTADO[partner.id] ?? null;
}

export function iniciaisDoParceiro(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 1) return palavras[0].slice(0, 4).toUpperCase();
  return palavras
    .slice(0, 3)
    .map((palavra) => palavra[0])
    .join("")
    .toUpperCase();
}
