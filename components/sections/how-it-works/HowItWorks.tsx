"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PipelineScene } from "@/components/three";
import { CtaBand, Reveal } from "@/components/ui";
import { Crew } from "@/components/sections/crew";
import { QUOTE_SLA } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Content — the 7-stage order lifecycle from the master plan          */
/* ------------------------------------------------------------------ */

interface Stage {
  title: string;
  owner: string;
  text: string;
  system: string[];
}

const STAGES: Stage[] = [
  {
    title: "Inquiry",
    owner: "INKA · Front Office",
    text: "Reach us through the website, WhatsApp or walk in to our Gandhipuram studio. Your request becomes a lead in our system the moment it lands.",
    system: ["Lead created", "INKA notified"],
  },
  {
    title: "Quotation",
    owner: "INKA · Pricing engine",
    text: `Our pricing engine builds your quote from the product, quantity and finish — the same price anyone would get. It reaches you within ${QUOTE_SLA}.`,
    system: ["Quote via WhatsApp + email", `SLA: ${QUOTE_SLA}`],
  },
  {
    title: "Design",
    owner: "PIXEL · Design",
    text: "PIXEL takes your brief, logo and references and turns them into a print-ready design. It's uploaded to your order so you can preview it.",
    system: ["Design ticket opened", "Preview shared"],
  },
  {
    title: "Approval",
    owner: "You",
    text: "Approve online or in person. Nothing is printed until you say yes — then the design is locked as final and production starts.",
    system: ["Design locked as final", "Production triggered"],
  },
  {
    title: "Production",
    owner: "PRESSO · Production",
    text: "Printed in-house by PRESSO or by a vetted partner from our vendor network. Every job clears a 3-point check — colour, alignment, material.",
    system: ["Photo updates", "QC before dispatch"],
  },
  {
    title: "Packing",
    owner: "FLASH & SWIFTY · Dispatch",
    text: "Your order is packed in branded packaging with the invoice and a care card. A photo proof is uploaded before it leaves.",
    system: ["Packing photo proof", "GST invoice attached"],
  },
  {
    title: "Delivery",
    owner: "FLASH & SWIFTY · Delivery",
    text: "Delivered to your door with photo and signature proof. Any balance is collected on delivery, and we ask how we did 24 hours later.",
    system: ["Proof of delivery", "Feedback request"],
  },
];

