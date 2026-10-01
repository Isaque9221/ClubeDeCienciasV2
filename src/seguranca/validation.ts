const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const MEMBER_FIELDS = [
  "id",
  "name",
  "role",
  "area",
  "image",
  "imagePosition",
  "iconName",
  "color",
  "quote",
  "tag",
  "category",
  "num",
] as const;

const PARTNER_FIELDS = [
  "id",
  "name",
  "fullName",
  "category",
  "type",
  "color",
  "desc",
  "logo",
] as const;

const PROJECT_FIELDS = [
  "id",
  "studentId",
  "studentName",
  "studentEmail",
  "studentImage",
  "studentRole",
  "studentGrade",
  "title",
  "emoji",
  "coverGradient",
  "coverImage",
  "pillar",
  "status",
  "summary",
  "content",
  "methodology",
  "tags",
  "createdAt",
  "updatedAt",
  "adminFeedback",
] as const;

export function sanitizeText(value: unknown, maxLength = 5000): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, maxLength);
}

export function isSafeImageSrc(value: unknown): boolean {
  if (typeof value !== "string" || value.length === 0) return true;
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:")
  );
}

export function sanitizeImageSrc(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  return isSafeImageSrc(text) ? text : "";
}

export function pickAllowed<T extends object>(
  source: unknown,
  allowedKeys: readonly string[]
): Partial<T> {
  if (!source || typeof source !== "object") return {};
  const result: Record<string, unknown> = {};
  const allowed = new Set<string>(allowedKeys);
  for (const [key, value] of Object.entries(source)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    if (allowed.has(key)) result[key] = value;
  }
  return result as Partial<T>;
}

export function stripDangerousKeys<T extends object>(source: T): T {
  if (!source || typeof source !== "object") return source;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    result[key] = value;
  }
  return result as T;
}

export function sanitizeMember(input: unknown): Record<string, unknown> {
  const picked = pickAllowed(input, MEMBER_FIELDS);
  const record = picked as Record<string, unknown>;
  if ("name" in record) record.name = sanitizeText(record.name, 120);
  if ("role" in record) record.role = sanitizeText(record.role, 160);
  if ("area" in record) record.area = sanitizeText(record.area, 160);
  if ("quote" in record) record.quote = sanitizeText(record.quote, 600);
  if ("tag" in record) record.tag = sanitizeText(record.tag, 120);
  if ("image" in record) record.image = sanitizeImageSrc(record.image);
  return record;
}

export function sanitizePartner(input: unknown): Record<string, unknown> {
  const record = pickAllowed(input, PARTNER_FIELDS) as Record<string, unknown>;
  if ("name" in record) record.name = sanitizeText(record.name, 120);
  if ("fullName" in record) record.fullName = sanitizeText(record.fullName, 200);
  if ("desc" in record) record.desc = sanitizeText(record.desc, 600);
  if ("logo" in record) record.logo = sanitizeImageSrc(record.logo);
  return record;
}

const TAGS_PROIBIDAS =
  /<\s*(script|style|iframe|object|embed|link|meta|base|form|svg|math)\b[\s\S]*?(?:<\s*\/\s*\1\s*>|$)/gi;

const ABERTURA_PROIBIDA =
  /<\s*\/?\s*(?:script|style|iframe|object|embed|link|meta|base|form|svg|math)\b[^>]*>/gi;

