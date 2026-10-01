import DOMPurify from "dompurify";
import { sanitizeHtml } from "./validation";

const TAGS_PROIBIDAS = [
  "style",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "iframe",
  "frame",
  "object",
  "embed",
  "svg",
  "math",
  "link",
  "meta",
  "base",
];

let ganchosInstalados = false;

function instalarGanchos() {
  if (ganchosInstalados) return;
  ganchosInstalados = true;
  DOMPurify.addHook("afterSanitizeAttributes", (no) => {
    if (no.tagName === "A") {
      const destino = no.getAttribute("href") || "";
      if (/^https?:\/\//i.test(destino)) {
        no.setAttribute("target", "_blank");
        no.setAttribute("rel", "noopener noreferrer nofollow");
      } else {
        no.removeAttribute("target");
      }
    }
    if (no.tagName === "IMG") {
      no.setAttribute("loading", "lazy");
      no.setAttribute("decoding", "async");
      no.setAttribute("referrerpolicy", "no-referrer");
    }
  });
}

export function purificarHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined" || !DOMPurify.isSupported) {
    return sanitizeHtml(html);
  }
  instalarGanchos();
  return DOMPurify.sanitize(sanitizeHtml(html), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: TAGS_PROIBIDAS,
    FORBID_ATTR: ["style", "srcset", "formaction", "xlink:href"],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#|\.{1,2}\/)/i,
  });
}
