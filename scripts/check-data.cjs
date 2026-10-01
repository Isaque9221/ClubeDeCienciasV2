const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NL = String.fromCharCode(10);

let failures = 0;
let checks = 0;

function check(label, condition, detail) {
  checks++;
  if (condition) {
    console.log("  PASS  " + label);
  } else {
    failures++;
    console.log("  FALHA " + label + (detail ? NL + "        " + detail : ""));
  }
}

function parseMembers(source) {
  const re =
    /id:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*role:\s*"([^"]*)",\s*\n\s*area:\s*"([^"]*)",\s*\n\s*image:\s*"([^"]*)"/g;
  const rows = [];
  let m;
  while ((m = re.exec(source))) {
    const resto = source.slice(m.index, m.index + 700);
    const antes = source.slice(0, m.index);
    const lista =
      antes.lastIndexOf("export const MEMBERS") > antes.lastIndexOf("export const MENTORS")
        ? "MEMBERS"
        : "MENTORS";
    const cat = resto.match(/category:\s*"([^"]+)"/);
    rows.push({
      id: m[1],
      name: m[2],
      role: m[3],
      area: m[4],
      image: m[5],
      category: cat ? cat[1] : "",
      lista,
    });
  }
  return rows;
}

console.log(NL + "== Integridade do elenco de membros ==" + NL);

const dataPath = path.join(ROOT, "src/compartilhado/dados/members.data.ts");
const source = fs.readFileSync(dataPath, "utf8");
const members = parseMembers(source);
const publicFiles = new Set(
  fs
    .readdirSync(path.join(ROOT, "public"), { recursive: true })
    .map((arquivo) => String(arquivo).split(path.sep).join("/"))
);

check("o arquivo de dados tem membros", members.length > 0);

