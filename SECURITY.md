# Segurança — Clube de Ciências CECLOS

Este documento registra o que está implementado, o que **não pode** ser
implementado enquanto o site não tiver backend, e o caminho para resolver.

---

## O limite que define tudo

O site é um SPA **100% client-side**: React + Vite servido como arquivos
estáticos. Não existe servidor, banco de dados, sessão de servidor nem cookie.
Toda a persistência é `localStorage`, `sessionStorage` e `IndexedDB` no
navegador do próprio usuário.

> **Tudo que o navegador precisa para funcionar, o visitante pode ler.**
> Qualquer salt, hash ou regra embutida no bundle é pública.

O login do Painel Admin é verificado **no navegador**. A criptografia abaixo
deixa esse login o mais difícil possível de atacar por força bruta e impede a
falsificação de sessões, mas a proteção definitiva só existe com um servidor
(ver "Migração para backend").

---

## Criptografia implementada

Tudo usa a **Web Crypto API** nativa do navegador (a mesma usada por bancos e
pelo HTTPS), sem bibliotecas de terceiros. Código em `src/seguranca/crypto.ts`.

| Onde | Algoritmo | Detalhes |
|---|---|---|
| Token do Painel | **PBKDF2-HMAC-SHA-256** | 600.000 iterações (recomendação OWASP 2023), sal aleatório de 128 bits, saída de 256 bits |
| Comparação de hashes | Tempo constante | Não vaza, pelo tempo de resposta, quantos caracteres batem |
| Sessão do Painel | **AES-256-GCM** | IV aleatório de 96 bits por mensagem, tag de autenticação de 128 bits, dados autenticados (AAD) que amarram o texto cifrado ao seu propósito |
| Chave da sessão | **HKDF-SHA-256** | Uma chave-mestra por navegador deriva uma chave diferente para cada uso |
| Chave-mestra | Gerada no navegador | 256 bits aleatórios, guardada no IndexedDB como `CryptoKey` **não exportável**: o JavaScript consegue usá-la, mas nunca ler os bytes |
| Tokens novos | Gerador criptográfico | 10 caracteres de um alfabeto de 32 símbolos sem ambiguidade (sem `0/O`, `1/I/L`), ≈50 bits, sem viés de módulo |
| Arquivos do site | **Subresource Integrity (SHA-384)** | O build carimba o hash de cada `.js` e `.css` no `index.html`; o navegador recusa arquivo adulterado |

### Formato do hash

```
pbkdf2:600000:<sal em hex>:<hash em hex>
```

O separador é `:` porque o Vite expande `$` dentro do `.env`. Hashes antigos
(`pbkdf2$...` e SHA-256 puro) continuam sendo aceitos, e no primeiro login
válido o Painel troca o hash antigo pelo formato novo automaticamente.

### Sessão

A sessão é um JSON (`id` aleatório, impressão digital do hash do token,
emissão e expiração em 4 horas) cifrado com AES-256-GCM e guardado no
`sessionStorage`. Qualquer byte alterado invalida a sessão; trocar o token
invalida todas as sessões antigas.

---

## Outras proteções

| Item | Onde |
|---|---|
| Sanitização de HTML com **DOMPurify** na exibição do texto dos projetos | `src/seguranca/html.ts` |
| Limpeza de HTML e URLs na entrada (segunda camada) | `src/seguranca/validation.ts` |
| Bloqueio de `javascript:`, `vbscript:`, `data:text/html` em links | `src/seguranca/validation.ts` |
| Proteção contra prototype pollution (`__proto__`, `constructor`) | `src/seguranca/validation.ts` |
| Whitelist de campos no import de backup | `src/seguranca/validation.ts` |
| Limite de tentativas com bloqueio exponencial | `src/seguranca/rate-limit.ts` |
| Honeypot e tempo mínimo contra robôs | `src/seguranca/bot.ts` |
| Restrição de tamanho e tipo de upload | `src/seguranca/uploads.ts` |
| Cabeçalhos de segurança (CSP, HSTS, COOP, CORP...) | `vercel.json`, `public/_headers`, `public/.htaccess` |

### Cabeçalhos HTTP

