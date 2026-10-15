import type { Metadata } from "next";
import { Kits } from "@/components/sections/kits";

export const metadata: Metadata = {
  title: "Kits — SonicPrints",
  description:
    "Twelve ready-made print kits — Brand Identity, Stationery, Packaging, Signage, Corporate Gifts and more. Order a full kit or just the pieces you need.",
};

export default function KitsPage() {
  return (
    <main>
      <Kits />
    </main>
  );
}
