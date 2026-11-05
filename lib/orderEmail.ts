"use client";

import emailjs from "@emailjs/browser";
import { orderMessage, type Order } from "./orders";

/* ------------------------------------------------------------------ */
/* Order email — sends every placed order to the SonicPrints inbox     */
/* through EmailJS (no backend needed). Keys come from .env.local:     */
/*   NEXT_PUBLIC_EMAILJS_SERVICE_ID                                    */
/*   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID                                   */
/*   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY                                    */
/* ------------------------------------------------------------------ */

/** Inbox that receives new orders. */
export const ORDER_INBOX = "sonicprints2.0@gmail.com";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

/** Sends the order to ORDER_INBOX. Resolves to false (never throws) if it fails or keys are missing. */
export async function sendOrderEmail(order: Order): Promise<boolean> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS keys are missing — order email not sent. Add them to .env.local.");
    return false;
  }

  const items = order.lines
    .map((l, i) => {
      const opts = Object.entries(l.options)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return `${i + 1}. ${l.name} × ${l.qty}${opts ? ` (${opts})` : ""}`;
    })
    .join("\n");

  // These names must match the {{variables}} used in the EmailJS template.
  const params = {
    to_email: ORDER_INBOX,
    order_id: order.id,
    order_type: order.type === "B2B" ? "B2B · Business" : "B2C · Personal",
    order_date: new Date(order.createdAt).toLocaleString("en-IN"),
    customer_name: order.customer.name,
    business: order.customer.business || "—",
    phone: order.customer.phone,
    customer_email: order.customer.email || "—",
    reply_to: order.customer.email || ORDER_INBOX,
    fulfilment: order.fulfilment,
    address: order.fulfilment === "Delivery" ? order.address : "Pickup at Gandhipuram HQ",
    notes: order.notes || "—",
    items,
    // List for the template's {{#orders}} … {{/orders}} loop.
    orders: order.lines.map((l) => ({
      name: l.name,
      units: l.qty.toLocaleString("en-IN"),
      options: Object.entries(l.options)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · "),
    })),
    total_pieces: order.lines.reduce((n, l) => n + l.qty, 0),
    message: orderMessage(order),
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
    return true;
  } catch (err) {
    // EmailJS rejects with { status, text } — log them so the reason is visible.
    const e = err as { status?: number; text?: string; message?: string };
    console.error(`Order email failed: ${e.status ?? ""} ${e.text ?? e.message ?? String(err)}`);
    return false;
  }
}
