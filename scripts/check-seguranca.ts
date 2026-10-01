import {
  sanitizeHtml,
  sanitizeProject,
  sanitizeImageSrc,
  sanitizeUrl,
  sanitizeConfig,
  pickAllowed,
} from "../src/seguranca/validation";
import {
  hashPassword,
  hashToken,
  verifyMasterToken,
  needsRehash,
  generateSecure10DigitToken,
  aesEncrypt,
  aesDecrypt,
  constantTimeEquals,
  PBKDF2_ITERATIONS,
} from "../src/seguranca/crypto";
import { montarLinkDeContato, numeroInternacional } from "../src/secoes/cta/contato";

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

console.log("\n== Limpeza de HTML: o que deve SAIR ==\n");

const ataques: Array<[string, string]> = [
  ["tag script", "<script>roubar()</script>"],
  ["script com atributo", '<script src="http://mau.com/x.js"></script>'],
  ["script aninhado", "<scr<script>ipt>roubar()</scr</script>ipt>"],
  ["onerror em imagem", '<img src=x onerror="roubar()">'],
  ["onerror sem aspas", "<img src=x onerror=roubar()>"],
  ["onclick", '<p onclick="roubar()">texto</p>'],
  ["ONLOAD maiúsculo", '<body ONLOAD="roubar()">'],
  ["link javascript:", '<a href="javascript:roubar()">clique</a>'],
  ["iframe", '<iframe src="http://mau.com"></iframe>'],
  ["objeto embutido", '<object data="mau.swf"></object>'],
  ["svg com script", "<svg><script>roubar()</script></svg>"],
  ["formulário falso", '<form action="http://mau.com"><input></form>'],
  ["data:text/html", '<a href="data:text/html,<script>x</script>">i</a>'],
  ["style com expressão", "<style>body{background:url(javascript:x)}</style>"],
];

const proibido =
  /<\s*(script|iframe|object|embed|form|style)|(\son[a-z]+\s*=)|javascript:|vbscript:|data:text\/html/i;

for (const [nome, carga] of ataques) {
  const limpo = sanitizeHtml(carga);
  check(nome + " é neutralizado", !proibido.test(limpo), JSON.stringify(limpo));
}

console.log("\n== Limpeza de HTML: o que deve FICAR ==\n");

const preservar: Array<[string, string]> = [
  ["parágrafo", "<p>A ciência começa com uma pergunta.</p>"],
  ["negrito", "<strong>importante</strong>"],
  ["título", "<h2>Metodologia</h2>"],
  ["lista", "<ul><li>um</li><li>dois</li></ul>"],
  ["link normal", '<a href="https://ufba.br">UFBA</a>'],
  ["imagem normal", '<img src="/Victor.jpeg" alt="Victor">'],
  ["acentos e emoji", "Iniciação científica no semiárido 🔬"],
];

for (const [nome, texto] of preservar) {
  const limpo = sanitizeHtml(texto);
  check(nome + " é preservado", limpo === texto, JSON.stringify(limpo));
}

console.log("\n== O campo `content` do projeto usa a limpeza forte ==\n");

const projeto = sanitizeProject({
  title: "Teste",
  content: '<p>ok</p><img src=x onerror="roubar()">',
});
check(
  "projeto importado tem o onerror removido",
  !/onerror/i.test(String(projeto.content)),
  String(projeto.content)
);
check("e o texto legítimo continua", String(projeto.content).includes("<p>ok</p>"));

console.log("\n== Endereços de imagem ==\n");

check("javascript: em imagem é recusado", sanitizeImageSrc("javascript:roubar()") === "");
check("caminho normal é aceito", sanitizeImageSrc("/Victor.jpeg") === "/Victor.jpeg");

console.log("\n== Poluição de prototype ==\n");

const sujo = JSON.parse('{"__proto__":{"invadido":true},"name":"Fulano"}');
const limpo = pickAllowed<{ name: string }>(sujo, ["name", "__proto__"]);
check("__proto__ é descartado", !Object.hasOwn(limpo, "__proto__"));
check(
  "o Object global não foi contaminado",
  ({} as Record<string, unknown>).invadido === undefined
);
check("o campo legítimo passa", limpo.name === "Fulano");

console.log("\n== Endereços de link (rodapé, contatos) ==\n");

const urlsRuins: Array<[string, string]> = [
  ["javascript:", "javascript:roubar()"],
  ["javascript: com espaços", "  javascript:roubar()  "],
  ["JavaScript maiúsculo", "JaVaScRiPt:roubar()"],
  ["vbscript:", "vbscript:roubar()"],
  ["data:text/html", "data:text/html,<script>x</script>"],
  ["file://", "file:///C:/Windows/System32"],
];
for (const [nome, url] of urlsRuins) {
  check(nome + " é recusado", sanitizeUrl(url) === "", JSON.stringify(sanitizeUrl(url)));
}

const urlsBoas: Array<[string, string]> = [
  ["https", "https://instagram.com/ceclos"],
  ["http", "http://ufba.br"],
  ["caminho interno", "/Logo FECIBA.png"],
  ["âncora", "#junte-se"],
  ["e-mail", "mailto:contato@ceclos.br"],
  ["telefone", "tel:+5577999999999"],
  ["sem protocolo", "instagram.com/ceclos"],
];
for (const [nome, url] of urlsBoas) {
  check(nome + " é aceito", sanitizeUrl(url) === url.trim(), JSON.stringify(sanitizeUrl(url)));
}

console.log("\n== O painel não consegue gravar link perigoso ==\n");

