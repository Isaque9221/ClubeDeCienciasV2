import { useRef, type CSSProperties } from "react";
import { useInView } from "framer-motion";

interface GsapTextRevealProps {
  text: string;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  type?: "words" | "chars" | "lines" | "mask-up";
  stagger?: number;
  delay?: number;
  duration?: number;
  highlightWords?: string[];
  highlightClass?: string;
  glowOnView?: boolean;
}

export function GsapTextReveal({
  text,
  className = "",
  tag = "h2",
  type = "words",
  stagger = 0.04,
  delay = 0,
  duration = 0.8,
  highlightWords = [],
  highlightClass = "golden-metallic-text font-black",
  glowOnView = false,
}: GsapTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apareceu = useInView(containerRef, {
    once: true,
    margin: "0px 0px -12% 0px",
  });

  const safeText = typeof text === "string" ? text : String(text ?? "");
  const words = safeText.split(" ").filter(Boolean);

  const safeHighlights = (highlightWords || []).filter(
    (hw): hw is string => typeof hw === "string" && hw.trim().length > 0
  );

  const checkHighlight = (word: string) => {
    const clean = word.toLowerCase();
    return safeHighlights.some((hw) => clean.includes(hw.toLowerCase()));
  };

  const naFila = (i: number) => ({ "--i": i }) as CSSProperties;

  const pintar = (conteudo: string, destaque: boolean) =>
    destaque ? <span className={`inline-block ${highlightClass}`}>{conteudo}</span> : conteudo;

  const comEspacos = (pedacos: React.ReactNode[]) =>
    pedacos.flatMap((pedaco, i) => (i === 0 ? [pedaco] : [" ", pedaco]));

  const renderContent = () => {
    if (words.length === 0) return null;

    if (type === "chars") {
      let fila = 0;
      return comEspacos(
        words.map((word, wIdx) => {
          const isHighlight = checkHighlight(word);

          return (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, cIdx) => (
                <span key={cIdx} className="revelar-unidade inline-block" style={naFila(fila++)}>
                  {pintar(char, isHighlight)}
                </span>
              ))}
            </span>
          );
        })
      );
    }

    if (type === "mask-up") {
      return comEspacos(
        words.map((word, idx) => (
          <span key={idx} className="revelar-mascara">
            <span className="revelar-unidade inline-block" style={naFila(idx)}>
              {pintar(word, checkHighlight(word))}
            </span>
          </span>
        ))
      );
    }

    return comEspacos(
      words.map((word, idx) => (
        <span key={idx} className="revelar-unidade inline-block" style={naFila(idx)}>
          {pintar(word, checkHighlight(word))}
        </span>
      ))
    );
  };

  const TagName: React.ElementType = tag;

  return (
    <TagName
      ref={containerRef}
      data-tipo={type}
      data-visivel={apareceu ? "" : undefined}
      style={
        {
          "--revelar-passo": `${stagger}s`,
          "--revelar-atraso": `${delay}s`,
          "--revelar-duracao": `${duration}s`,
        } as CSSProperties
      }
      className={`revelar-texto relative ${className} ${
        glowOnView && apareceu ? "text-shadow-gold" : ""
      }`}
    >
      {renderContent()}
    </TagName>
  );
}
