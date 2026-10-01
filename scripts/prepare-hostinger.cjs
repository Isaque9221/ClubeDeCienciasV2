/**
 * Clube de Ciências CECLOS — Preparador de Pacote para Hostinger
 *
 * Executado após o build para garantir que todos os arquivos necessários
 * para a Hostinger (public_html) estejam no lugar e prontos para publicação.
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const RAIS = path.resolve(__dirname, "..");
const DIST = path.join(RAIS, "dist");
const PUBLIC = path.join(RAIS, "public");

console.log("\n==================================================");
console.log("  Preparando pacote de deploy para a Hostinger");
console.log("==================================================\n");

// 1. Confere se o build foi executado
if (!fs.existsSync(DIST) || !fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("ERRO: A pasta dist/ não foi encontrada ou não contém index.html.");
  console.error("Execute primeiro: npm run build");
  process.exit(1);
}

// 2. Garante que .htaccess esteja presente em dist/
const htaccessDestino = path.join(DIST, ".htaccess");
const htaccessOrigem = path.join(PUBLIC, ".htaccess");
if (!fs.existsSync(htaccessDestino) && fs.existsSync(htaccessOrigem)) {
  fs.copyFileSync(htaccessOrigem, htaccessDestino);
  console.log("✓ Copiado .htaccess para dist/");
} else if (fs.existsSync(htaccessDestino)) {
  console.log("✓ .htaccess verificado em dist/");
} else {
  console.warn("! AVISO: .htaccess não encontrado.");
}

// 3. Garante que a API PHP esteja presente em dist/api/
const apiDir = path.join(DIST, "api");
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}
const phpOrigem = path.join(PUBLIC, "api", "estatisticas.php");
const phpDestino = path.join(apiDir, "estatisticas.php");
if (fs.existsSync(phpOrigem)) {
  fs.copyFileSync(phpOrigem, phpDestino);
  console.log("✓ Copiado api/estatisticas.php para dist/api/");
}

// 4. Verificação de integridade dos arquivos essenciais
const essenciais = [
  "index.html",
  ".htaccess",
  "manifest.webmanifest",
  "assets",
  "js/abertura.js",
  "js/esquema.js",
];

let todosPresentes = true;
for (const item of essenciais) {
  const caminho = path.join(DIST, item);
  if (!fs.existsSync(caminho)) {
    console.error(`✗ Faltando no build: ${item}`);
    todosPresentes = false;
  }
}

if (!todosPresentes) {
  console.error("\nERRO: Alguns arquivos essenciais estão faltando no build.");
  process.exit(1);
}

console.log("✓ Todos os arquivos essenciais estão presentes em dist/");

// 5. Gera arquivo ZIP para upload fácil no Gerenciador de Arquivos da Hostinger
const zipDestino = path.join(DIST, "hostinger-deploy.zip");
let zipCriado = false;

try {
  if (process.platform === "win32") {
    // Windows PowerShell Compress-Archive
    console.log("\nCompactando dist/ em hostinger-deploy.zip via PowerShell...");
    if (fs.existsSync(zipDestino)) fs.unlinkSync(zipDestino);
    const comando = `powershell -NoProfile -Command "Get-ChildItem -Force -Path '${DIST}\\*' -Exclude 'hostinger-deploy.zip' | Compress-Archive -DestinationPath '${zipDestino}' -Force"`;
    execSync(comando, { stdio: "ignore" });
    if (fs.existsSync(zipDestino)) {
      zipCriado = true;
      const stats = fs.statSync(zipDestino);
      const tamanhoMb = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✓ Pacote ZIP criado com sucesso: dist/hostinger-deploy.zip (${tamanhoMb} MB)`);
    }
  } else {
    // Linux / Mac tar ou zip
    try {
      execSync(`cd "${DIST}" && zip -r hostinger-deploy.zip . -x hostinger-deploy.zip`, {
        stdio: "ignore",
      });
      if (fs.existsSync(zipDestino)) zipCriado = true;
    } catch {
      // Tenta tar
      execSync(`cd "${DIST}" && tar -czf hostinger-deploy.zip --exclude=hostinger-deploy.zip *`, {
        stdio: "ignore",
      });
      if (fs.existsSync(zipDestino)) zipCriado = true;
    }
  }
} catch {
  console.warn(
    "! Não foi possível gerar o ZIP automaticamente (ferramenta de compactação indisponível)."
  );
}

console.log("\n--------------------------------------------------");
console.log("  INSTRUÇÕES DE PUBLICAÇÃO NA HOSTINGER");
console.log("--------------------------------------------------");
if (zipCriado) {
  console.log("1. Acesse o hPanel da Hostinger > Gerenciador de Arquivos.");
  console.log("2. Abra a pasta 'public_html'.");
  console.log("3. Envie o arquivo 'dist/hostinger-deploy.zip'.");
  console.log("4. Clique com botão direito no zip e escolha 'Extrair'.");
  console.log("5. Pronto! O site está no ar com todas as rotas e segurança.");
} else {
  console.log("1. Acesse o hPanel da Hostinger > Gerenciador de Arquivos.");
  console.log("2. Abra a pasta 'public_html'.");
  console.log("3. Envie todo o conteúdo de dentro da pasta 'dist/'.");
  console.log("4. Certifique-se de que o arquivo .htaccess foi copiado.");
  console.log("5. Pronto! O site está no ar.");
}
console.log("--------------------------------------------------\n");