const cfg = sanitizeConfig({ contactInstagramUrl: "javascript:roubar()", siteTitle: "CECLOS" }, [
  "contactInstagramUrl",
  "siteTitle",
]);
check("link javascript: vindo do painel vira vazio", cfg.contactInstagramUrl === "");
check("o texto normal do painel passa", cfg.siteTitle === "CECLOS");

async function verificarCriptografia(): Promise<void> {
  console.log("\n== Senhas e token mestre (PBKDF2-SHA-256) ==\n");

  const token = generateSecure10DigitToken();
  check("token gerado tem 10 caracteres", token.length === 10, token);
  check(
    "token gerado usa só o alfabeto sem ambiguidade",
    /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(token),
    token
  );
  const amostra = new Set(Array.from({ length: 300 }, () => generateSecure10DigitToken()));
  check("300 tokens gerados são todos diferentes", amostra.size === 300);

  const hash = await hashPassword(token);
  const partes = hash.split(":");
  check(
    "hash novo usa pbkdf2 com " + PBKDF2_ITERATIONS + " iterações",
    partes[0] === "pbkdf2" && Number(partes[1]) === PBKDF2_ITERATIONS && partes.length === 4
  );
  check("hash novo não tem $ (seguro para colar no .env)", !hash.includes("$"));
  check(
    "hash no formato antigo com $ continua sendo aceito",
    await verifyMasterToken(token, partes.join("$"))
  );
  check("sal de 128 bits e hash de 256 bits", partes[2]?.length === 32 && partes[3]?.length === 64);
  const outroHash = await hashPassword(token);
  check("o mesmo token gera hashes diferentes (sal aleatório)", outroHash !== hash);
  check("o token certo é aceito", await verifyMasterToken(token, hash));
  check(
    "o token digitado em minúsculas também é aceito",
    await verifyMasterToken(token.toLowerCase(), hash)
  );
  check("um token errado é recusado", !(await verifyMasterToken("ZZZZZZZZZZ", hash)));
  check("token com tamanho errado é recusado", !(await verifyMasterToken(token.slice(0, 9), hash)));
  check(
    "hash forjado com iterações absurdas é recusado",
    !(await verifyMasterToken(token, "pbkdf2$999999999$" + partes[2] + "$" + partes[3]))
  );
  check(
    "hash com sal inválido é recusado",
    !(await verifyMasterToken(token, "pbkdf2$600000$zz$" + partes[3]))
  );

  const legado = await hashToken("1234567890", "sal-de-teste");
  check("hash SHA-256 antigo tem 64 caracteres hex", /^[0-9a-f]{64}$/.test(legado));
  check("hash antigo é marcado para migrar", needsRehash(legado));
  check(
    "hash com 210 mil iterações é marcado para migrar",
    needsRehash("pbkdf2$210000$" + partes[2] + "$" + partes[3])
  );
  check("hash novo não precisa migrar", !needsRehash(hash));

  check("comparação em tempo constante: iguais", constantTimeEquals("abc123", "abc123"));
  check("comparação em tempo constante: diferentes", !constantTimeEquals("abc123", "abc124"));
  check("comparação em tempo constante: tamanhos diferentes", !constantTimeEquals("abc", "abcd"));

  console.log("\n== Cifra autenticada (AES-256-GCM + HKDF) ==\n");

  const segredo = JSON.stringify({ sessao: "painel", expira: 123 });
  const cifrado = await aesEncrypt(segredo, "teste");
  check(
    "o texto cifrado segue o formato v2.iv.dados",
    /^v2\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]+$/.test(cifrado),
    cifrado
  );
  check("o texto cifrado não contém o original", !cifrado.includes("painel"));
  check("decifra de volta para o original", (await aesDecrypt(cifrado, "teste")) === segredo);
  const deNovo = await aesEncrypt(segredo, "teste");
  check("cifrar duas vezes gera resultados diferentes (IV aleatório)", deNovo !== cifrado);
  check("outro contexto não consegue decifrar", (await aesDecrypt(cifrado, "outro")) === null);

  const [versao, iv, dados] = cifrado.split(".");
  const trocado = dados[5] === "A" ? "B" : "A";
  const adulterado = `${versao}.${iv}.${dados.slice(0, 5)}${trocado}${dados.slice(6)}`;
  check("um byte adulterado é detectado", (await aesDecrypt(adulterado, "teste")) === null);
  check("formato antigo/inválido é recusado", (await aesDecrypt("bGl4bw==", "teste")) === null);
  check("texto vazio é recusado", (await aesDecrypt("", "teste")) === null);

  console.log("\n== Botão Participar do Clube (WhatsApp) ==\n");

  check(
    "número com DDD ganha o código do Brasil",
    numeroInternacional("(77) 99999-8888") === "5577999998888"
  );
  check(
    "número já com +55 é mantido",
    numeroInternacional("+55 77 99999-8888") === "5577999998888"
  );
  check("número vazio não gera link", montarLinkDeContato("", "Oi") === "");
  check("número curto demais não gera link", montarLinkDeContato("9999", "Oi") === "");
  check(
    "o link abre o WhatsApp com a mensagem codificada",
    montarLinkDeContato("77 99999-8888", "Olá & bem-vindo") ===
      "https://wa.me/5577999998888?text=Ol%C3%A1%20%26%20bem-vindo"
  );
  check("o link sempre usa https", montarLinkDeContato("77999998888", "x").startsWith("https://"));
}

verificarCriptografia()
  .catch((erro) => {
    falhas++;
    console.log("  FALHA erro inesperado -> " + String(erro));
  })
  .finally(() => {
    console.log("\n-- " + (total - falhas) + "/" + total + " verificações passaram --\n");
    if (falhas > 0) process.exit(1);
  });
