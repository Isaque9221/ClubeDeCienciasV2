import { useMemo, useRef, useState, type ReactNode } from "react";
import { Move } from "lucide-react";
import { useData, useModoDoMapa } from "@/compartilhado/hooks";
import { ajustarNaGrade, lerPosicoes } from "@/secoes/posicoes-livres";

interface ArrastavelProps {
  id: string;
  rotulo: string;
  dataSecao?: string;
  className?: string;
  children: ReactNode;
}

export function Arrastavel({ id, rotulo, dataSecao, className, children }: ArrastavelProps) {
  const { siteConfig } = useData();
  const {
    naPrevia,
    modoEdicao,
    grade,
    posicoesDeTeste,
    elementoSelecionado,
    avisarSelecao,
    avisarMovimento,
  } = useModoDoMapa();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  const posicoesSalvas = useMemo(
    () => lerPosicoes(siteConfig.elementPositions),
    [siteConfig.elementPositions]
  );
  const posicoesExperimentando = useMemo(
    () => (posicoesDeTeste !== null ? lerPosicoes(posicoesDeTeste) : null),
    [posicoesDeTeste]
  );

  const fonte =
    naPrevia && posicoesExperimentando !== null ? posicoesExperimentando : posicoesSalvas;
  const offset = fonte[id]?.windows ?? { x: 0, y: 0 };

  const selecionado = naPrevia && elementoSelecionado === id;
  const editavel = naPrevia && modoEdicao;

  const aoPressionar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!editavel) return;
    e.preventDefault();
    e.stopPropagation();

    const inicioX = e.clientX;
    const inicioY = e.clientY;
    const baseX = offset.x;
    const baseY = offset.y;
    let moveu = false;
    let atual = { x: baseX, y: baseY };

    const aoMover = (ev: PointerEvent) => {
      const dx = ev.clientX - inicioX;
      const dy = ev.clientY - inicioY;

      if (!moveu && Math.hypot(dx, dy) > 3) {
        moveu = true;
        setArrastando(true);
      }
      if (!moveu) return;

      let x = baseX + dx;
      let y = baseY + dy;
      if (grade.ativa) {
        x = ajustarNaGrade(x, grade.tamanho);
        y = ajustarNaGrade(y, grade.tamanho);
      }
      atual = { x, y };
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const aoSoltar = () => {
      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("pointerup", aoSoltar);
      setArrastando(false);
      if (moveu) {
        avisarMovimento(id, "windows", atual.x, atual.y);
        avisarSelecao(id);
      } else {
        avisarSelecao(id);
      }
    };

    window.addEventListener("pointermove", aoMover);
    window.addEventListener("pointerup", aoSoltar);
  };

  const aoClicarDuasVezes = () => {
    if (!editavel) return;
    avisarMovimento(id, "windows", 0, 0);
  };

  return (
    <div
      ref={wrapperRef}
      data-secao={dataSecao}
      data-arrastavel={id}
      className={className}
      onPointerDown={editavel ? aoPressionar : undefined}
      onClickCapture={
        editavel
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
            }
          : undefined
      }
      onDoubleClick={editavel ? aoClicarDuasVezes : undefined}
      onMouseEnter={editavel ? () => setHover(true) : undefined}
      onMouseLeave={editavel ? () => setHover(false) : undefined}
      style={{
        position: "relative",
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: arrastando ? "none" : "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: arrastando || selecionado ? 40 : undefined,
        cursor: editavel ? (arrastando ? "grabbing" : "grab") : undefined,
        outline:
          editavel && selecionado
            ? "2px solid #FACC15"
            : editavel && hover
              ? "2px dashed rgba(250,204,21,0.55)"
              : "none",
        outlineOffset: "4px",
        borderRadius: "0.5rem",
      }}
    >
      {children}

      {editavel && (hover || selecionado) && (
        <div
          className="pointer-events-none absolute -top-3 left-1 z-50 -translate-y-full select-none"
          style={{ transformOrigin: "bottom left" }}
        >
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-lg ${
              selecionado
                ? "bg-amber-400 text-black"
                : "bg-black/80 text-amber-300 border border-amber-400/40"
            }`}
          >
            <Move className="h-2.5 w-2.5" />
            {rotulo}
          </span>
        </div>
      )}
    </div>
  );
}
