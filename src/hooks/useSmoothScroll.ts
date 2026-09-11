"use client";

import { useState, useEffect } from "react";
import { useScroll, useSpring } from "motion/react";

export function useSmoothScroll() {
  const { scrollY, scrollYProgress } = useScroll();
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest: number) => {
      setShowScrollTop(latest > 350);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollToSection = (elementId: string) => {
    if (typeof window !== "undefined") {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return {
    scaleX,
    showScrollTop,
    scrollToTop,
    scrollToSection,
  };
}
