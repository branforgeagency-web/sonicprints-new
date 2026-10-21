"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { StackedCards } from "@/components/animations";
import { KitRingScene } from "@/components/three";
import { CtaBand, Reveal } from "@/components/ui";
import type { Kit } from "@/lib/kits";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { whatsappLink } from "@/lib/site";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** Auto-advance until the visitor interacts. */
const AUTO_MS = 4500;
const THEMES = [
  { background: "#001408", color: "#f7f4ee" },
  { background: "#f7f4ee", color: "#001408" },
  { background: "#bd5501", color: "#f7f4ee" },
];

/** The catalogue categories as ring cards: name, description and a few of their products. */
const RING: (Kit & { count: number })[] = CATEGORIES.map((c, i) => ({
  slug: c.slug,
  number: c.number,
  title: c.name,
  description: c.description,
  includes: c.products.slice(0, 4).map((p) => p.name),
  count: c.products.length,
  ...THEMES[i % THEMES.length],
}));
const N = RING.length;

export default function Kits() {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [auto, setAuto] = useState(true);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const select = useCallback((i: number) => {
    setAuto(false);
    setActive(((i % N) + N) % N);
  }, []);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % N), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [auto, active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") select(active + 1);
    if (e.key === "ArrowLeft") select(active - 1);
  };

  const kit = RING[active];

  return (
    <>
      {/* 3D carousel */}
      <section
        ref={heroRef}
        aria-roledescription="carousel"
        aria-label="Sonic Prints product categories"
        onKeyDown={onKey}
        className="relative h-svh min-h-[640px] overflow-hidden bg-ink text-cream"
      >
        <KitRingScene kits={RING} label="CATEGORY" activeRef={activeRef} onSelect={select} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,20,8,0.9),transparent_45%)] md:bg-[radial-gradient(ellipse_at_left,rgba(0,20,8,0.9),transparent_60%)]" />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between site-gutter pt-28 pb-[clamp(20px,5vh,64px)] md:pt-36">
          <div>
            <p className="mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              {N} categories · {PRODUCTS.length}+ products
            </p>
            <h1 className="max-w-xl text-[clamp(32px,min(5.5vw,9vh),84px)] leading-[0.92] font-extrabold tracking-[-0.05em]">
              Everything your brand needs, <span className="text-accent">in one catalogue.</span>
            </h1>
          </div>

          {/* Active kit */}
          <div className="pointer-events-auto w-full max-w-[460px]">
            <div key={kit.slug} className="animate-[kit-in_0.7s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none" aria-live="polite">
              <p className="font-mono text-xs tracking-[0.2em] text-cream/55 uppercase">
                Category {kit.number} / {String(N).padStart(2, "0")}
              </p>
              {/* Fixed-height slots so a two-line title never pushes the controls off screen. */}
              <h2 className="mt-2 line-clamp-2 min-h-[1.9em] text-[clamp(28px,min(4vw,6vh),52px)] leading-[0.95] font-extrabold tracking-[-0.04em]">
                {kit.title}
              </h2>
              <p className="mt-3 hidden min-h-[3.25em] leading-relaxed text-cream/75 sm:line-clamp-2">{kit.description}</p>
              <ul className="mt-4 flex flex-wrap content-start gap-1.5 sm:min-h-[3.5rem]">
                {kit.includes.map((item) => (
                  <li key={item} className="rounded-full border border-cream/15 bg-ink/50 px-3 py-1 text-xs text-cream/85 backdrop-blur max-sm:[&:nth-child(n+3)]:hidden">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/categories/${kit.slug}`}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent py-1.5 pr-1.5 pl-5 text-sm font-medium text-cream"
              >
                <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full bg-cream transition-transform duration-500 ${EASE} group-hover:translate-y-0`} />
                <span className="relative transition-colors duration-500 group-hover:text-ink">View {kit.count} products</span>
                <span aria-hidden="true" className={`relative grid h-8 w-8 place-items-center rounded-full bg-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>
                  →
                </span>
              </Link>
              <div className="flex items-center gap-2">
                {[-1, 1].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => select(active + d)}
                    aria-label={d < 0 ? "Previous category" : "Next category"}
                    className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 transition-colors hover:border-accent hover:bg-accent"
                  >
                    {d < 0 ? "←" : "→"}
                  </button>
                ))}
              </div>
              <span className="hidden text-xs text-cream/45 sm:inline">Drag to spin · click a card</span>
            </div>

            {/* Progress dots */}
            <div className="mt-5 flex gap-1.5" role="tablist" aria-label="Choose a category">
              {RING.map((k, i) => (
                <button
                  key={k.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={k.title}
                  onClick={() => select(i)}
                  className="group py-2"
                >
                  <span className={`block h-[3px] rounded-full transition-[width,background-color] duration-500 ${EASE} ${i === active ? "w-7 bg-accent" : "w-3 bg-cream/25 group-hover:bg-cream/60"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All kits */}
      <section className="bg-cream site-gutter pt-[clamp(80px,10vw,150px)] pb-[clamp(48px,6vw,80px)] text-ink">
        <div className="mx-auto">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                <span className="h-px w-8 bg-current" />
                The full catalogue
              </p>
              <h2 className="max-w-2xl text-[clamp(36px,5.5vw,76px)] leading-[0.95] font-extrabold tracking-[-0.045em]">Browse by category.</h2>
            </div>
            <p className="max-w-sm leading-relaxed text-ink/65">Every product we print, in ten categories. Scroll to flip through them — tap a card to see all its products.</p>
          </Reveal>
        </div>
      </section>

      <section id="catalogue" aria-label="Product categories">
        <StackedCards />
      </section>

      <section className="bg-cream site-gutter py-[clamp(56px,3vw,96px)] text-ink">
        <div className="mx-auto">
          <Reveal className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-dashed border-ink/20 p-7 sm:flex-row sm:items-center">
            <p className="text-lg">
              <span className="font-bold">Not sure where to start?</span> <span className="text-ink/65">Tell LEADO where your brand is — we&apos;ll suggest the right products.</span>
            </p>
            <a
              href={whatsappLink("Hi Sonic Prints! Which products would suit my brand?")}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent"
            >
              Ask on WhatsApp
            </a>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Pick your products. We'll do the rest." />
    </>
  );
}
