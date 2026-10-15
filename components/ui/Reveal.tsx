"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useReveal } from "@/components/hooks/useReveal";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

interface Props {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms before this element animates in. */
  delay?: number;
  /** Starting offset in px. */
  y?: number;
}

/** Fades and lifts its children in the first time they scroll into view. */
export default function Reveal({ children, as: Tag = "div", className = "", delay = 0, y = 32 }: Props) {
  const [ref, shown] = useReveal<HTMLElement>(0.15);
  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    transform: shown ? "none" : `translateY(${y}px)`,
  };
  return (
    <Tag
      ref={ref}
      style={style}
      className={`transition-[transform,opacity] duration-1000 motion-reduce:transition-none ${EASE} ${
        shown ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
