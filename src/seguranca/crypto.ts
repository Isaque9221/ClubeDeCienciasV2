const ambiente: Record<string, string | undefined> = import.meta.env ?? {};

const SALT = ambiente.VITE_SECURITY_SALT || "ceclos_default_salt_change_me";

export const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_MIN_ITERATIONS = 1_000;
const PBKDF2_MAX_ITERATIONS = 5_000_000;
const PBKDF2_PREFIX = "pbkdf2";

const VERSAO_DO_CIFRADO = "v2";
const TAMANHO_DO_IV = 12;

const ALFABETO_DO_TOKEN = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TAMANHO_DO_TOKEN = 10;

const NOME_DO_COFRE = "ceclos-cofre";
const LOJA_DO_COFRE = "chaves";
const ID_DA_CHAVE_MESTRA = "mestra-v2";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function constantTimeEquals(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const tamanho = Math.max(a.length, b.length);
  for (let i = 0; i < tamanho; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function sha256Hex(texto: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(texto));
  return bytesToHex(new Uint8Array(digest));
}

export async function hashToken(token: string, salt: string = SALT): Promise<string> {
  return sha256Hex(`${token.trim()}:${salt}`);
}

async function derivarPbkdf2(
  segredo: string,
  salt: Uint8Array,
  iteracoes: number
): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(segredo.trim()),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: iteracoes, hash: "SHA-256" },
    material,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivarPbkdf2(password, salt, PBKDF2_ITERATIONS);
  return [PBKDF2_PREFIX, PBKDF2_ITERATIONS, bytesToHex(salt), bytesToHex(hash)].join(":");
}

async function verifyPbkdf2(password: string, stored: string): Promise<boolean> {
  const partes = stored.split(/[$:]/);
  if (partes.length !== 4 || partes[0] !== PBKDF2_PREFIX) return false;
  const [, iteracoesTexto, saltHex, esperado] = partes;
  const iteracoes = Number(iteracoesTexto);
  if (
    !Number.isInteger(iteracoes) ||
    iteracoes < PBKDF2_MIN_ITERATIONS ||
    iteracoes > PBKDF2_MAX_ITERATIONS
  ) {
    return false;
  }
  const salt = hexToBytes(saltHex);
  if (!salt || !/^[0-9a-f]{64}$/i.test(esperado)) return false;
  const obtido = await derivarPbkdf2(password, salt, iteracoes);
  return constantTimeEquals(bytesToHex(obtido), esperado.toLowerCase());
}

function ehHashPbkdf2(valor: string): boolean {
  return /^pbkdf2[$:]/.test(valor);
}

export function needsRehash(stored: string | undefined): boolean {
  if (!stored || !ehHashPbkdf2(stored)) return true;
  return Number(stored.split(/[$:]/)[1]) < PBKDF2_ITERATIONS;
}

export async function verifyMasterToken(inputToken: string, storedHash?: string): Promise<boolean> {
  const token = inputToken.trim();
  if (!/^[a-zA-Z0-9]{10}$/.test(token)) return false;
  const alvo = storedHash || ambiente.VITE_MASTER_TOKEN_HASH || "";
  if (!alvo) return false;

  const verificar = (candidato: string) =>
    ehHashPbkdf2(alvo)
      ? verifyPbkdf2(candidato, alvo)
      : hashToken(candidato).then((hash) => constantTimeEquals(hash, alvo));

  if (await verificar(token)) return true;
  const maiusculo = token.toUpperCase();
  return maiusculo !== token && verificar(maiusculo);
}

export function generateSecure10DigitToken(): string {
  const limite = 256 - (256 % ALFABETO_DO_TOKEN.length);
  let token = "";
  while (token.length < TAMANHO_DO_TOKEN) {
    const bytes = crypto.getRandomValues(new Uint8Array(TAMANHO_DO_TOKEN * 2));
    for (const byte of bytes) {
      if (byte >= limite) continue;
      token += ALFABETO_DO_TOKEN[byte % ALFABETO_DO_TOKEN.length];
      if (token.length === TAMANHO_DO_TOKEN) break;
    }
  }
  return token;
}

export function randomId(bytes = 16): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

