"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, type SyntheticEvent } from "react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const TITLE = ["About", "Us"];
const LABEL = "Custom printing for brands, teams and events";
const LEAD = {
  bold: "Print Anything:",
  text: "Bags, caps, standees, apparel, packaging and more — printed sharp, consistent and ready to use.",
};
const HEADING = ["Built Around", "Your Brand"];
const BODY =
  "At SonicPrints, we print on whatever you bring us — from business cards and tote bags to caps, standees and exhibition displays — and bundle it all into ready-made kits for every stage of your brand.";
const INDEX = "SonicPrints / 12 Kits";

const IMAGES = {
  main: {
    src: "https://images.unsplash.com/photo-1663433541063-ddab084d1126?auto=format&fit=crop&w=1800&q=90",
    alt: "A printer pulling a squeegee across a screen on a carousel press in a busy print shop",
  },
  side: {
    src: "https://images.unsplash.com/photo-1663433567177-9f94be0bff4c?auto=format&fit=crop&w=1200&q=90",
    alt: "Close-up of hands dragging orange ink across a print screen onto a black t-shirt",
  },
  fallback: "https://images.unsplash.com/photo-1456456496250-d5e7c0a9b44d?auto=format&fit=crop&w=1600&q=90",
};

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const CSS = `
.nf-root {
  --mouse-x: 0;
  --mouse-y: 0;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-reveal: cubic-bezier(0.77, 0, 0.18, 1);
  --r-main: clamp(24px, 3.15vw, 46px);
  --r-side: clamp(25px, 3.2vw, 46px);
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100svh;
  min-height: 480px;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 0;
  background: #f7f7f5;
  color: var(--brand-ink);
  font-family: var(--font-sans);
}

/* Title */
.nf-title {
  position: absolute;
  top: 9%;
  left: 3.65%;
  z-index: 5;
  margin: 0;
  font-family: var(--font-sans);
  font-size: clamp(48px, 6.4vw, 104px);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.045em;
  color: var(--brand-ink);
  pointer-events: none;
}
.nf-title-mask {
  display: block;
  overflow: hidden;
  padding-right: 0.09em;
  padding-bottom: 0.1em;
}
.nf-title-line {
  display: block;
  transform: translateY(115%);
}
.nf-root.is-in .nf-title-line {
  animation: nf-rise 1.05s var(--ease-out) both;
}
.nf-root.is-in .nf-title-mask:nth-child(2) .nf-title-line {
  animation-delay: 100ms;
}
/* Second line in the accent, like the other section headlines. */
.nf-title-mask:nth-child(2) .nf-title-line,
.nf-heading span:nth-child(2) {
  color: var(--brand-accent);
}

/* Left copy */
.nf-left {
  position: absolute;
  left: 3.7%;
  top: 56.7%;
  z-index: 4;
  width: min(205px, 19.5vw);
}
.nf-copy {
  margin: 0;
  font-size: clamp(10px, 0.83vw, 13px);
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: -0.025em;
  opacity: 0;
  transform: translateY(18px);
}
.nf-label {
  margin-bottom: clamp(28px, 8.5vh, 68px);
}
.nf-copy strong {
  font-weight: 600;
}
.nf-root.is-in .nf-label {
  animation: nf-fade-18 800ms var(--ease-out) 720ms both;
}
.nf-root.is-in .nf-lead {
  animation: nf-fade-18 800ms var(--ease-out) 830ms both;
}

/* Images (shared) */
.nf-figure {
  margin: 0;
  overflow: hidden;
}
.nf-figure img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.3s var(--ease-out);
  will-change: transform;
}
.nf-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.13), transparent 38%, rgba(0, 0, 0, 0.04));
  mix-blend-mode: soft-light;
}

/* Main image */
.nf-main {
  --scale: 1.055;
  position: absolute;
  top: 30.1%;
  left: 26.45%;
  width: 43.25%;
  height: 51.4%;
  min-height: 205px;
  z-index: 2;
  background: #e5e3de;
  border-radius: var(--r-main);
  clip-path: inset(0 100% 0 0 round var(--r-main));
}
.nf-main .nf-overlay {
  border-radius: var(--r-main);
}
.nf-main img {
  object-position: center 58%;
  transform: translate3d(calc(var(--mouse-x) * -8px), calc(var(--mouse-y) * -6px), 0) scale(var(--scale));
}
.nf-main:hover {
  --scale: 1.095;
}
.nf-root.is-in .nf-main {
  animation: nf-reveal-main 1.25s var(--ease-reveal) 280ms both;
}

/* Right panel */
.nf-aside {
  position: absolute;
  top: 30.8%;
  left: 72.35%;
  width: 25%;
  max-width: 390px;
  z-index: 3;
}
.nf-side {
  --scale: 1.075;
  position: relative;
  width: 100%;
  height: clamp(104px, 23.4vh, 205px);
  background: #ddd9d0;
  border-radius: var(--r-side);
  clip-path: inset(0 0 0 100% round var(--r-side));
}
.nf-side .nf-overlay {
  border-radius: var(--r-side);
}
.nf-side img {
  object-position: center 57%;
  transform: translate3d(calc(var(--mouse-x) * 7px), calc(var(--mouse-y) * 5px), 0) scale(var(--scale));
}
.nf-side:hover {
  --scale: 1.13;
}
.nf-root.is-in .nf-side {
  animation: nf-reveal-side 1.15s var(--ease-reveal) 440ms both;
}

.nf-right-text {
  padding-top: clamp(18px, 4.2vh, 35px);
}
.nf-heading-mask {
  overflow: hidden;
  padding-bottom: 0.08em;
}
.nf-heading {
  margin: 0;
  font-family: var(--font-sans);
  font-size: clamp(25px, 2.7vw, 45px);
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: -0.045em;
  color: var(--brand-ink);
  transform: translateY(115%);
}
.nf-heading span {
  display: block;
}
.nf-root.is-in .nf-heading {
  animation: nf-rise 900ms var(--ease-out) 810ms both;
}
.nf-body {
  max-width: 355px;
  margin: clamp(21px, 5.3vh, 43px) 0 0;
  font-size: clamp(10px, 0.83vw, 13px);
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: -0.025em;
  opacity: 0;
  transform: translateY(14px);
}
.nf-root.is-in .nf-body {
  animation: nf-fade-14 800ms var(--ease-out) 960ms both;
}

/* Index */
.nf-index {
  position: absolute;
  right: 2.3%;
  bottom: 3%;
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(0, 20, 8, 0.5);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(18px);
}
.nf-index::before {
  content: "";
  width: 28px;
  height: 1px;
  background: currentColor;
}
.nf-root.is-in .nf-index {
  animation: nf-fade-18 700ms var(--ease-out) 1.15s both;
}

/* Keyframes */
@keyframes nf-rise {
  from { transform: translateY(115%); }
  to { transform: translateY(0); }
}
@keyframes nf-fade-18 {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes nf-fade-14 {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes nf-reveal-main {
  from { clip-path: inset(0 100% 0 0 round var(--r-main)); }
  to { clip-path: inset(0 0 0 0 round var(--r-main)); }
}
@keyframes nf-reveal-side {
  from { clip-path: inset(0 0 0 100% round var(--r-side)); }
  to { clip-path: inset(0 0 0 0 round var(--r-side)); }
}

/* Tablet */
@media (max-width: 900px) {
  .nf-root {
    height: auto;
    min-height: 100svh;
    padding: 52px 24px 52px;
    overflow: visible;
  }
  .nf-title {
    position: relative;
    top: auto;
    left: auto;
    font-size: clamp(48px, 10vw, 84px);
    line-height: 0.95;
  }
  .nf-main {
    position: relative;
    top: auto;
    left: auto;
    width: 68%;
    height: 390px;
    min-height: 0;
    margin-top: 22px;
    margin-left: auto;
  }
  .nf-left {
    position: relative;
    top: auto;
    left: auto;
    width: 31%;
    margin-top: -250px;
    padding-right: 20px;
  }
  .nf-label {
    margin-bottom: 52px;
  }
  .nf-aside {
    position: relative;
    top: auto;
    left: auto;
    width: 56%;
    max-width: none;
    margin-top: 160px;
    margin-left: auto;
  }
  .nf-side {
    height: 210px;
  }
  .nf-index {
    display: none;
  }
}

/* Mobile */
@media (max-width: 620px) {
  .nf-root {
    padding: 40px 16px 44px;
  }
  .nf-title {
    font-size: clamp(44px, 14vw, 66px);
    letter-spacing: -0.045em;
  }
  .nf-root {
    --r-main: 27px;
    --r-side: 27px;
  }
  .nf-main {
    width: 100%;
    height: min(70vw, 330px);
    margin-top: 24px;
  }
  .nf-left {
    width: 100%;
    margin-top: 29px;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 28px;
  }
  .nf-label {
    margin-bottom: 0;
  }
  .nf-aside {
    width: 100%;
    margin-top: 58px;
  }
  .nf-side {
    height: min(51vw, 245px);
  }
  .nf-right-text {
    padding-top: 25px;
  }
  .nf-heading {
    font-size: clamp(34px, 10vw, 53px);
  }
  .nf-body {
    max-width: 88%;
    margin-top: 25px;
  }
  .nf-copy,
  .nf-body {
    font-size: 11px;
    line-height: 1.48;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nf-root *,
  .nf-root *::before {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
  }
  .nf-figure img {
    transition: none;
  }
}
`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/** Swap a broken image for the shared fallback (only once, to avoid loops). */
const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = IMAGES.fallback;
};

