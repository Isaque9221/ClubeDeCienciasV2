# Arquitetura do site — Clube de Ciências CECLOS

Este arquivo descreve **onde o site roda** (infraestrutura) e **como o código
está organizado** (estrutura). Ele não repete os outros guias; aponta para eles:

| Guia | Assunto |
|---|---|
| `README.md` | Comandos, abertura, tema claro/escuro, "longa exposição", deploy |
| `SECURITY.md` | Criptografia, login do Painel, cabeçalhos HTTP, limites sem servidor |
| `HOSTINGER_DEPLOY.md` | Guia completo de deploy na Hostinger (LiteSpeed, CI/CD, PHP e Node.js) |
| `src/secoes/LEIA-ME.md` | Como editar os textos (`conteudo.ts`) |
| `src/plataformas/LEIA-ME.md` | A página inicial, o cursor dourado e o CSS de tela |

---

## 1. Visão geral

O site é um **SPA estático**: HTML, CSS e JavaScript servidos como arquivos,
sem servidor de aplicação e sem banco de dados. Tudo o que o site guarda fica
no navegador de quem o usa.

```
 Navegador do visitante
 ├── index.html ........... abertura em HTML/CSS + scripts de public/js/
 ├── dist/assets/*.js/css . o pacote React gerado pelo Vite
 └── armazenamento ........ localStorage · sessionStorage · IndexedDB

 Hospedagem estática ...... Vercel, Netlify, Cloudflare Pages ou Apache
 Função na Vercel ......... api/estatisticas.ts → Redis (Upstash): estatísticas de acesso
 Serviços externos ........ Google Fonts · vídeo do Hero (CloudFront)
 Backend futuro ........... Supabase (schema pronto, ainda não ligado)
```

### Tecnologias

| Camada | Pacote | Versão |
|---|---|---|
| Interface | React + React DOM | 19.2 |
| Linguagem | TypeScript | 6.0 |
| Build e servidor local | Vite (+ `@vitejs/plugin-react`) | 8 |
| Estilo | Tailwind CSS (via `@tailwindcss/vite`) | 4.3 |
| Animação de interface | framer-motion | 13 |
| Animação de cena e rolagem | GSAP + ScrollTrigger + `@gsap/react` | 3.15 |
| Ícones | lucide-react | 1.30 |
| Sanitização de HTML | DOMPurify | 3.4 |
| Lint | oxlint | 1.75 |
| Formatação | Prettier | 3.9 |
| Scripts TypeScript no Node | jiti | 2.7 |
| Runtime | Node.js | 22.12 ou mais novo (`.nvmrc`, `engines`) |

---

## 2. Infraestrutura

### 2.1 Ambientes

| Ambiente | Comando | Endereço |
|---|---|---|
| Desenvolvimento | `npm run dev` | http://localhost:5174 |
| Build de produção | `npm run build` | gera `dist/` |
| Prévia do build | `npm run preview` | http://localhost:4174 |
| Verificação completa | `npm run verify` | lint → formatação → testes → build |

Não há integração contínua (CI) configurada: o `npm run verify` é rodado à mão
antes de publicar.

### 2.2 Build

`npm run build` roda `tsc -b` (checagem de tipos, sem gerar arquivos) e depois
`vite build`. O `vite.config.ts` define:

- **Plugins:** React, Tailwind e `ceclos:integridade-sri`, um plugin próprio que
  carimba `integrity="sha384-…"` em cada `<script>` e `<link rel="stylesheet">`
  do `index.html`, inclusive nos arquivos de `public/js/`.
- **Alias:** `@/` aponta para `src/`.
- **Saída:** alvo `es2022`, minificado, sem sourcemap.

O que sai em `dist/assets/` (tamanhos sem compressão, do último build):

