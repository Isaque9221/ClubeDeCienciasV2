const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const PASTAS = [
  "src/secoes",
  "src/paginas",
  "src/compartilhado",
  "src/recursos",
  "src/plataformas/windows",
];
const DESTINO = path.join(RAIZ, "src/app/tema-claro-tintas.css");
const OPACIDADE_MAXIMA = 0.3;
const CORES = { yellow: "244 180 0", amber: "245 158 11" };
const PROPRIEDADE = {
  bg: "background-color",
  from: "--tw-gradient-from",
  via: "--tw-gradient-via",
  to: "--tw-gradient-to",
};
const PADRAO =
  /(?<![\w-])((?:hover|group-hover):)?(bg|from|via|to)-(yellow|amber)-([345]00)\/(\[0?\.\d+\]|\d+)(?![\w\]/.-])/g;

function arquivos(pasta) {
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) return arquivos(caminho);
    return item.name.endsWith(".tsx") ? [caminho] : [];
  });
}

function escapar(classe) {
  return classe.replace(/[:/[\].]/g, (c) => `\\${c}`);
}

function opacidade(texto) {
  return texto.startsWith("[") ? Number(texto.slice(1, -1)) : Number(texto) / 100;
}

const encontradas = new Map();
for (const pasta of PASTAS) {
  for (const arquivo of arquivos(path.join(RAIZ, pasta))) {
    const conteudo = fs.readFileSync(arquivo, "utf8");
    for (const m of conteudo.matchAll(PADRAO)) {
      const [classe, variante = "", tipo, cor, , alfa] = m;
      const valor = opacidade(alfa);
      if (!(valor > 0) || valor > OPACIDADE_MAXIMA) continue;
      encontradas.set(classe, { variante, tipo, cor, valor });
    }
  }
}

function seletor(classe, variante) {
  const base = `.${escapar(classe)}`;
  if (variante === "hover:") return `${base}:hover`;
  if (variante === "group-hover:") return `:where(.group):hover ${base}`;
  return base;
}

const grupos = new Map();
for (const [classe, { variante, tipo, cor, valor }] of [...encontradas].sort()) {
  const declaracao = `${PROPRIEDADE[tipo]}: rgb(${CORES[cor]} / ${+valor.toFixed(3)});`;
  const lista = grupos.get(declaracao) ?? [];
  lista.push(seletor(classe, variante));
  grupos.set(declaracao, lista);
}

const blocos = [...grupos].map(
  ([declaracao, seletores]) =>
    `  :root[data-esquema="claro"]\n    :is(${seletores.join(", ")}):not([data-tema="escuro"] *) {\n    ${declaracao}\n  }`
);

fs.writeFileSync(DESTINO, `@media all {\n${blocos.join("\n\n")}\n}\n`);
console.log(
  `${encontradas.size} classes em ${grupos.size} regras -> ${path.relative(RAIZ, DESTINO)}`
);
