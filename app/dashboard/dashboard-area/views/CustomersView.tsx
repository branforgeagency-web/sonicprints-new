"use client";

import { useCallback, useState } from "react";
import { SidePanel, usePanelWidth } from "../../side-panel";
import { CUSTOMERS, inr, type Customer } from "../data";
import { Icon } from "../icons";
import CustomerDetails from "./CustomerDetails";

const TYPES = ["All", "B2B", "B2C"] as const;
const SORTS = {
  spend: { label: "Top spend", fn: (a: Customer, b: Customer) => b.spent - a.spent },
  orders: { label: "Most orders", fn: (a: Customer, b: Customer) => b.orders - a.orders },
  name: { label: "A–Z", fn: (a: Customer, b: Customer) => a.name.localeCompare(b.name) },
};

const TOP_SPEND = Math.max(...CUSTOMERS.map((c) => c.spent));
const RANK = new Map([...CUSTOMERS].sort(SORTS.spend.fn).map((c, i) => [c.id, i + 1]));

/* ------------------------------------------------------------------ */
/* A customer, printed as a business card                              */
/* ------------------------------------------------------------------ */

function CustomerCard({ c, selected, onSelect, delay }: { c: Customer; selected: boolean; onSelect: () => void; delay: number }) {
  const b2b = c.type === "B2B";
  const rank = RANK.get(c.id)!;
  const ink = Math.round((c.spent / TOP_SPEND) * 100);

  return (
    <div className="dash-rise relative p-2.5" style={{ animationDelay: `${delay}ms` }}>
      {/* Crop marks */}
      {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map(
        (m) => (
          <span
            key={m}
            aria-hidden="true"
            className={`absolute h-3 w-3 transition-colors duration-300 ${m} ${selected ? "border-[#bd5501]" : "border-[var(--d-muted)]/40"}`}
          />
        ),
      )}

      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`group relative flex aspect-[1.75] w-full cursor-pointer flex-col overflow-hidden rounded-lg p-5 text-left transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          b2b ? "bg-[#001408] text-[#f7f4ee]" : "bg-[#f7f4ee] text-[#001408]"
        } ${
          selected
            ? "-translate-y-1.5 shadow-[0_24px_40px_-18px_rgba(189,85,1,0.75)] ring-2 ring-[#bd5501]"
            : "shadow-[0_14px_30px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/5 hover:-translate-y-1 hover:-rotate-[0.6deg]"
        }`}
      >
        {/* Accent edge + giant monogram */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[#bd5501]" />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -right-3 -bottom-10 text-[150px] leading-none font-black transition-transform duration-500 group-hover:scale-110 ${
            b2b ? "text-white/[0.05]" : "text-black/[0.05]"
          }`}
        >
          {c.name[0]}
        </span>

        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-[17px] font-extrabold tracking-[-0.02em]">{c.name}</span>
            <span className={`block truncate text-xs ${b2b ? "text-white/55" : "text-black/50"}`}>
              {c.contact} · {c.city}
            </span>
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
              rank <= 3 ? "bg-[#bd5501] text-white" : b2b ? "bg-white/10 text-white/70" : "bg-black/[0.06] text-black/60"
            }`}
          >
            #{rank}
          </span>
        </span>

        <span className={`mt-auto block font-mono text-[11px] ${b2b ? "text-white/60" : "text-black/55"}`}>{c.phone}</span>

        <span className="mt-3 flex items-end justify-between gap-3">
          <span>
            <span className="block text-[20px] leading-none font-black tabular-nums">{inr(c.spent, 0)}</span>
            <span className={`mt-1 block text-[11px] ${b2b ? "text-white/55" : "text-black/50"}`}>{c.orders} orders</span>
          </span>
          <span className={`text-[10px] font-bold tracking-[0.18em] ${b2b ? "text-[#e9a23b]" : "text-[#bd5501]"}`}>{c.type}</span>
        </span>

        {/* Ink level = share of the top spender */}
        <span className={`mt-3 block h-1 overflow-hidden rounded-full ${b2b ? "bg-white/10" : "bg-black/10"}`}>
          <span className="block h-full rounded-full bg-gradient-to-r from-[#bd5501] to-[#e9a23b]" style={{ width: `${ink}%` }} />
        </span>
      </button>
    </div>
  );
}

export default function CustomersView() {
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [sort, setSort] = useState<keyof typeof SORTS>("spend");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const close = useCallback(() => setSelectedId(null), []);
  const [panelWidth, setPanelWidth] = usePanelWidth();

  const selected = CUSTOMERS.find((c) => c.id === selectedId) ?? null;
  const needle = q.trim().toLowerCase();
  const list = CUSTOMERS.filter(
    (c) =>
      (type === "All" || c.type === type) &&
      `${c.name} ${c.contact} ${c.city} ${c.phone} ${c.email}`.toLowerCase().includes(needle),
  ).sort(SORTS[sort].fn);

  return (
    <div
      style={{ "--panel-w": `${panelWidth}px` } as React.CSSProperties}
      className={`transition-[padding] duration-500 ${selected ? "xl:pr-[var(--panel-w)]" : ""}`}
    >
      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                type === t ? "bg-[#bd5501] text-white" : "bg-[var(--d-hover)] text-[var(--d-muted)] hover:text-[var(--d-text)]"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="mx-1 hidden h-6 w-px bg-[var(--d-border)] sm:block" />
          <label className="flex items-center gap-2 text-sm text-[var(--d-muted)]">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as keyof typeof SORTS)}
              className="h-9 cursor-pointer rounded-lg border border-[var(--d-border)] bg-[var(--d-card)] px-2 text-[var(--d-text)] outline-none focus:border-[#bd5501]"
            >
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="relative block lg:w-72">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--d-muted)]">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customers…"
            aria-label="Search customers"
            className="h-11 w-full rounded-xl border border-[var(--d-border)] bg-transparent pr-4 pl-10 text-sm text-[var(--d-text)] outline-none placeholder:text-[var(--d-muted)] focus:border-[#bd5501]"
          />
        </label>
      </div>

      {/* Card wall */}
      {list.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3">
          {list.map((c, i) => (
            <CustomerCard
              key={c.id}
              c={c}
              delay={i * 40}
              selected={c.id === selectedId}
              onSelect={() => setSelectedId((id) => (id === c.id ? null : c.id))}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-[var(--d-border)] py-16 text-center text-[var(--d-muted)]">No customers match.</p>
      )}

      <SidePanel open={!!selected} onClose={close} eyebrow="Customer" title={selected?.name ?? ""} contentKey={selected?.id}
        width={panelWidth}
        onWidthChange={setPanelWidth}
      >
        {selected && <CustomerDetails customer={selected} />}
      </SidePanel>
    </div>
  );
}
