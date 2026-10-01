import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

function integridadeDosRecursos(): Plugin {
  let config: ResolvedConfig;

  const hashDe = (conteudo: string | Uint8Array) =>
    "sha384-" + createHash("sha384").update(conteudo).digest("base64");

  return {
    name: "ceclos:integridade-sri",
    apply: "build",
    enforce: "post",
    configResolved(resolvida) {
      config = resolvida;
    },
    generateBundle: {
      order: "post",
      handler(_opcoes, bundle) {
        const html = bundle["index.html"];
        if (!html || html.type !== "asset") return;

        const conteudoDe = (url: string): string | Uint8Array | null => {
          const nome = url.replace(/^\//, "").split(/[?#]/)[0];
          const item = bundle[nome];
          if (item) return item.type === "chunk" ? item.code : item.source;
          const noPublico = path.join(config.publicDir, decodeURIComponent(nome));
          if (config.publicDir && existsSync(noPublico)) return readFileSync(noPublico);
          return null;
        };

        const fonte = String(html.source).replace(
          /<(script|link)\b([^>]*?)\s(src|href)="(\/[^"]+)"([^>]*)>/g,
          (
            tag: string,
            nomeDaTag: string,
            antes: string,
            atributo: string,
            url: string,
            depois: string
          ) => {
            if (/\sintegrity=/.test(tag)) return tag;
            if (nomeDaTag === "link" && !/rel="(?:stylesheet|modulepreload)"/.test(tag)) return tag;
            if (!/\.(?:js|mjs|css)(?:[?#]|$)/.test(url)) return tag;
            const conteudo = conteudoDe(url);
            if (conteudo === null) return tag;
            const origem = /\scrossorigin/.test(tag) ? "" : ' crossorigin="anonymous"';
            const fim = depois.replace(/\s*\/$/, "");
            return `<${nomeDaTag}${antes} ${atributo}="${url}"${fim} integrity="${hashDe(conteudo)}"${origem}>`;
          }
        );

        html.source = fonte;
      },
    },
  };
}

function enderecoDoSite(): string {
  const bruto =
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    (process.env.NETLIFY === "true" ? process.env.URL : "") ||
    "";
  if (!bruto.trim()) return "";
  const comProtocolo = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`;
  return comProtocolo.trim().replace(/\/+$/, "");
}

function previaDoLink(): Plugin {
  return {
    name: "ceclos:previa-do-link",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const site = enderecoDoSite();
        const comImagem = html.replace(
          /(<meta property="og:image" content=")(\/[^"]*)(")/,
          (_tudo, antes: string, caminho: string, fim: string) =>
            `${antes}${site}${encodeURI(decodeURI(caminho))}${fim}`
        );
        if (!site) return comImagem;
        return comImagem.replace(
          /(\s*)(<meta property="og:type"[^>]*>)/,
          (_tudo, recuo: string, tag: string) =>
            `${recuo}${tag}${recuo}<meta property="og:url" content="${site}/" />`
        );
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), integridadeDosRecursos(), previaDoLink()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5174,
  },
  preview: {
    port: 4174,
  },
  build: {
    sourcemap: false,
    minify: true,
    target: "es2022",
    chunkSizeWarningLimit: 1800,
  },
});
