"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/products";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface StackCard {
  number: string;
  kicker: string;
  title: string;
  description: string;
  /** Where clicking the card goes. */
  href: string;
  cta: string;
  background: string;
  color: string;
}

/** Card colours rotate through the brand palette: ink, cream, accent. */
const PALETTE = [
  { background: "#001408", color: "#f7f4ee" },
  { background: "#f7f4ee", color: "#001408" },
  { background: "#bd5501", color: "#f7f4ee" },
];

export const CARDS: StackCard[] = CATEGORIES.map((c, i) => ({
  number: c.number,
  kicker: `Category ${c.number} — ${c.products.length} products`,
  title: c.name,
  description: c.description,
  href: `/categories/${c.slug}`,
  cta: `View ${c.products.length} products`,
  ...PALETTE[i % PALETTE.length],
}));

const HERO = {
  lines: ["Print", "Without", "Limits"],
  subtitle: `${CATEGORIES.length} categories, ${PRODUCTS.length}+ products — everything your brand needs, printed on anything you need.`,
  background: "#bd5501",
};

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

/** Scroll units: a short hold on the hero, one unit per card, a short hold on the last card. */
const HOLD_START = 0.2;
const HOLD_END = 0.3;
const TIMELINE = HOLD_START + CARDS.length + HOLD_END;
/** Page scroll (in vh) spent on each timeline unit — keeps pacing the same however many cards there are. */
const VH_PER_UNIT = 100;
const SCENE_HEIGHT = `${100 + TIMELINE * VH_PER_UNIT}vh`;
/** How quickly the drawn progress catches up with the scroll position (per second). */
const LERP_RATE = 9;

const ENTER = {
  offsetY: 1.25, // × viewport height below the stage
  offsetX: 0.08, // × viewport width to the right (diagonal entry)
  rotate: -7, // deg
  scale: 1.05,
  blur: 3, // px
  opacity: 0.35,
};

const FONT_STACK = "var(--font-sans)";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 0 → 1 entry progress of card `i` for a scene progress `p` (0 → 1). */
const cardProgress = (p: number, i: number) => clamp(p * TIMELINE - HOLD_START - i, 0, 1);

/** Steps: 0 = hero, 1..CARDS.length = that card fully in place. */
const LAST_STEP = CARDS.length;
const stepAt = (p: number) => clamp(Math.round(p * TIMELINE - HOLD_START), 0, LAST_STEP);
const pad2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Navigation rail                                                     */
/* ------------------------------------------------------------------ */

type RailIcon = "first" | "prev" | "next" | "last";

const ICON_PATHS: Record<RailIcon, string> = {
  first: "M6 15l6-6 6 6M6 6h12",
  prev: "M6 15l6-6 6 6",
  next: "M6 9l6 6 6-6",
  last: "M6 9l6 6 6-6M6 18h12",
};

