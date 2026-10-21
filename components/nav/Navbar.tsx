"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "@/app/public/images/nav/soniclogo-trimmed.png";
import { CartButton } from "@/components/cart";
import { LoginButton } from "@/components/auth";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Track Order", href: "/track" },
];

const CTA: NavLink = { label: "Get a Quote", href: "/contact" };
const TAGLINE = "Custom printing on anything — in 12 ready-made kits.";

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

const SCROLLED_AT = 24; // px before the bar condenses
const HIDE_AFTER = 160; // px before scrolling down can hide the bar
const DIRECTION_THRESHOLD = 6; // px of travel needed to count as a direction change
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const sectionId = (href: string) => href.split("#")[1] ?? "";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sectionActive, setSectionActive] = useState(-1);
  const pathname = usePathname();
  // On the home page the highlighted link follows the section on screen; elsewhere it matches the route.
  const active = pathname === "/" ? sectionActive : NAV_LINKS.findIndex((l) => l.href === pathname);

  // Condense after a little scroll; hide while scrolling down, reveal on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled(y > SCROLLED_AT);
      const dy = y - lastY;
      if (Math.abs(dy) < DIRECTION_THRESHOLD) return;
      setHidden(dy > 0 && y > HIDE_AFTER);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section is on screen so its link stays highlighted (re-run after client navigation).
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = NAV_LINKS.map((l) => document.getElementById(sectionId(l.href)));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = sections.indexOf(entry.target as HTMLElement);
          if (i >= 0) setSectionActive(i);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  // Mobile menu: lock page scroll, close on Escape or when widening to desktop.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onBreakpoint = () => {
      if (desktop.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 transition-transform duration-500 ${EASE} sm:px-5 sm:pt-4 ${
        hidden && !open ? "-translate-y-[140%]" : "translate-y-0"
      }`}
    >
      {/* Bar */}
      <nav
        aria-label="Main"
        className={`relative z-50 mx-auto flex max-w-6xl animate-[nav-drop_0.9s_cubic-bezier(0.22,1,0.36,1)_both] items-center justify-between gap-3 rounded-full border border-white/70 bg-cream/80 px-3 ring-1 ring-ink/[0.06] backdrop-blur-xl transition-[padding,box-shadow] duration-500 motion-reduce:animate-none sm:px-4 md:grid md:grid-cols-[1fr_auto_1fr] ${
          scrolled
            ? "py-1.5 shadow-[0_14px_40px_-18px_rgba(0,20,8,0.45)]"
            : "py-2 shadow-[0_8px_30px_-22px_rgba(0,20,8,0.35)]"
        }`}
      >
        {/* Logo — full mark and wordmark */}
        <Link
          href="/#home"
          onClick={close}
          aria-label="SonicPrints home"
          className={`group flex shrink-0 items-center justify-self-start transition-[height] duration-500 ${EASE} ${
            scrolled ? "h-10 sm:h-12" : "h-12 sm:h-14"
          }`}
        >
          <Image
            src={logo}
            alt="SonicPrints"
            priority
            sizes="120px"
            className={`h-full w-auto transition-transform duration-500 ${EASE} group-hover:scale-[1.06]`}
          />
        </Link>

        {/* Desktop links: text turns orange and an underline grows in from the left */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link, i) => (
            <li key={link.label}>
              <Link
                href={link.href}
                aria-current={active === i ? "location" : undefined}
                className="group relative block px-3 py-2 text-sm font-medium text-ink transition-colors hover:text-accent lg:px-4"
              >
                {link.label}
                <span
                  className={`absolute inset-x-3 bottom-1 h-px origin-left bg-current transition-transform duration-300 ease-out group-hover:scale-x-100 lg:inset-x-4 ${
                    active === i ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 justify-self-end">
          <CartButton />
          <div className="hidden md:block">
            <LoginButton />
          </div>
          {/* CTA (desktop) */}
          <Link
            href={CTA.href}
            className="group relative hidden items-center gap-3 overflow-hidden rounded-full bg-ink py-1.5 pr-1.5 pl-5 text-sm font-medium text-white md:inline-flex"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ${EASE} group-hover:translate-y-0`}
            />
            <span className="relative">{CTA.label}</span>
            <span
              aria-hidden="true"
              className={`relative grid h-8 w-8 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}
            >
              →
            </span>
          </Link>

          {/* Menu toggle (mobile) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors duration-300 md:hidden ${
              open ? "bg-accent" : "bg-ink"
            }`}
          >
            <span
              className={`absolute h-[1.5px] w-[18px] rounded-full bg-current transition-transform duration-500 ${EASE} ${
                open ? "rotate-45" : "-translate-y-1"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-[18px] rounded-full bg-current transition-transform duration-500 ${EASE} ${
                open ? "-rotate-45" : "translate-y-1"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-cream px-5 pt-28 pb-8 transition-[clip-path,visibility] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] sm:px-8 sm:pt-32 md:hidden ${
          open
            ? "visible [clip-path:circle(150%_at_calc(100%-2.5rem)_2.75rem)]"
            : "invisible [clip-path:circle(0%_at_calc(100%-2.5rem)_2.75rem)]"
        }`}
      >
        <ul className="flex flex-col border-t border-ink/10">
          {NAV_LINKS.map((link, i) => (
            <li key={link.label} className="overflow-hidden border-b border-ink/10">
              <Link
                href={link.href}
                onClick={close}
                aria-current={active === i ? "location" : undefined}
                className={`group flex items-baseline gap-3 py-3 transition-[transform,opacity] duration-700 ${EASE} ${
                  open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                }`}
                style={{ transitionDelay: open ? `${200 + i * 70}ms` : "0ms" }}
              >
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={`text-[clamp(36px,12vw,60px)] leading-none font-extrabold tracking-[-0.045em] transition-colors duration-300 group-hover:text-accent ${
                    active === i ? "text-accent" : "text-ink"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className={`mt-10 flex flex-col gap-5 transition-[transform,opacity] duration-700 ${EASE} ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: open ? `${200 + NAV_LINKS.length * 70}ms` : "0ms" }}
        >
          <p className="max-w-[18rem] text-sm leading-relaxed text-ink/70">{TAGLINE}</p>
          <LoginButton variant="block" onOpen={close} />
          <Link
            href={CTA.href}
            onClick={close}
            className="flex items-center justify-between rounded-full bg-ink py-2 pr-2 pl-6 text-base font-medium text-white transition-colors duration-300 hover:bg-accent"
          >
            {CTA.label}
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-cream text-ink">
              →
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
