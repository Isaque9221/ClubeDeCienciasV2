/**
 * Clube de Ciências CECLOS — Servidor de Produção Node.js (Hostinger)
 *
 * Utilizado para hospedagem com suporte a Node.js na Hostinger
 * (planos Business, Cloud, VPS ou Hostinger Node.js Application no hPanel).
 *
 * Características:
 * - Zero dependências externas (utiliza apenas módulos nativos do Node.js).
 * - Serve arquivos estáticos (dist/) com compressão Gzip/Deflate.
 * - Suporta roteamento SPA (Single Page Application - fallback para index.html).
 * - Aplica todos os cabeçalhos de segurança (CSP, HSTS, X-Frame-Options, etc.).
 * - Trata a rota de API (/api/estatisticas) nativamente com Upstash Redis.
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

// Determina o diretório dos arquivos compilados
const RAIS_DIST = fs.existsSync(path.join(__dirname, "dist", "index.html"))
  ? path.join(__dirname, "dist")
  : fs.existsSync(path.join(__dirname, "index.html"))
    ? __dirname
    : path.join(__dirname, "dist");

// Tipos MIME comuns
const TIPOS_MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

// Cabeçalhos de segurança padrão
const CABECALHOS_SEGURANCA = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; frame-src 'self'; form-action 'self'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' data: blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(), camera=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "X-DNS-Prefetch-Control": "off",
  "X-Permitted-Cross-Domain-Policies": "none",
};

// Envia resposta com compressão e cabeçalhos de segurança
function enviarArquivo(req, res, caminhoArquivo, status = 200) {
  fs.stat(caminhoArquivo, (erro, stats) => {
    if (erro || !stats.isFile()) {
      return enviarSpaFallback(req, res);
    }

    const extensao = path.extname(caminhoArquivo).toLowerCase();
    const tipo = TIPOS_MIME[extensao] || "application/octet-stream";

    const cabecalhos = {
      ...CABECALHOS_SEGURANCA,
      "Content-Type": tipo,
    };

    // Política de cache
    if (caminhoArquivo.includes(path.sep + "assets" + path.sep)) {
      cabecalhos["Cache-Control"] = "public, max-age=31536000, immutable";
    } else if (
      extensao === ".html" ||
      extensao === ".webmanifest" ||
      path.basename(caminhoArquivo) === "abertura.js" ||
      path.basename(caminhoArquivo) === "esquema.js"
    ) {
      cabecalhos["Cache-Control"] = "no-cache, no-store, must-revalidate";
      cabecalhos["Pragma"] = "no-cache";
      cabecalhos["Expires"] = "0";
    } else {
      cabecalhos["Cache-Control"] = "public, max-age=2592000"; // 30 dias
    }

    // Suporte a compressão
    const acceptEncoding = req.headers["accept-encoding"] || "";
    const deveComprimir = /text|javascript|json|xml|svg/i.test(tipo);

    if (deveComprimir && /\bgzip\b/.test(acceptEncoding)) {
      cabecalhos["Content-Encoding"] = "gzip";
      res.writeHead(status, cabecalhos);
      fs.createReadStream(caminhoArquivo).pipe(zlib.createGzip()).pipe(res);
    } else if (deveComprimir && /\bdeflate\b/.test(acceptEncoding)) {
      cabecalhos["Content-Encoding"] = "deflate";
      res.writeHead(status, cabecalhos);
      fs.createReadStream(caminhoArquivo).pipe(zlib.createDeflate()).pipe(res);
    } else {
      cabecalhos["Content-Length"] = stats.size;
      res.writeHead(status, cabecalhos);
      fs.createReadStream(caminhoArquivo).pipe(res);
    }
  });
}

function enviarSpaFallback(req, res) {
  const indexHtml = path.join(RAIS_DIST, "index.html");
  if (fs.existsSync(indexHtml)) {
    return enviarArquivo(req, res, indexHtml, 200);
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Site em construção. Arquivo index.html não encontrado no build.");
}

// Servidor HTTP
const servidor = http.createServer((req, res) => {
  // Normaliza a URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let caminhoUrl = decodeURIComponent(parsedUrl.pathname);

  // Redirecionamento e segurança: bloqueia arquivos ocultos ou confidenciais
  if (/(?:^\/|\/)\.(?!well-known)/.test(caminhoUrl) || /package\.json|tsconfig/i.test(caminhoUrl)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Acesso negado.");
  }

  // Se a rota for a API de estatísticas
  if (caminhoUrl === "/api/estatisticas" || caminhoUrl === "/api/estatisticas/") {
    // Tenta delegar ao handler de estatísticas se jiti/ts estiver disponível
    try {
      const { createRequire } = require("node:module");
      const jiti = require("jiti")(__filename);
      const apiEstatisticas = jiti("./api/estatisticas.ts");

      // Converte para Web Request e executa
      const buffers = [];
      req.on("data", (chunk) => buffers.push(chunk));
      req.on("end", async () => {
        try {
          const body = Buffer.concat(buffers);
          const fullUrl = `http://${req.headers.host || "localhost"}${req.url}`;
          const webReq = new Request(fullUrl, {
            method: req.method,
            headers: req.headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
          });

          let webRes;
          if (req.method === "GET") {
            webRes = await apiEstatisticas.GET(webReq);
          } else if (req.method === "POST") {
            webRes = await apiEstatisticas.POST(webReq);
          } else {
            res.writeHead(405);
            return res.end();
          }

          const resHeaders = {};
          webRes.headers.forEach((v, k) => {
            resHeaders[k] = v;
          });
          res.writeHead(webRes.status, resHeaders);
          const resBody = Buffer.from(await webRes.arrayBuffer());
          res.end(resBody);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ erro: "interno" }));
        }
      });
      return;
    } catch {
      // Se não conseguiu carregar o handler de estatísticas, responde 503
      res.writeHead(503, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ erro: "indisponivel" }));
    }
  }

  // Trata arquivo estático
  let arquivoAlvo = path.join(RAIS_DIST, caminhoUrl);

  // Se o caminho terminar com '/', procura index.html dentro da subpasta
  if (caminhoUrl.endsWith("/")) {
    arquivoAlvo = path.join(arquivoAlvo, "index.html");
  }

  fs.stat(arquivoAlvo, (err, stats) => {
    if (!err && stats.isFile()) {
      return enviarArquivo(req, res, arquivoAlvo);
    }
    if (!err && stats.isDirectory()) {
      const subIndex = path.join(arquivoAlvo, "index.html");
      if (fs.existsSync(subIndex)) {
        return enviarArquivo(req, res, subIndex);
      }
    }
    // Fallback SPA
    enviarSpaFallback(req, res);
  });
});

servidor.listen(PORT, HOST, () => {
  console.log(`[Hostinger Node.js] Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`[Hostinger Node.js] Servindo pasta: ${RAIS_DIST}`);
});
