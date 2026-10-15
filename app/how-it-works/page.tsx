import type { Metadata } from "next";
import { HowItWorks } from "@/components/sections/how-it-works";

export const metadata: Metadata = {
  title: "How It Works — SonicPrints",
  description:
    "Seven stages from inquiry to delivery — a named owner for each, one price for everyone, quality checked before dispatch and WhatsApp updates at every step.",
};

export default function HowItWorksPage() {
  return (
    <main>
      <HowItWorks />
    </main>
  );
}
