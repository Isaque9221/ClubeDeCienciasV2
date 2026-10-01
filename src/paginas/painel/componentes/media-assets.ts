export interface MediaItem {
  name: string;
  path: string;
  category: "logos" | "membros" | "outros";
  label: string;
}

export const MEDIA_ASSETS: MediaItem[] = [
  {
    name: "Logo Inicio.png",
    path: "/emblemas/Logo Inicio.png",
    category: "logos",
    label: "Logo Principal do Clube",
  },
  {
    name: "Logo Caderno.png",
    path: "/emblemas/Logo Caderno.png",
    category: "logos",
    label: "Caderno Científico",
  },
  {
    name: "Logo Membros.png",
    path: "/emblemas/Logo Membros.png",
    category: "logos",
    label: "Emblema Membros & Pesquisa",
  },
  {
    name: "Logo Painel ADM.png",
    path: "/emblemas/Logo Painel ADM.png",
    category: "logos",
    label: "Insígnia Painel Administrativo",
  },
  {
    name: "Logo FECIBA.png",
    path: "/parceiros/Logo FECIBA.png",
    category: "logos",
    label: "Prêmio e Destaque FECIBA",
  },
  {
    name: "Logo CNPq.png",
    path: "/parceiros/Logo CNPq.png",
    category: "logos",
    label: "Conselho Nacional de Desenvolvimento (CNPq)",
  },
  {
    name: "Logo FAPESP.png",
    path: "/parceiros/Logo FAPESP.png",
    category: "logos",
    label: "Fundação FAPESP",
  },
  {
    name: "Logo LEFHBio.jpg",
    path: "/parceiros/Logo LEFHBio.jpg",
    category: "logos",
    label: "Laboratório LEFHBio",
  },
  {
    name: "Logo UEFS.png",
    path: "/parceiros/Logo UEFS.png",
    category: "logos",
    label: "Universidade Estadual de Feira de Santana",
  },
  {
    name: "Logo UFBA.png",
    path: "/parceiros/Logo UFBA.png",
    category: "logos",
    label: "Universidade Federal da Bahia",
  },

  {
    name: "capa.jpg",
    path: "/sons/plantasia/capa.jpg",
    category: "outros",
    label: "Plantasia & Bioma",
  },

  {
    name: "Victor.png",
    path: "/membros/Victor.png",
    category: "membros",
    label: "Prof. Victor Moreno",
  },
  {
    name: "Josue.jpeg",
    path: "/membros/Josue.jpeg",
    category: "membros",
    label: "Prof. Josué Pimentel (Mentor)",
  },
  {
    name: "Claudia.jpeg",
    path: "/membros/Claudia.jpeg",
    category: "membros",
    label: "Profª. Ana Cláudia Cedraz (Mentora)",
  },
  {
    name: "Isaque.jpg",
    path: "/membros/Isaque.jpg",
    category: "membros",
    label: "Isaque (Liderança / Pesquisador)",
  },
  {
    name: "Victor.png",
    path: "/membros/lideranca/Victor.png",
    category: "membros",
    label: "Prof. Victor Moreno (Enquadrada 4:3)",
  },
  {
    name: "isaque.webp",
    path: "/membros/lideranca/isaque.webp",
    category: "membros",
    label: "Isaque (Enquadrada 4:3)",
  },
  { name: "Alicia.jpeg", path: "/membros/Alicia.jpeg", category: "membros", label: "Alicia" },
  {
    name: "Ana Beatriz.png",
    path: "/membros/Ana Beatriz.png",
    category: "membros",
    label: "Ana Beatriz",
  },
  {
    name: "Ana Caroline.jpeg",
    path: "/membros/Ana Caroline.jpeg",
    category: "membros",
    label: "Ana Caroline",
  },
  {
    name: "Ana Raquel.png",
    path: "/membros/Ana Raquel.png",
    category: "membros",
    label: "Ana Raquel",
  },
  { name: "Beatriz.jpeg", path: "/membros/Beatriz.jpeg", category: "membros", label: "Beatriz" },
  { name: "Edmar.png", path: "/membros/Edmar.png", category: "membros", label: "Edmar" },
  { name: "Eduarda.jpeg", path: "/membros/Eduarda.jpeg", category: "membros", label: "Eduarda" },
  { name: "Fabio.jpg", path: "/membros/Fabio.jpg", category: "membros", label: "Fabio" },
  { name: "Gabriel.jpeg", path: "/membros/Gabriel.jpeg", category: "membros", label: "Gabriel" },
  { name: "Izabella.jpeg", path: "/membros/Izabella.jpeg", category: "membros", label: "Izabella" },
  { name: "João.jpeg", path: "/membros/João.jpeg", category: "membros", label: "João" },
  { name: "Kevilly.jpeg", path: "/membros/Kevilly.jpeg", category: "membros", label: "Kevilly" },
  {
    name: "Laura Miranda.jpeg",
    path: "/membros/Laura Miranda.jpeg",
    category: "membros",
    label: "Laura Miranda",
  },
  { name: "Laura.jpeg", path: "/membros/Laura.jpeg", category: "membros", label: "Laura" },
  { name: "Lavine.png", path: "/membros/Lavine.png", category: "membros", label: "Lavine" },
  { name: "Lorena.jpeg", path: "/membros/Lorena.jpeg", category: "membros", label: "Lorena" },
  { name: "Lucas.jpeg", path: "/membros/Lucas.jpeg", category: "membros", label: "Lucas" },
  { name: "Matheus.jpeg", path: "/membros/Matheus.jpeg", category: "membros", label: "Matheus" },
  { name: "Melissa.png", path: "/membros/Melissa.png", category: "membros", label: "Melissa" },
  { name: "Miguel.png", path: "/membros/Miguel.png", category: "membros", label: "Miguel" },
  { name: "Raquelly.jpeg", path: "/membros/Raquelly.jpeg", category: "membros", label: "Raquelly" },
  { name: "Rayla.png", path: "/membros/Rayla.png", category: "membros", label: "Rayla" },
  { name: "Robson.jpeg", path: "/membros/Robson.jpeg", category: "membros", label: "Robson" },
  { name: "Sthefane.jpeg", path: "/membros/Sthefane.jpeg", category: "membros", label: "Sthefane" },
  { name: "Tarcisio.jpeg", path: "/membros/Tarcisio.jpeg", category: "membros", label: "Tarcisio" },
  { name: "Thiago.jpeg", path: "/membros/Thiago.jpeg", category: "membros", label: "Thiago" },
];
