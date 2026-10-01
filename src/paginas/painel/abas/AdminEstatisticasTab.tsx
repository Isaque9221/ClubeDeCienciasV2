import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Eye,
  Users,
  CalendarDays,
  Share2,
  RefreshCw,
  KeyRound,
  AlertTriangle,
  Smartphone,
  Monitor,
  Tablet,
  Check,
  Minus,
  ChartColumn,
} from "lucide-react";
import { useSound } from "@/compartilhado/hooks/useSound";
import { guardarTokenDaSessao, lerTokenDaSessao, esquecerTokenDaSessao } from "@/seguranca";

const ENDERECO = "/api/estatisticas";
const FUSO = "America/Bahia";

type Dispositivo = "celular" | "tablet" | "computador";

interface Estatisticas {
  atualizadoEm: string;
  resumo: {
    acessos: number;
    visitantes: number;
    hoje: number;
    ultimos7Dias: number;
    compartilhamentos: number;
    pessoasQueCompartilharam: number;
  };
  estados: { pais: string; regiao: string; acessos: number }[];
  cidades: { pais: string; regiao: string; cidade: string; acessos: number }[];
  dispositivos: { tipo: Dispositivo; acessos: number }[];
  origens: { tipo: string; acessos: number }[];
  compartilhamentos: { meio: string; vezes: number }[];
  recentes: {
    quando: number;
    pais: string;
    regiao: string;
    cidade: string;
    dispositivo: Dispositivo;
    origem: string;
    compartilhou: boolean;
  }[];
}

type Falha = "nao-configurado" | "sem-token" | "muitos" | "banco" | "indisponivel";

type Estado =
  | { fase: "carregando" }
  | { fase: "pedir-token"; erro?: string }
  | { fase: "falha"; motivo: Falha }
  | { fase: "pronto"; dados: Estatisticas };

const ESTADOS_DO_BRASIL: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

const DISPOSITIVOS: Record<Dispositivo, { rotulo: string; Icone: typeof Monitor }> = {
  celular: { rotulo: "Celular", Icone: Smartphone },
  tablet: { rotulo: "Tablet", Icone: Tablet },
  computador: { rotulo: "Computador", Icone: Monitor },
};

const ORIGENS: Record<string, string> = {
  direto: "Acesso direto",
  compartilhado: "Link compartilhado pelo site",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  "outro-site": "Outro site",
};

const MEIOS: Record<string, string> = {
  nativo: "Menu de compartilhar do aparelho",
  link: "Link copiado",
};

const FALHAS: Record<Falha, { titulo: string; texto: string }> = {
  "nao-configurado": {
    titulo: "O banco de estatísticas ainda não foi ligado",
    texto:
      "Na Vercel, abra o projeto, vá em Storage, crie um banco Upstash for Redis (o plano gratuito basta), conecte-o a este projeto e publique o site de novo. A contagem começa a partir daí.",
  },
  "sem-token": {
    titulo: "Falta o token na hospedagem",
    texto:
      "Cadastre a variável VITE_MASTER_TOKEN_HASH nas configurações do projeto na Vercel (Settings → Environment Variables) e publique de novo.",
  },
  muitos: {
    titulo: "Muitas tentativas com token errado",
    texto: "Por segurança, as estatísticas ficam bloqueadas para esta rede por até uma hora.",
  },
  banco: {
    titulo: "O banco de estatísticas não respondeu",
    texto: "Pode ser uma instabilidade passageira. Tente atualizar em alguns instantes.",
  },
  indisponivel: {
    titulo: "Estatísticas disponíveis só no site publicado",
    texto:
      "A contagem de acessos roda no servidor da Vercel. Aqui (no computador com npm run dev, ou em outra hospedagem) não há servidor para guardar os números.",
  },
};

const numero = new Intl.NumberFormat("pt-BR");
const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const nomesDePaises = (() => {
  try {
    return new Intl.DisplayNames(["pt-BR"], { type: "region" });
  } catch {
    return null;
  }
})();

function nomeDoPais(pais: string): string {
  if (!pais) return "";
  try {
    return nomesDePaises?.of(pais) ?? pais;
  } catch {
    return pais;
  }
}

function nomeDoEstado(pais: string, regiao: string): string {
  if (!pais) return "Não identificado";
  if (pais === "BR") return ESTADOS_DO_BRASIL[regiao] ?? (regiao || "Brasil");
  return /^[A-Z]{2,3}$/.test(regiao) ? `${regiao} · ${nomeDoPais(pais)}` : nomeDoPais(pais);
}

function siglaDoLugar(pais: string, regiao: string): string {
  if (!pais) return "";
  return pais === "BR" ? regiao : nomeDoEstado(pais, regiao);
}