| Arquivo | Tamanho | Quando é baixado |
|---|---|---|
| `index-*.js` | ~515 KB | sempre (núcleo do site) |
| `componentes-*.js` | ~360 KB | sempre (pedaço compartilhado separado pelo Vite) |
| `index-*.css` | ~280 KB | sempre |
| `mapa-do-site-*.js`, `useModoPrevia-*.js` | ~95 KB e ~17 KB | sempre (pedaços compartilhados) |
| `AdminPage-*.js` | ~165 KB | só quando o Painel abre (`lazy()`) |

Tudo o que está em `public/` é copiado como está para `dist/`. O build pesa
cerca de **105 MB**, quase tudo mídia: `sons/` (~74 MB, a trilha Plantasia e
os cliques) e `membros/` (~28 MB, as fotos).

### 2.3 Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `VITE_SECURITY_SALT` | Sal usado na derivação de chaves do Painel |
| `VITE_MASTER_TOKEN_HASH` | Hash PBKDF2 do token do Painel (`pbkdf2:600000:sal:hash`) |

- Geradas por `npm run gerar-token`; o modelo está em `.env.example`.
- `.env` e `.env.*` estão no `.gitignore` (exceto o `.env.example`).
- Na hospedagem, precisam estar configuradas **antes do build**, porque o Vite
  as embute no JavaScript. Elas ficam fora do Git, mas não ficam escondidas de
  quem abre o site (ver `SECURITY.md`).

### 2.4 Hospedagem

O projeto está pronto para os principais ambientes de hospedagem, com os mesmos cabeçalhos
em cada um:

| Plataforma | Arquivo |
|---|---|
| Hostinger (LiteSpeed) / Apache / cPanel | `public/.htaccess`, `public/api/estatisticas.php` e `scripts/prepare-hostinger.cjs` |
| Hostinger Node.js Web App / VPS | `server.cjs` (servidor de produção nativo em Node.js) |
| Vercel | `vercel.json` (também define `npm run build` e a pasta `dist`) |
| Netlify / Cloudflare Pages | `public/_headers` |
| CI/CD Automático (Hostinger) | `.github/workflows/deploy-hostinger.yml` |

Para instruções completas da Hostinger, consulte `HOSTINGER_DEPLOY.md`.

**Cache**

| Caminho | Política | Motivo |
|---|---|---|
| `/assets/*` | 1 ano, `immutable` | os nomes têm hash; um arquivo novo tem nome novo |
| `/index.html` | `no-cache` | precisa apontar sempre para os assets atuais |
| `/js/*` | `no-cache` | os scripts da abertura não têm hash no nome |

No `.htaccess` (Hostinger / Apache), o `no-cache` de `/js/` vale só para `abertura.js` e
`esquema.js`; `abertura-cena.js` e `gsap/` ficam com o cache padrão do servidor.

**Segurança HTTP** (detalhes em `SECURITY.md`): CSP com `script-src 'self'`,
HSTS de 2 anos, `X-Frame-Options: SAMEORIGIN`, COOP, CORP, `Referrer-Policy` e
`Permissions-Policy`. Como a CSP não aceita scripts escritos dentro do HTML,
todo JavaScript que roda antes do React mora em arquivos de `public/js/`.

**No LiteSpeed / Apache (Hostinger):** redireciona HTTP para HTTPS (com suporte
ao proxy reverso de SSL), manda qualquer caminho desconhecido para o `index.html`,
encaminha `/api/estatisticas` para `api/estatisticas.php`, desliga a listagem de pastas e
bloqueia `.env`, `.git`, `.htaccess`, JSONs de build e logs.

**Origens externas permitidas pela CSP**

| Origem | Uso |
|---|---|
| `fonts.googleapis.com`, `fonts.gstatic.com` | Fontes (Inter e as opções do seletor de fonte) |
| CloudFront (`https:` em `media-src`) | Vídeo de fundo do Hero (`secoes/hero/conteudo.ts`) |

**Maiúsculas e minúsculas:** os servidores de hospedagem diferenciam
`Foto.png` de `foto.png`; o Windows não. Ao renomear só a caixa de um arquivo
em `public/`, use `git mv`.

