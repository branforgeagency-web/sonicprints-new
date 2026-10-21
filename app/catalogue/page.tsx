import type { Metadata } from "next";
import { Kits } from "@/components/sections/kits";

export const metadata: Metadata = {
  title: "Catalogue — SonicPrints",
  description:
    "The SonicPrints catalogue — every product we print on, from business cards and mugs to packaging and signage, grouped by category. Order one piece or a full set.",
};

export default function CataloguePage() {
  return (
    <main>
      <Kits />
    </main>
  );
}
