"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { ProductMedia } from "@/components/ui";
import { cart, useCart } from "@/lib/cart";
import { orderMessage, placeOrder, type Order } from "@/lib/orders";
import { productBySlug } from "@/lib/products";
import { QUOTE_SLA, whatsappLink } from "@/lib/site";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const validPhone = (v: string) => /^(\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""));
const validEmail = (v: string) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const inputClass = (invalid?: boolean) =>
  `w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 outline-none transition-[border-color,box-shadow] duration-300 focus:border-ink focus:shadow-[0_0_0_4px_rgba(189,85,1,0.15)] ${
    invalid ? "border-accent" : "border-ink/15"
  }`;

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-ink/45">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-accent">{error}</span>}
    </label>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; sub: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-2xl border px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-300 ${
            value === o.value ? "border-accent bg-accent/[0.06] shadow-[0_0_0_3px_rgba(189,85,1,0.12)]" : "border-ink/15 bg-white hover:border-ink/40"
          }`}
        >
          <span className="block font-semibold text-ink">{o.label}</span>
          <span className="block text-xs text-ink/55">{o.sub}</span>
        </button>
      ))}
    </div>
  );
}

/** Checkout: customer details + order summary → places the order and hands it to WhatsApp. */
export default function Checkout() {
  const router = useRouter();
  const { items, count } = useCart();
  const [type, setType] = useState<Order["type"]>("B2B");
  const [fulfilment, setFulfilment] = useState<Order["fulfilment"]>("Pickup");
  const [f, setF] = useState({ name: "", business: "", phone: "", email: "", address: "", notes: "" });
  const [touched, setTouched] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const errors = {
    name: f.name.trim() ? "" : "Please tell us your name.",
    business: type === "B2C" || f.business.trim() ? "" : "Please add your company or brand name.",
    phone: validPhone(f.phone) ? "" : "Enter a 10-digit mobile number.",
    email: validEmail(f.email.trim()) ? "" : "That email doesn't look right.",
    address: fulfilment === "Pickup" || f.address.trim().length > 8 ? "" : "Please add the delivery address.",
  };
  const valid = Object.values(errors).every((e) => !e);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || !items.length) return;
    const order = placeOrder({
      type,
      fulfilment,
      address: fulfilment === "Delivery" ? f.address.trim() : "",
      notes: f.notes.trim(),
      customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), business: type === "B2B" ? f.business.trim() : "" },
      lines: items.map((i) => ({ ...i, name: productBySlug(i.slug)?.name ?? i.slug })),
    });
    window.open(whatsappLink(orderMessage(order)), "_blank", "noopener,noreferrer");
    cart.clear();
    router.push(`/track?id=${order.id}&new=1`);
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <span aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-2xl ring-1 ring-ink/10">🛒</span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.04em]">Your cart is empty.</h1>
        <p className="mt-3 text-ink/60">Add a few products first, then come back to place your order.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/#products" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-accent">Browse products</Link>
          <Link href="/track" className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold hover:border-ink">Track an order</Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
      <div className="space-y-8">
        <div>
          <p className="mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
            <span className="h-px w-8 bg-current" />
            Checkout
          </p>
          <h1 className="text-[clamp(36px,5vw,64px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
            Place your <span className="text-accent">order.</span>
          </h1>
          <p className="mt-3 max-w-lg leading-relaxed text-ink/65">No payment now — we confirm the price and timeline within {QUOTE_SLA}, then start once you approve.</p>
        </div>

        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-semibold">Who is this for?</legend>
          <Segmented
            label="Order type"
            value={type}
            onChange={setType}
            options={[
              { value: "B2B", label: "B2B · Business", sub: "For a company or brand" },
              { value: "B2C", label: "B2C · Personal", sub: "For myself" },
            ]}
          />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-sm font-semibold sm:col-span-2">Your details</legend>
          <Field label="Name" error={touched ? errors.name : ""}>
            <input className={inputClass(touched && !!errors.name)} value={f.name} onChange={set("name")} autoComplete="name" placeholder="Your name" />
          </Field>
          {type === "B2B" ? (
            <Field label="Company / brand" error={touched ? errors.business : ""}>
              <input className={inputClass(touched && !!errors.business)} value={f.business} onChange={set("business")} autoComplete="organization" placeholder="Brand or company" />
            </Field>
          ) : (
            <div className="hidden sm:block" />
          )}
          <Field label="Mobile / WhatsApp" error={touched ? errors.phone : ""}>
            <input className={inputClass(touched && !!errors.phone)} value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="98765 43210" />
          </Field>
          <Field label="Email" hint="Optional" error={touched ? errors.email : ""}>
            <input className={inputClass(touched && !!errors.email)} value={f.email} onChange={set("email")} type="email" autoComplete="email" placeholder="you@email.com" />
          </Field>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-semibold">Pickup or delivery?</legend>
          <Segmented
            label="Fulfilment"
            value={fulfilment}
            onChange={setFulfilment}
            options={[
              { value: "Pickup", label: "Pickup", sub: "Gandhipuram HQ, Coimbatore" },
              { value: "Delivery", label: "Delivery", sub: "To your address" },
            ]}
          />
          {fulfilment === "Delivery" && (
            <Field label="Delivery address" error={touched ? errors.address : ""}>
              <textarea className={`${inputClass(touched && !!errors.address)} min-h-24 resize-y`} value={f.address} onChange={set("address")} autoComplete="street-address" placeholder="Door no, street, area, city, PIN" />
            </Field>
          )}
        </fieldset>

        <Field label="Notes for our team" hint="Optional">
          <textarea className={`${inputClass()} min-h-24 resize-y`} value={f.notes} onChange={set("notes")} placeholder="Artwork ready? Deadline? Anything we should know." />
        </Field>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[28px] bg-white p-5 shadow-[0_40px_80px_-50px_rgba(0,20,8,0.45)] ring-1 ring-ink/[0.06] sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">Order summary</h2>
            <button type="button" onClick={cart.open} className="text-sm font-medium text-accent underline-offset-4 hover:underline">Edit cart</button>
          </div>
          <ul className="mt-4 divide-y divide-ink/[0.07]">
            {items.map((item) => {
              const p = productBySlug(item.slug);
              if (!p) return null;
              return (
                <li key={item.key} className="flex items-center gap-3 py-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f1f1f1]">
                    <ProductMedia image={p.image} alt={p.alt} name={p.name} sizes="56px" compact />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name}</span>
                    <span className="block truncate text-xs text-ink/55">{Object.values(item.options).join(" · ")}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">× {item.qty.toLocaleString("en-IN")}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-ink/10 pt-4">
            <span className="text-sm text-ink/60">Total pieces</span>
            <span className="text-xl font-extrabold tabular-nums">{count.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm text-ink/60">Price</span>
            <span className="text-sm font-semibold text-accent">Confirmed within {QUOTE_SLA}</span>
          </div>

          <button type="submit" className="group relative mt-6 flex w-full items-center justify-between overflow-hidden rounded-full bg-ink py-2 pr-2 pl-6 font-semibold text-cream">
            <span aria-hidden="true" className={`absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ${EASE} group-hover:translate-y-0`} />
            <span className="relative">Place order</span>
            <span aria-hidden="true" className={`relative grid h-10 w-10 place-items-center rounded-full bg-cream text-ink transition-transform duration-500 ${EASE} group-hover:-rotate-45`}>→</span>
          </button>
          {touched && !valid && <p className="mt-3 text-center text-xs text-accent">Please fix the highlighted fields.</p>}
          <p className="mt-4 text-xs leading-relaxed text-ink/50">
            Placing your order opens WhatsApp with everything filled in — hit send so our team receives it. You&apos;ll get an order ID to track it.
          </p>
        </div>
      </aside>
    </form>
  );
}
