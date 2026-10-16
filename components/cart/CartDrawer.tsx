"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ProductMedia } from "@/components/ui";
import { cart, useCart } from "@/lib/cart";
import { productBySlug } from "@/lib/products";
import { QUOTE_SLA, whatsappLink } from "@/lib/site";
import QtyStepper from "./QtyStepper";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Slide-out quote cart: edit quantities, remove lines, then send everything as one quote request. */
export default function CartDrawer() {
  const { items, open, count } = useCart();

  // Esc closes; lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.close();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const message = [
    "Hi Sonic Prints! I'd like a quote for these items:",
    "",
    ...items.flatMap((item, i) => {
      const p = productBySlug(item.slug);
      const opts = Object.entries(item.options)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return [`${i + 1}. ${p?.name ?? item.slug} × ${item.qty}${opts ? ` (${opts})` : ""}`];
    }),
    "",
    "Please share the price and timeline.",
  ].join("\n");

  return (
    <div aria-hidden={!open} inert={!open} className={`fixed inset-0 z-[60] ${open ? "visible" : "invisible"}`}>
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={-1}
        onClick={cart.close}
        className={`absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Quote cart"
        className={`absolute top-0 right-0 flex h-full w-full max-w-[440px] flex-col bg-cream text-ink shadow-[-30px_0_80px_-30px_rgba(0,20,8,0.5)] transition-transform duration-500 ${EASE} ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em]">Your cart</h2>
            <p className="text-sm text-ink/55">
              {count ? `${items.length} ${items.length === 1 ? "product" : "products"} · ${count.toLocaleString("en-IN")} ${count === 1 ? "piece" : "pieces"}` : "Nothing added yet"}
            </p>
          </div>
          <button
            type="button"
            onClick={cart.close}
            aria-label="Close cart"
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-lg text-cream transition-colors hover:bg-accent"
          >
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-full bg-white text-2xl ring-1 ring-ink/10">
              🛒
            </span>
            <p className="text-ink/60">Add products to build one quote request for everything you need.</p>
            <Link href="/#products" onClick={cart.close} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-accent">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
              {items.map((item) => {
                const p = productBySlug(item.slug);
                if (!p) return null;
                return (
                  <li key={item.key} className="flex gap-4 rounded-[20px] bg-white p-3 ring-1 ring-ink/[0.06]">
                    <Link href={`/products/${p.slug}`} onClick={cart.close} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f1f1f1]">
                      <ProductMedia image={p.image} alt={p.alt} name={p.name} sizes="80px" compact />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${p.slug}`} onClick={cart.close} className="font-bold tracking-[-0.02em] hover:text-accent">
                          {p.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => cart.remove(item.key)}
                          aria-label={`Remove ${p.name}`}
                          className="text-xs font-medium text-ink/45 underline-offset-2 hover:text-accent hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      {Object.keys(item.options).length > 0 && (
                        <p className="mt-0.5 truncate text-xs text-ink/55">{Object.values(item.options).join(" · ")}</p>
                      )}
                      <QtyStepper size="sm" value={item.qty} onChange={(q) => cart.setQty(item.key, q)} label={`${p.name} quantity`} className="mt-2" />
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-ink/10 bg-white px-5 py-5 sm:px-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink/60">Total pieces</span>
                <span className="text-xl font-extrabold tabular-nums">{count.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">Prices for everything quoted within {QUOTE_SLA}.</p>
              <Link
                href="/checkout"
                onClick={cart.close}
                className="group relative mt-4 flex items-center justify-between overflow-hidden rounded-full bg-accent py-2 pr-2 pl-6 font-semibold text-cream"
              >
                <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full bg-ink transition-transform duration-500 ${EASE} group-hover:translate-y-0`} />
                <span className="relative">Place order</span>
                <span aria-hidden="true" className={`relative grid h-10 w-10 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>
                  →
                </span>
              </Link>
              <div className="mt-3 flex items-center justify-between text-sm">
                <a
                  href={whatsappLink(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink/70 underline decoration-ink/20 underline-offset-4 hover:text-ink"
                >
                  Just get a quote on WhatsApp
                </a>
                <button type="button" onClick={cart.clear} className="text-ink/45 hover:text-accent">
                  Clear cart
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