### 2.5 Testes

`npm run test` roda quatro scripts, sem framework de testes: cada um imprime
`PASS`/`FALHA` e termina com erro se algo falhar.

| Script | O que confere |
|---|---|
| `scripts/check-data.cjs` | Cadastro de membros: ids únicos, foto existente em `public/` com a extensão certa, registros aposentados fora |
| `scripts/check-migration.ts` | Tradução de caminhos antigos de fotos e logos |
| `scripts/check-persistencia.ts` | Mesclagem dos membros salvos no navegador com os do código |
| `scripts/check-seguranca.ts` | Sanitização, PBKDF2, AES-GCM, tokens, link do WhatsApp |

### 2.6 Scripts de apoio

| Script | Quando roda |
|---|---|
| `scripts/gerar-token.ts` | `npm run gerar-token`: cria o token do Painel e as variáveis |
| `scripts/patch-vite.cjs` | no `postinstall`: corrige o Vite quando o caminho da pasta tem `#` (ex.: `Versão #16`); fora disso não faz nada |

### 2.7 Versionamento e backups

- O repositório Git fica em `Clube De Ciencias/`, sem remoto configurado.
- `.gitattributes` fixa o fim de linha em LF e marca imagens, áudio e vídeo
  como binários.
- As cópias de segurança feitas antes de mudanças grandes ficam **fora** do
  repositório, na pasta de cima, como `_backup-antes-de-<mudança>-<data>/`.
- Também na pasta de cima: `Documentação Técnica - Clube de Ciências CECLOS.pdf`.

### 2.8 Backend futuro (Supabase)

`supabase/schema.sql` já descreve o banco para quando o site tiver servidor,
mas **nada no código usa o Supabase hoje**.

| Tabela | Conteúdo | Quem lê / quem escreve |
|---|---|---|
| `profiles` | Papel de cada usuário (`student` ou `admin`) | o próprio usuário e admins |
| `members` | Membros | todos / admins |
| `partners` | Parceiros | todos / admins |
| `projects` | Projetos dos alunos, com situação (`draft` → `featured`) | publicados para todos; rascunhos só para o dono e admins |
| `site_config` | A configuração do site em JSON (uma linha só) | todos / admins |
| bucket `media` | Imagens até 4 MB (PNG, JPEG, WebP, GIF) | todos / admins |

Todas as tabelas têm RLS ativado e forçado. O passo a passo da migração está
em `SECURITY.md`.

---

## 3. Como o site carrega

A ordem em que as coisas acontecem ao abrir o site:

```
 1  <head>  public/js/esquema.js      marca <html data-esquema="claro|escuro">
                                      antes da primeira pintura (sem piscar)
 2  <body>  CSS e marcação da abertura (#abertura) escritos no index.html
 3          public/js/abertura.js     controla o tempo: DURACAO_MINIMA = 20700 ms,
                                      pular com toque/tecla, expõe window.__abertura
 4          public/js/gsap/*.min.js   cópia do GSAP 3.15 para a abertura
            public/js/abertura-cena.js  coreografia da abertura; apaga window.gsap
 5          <div id="root"> + src/app/main.tsx
                                      o React monta o App; dois quadros depois chama
                                      window.__abertura.siteMontado()
 6  React   TelaDeCarregamento        barra de carregamento (mínimo 2,2 s)
            escolha de destino        só na primeira visita (ceclos_rota_ja_escolhida)
 7          página escolhida (Início por padrão)
```

Se a abertura não existir (por exemplo, na prévia do Painel), o `main.tsx`
remove o `#abertura` e marca `<html class="sem-abertura">`.

---

## 4. Arquitetura do código React

### 4.1 Provedores (estado global)

`src/app/App.tsx` empilha os provedores nesta ordem; cada um pode usar os de
fora:

