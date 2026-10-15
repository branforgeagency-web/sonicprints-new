"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AudienceScene } from "@/components/three";
import { Reveal } from "@/components/ui";
import { QUOTE_SLA, whatsappLink } from "@/lib/site";

const AUTO_MS = 8000;

const SLIDES = [
  {
    tag: "B2B",
    full: "Business to Business",
    tab: "For businesses",
    title: ["Your whole brand,", "printed at scale."],
    body: "Startups, shops, offices and franchises — whatever your brand needs printed, from cards and uniforms to packaging and signage, kept consistent across every order and every outlet.",
    points: [
      "12 ready-made kits for every stage of your brand",
      "Bulk and repeat orders with matched colours",
      "One crew handles design, approval, production and delivery",
      `A detailed quote within ${QUOTE_SLA}`,
    ],
    cta: { label: "Explore the 12 kits", href: "/kits" },
    alt: { label: "Get a bulk quote", href: "/contact?type=b2b" },
  },
  {
    tag: "B2C",
    full: "Business to Consumer",
    tab: "For individuals",
    title: ["Your idea,", "printed on anything."],
    body: "Not a company? No problem. Bring your own design, photo or text and we'll print it on whatever you choose — apparel, bags, paper, signage or something we've never printed before.",
    points: [
      "Print on any product you choose — or bring your own",
      "Your design, or let our designers create one",
      "Single pieces handled with the same care as bulk",
      "Share your idea on WhatsApp and get a quick quote",
    ],
    cta: { label: "Start your print", href: "/contact?type=b2c" },
    alt: { label: "Chat on WhatsApp", href: whatsappLink("Hi SonicPrints! I'd like something printed.") },
  },
] as const;

/** B2B / B2C: two auto-advancing slides over a Three.js scene that regroups the products for each audience. */
export default function Audiences() {
  const [active, setActive] = useState<0 | 1>(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setActive((a) => (a === 0 ? 1 : 0)), AUTO_MS);
    return () => clearTimeout(id);
  }, [active, paused]);

  const slide = SLIDES[active];

  return (
    <section
      id="audiences"
      aria-labelledby="audiences-title"
      className="relative overflow-hidden bg-white px-[clamp(16px,4vw,56px)] py-[clamp(72px,9vw,140px)] text-ink"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 right-0 h-[520px] w-[760px] -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <Reveal>
            <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              Who we print for
            </p>
            <h2 id="audiences-title" className="sr-only">
              Printing for businesses and individuals
            </h2>

            {/* slide tabs */}
            <div role="tablist" aria-label="Audience" className="mb-8 inline-flex rounded-full border border-ink/10 bg-ink/[0.04] p-1">
              {SLIDES.map((s, i) => (
                <button
                  key={s.tag}
                  type="button"
                  role="tab"
                  id={`aud-tab-${i}`}
                  aria-selected={active === i}
                  aria-controls="aud-panel"
                  onClick={() => setActive(i as 0 | 1)}
                  className={`relative overflow-hidden rounded-full px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap sm:px-5 sm:text-sm transition-colors duration-300 ${
                    active === i ? "bg-accent text-cream" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <span
                    className={`mr-2 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest ${
                      active === i ? "bg-cream/20 text-cream" : "bg-accent/15 text-accent"
                    }`}
                  >
                    {s.tag}
                  </span>
                  {s.tab}
                  {active === i && !paused && (
                    <span
                      key={`bar-${active}`}
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-cream/70 motion-reduce:hidden"
                      style={{ animation: `aud-progress ${AUTO_MS}ms linear forwards` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </Reveal>

          {/* slide content — re-keyed so each slide animates in */}
          <div id="aud-panel" role="tabpanel" aria-labelledby={`aud-tab-${active}`} key={active} aria-live="polite">
            <p className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent/10 py-1.5 pr-4 pl-1.5 text-sm text-ink/75 motion-safe:animate-[hero-rise_0.7s_cubic-bezier(0.22,1,0.36,1)_both]">
              <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-xs font-bold tracking-widest text-cream">{slide.tag}</span>
              {slide.full}
            </p>
            <h3 className="text-[clamp(34px,5vw,68px)] leading-[0.98] font-extrabold tracking-[-0.045em]">
              {slide.title.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-1">
                  <span
                    className={`block motion-safe:animate-[hero-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_both] ${i === 1 ? "text-accent" : ""}`}
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h3>
            <p
              className="mt-6 max-w-lg leading-relaxed text-ink/70 motion-safe:animate-[hero-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{ animationDelay: "180ms" }}
            >
              {slide.body}
            </p>
            <ul className="mt-7 grid gap-3">
              {slide.points.map((p, i) => (
                <li
                  key={p}
                  className="flex items-start gap-3 text-ink/85 motion-safe:animate-[kit-in_0.7s_cubic-bezier(0.22,1,0.36,1)_both]"
                  style={{ animationDelay: `${260 + i * 70}ms` }}
                >
                  <span className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-accent" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <div
              className="mt-9 flex flex-wrap gap-3 motion-safe:animate-[hero-rise_0.8s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{ animationDelay: "560ms" }}
            >
              <Link
                href={slide.cta.href}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-cream transition-transform duration-300 hover:-translate-y-0.5"
              >
                {slide.cta.label} →
              </Link>
              <a
                href={slide.alt.href}
                {...(slide.alt.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                {slide.alt.label}
              </a>
            </div>
          </div>
        </div>

        {/* 3D: a hanging fabric print that an ink roller reprints — bulk repeat run (B2B) or one-of-one artwork (B2C) */}
        <div className="relative h-[92vw] max-h-[560px] min-h-[340px] lg:h-[560px]">
          <span
            key={slide.tag}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(120px,22vw,300px)] leading-none font-black tracking-[-0.06em] text-ink/[0.04] select-none motion-safe:animate-[hero-rise_0.9s_cubic-bezier(0.22,1,0.36,1)_both]"
          >
            {slide.tag}
          </span>
          <AudienceScene mode={active} />
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tracking-[0.2em] text-ink/45 uppercase">
            {active === 0 ? "B2B · one brand, every piece" : "B2C · your design, on anything"}
          </span>
        </div>
      </div>
    </section>
  );
}
