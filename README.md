# Clube de Ciências CECLOS

Site do Clube de Ciências CECLOS — React 19 + TypeScript + Vite 8 + Tailwind CSS 4.

O site tem **uma versão só** (React + Tailwind), que se ajusta ao tamanho da
tela: o mesmo código atende computador, tablet e celular. A versão separada
para celular em React Native, a pergunta "Como você está acessando o Clube
hoje?" e o "Modo Windows/Mobile" foram removidos em 01/10/2026 a pedido; quem
precisar consultar o código antigo encontra uma cópia em
`_backup-antes-de-remover-o-mobile-2026-10-01/`, na pasta de cima.

## Comandos

```bash
npm install            # instala as dependências
npm run dev            # servidor de desenvolvimento em http://localhost:5174
npm run build          # build de produção em dist/
npm run preview        # serve o build em http://localhost:4174
npm run test           # todos os testes (dados, migração, persistência, segurança)
npm run lint           # oxlint
npm run format         # formata o código com Prettier
npm run verify         # lint + formatação + testes + build (rode antes de publicar)
npm run build:hostinger# build e pacote zip pronto para a public_html da Hostinger
npm run gerar-token    # gera o token do Painel e as variáveis de ambiente
```

### Configuração inicial

```bash
cp .env.example .env
npm run gerar-token    # cole as duas linhas VITE_* no .env
```

O `.env` está no `.gitignore` e nunca deve ser versionado. Leia o
`SECURITY.md` antes de mexer em autenticação.

### O caractere `#` no caminho

Se a pasta do projeto tiver `#` no nome (ex.: `Versão #16`), o Vite o trata
como fragmento de URL. O `scripts/patch-vite.cjs` roda no `postinstall` e
corrige isso — e não faz nada quando o caminho não tem `#`, como nos
servidores de deploy.

## Estrutura

A visão completa da infraestrutura e da arquitetura do código está em
`ARQUITETURA.md`.

```
src/
├── app/            Entrada: main.tsx, App.tsx (páginas e providers), CSS global e tema
├── paginas/        Uma pasta por página
│   ├── inicio/     Monta a página inicial
│   ├── membros/    Página de Membros e seus cartões
│   ├── projetos/   Página de Projetos (com o aviso "em desenvolvimento")
│   ├── trajetoria/ Página da Trajetória
│   └── painel/     Painel Admin (Ctrl+Shift+A)
├── secoes/         As seções da página inicial, cada uma com conteudo.ts (textos)
│   ├── hero/       Primeira tela, dock e menu Explorar
│   ├── sobre/ pilares/ manifesto/ faq/ estatisticas/ ticker/
│   ├── equipe/     "Quem faz a ciência acontecer"
│   ├── pesquisadores/  Prévia dos mentores
│   ├── pontes/     Parcerias
│   ├── cta/        Convite final e botão "Participar do Clube" (WhatsApp)
│   └── rodape/     Rodapé, instituições parceiras e contatos
├── recursos/       O que serve o site inteiro
│   ├── audio/      Player de música e sons de clique
│   ├── sistema/    Comandos, Ajustes, Atalhos, Privacidade
│   └── carregamento/  Tela de carregamento e escolha de destino
├── plataformas/
│   └── windows/    Página inicial, cursor dourado e estilos globais de tela
├── compartilhado/  Componentes, contextos, dados, hooks, tipos e utilitários
│                   (Membros, Projetos e Trajetória usam o mesmo cabeçalho:
│                   compartilhado/componentes/CabecalhoDaAba.tsx)
└── seguranca/      Criptografia, sessão, validação, DOMPurify, uploads

public/
├── membros/        Fotos dos membros (lideranca/ tem os recortes dos dois líderes)
├── parceiros/      Logos das instituições parceiras
├── emblemas/       As versões do emblema do clube
├── sons/           cliques/ (efeitos) e plantasia/ (trilha e capa)
├── icones/         Favicons e ícones do app
├── js/             abertura.js, abertura-cena.js, esquema.js e gsap/ (rodam antes do React)
└── manifest.webmanifest, _headers, .htaccess (ficam na raiz)
```

Cada seção tem um **`conteudo.ts`** com todos os seus textos. O Painel Admin
passa na frente do `conteudo.ts` nos campos editados por lá. Guias de edição:
`src/secoes/LEIA-ME.md` e `src/plataformas/LEIA-ME.md`.

Imports usam o alias `@/` apontando para `src/`.

## A abertura

