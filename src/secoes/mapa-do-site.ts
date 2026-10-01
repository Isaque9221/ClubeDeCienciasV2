export interface SecaoDoMapa {
  id: string;
  rotulo: string;
  descricao: string;
  fixa?: boolean;
  so?: "windows" | "mobile";
}

export const SECOES_DO_MAPA: SecaoDoMapa[] = [
  {
    id: "hero",
    rotulo: "Abertura (Hero)",
    descricao: "O vídeo de fundo, o nome do clube e os botões principais.",
    fixa: true,
  },
  {
    id: "ticker1",
    rotulo: "Faixa rolante — primeira",
    descricao: "A tarja dourada que desliza logo abaixo da abertura.",
  },
  {
    id: "sobre",
    rotulo: "Sobre o Clube",
    descricao: "Quem somos, a história e o convite para a trajetória.",
  },
  {
    id: "estatisticas",
    rotulo: "Números do Clube",
    descricao: "Os contadores que animam ao entrar na tela.",
  },
  {
    id: "pilares",
    rotulo: "Pilares Científicos",
    descricao: "As frentes de trabalho do clube, em cartões.",
  },
  {
    id: "equipe",
    rotulo: "Quem Faz Acontecer",
    descricao: "A equipe e os cartões de liderança.",
  },
  {
    id: "pesquisadores",
    rotulo: "Jovens Pesquisadores",
    descricao: "A vitrine de membros que leva à página de Membros.",
  },
  {
    id: "pontes",
    rotulo: "Pontes que Construímos",
    descricao: "A rede de parcerias, por grupos.",
  },
  {
    id: "manifesto",
    rotulo: "Manifesto",
    descricao: "O texto-declaração do clube.",
  },
  {
    id: "ticker2",
    rotulo: "Faixa rolante — segunda",
    descricao: "A tarja dourada que desliza no sentido contrário.",
  },
  {
    id: "faq",
    rotulo: "Perguntas Frequentes",
    descricao: "As dúvidas mais comuns, em sanfona.",
  },
  {
    id: "cta",
    rotulo: "Junte-se ao Clube",
    descricao: "O chamado final, com os botões de inscrição.",
  },
  {
    id: "rodape",
    rotulo: "Rodapé & Instituições",
    descricao: "Os logos das parcerias, a navegação e os contatos.",
    fixa: true,
  },
];

export const ORDEM_PADRAO = SECOES_DO_MAPA.map((s) => s.id);

export interface ItemDoMapa {
  id: string;
  visivel: boolean;
}

export function lerMapa(gravado?: string): ItemDoMapa[] {
  const pedidos = (gravado ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const [id, marca] = p.split(":");
      return { id: id.trim(), visivel: marca?.trim() !== "oculta" };
    })
    .filter((p) => SECOES_DO_MAPA.some((s) => s.id === p.id));

  const vistos = new Set(pedidos.map((p) => p.id));

  const faltantes = SECOES_DO_MAPA.filter((s) => !vistos.has(s.id)).map((s) => ({
    id: s.id,
    visivel: true,
  }));

  const completo = [...pedidos, ...faltantes];

  const fixasNoInicio = completo.filter((i) => ehFixa(i.id) && i.id === "hero");
  const fixasNoFim = completo.filter((i) => ehFixa(i.id) && i.id === "rodape");
  const meio = completo.filter((i) => !ehFixa(i.id));

  return [
    ...fixasNoInicio.map((i) => ({ ...i, visivel: true })),
    ...meio,
    ...fixasNoFim.map((i) => ({ ...i, visivel: true })),
  ];
}

export function escreverMapa(itens: ItemDoMapa[]): string {
  return itens.map((i) => (i.visivel ? i.id : `${i.id}:oculta`)).join(",");
}

export function ehFixa(id: string): boolean {
  return SECOES_DO_MAPA.find((s) => s.id === id)?.fixa === true;
}

export function acharSecao(id: string): SecaoDoMapa | undefined {
  return SECOES_DO_MAPA.find((s) => s.id === id);
}
