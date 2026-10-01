import { TextoEmCodigo } from "./LongaExposicao";

export function SectionLabel({
  text,
  alinhamento = "centro",
  className = "",
}: {
  text: string;
  alinhamento?: "centro" | "esquerda";
  className?: string;
}) {
  return (
    <p
      className={`rotulo-mono ${alinhamento === "esquerda" ? "rotulo-mono--esquerda" : ""} ${className}`}
    >
      <span className="rotulo-mono__ponto" aria-hidden="true" />
      <TextoEmCodigo texto={text} className="rotulo-mono__texto" />
    </p>
  );
}