const ATRIBUTOS_DE_EVENTO = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const PROTOCOLOS_PERIGOSOS =
  /\s(?:href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*'|\s*(?:javascript|vbscript):[^\s>]*)/gi;

export function sanitizeHtml(value: unknown, maxLength = 20000): string {
  const bruto = sanitizeText(value, maxLength);
  if (!bruto) return "";
  let limpo = bruto;
  for (let volta = 0; volta < 5; volta++) {
    const antes = limpo;
    limpo = limpo
      .replace(TAGS_PROIBIDAS, "")
      .replace(ABERTURA_PROIBIDA, "")
      .replace(ATRIBUTOS_DE_EVENTO, "")
      .replace(PROTOCOLOS_PERIGOSOS, "");
    if (limpo === antes) break;
  }
  return limpo;
}

export function sanitizeProject(input: unknown): Record<string, unknown> {
  const record = pickAllowed(input, PROJECT_FIELDS) as Record<string, unknown>;
  if ("title" in record) record.title = sanitizeText(record.title, 200);
  if ("summary" in record) record.summary = sanitizeText(record.summary, 1200);
  if ("content" in record) record.content = sanitizeHtml(record.content, 20000);
  if ("coverImage" in record) record.coverImage = sanitizeImageSrc(record.coverImage);
  if ("studentImage" in record) record.studentImage = sanitizeImageSrc(record.studentImage);
  if (Array.isArray(record.tags)) {
    record.tags = record.tags
      .filter((t) => typeof t === "string")
      .slice(0, 20)
      .map((t) => sanitizeText(t, 40));
  }
  return record;
}

const MEDIA_KEY_PATTERN = /image|url|video|logo|avatar|cover|hash/i;
const MEDIA_MAX_LENGTH = 5_000_000;
const TEXT_MAX_LENGTH = 8000;

const CHAVE_DE_ENDERECO = /(url|link|href)$/i;

export function sanitizeUrl(value: unknown): string {
  const texto = sanitizeText(value, MEDIA_MAX_LENGTH).trim();
  if (!texto) return "";
  const minusculo = texto.toLowerCase().replace(/\s+/g, "");
  const perigosos = ["javascript:", "vbscript:", "data:text/html", "file:"];
  if (perigosos.some((mau) => minusculo.startsWith(mau))) return "";
  if (/^(\/|#|\.\/|\.\.\/)/.test(texto)) return texto;
  if (/^(https?:|mailto:|tel:)/.test(minusculo)) return texto;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(texto)) return texto;
  return "";
}

function limparValor(chave: string, valor: unknown): unknown {
  if (typeof valor === "string") {
    if (CHAVE_DE_ENDERECO.test(chave)) return sanitizeUrl(valor);
    const limite = MEDIA_KEY_PATTERN.test(chave) ? MEDIA_MAX_LENGTH : TEXT_MAX_LENGTH;
    return sanitizeText(valor, limite);
  }

  if (typeof valor === "boolean") return valor;

  if (Array.isArray(valor)) {
    return valor.slice(0, MAX_ITENS_POR_LISTA).map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return {};
      const limpo: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        if (DANGEROUS_KEYS.has(k)) continue;
        limpo[k] = limparValor(k, v);
      }
      return limpo;
    });
  }

  return undefined;
}

const MAX_ITENS_POR_LISTA = 60;

export function sanitizeConfig(
  input: unknown,
  allowedKeys: readonly string[]
): Record<string, unknown> {
  const record = pickAllowed(input, allowedKeys) as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    const limpo = limparValor(key, value);
    if (limpo === undefined) {
      delete record[key];
      continue;
    }
    record[key] = limpo;
  }
  return record;
}

export interface ImportPayload {
  members?: unknown[];
  mentors?: unknown[];
  partners?: unknown[];
  siteConfig?: Record<string, unknown>;
  projects?: unknown[];
  studentAccounts?: unknown[];
}

export function validateImportPayload(
  raw: unknown,
  configKeys: readonly string[]
): ImportPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const payload: ImportPayload = {};
  if (Array.isArray(data.members)) payload.members = data.members.map(sanitizeMember);
  if (Array.isArray(data.mentors)) payload.mentors = data.mentors.map(sanitizeMember);
  if (Array.isArray(data.partners)) payload.partners = data.partners.map(sanitizePartner);
  if (Array.isArray(data.projects)) payload.projects = data.projects.map(sanitizeProject);
  if (Array.isArray(data.studentAccounts)) {
    payload.studentAccounts = data.studentAccounts.map((a) => stripDangerousKeys(a as object));
  }
  if (data.siteConfig && typeof data.siteConfig === "object") {
    payload.siteConfig = sanitizeConfig(data.siteConfig, configKeys);
  }
  return payload;
}
