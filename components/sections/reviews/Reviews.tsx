"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useReveal } from "@/components/hooks/useReveal";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface Review {
  quote: string;
  name: string;
  role: string;
  kit: string;
}

// PLACEHOLDER reviews — replace with real customer reviews (with permission) before launch.
const REVIEWS: Review[] = [
  {
    quote:
      "SonicPrints handled our whole rebrand roll-out — business cards, letterheads, signage and team tees all arrived on time and perfectly on-colour.",
    name: "Priya Nair",
    role: "Marketing Lead, Northwind Studio",
    kit: "Brand Identity Kit",
  },
  {
    quote:
      "Our exhibition booth was the one people stopped at. The backdrop, standees and badges looked premium and were set up in minutes.",
    name: "Arjun Mehta",
    role: "Events Manager, Bluepeak",
    kit: "Event & Exhibition Kit",
  },
  {
    quote:
      "New joiners now get a welcome bag with a tee, cap, notebook and lanyard. It sounds small, but people post it on day one.",
    name: "Sara Thomas",
    role: "People & Culture, Kinetic Labs",
    kit: "Team & Employee Kit",
  },
  {
    quote:
      "The packaging kit turned our plain shipping boxes into something customers film. Labels, tape and tissue — all matching, all sharp.",
    name: "Rahul Verma",
    role: "Founder, Oatly Goods",
    kit: "Packaging Kit",
  },
  {
    quote: "Fast proofs, honest advice on paper stock and zero surprises on the invoice. Exactly what you want from a print partner.",
    name: "Neha Kapoor",
    role: "Brand Manager, Lumen & Co.",
    kit: "Stationery Kit",
  },
  {
    quote: "Our corporate gifts actually get used — the bottles and diaries are on every client's desk months later.",
    name: "Vikram Rao",
    role: "Director, Atlas Partners",
    kit: "Corporate Gift Kit",
  },
  {
    quote: "Shelf talkers and counter displays went up across 14 stores in a week. Sales on the featured range jumped straight away.",
    name: "Ananya Iyer",
    role: "Retail Lead, Fresh Basket",
    kit: "Retail & Point-of-Sale Kit",
  },
  {
    quote: "Print and digital finally match — our social templates and business cards feel like one brand for the first time.",
    name: "Karan Shah",
    role: "Co-founder, Pixelhaus",
    kit: "Digital Brand Assets Kit",
  },
];

const FEATURED = REVIEWS.slice(0, 4);
const ROW_A = REVIEWS.slice(0, 4).concat(REVIEWS.slice(4, 6));
const ROW_B = REVIEWS.slice(4).concat(REVIEWS.slice(1, 3));

const SLIDE_MS = 7000;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const AVATAR_COLORS = ["#bd5501", "#001408", "#8a3e01", "#1f4a2e", "#d9741f", "#0b2d17"];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

