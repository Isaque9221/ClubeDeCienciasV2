export interface UploadRule {
  maxBytes: number;
  mimeTypes: string[];
  extensions: string[];
}

export const UPLOAD_RULES: Record<"image" | "audio" | "json", UploadRule> = {
  image: {
    maxBytes: 4 * 1024 * 1024,
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
    extensions: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"],
  },
  audio: {
    maxBytes: 12 * 1024 * 1024,
    mimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/x-m4a", "audio/mp4"],
    extensions: [".mp3", ".wav", ".ogg", ".m4a"],
  },
  json: {
    maxBytes: 8 * 1024 * 1024,
    mimeTypes: ["application/json", "text/plain", ""],
    extensions: [".json"],
  },
};

export interface UploadResult {
  ok: boolean;
  error?: string;
}

export function validateUpload(file: File, kind: "image" | "audio" | "json"): UploadResult {
  const rule = UPLOAD_RULES[kind];
  if (file.size > rule.maxBytes) {
    const mb = Math.round(rule.maxBytes / (1024 * 1024));
    return { ok: false, error: `Arquivo excede o limite de ${mb} MB.` };
  }
  const name = file.name.toLowerCase();
  const hasValidExtension = rule.extensions.some((ext) => name.endsWith(ext));
  if (!hasValidExtension) {
    return { ok: false, error: `Extensao nao permitida. Use: ${rule.extensions.join(", ")}.` };
  }
  const typeOk = rule.mimeTypes.includes(file.type);
  if (file.type && !typeOk) {
    return { ok: false, error: "Tipo de arquivo nao permitido." };
  }
  return { ok: true };
}