function somarPorNome<T extends { pais: string; regiao: string; acessos: number }>(
  itens: T[]
): { chave: string; nome: string; valor: number }[] {
  const somados = new Map<string, number>();
  for (const item of itens) {
    const nome = nomeDoEstado(item.pais, item.regiao);
    somados.set(nome, (somados.get(nome) ?? 0) + item.acessos);
  }
  return [...somados.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([nome, valor]) => ({ chave: nome, nome, valor }));
}

function quandoFoi(momento: number): string {
  return new Date(momento).toLocaleString("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function porcentagem(parte: number, total: number): string {
  if (total <= 0) return "0%";
  const valor = (parte / total) * 100;
  return `${valor < 10 && valor > 0 ? valor.toFixed(1).replace(".", ",") : Math.round(valor)}%`;
}

async function buscar(token: string): Promise<Estado> {
  let resposta: Response;
  try {
    resposta = await fetch(ENDERECO, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      credentials: "omit",
    });
  } catch {
    return { fase: "falha", motivo: "indisponivel" };
  }
  if (!(resposta.headers.get("content-type") || "").includes("application/json")) {
    return { fase: "falha", motivo: "indisponivel" };
  }
  const corpo = (await resposta.json().catch(() => null)) as
    (Estatisticas & { erro?: undefined }) | { erro: string } | null;
  if (!corpo) return { fase: "falha", motivo: "indisponivel" };
  if (resposta.ok && !corpo.erro) return { fase: "pronto", dados: corpo as Estatisticas };
  if (resposta.status === 401) {
    return {
      fase: "pedir-token",
      erro: "Esse token não confere com o cadastrado na hospedagem (VITE_MASTER_TOKEN_HASH).",
    };
  }
  const motivo = corpo.erro as Falha;
  return { fase: "falha", motivo: motivo in FALHAS ? motivo : "banco" };
}

function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-[#121110] ${className}`}>
      {children}
    </div>
  );
}

function Indicador({
  rotulo,
  valor,
  detalhe,
  Icone,
}: {
  rotulo: string;
  valor: number;
  detalhe?: string;
  Icone: typeof Eye;
}) {
  return (
    <Cartao className="flex items-start gap-3 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-amber-400">
        <Icone className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-stone-400">{rotulo}</span>
        <span
          className="mt-0.5 block text-2xl font-semibold leading-none tracking-tight text-white"
          title={numero.format(valor)}
        >
          {valor >= 10_000 ? compacto.format(valor) : numero.format(valor)}
        </span>
        {detalhe && <span className="mt-1 block text-[11px] text-stone-500">{detalhe}</span>}
      </span>
    </Cartao>
  );
}

