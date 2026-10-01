import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  spinSize?: number;
  cornerLength?: number;
  borderWidth?: number;
  padding?: number;
  color?: string;
}

export function TargetCursor({
  targetSelector = 'button, a, input, textarea, select, [role="button"], [data-target], [data-cursor], .cursor-pointer',
  spinDuration = 6,
  spinSize = 32,
  cornerLength = 7,
  borderWidth = 2,
  padding = 6,
  color = "var(--cursor)",
}: TargetCursorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mouseRef = useRef({ x: -100, y: -100 });
  const currentPosRef = useRef({
    x: -100,
    y: -100,
    w: spinSize,
    h: spinSize,
    angle: 0,
    borderRadius: 8,
  });
  const targetRectRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
    borderRadius: number;
  } | null>(null);

  const animFrameIdRef = useRef<number | null>(null);

  const targetElRef = useRef<HTMLElement | null>(null);

  const soltar = useCallback(() => {
    targetElRef.current = null;
    targetRectRef.current = null;
    setIsLocked(false);
  }, []);

  const medirAlvo = useCallback(
    (el: HTMLElement, raio: number) => {
      const rect = el.getBoundingClientRect();
      targetRectRef.current = {
        x: rect.left - padding,
        y: rect.top - padding,
        w: rect.width + padding * 2,
        h: rect.height + padding * 2,
        borderRadius: raio,
      };
    },
    [padding]
  );

  const updateTargetElement = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const match = target?.closest(targetSelector) as HTMLElement | null;
      if (!match) {
        soltar();
        return;
      }
      if (match === targetElRef.current) return;

      const radius = parseFloat(window.getComputedStyle(match).borderRadius) || 8;
      targetElRef.current = match;
      medirAlvo(match, radius + 2);
      setIsLocked(true);
    },
    [targetSelector, soltar, medirAlvo]
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0
    ) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      setIsVisible(true);
      updateTargetElement(e);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleScroll = () => {
      if (!targetElRef.current) return;
      const el = document.elementFromPoint(
        mouseRef.current.x,
        mouseRef.current.y
      ) as HTMLElement | null;
      const match = el?.closest(targetSelector) as HTMLElement | null;
      if (!match) {
        soltar();
      } else if (match !== targetElRef.current) {
        const radius = parseFloat(window.getComputedStyle(match).borderRadius) || 8;
        targetElRef.current = match;
        medirAlvo(match, radius + 2);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    document.documentElement.classList.add("cursor-alvo");

    const semGiro = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const current = currentPosRef.current;
      const mouse = mouseRef.current;

      const alvo = targetElRef.current;
      if (alvo) {
        if (!alvo.isConnected || getComputedStyle(alvo).pointerEvents === "none") soltar();
        else medirAlvo(alvo, targetRectRef.current?.borderRadius ?? 10);
      }
      const targetRect = targetRectRef.current;

      if (targetRect) {
        const lerpFactor = 0.22;
        current.x += (targetRect.x - current.x) * lerpFactor;
        current.y += (targetRect.y - current.y) * lerpFactor;
        current.w += (targetRect.w - current.w) * lerpFactor;
        current.h += (targetRect.h - current.h) * lerpFactor;
        current.borderRadius += (targetRect.borderRadius - current.borderRadius) * lerpFactor;
        const reto = Math.round(current.angle / 180) * 180;
        current.angle += (reto - current.angle) * 0.35;
      } else {
        const targetX = mouse.x - spinSize / 2;
        const targetY = mouse.y - spinSize / 2;
        const lerpFactor = 0.28;

        current.x += (targetX - current.x) * lerpFactor;
        current.y += (targetY - current.y) * lerpFactor;
        current.w += (spinSize - current.w) * lerpFactor;
        current.h += (spinSize - current.h) * lerpFactor;
        current.borderRadius += (6 - current.borderRadius) * lerpFactor;

        const encolhendo = Math.abs(current.w - spinSize) > 4 || Math.abs(current.h - spinSize) > 4;

        if (spinDuration > 0 && !encolhendo && !semGiro) {
          const degreesPerSecond = 360 / spinDuration;
          current.angle = (current.angle + degreesPerSecond * delta) % 360;
        }
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) rotate(${current.angle}deg)`;
        containerRef.current.style.width = `${current.w}px`;
        containerRef.current.style.height = `${current.h}px`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.classList.remove("cursor-alvo");
    };
  }, [updateTargetElement, spinDuration, spinSize, targetSelector, soltar, medirAlvo]);

  if (!mounted || typeof window === "undefined" || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-cursor-alvo=""
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        zIndex: 2147483647,
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        ref={dotRef}
        className="fixed top-0 left-0 will-change-transform pointer-events-none transition-transform duration-75"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
          zIndex: 2147483647,
          pointerEvents: "none",
        }}
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isClicked
              ? "w-2 h-2 bg-amber-300 shadow-[0_0_12px_rgba(250,204,21,0.9)]"
              : isLocked
                ? "w-1.5 h-1.5 bg-[var(--cursor)] shadow-[0_0_8px_rgba(254,240,138,0.8)]"
                : "w-1.5 h-1.5 bg-[var(--cursor)] shadow-[0_0_6px_rgba(250,204,21,0.6)]"
          }`}
        />
      </div>

      <div
        ref={containerRef}
        className={`fixed top-0 left-0 will-change-transform pointer-events-none transition-[box-shadow,opacity] duration-200 ${
          isLocked
            ? "shadow-[0_0_20px_rgba(250,204,21,0.2),inset_0_0_15px_rgba(250,204,21,0.05)] bg-amber-400/[0.03]"
            : ""
        }`}
        style={{
          width: `${spinSize}px`,
          height: `${spinSize}px`,
          transform: "translate3d(-100px, -100px, 0)",
          zIndex: 2147483647,
          pointerEvents: "none",
        }}
      >
        <span
          className="absolute top-0 left-0 transition-colors duration-200"
          style={{
            width: `${cornerLength}px`,
            height: `${cornerLength}px`,
            borderTop: `${borderWidth}px solid ${color}`,
            borderLeft: `${borderWidth}px solid ${color}`,
            borderTopLeftRadius: isLocked ? "4px" : "1px",
            filter: "drop-shadow(0 0 3px var(--cursor-halo))",
          }}
        />

        <span
          className="absolute top-0 right-0 transition-colors duration-200"
          style={{
            width: `${cornerLength}px`,
            height: `${cornerLength}px`,
            borderTop: `${borderWidth}px solid ${color}`,
            borderRight: `${borderWidth}px solid ${color}`,
            borderTopRightRadius: isLocked ? "4px" : "1px",
            filter: "drop-shadow(0 0 3px var(--cursor-halo))",
          }}
        />

        <span
          className="absolute bottom-0 left-0 transition-colors duration-200"
          style={{
            width: `${cornerLength}px`,
            height: `${cornerLength}px`,
            borderBottom: `${borderWidth}px solid ${color}`,
            borderLeft: `${borderWidth}px solid ${color}`,
            borderBottomLeftRadius: isLocked ? "4px" : "1px",
            filter: "drop-shadow(0 0 3px var(--cursor-halo))",
          }}
        />

        <span
          className="absolute bottom-0 right-0 transition-colors duration-200"
          style={{
            width: `${cornerLength}px`,
            height: `${cornerLength}px`,
            borderBottom: `${borderWidth}px solid ${color}`,
            borderRight: `${borderWidth}px solid ${color}`,
            borderBottomRightRadius: isLocked ? "4px" : "1px",
            filter: "drop-shadow(0 0 3px var(--cursor-halo))",
          }}
        />

        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-1.5 h-[1px]" style={{ backgroundColor: color }} />
            <div className="h-1.5 w-[1px] absolute" style={{ backgroundColor: color }} />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
