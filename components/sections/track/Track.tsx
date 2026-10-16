"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { normaliseId, orderMessage, ORDER_STEPS, useOrders, type Order } from "@/lib/orders";
import { QUOTE_SLA, whatsappLink } from "@/lib/site";

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

/** The 7 order stages as a progress timeline — horizontal on wide screens, vertical on phones. */
function Timeline({ step }: { step: number }) {
  return (
    <ol className="relative grid grid-cols-1 gap-0 md:grid-cols-7 md:gap-2">
      {ORDER_STEPS.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0 md:flex-col md:gap-3 md:pb-0">
            {/* connector */}
            {i < ORDER_STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-9 left-[17px] h-[calc(100%-36px)] w-[2px] md:top-[17px] md:left-9 md:h-[2px] md:w-[calc(100%-28px)] ${done ? "bg-accent" : "bg-ink/10"}`}
              />
            )}
            <span
              className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-xs font-bold transition-colors ${
                done ? "bg-accent text-cream" : current ? "bg-ink text-cream ring-4 ring-accent/25" : "bg-white text-ink/40 ring-1 ring-ink/15"
              }`}
            >
              {done ? "✓" : String(i + 1).padStart(2, "0")}
              {current && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-accent/30 motion-reduce:hidden" />}
            </span>
            <div>
              <p className={`font-semibold ${current ? "text-ink" : done ? "text-ink/80" : "text-ink/45"}`}>
                {s.title}
                {current && <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 align-middle text-[10px] font-bold tracking-wider text-accent uppercase">Now</span>}
              </p>
              <p className={`mt-0.5 text-xs leading-relaxed ${current ? "text-ink/65" : "text-ink/45"}`}>{s.text}</p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-ink/40 uppercase">{s.owner}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCard({ order, fresh }: { order: Order; fresh: boolean }) {
  const pieces = order.lines.reduce((n, l) => n + l.qty, 0);
  return (
    <article className="overflow-hidden rounded-[28px] bg-white ring-1 ring-ink/[0.07]">
      {fresh && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-accent px-6 py-4 text-cream sm:px-8">
          <p className="font-semibold">🎉 Order placed! WhatsApp opened with your order — hit send so our team receives it.</p>
          <a href={whatsappLink(orderMessage(order))} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink">
            Didn&apos;t open? Send again
          </a>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/[0.07] px-6 py-6 sm:px-8">
        <div>
          <p className="text-sm text-ink/55">Order ID</p>
          <p className="font-mono text-2xl font-bold tracking-wider">{order.id}</p>
          <p className="mt-1 text-sm text-ink/55">Placed {dateFmt.format(new Date(order.createdAt))}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-accent/10 px-3 py-1.5 text-accent">{order.type}</span>
          <span className="rounded-full bg-cream px-3 py-1.5 text-ink/70">{order.fulfilment}</span>
          <span className="rounded-full bg-cream px-3 py-1.5 text-ink/70">{pieces.toLocaleString("en-IN")} pieces</span>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-8">
        <Timeline step={order.step} />
        <p className="mt-6 rounded-2xl bg-cream px-4 py-3 text-xs leading-relaxed text-ink/60">
          Status updates from our team reach you on WhatsApp — expect your quote within {QUOTE_SLA}. Live tracking on this page is coming soon.
        </p>
      </div>

      <div className="grid gap-6 border-t border-ink/[0.07] px-6 py-6 sm:grid-cols-2 sm:px-8">
        <div>
          <h3 className="text-sm font-semibold">Items</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
            {order.lines.map((l) => (
              <li key={l.key}>
                <Link href={`/products/${l.slug}`} className="font-medium text-ink hover:text-accent">{l.name}</Link> × {l.qty.toLocaleString("en-IN")}
                {Object.keys(l.options).length > 0 && <span className="block text-xs text-ink/50">{Object.values(l.options).join(" · ")}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{order.fulfilment === "Delivery" ? "Deliver to" : "Pickup"}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            {order.customer.name}
            {order.customer.business && <>, {order.customer.business}</>}
            <br />
            {order.customer.phone}
            <br />
            {order.fulfilment === "Delivery" ? order.address : "Sonic Prints HQ, Gandhipuram, Coimbatore"}
          </p>
          <a
            href={whatsappLink(`Hi Sonic Prints! Checking on my order ${order.id}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-accent"
          >
            Ask about this order
          </a>
        </div>
      </div>
    </article>
  );
}

/** Track an order by ID; also lists orders placed from this browser. */
export default function Track() {
  const router = useRouter();
  const params = useSearchParams();
  const orders = useOrders();
  const id = params.get("id") ? normaliseId(params.get("id")!) : "";
  const fresh = params.get("new") === "1";
  const [query, setQuery] = useState(id);
  const found = id ? orders.find((o) => o.id === id) : undefined;

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = normaliseId(query);
    if (q.length > 3) router.push(`/track?id=${q}`);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
            <span className="h-px w-8 bg-current" />
            Order tracking
          </p>
          <h1 className="text-[clamp(36px,5vw,64px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
            Track your <span className="text-accent">order.</span>
          </h1>
        </div>
        <form onSubmit={search} className="flex w-full max-w-md gap-2">
          <label className="sr-only" htmlFor="order-id">Order ID</label>
          <input
            id="order-id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID, e.g. SP-7K3QX9"
            className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-5 py-3 font-mono uppercase outline-none placeholder:font-sans placeholder:normal-case focus:border-ink focus:shadow-[0_0_0_4px_rgba(189,85,1,0.15)]"
          />
          <button type="submit" className="rounded-full bg-ink px-6 py-3 font-semibold text-cream hover:bg-accent">Track</button>
        </form>
      </div>

      {found && <OrderCard order={found} fresh={fresh} />}

      {id && !found && (
        <div className="rounded-[28px] bg-white p-8 text-center ring-1 ring-ink/[0.07]">
          <p className="font-mono text-lg font-bold">{id}</p>
          <p className="mx-auto mt-2 max-w-md text-ink/65">
            We couldn&apos;t find this order on this device. Orders are saved on the phone or computer they were placed from — message us with your ID and we&apos;ll update you.
          </p>
          <a
            href={whatsappLink(`Hi Sonic Prints! Checking on my order ${id}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-cream hover:bg-ink"
          >
            Ask on WhatsApp
          </a>
        </div>
      )}

      {orders.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold tracking-[-0.03em]">Your orders on this device</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/track?id=${o.id}`}
                  className={`flex items-center justify-between gap-4 rounded-[20px] bg-white px-5 py-4 ring-1 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-30px_rgba(0,20,8,0.5)] ${
                    o.id === id ? "ring-accent" : "ring-ink/[0.07]"
                  }`}
                >
                  <span>
                    <span className="block font-mono font-bold">{o.id}</span>
                    <span className="block text-xs text-ink/55">
                      {dateFmt.format(new Date(o.createdAt))} · {o.lines.length} {o.lines.length === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink/70">{ORDER_STEPS[o.step]?.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!id && orders.length === 0 && (
        <p className="text-ink/60">
          Enter the order ID you received after placing an order. No orders yet?{" "}
          <Link href="/#products" className="font-semibold text-accent underline-offset-4 hover:underline">Browse products</Link>.
        </p>
      )}
    </div>
  );
}
