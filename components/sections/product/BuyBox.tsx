"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AddToCart } from "@/components/cart";
import { itemKey, useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";
import { CONTACT, QUOTE_SLA, whatsappLink } from "@/lib/site";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

function Option({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm text-ink/60">
        {label}: <span className="font-semibold text-ink">{value}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={`rounded-xl border px-3.5 py-2 text-sm transition-[border-color,background-color,color,box-shadow] duration-300 active:scale-95 ${
              value === v ? "border-accent bg-accent/[0.06] font-semibold text-ink shadow-[0_0_0_3px_rgba(189,85,1,0.12)]" : "border-ink/15 bg-white text-ink/75 hover:border-ink/45"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-ink/75">
      <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/10 text-[12px] text-accent">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

/** Options, quantity and the quote actions — the "buy box". */
export default function BuyBox({ product }: { product: Product }) {
  const [picks, setPicks] = useState<Record<string, string>>(() => Object.fromEntries(product.options.map((o) => [o.label, o.values[0]])));
  const { items } = useCart();
  const qty = items.find((i) => i.key === itemKey(product.slug, picks))?.qty ?? 1;

  const message = [
    `Hi Sonic Prints! I'd like a quote for ${product.name}.`,
    "",
    ...product.options.map((o) => `${o.label}: ${picks[o.label]}`),
    `Quantity: ${qty}`,
    "",
    "Please share the price and timeline.",
  ].join("\n");

  return (
    <div className="space-y-6">
      {product.options.map((o) => (
        <Option key={o.label} label={o.label} values={o.values} value={picks[o.label]} onChange={(v) => setPicks((p) => ({ ...p, [o.label]: v }))} />
      ))}

      <div>
        <AddToCart product={product} options={picks} size="md" />
      </div>

      <div className="rounded-[24px] border border-ink/10 bg-white p-5 shadow-[0_30px_60px_-40px_rgba(0,20,8,0.4)] sm:p-6">
        <p className="text-sm text-ink/55">Price</p>
        <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-ink">Custom quote</p>
        <p className="mt-1 text-sm text-ink/60">
          Exact price for your options within <span className="font-semibold text-accent">{QUOTE_SLA}</span>. Same price for everyone.
        </p>

        <ul className="mt-5 space-y-2.5">
          <Row icon="⏱">Ready in {product.turnaround}</Row>
          <Row icon="✎">Free design help and a proof before printing</Row>
          <Row icon="⌂">Pick up at our Gandhipuram HQ or get it delivered</Row>
        </ul>

        <div className="mt-6 grid gap-2.5">
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between overflow-hidden rounded-full bg-accent py-2 pr-2 pl-6 font-semibold text-cream"
          >
            <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full bg-ink transition-transform duration-500 ${EASE} group-hover:translate-y-0`} />
            <span className="relative">Get a quote on WhatsApp</span>
            <span aria-hidden="true" className={`relative grid h-10 w-10 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>
              →
            </span>
          </a>
          <Link
            href={`/contact?kit=${product.kit}`}
            className="rounded-full border border-ink/15 px-6 py-3 text-center text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink"
          >
            Fill the quote form
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-ink/45">Prefer to call? {CONTACT.phone}</p>
      </div>
    </div>
  );
}
