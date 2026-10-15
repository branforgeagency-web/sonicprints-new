"use client";

import { useState, type ReactNode } from "react";
import { Reveal } from "@/components/ui";
import { CONTACT, POSITIONING, QUOTE_SLA, mapsEmbed, mapsLink, whatsappLink } from "@/lib/site";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** Height of Google's place card in the embed — the iframe is shifted up by this much to crop it out. */
const MAP_CROP = 190;

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const ICONS = {
  phone: icon(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />),
  mail: icon(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>,
  ),
  pin: icon(
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>,
  ),
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

interface Action {
  label: string;
  href?: string;
  external?: boolean;
  /** Text copied to the clipboard instead of following a link. */
  copy?: string;
  primary?: boolean;
}

function ActionButton({ action }: { action: Action }) {
  const [copied, setCopied] = useState(false);
  const cls = `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,border-color,transform] duration-300 active:scale-95 ${
    action.primary ? "bg-accent text-cream hover:bg-cream hover:text-ink" : "border border-cream/20 text-cream/85 hover:border-cream hover:text-cream"
  }`;

  if (action.copy) {
    const text = action.copy;
    return (
      <button
        type="button"
        className={cls}
        onClick={() => {
          navigator.clipboard
            ?.writeText(text)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            })
            .catch(() => {});
        }}
      >
        <span aria-live="polite">{copied ? "Copied ✓" : action.label}</span>
      </button>
    );
  }
  return (
    <a href={action.href} className={cls} {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {action.label}
    </a>
  );
}

interface RowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  note: string;
  actions: Action[];
  delay: number;
  /** Put the actions under the text instead of beside it (for long values). */
  stacked?: boolean;
}

function ChannelRow({ icon, label, value, note, actions, delay, stacked = false }: RowProps) {
  return (
    <Reveal delay={delay} className="group relative border-b border-cream/10 py-7 first:border-t">
      {/* Accent wash that sweeps in on hover */}
      <span aria-hidden="true" className={`pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-accent/12 to-transparent transition-transform duration-700 ${EASE} group-hover:scale-x-100`} />
      <div className={`relative flex flex-col gap-5 ${stacked ? "" : "sm:flex-row sm:items-center sm:justify-between"}`}>
        <div className="flex items-start gap-4">
          <span className={`mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream/[0.06] text-accent transition-[background-color,color,transform] duration-500 ${EASE} group-hover:-rotate-12 group-hover:bg-accent group-hover:text-cream`}>
            {icon}
          </span>
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-cream/45 uppercase">{label}</p>
            <div className={`mt-1.5 text-[clamp(20px,2.4vw,30px)] leading-tight font-bold tracking-[-0.02em] transition-transform duration-500 ${EASE} group-hover:translate-x-1`}>{value}</div>
            <p className="mt-1 text-sm text-cream/55">{note}</p>
          </div>
        </div>
        <div className={`flex shrink-0 flex-wrap gap-2 pl-15 ${stacked ? "" : "sm:pl-0"}`}>
          {actions.map((a) => (
            <ActionButton key={a.label} action={a} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ContactSection() {
  const address = CONTACT.address.join(" ");

  return (
    <section className="relative overflow-hidden bg-ink px-[clamp(16px,4vw,56px)] py-[clamp(80px,10vw,140px)] text-cream">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 h-[460px] w-[460px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              Contact
            </p>
            <h2 className="text-[clamp(36px,5.5vw,76px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
              Rather talk it <span className="text-accent">through?</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="leading-relaxed text-cream/65">{POSITIONING} Come say hello.</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cream/15 px-3.5 py-1.5 text-sm text-cream/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Replies within {QUOTE_SLA}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Channels */}
          <div>
            <ChannelRow
              delay={0}
              icon={ICONS.phone}
              label="WhatsApp or call"
              value={CONTACT.phone}
              note="Fastest way to reach INKA at the front office"
              actions={[
                { label: "WhatsApp", href: whatsappLink("Hi Sonic Prints!"), external: true, primary: true },
                { label: "Call", href: CONTACT.phoneHref },
              ]}
            />
            <ChannelRow
              delay={90}
              icon={ICONS.mail}
              label="Email"
              value={<span className="break-all">{CONTACT.email}</span>}
              note="Best for detailed briefs, artwork and files"
              actions={[
                { label: "Send email", href: `mailto:${CONTACT.email}`, primary: true },
                { label: "Copy", copy: CONTACT.email },
              ]}
            />
            <ChannelRow
              delay={180}
              icon={ICONS.pin}
              label="Visit HQ"
              stacked
              value={
                <span className="block text-[clamp(17px,1.8vw,22px)] leading-snug font-semibold">
                  {CONTACT.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              }
              note="Walk in for samples, finishes and a chat about your brand"
              actions={[
                { label: "Directions", href: mapsLink, external: true, primary: true },
                { label: "Copy address", copy: address },
              ]}
            />
          </div>

          {/* Map */}
          <Reveal delay={120} className="h-full">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Sonic Prints HQ in Google Maps"
              className="group relative block h-full min-h-[380px] overflow-hidden rounded-[28px] border border-cream/10 bg-[#0b2414]"
            >
              {/* Google's place card is cropped off the top; the map is a non-interactive preview. */}
              <iframe
                title="Map showing Sonic Prints HQ in Gandhipuram, Coimbatore"
                src={mapsEmbed}
                loading="lazy"
                tabIndex={-1}
                referrerPolicy="no-referrer-when-downgrade"
                className={`pointer-events-none absolute inset-x-0 w-full scale-[1.02] [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.55)_brightness(0.95)_contrast(0.95)] transition-transform duration-[1200ms] ${EASE} group-hover:scale-[1.07]`}
                style={{ top: -MAP_CROP, height: `calc(100% + ${MAP_CROP}px)` }}
              />
              {/* Brand tint + vignette */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/25 mix-blend-multiply" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,20,8,0.75))]" />

              {/* Location card */}
              <span className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-cream/10 bg-ink/80 p-4 backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-5">
                <span className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-cream">{ICONS.pin}</span>
                  <span>
                    <span className="block font-bold">Sonic Prints HQ</span>
                    <span className="block text-sm text-cream/60">Cross Cut Road, Gandhipuram</span>
                  </span>
                </span>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>
                  →
                </span>
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