const semFoto = members.filter((m) => {
  if (!m.image) return true;
  const file = decodeURIComponent(m.image.replace(/^\//, ""));
  return !publicFiles.has(file);
});
check(
  "todo membro tem foto existente em public/",
  semFoto.length === 0,
  semFoto.map((m) => m.name + " -> " + m.image).join(NL + "        ")
);

const semBarra = members.filter((m) => m.image && !m.image.startsWith("/"));
check(
  "todo caminho de foto comeca com barra",
  semBarra.length === 0,
  semBarra
    .map((m) => m.name + ' -> "' + m.image + '"  (deveria ser "/' + m.image + '")')
    .join(NL + "        ")
);

const ASSINATURAS = [
  { hex: "89504e47", formato: "png" },
  { hex: "ffd8ff", formato: "jpeg" },
  { hex: "52494646", formato: "webp" },
  { hex: "47494638", formato: "gif" },
];

function formatoReal(arquivo) {
  const buf = Buffer.alloc(8);
  const fd = fs.openSync(arquivo, "r");
  try {
    fs.readSync(fd, buf, 0, 8, 0);
  } finally {
    fs.closeSync(fd);
  }
  const hex = buf.toString("hex");
  const achado = ASSINATURAS.find((a) => hex.startsWith(a.hex));
  return achado ? achado.formato : null;
}

const extensaoErrada = [];
for (const m of members) {
  if (!m.image || !m.image.startsWith("/")) continue;
  const nome = decodeURIComponent(m.image.replace(/^\//, ""));
  if (!publicFiles.has(nome)) continue;
  const real = formatoReal(path.join(ROOT, "public", nome));
  if (!real) continue;
  const ext = path.extname(nome).toLowerCase().slice(1).replace("jpg", "jpeg");
  if (ext !== real) {
    extensaoErrada.push(m.name + " -> " + m.image + "  (o arquivo e " + real.toUpperCase() + ")");
  }
}
check(
  "a extensao de cada foto combina com o conteudo",
  extensaoErrada.length === 0,
  extensaoErrada.join(NL + "        ")
);

const areaPlaceholder = members.filter((m) => (m.area || "").trim() === "?");
check(
  "nenhuma area com marcador de preenchimento",
  areaPlaceholder.length === 0,
  areaPlaceholder.map((m) => m.name).join(", ")
);

const alunosSemProfissao = members.filter(
  (m) => m.lista === "MEMBERS" && m.category !== "lideranca" && !(m.area || "").trim()
);
check(
  "todo aluno tem a profissão dos sonhos preenchida",
  alunosSemProfissao.length === 0,
  alunosSemProfissao.map((m) => m.name).join(", ")
);
check(
  "nenhuma citacao de preenchimento",
  !source.includes("FRASE QUE LHE MARCA"),
  "ainda ha " + (source.match(/FRASE QUE LHE MARCA/g) || []).length + " ocorrencia(s)"
);

const ids = members.map((m) => m.id);

["MENTORS", "MEMBERS"].forEach((lista) => {
  const daLista = members.filter((m) => m.lista === lista).map((m) => m.id);
  const repetidos = daLista.filter((id, i) => daLista.indexOf(id) !== i);
  check("nenhum id duplicado dentro de " + lista, repetidos.length === 0, repetidos.join(", "));
});

const porNome = new Map();
members.forEach((m) => {
  const chave = m.name
    .replace(/^Prof\.?\s*/i, "")
    .trim()
    .toLowerCase();
  if (!porNome.has(chave)) porNome.set(chave, []);
  porNome.get(chave).push(m);
});
const idsDesencontrados = [];
porNome.forEach((registros, nome) => {
  const unicos = [...new Set(registros.map((r) => r.id))];
  if (registros.length > 1 && unicos.length > 1) {
    idsDesencontrados.push(nome + " -> " + unicos.join(" e "));
  }
});
check(
  "quem esta nas duas listas usa o mesmo id",
  idsDesencontrados.length === 0,
  idsDesencontrados.join(NL + "        ")
);

["membro-2", "dono-card", "mentor-1", "mentor-2", "mentor-3"].forEach((id) => {
  check("registro aposentado ausente: " + id, !ids.includes(id));
});

console.log(NL + "== Consistência de referências ==" + NL);

const membersPage = fs.readFileSync(path.join(ROOT, "src/paginas/membros/MembersPage.tsx"), "utf8");

const lideranca = members.filter((m) => m.category === "lideranca");
check(
  "existe pelo menos uma pessoa na lideranca",
  lideranca.length > 0,
  'nenhum registro com category: "lideranca"'
);

check(
  "a Liderança do Projeto mostra só Victor e Isaque",
  membersPage.includes('m.id === "victor" || m.id === "isaque"') &&
    ["victor", "isaque"].every((id) =>
      members.some((m) => m.lista === "MEMBERS" && m.id === id && m.category === "lideranca")
    ),
  "o filtro da liderança ou as fichas de Victor/Isaque mudaram"
);

lideranca.forEach((m) => {
  check(
    "lideranca com foto e cargo preenchidos: " + m.name,
    !!m.image && !!m.role,
    m.name + ' -> image: "' + m.image + '", role: "' + m.role + '"'
  );
});

const ctx = fs.readFileSync(path.join(ROOT, "src/compartilhado/contextos/DataContext.tsx"), "utf8");
check("o contexto migra dados salvos", ctx.includes("loadMembers"));

const migration = fs.readFileSync(
  path.join(ROOT, "src/compartilhado/utils/member-migration.ts"),
  "utf8"
);
["membro-2", "dono-card", "mentor-1", "mentor-2", "mentor-3"].forEach((id) => {
  check("a migracao remove o id aposentado: " + id, migration.includes('"' + id + '"'));
});
check("o contexto memoiza o value", ctx.includes("const value = useMemo("));
check(
  "nenhum localStorage.setItem dentro de updater de estado",
  !/setMembers\(\(prev\) => \{[\s\S]{0,400}?localStorage\.setItem/.test(ctx) &&
    !/setPartners\(\(prev\) => \{[\s\S]{0,400}?localStorage\.setItem/.test(ctx)
);

console.log(NL + "-- " + (checks - failures) + "/" + checks + " verificacoes passaram --" + NL);
process.exit(failures > 0 ? 1 : 0);
