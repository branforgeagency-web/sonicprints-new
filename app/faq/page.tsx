import type { Metadata } from "next";
import { Faq, FAQ_GROUPS } from "@/components/sections/faq";

export const metadata: Metadata = {
  title: "FAQ — SonicPrints",
  description: "Answers about ordering, pricing, payment, design proofs, quality checks and delivery at Sonic Prints, Coimbatore.",
};

// FAQPage structured data so search engines can show answers directly.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((g) =>
    g.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
};

export default function FaqPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
      <Faq />
    </main>
  );
}
