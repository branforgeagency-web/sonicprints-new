import { About } from "@/components/sections/about";
import { Audiences } from "@/components/sections/audiences";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Reviews } from "@/components/sections/reviews";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Marquee />
      <Audiences />
      <Reviews />
    </main>
  );
}
