import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { usePreferencias } from "@/compartilhado/hooks/usePreferencias";
import { Janela } from "./componentes/Janela";
import { CHAVES_DAS_ESTATISTICAS } from "@/recursos/estatisticas";

const CHAVES_DO_VISITANTE = [
  "ceclos_preferencias",
  "ceclos_device_preference",
  "ceclos_rota_ja_escolhida",
  "ceclos_aviso_dispensado",
  "app_sound_enabled",
  "app_sound_preset",
  "app_sound_volume",
  "app_custom_sound_name",
  "app_custom_sound_url",
  "app_bg_music_enabled",
  "app_bg_music_preset",
  "app_bg_music_volume",
  "app_bg_playlist_id",
  "app_custom_bg_music_name",
  "app_custom_bg_music_url",
  "app_player_oculto",
  ...CHAVES_DAS_ESTATISTICAS,
];

const ITENS = [
  {
    titulo: "Estatísticas anônimas",
    texto:
      "O site não usa cookies nem anúncios. Ele só conta os acessos de forma anônima: cidade e estado aproximados (estimados pela rede de internet), se o aparelho é celular, tablet ou computador, por onde você chegou e se usou a opção de compartilhar. Seu endereço de internet, seu nome e o que você faz nas páginas não são guardados, e os registros somem em 90 dias. Se o seu navegador pede para não ser rastreado, nada é contado.",
  },
  {
    titulo: "O que fica no seu navegador",
    texto:
      "Suas escolhas (tema, aparelho, sons, música, ajustes de exibição) ficam guardadas só neste navegador, para você não precisar escolher de novo. Elas não saem do seu aparelho.",
  },
  {
    titulo: "Serviços de fora",
    texto:
      "As fontes do texto vêm do Google Fonts, que recebe o endereço de internet do seu aparelho ao carregá-las. Os botões de Instagram e WhatsApp levam a esses serviços, que têm regras próprias.",
  },
];

export function JanelaDePrivacidade() {
  const { janela, fecharJanela, avisar } = usePreferencias();
  const [confirmando, setConfirmando] = useState(false);

  const fechar = () => {
    setConfirmando(false);
    fecharJanela();
  };

  const apagar = () => {
    try {
      for (const chave of CHAVES_DO_VISITANTE) localStorage.removeItem(chave);
    } catch {}
    setConfirmando(false);
    fecharJanela();
    avisar("Preferências apagadas. Recarregando…");
    window.setTimeout(() => window.location.reload(), 900);
  };

  return (
    <Janela
      aberta={janela === "privacidade"}
      aoFechar={fechar}
      id="privacidade"
      etiqueta="Seus dados"
      titulo="Privacidade"
      icone={ShieldCheck}
    >
      <div className="space-y-4 px-4 py-5 sm:px-6">
        {ITENS.map((item) => (
          <div key={item.titulo}>
            <h3 className="text-sm font-bold text-white">{item.titulo}</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-stone-300">{item.texto}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.08] px-4 py-3 sm:px-6">
        {confirmando ? (
          <div
            role="group"
            aria-label="Confirmar exclusão"
            className="flex flex-wrap items-center gap-2"
          >
            <p className="mr-auto text-sm text-stone-300">
              Apagar suas escolhas deste navegador? O site volta ao padrão.
            </p>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="min-h-9 cursor-pointer rounded-lg border border-white/10 px-3 text-sm font-semibold text-stone-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={apagar}
              className="min-h-9 cursor-pointer rounded-lg border border-red-400/50 bg-red-400/10 px-3 text-sm font-semibold text-red-300 hover:bg-red-400/20"
            >
              Apagar escolhas
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="min-h-9 cursor-pointer rounded-lg border border-white/10 px-3 text-sm font-semibold text-stone-300 transition-colors hover:border-red-400/40 hover:text-red-300"
          >
            Apagar minhas escolhas deste navegador
          </button>
        )}
      </div>
    </Janela>
  );
}
