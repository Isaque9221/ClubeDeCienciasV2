import { migrateMembers } from "../src/compartilhado/utils/member-migration";
import type { Member } from "../src/compartilhado/tipos/member.types";

let falhas = 0;

function check(rotulo: string, condicao: boolean, detalhe?: string): void {
  if (condicao) {
    console.log("  PASS  " + rotulo);
  } else {
    falhas++;
    console.log("  FALHA " + rotulo + (detalhe ? " -> " + detalhe : ""));
  }
}

const m = (over: Partial<Member>): Member =>
  ({
    id: "x",
    name: "Fulano",
    role: "Jovem Cientista",
    area: "Biologia",
    image: "/x.png",
    iconName: "Atom",
    color: "#FACC15",
    quote: "",
    tag: "",
    category: "clubista",
    num: "01",
    ...over,
  }) as Member;

const origem = [
  m({ id: "a", name: "Ana" }),
  m({ id: "b", name: "Bruno" }),
  m({ id: "c", name: "Carla" }),
];

console.log("\n== O que o Painel apaga não volta ==\n");

const salvo = origem.filter((x) => x.id !== "b");

const semLapide = migrateMembers(salvo, origem);
check(
  "sem a lista de apagados, o registro voltaria (o bug antigo)",
  semLapide.some((x) => x.id === "b"),
  "este teste documenta o comportamento antigo"
);

const comLapide = migrateMembers(salvo, origem, new Set(["b"]));
check("com a lista de apagados, o registro NÃO volta", !comLapide.some((x) => x.id === "b"));
check("os outros continuam lá", comLapide.length === 2);

console.log("\n== O que o Painel edita não é sobrescrito ==\n");

const editado = [
  m({ id: "a", name: "Ana Maria (editado no painel)" }),
  m({ id: "b", name: "Bruno" }),
  m({ id: "c", name: "Carla" }),
];
const depois = migrateMembers(editado, origem, new Set());
const ana = depois.find((x) => x.id === "a");
check(
  "o nome editado no Painel vence o nome do código",
  ana?.name === "Ana Maria (editado no painel)",
  ana?.name
);

console.log("\n== Quem é novo no código aparece ==\n");

const comNovo = [...origem, m({ id: "d", name: "Davi" })];
const resultado = migrateMembers(salvo, comNovo, new Set(["b"]));
check(
  "integrante novo do código é acrescentado",
  resultado.some((x) => x.id === "d")
);
check("e o apagado continua apagado", !resultado.some((x) => x.id === "b"));

console.log("\n== Apagar e cadastrar de novo ==\n");

const readicionado = [...salvo, m({ id: "b", name: "Bruno (voltou)" })];
const aposVoltar = migrateMembers(readicionado, origem, new Set(["b"]));
check(
  "se o admin cadastra de novo, o registro aparece mesmo estando na lista",
  aposVoltar.some((x) => x.id === "b" && x.name === "Bruno (voltou)")
);

const total = 7;
console.log("\n-- " + (total - falhas) + "/" + total + " verificações passaram --\n");

if (falhas > 0) process.exit(1);
