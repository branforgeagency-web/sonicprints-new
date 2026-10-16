import Link from "next/link";
import { QUOTE_SLA, whatsappLink } from "@/lib/site";
import Reveal from "./Reveal";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

interface Props {
  title?: string;
  text?: string;
}

/** Closing call-to-action: quote form + WhatsApp. */
export default function CtaBand({
  title = "Ready when you are.",
  text = `Tell us what you need — you'll have a quote within ${QUOTE_SLA}.`,
}: Props) {
  return (
    <section className="bg-cream site-gutter py-[clamp(64px,2vw,120px)]">
      <Reveal className="relative mx-auto flex flex-col items-start gap-8 overflow-hidden rounded-[clamp(28px,3.5vw,48px)] bg-accent p-[clamp(28px,5vw,72px)] text-cream md:flex-row md:items-end md:justify-between">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full border-[40px] border-cream/10"
        />
        <div className="relative max-w-xl">
          <h2 className="text-[clamp(36px,5.5vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]">{title}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cream/85 md:text-lg">{text}</p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-ink py-2 pr-2 pl-6 font-medium text-cream"
          >
            <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full bg-cream transition-transform duration-500 ${EASE} group-hover:translate-y-0`} />
            <span className={`relative transition-colors duration-500 group-hover:text-ink`}>Get a quote</span>
            <span aria-hidden="true" className={`relative grid h-10 w-10 place-items-center rounded-full bg-accent transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>
              →
            </span>
          </Link>
          <a
            href={whatsappLink("Hi Sonic Prints! I'd like to know more.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-cream/40 px-6 py-3 font-medium transition-colors duration-300 hover:bg-cream hover:text-accent"
          >
            WhatsApp us
          </a>
        </div>
      </Reveal>
    </section>
  );
}
