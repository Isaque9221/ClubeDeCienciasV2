import { createHash, pbkdf2, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derivarPbkdf2 = promisify(pbkdf2);

const PREFIXO = "ceclos:est:";
const NOVENTA_DIAS = 60 * 60 * 24 * 90;
const UMA_HORA = 60 * 60;
const QUANTAS_RECENTES = 100;
const QUANTAS_CIDADES = 50;
const DIAS_NO_GRAFICO = 14;
const FUSO = "America/Bahia";
const TAMANHO_MAXIMO_DO_CORPO = 2000;
const LIMITE_DE_EVENTOS_POR_HORA = 120;
const LIMITE_DE_ERROS_DO_ADMIN = 10;

export const DISPOSITIVOS = ["celular", "tablet", "computador"] as const;
export const ORIGENS = [
  "direto",
  "compartilhado",
  "whatsapp",
  "instagram",
  "facebook",
  "google",
  "outro-site",
] as const;
export const MEIOS = ["nativo", "link"] as const;

type Dispositivo = (typeof DISPOSITIVOS)[number];
type Origem = (typeof ORIGENS)[number];
type Meio = (typeof MEIOS)[number];

export type Evento =
  | { tipo: "visita"; visita: string; visitante: string; dispositivo: Dispositivo; origem: Origem }
  | { tipo: "compartilhamento"; visita: string; visitante: string; meio: Meio };

interface Banco {
  url: string;
  token: string;
}

interface VisitaGuardada {
  quando: number;
  pais: string;
  regiao: string;
  cidade: string;
  dispositivo: Dispositivo;
  origem: Origem;
}

const ID_VALIDO = /^[A-Za-z0-9-]{8,64}$/;
const NAVEGADOR_AUTOMATICO =
  /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|whatsapp\/|preview/i;

function chave(nome: string): string {
  return `${PREFIXO}${nome}`;
}

function bancoConfigurado(): Banco | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

async function executar(banco: Banco, comandos: (string | number)[][]): Promise<unknown[]> {
  const resposta = await fetch(`${banco.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${banco.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comandos.map((comando) => comando.map(String))),
  });
  if (!resposta.ok) throw new Error(`O banco respondeu ${resposta.status}`);
  const itens = (await resposta.json()) as { result?: unknown; error?: string }[];
  return itens.map((item) => {
    if (item.error) throw new Error(item.error);
    return item.result;
  });
}

function json(dados: unknown, status = 200): Response {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function semConteudo(): Response {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

function cabecalho(request: Request, nome: string, tamanho: number): string {
  const bruto = request.headers.get(nome) || "";
  let valor = bruto;
  try {
    valor = decodeURIComponent(bruto);
  } catch {}
  return valor
    .replace(/[\u0000-\u001f\u007f<>"]/g, "")
    .trim()
    .slice(0, tamanho);
}

function chaveDoLimite(request: Request, banco: Banco, tipo: string): string {
  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "sem-ip";
  const hora = Math.floor(Date.now() / (UMA_HORA * 1000));
  const resumo = createHash("sha256")
    .update(`${banco.token}:${ip}:${hora}`)
    .digest("hex")
    .slice(0, 24);
  return chave(`limite:${tipo}:${resumo}`);
}

export function diaEm(fuso: string, data: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(data);
}

function dispositivoPeloNavegador(request: Request): Dispositivo {
  const ua = request.headers.get("user-agent") || "";
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (request.headers.get("sec-ch-ua-mobile") === "?1" || /Mobi|iPhone|iPod|Android/i.test(ua)) {
    return "celular";
  }
  return "computador";
}

function umDe<T extends string>(lista: readonly T[], valor: unknown): T | null {
  return typeof valor === "string" && (lista as readonly string[]).includes(valor)
    ? (valor as T)
    : null;
}

export function lerEvento(dados: unknown, dispositivoReserva: Dispositivo): Evento | null {
  if (typeof dados !== "object" || dados === null) return null;
  const bruto = dados as Record<string, unknown>;
  const visita = typeof bruto.visita === "string" ? bruto.visita : "";
  const visitante = typeof bruto.visitante === "string" ? bruto.visitante : "";
  if (!ID_VALIDO.test(visita) || !ID_VALIDO.test(visitante)) return null;

  if (bruto.tipo === "visita") {
    return {
      tipo: "visita",
      visita,
      visitante,
      dispositivo: umDe(DISPOSITIVOS, bruto.dispositivo) ?? dispositivoReserva,
      origem: umDe(ORIGENS, bruto.origem) ?? "direto",
    };
  }
  if (bruto.tipo === "compartilhamento") {
    const meio = umDe(MEIOS, bruto.meio);
    return meio ? { tipo: "compartilhamento", visita, visitante, meio } : null;
  }
  return null;
}

export function lugarDaVisita(request: Request): { pais: string; regiao: string; cidade: string } {
  return {
    pais: cabecalho(request, "x-vercel-ip-country", 2).toUpperCase(),
    regiao: cabecalho(request, "x-vercel-ip-country-region", 3).toUpperCase(),
    cidade: cabecalho(request, "x-vercel-ip-city", 80),
  };
}

function chaveDoEstado(pais: string, regiao: string): string {
  return pais ? `${pais}-${regiao || "?"}` : "?";
}

async function registrarVisita(
  banco: Banco,
  request: Request,
  evento: Extract<Evento, { tipo: "visita" }>
): Promise<void> {
  const lugar = lugarDaVisita(request);
  const guardada: VisitaGuardada = {
    quando: Date.now(),
    ...lugar,
    dispositivo: evento.dispositivo,
    origem: evento.origem,
  };

  const [novo] = await executar(banco, [
    ["SET", chave(`visita:${evento.visita}`), JSON.stringify(guardada), "NX", "EX", NOVENTA_DIAS],
  ]);
  if (novo !== "OK") return;

  const estado = chaveDoEstado(lugar.pais, lugar.regiao);
  await executar(banco, [
    ["INCR", chave("acessos")],
    ["PFADD", chave("visitantes"), evento.visitante],
    ["HINCRBY", chave("dias"), diaEm(FUSO), 1],
    ["HINCRBY", chave("estados"), estado, 1],
    ["HINCRBY", chave("cidades"), `${estado}|${lugar.cidade || "?"}`, 1],
    ["HINCRBY", chave("dispositivos"), evento.dispositivo, 1],
    ["HINCRBY", chave("origens"), evento.origem, 1],
    ["LPUSH", chave("recentes"), evento.visita],
    ["LTRIM", chave("recentes"), 0, QUANTAS_RECENTES - 1],
  ]);
}

async function registrarCompartilhamento(
  banco: Banco,
  evento: Extract<Evento, { tipo: "compartilhamento" }>
): Promise<void> {
  await executar(banco, [
    ["HINCRBY", chave("compartilhamentos"), evento.meio, 1],
    ["PFADD", chave("quem-compartilhou"), evento.visitante],
    ["SET", chave(`compartilhou:${evento.visita}`), "1", "EX", NOVENTA_DIAS],
  ]);
}

export async function POST(request: Request): Promise<Response> {
  const banco = bancoConfigurado();
  if (!banco) return semConteudo();
  if (NAVEGADOR_AUTOMATICO.test(request.headers.get("user-agent") || "")) return semConteudo();

  const texto = await request.text();
  if (texto.length > TAMANHO_MAXIMO_DO_CORPO) return json({ erro: "grande-demais" }, 413);

  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    return json({ erro: "invalido" }, 400);
  }
  const evento = lerEvento(dados, dispositivoPeloNavegador(request));
  if (!evento) return json({ erro: "invalido" }, 400);

  try {
    const limite = chaveDoLimite(request, banco, "eventos");
    const [quantos] = await executar(banco, [
      ["INCR", limite],
      ["EXPIRE", limite, UMA_HORA],
    ]);
    if (Number(quantos) > LIMITE_DE_EVENTOS_POR_HORA) return json({ erro: "muitos" }, 429);

    if (evento.tipo === "visita") await registrarVisita(banco, request, evento);
    else await registrarCompartilhamento(banco, evento);
    return semConteudo();
  } catch {
    return json({ erro: "banco" }, 502);
  }
}

async function confereCom(token: string, guardado: string): Promise<boolean> {
  if (/^pbkdf2[$:]/.test(guardado)) {
    const partes = guardado.split(/[$:]/);
    if (partes.length !== 4) return false;
    const [, iteracoesTexto, salHex, esperado] = partes;
    const iteracoes = Number(iteracoesTexto);
    if (!Number.isInteger(iteracoes) || iteracoes < 1_000 || iteracoes > 5_000_000) return false;
    if (!/^(?:[0-9a-f]{2})+$/i.test(salHex) || !/^[0-9a-f]{64}$/i.test(esperado)) return false;
    const obtido = await derivarPbkdf2(token, Buffer.from(salHex, "hex"), iteracoes, 32, "sha256");
    return timingSafeEqual(obtido, Buffer.from(esperado, "hex"));
  }
  if (!/^[0-9a-f]{64}$/i.test(guardado)) return false;
  const sal = process.env.VITE_SECURITY_SALT || "ceclos_default_salt_change_me";
  const obtido = createHash("sha256").update(`${token}:${sal}`).digest();
  return timingSafeEqual(obtido, Buffer.from(guardado, "hex"));
}

export async function tokenConfere(token: string, guardado: string): Promise<boolean> {
  const limpo = token.trim();
  if (!guardado || !/^[a-zA-Z0-9]{10}$/.test(limpo)) return false;
  if (await confereCom(limpo, guardado)) return true;
  const maiusculo = limpo.toUpperCase();
  return maiusculo !== limpo && confereCom(maiusculo, guardado);
}

function comoContagem(resultado: unknown): Record<string, number> {
  const contagem: Record<string, number> = {};
  if (!Array.isArray(resultado)) return contagem;
  for (let i = 0; i + 1 < resultado.length; i += 2) {
    contagem[String(resultado[i])] = Number(resultado[i + 1]) || 0;
  }
  return contagem;
}

function ordenada(contagem: Record<string, number>): [string, number][] {
  return Object.entries(contagem).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function separarEstado(chaveDoEstadoGuardada: string): { pais: string; regiao: string } {
  if (chaveDoEstadoGuardada === "?") return { pais: "", regiao: "" };
  const [pais, regiao] = chaveDoEstadoGuardada.split("-");
  return { pais: pais || "", regiao: regiao === "?" ? "" : regiao || "" };
}

function ultimosDias(quantos: number, agora: Date = new Date()): string[] {
  const dias: string[] = [];
  for (let i = quantos - 1; i >= 0; i--) {
    dias.push(diaEm(FUSO, new Date(agora.getTime() - i * 24 * 60 * 60 * 1000)));
  }
  return [...new Set(dias)];
}

async function lerEstatisticas(banco: Banco) {
  const [
    acessos,
    visitantes,
    dias,
    estados,
    cidades,
    dispositivos,
    origens,
    compartilhamentos,
    quemCompartilhou,
    recentes,
  ] = await executar(banco, [
    ["GET", chave("acessos")],
    ["PFCOUNT", chave("visitantes")],
    ["HGETALL", chave("dias")],
    ["HGETALL", chave("estados")],
    ["HGETALL", chave("cidades")],
    ["HGETALL", chave("dispositivos")],
    ["HGETALL", chave("origens")],
    ["HGETALL", chave("compartilhamentos")],
    ["PFCOUNT", chave("quem-compartilhou")],
    ["LRANGE", chave("recentes"), 0, QUANTAS_RECENTES - 1],
  ]);

  const ids = Array.isArray(recentes) ? recentes.map(String) : [];
  let visitas: unknown[] = [];
  let marcas: unknown[] = [];
  if (ids.length > 0) {
    const [lidas, compartilhadas] = await executar(banco, [
      ["MGET", ...ids.map((id) => chave(`visita:${id}`))],
      ["MGET", ...ids.map((id) => chave(`compartilhou:${id}`))],
    ]);
    visitas = Array.isArray(lidas) ? lidas : [];
    marcas = Array.isArray(compartilhadas) ? compartilhadas : [];
  }

  const porDia = comoContagem(dias);
  const janela = ultimosDias(DIAS_NO_GRAFICO);
  const hoje = janela[janela.length - 1];
  const vezesCompartilhado = comoContagem(compartilhamentos);
  const porDispositivo = comoContagem(dispositivos);

  return {
    atualizadoEm: new Date().toISOString(),
    resumo: {
      acessos: Number(acessos) || 0,
      visitantes: Number(visitantes) || 0,
      hoje: porDia[hoje] || 0,
      ultimos7Dias: janela.slice(-7).reduce((soma, dia) => soma + (porDia[dia] || 0), 0),
      compartilhamentos: Object.values(vezesCompartilhado).reduce((a, b) => a + b, 0),
      pessoasQueCompartilharam: Number(quemCompartilhou) || 0,
    },
    dias: janela.map((dia) => ({ dia, acessos: porDia[dia] || 0 })),
    estados: ordenada(comoContagem(estados)).map(([estado, total]) => ({
      ...separarEstado(estado),
      acessos: total,
    })),
    cidades: ordenada(comoContagem(cidades))
      .slice(0, QUANTAS_CIDADES)
      .map(([lugar, total]) => {
        const [estado, cidade] = lugar.split("|");
        return {
          ...separarEstado(estado || "?"),
          cidade: cidade === "?" ? "" : cidade || "",
          acessos: total,
        };
      }),
    dispositivos: DISPOSITIVOS.map((tipo) => ({ tipo, acessos: porDispositivo[tipo] || 0 })),
    origens: ordenada(comoContagem(origens)).map(([tipo, total]) => ({ tipo, acessos: total })),
    compartilhamentos: MEIOS.map((meio) => ({ meio, vezes: vezesCompartilhado[meio] || 0 })),
    recentes: visitas.flatMap((bruta, i) => {
      if (typeof bruta !== "string") return [];
      try {
        const visita = JSON.parse(bruta) as VisitaGuardada;
        return [{ ...visita, compartilhou: marcas[i] === "1" }];
      } catch {
        return [];
      }
    }),
  };
}

export async function GET(request: Request): Promise<Response> {
  const banco = bancoConfigurado();
  if (!banco) return json({ erro: "nao-configurado" }, 503);

  const guardado = process.env.VITE_MASTER_TOKEN_HASH || process.env.ESTATISTICAS_TOKEN_HASH || "";
  if (!guardado) return json({ erro: "sem-token" }, 503);

  const autorizacao = request.headers.get("authorization") || "";
  const token = autorizacao.startsWith("Bearer ") ? autorizacao.slice(7) : "";

  try {
    const limite = chaveDoLimite(request, banco, "admin");
    const [erros] = await executar(banco, [["GET", limite]]);
    if (Number(erros) >= LIMITE_DE_ERROS_DO_ADMIN) return json({ erro: "muitos" }, 429);

    if (!(await tokenConfere(token, guardado))) {
      await executar(banco, [
        ["INCR", limite],
        ["EXPIRE", limite, UMA_HORA],
      ]);
      return json({ erro: "nao-autorizado" }, 401);
    }

    return json(await lerEstatisticas(banco));
  } catch {
    return json({ erro: "banco" }, 502);
  }
}
