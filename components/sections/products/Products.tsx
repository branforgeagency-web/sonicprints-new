"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AddToCart } from "@/components/cart";
import { ProductMedia, Reveal } from "@/components/ui";
import { CATEGORIES, FEATURED, PRODUCTS } from "@/lib/products";

const CARD_W = "w-[clamp(220px,min(26vw,32svh),320px)]";

export default function Products() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const photos = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let distance = 0;
    let raf = 0;

    const apply = () => {
      raf = 0;
      // Progress through the pinned stretch → horizontal offset of the cards.
      const progress = distance > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance)) : 0;
      track.style.transform = `translate3d(${-progress * distance}px,0,0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      // Parallax: each photo slides slightly against the row, more the further it is from centre.
      const mid = window.innerWidth / 2;
      for (const el of photos.current) {
        if (!el) continue;
        const r = el.parentElement!.getBoundingClientRect();
        const off = (r.left + r.width / 2 - mid) / window.innerWidth;
        el.style.transform = `translate3d(${(-off * 14).toFixed(2)}%,0,0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const measure = () => {
      // How far the row must travel so its last card ends at the right padding.
      distance = Math.max(0, track.scrollWidth - track.parentElement!.clientWidth);
      // The section is as tall as one screen plus the sideways travel, so vertical scroll drives it 1:1.
      section.style.height = `${window.innerHeight + distance}px`;
      apply();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="products" ref={sectionRef} aria-labelledby="products-title" className="relative bg-cream text-ink">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden site-gutter pt-[clamp(84px,11svh,120px)] pb-[clamp(20px,4svh,44px)]">
        <div className="mx-auto w-full">
          <Reveal className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                <span className="h-px w-8 bg-current" />
                What we print
              </p>
              <h2 id="products-title" className="text-[clamp(30px,min(5vw,7svh),68px)] leading-[0.98] font-extrabold tracking-[-0.045em]">
                Print on <span className="text-accent">anything.</span>
              </h2>
            </div>
            <p className="hidden max-w-sm leading-relaxed text-ink/65 sm:block">
              A few favourites from {PRODUCTS.length}+ products across {CATEGORIES.length} categories — tap any card for full details.
            </p>
          </Reveal>
        </div>

        {/* the sliding row */}
        <div className="mx-auto mt-[clamp(16px,4svh,40px)] w-full">
          <ul ref={trackRef} className="flex w-max gap-4 will-change-transform sm:gap-6">
            {FEATURED.map((p, i) => (
              <li key={p.slug} className={`${CARD_W} shrink-0`}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-white p-3 ring-1 ring-ink/[0.06] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,20,8,0.35)] sm:p-4">
                  <Link
                    href={`/products/${p.slug}`}
                    className="flex flex-1 flex-col rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {/* product photo */}
                    <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[#f1f1f1]">
                      {p.image ? (
                        <span
                          ref={(el) => {
                            photos.current[i] = el;
                          }}
                          className="absolute -inset-x-[10%] inset-y-0 will-change-transform"
                        >
                          <ProductMedia
                            image={p.image}
                            alt={p.alt}
                            name={p.name}
                            sizes="(max-width: 640px) 70vw, 330px"
                            className="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                          />
                        </span>
                      ) : (
                        <ProductMedia
                          alt={p.alt}
                          name={p.name}
                          label={p.category.name}
                          sizes="(max-width: 640px) 70vw, 330px"
                          className="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                        />
                      )}
                      <span className="absolute top-3 left-3 rounded-full bg-white/85 px-2 py-0.5 font-mono text-[11px] tracking-widest text-ink/60 backdrop-blur">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full bg-ink text-cream transition-[transform,background-color] duration-500 group-hover:-rotate-45 group-hover:bg-accent"
                      >
                        →
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-1 pt-3 pb-1">
                      <h3 className="text-lg leading-tight font-extrabold tracking-[-0.03em] sm:text-xl">{p.name}</h3>
                      <span className="mt-auto pt-2 font-mono text-[10px] tracking-[0.14em] text-accent uppercase sm:text-[11px]">{p.category.name}</span>
                    </div>
                  </Link>
                  <div className="mt-3 border-t border-ink/[0.07] pt-3">
                    <AddToCart product={p} />
                  </div>
                </div>
              </li>
            ))}

            {/* last tile: carry on to the full range */}
            <li className={`${CARD_W} shrink-0`}>
              <Link
                href="/kits#catalogue"
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] bg-ink p-6 text-cream transition-transform duration-500 hover:-translate-y-1.5"
              >
                <span aria-hidden="true" className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-accent/40 blur-3xl transition-transform duration-700 group-hover:scale-125" />
                <span className="relative font-mono text-[11px] tracking-[0.2em] text-cream/50 uppercase">{CATEGORIES.length} categories · {PRODUCTS.length}+ products</span>
                <span className="relative text-[clamp(28px,3vw,40px)] leading-[0.98] font-extrabold tracking-[-0.04em]">
                  And a lot
                  <span className="block text-accent">more.</span>
                </span>
                <span className="relative inline-flex items-center gap-3 font-semibold">
                  Browse all categories
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 group-hover:-rotate-45">→</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* progress + view more */}
        <div className="mx-auto mt-[clamp(16px,4svh,36px)] flex w-full items-center gap-5">
          <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10">
            <span ref={barRef} className="absolute inset-0 origin-left rounded-full bg-accent" style={{ transform: "scaleX(0)" }} />
          </span>
          <Link
            href="/kits#catalogue"
            className="group relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-full bg-ink py-1.5 pr-1.5 pl-5 text-sm font-semibold text-cream"
          >
            <span aria-hidden="true" className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
            <span className="relative">View more</span>
            <span aria-hidden="true" className="relative grid h-8 w-8 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 group-hover:-rotate-45">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