function Proporcao({ parte, total }: { parte: number; total: number }) {
  const largura = total > 0 ? Math.max((parte / total) * 100, parte > 0 ? 2 : 0) : 0;
  return (
    <span className="block h-1.5 w-full min-w-16 rounded-full bg-amber-400/15" aria-hidden="true">
      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${largura}%` }} />
    </span>
  );
}

function TabelaDeContagem({
  titulo,
  colunaDoNome,
  linhas,
  vazio,
}: {
  titulo: string;
  colunaDoNome: string;
  linhas: { chave: string; nome: ReactNode; valor: number }[];
  vazio: string;
}) {
  const total = linhas.reduce((soma, linha) => soma + linha.valor, 0);
  return (
    <Cartao className="overflow-hidden">
      <h3 className="border-b border-white/[0.06] px-4 py-3 text-xs font-bold text-white">
        {titulo}
      </h3>
      {linhas.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-stone-500">{vazio}</p>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">
                  {colunaDoNome}
                </th>
                <th scope="col" className="w-[38%] px-2 py-2 font-semibold">
                  <span className="sr-only">Proporção</span>
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Acessos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {linhas.map((linha) => (
                <tr key={linha.chave} className="hover:bg-white/[0.025]">
                  <td className="px-4 py-2 text-stone-200">{linha.nome}</td>
                  <td className="px-2 py-2">
                    <Proporcao parte={linha.valor} total={total} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums text-stone-200">
                    {numero.format(linha.valor)}
                    <span className="ml-1.5 text-stone-500">{porcentagem(linha.valor, total)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Cartao>
  );
}

function PedirToken({ erro, aoEnviar }: { erro?: string; aoEnviar: (token: string) => void }) {
  const [token, setToken] = useState("");
  const valido = /^[a-zA-Z0-9]{10}$/.test(token.trim());

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (valido) aoEnviar(token.trim());
  };

  return (
    <Cartao className="mx-auto max-w-md p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
        <KeyRound className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-extrabold text-white">Confirme o token mestre</h2>
      <p className="mt-1 text-xs leading-relaxed text-stone-400">
        As estatísticas ficam no servidor e só abrem com o token de 10 dígitos.
      </p>
      <form onSubmit={enviar} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="token-das-estatisticas" className="sr-only">
          Token mestre
        </label>
        <input
          id="token-das-estatisticas"
          type="password"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full rounded-xl border border-white/[0.1] bg-[#0c0b0a] px-3.5 py-2.5 text-center font-mono text-sm tracking-[0.3em] text-white placeholder-stone-600 focus:border-amber-400/60 focus:outline-none"
          placeholder="••••••••••"
        />
        <button
          type="submit"
          disabled={!valido}
          className="shrink-0 cursor-pointer rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ver estatísticas
        </button>
      </form>
      {erro && (
        <p role="alert" className="mt-3 text-[11px] leading-snug text-rose-300">
          {erro}
        </p>
      )}
    </Cartao>
  );
}

function AvisoDeFalha({ motivo, aoTentarDeNovo }: { motivo: Falha; aoTentarDeNovo: () => void }) {
  const { titulo, texto } = FALHAS[motivo];
  return (
    <Cartao className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-extrabold text-white">{titulo}</h2>
      <p className="mt-2 max-w-lg text-xs leading-relaxed text-stone-400">{texto}</p>
      <button
        type="button"
        onClick={aoTentarDeNovo}
        className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-stone-200 transition-colors hover:bg-white/[0.08]"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Tentar de novo
      </button>
    </Cartao>
  );
}

export function AdminEstatisticasTab() {
  const { playSound } = useSound();
  const [estado, setEstado] = useState<Estado>(() =>
    lerTokenDaSessao() ? { fase: "carregando" } : { fase: "pedir-token" }
  );
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async (token: string) => {
    setAtualizando(true);
    const resultado = await buscar(token);
    setAtualizando(false);
    if (resultado.fase === "pronto") guardarTokenDaSessao(token);
    if (resultado.fase === "pedir-token") esquecerTokenDaSessao();
    setEstado(resultado);
  }, []);

  useEffect(() => {
    const token = lerTokenDaSessao();
    if (token) void carregar(token);
  }, [carregar]);

  const atualizar = () => {
    playSound("subtle-click");
    const token = lerTokenDaSessao();
    if (token) void carregar(token);
    else setEstado({ fase: "pedir-token" });
  };

  if (estado.fase === "pedir-token") {
    return (
      <PedirToken
        erro={estado.erro}
        aoEnviar={(token) => {
          playSound("subtle-click");
          setEstado({ fase: "carregando" });
          void carregar(token);
        }}
      />
    );
  }

  if (estado.fase === "falha") {
    return <AvisoDeFalha motivo={estado.motivo} aoTentarDeNovo={atualizar} />;
  }

  if (estado.fase === "carregando") {
    return (
      <Cartao className="flex items-center justify-center gap-2 px-6 py-16 text-xs text-stone-400">
        <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
        Carregando as estatísticas…
      </Cartao>
    );
  }

  const { dados } = estado;
  const { resumo } = dados;

  return (
    <div className="space-y-4">
      <Cartao className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <ChartColumn className="h-4 w-4 text-amber-400" />
            Quem está visitando o site
          </h2>
          <p className="mt-0.5 text-xs text-stone-400">
            Atualizado às{" "}
            {new Date(dados.atualizadoEm).toLocaleTimeString("pt-BR", {
              timeZone: FUSO,
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            (horário de Brasília). A localização é aproximada, estimada pela rede de internet.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizar}
          disabled={atualizando}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-stone-200 transition-colors hover:bg-white/[0.08] disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${atualizando ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </Cartao>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Indicador rotulo="Acessos ao site" valor={resumo.acessos} Icone={Eye} />
        <Indicador
          rotulo="Pessoas diferentes"
          valor={resumo.visitantes}
          detalhe="Contadas por navegador"
          Icone={Users}
        />
        <Indicador
          rotulo="Acessos hoje"
          valor={resumo.hoje}
          detalhe={`${numero.format(resumo.ultimos7Dias)} nos últimos 7 dias`}
          Icone={CalendarDays}
        />
        <Indicador
          rotulo="Pessoas que compartilharam"
          valor={resumo.pessoasQueCompartilharam}
          detalhe={`${numero.format(resumo.compartilhamentos)} compartilhamentos`}
          Icone={Share2}
        />
      </div>

      <Cartao className="overflow-hidden">
        <h3 className="border-b border-white/[0.06] px-4 py-3 text-xs font-bold text-white">
          Últimos acessos
          <span className="ml-2 font-normal text-stone-500">
            {numero.format(dados.recentes.length)} mais recentes
          </span>
        </h3>
        {dados.recentes.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-stone-500">
            Nenhum acesso registrado ainda. Os números aparecem aqui assim que alguém abrir o site
            publicado.
          </p>
        ) : (
          <div className="max-h-[440px] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="sticky top-0 bg-[#121110] text-[10.5px] uppercase tracking-wider text-stone-500">
                <tr>
                  {["Quando", "Cidade", "Estado", "Aparelho", "Chegou por", "Compartilhou"].map(
                    (coluna) => (
                      <th key={coluna} scope="col" className="px-4 py-2 font-semibold">
                        {coluna}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {dados.recentes.map((visita, i) => {
                  const aparelho = DISPOSITIVOS[visita.dispositivo] ?? DISPOSITIVOS.computador;
                  return (
                    <tr key={`${visita.quando}-${i}`} className="hover:bg-white/[0.025]">
                      <td className="whitespace-nowrap px-4 py-2 tabular-nums text-stone-400">
                        {quandoFoi(visita.quando)}
                      </td>
                      <td className="px-4 py-2 text-stone-200">
                        {visita.cidade || <span className="text-stone-500">Não identificada</span>}
                      </td>
                      <td className="px-4 py-2 text-stone-200">
                        {nomeDoEstado(visita.pais, visita.regiao)}
                      </td>
                      <td className="px-4 py-2 text-stone-200">
                        <span className="inline-flex items-center gap-1.5">
                          <aparelho.Icone className="h-3.5 w-3.5 text-stone-400" />
                          {aparelho.rotulo}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-stone-300">
                        {ORIGENS[visita.origem] ?? visita.origem}
                      </td>
                      <td className="px-4 py-2">
                        {visita.compartilhou ? (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <Check className="h-3.5 w-3.5" /> Sim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-500">
                            <Minus className="h-3.5 w-3.5" /> Não
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      <div className="grid gap-3 lg:grid-cols-2">
        <TabelaDeContagem
          titulo="Por estado"
          colunaDoNome="Estado"
          vazio="Sem acessos ainda."
          linhas={somarPorNome(dados.estados)}
        />
        <TabelaDeContagem
          titulo="Por cidade"
          colunaDoNome="Cidade"
          vazio="Sem acessos ainda."
          linhas={dados.cidades.map((item) => ({
            chave: `${item.pais}-${item.regiao}-${item.cidade}`,
            nome: (
              <>
                {item.cidade || <span className="text-stone-500">Não identificada</span>}
                <span className="ml-1.5 text-stone-500">
                  {siglaDoLugar(item.pais, item.regiao)}
                </span>
              </>
            ),
            valor: item.acessos,
          }))}
        />
        <TabelaDeContagem
          titulo="Celular ou computador"
          colunaDoNome="Aparelho"
          vazio="Sem acessos ainda."
          linhas={dados.dispositivos.map((item) => {
            const aparelho = DISPOSITIVOS[item.tipo] ?? DISPOSITIVOS.computador;
            return {
              chave: item.tipo,
              nome: (
                <span className="inline-flex items-center gap-1.5">
                  <aparelho.Icone className="h-3.5 w-3.5 text-stone-400" />
                  {aparelho.rotulo}
                </span>
              ),
              valor: item.acessos,
            };
          })}
        />
        <TabelaDeContagem
          titulo="Por onde chegaram"
          colunaDoNome="Origem"
          vazio="Sem acessos ainda."
          linhas={dados.origens.map((item) => ({
            chave: item.tipo,
            nome: ORIGENS[item.tipo] ?? item.tipo,
            valor: item.acessos,
          }))}
        />
      </div>

      <Cartao className="p-4">
        <h3 className="text-xs font-bold text-white">Compartilhamentos</h3>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {dados.compartilhamentos.map((item) => (
            <div
              key={item.meio}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5"
            >
              <dt className="text-xs text-stone-300">{MEIOS[item.meio] ?? item.meio}</dt>
              <dd className="text-sm font-semibold tabular-nums text-white">
                {numero.format(item.vezes)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
          Conta quem usou “Compartilhar o site” ou “Copiar o link” no menu de comandos (Ctrl + K).
          Quem copia o endereço direto do navegador não aparece aqui, mas quem abrir um link
          compartilhado pelo site entra em “Link compartilhado pelo site”, e quem vier do WhatsApp
          ou do Instagram aparece em “Por onde chegaram”.
        </p>
      </Cartao>
    </div>
  );
}
