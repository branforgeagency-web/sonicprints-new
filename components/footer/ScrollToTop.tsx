"use client";

import { useEffect, useRef } from "react";

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Round floating arrow fixed to the bottom-right; its ring fills with page scroll progress. */
export default function ScrollToTop() {
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    let ticking = false;

    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ring.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      className={`group fixed right-4 bottom-4 z-30 grid h-12 w-12 animate-[fab-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_0.4s_backwards] place-items-center rounded-full bg-ink text-cream shadow-[0_10px_30px_-10px_rgba(0,20,8,0.6)] ring-1 ring-cream/25 transition-[background-color,transform] duration-300 hover:bg-accent active:scale-90 motion-reduce:animate-none sm:right-6 sm:bottom-6 sm:h-14 sm:w-14`}
    >
      {/* Scroll progress ring */}
      <svg viewBox="0 0 48 48" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1.5} />
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="#bd5501"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          className="transition-[stroke] duration-300 group-hover:stroke-cream"
        />
      </svg>

      {/* Arrow rolls up and a fresh one rises in on hover */}
      <span aria-hidden="true" className="relative h-5 w-5 overflow-hidden">
        <span className={`flex flex-col transition-transform duration-500 ${EASE} group-hover:-translate-y-5`}>
          {[0, 1].map((k) => (
            <svg key={k} viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          ))}
        </span>
      </span>
    </button>
  );
}
