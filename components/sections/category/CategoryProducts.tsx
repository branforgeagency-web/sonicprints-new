import Link from "next/link";
import { AddToCart } from "@/components/cart";
import { CtaBand, ProductMedia, Reveal } from "@/components/ui";
import { CATEGORIES, type Category } from "@/lib/products";

/** One catalogue category: its intro, every product in it (with add to cart), and links to the other categories. */
export default function CategoryProducts({ category }: { category: Category }) {
  return (
    <>
      <section className="site-gutter bg-cream pt-[clamp(104px,12vw,140px)] pb-[clamp(56px,7vw,96px)] text-ink">
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
            <li aria-current="page" className="font-medium text-ink">{category.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-8 bg-current" />
              Category {category.number} · {category.products.length} products
            </p>
            <h1 className="text-[clamp(34px,5vw,68px)] leading-[0.98] font-extrabold tracking-[-0.045em]">{category.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink/70">{category.description}</p>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {category.products.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 4) * 70}>
              <div className="group flex h-full flex-col rounded-[24px] bg-white p-3 ring-1 ring-ink/[0.06] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(0,20,8,0.4)] sm:p-4">
                <Link href={`/products/${p.slug}`} className="flex flex-1 flex-col rounded-[18px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                  <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f1f1f1]">
                    <ProductMedia
                      image={p.image}
                      alt={p.alt}
                      name={p.name}
                      label={category.name}
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  </div>
                  <h2 className="mt-3 px-1 text-base leading-snug font-bold tracking-[-0.02em] group-hover:text-accent sm:text-lg">{p.name}</h2>
                  <span className="mt-auto px-1 pt-1 text-xs text-ink/50">View details →</span>
                </Link>
                <div className="mt-3 border-t border-ink/[0.07] pt-3">
                  <AddToCart product={p} />
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* other categories */}
      <section className="site-gutter bg-white py-[clamp(48px,6vw,80px)] text-ink">
        <h2 className="text-xl font-extrabold tracking-[-0.03em]">More categories</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categories/${c.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-cream px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                <span className="font-mono text-[11px] text-accent">{c.number}</span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand title="Need something not listed?" text="If it holds ink, we can print it — tell us what you need and get a quote within 2 working hours." />
    </>
  );
}