function RailButton({
  icon,
  label,
  disabled,
  onClick,
  className = "",
}: {
  icon: RailIcon;
  label: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  const nudge = icon === "first" || icon === "prev" ? "group-hover:-translate-y-0.5" : "group-hover:translate-y-0.5";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`group relative h-10 w-10 place-items-center overflow-hidden rounded-full border border-current/35 backdrop-blur-sm transition-[opacity,transform,border-color] duration-300 enabled:hover:border-current enabled:active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 md:h-11 md:w-11 ${className || "grid"}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 scale-0 rounded-full bg-current opacity-15 transition-transform duration-300 ease-out group-enabled:group-hover:scale-100"
      />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`relative h-4 w-4 transition-transform duration-300 ease-out md:h-[18px] md:w-[18px] ${disabled ? "" : nudge}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ICON_PATHS[icon]} />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function StackedCards() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [step, setStep] = useState(0);

  /** Smooth-scroll the page so `target` (0 = hero) is the card in place. */
  const goTo = (target: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const s = clamp(target, 0, LAST_STEP);
    const rect = scene.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    const units = s === 0 ? 0 : HOLD_START + s;
    const top = rect.top + window.scrollY + (units / TIMELINE) * travel;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  useEffect(() => {
    const scene = sceneRef.current;
    const hero = heroRef.current;
    const subtitle = subtitleRef.current;
    if (!scene || !hero || !subtitle) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let target = 0;
    let current = 0;
    let raf = 0;
    let last = performance.now();

    const readTarget = () => {
      const rect = scene.getBoundingClientRect();
      const travel = rect.height - vh;
      target = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
    };

    const render = (p: number) => {
      // Hero settles back slightly while the first card covers it.
      const first = easeInOutCubic(cardProgress(p, 0));
      hero.style.transform = reduced ? "" : `scale(${1 - 0.06 * first})`;
      subtitle.style.opacity = String(1 - first);

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const raw = cardProgress(p, i);
        const e = easeInOutCubic(raw);
        const rest = 1 - e;

        // Fully below the stage: hide so no rotated corner can peek in.
        card.style.visibility = raw <= 0 ? "hidden" : "visible";

        if (reduced) {
          card.style.transform = `translate3d(0, ${rest * vh}px, 0)`;
          card.style.filter = "";
          card.style.opacity = "1";
          return;
        }

        const x = rest * ENTER.offsetX * vw;
        const y = rest * ENTER.offsetY * vh;
        const rotate = rest * ENTER.rotate;
        const scale = 1 + rest * (ENTER.scale - 1);
        const blur = rest * ENTER.blur;
        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
        card.style.filter = blur > 0.05 ? `blur(${blur}px)` : "";
        card.style.opacity = String(ENTER.opacity + (1 - ENTER.opacity) * e);
      });
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      current = reduced ? target : current + (target - current) * (1 - Math.exp(-dt * LERP_RATE));
      if (Math.abs(target - current) < 0.0001) current = target;
      render(current);
      setStep(stepAt(target));
      // Keep animating only while catching up; scroll/resize restart the loop.
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      readTarget();
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      wake();
    };

    const onMotionChange = () => {
      reduced = motionQuery.matches;
      wake();
    };

    readTarget();
    current = target;
    render(current);
    raf = requestAnimationFrame(tick); // first frame also syncs the rail's step

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div ref={sceneRef} className="relative" style={{ height: SCENE_HEIGHT }}>
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* Hero */}
        <div
          ref={heroRef}
          className="absolute inset-0 z-0 flex flex-col justify-between p-[clamp(20px,4vw,56px)] text-white will-change-transform"
          style={{ background: HERO.background }}
        >
          <h2
            className="pr-14 text-[clamp(56px,17vw,96px)] leading-[0.85] md:pr-24 tracking-[-0.075em] uppercase md:text-[clamp(76px,12vw,210px)]"
            style={{ fontFamily: FONT_STACK, fontWeight: 900 }}
          >
            {HERO.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p ref={subtitleRef} className="max-w-md text-base leading-snug md:text-lg">
            {HERO.subtitle}
          </p>
        </div>

        {/* Cards — later cards stack above earlier ones */}
        {CARDS.map((card, i) => (
          <Link
            key={card.number}
            href={card.href}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="group invisible absolute inset-0 flex h-full w-full flex-col justify-between p-[clamp(20px,4vw,56px)] will-change-transform focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-current"
            style={{ zIndex: i + 1, background: card.background, color: card.color, ["--card-bg" as string]: card.background }}
            aria-label={`${card.title} — ${card.cta}`}
          >
            <div className="flex items-start justify-between gap-6">
              <p className="pt-2 font-mono text-xs tracking-[0.2em] uppercase md:text-sm">{card.kicker}</p>
              <span
                className="text-[clamp(48px,9vw,150px)] leading-[0.8] tracking-[-0.06em]"
                style={{ fontFamily: FONT_STACK, fontWeight: 900 }}
                aria-hidden="true"
              >
                {card.number}
              </span>
            </div>

            <h3
              className="max-w-[16ch] pr-14 text-[clamp(38px,10vw,64px)] md:pr-24 leading-[0.88] tracking-[-0.06em] uppercase md:text-[clamp(56px,7vw,124px)]"
              style={{ fontFamily: FONT_STACK, fontWeight: 900 }}
            >
              {card.title}
            </h3>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              {/* fills with the text colour on hover; its text switches to the card colour */}
              <span className="inline-flex items-center gap-3 self-start rounded-full border-2 border-current px-5 py-2.5 text-sm font-semibold transition-[background-color] duration-300 group-hover:bg-current">
                <span className="transition-colors duration-300 group-hover:[color:var(--card-bg)]">{card.cta}</span>
                <span aria-hidden="true" className="transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:[color:var(--card-bg)]">→</span>
              </span>
              <p className="max-w-sm self-start text-base leading-snug opacity-85 md:self-end md:text-lg">
                {card.description}
              </p>
            </div>
          </Link>
        ))}

        {/* Navigation rail — takes the colour of whatever is in place */}
        <nav
          aria-label="Card navigation"
          className="absolute top-1/2 right-3 z-[60] flex -translate-y-1/2 flex-col items-center gap-2 transition-colors duration-500 sm:right-5 md:right-8"
          style={{ color: step === 0 ? "#f7f4ee" : CARDS[step - 1].color }}
        >
          <RailButton
            icon="first"
            label="Back to the start"
            disabled={step === 0}
            onClick={() => goTo(0)}
            className="hidden md:grid"
          />
          <RailButton icon="prev" label="Previous card" disabled={step === 0} onClick={() => goTo(step - 1)} />

          <div className="flex flex-col items-center gap-1.5 py-1 font-mono text-[10px] leading-none md:text-[11px]" aria-live="polite">
            <span className="h-3 overflow-hidden">
              <span key={step} className="block animate-[rail-tick_0.45s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
                {pad2(step)}
              </span>
            </span>
            <span className="relative h-10 w-px overflow-hidden bg-current/25 md:h-14" aria-hidden="true">
              <span
                className="absolute inset-x-0 top-0 bg-current transition-[height] duration-500 ease-out"
                style={{ height: `${(step / LAST_STEP) * 100}%` }}
              />
            </span>
            <span className="opacity-60">{pad2(LAST_STEP)}</span>
          </div>

          <RailButton
            icon="next"
            label="Next card"
            disabled={step === LAST_STEP}
            onClick={() => goTo(step + 1)}
          />
          <RailButton
            icon="last"
            label="Jump to the last card"
            disabled={step === LAST_STEP}
            onClick={() => goTo(LAST_STEP)}
            className="hidden md:grid"
          />
        </nav>
      </div>
    </div>
  );
}