const PROMISES = [
  { title: "One price for everyone", text: "Walk-in, WhatsApp or online — the same product costs the same. The system sets the price, not a person." },
  { title: `Quote in ${QUOTE_SLA}`, text: "Send your requirement during working hours and your quote is back the same morning or afternoon." },
  { title: "Checked before it ships", text: "Colour, alignment and material are checked on every job. If it fails, it doesn't leave." },
  { title: "Pay your way", text: "Pay 100% online, or 50% in advance and the rest at pickup or delivery. GST invoice on every order." },
];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** Share of the pinned scroll spent on the intro before stage 1 shows. */
const INTRO = 0.6;
const pad2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function HowItWorks() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(-1); // -1 = intro

  // Pinned scroll: the intro, then one viewport per stage.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = scene.getBoundingClientRect();
      const travel = scene.offsetHeight - window.innerHeight;
      const units = Math.min(Math.max(-rect.top / window.innerHeight, 0), travel / window.innerHeight);
      const stageUnits = Math.max(0, units - INTRO);
      progressRef.current = Math.min(1, stageUnits / (STAGES.length - 1));
      setActive(units < INTRO ? -1 : Math.min(STAGES.length - 1, Math.round(stageUnits)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const jumpTo = (i: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const top = scene.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (INTRO + i) * window.innerHeight + 2, behavior: "smooth" });
  };

  return (
    <>
      {/* Pinned 3D pipeline */}
      <section
        ref={sceneRef}
        aria-label="The seven stages of a Sonic Prints order"
        className="relative bg-ink text-cream"
        style={{ height: `${(STAGES.length + INTRO + 0.4) * 100}svh` }}
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          <PipelineScene progressRef={progressRef} stages={STAGES.length} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(0,20,8,0.85),transparent_65%)]" />

          {/* Intro */}
          <div
            className={`absolute inset-x-0 bottom-0 site-gutter pb-[clamp(40px,8vh,96px)] transition-[transform,opacity] duration-700 ${EASE} ${
              active === -1 ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-10 opacity-0"
            }`}
          >
            <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              How it works
            </p>
            <h1 className="max-w-4xl text-[clamp(44px,8vw,128px)] leading-[0.9] font-extrabold tracking-[-0.055em]">
              From first hello to <span className="text-accent">final delivery.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/75 md:text-lg">
              Every order runs through one system — seven stages, a named owner for each, and a WhatsApp update at every step.
            </p>
            <p className="mt-10 flex items-center gap-3 text-sm text-cream/60">
              <span className="relative block h-10 w-6 rounded-full border border-cream/40">
                <span className="absolute top-2 left-1/2 h-2 w-1 -translate-x-1/2 animate-bounce rounded-full bg-accent motion-reduce:animate-none" />
              </span>
              Scroll to follow an order
            </p>
          </div>

          {/* Stage panels */}
          {STAGES.map((stage, i) => (
            <article
              key={stage.title}
              aria-hidden={active !== i}
              className={`absolute bottom-[clamp(24px,6vh,72px)] left-[clamp(16px,4vw,56px)] w-[min(520px,calc(100%-32px))] rounded-[28px] border border-cream/10 bg-ink/70 p-[clamp(22px,3vw,36px)] backdrop-blur-md transition-[transform,opacity,filter] duration-700 ${EASE} ${
                active === i
                  ? "translate-y-0 opacity-100 blur-0"
                  : active > i
                    ? "pointer-events-none -translate-y-12 opacity-0 blur-sm"
                    : "pointer-events-none translate-y-12 opacity-0 blur-sm"
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Stage {pad2(i + 1)} / {pad2(STAGES.length)}</span>
                <span className="text-right text-xs text-cream/55">{stage.owner}</span>
              </div>
              <h2 className="mt-4 text-[clamp(40px,6vw,80px)] leading-[0.9] font-extrabold tracking-[-0.05em]">{stage.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-cream/80 md:text-base">{stage.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {stage.system.map((s) => (
                  <li key={s} className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-cream/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {s}
                  </li>
                ))}
              </ul>
            </article>
          ))}

          {/* Stage rail */}
          <nav aria-label="Jump to a stage" className="absolute top-1/2 right-[clamp(10px,2.5vw,36px)] flex -translate-y-1/2 flex-col gap-1">
            {STAGES.map((stage, i) => (
              <button
                key={stage.title}
                type="button"
                onClick={() => jumpTo(i)}
                aria-current={active === i ? "step" : undefined}
                className="group flex items-center justify-end gap-3 py-1.5"
              >
                <span
                  className={`hidden text-xs transition-[opacity,transform] duration-300 sm:block ${
                    active === i ? "translate-x-0 text-cream opacity-100" : "translate-x-2 text-cream/60 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                >
                  {stage.title}
                </span>
                <span
                  className={`block h-[3px] rounded-full transition-[width,background-color] duration-500 ${EASE} ${
                    active === i ? "w-8 bg-accent" : active > i ? "w-4 bg-accent/60" : "w-4 bg-cream/25 group-hover:bg-cream/60"
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Promises */}
      <section className="bg-cream site-gutter py-[clamp(80px,10vw,150px)] text-ink">
        <div className="mx-auto">
          <Reveal>
            <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              On every order
            </p>
            <h2 className="max-w-3xl text-[clamp(36px,5.5vw,76px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
              Four things that never change.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {PROMISES.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-[28px] border border-ink/10 bg-white p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,20,8,0.45)] sm:p-9">
                  <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-700 ${EASE} group-hover:scale-x-100`} />
                  <span className="font-mono text-xs text-accent">{pad2(i + 1)}</span>
                  <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink/70">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Crew />

      <section className="bg-ink site-gutter pb-16 text-center">
        <Link href="/faq" className="text-sm text-cream/70 underline decoration-accent underline-offset-4 transition-colors hover:text-cream">
          Got questions about the process? Read the FAQ →
        </Link>
      </section>

      <CtaBand title="Stage one takes two minutes." />
    </>
  );
}