function Avatar({ name, index, size = "h-11 w-11 text-sm" }: { name: string; index: number; size?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${size}`}
      style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
    >
      {initials(name)}
    </span>
  );
}

function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`flex gap-0.5 ${className}`} aria-label="5 out of 5 stars" role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function ArrowButton({ dir, onClick, label }: { dir: "prev" | "next"; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group relative grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:text-cream active:scale-95 sm:h-14 sm:w-14"
    >
      <span className={`absolute inset-0 scale-0 rounded-full bg-ink transition-transform duration-500 ${EASE} group-hover:scale-100`} />
      <span className="relative h-5 w-5 overflow-hidden">
        <span
          className={`flex transition-transform duration-500 ${EASE} ${
            dir === "next" ? "group-hover:translate-x-full flex-row-reverse justify-end" : "group-hover:-translate-x-full"
          }`}
        >
          {[0, 1].map((k) => (
            <svg key={k} viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={dir === "next" ? "M5 12h14M13 6l6 6-6 6" : "M19 12H5M11 6l-6 6 6 6"} />
            </svg>
          ))}
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Review card (marquee rows) with tilt + glare                        */
/* ------------------------------------------------------------------ */

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="shrink-0 px-2.5 [perspective:900px] sm:px-3">
      <figure
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative flex h-full w-[min(78vw,360px)] flex-col justify-between gap-6 overflow-hidden rounded-[28px] border border-ink/10 bg-white p-6 shadow-[0_1px_0_rgba(0,20,8,0.04)] transition-[transform,box-shadow] duration-500 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:shadow-[0_30px_60px_-30px_rgba(0,20,8,0.45)] motion-reduce:[transform:none] sm:p-7"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(189,85,1,0.12), transparent 55%)" }}
        />
        <div className="relative flex items-center justify-between">
          <Stars className="text-accent" />
          <span className="rounded-full bg-ink/[0.06] px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-ink/70 uppercase">
            {review.kit}
          </span>
        </div>
        <blockquote className="relative text-[15px] leading-relaxed text-ink/85">“{review.quote}”</blockquote>
        <figcaption className="relative flex items-center gap-3">
          <Avatar name={review.name} index={index} />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink">{review.name}</span>
            <span className="text-xs text-ink/55">{review.role}</span>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: Review[]; reverse?: boolean }) {
  return (
    <div className="group/row flex overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <div
        className={`flex w-max animate-[reviews-scroll_60s_linear_infinite] group-hover/row:[animation-play-state:paused] motion-reduce:animate-none ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        {[0, 1].map((copy) =>
          items.map((review, i) => (
            <div key={`${copy}-${i}`} aria-hidden={copy === 1 || undefined} className="flex">
              <ReviewCard review={review} index={i + (reverse ? 3 : 0)} />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Reviews() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [headRef, headShown] = useReveal<HTMLDivElement>(0.3);
  const [featureRef, featureShown] = useReveal<HTMLDivElement>(0.25);
  const sectionRef = useRef<HTMLElement>(null);

  const go = (step: number) => setActive((i) => (i + step + FEATURED.length) % FEATURED.length);
  const review = FEATURED[active];

  // Soft spotlight that follows the cursor across the section.
  const onSectionMove = (e: PointerEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  };

  return (
    <section
      id="reviews"
      ref={sectionRef}
      onPointerMove={onSectionMove}
      className="relative overflow-hidden bg-cream py-[clamp(80px,10vw,150px)] text-ink"
      style={{ "--sx": "50%", "--sy": "20%" } as CSSProperties}
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(520px circle at var(--sx) var(--sy), rgba(189,85,1,0.10), transparent 70%)" }}
      />

      <div className="relative px-[clamp(16px,4vw,56px)]">
        {/* Header */}
        <div ref={headRef} className="mb-[clamp(40px,6vw,80px)] flex flex-wrap items-end justify-between gap-8">
          <div>
            <p
              className={`mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase transition-[transform,opacity] duration-700 ${EASE} ${
                headShown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <span className="h-px w-8 bg-current" /> Client Reviews
            </p>
            <h2 className="text-[clamp(44px,8vw,128px)] leading-[0.88] font-extrabold tracking-[-0.055em]">
              {[
                { text: "Trusted by", className: "" },
                { text: "bold brands.", className: "font-serif font-normal italic tracking-[-0.03em] text-accent" },
              ].map((line, i) => (
                <span key={line.text} className="block overflow-hidden pb-[0.08em]">
                  <span
                    className={`block transition-transform duration-[1100ms] ${EASE} ${line.className} ${
                      headShown ? "translate-y-0" : "translate-y-full"
                    }`}
                    style={{ transitionDelay: `${120 + i * 120}ms` }}
                  >
                    {line.text}
                  </span>
                </span>
              ))}
            </h2>
          </div>
          <p
            className={`max-w-xs text-sm leading-relaxed text-ink/65 transition-[transform,opacity] duration-1000 ${EASE} ${
              headShown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            From business cards to exhibition booths — here&apos;s what teams say after their kits arrive.
          </p>
        </div>

        {/* Featured review */}
        <div
          ref={featureRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className={`relative overflow-hidden rounded-[clamp(28px,3.5vw,48px)] bg-ink p-[clamp(24px,4.5vw,72px)] text-cream transition-[transform,opacity,clip-path] duration-[1200ms] ${EASE} ${
            featureShown ? "translate-y-0 opacity-100 [clip-path:inset(0_0_0_0_round_48px)]" : "translate-y-16 opacity-0 [clip-path:inset(12%_6%_0_6%_round_48px)]"
          }`}
          aria-roledescription="carousel"
          aria-label="Featured reviews"
        >
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-1/3 -right-1/4 h-[80%] w-[60%] animate-[reviews-glow_9s_ease-in-out_infinite] rounded-full bg-accent/25 blur-[90px] motion-reduce:animate-none"
          />

          <div className="relative grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
            {/* Big quote mark */}
            <span
              key={`mark-${active}`}
              aria-hidden="true"
              className="block animate-[quote-pop_0.9s_cubic-bezier(0.22,1,0.36,1)_both] font-serif text-[clamp(96px,12vw,200px)] leading-[0.7] text-accent motion-reduce:animate-none"
            >
              “
            </span>

            <div className="flex flex-col gap-10">
              <div className="flex items-center gap-4">
                <Stars className="text-accent" />
                <span className="rounded-full border border-cream/20 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-cream/75 uppercase">
                  {review.kit}
                </span>
              </div>

              {/* Quote — words blur and rise in on every slide */}
              <blockquote
                key={`quote-${active}`}
                aria-live="polite"
                className="min-h-[5.5em] text-[clamp(22px,2.9vw,44px)] leading-[1.18] font-medium tracking-[-0.025em]"
              >
                {review.quote.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="inline-block animate-[review-word_0.8s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 28}ms` }}
                  >
                    {word}&nbsp;
                  </span>
                ))}
              </blockquote>

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div key={`who-${active}`} className="flex animate-[review-word_0.8s_cubic-bezier(0.22,1,0.36,1)_0.3s_both] items-center gap-4 motion-reduce:animate-none">
                  <Avatar name={review.name} index={active} size="h-14 w-14 text-base" />
                  <span className="flex flex-col">
                    <span className="text-base font-semibold">{review.name}</span>
                    <span className="text-sm text-cream/60">{review.role}</span>
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  {/* Progress segments: the active one fills, then advances the slide */}
                  <div className="flex items-center gap-2" aria-hidden="true">
                    {FEATURED.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={() => setActive(i)}
                        className="relative h-[3px] w-8 overflow-hidden rounded-full bg-cream/20 sm:w-12"
                      >
                        {i < active && <span className="absolute inset-0 bg-cream" />}
                        {i === active && (
                          <span
                            key={`bar-${active}`}
                            className="absolute inset-y-0 left-0 animate-[review-progress_linear_both] bg-accent motion-reduce:animate-none"
                            style={{
                              animationDuration: `${SLIDE_MS}ms`,
                              animationPlayState: paused || !featureShown ? "paused" : "running",
                            }}
                            onAnimationEnd={() => go(1)}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-xs text-cream/60 tabular-nums">
                    {String(active + 1).padStart(2, "0")} / {String(FEATURED.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-end gap-3">
          <ArrowButton dir="prev" label="Previous review" onClick={() => go(-1)} />
          <ArrowButton dir="next" label="Next review" onClick={() => go(1)} />
        </div>
      </div>

      {/* Endless rows of review cards */}
      <div className="relative mt-[clamp(40px,6vw,80px)]">
        <MarqueeRow items={ROW_A} />
        <MarqueeRow items={ROW_B} reverse />
      </div>
    </section>
  );
}
