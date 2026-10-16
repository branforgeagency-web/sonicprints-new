import type { Metadata } from "next";
import { Suspense } from "react";
import { Track } from "@/components/sections/track";

export const metadata: Metadata = {
  title: "Track your order — SonicPrints",
  description: "Follow your Sonic Prints order through every stage, from inquiry to delivery.",
};

export default function TrackPage() {
  return (
    <main className="site-gutter min-h-svh bg-cream pt-[clamp(104px,12vw,140px)] pb-[clamp(56px,7vw,96px)] text-ink">
      {/* The order ID comes from the URL, so it's read inside Suspense. */}
      <Suspense fallback={null}>
        <Track />
      </Suspense>
    </main>
  );
}
