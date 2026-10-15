"use client";

import { useRef } from "react";
import { CrewScene, type CrewControls } from "@/components/three";
import { Reveal } from "@/components/ui";
import { CREW } from "@/lib/site";

/** "Meet the crew": 3D cards that lift on hover and flip on click, with buttons for keyboard and touch. */
export default function Crew() {
  const controls = useRef<CrewControls | null>(null);

  return (
    <section id="crew" className="relative overflow-hidden bg-ink px-[clamp(16px,4vw,56px)] py-[clamp(80px,10vw,150px)] text-cream">
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              Who handles your order
            </p>
            <h2 className="max-w-2xl text-[clamp(36px,5.5vw,76px)] leading-[0.95] font-extrabold tracking-[-0.045em]">Meet the crew.</h2>
          </div>
          <p className="max-w-sm leading-relaxed text-cream/65">
            Every stage has an owner. Hover a card to meet them — tap to flip it and see what they do for you.
          </p>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-6 h-[175vw] max-h-[1150px] max-w-7xl sm:h-[95vw] md:h-[70vw] lg:h-[600px]">
        <CrewScene crew={CREW} controlsRef={controls} />
      </div>

      <ul className="relative mx-auto flex max-w-6xl flex-wrap justify-center gap-2" aria-label="Crew members">
        {CREW.map((m, i) => (
          <li key={m.name}>
            <button
              type="button"
              onMouseEnter={() => controls.current?.highlight(i)}
              onMouseLeave={() => controls.current?.highlight(-1)}
              onFocus={() => controls.current?.highlight(i)}
              onBlur={() => controls.current?.highlight(-1)}
              onClick={() => controls.current?.flip(i)}
              className="rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/75 transition-colors duration-300 hover:border-accent hover:text-cream focus-visible:border-accent focus-visible:text-cream focus-visible:outline-none"
            >
              <span className="font-bold text-cream">{m.name}</span> · {m.role}
              <span className="sr-only">. {m.does}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
