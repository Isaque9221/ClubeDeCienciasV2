import { useMemo } from "react";
import { useData } from "@/compartilhado/hooks/useData";
import { useSound } from "@/compartilhado/hooks/useSound";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";
import { montarExplorar } from "@/secoes/hero/conteudo";
import type { Comando } from "./PaletaDeComandos";
import {
  EVENTO_ABRIR_PLAYER,
  alternarTelaCheia,
  compartilharSite,
  copiarLink,
  teclaDeComando,
} from "./acoes";

export type PaginaDoSite = "home" | "members" | "projects" | "trajetoria";

const PAGINA_DO_EXPLORAR: Record<string, PaginaDoSite> = {
  trajetoria: "trajetoria",
  membros: "members",
  projetos: "projects",
};

export function useComandosDoSite({
  paginaAtual,
  irPara,
}: {
  paginaAtual: string;
  irPara: (pagina: PaginaDoSite) => void;
}): Comando[] {
  const { siteConfig } = useData();
  const som = useSound();
  const { abrirJanela, avisar, preferencias } = usePreferencias();

  return useMemo(() => {
    const rolarAte = (id: string) => {
      const rolar = () =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (paginaAtual !== "home") {
        irPara("home");
        window.setTimeout(rolar, 900);
      } else {
        rolar();
      }
    };

    const explorar = montarExplorar(siteConfig);
    const navegar: Comando[] = [
      {
        id: "inicio",
        grupo: "Navegar",
        rotulo: "Início",
        descricao: "Voltar para a página inicial",
        palavras: "home topo começo",
        executar: () => (paginaAtual === "home" ? window.scrollTo({ top: 0 }) : irPara("home")),
      },
      ...explorar.itens.map((item) => ({
        id: `explorar-${item.rolarPara ?? item.abrirPagina}`,
        grupo: "Navegar",
        rotulo: item.rotulo,
        descricao: item.descricao,
        executar: () => {
          if (item.abrirPagina) irPara(PAGINA_DO_EXPLORAR[item.abrirPagina]);
          else if (item.rolarPara) rolarAte(item.rolarPara);
        },
      })),
      {
        id: "junte-se",
        grupo: "Navegar",
        rotulo: "Junte-se ao clube",
        descricao: "Como participar",
        palavras: "participar inscrição whatsapp",
        executar: () => rolarAte("junte-se"),
      },
    ];

    const faixas = som.activePlaylist.tracks;
    const atual = faixas.findIndex((t) => t.id === som.selectedTrack.id);

    return [
      ...navegar,
      {
        id: "musica",
        grupo: "Música e som",
        rotulo: som.isBgMusicPlaying ? "Pausar a música" : "Tocar a música",
        descricao: som.activePlaylist.title,
        atalho: preferencias.atalhosDeUmaTecla ? ["M"] : undefined,
        palavras: "trilha plantasia play pause",
        executar: som.toggleBgMusicPlay,
      },
      {
        id: "proxima-faixa",
        grupo: "Música e som",
        rotulo: "Próxima faixa",
        palavras: "pular avançar música",
        executar: () => {
          const proxima = faixas[(atual + 1) % faixas.length];
          if (proxima) som.selectTrack(proxima, som.activePlaylist.id, true);
        },
      },
      {
        id: "abrir-player",
        grupo: "Música e som",
        rotulo: "Abrir o player de áudio",
        descricao: "Escolher faixa, volume e sons dos botões",
        executar: () => window.dispatchEvent(new Event(EVENTO_ABRIR_PLAYER)),
      },
      {
        id: "sons",
        grupo: "Música e som",
        rotulo: som.soundEnabled ? "Desligar sons dos botões" : "Ligar sons dos botões",
        palavras: "cliques efeitos mudo silenciar",
        executar: () => {
          som.setSoundEnabled(!som.soundEnabled);
          avisar(som.soundEnabled ? "Sons dos botões desligados" : "Sons dos botões ligados");
        },
      },
      {
        id: "ajustes",
        grupo: "Visualização",
        rotulo: "Ajustes",
        descricao: "Tamanho do texto, fonte, contraste e movimento",
        atalho: [teclaDeComando(), ","],
        palavras: "preferências configurações acessibilidade",
        executar: () => abrirJanela("ajustes"),
      },
      {
        id: "tela-cheia",
        grupo: "Visualização",
        rotulo: document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia",
        palavras: "fullscreen expandir",
        executar: () => void alternarTelaCheia(),
      },
      {
        id: "topo",
        grupo: "Visualização",
        rotulo: "Voltar ao topo",
        executar: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
      {
        id: "compartilhar",
        grupo: "Compartilhar",
        rotulo: "Compartilhar o site",
        palavras: "enviar mandar",
        executar: async () => {
          const resultado = await compartilharSite(siteConfig.siteTitle || document.title);
          if (resultado === "copiado") avisar("Link copiado");
          if (resultado === "falhou") avisar("Não deu para compartilhar");
        },
      },
      {
        id: "copiar-link",
        grupo: "Compartilhar",
        rotulo: "Copiar o link do site",
        executar: async () => avisar((await copiarLink()) ? "Link copiado" : "Não deu para copiar"),
      },
      {
        id: "imprimir",
        grupo: "Compartilhar",
        rotulo: "Imprimir esta página",
        palavras: "pdf salvar papel",
        executar: () => window.print(),
      },
      {
        id: "atalhos",
        grupo: "Ajuda",
        rotulo: "Atalhos do teclado",
        atalho: preferencias.atalhosDeUmaTecla ? ["?"] : undefined,
        executar: () => abrirJanela("atalhos"),
      },
      {
        id: "privacidade",
        grupo: "Ajuda",
        rotulo: "Privacidade",
        descricao: "O que o site guarda e o que não guarda",
        executar: () => abrirJanela("privacidade"),
      },
    ];
  }, [siteConfig, som, abrirJanela, avisar, preferencias.atalhosDeUmaTecla, paginaAtual, irPara]);
}
