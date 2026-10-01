import { atualizarCaminho, migrarCaminhos } from "../src/compartilhado/utils/caminhos-publicos";
import {
  migrateMembers,
  normalizarCaminhoDaFoto,
} from "../src/compartilhado/utils/member-migration";
import { MENTORS } from "../src/compartilhado/dados/members.data";
import type { Member } from "../src/compartilhado/tipos/member.types";

let failures = 0;

function check(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log("  PASS  " + label);
  } else {
    failures++;
    console.log("  FALHA " + label + (detail ? " -> " + detail : ""));
  }
}

const m = (over: Partial<Member>): Member => ({
  id: "x",
  name: "Fulano",
  role: "Jovem Cientista",
  area: "Terra & Exatas",
  image: "/Thiago.jpeg",
  iconName: "Atom",
  color: "#FDE68A",
  quote: "",
  tag: "Membro · 2026",
  category: "terra_exatas",
  ...over,
});

const salvo: Member[] = [
  m({
    id: "membro-2",
    name: "Kevilly Martins de Oliveira",
    area: "?",
    quote: "FRASE QUE LHE MARCA/DEFINE.",
    category: "biotec_quimica",
  }),
  m({ id: "dono-card", name: "Isaque Santos Bomfim", category: "tecnologia_robotica" }),
  m({ id: "membro-7", name: "João Pedro", area: "?", quote: "FRASE QUE LHE MARCA/DEFINE." }),
  m({ id: "membro-13", name: "Gabriel Neri", area: "Editado no admin", quote: "Minha frase real" }),
  m({ id: "membro-13b", name: "Quem tinha o rótulo antigo", area: "Terra & Exatas" }),
];

const seed: Member[] = [
  m({ id: "membro-13", name: "Gabriel Neri Almeida", area: "Terra & Exatas" }),
  m({ id: "membro-99", name: "Aluno Novo", category: "astronomia_fisica" }),
];

const out = migrateMembers(salvo, seed);
const byId = (id: string) => out.find((x) => x.id === id);

console.log("\n== Migração do elenco salvo no navegador ==\n");

check("registro com foto inexistente é removido", !byId("membro-2"));
check("registro duplicado é removido", !byId("dono-card"));
check(
  "area de preenchimento vira o rótulo da categoria",
  byId("membro-7")?.area === "Terra & Exatas",
  byId("membro-7")?.area
);
check(
  "rótulo da categoria salvo no navegador é mantido",
  byId("membro-13b")?.area === "Terra & Exatas",
  byId("membro-13b")?.area
);
check("citação de preenchimento é limpa", byId("membro-7")?.quote === "");
check(
  "edição do admin é preservada (area)",
  byId("membro-13")?.area === "Editado no admin",
  byId("membro-13")?.area
);
check("edição do admin é preservada (citação)", byId("membro-13")?.quote === "Minha frase real");
check("integrante novo do código é acrescentado", !!byId("membro-99"));
check("quem já existia não é duplicado", out.filter((x) => x.id === "membro-13").length === 1);
check("nenhum id aposentado sobrevive", !out.some((x) => ["membro-2", "dono-card"].includes(x.id)));

console.log("\n== Fotos dos mentores ==\n");

const fotoDoCodigo = (id: string): string => MENTORS.find((x) => x.id === id)?.image ?? "";

function corrigirFoto(id: string, fotoSalva: string): string | undefined {
  const salvoNoNavegador = MENTORS.map((x) => (x.id === id ? { ...x, image: fotoSalva } : x));
  return migrateMembers(salvoNoNavegador, MENTORS).find((x) => x.id === id)?.image;
}

const VALORES_ANTIGOS: Array<[string, string]> = [
  ["ana-claudia", "Ana Claudia Cedraz.jpeg"],
  ["ana-claudia", "/Ana Claudia Cedraz.jpeg"],
  ["ana-claudia", ""],
  ["josue", "/Zu.png"],
  ["josue", "/josue pimentel.jpg"],
  ["josue", ""],
];

for (const [id, antigo] of VALORES_ANTIGOS) {
  const nome = MENTORS.find((x) => x.id === id)?.name ?? id;
  const resultado = corrigirFoto(id, antigo);
  check(
    "foto antiga de " + nome + ' volta para a do código ("' + (antigo || "vazio") + '")',
    resultado === fotoDoCodigo(id),
    'virou "' + resultado + '", esperava "' + fotoDoCodigo(id) + '"'
  );
}

for (const mentor of MENTORS) {
  const recuperada = corrigirFoto(mentor.id, "");
  check(
    "a correção de " + mentor.name + " aponta para uma foto de verdade",
    !!recuperada && recuperada.startsWith("/"),
    recuperada
  );
}

check("caminho sem barra ganha a barra", normalizarCaminhoDaFoto("Victor.png") === "/Victor.png");
check(
  "caminho com espaço sobrando é limpo",
  normalizarCaminhoDaFoto("  /Victor.png  ") === "/Victor.png"
);
check(
  "endereço completo passa intacto",
  normalizarCaminhoDaFoto("https://exemplo.com/a.png") === "https://exemplo.com/a.png"
);

check(
  "caminho antigo de foto salvo no navegador vai para a pasta nova",
  atualizarCaminho("/Laura.jpeg") === "/membros/Laura.jpeg"
);
check(
  "caminho antigo codificado continua codificado",
  atualizarCaminho("/Ana%20Raquel.png") === "/membros/Ana%20Raquel.png"
);
check(
  "pasta antiga de logos vira a pasta de parceiros",
  atualizarCaminho("/logos/cnpq.png") === "/parceiros/cnpq.png"
);
check("caminho novo não muda", atualizarCaminho("/membros/Josue.jpeg") === "/membros/Josue.jpeg");
check(
  "endereço externo não muda",
  atualizarCaminho("https://x.com/a.png") === "https://x.com/a.png"
);
check(
  "dados salvos inteiros são migrados",
  migrarCaminhos({ fotos: ["/Zu.png"], logo: "/Logo FECIBA.png" }).logo ===
    "/parceiros/Logo FECIBA.png"
);

const TOTAL = 10 + VALORES_ANTIGOS.length + MENTORS.length + 3 + 6;
console.log("\n-- " + (TOTAL - failures) + "/" + TOTAL + " verificações passaram --\n");
process.exit(failures > 0 ? 1 : 0);
