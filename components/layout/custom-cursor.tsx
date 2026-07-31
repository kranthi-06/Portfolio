"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useIsMobile } from "@/hooks/use-media-query";

/**
 * Custom animated cursor: dot + ring that scale on hoverable elements.
 * Uses event delegation to avoid memory leaks from repeated listener registration.
 */
export function CustomCursor() {
  const isMobile = useIsMobile();
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 500, damping: 28 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  const ringConfig = { stiffness: 150, damping: 20 };
  const ringX = useSpring(cursorX, ringConfig);
  const ringY = useSpring(cursorY, ringConfig);

  // Check if a given element is interactive (hoverable)
  const isInteractive = useCallback((el: EventTarget | null): boolean => {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    if (["a", "button", "input", "textarea", "select"].includes(tag)) return true;
    if (el.getAttribute("role") === "button") return true;
    if (el.hasAttribute("data-cursor-hover")) return true;
    // Walk up to find interactive parent (max 5 levels)
    if (el.parentElement && el !== document.body) {
      return isInteractive(el.parentElement);
    }
    return false;
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Event delegation for hover detection (no memory leaks)
    const handleMouseOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) setIsHovering(true);
    };
    const handleMouseOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) setIsHovering(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isMobile, cursorX, cursorY, isInteractive]);

  if (isMobile) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-primary z-[9999] pointer-events-none mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          scale: isClicking ? 0.5 : isHovering ? 0.5 : 1,
        }}
        aria-hidden="true"
      />

      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-primary/50 z-[9998] pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          scale: isClicking ? 0.8 : 1,
          opacity: isHovering ? 0.8 : 0.4,
        }}
        aria-hidden="true"
      />
    </>
  );
}
