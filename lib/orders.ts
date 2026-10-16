"use client";

import { useSyncExternalStore } from "react";
import type { CartItem } from "./cart";

/* ------------------------------------------------------------------ */
/* Orders — FRONT-END ONLY (demo). Placed orders are kept in this      */
/* browser (localStorage) and sent to SonicPrints on WhatsApp. There   */
/* is no backend yet, so `step` is never advanced by staff; swap this  */
/* module for an API/database to make tracking live.                   */
/* ------------------------------------------------------------------ */

/** The 7-stage order lifecycle from the master plan, with the crew member who owns each stage. */
export const ORDER_STEPS = [
  { title: "Inquiry received", owner: "INKA", text: "We've got your order and are checking the details." },
  { title: "Quotation", owner: "INKA", text: `A clear price and timeline is shared with you on WhatsApp.` },
  { title: "Design", owner: "PIXEL", text: "Your artwork is prepared as a print-ready design." },
  { title: "Approval", owner: "You", text: "You approve the proof — nothing prints before your yes." },
  { title: "Production", owner: "PRESSO", text: "Printed and passed through a 3-point quality check." },
  { title: "Packing", owner: "FLASH", text: "Counted, packed and labelled for you." },
  { title: "Delivered", owner: "SWIFTY", text: "Handed over at pickup or delivered to your door." },
] as const;

export interface OrderLine extends CartItem {
  /** Product name at the time of ordering. */
  name: string;
}

export interface Order {
  id: string;
  createdAt: string;
  /** Index into ORDER_STEPS. */
  step: number;
  type: "B2B" | "B2C";
  customer: { name: string; phone: string; email: string; business: string };
  fulfilment: "Pickup" | "Delivery";
  address: string;
  notes: string;
  lines: OrderLine[];
}

const STORAGE_KEY = "sonicprints-orders";
const NONE: Order[] = [];

let orders: Order[] = NONE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(saved)) orders = saved as Order[];
  } catch {
    // Private mode or bad data.
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listeners.forEach((l) => l());
  });
}

/** Readable, hard-to-guess order ID, e.g. SP-7K3QX9. */
function newId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `SP-${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}

export function placeOrder(input: Omit<Order, "id" | "createdAt" | "step">): Order {
  load();
  const order: Order = { ...input, id: newId(), createdAt: new Date().toISOString(), step: 0 };
  orders = [order, ...orders];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Storage unavailable — the WhatsApp message still carries the order.
  }
  listeners.forEach((l) => l());
  return order;
}

export const normaliseId = (id: string) => id.trim().toUpperCase().replace(/^SP-?/, "SP-");

/** WhatsApp text that hands the order to the SonicPrints team. */
export function orderMessage(o: Order) {
  return [
    `New order ${o.id} (${o.type === "B2B" ? "business" : "personal"})`,
    "",
    ...o.lines.map((l, i) => {
      const opts = Object.entries(l.options)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return `${i + 1}. ${l.name} × ${l.qty}${opts ? ` (${opts})` : ""}`;
    }),
    "",
    `Name: ${o.customer.name}`,
    o.customer.business ? `Business: ${o.customer.business}` : null,
    `Phone: ${o.customer.phone}`,
    o.customer.email ? `Email: ${o.customer.email}` : null,
    `${o.fulfilment}${o.fulfilment === "Delivery" && o.address ? `: ${o.address}` : " at Gandhipuram HQ"}`,
    o.notes ? `Notes: ${o.notes}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => {
  load();
  return orders;
};

/** Orders placed from this browser, newest first. Empty during server render and hydration. */
export function useOrders() {
  return useSyncExternalStore(subscribe, getSnapshot, () => NONE);
}