A abertura tem o tema **longa exposição**: uma câmera fotografando o céu do
sertão por horas, com as estrelas deixando rastros em volta do polo sul
celeste. A marcação e o CSS ficam no `index.html` (o fundo escuro aparece no
primeiro quadro); a coreografia é feita com GSAP em `public/js/abertura-cena.js`.
A sequência (tempos aproximados, a partir do início da cena):

1. **O céu (0–3,5 s)** — as tarjas de cinema se abrem, um ponto de luz marca o
   polo sul celeste (rótulo "σ Octantis") e as estrelas acendem do centro para
   fora. O visor aparece nos cantos: "Longa exposição", o relógio da
   exposição, as coordenadas e "f/2.8 · ISO 3200".
2. **O método (3,5–14 s)** — o céu começa a girar e cada estrela vira um
   rastro (desenhados num `<canvas>`, 70° = 4h40 de exposição no relógio).
   No centro passam as quatro palavras do método científico: Observar,
   Perguntar, Experimentar e Descobrir, cada uma com uma frase curta.
3. **O sertão (13,5–16 s)** — o horizonte com mandacarus sobe em duas camadas,
   o amanhecer acende atrás dele, cai uma estrela cadente e aparece
   "Santa Rita de Cássia · Bahia · Semiárido".
4. **O clube (16–20 s)** — os rastros esmaecem, o anel do medalhão se desenha
   exatamente no centro do giro, a logo entra, e "Clube de Ciências", "CECLOS"
   e "Iniciação científica no semiárido baiano" aparecem.
5. **Saída** — o medalhão se dissolve e uma íris com borda dourada se abre a
   partir dele, revelando o site.

`public/js/abertura.js` decide quando ela sai: `DURACAO_MINIMA` (20700 ms)
conta a partir do momento em que a cena começa, e a sequência foi desenhada
para ocupar esse tempo. Se o número mudar, a cena é cortada pela saída no
ponto em que estiver. Um toque ou qualquer tecla pula a abertura. Com
"reduzir movimento", a abertura mostra a composição final parada. Se o GSAP não
carregar, a classe `abertura--estatica` mostra a mesma composição só com CSS.

O GSAP da abertura está copiado em `public/js/gsap/` (gsap, SplitText,
DrawSVGPlugin e ScrambleTextPlugin, versão 3.15.0) porque precisa rodar antes do
pacote do site. Ao atualizar o `gsap` do `package.json`, copie de novo os
arquivos `.min.js` de `node_modules/gsap/dist/`. O `abertura-cena.js` apaga o
`window.gsap` logo depois de usá-lo, para que o ScrollTrigger do site continue
preso à cópia do GSAP que vem do `npm`.

Depois da abertura, a escolha "Para onde você deseja ir?" aparece só na
primeira visita (chave `ceclos_rota_ja_escolhida`).

## Longa exposição no site

O site continua a linguagem da abertura com peças de
`src/compartilhado/componentes/LongaExposicao.tsx`:

- **`CeuDoSertao`** (`CeuDoSertao.tsx`, usado pelo `FundoDoSite`) — o fundo de
  todas as páginas no tema escuro: três camadas de estrelas (distantes,
  médias e brilhantes com halo) e uma Via Láctea diagonal com poeira dourada e
  faixas escuras. As estrelas saem de um sorteio com semente fixa, então o céu
  é sempre o mesmo. É desenhado uma vez (e de novo só ao redimensionar); ao
  rolar, cada camada só se desloca um pouco (24, 52 e 90 px ao longo da página
  inteira), dando profundidade. No tema claro fica escondido.
- **`CeuEmExposicao`** — `<canvas>` com rastros de estrelas cujo giro avança
  com a rolagem da seção: no manifesto, na chamada "Pronto para explorar" e na
  assinatura do rodapé. No tema claro os rastros viram
  traços de tinta marrom, como numa carta celeste. Não há animação contínua:
  o céu só é redesenhado quando a página rola (a cada 0,3° de giro; entre um
  desenho e outro a camada é girada pela GPU) e fica parado com "reduzir
  movimento".
- **`Visor`** — cantos de enquadramento (hero, estatísticas, manifesto,
  chamada final e rodapé). Os textos que ficavam nesses cantos (coordenadas,
  "CECLOS · 2026", "f/2.8 · ISO 3200"…) foram retirados em 01/10/2026 a pedido;
  a abertura animada (`index.html`) continua com o visor dela.
