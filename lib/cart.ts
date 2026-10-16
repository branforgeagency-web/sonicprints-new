"use client";

import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Quote cart: products + chosen options + quantity, kept in this      */
/* browser (localStorage) and shared by every component via a tiny     */
/* external store. There are no prices — the cart becomes a quote      */
/* request.                                                            */
/* ------------------------------------------------------------------ */

export interface CartItem {
  /** slug + options, so the same product with different options is its own line. */
  key: string;
  slug: string;
  qty: number;
  options: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  open: boolean;
}

const STORAGE_KEY = "sonicprints-cart";
export const MAX_QTY = 99999;
const EMPTY: CartState = { items: [], open: false };

let state: CartState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1));
export const itemKey = (slug: string, options: Record<string, string>) =>
  `${slug}|${Object.keys(options)
    .sort()
    .map((k) => `${k}=${options[k]}`)
    .join("&")}`;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as CartItem[];
    if (Array.isArray(saved)) state = { ...state, items: saved.filter((i) => i && typeof i.slug === "string").map((i) => ({ ...i, qty: clampQty(i.qty) })) };
  } catch {
    // Private mode or bad data: start with an empty cart.
  }
  // Keep tabs in sync.
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    state = { ...state, items: [] };
    load();
    listeners.forEach((l) => l());
  });
}

function set(next: Partial<CartState>, persist = true) {
  state = { ...state, ...next };
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Storage unavailable — the cart still works for this visit.
    }
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export const cart = {
  /** Adds (or tops up) a line. `openDrawer` slides the cart open afterwards. */
  add(slug: string, qty: number, options: Record<string, string>, openDrawer = true) {
    load();
    const key = itemKey(slug, options);
    const existing = state.items.find((i) => i.key === key);
    const items = existing
      ? state.items.map((i) => (i.key === key ? { ...i, qty: clampQty(i.qty + qty) } : i))
      : [...state.items, { key, slug, qty: clampQty(qty), options }];
    set({ items, open: openDrawer || state.open });
  },
  setQty(key: string, qty: number) {
    set({ items: state.items.map((i) => (i.key === key ? { ...i, qty: clampQty(qty) } : i)) });
  },
  remove(key: string) {
    set({ items: state.items.filter((i) => i.key !== key) });
  },
  clear() {
    set({ items: [] });
  },
  open() {
    set({ open: true }, false);
  },
  close() {
    set({ open: false }, false);
  },
};

/** Current cart; re-renders when it changes. Empty during server render and hydration. */
export function useCart() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...s, count: s.items.reduce((n, i) => n + i.qty, 0), lines: s.items.length };
}

export { clampQty };
