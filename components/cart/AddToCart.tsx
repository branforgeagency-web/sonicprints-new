"use client";

import { cart, itemKey, useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";
import QtyStepper from "./QtyStepper";

interface Props {
  product: Product;
  /** Chosen options; defaults to each option's first value. */
  options?: Record<string, string>;
  size?: "sm" | "md";
}

/**
 * "Add to cart" until the item is in the cart, then a − qty + control for that cart line.
 * "−" at 1 removes it and brings the button back.
 */
export default function AddToCart({ product, options, size = "sm" }: Props) {
  const opts = options ?? Object.fromEntries(product.options.map((o) => [o.label, o.values[0]]));
  const key = itemKey(product.slug, opts);
  const line = useCart().items.find((i) => i.key === key);
  const md = size === "md";

  if (!line) {
    return (
      <button
        type="button"
        onClick={() => cart.add(product.slug, 1, opts, false)}
        aria-label={`Add ${product.name} to cart`}
        className={`w-full rounded-full bg-accent font-semibold text-cream transition-[background-color,transform] duration-300 hover:bg-ink active:scale-[0.97] animate-[kit-in_0.35s_cubic-bezier(0.22,1,0.36,1)_both] ${
          md ? "h-12 text-base sm:w-auto sm:px-10" : "h-10 text-sm"
        }`}
      >
        Add to cart
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 animate-[kit-in_0.35s_cubic-bezier(0.22,1,0.36,1)_both] ${md ? "flex-wrap gap-3" : ""}`}>
      <QtyStepper
        size={size}
        value={line.qty}
        onChange={(q) => cart.setQty(key, q)}
        onRemove={() => cart.remove(key)}
        label={`${product.name} quantity in cart`}
        className={md ? "" : "w-full justify-between"}
      />
      {md && (
        <button type="button" onClick={cart.open} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
          ✓ In cart · View cart
        </button>
      )}
    </div>
  );
}