```
PreferenciasProvider      tema, tamanho do texto, fonte, contraste, movimento
└─ MovimentoDoSite        MotionConfig do framer-motion (reduzir movimento)
   └─ DataProvider        membros, mentores, parceiros, siteConfig, backup
      └─ ProjectsProvider   projetos dos alunos (Cadernos de Pesquisa)
         └─ SoundProvider   cliques, música de fundo, player
            └─ ModoDoMapaProvider  prévia do Mapa do Site (?previa=1)
               └─ AppContent       páginas + janelas globais
```

Cada contexto é lido por um hook de `compartilhado/hooks/`: `usePreferencias`,
`useData`, `useProjects`, `useSound`, `useModoDoMapa`.

Cada contexto está dividido em dois arquivos: `algo-context.ts` (o
`createContext` e os tipos) e `AlgoContext.tsx` ou `AlgoProvider.tsx` (o
componente). A divisão existe por causa da regra `only-export-components` do
oxlint, que mantém o recarregamento rápido do Vite funcionando.

### 4.2 Páginas e navegação

Não há biblioteca de rotas. `AppContent` guarda a página atual num estado:

| Página | Componente | Pasta |
|---|---|---|
| `home` | `HomePage` | `paginas/inicio/` |
| `members` | `MembersPage` | `paginas/membros/` |
| `projects` | `ProjectsPage` | `paginas/projetos/` |
| `trajetoria` | `TrajetoriaPage` | `paginas/trajetoria/` |
| `admin` | `AdminPage` (carregado sob demanda) | `paginas/painel/` |

- `navigate()` troca a página e grava um `history.pushState`; o endereço não
  muda, mas o botão Voltar do navegador funciona (evento `popstate`).
- Cada página é um `<main id="conteudo">` que recebe o foco quando aparece,
  com transição do framer-motion (`AnimatePresence`).
- `Ctrl+Shift+A` abre e fecha o Painel.
- O título da aba é montado a partir de `siteConfig.siteTitle` e da página.

Fora das páginas, o `AppContent` mantém sempre montados: barra de progresso da
rolagem, `BarraDeAviso`, `FundoDoSite` (o céu estrelado), `TargetCursor` (só com
mouse; marca `html.cursor-alvo` enquanto está ativo), o player (`SoundSelectorModal`), a paleta de comandos, as
janelas de Ajustes, Atalhos e Privacidade e o `AvisoRapido`.

### 4.3 A página inicial

```
HomePage → plataformas/windows/PaginaInicialWindows.tsx  (React + Tailwind)
```

O site tem uma versão só, que se ajusta à largura da tela. A versão separada
para celular (React Native), a pergunta do aparelho e o "Modo Windows/Mobile"
foram removidos em 01/10/2026. Onde um detalhe muda no celular (menos estrelas
na abertura, linha do tempo sem zigue-zague, player escondido no topo), o
código usa `useTelaPequena()` (até 639 px).

- **Ordem das seções:** vem de `siteConfig.layoutSections`, lida por
  `lerMapa()` em `secoes/mapa-do-site.ts`. A página tem um dicionário
  "id da seção → componente"; um id sem entrada simplesmente não aparece.
- **Prévia do Mapa do Site:** o Painel mostra o site num `<iframe>` com
  `?previa=1`, conversando por `postMessage`. A aba fica "Em obras" até ser
  liberada em Configurações & Backup > Áreas em desenvolvimento (`mapStatus`);
  liberada, abre o editor `AdminMapaTab.tsx`.

### 4.4 Conteúdo e dados

O conteúdo vem de duas fontes, e a do Painel passa na frente:

```
 secoes/<seção>/conteudo.ts          textos padrão, escritos no código
         │
         ▼
 secoes/padroes-do-painel.ts         copia os campos que o Painel pode editar
         │
         ▼
 DEFAULT_CONFIG (data-context.ts)  +  edições do Painel
                                      (localStorage: ceclos_admin_overrides_v1)
         │
         ▼
 siteConfig = { ...DEFAULT_CONFIG, ...edições }  →  useData()  →  componentes
```

