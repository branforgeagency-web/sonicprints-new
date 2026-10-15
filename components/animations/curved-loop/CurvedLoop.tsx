"use client";

import { useRef, useEffect, useState, useMemo, useId, type PointerEvent } from "react";
import "./CurvedLoop.css";

export interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: "left" | "right";
  interactive?: boolean;
  /** Y of the text line inside the SVG strip. Raise it to move the text down. */
  baseline?: number;
  /** Drive the marquee with page scroll: down moves toward `direction`, up reverses it. */
  scrollLinked?: boolean;
  /** Extra marquee pixels per pixel of page scroll when `scrollLinked` is on. */
  scrollFactor?: number;
  /** Height of the SVG strip in the same units as the 1440-wide text track (default 120). */
  stripHeight?: number;
}

const CurvedLoop = ({
  marqueeText = "",
  speed = 2,
  className,
  curveAmount = 0,
  direction = "left",
  interactive = true,
  baseline = 40,
  scrollLinked = false,
  scrollFactor = 0.6,
  stripHeight = 120,
}: CurvedLoopProps) => {
  const text = useMemo(() => {
    const hasTrailing = /\s| $/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, "") : marqueeText) + " ";
  }, [marqueeText]);

  const measureRef = useRef<SVGTextElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid}`;
  const pathD = `M-100,${baseline} Q500,${baseline + curveAmount} 1540,${baseline}`;

  const dragRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const lastXRef = useRef(0);
  const dirRef = useRef(direction);
  const velRef = useRef(0);

  const textLength = spacing;
  const totalText = textLength
    ? Array(Math.ceil(1800 / textLength) + 2)
        .fill(text)
        .join("")
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
  }, [text, className]);

  useEffect(() => {
    if (!spacing) return;
    if (textPathRef.current) {
      const initial = -spacing;
      textPathRef.current.setAttribute("startOffset", initial + "px");
      setOffset(initial);
    }
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready) return;
    let frame = 0;
    let lastScrollY = window.scrollY;
    let boost = 0;
    const step = () => {
      if (scrollLinked) {
        const dy = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        if (dy !== 0) {
          const opposite = direction === "left" ? "right" : "left";
          dirRef.current = dy > 0 ? direction : opposite;
        }
        // Ease the scroll push in and out so it surges with the scroll, then settles to `speed`.
        boost += (Math.abs(dy) * scrollFactor - boost) * 0.2;
      }
      if (!dragRef.current && textPathRef.current) {
        const amount = speed + boost;
        const delta = dirRef.current === "right" ? amount : -amount;
        const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
        let newOffset = currentOffset + delta;

        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;

        textPathRef.current.setAttribute("startOffset", newOffset + "px");
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    dragRef.current = true;
    setDragging(true);
    lastXRef.current = e.clientX;
    velRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;

    const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
    let newOffset = currentOffset + dx;

    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;

    textPathRef.current.setAttribute("startOffset", newOffset + "px");
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    setDragging(false);
    dirRef.current = velRef.current > 0 ? "right" : "left";
  };

  const cursorStyle = interactive ? (dragging ? "grabbing" : "grab") : "auto";

  return (
    <div
      className="curved-loop-jacket"
      style={{ visibility: ready ? "visible" : "hidden", cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg className="curved-loop-svg" viewBox={`0 0 1440 ${stripHeight}`} style={{ aspectRatio: `1440 / ${stripHeight}` }}>
        <text ref={measureRef} xmlSpace="preserve" style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}>
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text fontWeight="bold" xmlSpace="preserve" className={className}>
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={offset + "px"} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
