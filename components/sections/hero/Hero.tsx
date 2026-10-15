import localFont from "next/font/local";
import { PrintOrbitScene } from "@/components/three";
import HeroCopy from "./HeroCopy";

// Poppins is used on the hero only; the rest of the site uses Roboto.
const poppins = localFont({
  src: [
    { path: "../../../app/public/fonts/Poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../../app/public/fonts/Poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../../app/public/fonts/Poppins/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  // Fixed family name so the hero's canvas can reference "Poppins" directly.
  declarations: [{ prop: "font-family", value: "Poppins" }],
  variable: "--font-poppins",
  display: "swap",
});

export default function Hero() {
  return (
    <section
      id="home"
      className={`relative h-svh min-h-[640px] w-full overflow-hidden bg-ink font-[family-name:var(--font-poppins)] ${poppins.variable}`}
    >
      <PrintOrbitScene />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,20,8,0.95)_25%,transparent_65%)] md:bg-[radial-gradient(ellipse_at_left,rgba(0,20,8,0.85),transparent_60%)]"
      />
      <HeroCopy />
    </section>
  );
}
