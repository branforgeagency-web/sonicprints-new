"use client";

import { cart, useCart } from "@/lib/cart";

/** Navbar cart icon with a live item count. */
export default function CartButton({ className = "" }: { className?: string }) {
  const { count } = useCart();
  return (
    <button
      type="button"
      onClick={cart.open}
      aria-label={count ? `Open cart, ${count} pieces` : "Open cart"}
      className={`relative grid h-11 w-11 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-cream ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
        <circle cx="10" cy="20" r="1.3" />
        <circle cx="17" cy="20" r="1.3" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-cream tabular-nums">
          {count > 999 ? "999+" : count}
        </span>
      )}
    </button>
  );
}
