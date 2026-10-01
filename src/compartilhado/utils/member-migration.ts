import type { Member } from "@/compartilhado/tipos/member.types";
import { PLACEHOLDER_QUOTE, resolveMemberArea } from "./member";
import { lerRemovidos } from "./removidos";
import { atualizarCaminho } from "./caminhos-publicos";

export const RETIRED_MEMBER_IDS = new Set([
  "membro-2",
  "dono-card",

  "mentor-1",
  "mentor-2",
  "mentor-3",
]);

export function normalizarCaminhoDaFoto(caminho: string | undefined): string {
  const limpo = (caminho ?? "").trim();
  if (!limpo) return "";
  if (/^(https?:|data:|blob:)/i.test(limpo)) return limpo;
  return limpo.startsWith("/") ? limpo : `/${limpo}`;
}

const FOTOS_A_CORRIGIR: Record<string, Set<string>> = {
  "ana-claudia": new Set([
    "",
    "/Ana Claudia Cedraz.jpeg",
    "/Ana Claudia Cedraz.jpg",
    "Ana Claudia Cedraz.jpeg",
    "Ana Claudia Cedraz.jpg",
    "Ana Claudia Cedraz.png",
    "/Ana Claudia Cedraz.png",
    "/membros/Ana Claudia Cedraz.png",
  ]),

  victor: new Set([
    "",
    "Victor.jpeg",
    "/victor.jpeg",
    "/VICTOR.jpeg",
    "/Victor.jpeg",
    "/membros/Victor.jpeg",
  ]),

  josue: new Set([
    "",
    "/Zu.png",
    "Josue Pimentel.jpg",
    "/Zu.jpg",
    "/membros/Zu.jpg",
    "/membros/Josue Pimentel.jpg",
    "/josue pimentel.jpg",
    "/Josue Pimentel.jpeg",
    "/Josue.jpg",
    "/JOSUE.jpeg",
  ]),
};

export function migrateMembers(
  saved: Member[],
  seed: Member[],
  removidos: Set<string> = new Set()
): Member[] {
  const seedById = new Map(seed.map((s) => [s.id, s]));

  const cleaned = saved
    .filter((m) => m && m.id && !RETIRED_MEMBER_IDS.has(m.id))
    .map((m) => {
      const seedItem = seedById.get(m.id);

      const salvo = (m.image ?? "").trim();
      const image =
        seedItem && FOTOS_A_CORRIGIR[m.id]?.has(salvo)
          ? seedItem.image
          : atualizarCaminho(normalizarCaminhoDaFoto(salvo));
      return {
        ...m,
        image,
        area: resolveMemberArea(m),
        quote: m.quote === PLACEHOLDER_QUOTE ? "" : m.quote,
      };
    });

  const known = new Set(cleaned.map((m) => m.id));
  const added = seed.filter((m) => !known.has(m.id) && !removidos.has(m.id));
  return [...cleaned, ...added];
}

export function loadMembers(key: string, seed: Member[], chaveDeRemovidos?: string): Member[] {
  const removidos = chaveDeRemovidos ? lerRemovidos(chaveDeRemovidos) : new Set<string>();
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return seed.filter((m) => !removidos.has(m.id));
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return seed.filter((m) => !removidos.has(m.id));
    return migrateMembers(parsed, seed, removidos);
  } catch {
    return seed.filter((m) => !removidos.has(m.id));
  }
}
