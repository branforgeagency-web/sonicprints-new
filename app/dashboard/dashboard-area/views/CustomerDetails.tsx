"use client";

import { ORDERS, inr, type Customer } from "../data";
import { Icon, type IconName } from "../icons";
import { STATUS_TONE } from "./OrdersView";

/** One label/value pair in the details grid. */
function Field({ icon, label, children, className = "" }: { icon: IconName; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 items-start gap-2.5 ${className}`}>
      <span className="mt-0.5 shrink-0 text-[#bd5501]">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--d-muted)]">{label}</p>
        <p className="text-sm font-medium break-words text-[var(--d-text)]">{children}</p>
      </div>
    </div>
  );
}

const sectionTitle = "mb-3 text-[11px] font-semibold tracking-[0.15em] text-[var(--d-muted)] uppercase";

/**
 * Body of the customer side panel. Uses container queries (`@container`) so the
 * layout gains columns as the panel is dragged wider.
 */
export default function CustomerDetails({ customer: c }: { customer: Customer }) {
  const orders = ORDERS.filter((o) => o.customer === c.name).slice(0, 5);
  const digits = c.phone.replace(/\D/g, "");

  const actions: { label: string; icon: IconName; href: string }[] = [
    { label: "Call", icon: "phone", href: `tel:+${digits}` },
    { label: "WhatsApp", icon: "chat", href: `https://wa.me/${digits}` },
    { label: "Email", icon: "mail", href: `mailto:${c.email}` },
  ];

  const stats = [
    { label: "Orders", value: String(c.orders) },
    { label: "Total spent", value: inr(c.spent, 0) },
    { label: "Avg. order", value: inr(Math.round(c.spent / Math.max(1, c.orders)), 0) },
    { label: "Since", value: c.since },
  ];

  return (
    <div className="@container space-y-5">
      {/* Identity + quick actions on one row */}
      <div className="flex items-center gap-3">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl font-black ${
            c.type === "B2B" ? "bg-[#001408] text-[#f7f4ee] ring-1 ring-[#bd5501]/50" : "bg-[#bd5501] text-white"
          }`}
        >
          {c.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
              c.type === "B2B" ? "bg-[#0f6b3e]/15 text-[#2f9a62]" : "bg-[#d9731a]/15 text-[#d9731a]"
            }`}
          >
            {c.type === "B2B" ? "Business" : "Individual"}
          </span>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-[var(--d-muted)]">
            <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
            {c.city}, {c.state}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              target={a.label === "WhatsApp" ? "_blank" : undefined}
              rel="noreferrer"
              title={a.label}
              aria-label={a.label}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--d-border)] text-[var(--d-text)] transition-colors hover:border-[#bd5501] hover:bg-[#bd5501] hover:text-white"
            >
              <Icon name={a.icon} className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>

      {/* Stats — one row of four */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--d-border)] @sm:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-3 py-2.5 ${i % 2 ? "border-l border-[var(--d-border)]" : ""} ${
              i > 1 ? "border-t border-[var(--d-border)] @sm:border-t-0" : ""
            } ${i === 2 ? "@sm:border-l" : ""}`}
          >
            <p className="text-[11px] text-[var(--d-muted)]">{s.label}</p>
            <p className="mt-0.5 truncate text-[15px] font-extrabold text-[var(--d-text)] tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <section>
        <h3 className={sectionTitle}>Contact</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 @sm:grid-cols-2 @2xl:grid-cols-3">
          <Field icon="customers" label="Contact person">
            {c.contact}
          </Field>
          <Field icon="phone" label="Phone">
            {c.phone}
          </Field>
          <Field icon="mail" label="Email" className="@sm:col-span-2 @2xl:col-span-1">
            {c.email}
          </Field>
        </div>
      </section>

      {/* Location */}
      <section>
        <h3 className={sectionTitle}>Location</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 @md:grid-cols-3">
          <Field icon="pin" label="Address" className="col-span-2 @md:col-span-3">
            {c.address}, {c.area}, {c.city} – {c.pincode}
          </Field>
          <Field icon="pin" label="State">
            {c.state}
          </Field>
          <Field icon="globe" label="Country">
            {c.country}
          </Field>
          <Field icon="building" label="Branch">
            {c.branch}
          </Field>
        </div>
      </section>

      {/* Recent orders — slim rows */}
      <section>
        <h3 className={sectionTitle}>Recent orders</h3>
        {orders.length ? (
          <ul className="divide-y divide-[var(--d-border)] rounded-xl border border-[var(--d-border)]">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-3 py-2">
                <span className="w-[72px] shrink-0 font-mono text-[11px] text-[#bd5501]">{o.id}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--d-text)]">
                  {o.product}
                  <span className="text-[var(--d-muted)]"> · {o.qty} pcs</span>
                </span>
                <span className="hidden shrink-0 text-xs text-[var(--d-muted)] @md:inline">{o.date}</span>
                <span className="shrink-0 text-sm font-semibold text-[var(--d-text)] tabular-nums">{inr(o.amount, 0)}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_TONE[o.status]}`}>{o.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--d-border)] px-4 py-5 text-center text-sm text-[var(--d-muted)]">
            No orders yet.
          </p>
        )}
      </section>
    </div>
  );
}