- **Membros, mentores e parceiros:** a lista padrão está em
  `compartilhado/dados/*.data.ts`. O `DataProvider` mistura essa lista com a
  salva no navegador: itens novos do código aparecem, e itens apagados no
  Painel continuam apagados (listas `ceclos_removidos_*`).
- **Caminhos antigos:** fotos e logos salvos com endereços de versões antigas
  são traduzidos por `caminhos-publicos.ts`, `member-migration.ts` e
  `logo-do-parceiro.ts`.
- **Projetos:** `ProjectsContext` guarda em `ceclos_student_projects_v5` e
  sincroniza abas abertas pelos eventos `storage` e `ceclos_projects_updated`.
- **Backups:** o Editor do Site exporta `backup-ceclos-<data>.json` (textos e
  FAQ); Configurações & Backup exporta `ceclos_backup_<data>.json` (tudo). A
  importação passa por `validateImportPayload`, que só aceita campos
  conhecidos.

> **Importante:** como não há servidor, o que é editado no Painel fica salvo
> **só no navegador onde foi feito**. Os visitantes continuam vendo os textos
> do código. Para uma mudança chegar a todo mundo, ela precisa ir para o
> `conteudo.ts` (ou `*.data.ts`) e o site precisa ser publicado de novo.

### 4.5 O que o site guarda no navegador

| Chave | Onde | Conteúdo | Arquivo |
|---|---|---|---|
| `ceclos_admin_overrides_v1` | localStorage | Campos editados no Painel | `contextos/DataContext.tsx` |
| `ceclos_data_members_v1`, `_mentors_v1`, `_partners_v1` | localStorage | Cadastros editados no Painel | `contextos/DataContext.tsx` |
| `ceclos_removidos_membros_v1`, `_mentores_v1`, `_parceiros_v1` | localStorage | Ids apagados no Painel | `utils/removidos.ts` |
| `ceclos_student_projects_v5` | localStorage | Projetos dos alunos | `contextos/ProjectsContext.tsx` |
| `ceclos_student_accounts_v8` | localStorage | Contas de alunos (só entram e saem pelo backup) | `contextos/DataContext.tsx` |
| `ceclos_preferencias` | localStorage | Tema, texto, fonte, contraste, movimento, atalhos | `contextos/PreferenciasProvider.tsx`, `public/js/esquema.js` |
| `ceclos_rota_ja_escolhida` | localStorage | Se a escolha de destino já foi feita | `recursos/carregamento/TelaDeCarregamento.tsx` |
| `ceclos_aviso_dispensado` | localStorage | Texto do aviso que o visitante fechou | `componentes/BarraDeAviso.tsx` |
| `app_*` (preset, volume, música, playlist, player oculto…) | localStorage | Preferências de som | `contextos/SoundContext.tsx` |
| `ceclos_admin_guard` | localStorage | Tentativas de login e bloqueio | `seguranca/rate-limit.ts` |
| `ceclos_admin_menu_recolhido` | localStorage | Menu do Painel recolhido | `paginas/painel/AdminPage.tsx` |
| `ceclos_admin_session` | sessionStorage | Sessão do Painel, cifrada (4 h) | `seguranca/session.ts` |
| banco `ceclos-cofre`, loja `chaves` | IndexedDB | Chave-mestra AES não exportável | `seguranca/crypto.ts` |

`ceclos_data_config` e `ceclos_data_config_v2` são chaves de versões antigas;
o `DataProvider` as apaga ao carregar. A janela de Privacidade lista e limpa
as preferências do visitante.

### 4.6 Eventos e mensagens internas

| Nome | Tipo | Liga |
|---|---|---|
| `ceclos_projects_updated` | evento da janela | quem grava projetos → `ProjectsContext` |
| `ceclos_tokens_updated` | evento da janela | disparado ao importar ou apagar contas de alunos; nada escuta hoje |
| `ceclos:abrir-player` | evento da janela | comandos e atalhos → player de música |
| `ceclos:mapa` | `postMessage` | Painel ↔ site dentro do `<iframe>` de prévia |
| `window.__abertura` | objeto global | `abertura.js` ↔ `main.tsx` |

