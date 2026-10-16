import type { Metadata } from "next";
import { Checkout } from "@/components/sections/checkout";

export const metadata: Metadata = {
  title: "Checkout — SonicPrints",
  description: "Place your print order with Sonic Prints. No payment now — we confirm the price and timeline within 2 working hours.",
};

export default function CheckoutPage() {
  return (
    <main className="site-gutter min-h-svh bg-cream pt-[clamp(104px,12vw,140px)] pb-[clamp(56px,7vw,96px)] text-ink">
      <Checkout />
    </main>
  );
}
