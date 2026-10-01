const ARQUIVOS_MOVIDOS: Record<string, string> = {
  "/Alicia.jpeg": "/membros/Alicia.jpeg",
  "/Ana Beatriz.jpeg": "/membros/Ana Beatriz.jpeg",
  "/Ana Beatriz.png": "/membros/Ana Beatriz.png",
  "/Ana Caroline.jpeg": "/membros/Ana Caroline.jpeg",
  "/Ana Claudia Cedraz.png": "/membros/Claudia.jpeg",
  "/membros/Ana Claudia Cedraz.png": "/membros/Claudia.jpeg",
  "/Ana Raquel.png": "/membros/Ana Raquel.png",
  "/ANDRE.jpeg": "/membros/ANDRE.jpeg",
  "/Beatriz.jpeg": "/membros/Beatriz.jpeg",
  "/BEATRIZ02.jpeg": "/membros/BEATRIZ02.jpeg",
  "/Bianca.jpg": "/membros/Bianca.jpg",
  "/Edmar.png": "/membros/Edmar.png",
  "/Eduarda.jpeg": "/membros/Eduarda.jpeg",
  "/Fabio.jpg": "/membros/Fabio.jpg",
  "/Gabriel.jpeg": "/membros/Gabriel.jpeg",
  "/Isaque.jpg": "/membros/Isaque.jpg",
  "/Izabella.jpeg": "/membros/Izabella.jpeg",
  "/Josue Pimentel.jpg": "/membros/Josue.jpeg",
  "/membros/Josue Pimentel.jpg": "/membros/Josue.jpeg",
  "/João.jpeg": "/membros/João.jpeg",
  "/Kevilly.jpeg": "/membros/Kevilly.jpeg",
  "/Laura Miranda.jpeg": "/membros/Laura Miranda.jpeg",
  "/Laura.jpeg": "/membros/Laura.jpeg",
  "/Lavine.png": "/membros/Lavine.png",
  "/Logo Caderno.png": "/emblemas/Logo Caderno.png",
  "/Logo CNPq.png": "/parceiros/Logo CNPq.png",
  "/Logo FAPESP.png": "/parceiros/Logo FAPESP.png",
  "/Logo FECIBA.png": "/parceiros/Logo FECIBA.png",
  "/Logo Inicio.png": "/emblemas/Logo Inicio.png",
  "/Logo LEFHBio.jpg": "/parceiros/Logo LEFHBio.jpg",
  "/Logo Membros.png": "/emblemas/Logo Membros.png",
  "/Logo Painel ADM.png": "/emblemas/Logo Painel ADM.png",
  "/Logo UEFS.png": "/parceiros/Logo UEFS.png",
  "/Logo UFBA.png": "/parceiros/Logo UFBA.png",
  "/Lorena.jpeg": "/membros/Lorena.jpeg",
  "/Lucas.jpeg": "/membros/Lucas.jpeg",
  "/RAQUEL.png": "/membros/RAQUEL.png",
  "/RAQUEL02.jpeg": "/membros/RAQUEL02.jpeg",
  "/Matheus.jpeg": "/membros/Matheus.jpeg",
  "/Melissa.png": "/membros/Melissa.png",
  "/Miguel.png": "/membros/Miguel.png",
  "/Plantasia.jpg": "/sons/plantasia/capa.jpg",
  "/Raquelly.jpeg": "/membros/Raquelly.jpeg",
  "/Rayla.png": "/membros/Rayla.png",
  "/Robson.jpeg": "/membros/Robson.jpeg",
  "/Sthefane.jpeg": "/membros/Sthefane.jpeg",
  "/Tarcisio.jpeg": "/membros/Tarcisio.jpeg",
  "/Thiago.jpeg": "/membros/Thiago.jpeg",
  "/Victor.jpeg": "/membros/Victor.png",
  "/membros/Victor.jpeg": "/membros/Victor.png",
  "/membros/lideranca/victor.webp": "/membros/lideranca/Victor.png",
  "/Victor.png": "/membros/Victor.png",
  "/Zu.jpg": "/membros/Josue.jpeg",
  "/membros/Zu.jpg": "/membros/Josue.jpeg",
  "/Fabio.jpeg": "/membros/Fabio.jpg",
  "/Zu.png": "/membros/Josue.jpeg",
  "/CNPQ.png": "/parceiros/cnpq.png",
  "/FAPESP.png": "/parceiros/fapesp.png",
  "/UFBA.png": "/parceiros/ufba.png",
  "/UEFS.png": "/parceiros/uefs.png",
  "/LEFHBio.jpg": "/parceiros/lefhbio.png",
  "/FECIBA.png": "/parceiros/feciba.png",
  "/cnpq.png": "/parceiros/cnpq.png",
  "/fapesp.png": "/parceiros/fapesp.png",
  "/ufba.png": "/parceiros/ufba.png",
  "/uefs.png": "/parceiros/uefs.png",
  "/lefhbio.png": "/parceiros/lefhbio.png",
  "/feciba.png": "/parceiros/feciba.png",
};

const PASTAS_MOVIDAS: [string, string][] = [
  ["/sounds/clicks/", "/sons/cliques/"],
  ["/plantasia/", "/sons/plantasia/"],
  ["/logos/", "/parceiros/"],
  ["/equipe/", "/membros/lideranca/"],
];

export function atualizarCaminho(caminho: string): string {
  if (!caminho.startsWith("/")) return caminho;
  let legivel = caminho;
  try {
    legivel = decodeURI(caminho);
  } catch {
    return caminho;
  }
  const novo = ARQUIVOS_MOVIDOS[legivel];
  if (novo) return legivel === caminho ? novo : encodeURI(novo);
  for (const [antiga, nova] of PASTAS_MOVIDAS) {
    if (caminho.startsWith(antiga)) return nova + caminho.slice(antiga.length);
  }
  return caminho;
}

export function migrarCaminhos<T>(valor: T): T {
  if (typeof valor === "string") return atualizarCaminho(valor) as T;
  if (Array.isArray(valor)) return valor.map((item) => migrarCaminhos(item)) as T;
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor).map(([chave, item]) => [chave, migrarCaminhos(item)])
    ) as T;
  }
  return valor;
}
