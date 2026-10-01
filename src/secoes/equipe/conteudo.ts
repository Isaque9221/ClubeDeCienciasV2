import { Microscope, Code2, FlaskConical, Terminal } from "lucide-react";
import type { SiteConfig } from "@/compartilhado/contextos/data-context";
import { texto } from "@/secoes/_nucleo";

export const EQUIPE = {
  etiqueta: "LIDERANÇA & FUNDADORES",

  titulo: "Quem faz a ciência acontecer",

  palavrasEmDestaque: ["ciência"],

  subtitulo:
    "As mentes que orientam, constroem e transformam a educação científica no Semiárido baiano com método, paixão e inovação contínua.",

  rotulos: {
    situacao: "ATIVO",
    abaPerfil: "Perfil & Visão",
    abaTrajetoria: "Marcos (4 Etapas)",
    rodapeEsquerda: "Membro Verificado CECLOS",
    rodapeDireita: "● Liderança Ativa",
  },

  lideres: [
    {
      id: "orientador-1",
      emDestaque: false,
      nome: "Prof. Victor Montalvão Moreno",
      cargo: "Orientador Principal",
      superEtiqueta: "Docência & Orientação · CECLOS",
      area: "Biologia · Metodologia Científica · Química",
      bio: "Lidera a formação científica e metodológica dos estudantes, conduzindo investigações práticas em biologia e química e orientando projetos de iniciação científica no Semiárido.",
      foto: "/membros/lideranca/Victor.png",
      citacao: "A ciência começa com a pergunta certa.",
      cor: "#FACC15",
      iconeDaArea: Microscope,
      categoria: {
        rotulo: "Coordenação & Pesquisa",
        icone: FlaskConical,
      },
      etiquetas: [
        "Biologia Experimental",
        "Metodologia Científica",
        "Química Aplicada",
        "Iniciação Científica Júnior",
        "Pesquisa no Semiárido",
      ],
      destaques: [] as { rotulo: string; valor: string }[],
      trajetoria: [] as { fase: string; titulo: string; descricao: string }[],
    },
    {
      id: "criador-1",
      emDestaque: true,
      nome: "Isaque Santos Bomfim",
      cargo: "Fundador & Desenvolvedor",
      superEtiqueta: "Engenharia de Software · Criador",
      area: "Engenharia de Software · Desenvolvimento Web · Inovação Digital",
      bio: "Idealizou e desenvolveu toda a plataforma e ecossistema digital do CECLOS, integrando design moderno, arquitetura de software e tecnologia para o avanço da iniciação científica.",
      foto: "/membros/lideranca/isaque.webp",
      citacao: "Código é a linguagem da transformação.",
      cor: "#FEF08A",
      iconeDaArea: Code2,
      categoria: {
        rotulo: "Engenharia & Inovação",
        icone: Terminal,
      },
      etiquetas: [
        "Engenharia de Software",
        "Desenvolvimento Full-Stack",
        "UI/UX Design Interativo",
        "React & TypeScript",
        "Cultura Maker & Inovação",
      ],
      destaques: [] as { rotulo: string; valor: string }[],
      trajetoria: [] as { fase: string; titulo: string; descricao: string }[],
    },
  ],
};

const CAMPOS_DO_PAINEL = [
  {
    nome: "leader1Name",
    cargo: "leader1Role",
    superEtiqueta: "leader1SuperTag",
    area: "leader1Area",
    bio: "leader1Bio",
    foto: "leader1Image",
    citacao: "leader1Quote",
    etiquetas: "leader1Tags",
    destaques: [
      { rotulo: "leader1Stat1Label", valor: "leader1Stat1Value" },
      { rotulo: "leader1Stat2Label", valor: "leader1Stat2Value" },
      { rotulo: "leader1Stat3Label", valor: "leader1Stat3Value" },
    ],
  },
  {
    nome: "leader2Name",
    cargo: "leader2Role",
    superEtiqueta: "leader2SuperTag",
    area: "leader2Area",
    bio: "leader2Bio",
    foto: "leader2Image",
    citacao: "leader2Quote",
    etiquetas: "leader2Tags",
    destaques: [
      { rotulo: "leader2Stat1Label", valor: "leader2Stat1Value" },
      { rotulo: "leader2Stat2Label", valor: "leader2Stat2Value" },
      { rotulo: "leader2Stat3Label", valor: "leader2Stat3Value" },
    ],
  },
] as const;

function lerTexto(siteConfig: SiteConfig, chave: keyof SiteConfig, padrao: string) {
  return texto(siteConfig[chave] as string | undefined, padrao);
}

const FOTOS_REENQUADRADAS: Record<string, string> = {
  "/membros/Victor.png": "/membros/lideranca/Victor.png",
  "/membros/lideranca/victor.webp": "/membros/lideranca/Victor.png",
  "/membros/Isaque.jpg": "/membros/lideranca/isaque.webp",
};

export function fotoReenquadrada(foto: string): string {
  return FOTOS_REENQUADRADAS[foto.trim()] || foto;
}

export function montarEquipe(siteConfig: SiteConfig) {
  return EQUIPE.lideres.map((lider, i) => {
    const campos = CAMPOS_DO_PAINEL[i];
    if (!campos) return lider;

    const etiquetasDoPainel = siteConfig[campos.etiquetas];
    const etiquetas =
      typeof etiquetasDoPainel === "string" && etiquetasDoPainel.trim()
        ? etiquetasDoPainel
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : lider.etiquetas;

    return {
      ...lider,
      nome: lerTexto(siteConfig, campos.nome, lider.nome),
      cargo: lerTexto(siteConfig, campos.cargo, lider.cargo),
      superEtiqueta: lerTexto(siteConfig, campos.superEtiqueta, lider.superEtiqueta),
      area: lerTexto(siteConfig, campos.area, lider.area),
      bio: lerTexto(siteConfig, campos.bio, lider.bio),
      foto: fotoReenquadrada(lerTexto(siteConfig, campos.foto, lider.foto)),
      citacao: lerTexto(siteConfig, campos.citacao, lider.citacao),
      etiquetas,
      destaques: lider.destaques.map((destaque, d) => {
        const campo = campos.destaques[d];
        if (!campo) return destaque;
        return {
          rotulo: lerTexto(siteConfig, campo.rotulo, destaque.rotulo),
          valor: lerTexto(siteConfig, campo.valor, destaque.valor),
        };
      }),
    };
  });
}

export type Lider = ReturnType<typeof montarEquipe>[number];

export function montarTextosDaEquipe(siteConfig: SiteConfig) {
  return {
    etiqueta: texto(siteConfig.teamBadge, EQUIPE.etiqueta),
    titulo: texto(siteConfig.teamTitle, EQUIPE.titulo),
    subtitulo: texto(siteConfig.teamSubtitle, EQUIPE.subtitulo),
    palavrasEmDestaque: EQUIPE.palavrasEmDestaque,
    rotulos: EQUIPE.rotulos,
  };
}
