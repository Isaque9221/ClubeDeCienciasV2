# Guia Completo de Deployment na Hostinger — Clube de Ciências CECLOS

Este guia reúne todas as diretrizes, configurações e métodos para publicar o site do **Clube de Ciências CECLOS** na **Hostinger**, seja em planos de **Hospedagem Compartilhada / Cloud (LiteSpeed)**, **Aplicações Node.js (hPanel)** ou **VPS**.

---

## 1. Visão Geral da Estrutura para Hostinger

O projeto foi organizado para atender nativamente aos padrões da infraestrutura da Hostinger:

```
Clube De Ciencias/
├── public/
│   ├── .htaccess ................. Configuração LiteSpeed/Apache (SPA routing, HTTPS, cache, segurança)
│   ├── api/estatisticas.php ...... API de estatísticas nativa em PHP 8.x (Upstash Redis)
│   └── ... (sons, membros, emblemas, js)
├── .github/workflows/
│   └── deploy-hostinger.yml ...... Automação de CI/CD via GitHub Actions e FTPS
├── scripts/
│   └── prepare-hostinger.cjs ..... Script que valida e gera dist/hostinger-deploy.zip
├── server.cjs .................... Servidor de produção Node.js nativo (para hPanel Node.js ou VPS)
├── dist/ ......................... Pasta gerada pelo build pronta para a public_html/
└── package.json .................. Inclui scripts "build:hostinger" e "start"
```

### Diretrizes Atendidas:
1. **Pasta de Publicação (`public_html`):** Todo o conteúdo de `dist/` vai diretamente para a pasta `public_html` da sua hospedagem.
2. **Servidor LiteSpeed / Apache com `.htaccess`:**
   - **Roteamento SPA:** Qualquer rota interna (`/membros`, `/projetos`, `/trajetoria`) redireciona silenciosamente para `index.html` sem erro 404.
   - **Forçar HTTPS:** Redirecionamento 301 automático compatível com o proxy de SSL da Hostinger (`%{HTTP:X-Forwarded-Proto}`).
   - **MIME Types modernos:** Suporte explícito a `.webmanifest`, `.mjs`, `.woff2`, `.svg` e áudio `.m4a`.
   - **Compressão GZIP / Deflate:** Ativa para todos os formatos de texto, estilos, scripts e fontes.
   - **Cache Inteligente:** 1 ano imutável para assets versionados (`/assets/*`), e `no-cache, must-revalidate` para `index.html`, scripts de abertura e manifest.
   - **Cabeçalhos de Segurança:** CSP estrita, HSTS de 2 anos, X-Frame-Options, X-Content-Type-Options: nosniff e Permissions-Policy.
   - **Proteção de Arquivos:** Bloqueio total a `.env`, `.git`, `.htaccess`, arquivos JSON e logs.
3. **Estatísticas Nativas na Hostinger:**
   - Além do handler da Vercel (`api/estatisticas.ts`), o projeto inclui `public/api/estatisticas.php` que roda no PHP 8.x da Hostinger e se conecta diretamente ao Upstash Redis. O painel e o registro de visitas funcionam 100% na Hostinger.
4. **Deploy Prático:**
   - Comando `npm run build:hostinger` que compila o site, valida arquivos e gera `dist/hostinger-deploy.zip` pronto para envio.

---

## 2. Métodos de Publicação

Escolha o método mais adequado ao seu fluxo de trabalho:

### Método 1: Upload Manual pelo Gerenciador de Arquivos (Recomendado e Mais Rápido)

Este método funciona em **100% dos planos da Hostinger** (Single, Premium, Business, Cloud).

#### Passo a Passo:
1. No seu computador, gere o pacote de produção:
   ```bash
   npm run build:hostinger
   ```
   *O comando criará o arquivo `dist/hostinger-deploy.zip` (com todos os arquivos, mídias e `.htaccess`).*