### 4.7 Estilo e tema

| Arquivo | Papel |
|---|---|
| `src/app/index.css` | Tailwind, `@theme`, estilos globais |
| `src/app/tema.css` | Paleta e tokens do tema claro e escuro, `.vidro` |
| `src/app/efeitos.css` | Efeitos visuais compartilhados |
| `src/plataformas/windows/estilos/windows.css` | Cursor escondido sob o `TargetCursor`, toque, telas pequenas e barra de rolagem |

O `<html>` recebe atributos que o CSS consulta: `data-esquema`, `data-texto`,
`data-fonte`, `data-contraste`, `data-movimento`. Trechos com
`data-tema="escuro"` ficam escuros nos dois temas. As regras de uso (tokens de
cor, variante `claro:`, `corLegivel()`) estão no `README.md`.

### 4.8 Animação, canvas e áudio

- **framer-motion:** transições de página e de interface.
- **GSAP + ScrollTrigger** (pelo pacote do npm): títulos, números, seções que
  reagem à rolagem e as peças de `LongaExposicao.tsx`.
- **GSAP da abertura:** a cópia em `public/js/gsap/`, separada da do npm.
- **Canvas:** `CeuDoSertao` (fundo, desenhado uma vez) e `CeuEmExposicao`
  (rastros de estrelas redesenhados só ao rolar).
- **Reduzir movimento:** `querMenosMovimento()` (`utils/movimento.ts`) e o
  `MotionConfig` do `App.tsx`.
- **Áudio:** `SoundContext` + `recursos/audio/motor/` (Web Audio API; parte
  dos cliques é sintetizada, parte vem de `public/sons/cliques/`).

### 4.9 Segurança

Tudo o que protege o site está isolado em `src/seguranca/` e é exportado por
`src/seguranca/index.ts`:

| Arquivo | Responsabilidade |
|---|---|
| `crypto.ts` | PBKDF2, AES-256-GCM, HKDF, chave-mestra, tokens, comparação em tempo constante |
| `session.ts` | Sessão cifrada do Painel |
| `rate-limit.ts` | Bloqueio progressivo depois de tentativas erradas |
| `bot.ts` | Honeypot e tempo mínimo de interação |
| `validation.ts` | Limpeza de textos, URLs, imagens e importações |
| `html.ts` | DOMPurify para o texto dos projetos |
| `uploads.ts` | Tamanho e tipo dos arquivos enviados |

---

## 5. Estrutura de pastas

### 5.1 Raiz do projeto

```
Clube De Ciencias/
├── index.html            página única: <head>, abertura, scripts e #root
├── vite.config.ts        build, aliases e o plugin de integridade (SRI)
├── vercel.json           build e cabeçalhos para a Vercel
├── package.json          dependências e comandos
├── tsconfig*.json        TypeScript: app (src/) e node (vite.config.ts)
├── .oxlintrc.json        regras de lint
├── .prettierrc.json      formatação (100 colunas, aspas duplas, LF)
├── .nvmrc                versão do Node (22)
├── .env.example          modelo das variáveis de ambiente
├── README.md · SECURITY.md · ARQUITETURA.md
├── scripts/              testes, gerador de token e ajuste do Vite
├── supabase/schema.sql   banco para o backend futuro
├── public/               arquivos servidos como estão
├── src/                  código-fonte
└── dist/                 saída do build (fora do Git)
```

### 5.2 `src/`

