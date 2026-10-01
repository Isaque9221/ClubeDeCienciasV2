import type { Member, MemberCategory } from "@/compartilhado/tipos/member.types";

export const PLACEHOLDER_QUOTE = "FRASE QUE LHE MARCA/DEFINE.";

const PLACEHOLDER_AREAS = new Set(["", "?", "-", "--", "n/a", "N/A"]);

const AREA_BY_CATEGORY: Record<MemberCategory, string> = {
  lideranca: "Liderança Científica",
  astronomia_fisica: "Astronomia & Física",
  biotec_quimica: "Biotecnologia & Química",
  tecnologia_robotica: "Tecnologia & Robótica",
  terra_exatas: "Terra & Exatas",
};

export function resolveMemberArea(member: Member): string {
  const area = (member.area || "").trim();
  if (!PLACEHOLDER_AREAS.has(area)) return area;
  return AREA_BY_CATEGORY[member.category] || "Iniciação Científica & Inovação";
}

export function hasCustomQuote(member: Member): boolean {
  const quote = (member.quote || "").trim();
  return quote.length > 0 && quote !== PLACEHOLDER_QUOTE;
}
