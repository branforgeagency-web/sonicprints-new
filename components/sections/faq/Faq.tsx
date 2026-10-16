"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GlyphMorphScene } from "@/components/three";
import { CtaBand, Reveal } from "@/components/ui";
import { CONTACT, QUOTE_SLA, whatsappLink } from "@/lib/site";
import { FAQ_GROUPS, type Faq as FaqItem } from "./faqs";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const ALL = "all";
const TOTAL = FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0);

/* ------------------------------------------------------------------ */
/* Accordion item                                                      */
/* ------------------------------------------------------------------ */

function Item({ item, open, onToggle, index }: { item: FaqItem; open: boolean; onToggle: () => void; index: string }) {
  const id = `faq-${index}`;
  return (
    <li className={`border-b border-ink/10 transition-colors duration-500 ${open ? "bg-white" : ""}`}>
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="group flex w-full items-center gap-5 px-2 py-6 text-left sm:px-5"
        >
          <span className={`flex-1 text-lg font-semibold tracking-[-0.02em] transition-colors duration-300 sm:text-xl ${open ? "text-accent" : "text-ink group-hover:text-accent"}`}>
            {item.q}
          </span>
          <span
            aria-hidden="true"
            className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-500 ${EASE} ${
              open ? "rotate-180 border-accent bg-accent text-cream" : "border-ink/15 text-ink group-hover:border-ink"
            }`}
          >
            <span className="absolute h-[1.5px] w-3.5 rounded-full bg-current" />
            <span className={`absolute h-3.5 w-[1.5px] rounded-full bg-current transition-transform duration-500 ${EASE} ${open ? "scale-y-0" : "scale-y-100"}`} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ${EASE} ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl px-2 pb-7 leading-relaxed text-ink/70 sm:px-5">{item.a}</p>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function Faq() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(ALL);
  const [openKey, setOpenKey] = useState<string | null>("ordering-0");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_GROUPS.filter((g) => tab === ALL || g.id === tab)
      .map((g) => ({
        ...g,
        items: g.items
          .map((item, i) => ({ item, key: `${g.id}-${i}` }))
          .filter(({ item }) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [query, tab]);

  const matches = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[86svh] items-end overflow-hidden bg-ink text-cream">
        <GlyphMorphScene />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,20,8,0.95)_8%,rgba(0,20,8,0.2)_50%,transparent)]" />
        <div className="relative w-full site-gutter pt-32 pb-[clamp(40px,7vh,88px)]">
          <div className="mx-auto">
            <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              FAQ · {TOTAL} answers
            </p>
            <h1 className="max-w-4xl text-[clamp(48px,9vw,140px)] leading-[0.88] font-extrabold tracking-[-0.06em]">
              Questions, <span className="text-accent">answered.</span>
            </h1>
            <div className="mt-10 max-w-xl">
              <label htmlFor="faq-search" className="sr-only">
                Search the FAQ
              </label>
              <div className="group relative">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-5 z-10 h-5 w-5 -translate-y-1/2 text-cream/50 transition-colors group-focus-within:text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" strokeLinecap="round" />
                </svg>
                <input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search — try “GST”, “proof” or “delivery”"
                  className="w-full rounded-full border border-cream/20 bg-ink/60 py-4 pr-5 pl-13 text-base text-cream backdrop-blur-md outline-none placeholder:text-cream/40 transition-[border-color,box-shadow] duration-300 focus:border-accent focus:shadow-[0_0_0_5px_rgba(189,85,1,0.2)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="bg-cream site-gutter py-[clamp(56px,8vw,110px)] text-ink">
        <div className="mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {/* Tabs */}
            <div role="tablist" aria-label="FAQ topics" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
              {[{ id: ALL, title: "All" }, ...FAQ_GROUPS].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === g.id}
                  onClick={() => setTab(g.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-[background-color,border-color,color] duration-300 ${
                    tab === g.id ? "border-ink bg-ink text-cream" : "border-ink/15 text-ink/75 hover:border-ink/50"
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm text-ink/50" aria-live="polite">
              {query ? `${matches} ${matches === 1 ? "answer" : "answers"} for “${query}”` : " "}
            </p>

            {groups.length === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-ink/20 p-10 text-center">
                <p className="text-xl font-semibold">No answers for that one yet.</p>
                <p className="mt-2 text-ink/60">Ask us directly — we reply within {QUOTE_SLA}.</p>
                <a
                  href={whatsappLink(`Hi Sonic Prints! I have a question: ${query}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-accent"
                >
                  Ask on WhatsApp
                </a>
              </div>
            ) : (
              groups.map((g) => (
                <Reveal key={g.id} className="mt-10 first-of-type:mt-6">
                  <h2 className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                    <span className="h-px w-8 bg-current" />
                    {g.title}
                  </h2>
                  <ul className="mt-3 overflow-hidden rounded-[24px] border-t border-ink/10">
                    {g.items.map(({ item, key }) => (
                      <Item key={key} index={key} item={item} open={openKey === key} onToggle={() => setOpenKey(openKey === key ? null : key)} />
                    ))}
                  </ul>
                </Reveal>
              ))
            )}
          </div>

          {/* Help card */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={150}>
              <div className="relative overflow-hidden rounded-[28px] bg-ink p-8 text-cream">
                <span aria-hidden="true" className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
                <p className="relative font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Still wondering?</p>
                <p className="relative mt-3 text-2xl leading-tight font-bold tracking-[-0.02em]">Ask INKA — real answers within {QUOTE_SLA}.</p>
                <div className="relative mt-6 flex flex-col gap-2">
                  <a
                    href={whatsappLink("Hi Sonic Prints! I have a question.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium transition-colors hover:bg-cream hover:text-ink"
                  >
                    WhatsApp us
                  </a>
                  <a href={CONTACT.phoneHref} className="rounded-full border border-cream/20 px-5 py-3 text-center text-sm font-medium transition-colors hover:border-cream">
                    Call {CONTACT.phone}
                  </a>
                </div>
                <Link href="/how-it-works" className="relative mt-6 block text-sm text-cream/65 underline decoration-accent underline-offset-4 hover:text-cream">
                  See how an order works →
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <CtaBand title="Got your answer?" text={`Then let's get your brand printed. Quotes within ${QUOTE_SLA}.`} />
    </>
  );
}