```
src/
├── app/
│   ├── main.tsx              monta o React e avisa a abertura
│   ├── App.tsx               provedores, páginas, navegação e janelas globais
│   └── index.css · tema.css · efeitos.css
│
├── paginas/                  uma pasta por página
│   ├── inicio/               HomePage: escolhe a versão da página inicial
│   ├── membros/              MembersPage + componentes/ (cartões, ficha, mural)
│   ├── projetos/             ProjectsPage, EmDesenvolvimento, conteudo.ts
│   ├── trajetoria/           TrajetoriaPage, conteudo.ts
│   └── painel/               AdminPage, abas/, componentes/ (biblioteca de mídia),
│                             conteudo.ts (rótulos), esquema-do-editor.ts (campos)
│
├── secoes/                   seções da página inicial (visual do computador)
│   ├── <seção>/              Componente.tsx + conteudo.ts + index.ts
│   │                         hero, ticker, sobre, estatisticas, pilares, equipe,
│   │                         pesquisadores, pontes, manifesto,
│   │                         faq, cta, rodape
│   ├── _nucleo/              ajudantes de texto e listas (ex.: texto() usa o valor
│   │                         do Painel ou, se vazio, o do conteudo.ts)
│   ├── mapa-do-site.ts       lista das seções e leitura da ordem
│   ├── padroes-do-painel.ts  campos editáveis pelo Painel (copiados dos conteudo.ts)
│   └── posicoes-livres.ts    posições livres do editor de mapa
│
├── recursos/                 o que serve o site inteiro
│   ├── audio/                player, abas de som, motor/ (Web Audio)
│   ├── sistema/              paleta de comandos, Ajustes, Atalhos, Privacidade,
│   │                         Janela, atalhos globais
│   └── carregamento/         tela de carregamento e escolha de destino
│
├── plataformas/
│   ├── windows/              PaginaInicialWindows, TargetCursor, windows.css
│   └── tipos.ts              props da página inicial
│
├── compartilhado/
│   ├── componentes/          peças usadas em várias páginas (CabecalhoDaAba,
│   │                         LongaExposicao, CeuDoSertao, FundoDoSite,
│   │                         LogoDoParceiro, SectionLabel, GsapTextReveal…)
│   ├── contextos/            os provedores da seção 4.1
│   ├── dados/                membros, mentores, parceiros, sons padrão e áreas
│   │                         em desenvolvimento
│   ├── hooks/                useData, useTelaPequena, useFocoNaJanela…
│   ├── tipos/                tipos de membro, parceiro, projeto e som
│   └── utils/                caminhos antigos, cor legível, prévia, movimento,
│                             removidos…
│
└── seguranca/                ver seção 4.9
```

### 5.3 `public/`

```
public/
├── js/              esquema.js, abertura.js, abertura-cena.js, gsap/ (rodam antes do React)
├── membros/         fotos dos membros; lideranca/ tem os recortes dos dois líderes
├── parceiros/       logos originais ("Logo X.png") e recortes (x.png)
├── emblemas/        versões do emblema do clube
├── sons/            cliques/ (efeitos) e plantasia/ (trilha e capa)
├── icones/          favicon.svg e os PNGs gerados a partir dele
├── manifest.webmanifest
├── _headers         cabeçalhos para Netlify / Cloudflare Pages
└── .htaccess        cabeçalhos e redirecionamentos para Apache
```

---

## 6. Convenções

- **Sem comentários no código.** As explicações ficam nos arquivos `.md`.
- **Nomes em português** no código novo; partes antigas mantêm nomes em inglês
  (`MembersPage`, `ProjectsContext`, `sanitizeMember`).
- **Imports com `@/`** em vez de caminhos relativos longos.
- **Texto num lugar só:** frases do site ficam nos `conteudo.ts`, nunca nos
  componentes.
- **Cada seção é uma pasta** com o componente, o `conteudo.ts` e um `index.ts`
  que exporta o que a pasta oferece.
- **Cores por token** (`bg-superficie`, `text-ouro`…), não por hexadecimal.
- **Janelas novas** usam o componente `Janela` (foco preso e devolvido).
- **Formatação** pelo Prettier (`npm run format`); o `verify` recusa arquivos
  fora do padrão.

## 7. Guardado de propósito sem uso

| Item | Por quê |
|---|---|
| `public/membros/Bianca.jpg` | Foto ainda não ligada a nenhum membro |
