"use client";

import { useState } from "react";
import { ORDERS, inr, type Order, type OrderStatus } from "../data";
import { Icon } from "../icons";
import { DataTable, type Column } from "../../table";

const FILTERS: ("All" | OrderStatus)[] = ["All", "Pending", "Processing", "Delivered"];

export const STATUS_TONE: Record<OrderStatus, string> = {
  Pending: "bg-[#d9731a]/15 text-[#d9731a]",
  Processing: "bg-[#3f8f6b]/15 text-[#3f8f6b]",
  Delivered: "bg-[#0f6b3e]/15 text-[#2f9a62]",
};

const COLUMNS: Column<Order>[] = [
  { key: "id", header: "Order ID", className: "font-mono text-xs font-semibold text-[#bd5501]" },
  { key: "customer", header: "Customer", className: "font-medium" },
  { key: "product", header: "Product", className: "text-[var(--d-muted)]" },
  { key: "qty", header: "Qty", className: "tabular-nums" },
  { key: "amount", header: "Amount", className: "font-semibold tabular-nums", render: (o) => inr(o.amount) },
  {
    key: "status",
    header: "Status",
    render: (o) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[o.status]}`}>{o.status}</span>,
  },
  { key: "date", header: "Date", className: "whitespace-nowrap text-[var(--d-muted)]" },
];

export default function OrdersView() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const rows = ORDERS.filter(
    (o) =>
      (filter === "All" || o.status === filter) &&
      `${o.id} ${o.customer} ${o.product}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <section className="dash-rise rounded-2xl border border-[var(--d-border)] bg-[var(--d-card)]">
      <div className="flex flex-col gap-4 border-b border-[var(--d-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === f ? "bg-[#bd5501] text-white" : "bg-[var(--d-hover)] text-[var(--d-muted)] hover:text-[var(--d-text)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-72">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--d-muted)]">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search orders…"
            aria-label="Search orders"
            className="h-11 w-full rounded-xl border border-[var(--d-border)] bg-transparent pr-4 pl-10 text-sm text-[var(--d-text)] outline-none placeholder:text-[var(--d-muted)] focus:border-[#bd5501]"
          />
        </label>
      </div>

      <DataTable columns={COLUMNS} rows={rows} rowKey={(o) => o.id} pageSizes={[8, 15, 25]} emptyText="No orders match." />
    </section>
  );
}