Os três arquivos de hospedagem têm **os mesmos** cabeçalhos:

- `Content-Security-Policy` — só scripts do próprio site (`script-src 'self'`),
  nenhum atributo `on*=` (`script-src-attr 'none'`), nenhum plugin
  (`object-src 'none'`), iframes só do próprio site.
- `Strict-Transport-Security` — HTTPS obrigatório por 2 anos.
- `X-Frame-Options: SAMEORIGIN` e `frame-ancestors 'self'` — o site não pode
  ser embutido por terceiros, mas o **Mapa do Site** do Painel (que mostra o
  próprio site num iframe) continua funcionando.
- `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`,
  `Origin-Agent-Cluster`, `Referrer-Policy`, `Permissions-Policy`,
  `X-Content-Type-Options`.

---

## O que não é possível sem backend

| Item | Por quê |
|---|---|
| Autenticação no servidor | Não há servidor para validar credenciais |
| RLS no banco | Não há banco. O SQL está pronto em `supabase/schema.sql` |
| Cookies `HttpOnly` | Só um servidor emite cookies `HttpOnly` |
| Esconder variáveis `VITE_*` | O Vite as embute no bundle; elas saem do git, não do navegador |

Os dados de conteúdo (membros, projetos, textos) **não são cifrados** no
`localStorage` de propósito: é o mesmo conteúdo que o site mostra
publicamente.

### Painel Admin e visitantes

Pelo mesmo motivo, **o que se muda no Painel fica guardado no navegador onde
a mudança foi feita**: textos, membros, parceiros e a situação das "Áreas em
desenvolvimento". Os visitantes veem os valores que estão no código publicado
(`src/secoes/*/conteudo.ts`, `members.data.ts`, `padroes-do-painel.ts`). Para
uma mudança valer para todo mundo, ela precisa ir para o código e ser
publicada de novo, ou o Painel precisa gravar num servidor (o mesmo caminho
das estatísticas, `api/` + Redis).

---

## Estatísticas de acesso (`api/estatisticas.ts`)

A única parte com servidor. Detalhes de funcionamento no `README.md`.

| Proteção | Como |
|---|---|
| Leitura só para o admin | O painel envia o token mestre; a função confere com `VITE_MASTER_TOKEN_HASH` (PBKDF2 ou SHA-256 antigo), em tempo constante |
| Força bruta | 10 tokens errados bloqueiam a rede por 1 hora (429) |
| Registros falsos em massa | Mais de 120 eventos por hora da mesma rede são recusados; uma visita repetida não conta de novo |
| Entrada validada | Corpo de até 2 KB, ids com formato fixo, aparelho/origem/meio só de listas fechadas; o nome da cidade perde `<`, `>` e caracteres de controle |
| Privacidade | Nenhum endereço de internet é gravado (só um resumo SHA-256 com sal, que some em 1 hora, para o limite de tentativas); os 100 acessos recentes expiram em 90 dias; o navegador não envia nada com GPC / Do Not Track |
| Segredos do banco | `KV_REST_API_*` não têm prefixo `VITE_`, então nunca vão para o navegador |

O aviso de privacidade do site (Ajustes > Privacidade) descreve o que é contado.

---

## Migração para backend

1. Criar um projeto no Supabase.
2. Rodar `supabase/schema.sql` no SQL Editor (tabelas + RLS).
3. Promover o seu usuário a admin:
   ```sql
   update public.profiles set role = 'admin' where id = '<seu-uuid>';
   ```
4. Instalar `@supabase/supabase-js` e trocar o login do Painel por
   `supabase.auth.signInWithPassword`.
5. Migrar leituras e escritas do `localStorage` para as tabelas.

---

## Token do Painel

Gerar um token novo e as variáveis de ambiente:

```bash
npm run gerar-token
```

O comando mostra o token (guarde, ele não aparece de novo) e as linhas
`VITE_SECURITY_SALT` e `VITE_MASTER_TOKEN_HASH` para o `.env` ou para o painel
da hospedagem. Também é possível trocar o token em
**Painel Admin > Configurações & Backup**.

---

## Verificação

```bash
npm run verify   # lint + formatação + testes + build
npm run test:seguranca
```