function abrirCofre(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") {
        resolve(null);
        return;
      }
      const pedido = indexedDB.open(NOME_DO_COFRE, 1);
      pedido.onupgradeneeded = () => {
        if (!pedido.result.objectStoreNames.contains(LOJA_DO_COFRE)) {
          pedido.result.createObjectStore(LOJA_DO_COFRE);
        }
      };
      pedido.onsuccess = () => resolve(pedido.result);
      pedido.onerror = () => resolve(null);
      pedido.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function lerDoCofre(banco: IDBDatabase, id: string): Promise<CryptoKey | null> {
  return new Promise((resolve) => {
    try {
      const pedido = banco
        .transaction(LOJA_DO_COFRE, "readonly")
        .objectStore(LOJA_DO_COFRE)
        .get(id);
      pedido.onsuccess = () => resolve((pedido.result as CryptoKey | undefined) ?? null);
      pedido.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function gravarNoCofre(banco: IDBDatabase, id: string, chave: CryptoKey): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const transacao = banco.transaction(LOJA_DO_COFRE, "readwrite");
      transacao.objectStore(LOJA_DO_COFRE).put(chave, id);
      transacao.oncomplete = () => resolve(true);
      transacao.onerror = () => resolve(false);
      transacao.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function gerarChaveMestra(): Promise<CryptoKey> {
  const bruto = crypto.getRandomValues(new Uint8Array(32));
  try {
    return await crypto.subtle.importKey("raw", bruto, "HKDF", false, ["deriveKey"]);
  } finally {
    bruto.fill(0);
  }
}

let chaveMestra: Promise<CryptoKey> | null = null;

function obterChaveMestra(): Promise<CryptoKey> {
  if (!chaveMestra) {
    chaveMestra = (async () => {
      const banco = await abrirCofre();
      if (banco) {
        const guardada = await lerDoCofre(banco, ID_DA_CHAVE_MESTRA);
        if (guardada) return guardada;
      }
      const nova = await gerarChaveMestra();
      if (banco) await gravarNoCofre(banco, ID_DA_CHAVE_MESTRA, nova);
      return nova;
    })().catch((erro) => {
      chaveMestra = null;
      throw erro;
    });
  }
  return chaveMestra;
}

const chavesPorContexto = new Map<string, Promise<CryptoKey>>();

function chaveDoContexto(contexto: string): Promise<CryptoKey> {
  let chave = chavesPorContexto.get(contexto);
  if (!chave) {
    chave = obterChaveMestra().then((mestra) =>
      crypto.subtle.deriveKey(
        {
          name: "HKDF",
          hash: "SHA-256",
          salt: encoder.encode(`ceclos:${SALT}`),
          info: encoder.encode(`ceclos:aes-gcm:${contexto}`),
        },
        mestra,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      )
    );
    chave.catch(() => chavesPorContexto.delete(contexto));
    chavesPorContexto.set(contexto, chave);
  }
  return chave;
}

function dadosAutenticados(contexto: string): Uint8Array {
  return encoder.encode(`ceclos|${VERSAO_DO_CIFRADO}|${contexto}`);
}

export async function aesEncrypt(plaintext: string, context = "default"): Promise<string> {
  const chave = await chaveDoContexto(context);
  const iv = crypto.getRandomValues(new Uint8Array(TAMANHO_DO_IV));
  const cifrado = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: dadosAutenticados(context) as BufferSource,
      tagLength: 128,
    },
    chave,
    encoder.encode(plaintext)
  );
  return `${VERSAO_DO_CIFRADO}.${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(cifrado))}`;
}

export async function aesDecrypt(encoded: string, context = "default"): Promise<string | null> {
  try {
    const [versao, ivTexto, cifradoTexto, ...resto] = encoded.split(".");
    if (versao !== VERSAO_DO_CIFRADO || !ivTexto || !cifradoTexto || resto.length > 0) {
      return null;
    }
    const iv = base64UrlToBytes(ivTexto);
    if (iv.length !== TAMANHO_DO_IV) return null;
    const chave = await chaveDoContexto(context);
    const aberto = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: dadosAutenticados(context) as BufferSource,
        tagLength: 128,
      },
      chave,
      base64UrlToBytes(cifradoTexto) as BufferSource
    );
    return decoder.decode(aberto);
  } catch {
    return null;
  }
}
