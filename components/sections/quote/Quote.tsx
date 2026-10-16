import { Suspense } from "react";
import { QuoteScene } from "@/components/three";
import { Reveal } from "@/components/ui";
import { kitBySlug } from "@/lib/kits";
import { QUOTE_SLA } from "@/lib/site";
import ContactSection from "./ContactSection";
import QuoteForm from "./QuoteForm";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const PROMISES = [`Quote within ${QUOTE_SLA}`, "Same price for everyone", "Design help included"];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** Pre-selects a kit ("/contact?kit=packaging") or the audience ("/contact?type=b2c"). Reads the URL, so it renders inside Suspense. */
async function KitAwareForm({ searchParams }: { searchParams: SearchParams }) {
  const { kit, type } = await searchParams;
  const match = typeof kit === "string" ? kitBySlug(kit) : undefined;
  // A kit always means a business order.
  const initialType = !match && typeof type === "string" && type.toLowerCase() === "b2c" ? "B2C" : "B2B";
  return <QuoteForm initialNeeds={match ? [match.title] : []} initialType={initialType} />;
}

export default function Quote({ searchParams }: { searchParams: SearchParams }) {

  return (
    <>
      {/* Form + floating products */}
      <section className="relative overflow-clip bg-cream text-ink">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* 3D scene — on top for mobile, pinned on the right for desktop */}
          <div className="relative h-[calc(44svh+5rem)] min-h-[380px] lg:order-2 lg:h-auto">
            <div className="absolute inset-x-0 top-20 bottom-0 lg:sticky lg:top-0 lg:h-svh">
              <QuoteScene />
              <p className="pointer-events-none absolute bottom-8 left-6 hidden max-w-[16rem] text-sm text-ink/50 lg:block">
                Cards, mugs, boxes, totes, banners, stickers — if it holds ink, we print it.
              </p>
            </div>
          </div>

          <div className="relative site-gutter pt-4 pb-[clamp(64px,8vw,120px)] lg:order-1 lg:pt-36">
            <Reveal>
              <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                <span className="h-px w-8 bg-current" />
                Get a quote
              </p>
              <h1 className="text-[clamp(44px,6.5vw,96px)] leading-[0.92] font-extrabold tracking-[-0.055em]">
                Tell us what to print. <span className="text-accent">We&apos;ll price it fast.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70 md:text-lg">
                Pick what you need, share a few details, and INKA from our front office gets back to you with a clear price — on WhatsApp, email or a call.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {PROMISES.map((p) => (
                  <li key={p} className="flex items-center gap-2 rounded-full bg-ink/[0.06] px-3.5 py-1.5 text-sm text-ink/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="mt-10" delay={150}>
              <Suspense fallback={<QuoteForm />}>
                <KitAwareForm searchParams={searchParams} />
              </Suspense>
            </Reveal>
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