2. Acesse o **hPanel** da Hostinger ([hpanel.hostinger.com](https://hpanel.hostinger.com)).
3. Vá em **Sites** > Selecione seu domínio > **Gerenciador de Arquivos** (File Manager).
4. Abra a pasta **`public_html`**.
   - *Se houver arquivos padrão da Hostinger (como `default.php`), pode apagá-los.*
5. Clique no botão de **Upload (Enviar)** no canto superior direito e selecione o arquivo **`dist/hostinger-deploy.zip`**.
6. Após o envio, clique com o botão direito sobre o arquivo `hostinger-deploy.zip` e escolha **Extrair (Extract)**.
   - Como destino da extração, digite apenas `.` ou mantenha a pasta atual (`public_html`).
7. Exclua o arquivo `hostinger-deploy.zip` da hospedagem para liberar espaço.
8. **Pronto!** O site estará imediatamente no ar.

---

### Método 2: Deploy Automático com GitHub Actions (CI/CD Contínuo)

Com este método, a cada `git push` na branch `main`, o GitHub executa os testes, gera o build e publica na Hostinger automaticamente via FTPS.

#### Passo a Passo:
1. No hPanel da Hostinger, vá em **Avançado** > **Contas FTP**.
2. Anote os dados de acesso:
   - **Host / Servidor FTP** (ex.: `ftp.seudominio.com.br` ou o IP do servidor).
   - **Nome de Usuário FTP**.
   - **Senha do FTP** (ou crie uma nova senha).
3. No seu repositório no **GitHub**, vá em **Settings** > **Secrets and variables** > **Actions**.
4. Crie os seguintes segredos (**New repository secret**):
   - `HOSTINGER_FTP_SERVER`: O endereço do servidor FTP da Hostinger.
   - `HOSTINGER_FTP_USERNAME`: O seu usuário FTP.
   - `HOSTINGER_FTP_PASSWORD`: A senha da conta FTP.
   - *(Opcional)* `VITE_SECURITY_SALT`: Sal de segurança gerado por `npm run gerar-token`.
   - *(Opcional)* `VITE_MASTER_TOKEN_HASH`: Hash do token do Painel gerado por `npm run gerar-token`.
   - *(Opcional)* `VITE_SITE_URL`: Endereço completo do seu site (ex.: `https://clubececlos.com.br`).
5. Envie o código para o GitHub:
   ```bash
   git push origin main
   ```
6. A aba **Actions** no GitHub executará o fluxo `.github/workflows/deploy-hostinger.yml` e enviará os arquivos para `public_html/`.

---

### Método 3: Deploy via Git no hPanel da Hostinger

Se você utiliza o recurso de Git integrado no hPanel:
1. No hPanel, vá em **Avançado** > **Git**.
2. Conecte o repositório do GitHub e a branch `main`.
3. Defina a pasta de destino como `public_html`.
4. Configure o Webhook do GitHub para atualizações automáticas.
5. *Nota:* Na hospedagem compartilhada sem SSH, o build de produção deve ser commitado ou gerado previamente via CI/CD.

---

### Método 4: Aplicação Node.js na Hostinger (Planos Business / Cloud / VPS)

Se você assina um plano com suporte a **Node.js Web App** no hPanel:
1. No hPanel, vá em **Avançado** > **Node.js**.
2. Clique em **Criar Aplicação Node.js**:
   - **Versão do Node.js:** Escolha **Node 22** (ou 20).
   - **Diretório da Aplicação:** pasta do projeto (ex.: `public_html` ou uma pasta separada).
   - **Arquivo de Inicialização:** digite `server.cjs`.
3. Em **Variáveis de Ambiente**, cadastre:
   - `NODE_ENV=production`
   - `VITE_SECURITY_SALT` e `VITE_MASTER_TOKEN_HASH`
   - `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (se usar estatísticas)
4. Execute `npm install --omit=dev` e inicie a aplicação pelo painel.
5. O `server.cjs` servirá os arquivos estáticos e responderá à API nativamente.

---

## 3. Configuração do Domínio e SSL Grátis (Let's Encrypt)

Para que o cadeado de segurança (HTTPS) e os cabeçalhos funcionem perfeitamente:
1. No hPanel, vá em **Segurança** > **SSL**.
2. Localize seu domínio e verifique se o **Certificado Let's Encrypt** está com status **Ativo**. Se não estiver, clique em **Instalar SSL Grátis**.
3. Ative a opção **Forçar HTTPS** no hPanel (embora o nosso `.htaccess` já faça isso automaticamente com regra 301).
4. Verifique se o **DNS** do seu domínio aponta para os Nameservers da Hostinger:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`

---

## 4. Ativação das Estatísticas com Upstash Redis na Hostinger

As estatísticas de acesso e compartilhamento do site utilizam um banco Redis da **Upstash** (plano gratuito de 10.000 requisições/dia).

Para que o contador funcione na Hostinger (via PHP ou Node.js):
1. Crie uma conta gratuita em [upstash.com](https://upstash.com) e crie um banco Redis (região São Paulo / `sa-east-1` ou US East).
2. Na página do banco no Upstash, copie a **REST URL** e o **REST Token** (em *UPSTASH_REDIS_REST_URL* e *UPSTASH_REDIS_REST_TOKEN*).
3. Na pasta `public_html` da Hostinger, crie um arquivo `.env` (ou edite o existente) com o seguinte conteúdo:
   ```env
   UPSTASH_REDIS_REST_URL="https://seu-banco.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="seu_token_aqui"
   VITE_MASTER_TOKEN_HASH="pbkdf2:600000:sal:hash_gerado_pelo_npm_run_gerar_token"
   VITE_SECURITY_SALT="seu_sal_de_seguranca"
   ```
4. O arquivo `public/api/estatisticas.php` lerá essas credenciais com segurança. O `.htaccess` bloqueia qualquer tentativa de leitura externa do `.env`.

---

## 5. Checklist Pré e Pós-Deploy

### Antes de publicar:
- [x] Rodou `npm run verify` localmente (lint, formatação, testes e build passando 100%).
- [x] Gerou o token do Painel Admin com `npm run gerar-token`.
- [x] Executou `npm run build:hostinger`.

### Depois de publicar na Hostinger:
- [x] O site abre com `https://` e cadeado verde.
- [x] A tela de abertura (estrelas e música) carrega sem erros no console.
- [x] Navegar diretamente para `/membros` ou `/projetos` e recarregar a página (F5) não dá erro 404.
- [x] O Painel Admin abre com `Ctrl + Shift + A`.
- [x] Em **Painel Admin > Estatísticas de Acesso**, as visitas são exibidas normalmente.

---

## 6. Resolução de Dúvidas e Problemas Frequentes

| Situação | Causa provável | Solução |
|---|---|---|
| **Erro 404 ao atualizar páginas internas** | Falta o arquivo `.htaccess` na raiz de `public_html` | No Gerenciador de Arquivos da Hostinger, ative "Mostrar arquivos ocultos (dotfiles)" e confirme se o `.htaccess` está presente. |
| **Site não atualiza após novo deploy** | Cache do navegador ou LiteSpeed Cache da Hostinger | Pressione `Ctrl + F5` no navegador. No hPanel da Hostinger, vá em **Avançado > LiteSpeed** e clique em **Limpar Cache (Purge All)**. |
| **Mídia / Sons não tocam** | Arquivos grandes não foram enviados por limite de timeout | Utilize o `hostinger-deploy.zip` ou envie via FTPS, pois a transferência direta por FTP evita timeout de envio HTTP. |
| **"Estatísticas não configuradas" no painel** | Variáveis do Upstash Redis ausentes no `.env` | Crie o `.env` na raiz da `public_html` com as credenciais do Upstash Redis e o hash do token mestre. |
| **Imagens ou fontes não aparecem** | Diferença de maiúsculas/minúsculas no Linux da Hostinger | O servidor da Hostinger é Linux (sensível a maiúsculas). O código sempre deve referenciar exatamente a mesma grafia do arquivo. |
