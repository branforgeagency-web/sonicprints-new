"use client";

import { useState } from "react";
import { BEST_SELLERS, ORDER_COUNTS, STATS, WEEK, inr } from "../data";
import { Icon, type IconName } from "../icons";

const panel = "rounded-2xl border border-[var(--d-border)] bg-[var(--d-card)]";

/* ------------------------------------------------------------------ */
/* Weekly sales — SVG bar chart with Sales / Orders tabs               */
/* ------------------------------------------------------------------ */

function WeeklySales() {
  const [tab, setTab] = useState<"sales" | "orders">("sales");
  const values = WEEK.map((d) => d[tab]);
  const max = Math.max(...values) * 1.15;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f);
  const fmt = (v: number) => (tab === "sales" ? `₹${Math.round(v / 1000)}k` : String(Math.round(v)));

  return (
    <section className={`${panel} p-5 sm:p-6`}>
      <h3 className="text-lg font-bold text-[var(--d-text)]">Weekly Sales</h3>

      <div role="tablist" className="mt-4 flex gap-1 border-b border-[var(--d-border)]">
        {(["sales", "orders"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? "border-[#bd5501] text-[#bd5501]" : "border-transparent text-[var(--d-muted)] hover:text-[var(--d-text)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 flex h-64 gap-3">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between pb-6 text-right text-[11px] text-[var(--d-muted)]">
          {ticks.map((t) => (
            <span key={t} className="leading-none">
              {fmt(t)}
            </span>
          ))}
        </div>
        {/* Plot */}
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="h-px bg-[var(--d-grid)]" />
            ))}
          </div>
          <div className="absolute inset-0 flex items-end gap-2 sm:gap-4">
            {WEEK.map((d, i) => (
              <div key={d.day} className="group flex h-full flex-1 flex-col justify-end">
                <div className="relative flex flex-1 items-end justify-center pb-0">
                  <div
                    key={tab}
                    className="dash-bar relative w-full max-w-[44px] cursor-pointer rounded-t-lg bg-gradient-to-t from-[#bd5501] to-[#e9a23b] transition-opacity group-hover:opacity-85"
                    style={{ height: `${(values[i]! / max) * 100}%`, animationDelay: `${i * 60}ms` }}
                  >
                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-[var(--d-text)] px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-[var(--d-bg)] opacity-0 transition-opacity group-hover:opacity-100">
                      {tab === "sales" ? inr(values[i]!, 0) : `${values[i]} orders`}
                    </span>
                  </div>
                </div>
                <span className="mt-2 h-4 text-center text-xs text-[var(--d-muted)]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Best sellers — SVG donut + legend                                   */
/* ------------------------------------------------------------------ */

function BestSellers() {
  const total = BEST_SELLERS.reduce((s, p) => s + p.units, 0);
  const [hover, setHover] = useState<number | null>(null);
  const R = 70;
  const C = 2 * Math.PI * R;
  const arcs = BEST_SELLERS.reduce<{ len: number; offset: number }[]>((acc, p) => {
    const prev = acc.at(-1);
    acc.push({ len: (p.units / total) * C, offset: prev ? prev.offset + prev.len : 0 });
    return acc;
  }, []);
  const focus = hover ?? 0;

  return (
    <section className={`${panel} p-5 sm:p-6`}>
      <h3 className="text-lg font-bold text-[var(--d-text)]">Best Selling Products</h3>

      <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <div className="relative h-52 w-52 shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--d-grid)" strokeWidth="26" />
            {BEST_SELLERS.map((p, i) => (
              <circle
                key={p.name}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth={hover === i ? 32 : 26}
                strokeDasharray={`${arcs[i]!.len - 2} ${C}`}
                strokeDashoffset={-arcs[i]!.offset}
                className="cursor-pointer transition-[stroke-width] duration-300"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-2xl font-extrabold text-[var(--d-text)]">
                {Math.round((BEST_SELLERS[focus]!.units / total) * 100)}%
              </p>
              <p className="max-w-[110px] text-xs text-[var(--d-muted)]">{BEST_SELLERS[focus]!.name}</p>
            </div>
          </div>
        </div>

        <ul className="w-full space-y-1">
          {BEST_SELLERS.map((p, i) => (
            <li key={p.name}>
              <button
                type="button"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  hover === i ? "bg-[var(--d-hover)]" : ""
                }`}
              >
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: p.color }} />
                <span className="flex-1 text-[var(--d-text)]">{p.name}</span>
                <span className="text-[var(--d-muted)] tabular-nums">{p.units.toLocaleString("en-IN")}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard analytics — centre content for the Dashboard sidebar tab  */
/* ------------------------------------------------------------------ */

const COUNT_CARDS: { label: string; value: number; icon: IconName; tone: string; extra?: string }[] = [
  { label: "Total Order", value: ORDER_COUNTS.total, icon: "cart", tone: "bg-[#bd5501]" },
  {
    label: "Orders Pending",
    value: ORDER_COUNTS.pending,
    icon: "refresh",
    tone: "bg-[#d9731a]",
    extra: `(${inr(ORDER_COUNTS.pendingAmount)})`,
  },
  { label: "Orders Processing", value: ORDER_COUNTS.processing, icon: "truck", tone: "bg-[#0f6b3e]" },
  { label: "Orders Delivered", value: ORDER_COUNTS.delivered, icon: "check", tone: "bg-[#3f8f6b]" },
];

export default function DashboardAnalytics() {
  return (
    <div className="space-y-6">
      {/* Money cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`dash-rise group relative flex flex-col items-center overflow-hidden rounded-2xl px-3 py-7 text-center text-white transition-transform duration-300 hover:-translate-y-1 ${s.tone}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span aria-hidden="true" className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
            <Icon name={s.icon as IconName} className="h-8 w-8" />
            <p className="mt-3 text-[15px] text-white/85">{s.label}</p>
            <p className="mt-2 text-[26px] font-extrabold xl:text-[21px] 2xl:text-[26px] tracking-[-0.02em] tabular-nums">{inr(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Order counts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COUNT_CARDS.map((c, i) => (
          <div
            key={c.label}
            className={`${panel} dash-rise flex items-center gap-4 p-5`}
            style={{ animationDelay: `${300 + i * 60}ms` }}
          >
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-white ${c.tone}`}>
              <Icon name={c.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-[var(--d-muted)]">
                {c.label} {c.extra && <span className="font-semibold text-[#bd5501]">{c.extra}</span>}
              </p>
              <p className="mt-0.5 text-[28px] leading-tight font-extrabold text-[var(--d-text)] tabular-nums">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <WeeklySales />
        <BestSellers />
      </div>
    </div>
  );
}
