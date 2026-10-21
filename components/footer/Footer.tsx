"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import logo from "@/app/public/images/nav/soniclogo-trimmed.png";
import { CONTACT, mapsLink, whatsappLink } from "@/lib/site";
import ScrollToTop from "./ScrollToTop";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface FooterLink {
  label: string;
  href: string;
}

const HEADLINE = ["Print", "your", "brand", "on", "anything."];

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/#home" },
      { label: "About", href: "/#about" },
      { label: "Catalogue", href: "/catalogue" },
      { label: "Reviews", href: "/#reviews" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "FAQ", href: "/faq" },
      { label: "Get a Quote", href: "/contact" },
      { label: "Track Order", href: "/track" },
      { label: "WhatsApp", href: whatsappLink("Hi Sonic Prints!") },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: CONTACT.phone, href: CONTACT.phoneHref },
      { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
      { label: "Gandhipuram, Coimbatore", href: mapsLink },
      { label: "Instagram", href: "#" },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

const WORDMARK = "SONIC PRINTS";
const FALLBACK_YEAR = 2026;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** Side padding for every footer row. */
const GUTTER = "px-[clamp(12px,2vw,24px)]";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** True once the element has scrolled into view (stays true). */
function useReveal<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, shown] as const;
}

const reveal = (shown: boolean) =>
  `transition-[transform,opacity] duration-1000 ${EASE} ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const [colsRef, colsShown] = useReveal<HTMLDivElement>(0.2);
  const [markRef, markShown] = useReveal<HTMLDivElement>(0.3);
  const markTextRef = useRef<HTMLDivElement>(null);

  // The year is filled in on the client: Next.js disallows `new Date()` while prerendering.
  const yearRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (yearRef.current) yearRef.current.textContent = String(new Date().getFullYear());
  }, []);

  // Size the wordmark so it spans the full footer width exactly.
  useEffect(() => {
    const box = markRef.current;
    const text = markTextRef.current;
    if (!box || !text) return;
    const fit = () => {
      text.style.fontSize = "100px";
      const width = text.scrollWidth;
      const style = getComputedStyle(box);
      const inner = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (width > 0) text.style.fontSize = `${(100 * inner) / width}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [markRef]);

  return (
    <>
      <footer className="relative overflow-hidden bg-ink text-cream">
        <div className={GUTTER}>
          {/* Brand (logo + headline) and link columns */}
          <div
            ref={colsRef}
            className="grid grid-cols-3 gap-x-4 gap-y-8 pt-[clamp(28px,6vh,56px)] pb-[clamp(20px,4vh,40px)] sm:gap-x-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr]"
          >
            <div className="col-span-3 flex flex-col items-start gap-5 lg:col-span-1">
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-cream p-1.5 ${reveal(colsShown)}`}>
                <Image src={logo} alt="SonicPrints" className="h-full w-auto" sizes="56px" />
              </span>
              <h2 className="max-w-[14ch] text-[clamp(23px,7vw,35px)] leading-[0.92] font-extrabold tracking-[-0.05em] lg:text-[clamp(20px,3vw,40px)]">
                {HEADLINE.map((word, i) => (
                  <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <span
                      className={`inline-block transition-transform duration-1000 ${EASE} ${
                        colsShown ? "translate-y-0" : "translate-y-full"
                      } ${i === HEADLINE.length - 1 ? "text-accent" : ""}`}
                      style={{ transitionDelay: `${150 + i * 80}ms` }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </h2>
            </div>

            {COLUMNS.map((col, c) => (
              <div key={col.title} className={reveal(colsShown)} style={{ transitionDelay: `${120 + c * 100}ms` }}>
                <h3 className="mb-3 font-mono text-[10px] tracking-[0.2em] text-accent uppercase sm:text-[11px]">{col.title}</h3>
                <ul className="flex flex-col gap-1.5 sm:gap-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        {...(/^https?:/.test(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group inline-flex items-center gap-2 break-all text-[13px] text-cream/80 transition-colors hover:text-cream sm:text-[15px]"
                      >
                        <span className={`h-px w-0 bg-accent transition-[width] duration-300 ${EASE} group-hover:w-4`} />
                        <span className={`transition-transform duration-300 ${EASE} group-hover:translate-x-0.5`}>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Giant wordmark — full width, fading out toward the bottom */}
        <div
          ref={markRef}
          aria-hidden="true"
          className={`mt-[clamp(12px,3vh,32px)] overflow-hidden select-none [mask-image:linear-gradient(to_bottom,#000_15%,rgba(0,0,0,0.35)_55%,transparent_88%)] ${GUTTER}`}
        >
          <div ref={markTextRef} className="flex w-max text-[14.2vw] leading-[0.78] font-extrabold tracking-[-0.06em] text-cream/70">
            {WORDMARK.split("").map((ch, i) =>
              ch === " " ? (
                // A lone space collapses inside these letter boxes, so use a fixed gap instead.
                <span key={i} className="inline-block w-[0.28em]" />
              ) : (
              // Outer span: rise-in on reveal. Inner span: instant colour + quick lift on hover.
              <span
                key={i}
                className={`inline-block transition-transform duration-1000 ${EASE} ${markShown ? "translate-y-0" : "translate-y-[105%]"}`}
                style={{ transitionDelay: markShown ? `${i * 45}ms` : "0ms" }}
              >
                <span className="inline-block transition-transform duration-200 ease-out hover:-translate-y-[0.06em] hover:text-accent">
                  {ch}
                </span>
              </span>
              ),
            )}
          </div>
        </div>

        {/* Bottom bar — right side kept clear for the floating arrow */}
        <div
          className={`flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-cream/15 py-[clamp(10px,2vh,20px)] pr-20 text-[11px] text-cream/55 sm:text-xs ${GUTTER}`}
        >
          <p>
            © <span ref={yearRef}>{FALLBACK_YEAR}</span> SonicPrints. All rights reserved.
          </p>
          {LEGAL.map((link) => (
            <Link key={link.label} href={link.href} className="transition-colors hover:text-cream">
              {link.label}
            </Link>
          ))}
        </div>
      </footer>

      <ScrollToTop />
    </>
  );
}
