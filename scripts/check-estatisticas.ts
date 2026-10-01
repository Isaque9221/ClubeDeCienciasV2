import path from "node:path";
import { createJiti } from "jiti";
import { hashPassword, hashToken } from "../src/seguranca/crypto";

const RAIZ = path.resolve(import.meta.dirname, "..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(RAIZ, "src") } });

let falhas = 0;
let total = 0;

function check(rotulo: string, condicao: boolean, detalhe?: string): void {
  total++;
  if (condicao) {
    console.log("  PASS  " + rotulo);
  } else {
    falhas++;
    console.log("  FALHA " + rotulo + (detalhe ? " -> " + detalhe : ""));
  }
}

type Valor = string | Map<string, string> | Set<string> | string[];
const banco = new Map<string, Valor>();

function executarComando([nome, ...args]: string[]): unknown {
  const comando = nome.toUpperCase();
  const [k] = args;
  switch (comando) {
    case "SET": {
      if (args.includes("NX") && banco.has(k)) return null;
      banco.set(k, args[1]);
      return "OK";
    }
    case "GET": {
      const v = banco.get(k);
      return typeof v === "string" ? v : null;
    }
    case "MGET":
      return args.map((chave) => {
        const v = banco.get(chave);
        return typeof v === "string" ? v : null;
      });
    case "INCR": {
      const atual = Number(banco.get(k) ?? 0) + 1;
      banco.set(k, String(atual));
      return atual;
    }
    case "EXPIRE":
      return 1;
    case "HINCRBY": {
      const mapa = (banco.get(k) as Map<string, string>) ?? new Map<string, string>();
      const atual = Number(mapa.get(args[1]) ?? 0) + Number(args[2]);
      mapa.set(args[1], String(atual));
      banco.set(k, mapa);
      return atual;
    }
    case "HGETALL": {
      const mapa = banco.get(k);
      return mapa instanceof Map ? [...mapa.entries()].flat() : [];
    }
    case "PFADD": {
      const conjunto = (banco.get(k) as Set<string>) ?? new Set<string>();
      const antes = conjunto.size;
      args.slice(1).forEach((item) => conjunto.add(item));
      banco.set(k, conjunto);
      return conjunto.size > antes ? 1 : 0;
    }
    case "PFCOUNT": {
      const conjunto = banco.get(k);
      return conjunto instanceof Set ? conjunto.size : 0;
    }
    case "LPUSH": {
      const lista = (banco.get(k) as string[]) ?? [];
      lista.unshift(...args.slice(1));
      banco.set(k, lista);
      return lista.length;
    }
    case "LTRIM": {
      const lista = (banco.get(k) as string[]) ?? [];
      banco.set(k, lista.slice(Number(args[1]), Number(args[2]) + 1));
      return "OK";
    }
    case "LRANGE": {
      const lista = (banco.get(k) as string[]) ?? [];
      return lista.slice(Number(args[1]), Number(args[2]) + 1);
    }
    default:
      throw new Error("comando não simulado: " + comando);
  }
}

const URL_DO_BANCO = "https://banco.teste";
let chamadasAoBanco = 0;

globalThis.fetch = (async (entrada: string | URL | Request, opcoes?: RequestInit) => {
  const endereco = String(entrada);
  if (endereco !== `${URL_DO_BANCO}/pipeline`) throw new Error("endereço inesperado " + endereco);
  const autorizacao = new Headers(opcoes?.headers).get("authorization");
  if (autorizacao !== "Bearer segredo-do-banco") return new Response("{}", { status: 401 });
  chamadasAoBanco++;
  const comandos = JSON.parse(String(opcoes?.body)) as string[][];
  const resultados = comandos.map((comando) => {
    if (!comando.every((parte) => typeof parte === "string")) {
      return { error: "argumento não é texto" };
    }
    return { result: executarComando(comando) };
  });
  return new Response(JSON.stringify(resultados), { status: 200 });
}) as typeof fetch;

const TOKEN = "ABCDEFGH23";

function pedidoDeVisita(
  corpo: unknown,
  extras: Record<string, string> = {},
  ip = "200.1.1.1"
): Request {
  return new Request("https://ceclos.test/api/estatisticas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140",
      "x-forwarded-for": ip,
      ...extras,
    },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
}

function pedidoDoAdmin(token: string, ip = "200.9.9.9"): Request {
  return new Request("https://ceclos.test/api/estatisticas", {
    headers: { Authorization: `Bearer ${token}`, "x-forwarded-for": ip },
  });
}

const BAHIA = {
  "x-vercel-ip-country": "BR",
  "x-vercel-ip-country-region": "BA",
  "x-vercel-ip-city": "Santa%20Rita%20de%20C%C3%A1ssia",
};

async function verificar(): Promise<void> {
  const api = await import("../api/estatisticas");

  console.log("\n== Sem banco configurado ==\n");
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const semBanco = await api.POST(
    pedidoDeVisita({
      tipo: "visita",
      visita: "visita-0001",
      visitante: "pessoa-0001",
      dispositivo: "computador",
      origem: "direto",
    })
  );
  check("registrar sem banco não quebra o site (204)", semBanco.status === 204);
  const leituraSemBanco = await api.GET(pedidoDoAdmin(TOKEN));
  check(
    "o painel avisa que o banco não foi ligado",
    leituraSemBanco.status === 503 && (await leituraSemBanco.json()).erro === "nao-configurado"
  );

  process.env.KV_REST_API_URL = URL_DO_BANCO + "/";
  process.env.KV_REST_API_TOKEN = "segredo-do-banco";
  process.env.VITE_MASTER_TOKEN_HASH = await hashPassword(TOKEN);

  console.log("\n== Registro de visitas ==\n");
  const primeira = await api.POST(
    pedidoDeVisita(
      {
        tipo: "visita",
        visita: "visita-0001",
        visitante: "pessoa-0001",
        dispositivo: "computador",
        origem: "direto",
      },
      BAHIA
    )
  );
  check("a primeira visita é aceita", primeira.status === 204);
  check("conta 1 acesso", banco.get("ceclos:est:acessos") === "1");

  await api.POST(
    pedidoDeVisita(
      {
        tipo: "visita",
        visita: "visita-0001",
        visitante: "pessoa-0001",
        dispositivo: "computador",
        origem: "direto",
      },
      BAHIA
    )
  );
  check("a mesma visita repetida não conta de novo", banco.get("ceclos:est:acessos") === "1");

  await api.POST(
    pedidoDeVisita(
      {
        tipo: "visita",
        visita: "visita-0002",
        visitante: "pessoa-0002",
        dispositivo: "celular",
        origem: "whatsapp",
      },
      {
        "x-vercel-ip-country": "BR",
        "x-vercel-ip-country-region": "SP",
        "x-vercel-ip-city": "S%C3%A3o%20Paulo",
      },
      "200.2.2.2"
    )
  );
  await api.POST(
    pedidoDeVisita(
      {
        tipo: "visita",
        visita: "visita-0003",
        visitante: "pessoa-0001",
        dispositivo: "inventado",
        origem: "compartilhado",
      },
      { ...BAHIA, "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile/15E148" }
    )
  );
  check("três visitas contadas", banco.get("ceclos:est:acessos") === "3");

  const robo = await api.POST(
    pedidoDeVisita(
      {
        tipo: "visita",
        visita: "visita-0004",
        visitante: "pessoa-0004",
        dispositivo: "computador",
        origem: "direto",
      },
      { "user-agent": "Googlebot/2.1" }
    )
  );
  check(
    "robôs de busca não contam",
    robo.status === 204 && banco.get("ceclos:est:acessos") === "3"
  );

  const invalida = await api.POST(pedidoDeVisita({ tipo: "visita", visita: "x" }));
  check("pedido inválido é recusado (400)", invalida.status === 400);
  const quebrado = await api.POST(pedidoDeVisita("{ não é json"));
  check("JSON quebrado é recusado (400)", quebrado.status === 400);
  const enorme = await api.POST(pedidoDeVisita("x".repeat(5000)));
  check("corpo grande demais é recusado (413)", enorme.status === 413);

  const injecao = await api.POST(
    pedidoDeVisita(
      {
        tipo: "visita",
        visita: "visita-0005",
        visitante: "pessoa-0005",
        dispositivo: "tablet",
        origem: "google",
      },
      {
        "x-vercel-ip-country": "PT",
        "x-vercel-ip-country-region": "11",
        "x-vercel-ip-city": "%3Cscript%3Ealert(1)%3C%2Fscript%3ELisboa",
      },
      "200.5.5.5"
    )
  );
  check("visita do exterior é aceita", injecao.status === 204);

  console.log("\n== Compartilhamentos ==\n");
  const compartilhou = await api.POST(
    pedidoDeVisita({
      tipo: "compartilhamento",
      visita: "visita-0001",
      visitante: "pessoa-0001",
      meio: "link",
    })
  );
  check("compartilhamento aceito", compartilhou.status === 204);
  const meioInvalido = await api.POST(
    pedidoDeVisita({
      tipo: "compartilhamento",
      visita: "visita-0001",
      visitante: "pessoa-0001",
      meio: "pombo-correio",
    })
  );
  check("meio de compartilhamento desconhecido é recusado", meioInvalido.status === 400);

  console.log("\n== Leitura pelo painel ==\n");
  const semToken = await api.GET(pedidoDoAdmin(""));
  check("sem token: 401", semToken.status === 401);
  const tokenErrado = await api.GET(pedidoDoAdmin("ZZZZZZZZ99"));
  check("token errado: 401", tokenErrado.status === 401);

  const resposta = await api.GET(pedidoDoAdmin(TOKEN));
  check("token certo: 200", resposta.status === 200);
  check("a resposta não fica em cache", resposta.headers.get("cache-control") === "no-store");
  const dados = await resposta.json();

  check("resumo: 4 acessos", dados.resumo.acessos === 4, JSON.stringify(dados.resumo));
  check("resumo: 3 pessoas diferentes", dados.resumo.visitantes === 3);
  check("resumo: 4 acessos hoje", dados.resumo.hoje === 4);
  check("resumo: 1 pessoa compartilhou", dados.resumo.pessoasQueCompartilharam === 1);
  check("resumo: 1 compartilhamento", dados.resumo.compartilhamentos === 1);

  check(
    "Bahia lidera os estados com 2 acessos",
    dados.estados[0]?.pais === "BR" &&
      dados.estados[0]?.regiao === "BA" &&
      dados.estados[0]?.acessos === 2,
    JSON.stringify(dados.estados)
  );
  check(
    "cidade com acento chega decodificada",
    dados.cidades.some(
      (c: { cidade: string; acessos: number }) =>
        c.cidade === "Santa Rita de Cássia" && c.acessos === 2
    ),
    JSON.stringify(dados.cidades)
  );
  check(
    "HTML no nome da cidade é removido",
    dados.cidades.every((c: { cidade: string }) => !/[<>]/.test(c.cidade))
  );

  const porAparelho = Object.fromEntries(
    dados.dispositivos.map((d: { tipo: string; acessos: number }) => [d.tipo, d.acessos])
  );
  check(
    "aparelho inválido vira o detectado pelo navegador (iPhone = celular)",
    porAparelho.celular === 2 && porAparelho.computador === 1 && porAparelho.tablet === 1,
    JSON.stringify(porAparelho)
  );

  const porOrigem = Object.fromEntries(
    dados.origens.map((o: { tipo: string; acessos: number }) => [o.tipo, o.acessos])
  );
  check(
    "origens contadas (whatsapp, compartilhado, direto, google)",
    porOrigem.whatsapp === 1 &&
      porOrigem.compartilhado === 1 &&
      porOrigem.direto === 1 &&
      porOrigem.google === 1,
    JSON.stringify(porOrigem)
  );

  check("4 acessos recentes", dados.recentes.length === 4);
  check(
    "o mais recente vem primeiro",
    dados.recentes[0]?.pais === "PT" && dados.recentes[3]?.regiao === "BA"
  );
  check(
    "a visita que compartilhou aparece marcada",
    dados.recentes[3]?.compartilhou === true && dados.recentes[2]?.compartilhou === false
  );
  const comoTexto = (v: Valor) => JSON.stringify(v instanceof Map || v instanceof Set ? [...v] : v);
  check(
    "nenhum IP é guardado",
    ![...banco.entries()].some(([k, v]) => (k + comoTexto(v)).includes("200."))
  );

  const minusculo = await api.GET(pedidoDoAdmin(TOKEN.toLowerCase()));
  check("token digitado em minúsculas também é aceito", minusculo.status === 200);

  console.log("\n== Proteção contra tentativas ==\n");
  for (let i = 0; i < 10; i++) await api.GET(pedidoDoAdmin("ERRADO0000", "200.7.7.7"));
  const travado = await api.GET(pedidoDoAdmin(TOKEN, "200.7.7.7"));
  check("após 10 erros a rede fica bloqueada (429)", travado.status === 429);
  const outraRede = await api.GET(pedidoDoAdmin(TOKEN, "200.8.8.8"));
  check("outra rede continua entrando", outraRede.status === 200);

  console.log("\n== Formatos de token ==\n");
  check("hash PBKDF2 do painel confere", await api.tokenConfere(TOKEN, await hashPassword(TOKEN)));
  check("hash SHA-256 antigo confere", await api.tokenConfere(TOKEN, await hashToken(TOKEN)));
  check("hash vazio não confere", !(await api.tokenConfere(TOKEN, "")));
  check(
    "token com tamanho errado não confere",
    !(await api.tokenConfere("ABC", process.env.VITE_MASTER_TOKEN_HASH || ""))
  );
  check(
    "dia no fuso da Bahia",
    api.diaEm("America/Bahia", new Date("2026-01-01T02:00:00Z")) === "2025-12-31"
  );
  check("o banco foi usado", chamadasAoBanco > 0);

  console.log("\n== Origem da visita (navegador) ==\n");
  const registro = await jiti.import<typeof import("../src/recursos/estatisticas/registro")>(
    "../src/recursos/estatisticas/registro.ts"
  );
  const SITE = "https://ceclos.test/";
  const CHROME = "Mozilla/5.0 Chrome/140";
  check("sem referência = direto", registro.origemDaVisita(SITE, "", CHROME) === "direto");
  check(
    "link com ?via=compartilhado",
    registro.origemDaVisita(SITE + "?via=compartilhado", "", CHROME) === "compartilhado"
  );
  check(
    "aberto pelo WhatsApp no Android",
    registro.origemDaVisita(SITE, "android-app://com.whatsapp/", CHROME) === "whatsapp"
  );
  check(
    "navegador interno do Instagram",
    registro.origemDaVisita(SITE, "", "Mozilla/5.0 Instagram 300.0") === "instagram"
  );
  check(
    "vindo do Google",
    registro.origemDaVisita(SITE, "https://www.google.com/", CHROME) === "google"
  );
  check(
    "navegação dentro do próprio site = direto",
    registro.origemDaVisita(SITE, "https://ceclos.test/membros", CHROME) === "direto"
  );
  check(
    "outro site qualquer",
    registro.origemDaVisita(SITE, "https://exemplo.org/", CHROME) === "outro-site"
  );

  console.log("\n== Botão Participar do Clube e e-mail do rodapé ==\n");
  const cta = await jiti.import<typeof import("../src/secoes/cta/conteudo")>(
    "../src/secoes/cta/conteudo.ts"
  );
  const link = cta.montarCta({} as never).botaoPrincipal.link;
  check(
    "o botão abre o WhatsApp +55 75 9705-9889",
    link.startsWith("https://wa.me/557597059889?text="),
    link
  );
  check(
    "telefone vazio salvo no painel não apaga o número",
    cta.montarCta({ ctaPhone: "" } as never).botaoPrincipal.link === link
  );

  const rodape = await jiti.import<typeof import("../src/secoes/rodape/conteudo")>(
    "../src/secoes/rodape/conteudo.ts"
  );
  const EMAIL = "victor.moreno1@enova.educacao.ba.gov.br";
  check("o rodapé mostra o novo e-mail", rodape.montarRodape({} as never).contatos.email === EMAIL);
  check(
    "o e-mail antigo salvo no navegador é trocado pelo novo",
    rodape.montarRodape({ contactEmail: "ceclos.ciencias@gmail.com" } as never).contatos.email ===
      EMAIL
  );
  check(
    "um e-mail diferente definido no painel é respeitado",
    rodape.montarRodape({ contactEmail: "outro@escola.ba.gov.br" } as never).contatos.email ===
      "outro@escola.ba.gov.br"
  );

  const identidade = rodape.montarRodape({} as never).identidade;
  check("o Instagram é @clubececlos", identidade.instagram === "@clubececlos");
  check(
    "o link do Instagram abre o perfil do clube",
    identidade.linkDoInstagram === "https://www.instagram.com/clubececlos/"
  );
  const antigo = rodape.montarRodape({
    contactInstagram: "@ceclos.ciencias",
    contactInstagramUrl: "https://instagram.com",
  } as never).identidade;
  check(
    "o Instagram antigo salvo no navegador é trocado pelo novo",
    antigo.instagram === "@clubececlos" &&
      antigo.linkDoInstagram === "https://www.instagram.com/clubececlos/"
  );
}

verificar()
  .catch((erro) => {
    falhas++;
    console.log("  FALHA erro inesperado -> " + String(erro?.stack ?? erro));
  })
  .finally(() => {
    console.log("\n-- " + (total - falhas) + "/" + total + " verificações passaram --\n");
    if (falhas > 0) process.exit(1);
  });
