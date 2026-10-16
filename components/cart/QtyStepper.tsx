"use client";

import { useState } from "react";
import { MAX_QTY, clampQty } from "@/lib/cart";

interface Props {
  value: number;
  onChange: (qty: number) => void;
  label?: string;
  size?: "sm" | "md";
  /** If set, "−" at 1 is enabled and removes the item instead. */
  onRemove?: () => void;
  className?: string;
}

/** − [qty] + control. The number can also be typed; it's clamped to 1…MAX_QTY on blur. */
export default function QtyStepper({ value, onChange, label = "Quantity", size = "md", onRemove, className = "" }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const btn = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-lg";
  const commit = (raw: string) => {
    onChange(clampQty(Number(raw)));
    setDraft(null);
  };

  return (
    <div role="group" aria-label={label} className={`inline-flex items-center rounded-full border border-ink/15 bg-white p-1 ${className}`}>
      <button
        type="button"
        aria-label={onRemove && value <= 1 ? "Remove from cart" : "Decrease quantity"}
        disabled={value <= 1 && !onRemove}
        onClick={() => (onRemove && value <= 1 ? onRemove() : onChange(clampQty(value - 1)))}
        className={`${btn} grid place-items-center rounded-full font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-30`}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 5))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
        }}
        className={`${size === "sm" ? "w-9 text-sm" : "w-12 text-base"} bg-transparent text-center font-semibold text-ink tabular-nums outline-none`}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= MAX_QTY}
        onClick={() => onChange(clampQty(value + 1))}
        className={`${btn} grid place-items-center rounded-full font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}
