"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

/** Cycled in the headline, in step with the products orbiting the press. */
const WORDS = ["cards.", "mugs.", "tees.", "boxes.", "banners.", "anything."];
const WORD_MS = 1900;

const FACTS = [
  { value: "12", label: "ready-made kits" },
  { value: "2 hr", label: "quote turnaround" },
  { value: "1", label: "price for everyone" },
];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const RISE = "animate-[hero-rise_1s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none";
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function HeroCopy() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % WORDS.length), WORD_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none relative flex h-full flex-col justify-end site-gutter pt-28 pb-[clamp(24px,6vh,72px)] md:justify-center md:pb-[clamp(24px,8vh,96px)]">
      <div className="pointer-events-auto max-w-[720px]">
        <p style={delay(100)} className={`${RISE} mb-5 flex items-center gap-3 text-xs font-medium tracking-[0.2em] text-accent uppercase`}>
          <span className="h-px w-8 bg-current" />
          Custom printing · Coimbatore
        </p>

        <h1 className="text-[clamp(40px,5.2vw,96px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-cream">
          <span className="block overflow-hidden pb-[0.05em]">
            <span className="block animate-[hero-line_1.1s_cubic-bezier(0.22,1,0.36,1)_0.2s_both] motion-reduce:animate-none">Print your brand</span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <span className="block animate-[hero-line_1.1s_cubic-bezier(0.22,1,0.36,1)_0.32s_both] motion-reduce:animate-none">
              on{" "}
              <span className="relative inline-block align-bottom">
                <span key={WORDS[index]} className="inline-block animate-[hero-word_0.7s_cubic-bezier(0.22,1,0.36,1)_both] text-accent motion-reduce:animate-none">
                  {WORDS[index]}
                </span>
              </span>
            </span>
          </span>
          <span className="sr-only">Print your brand on anything.</span>
        </h1>

        <p style={delay(450)} className={`${RISE} mt-6 max-w-md text-[15px] leading-relaxed text-cream/70 md:text-base`}>
          Cards, mugs, tees, boxes, banners — grouped into twelve ready-made kits, so your brand looks the same everywhere it shows up.
        </p>

        <div style={delay(580)} className={`${RISE} mt-8 flex flex-wrap items-center gap-3`}>
          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent py-2 pr-2 pl-6 font-medium text-cream"
          >
            <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full bg-cream transition-transform duration-500 ${EASE} group-hover:translate-y-0`} />
            <span className="relative transition-colors duration-500 group-hover:text-ink">Get a Quote</span>
            <span aria-hidden="true" className={`relative grid h-10 w-10 place-items-center rounded-full bg-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>
              →
            </span>
          </Link>
          <Link
            href="/kits"
            className="inline-flex items-center rounded-full border border-cream/25 px-6 py-3 font-medium text-cream transition-colors duration-300 hover:border-cream hover:bg-cream/10"
          >
            Explore kits
          </Link>
        </div>

        <dl style={delay(720)} className={`${RISE} mt-10 hidden gap-8 border-t border-cream/10 pt-6 sm:flex`}>
          {FACTS.map((f) => (
            <div key={f.label}>
              <dt className="sr-only">{f.label}</dt>
              <dd className="text-2xl font-extrabold tracking-[-0.03em] text-cream">{f.value}</dd>
              <dd className="text-xs text-cream/55">{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
