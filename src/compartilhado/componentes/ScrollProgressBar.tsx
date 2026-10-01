import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      data-nao-imprimir=""
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-200 origin-left z-50 shadow-[0_0_15px_rgba(250,204,21,0.8)] pointer-events-none"
    />
  );
}
