import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { querMenosMovimento } from "@/compartilhado/utils/movimento";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AnimatedNumber({ value }: { value: string }) {
  const num = parseInt(value, 10);
  const suffix = value.replace(/[0-9]/g, "");
  const [displayCount, setDisplayCount] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isNaN(num) || !spanRef.current) return;
    if (querMenosMovimento()) {
      setDisplayCount(num);
      return;
    }

    const proxy = { val: 0 };
    const tween = gsap.to(proxy, {
      val: num,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: spanRef.current,
        start: "top 90%",
        once: true,
      },
      onUpdate: () => {
        setDisplayCount(Math.floor(proxy.val));
      },
      onComplete: () => {
        setDisplayCount(num);
      },
    });

    return () => {
      tween.kill();
    };
  }, [num]);

  if (isNaN(num)) return <span>{value}</span>;

  return (
    <span ref={spanRef} className="tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {displayCount}
        {suffix}
      </span>
    </span>
  );
}
