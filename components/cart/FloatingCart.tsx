"use client";

import { cart, useCart } from "@/lib/cart";

/**
 * Floating cart button stacked just above the scroll-to-top arrow (bottom-right).
 * Appears once the cart has items, bounces when the count changes, and opens the cart.
 */
export default function FloatingCart() {
  const { count, open } = useCart();
  const visible = count > 0 && !open;

  return (
    <button
      type="button"
      onClick={cart.open}
      aria-label={`Open cart, ${count} ${count === 1 ? "piece" : "pieces"}`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed right-4 bottom-[76px] z-30 grid h-12 w-12 place-items-center rounded-full bg-accent text-cream shadow-[0_12px_30px_-10px_rgba(189,85,1,0.7)] transition-[transform,opacity,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink active:scale-90 sm:right-6 sm:bottom-[92px] sm:h-14 sm:w-14 ${
        visible ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-50 opacity-0"
      }`}
    >
      {/* re-keyed on every change so the icon bounces when an item is added */}
      <span key={count} className="grid place-items-center motion-safe:animate-[cart-bump_0.5s_cubic-bezier(0.22,1,0.36,1)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
          <circle cx="10" cy="20" r="1.3" />
          <circle cx="17" cy="20" r="1.3" />
        </svg>
      </span>
      <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-cream tabular-nums ring-2 ring-cream">
        {count > 999 ? "999+" : count}
      </span>
    </button>
  );
}