export default function About() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Play the entrance sequence when the section scrolls into view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          root.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(root);

    // Subtle cursor parallax: normalized -1..1 from the section centre, written once per frame.
    let raf = 0;
    let x = 0;
    let y = 0;
    const flush = () => {
      raf = 0;
      root.style.setProperty("--mouse-x", x.toFixed(4));
      root.style.setProperty("--mouse-y", y.toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      schedule();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      schedule();
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section id="about" ref={rootRef} className="nf-root" aria-labelledby="about-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <h2 id="about-title" className="nf-title">
        {TITLE.map((line) => (
          <span key={line} className="nf-title-mask">
            <span className="nf-title-line">{line}</span>
          </span>
        ))}
      </h2>

      <figure className="nf-figure nf-main">
        <img src={IMAGES.main.src} alt={IMAGES.main.alt} onError={handleImageError} draggable={false} />
        <span className="nf-overlay" aria-hidden="true" />
      </figure>

      <div className="nf-left">
        <p className="nf-copy nf-label">{LABEL}</p>
        <p className="nf-copy nf-lead">
          <strong>{LEAD.bold}</strong> {LEAD.text}
        </p>
      </div>

      <aside className="nf-aside">
        <figure className="nf-figure nf-side">
          <img src={IMAGES.side.src} alt={IMAGES.side.alt} onError={handleImageError} draggable={false} />
          <span className="nf-overlay" aria-hidden="true" />
        </figure>
        <div className="nf-right-text">
          <div className="nf-heading-mask">
            <h3 className="nf-heading">
              {HEADING.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h3>
          </div>
          <p className="nf-body">{BODY}</p>
        </div>
      </aside>

      <div className="nf-index" aria-hidden="true">
        {INDEX}
      </div>
    </section>
  );
}
