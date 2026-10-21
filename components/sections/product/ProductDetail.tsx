import Link from "next/link";
import { CtaBand, Reveal } from "@/components/ui";
import { productBySlug, type Product } from "@/lib/products";
import { QUOTE_SLA } from "@/lib/site";
import BuyBox from "./BuyBox";
import ProductGallery from "./ProductGallery";

const STEPS = [
  { title: "Tell us what you need", text: "Pick your options here, or message us on WhatsApp." },
  { title: "Get your quote", text: `A clear price and timeline within ${QUOTE_SLA}.` },
  { title: "Approve the design", text: "We share a proof — nothing prints until you say yes." },
  { title: "Printed & delivered", text: "Quality-checked, packed, and ready for pickup or delivery." },
];

const BADGES = [`Quote in ${QUOTE_SLA}`, "Design help included", "Same price for everyone"];

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="mb-2 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
        <span className="h-px w-8 bg-current" />
        {eyebrow}
      </p>
      <h2 className="text-[clamp(26px,3vw,40px)] leading-none font-extrabold tracking-[-0.04em]">{title}</h2>
    </div>
  );
}

/** Full product page: gallery, buy box, details, specs, ordering steps, FAQ and related products. */
export default function ProductDetail({ product }: { product: Product }) {
  const related = product.related.map(productBySlug).filter((p): p is Product => !!p);

  return (
    <>
      <section className="bg-cream site-gutter pt-[clamp(104px,12vw,140px)] pb-[clamp(56px,7vw,96px)] text-ink">
        <div className="mx-auto">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ink/55">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-accent">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/#products" className="hover:text-accent">Products</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/categories/${product.category.slug}`} className="hover:text-accent">{product.category.name}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-ink">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ProductGallery image={product.image} alt={product.alt} name={product.name} label={product.category.name} />
            </div>

            <div>
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.07] px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-accent uppercase transition-colors hover:bg-accent/15"
              >
                {product.category.number} · {product.category.name}
              </Link>
              <h1 className="mt-4 text-[clamp(36px,5vw,64px)] leading-[0.95] font-extrabold tracking-[-0.045em]">{product.name}</h1>
              <p className="mt-3 text-lg leading-relaxed text-ink/70">{product.tagline}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <li key={b} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink/75 ring-1 ring-ink/10">
                    <span aria-hidden="true" className="text-accent">✓</span>
                    {b}
                  </li>
                ))}
              </ul>

              <hr className="my-7 border-ink/10" />
              <BuyBox product={product} />

              <div className="mt-10">
                <h2 className="text-xl font-extrabold tracking-[-0.03em]">About this item</h2>
                <p className="mt-3 leading-relaxed text-ink/70">{product.description}</p>
                <ul className="mt-4 space-y-2.5">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex gap-3 leading-relaxed text-ink/80">
                      <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* specifications + print methods + ideal for */}
      <section className="bg-white site-gutter py-[clamp(56px,7vw,96px)] text-ink">
        <div className="mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Reveal>
            <SectionTitle eyebrow="Details" title="Specifications" />
            <dl className="overflow-hidden rounded-[24px] ring-1 ring-ink/10">
              {(product.specs.some(([k]) => k === "Turnaround")
                ? product.specs
                : [...product.specs, ["Turnaround", product.turnaround] as [string, string]]
              ).map(([k, v], i) => (
                <div key={k} className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-4 text-sm ${i % 2 ? "bg-white" : "bg-cream/60"}`}>
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="text-ink/70">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="space-y-10">
            <div>
              <SectionTitle eyebrow="How we print it" title="Print methods" />
              <ul className="flex flex-wrap gap-2">
                {product.printMethods.map((m) => (
                  <li key={m} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream">{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <SectionTitle eyebrow="Popular with" title="Ideal for" />
              <ul className="grid grid-cols-2 gap-3">
                {product.idealFor.map((u) => (
                  <li key={u} className="rounded-2xl bg-cream px-4 py-3 text-sm font-medium text-ink/80 ring-1 ring-ink/5">{u}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* related */}
      <section className="bg-white site-gutter py-[clamp(56px,1vw,96px)] text-ink">
        <div className="mx-auto">
          <Reveal>
            <SectionTitle eyebrow="Often printed together" title="Related products" />
          </Reveal>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((r, i) => (
              <Reveal as="li" key={r.slug} delay={i * 90}>
                <Link
                  href={`/products/${r.slug}`}
                  className="group flex h-full flex-col justify-between gap-8 rounded-[24px] bg-cream p-6 ring-1 ring-ink/5 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-36px_rgba(0,20,8,0.4)]"
                >
                  <div>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">{r.category.name}</span>
                    <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">{r.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{r.text}</p>
                  </div>
                  <span className="inline-flex items-center gap-3 text-sm font-semibold">
                    View details
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream transition-[transform,background-color] duration-500 group-hover:-rotate-45 group-hover:bg-accent">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title={`Let's print your ${product.name.toLowerCase()}.`} />
    </>
  );
}
