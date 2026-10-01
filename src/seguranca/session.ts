import { aesEncrypt, aesDecrypt, sha256Hex, constantTimeEquals, randomId } from "./crypto";

const SESSION_KEY = "ceclos_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 4;
const CONTEXTO = "admin-session";

interface SessionPayload {
  id: string;
  fingerprint: string;
  issuedAt: number;
  expiresAt: number;
}

async function fingerprintOf(masterHash: string): Promise<string> {
  return (await sha256Hex(`ceclos:sessao:${masterHash}`)).slice(0, 32);
}

export async function createSession(masterHash: string): Promise<void> {
  const agora = Date.now();
  const payload: SessionPayload = {
    id: randomId(16),
    fingerprint: await fingerprintOf(masterHash),
    issuedAt: agora,
    expiresAt: agora + SESSION_TTL_MS,
  };
  const token = await aesEncrypt(JSON.stringify(payload), CONTEXTO);
  try {
    sessionStorage.setItem(SESSION_KEY, token);
  } catch {}
}

export async function verifySession(masterHash: string): Promise<boolean> {
  let token: string | null = null;
  try {
    token = sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
  if (!token) return false;
  const decrypted = await aesDecrypt(token, CONTEXTO);
  if (!decrypted) return false;
  try {
    const payload = JSON.parse(decrypted) as Partial<SessionPayload>;
    const agora = Date.now();
    if (typeof payload.expiresAt !== "number" || payload.expiresAt < agora) return false;
    if (typeof payload.issuedAt !== "number" || payload.issuedAt > agora + 60_000) return false;
    if (typeof payload.fingerprint !== "string") return false;
    return constantTimeEquals(payload.fingerprint, await fingerprintOf(masterHash));
  } catch {
    return false;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}
