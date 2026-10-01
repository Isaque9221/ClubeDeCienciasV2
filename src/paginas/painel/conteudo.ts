import {
  Sparkles,
  Users,
  BookOpen,
  Building2,
  Settings,
  LayoutTemplate,
  ChartColumn,
} from "lucide-react";

export const ADMIN = {
  menu: [
    {
      id: "mapa" as const,
      rotulo: "Mapa do Site",
      descricao: "Em desenvolvimento · indisponível",
      grupo: "gestao" as const,
      icone: LayoutTemplate,
      emDesenvolvimento: true,
    },
    {
      id: "site_editor" as const,
      rotulo: "Editor do Site & CMS",
      descricao: "Textos, fontes, mídias e rodapé",
      grupo: "gestao" as const,
      icone: Sparkles,
    },
    {
      id: "members" as const,
      rotulo: "Membros & Equipe",
      descricao: "pesquisadores e orientadores",
      grupo: "gestao" as const,
      icone: Users,
    },
    {
      id: "projects" as const,
      rotulo: "Cadernos de Pesquisa",
      descricao: "Projetos e relatórios em PDF",
      grupo: "gestao" as const,
      icone: BookOpen,
    },
    {
      id: "partners" as const,
      rotulo: "Parcerias Institucionais",
      descricao: "CNPq, FAPESP, UFBA, LEFHbio",
      grupo: "gestao" as const,
      icone: Building2,
    },
    {
      id: "estatisticas" as const,
      rotulo: "Estatísticas de Acesso",
      descricao: "Visitas, cidades e aparelhos",
      grupo: "sistema" as const,
      icone: ChartColumn,
    },
    {
      id: "settings" as const,
      rotulo: "Configurações & Backup",
      descricao: "Backup JSON e chave mestra",
      grupo: "sistema" as const,
      icone: Settings,
    },
  ],

  bloqueado: {
    titulo: "Não disponível",
    subtitulo: "Está em desenvolvimento.",
    aviso: "Em desenvolvimento. Para liberar: Configurações & Backup › Áreas em desenvolvimento.",
    liberar: "Marcar como pronto",
    detalhe:
      "Esta área do painel está sendo construída. Quando ficar pronta, ela abre por aqui mesmo.",
    etiqueta: "Em obras",
  },

  mapaLiberado: {
    descricao: "Ordem e posição das seções",
  },

  entrada: {
    etiqueta: "Área restrita · CECLOS",
    titulo: "Painel",
    tituloEmDestaque: "Administrativo",
    subtitulo: "Insira o Token Mestre de 10 dígitos para gerenciar o CECLOS.",
    ocultarDigitos: "Ocultar dígitos",
    exibirDigitos: "Exibir dígitos",
    validando: "Validando Chave...",
    entrar: "Entrar no Painel",
    voltar: "Voltar ao site público",
    preenchidos: "{n} de 10 dígitos",
    erro: "Token mestre incorreto.",
    travado: "Muitas tentativas incorretas.",
    travadoAguarde: "Aguarde {s}s para tentar novamente.",
    rodape: "A sessão se fecha sozinha ao sair do painel.",
  },

  barraSuperior: {
    bloquear: "Bloquear Painel",
    verSite: "Ver Site",
  },

  painel: {
    marca: "PAINEL CECLOS",
    estado: "SISTEMA ATIVO",
    grupos: {
      gestao: "Gestão do clube",
      sistema: "Sistema & dados",
    },
    recolher: "Recolher o menu",
    expandir: "Expandir o menu",
    atalho: "Ctrl + Shift + A abre e fecha o painel",
    usuario: {
      iniciais: "VM",
      nome: "Prof. Victor Moreno",
      cargo: "Coordenação & Pesquisa",
    },
    atalhos: {
      campos: "Campos editáveis",
      membros: "Membros & pesquisa",
      projetos: "Projetos ativos",
      parcerias: "Parcerias & apoio",
      abrir: "Abrir",
    },
    erroDeSalvamento: "As alterações não foram guardadas",
  },
};