- **`SectionLabel`** — o rótulo de cada seção: ponto dourado, fios dos lados e
  texto mono que se embaralha e se forma ao aparecer (`TextoEmCodigo`; leitores
  de tela recebem o texto final). Com `alinhamento="esquerda"` perde o fio da
  esquerda.
- **`FioDourado`** — linha dourada que se desenha do centro sob os títulos.
- Os títulos (`GsapTextReveal` com `type="mask-up"`) sobem palavra por palavra
  de dentro de uma máscara, como as palavras da abertura; no hero, "Clube de
  Ciências" sobe letra por letra.

## Tema claro, escuro e acessibilidade

O tema é escolhido em **Explorar > Tema** (ou nos Ajustes): Automático (segue o
aparelho), Claro ou Escuro. `public/js/esquema.js` roda antes da primeira pintura e
marca `<html data-esquema="claro|escuro">`, para o site não piscar; depois o
`PreferenciasProvider` mantém o atributo atualizado (e força "claro" ao
imprimir). Todo o CSS de cor depende desse atributo, em `src/app/tema.css`:

- **Cores.** No modo claro, as variáveis da paleta do Tailwind (`white`, `black`,
  `stone`, `yellow`, `amber`…) são redefinidas: `text-white` vira tinta escura,
  `yellow-400` vira âmbar-mel (#a3570a, 4,9:1 sobre o papel). As superfícies
  usam tokens próprios: `fundo`, `fundo-profundo`, `superficie`, `superficie-2`,
  `superficie-3`, `ouro`, `ouro-2`, `ambar` (ex.: `bg-superficie`, `text-ouro`).
  Evite cores fixas em hexadecimal; use esses tokens.
- **Ilhas escuras.** `data-tema="escuro"` mantém um trecho sempre escuro nos dois
  temas: o Hero (vídeo), o convite final, as telas de entrada, o Painel e as
  molduras de foto com texto por cima.
- **Só no claro.** A variante `claro:` do Tailwind aplica uma classe só no modo
  claro (ex.: `text-white/50 claro:text-white/75`).
- **Ajustes do claro (01/10/2026).** No modo claro, `tema.css` tira os halos
  amarelos (`--tw-drop-shadow-color` e `--tw-text-shadow-color`), deixa os
  cartões translúcidos (`bg-white/[0.02…0.05]`) brancos em vez de cinza e
  suaviza os brilhos radiais desfocados. `superficie-3` é a superfície mais
  clara nos dois temas (no claro, #fdf5e8).
- **Tintas âmbar no claro.** `bg-yellow-400/10` e afins usariam o âmbar escuro
  do texto e ficariam com cor de barro. `src/app/tema-claro-tintas.css` troca
  essas tintas (até 30% de opacidade, em fundo, degradê e hover) por um âmbar
  claro com a mesma transparência. O arquivo é gerado: depois de usar uma tinta
  nova num componente, rode `npm run gerar-tintas`.
- **Cores vindas de dados** (cor do membro, da aba, do pilar) passam por
  `corLegivel()` em `src/compartilhado/utils/cor-legivel.ts`, que as escurece no claro.
- **Vidro.** `.vidro` (e `.vidro-denso` para menus e janelas) é o material da
  camada de controles: menu do topo, dock, player, filtros da Trajetória,
  menus e janelas do sistema. Não use em cards de conteúdo. Com "reduzir
  transparência" ou contraste alto, vira sólido.
- **Preferências.** `PreferenciasProvider` guarda tamanho do texto, fonte,
  contraste, movimento e atalhos de uma tecla (chave `ceclos_preferencias`) e
  marca o `<html>` com `data-texto`, `data-fonte`, `data-contraste="alto"` e
  `data-movimento="reduzido"`. Contraste e movimento seguem o sistema no modo
  "Automático". Animações em GSAP consultam `querMenosMovimento()`.
- **Janelas do sistema** (`src/recursos/sistema/`): Comandos (Ctrl/⌘ K), Ajustes
  (Ctrl/⌘ ,), Atalhos (?), Privacidade. Os destinos da paleta de comandos vêm da
  lista do menu Explorar (`src/secoes/hero/conteudo.ts`). Janelas novas devem
  usar o componente `Janela`, que já prende o foco e devolve ao fechar
  (`useFocoNaJanela`).
- **Impressão.** O tema claro vale no papel; `data-nao-imprimir` esconde um
  elemento na impressão.
- **Logos dos parceiros.** No rodapé, os logos aparecem monocromáticos e se
  adaptam ao tema (claros no escuro, escuros no claro), sem placa branca. As cores
  originais aparecem na janela de detalhe; ali a placa clara fica suavizada no
  escuro e some no claro (`src/app/efeitos.css`).
- **Ícones.** O favicon é `public/icones/favicon.svg` (a árvore simplificada do
  emblema); os PNGs e o `manifest.webmanifest` são gerados a partir dele.

## Logos das instituições parceiras

`resolvePartnerLogo` (`src/compartilhado/utils/logo-do-parceiro.ts`) troca os
caminhos antigos (`/CNPQ.png`, `/Logo UFBA.png`, `/parceiros/Logo UEFS.png`…)
pelos recortes em `public/parceiros/` (`cnpq.png`, `ufba.png`…), porque versões
antigas do site deixaram esses caminhos salvos no navegador e no Painel. O
componente `LogoDoParceiro` tenta a logo cadastrada, depois o recorte da
instituição e, se nada carregar, mostra as iniciais do nome.

## Botão "Participar do Clube"

Abre uma conversa no WhatsApp com **+55 75 9705-9889** (padrão em
`src/secoes/cta/conteudo.ts`, campo `telefone`). Para trocar sem mexer no
código: **Painel Admin > Editor do Site & CMS > Convite Final > Telefone /
WhatsApp**. Se o campo do painel ficar vazio, vale o número padrão.

O Instagram do rodapé é **@clubececlos** (link
`https://www.instagram.com/clubececlos/`); o antigo `@ceclos.ciencias` salvo no
navegador é trocado pelo novo.

O e-mail do rodapé ("Endereço Eletrônico") é
`victor.moreno1@enova.educacao.ba.gov.br` (padrão em
`src/secoes/rodape/conteudo.ts`). Quem tinha o e-mail antigo
(`ceclos.ciencias@gmail.com`) salvo no navegador passa a ver o novo.

## Estatísticas de acesso

**Painel Admin > Estatísticas de Acesso** mostra quantas pessoas abriram o
site, de qual cidade e estado, se foi pelo celular, tablet ou computador, por
onde chegaram (WhatsApp, Instagram, Google, link compartilhado pelo site…) e
quem compartilhou o site.

Como funciona:

- `src/recursos/estatisticas/registro.ts` avisa o servidor uma vez por sessão
  do navegador (recarregar a página não conta de novo). Não envia nada em
  `npm run dev`, na prévia do painel, para robôs ou quando o navegador pede
  "não rastrear" (GPC / Do Not Track).
- `api/estatisticas.ts` é uma função da Vercel. A cidade e o estado vêm dos
  cabeçalhos de localização que a própria Vercel coloca em cada pedido
  (`x-vercel-ip-city`, `x-vercel-ip-country-region`), estimados pelo endereço
  de internet. Em celular com dados móveis a cidade costuma ser a da operadora
  (às vezes a capital).
- Os números ficam num banco Redis (Upstash, plano gratuito). O endereço de
  internet **não é guardado**; os 100 acessos mais recentes ficam
  registrados por 90 dias e os totais ficam somados.
- Compartilhar conta quando alguém usa "Compartilhar o site" ou "Copiar o
  link" (Ctrl + K). O link copiado leva `?via=compartilhado`, para o acesso de
  quem o abrir aparecer como "Link compartilhado pelo site".
- Para ler os números, o painel manda o token mestre para a função, que confere
  com `VITE_MASTER_TOKEN_HASH` da hospedagem. Se o token for trocado só em
  Configurações & Backup, a aba pede o token cadastrado na hospedagem.
- Só funciona hospedado na Vercel. Em outra hospedagem a aba avisa que as
  estatísticas não estão disponíveis, e o resto do site segue normal.

`npm run test:estatisticas` testa a função com um banco simulado.

## Página de Membros

- **Liderança do Projeto** mostra só Victor e Isaque (filtro por id em
  `MembersPage.tsx`). Ana Cláudia e Josué também estão na lista `MEMBERS`
  com categoria `lideranca`, para o Painel editar cada pessoa numa ficha só,
  mas aparecem apenas em **Mentores**.
- **Profissão dos sonhos** é o campo `area`. Vazio, mostra o nome da
  categoria (ex.: "Astronomia & Física"), como na versão de 10/09/2026.
- **Mural** ("Uma turma inteira fazendo ciência"): cada rosto abre o perfil.
  O mural é inclinado em 3D; para o clique sempre achar o rosto, as camadas
  decorativas têm `pointer-events: none` e só os retratos recebem o ponteiro.
  A animação pausa com o mouse em cima (`.mural-palco:hover`).
- **Perfil** (`MemberModal`): recebe a lista de onde foi aberto (mural,
  liderança, mentores ou diretório filtrado) e navega por ela com os botões,
  as setas ← → do teclado ou arrastando para o lado no celular.

## Áreas em desenvolvimento

**Painel Admin > Configurações & Backup > Áreas em desenvolvimento** troca a
situação de cada área entre "Em desenvolvimento" e pronta:

| Área | Em desenvolvimento | Pronta | Chave |
|---|---|---|---|
| Página de Projetos | visitante vê o aviso no lugar da lista | lista publicada | `projectsStatus` |
| Mapa do Site (painel) | item "Em obras", bloqueado | editor liberado | `mapStatus` |

A lista fica em `src/compartilhado/dados/areas-em-desenvolvimento.ts`; para
uma área nova, acrescente uma linha ali e use `areaEstaPronta()` onde ela
aparece. A tela "Em obras" do Mapa do Site também tem o botão "Marcar como
pronto". Como todo ajuste do painel, a situação fica guardada no navegador em
que foi feita (veja "Painel Admin e visitantes" em `SECURITY.md`).

## Página de Projetos

Enquanto a situação for "Em desenvolvimento" (Painel Admin > Editor do Site & CMS >
Página de Projetos), quem entra vê o aviso no lugar da lista. Troque para "Publicada"
quando os projetos estiverem prontos.

## Deploy

Requisitos: **Node.js 22.12 ou mais novo** (fixado em `package.json` >
`engines` e no `.nvmrc`). Antes de publicar, rode `npm run verify`: ele passa
lint, formatação, os testes e o build.

O build gera arquivos estáticos em `dist/`. O Painel Admin sai num arquivo
separado (`AdminPage-*.js`) e só é baixado quando alguém o abre. Os cabeçalhos de segurança e de
cache estão prontos para:

| Plataforma | Arquivo |
|---|---|
| Hostinger (hPanel / LiteSpeed) | `public/.htaccess`, `public/api/estatisticas.php` e `scripts/prepare-hostinger.cjs` |
| Hostinger Node.js Web App / VPS | `server.cjs` (servidor nativo de produção) |
| Vercel | `vercel.json` |
| Netlify / Cloudflare Pages | `public/_headers` |
| Apache / cPanel | `public/.htaccess` |
| CI/CD Automático (Hostinger) | `.github/workflows/deploy-hostinger.yml` |

Para o passo a passo completo na Hostinger (upload via ZIP, GitHub Actions, SSL e Upstash Redis),
consulte o guia dedicado: **`HOSTINGER_DEPLOY.md`**.

Na hospedagem, configure as variáveis `VITE_SECURITY_SALT` e
`VITE_MASTER_TOKEN_HASH` (geradas por `npm run gerar-token`) antes do build.
Detalhes em `SECURITY.md`.

### Publicar na Vercel, passo a passo

1. Envie o projeto para o GitHub (`git add`, `git commit`, `git push`) e, na
   Vercel, crie um projeto a partir do repositório. A Vercel lê `vercel.json`
   sozinha (build `npm run build`, pasta `dist`).
2. Em **Settings > Environment Variables**, cadastre `VITE_SECURITY_SALT` e
   `VITE_MASTER_TOKEN_HASH` com os mesmos valores do seu `.env`.
3. Em **Storage**, crie um banco **Upstash for Redis** (plano gratuito) e
   conecte ao projeto. A Vercel cria `KV_REST_API_URL` e `KV_REST_API_TOKEN`
   (ou `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`; a função aceita
   os dois nomes).
4. Publique de novo (**Deployments > Redeploy**) para as variáveis valerem.
5. Abra o site, depois **Painel Admin > Estatísticas de Acesso**: o seu
   próprio acesso já deve aparecer.

A prévia do link no WhatsApp e no Instagram precisa do endereço completo da
imagem. Na Vercel o build descobre o endereço sozinho
(`VERCEL_PROJECT_PRODUCTION_URL`). Com domínio próprio, cadastre
`VITE_SITE_URL` (ex.: `https://ceclos.com.br`) para a prévia usar o domínio.

Os servidores de hospedagem (Linux) diferenciam maiúsculas de minúsculas nos
nomes de arquivo, e o Windows não. Uma foto salva como `FOTO.png` e chamada no
código como `/Foto.png` funciona no seu computador e quebra no site publicado.
Ao trocar só a caixa de um nome em `public/`, use `git mv` para o Git registrar
a mudança.
