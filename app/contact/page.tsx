import type { Metadata } from "next";
import { Quote } from "@/components/sections/quote";

export const metadata: Metadata = {
  title: "Get a Quote — SonicPrints",
  description:
    "Tell us what you need printed and get a clear price within 2 working hours. Visit Sonic Prints HQ in Gandhipuram, Coimbatore, or reach us on WhatsApp.",
};

export default function ContactPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <main>
      <Quote searchParams={searchParams} />
    </main>
  );
}
