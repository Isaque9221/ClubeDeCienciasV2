import { useMemo } from "react";
import { motion } from "framer-motion";

export function AmbientParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: ((i * 17) % 96) + 2,
      y: ((i * 23) % 90) + 5,
      size: (i % 3) + 1.5,
      delay: (i * 0.4) % 3,
      dur: 4 + (i % 3),
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#F59E0B]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 10px rgba(245, 158, 11, 0.4)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.6, 0.15],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
