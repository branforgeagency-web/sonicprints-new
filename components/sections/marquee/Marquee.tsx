import { CurvedLoop } from "@/components/animations";

export default function Marquee() {
  return (
    <section className="overflow-hidden bg-ink py-5">
      <CurvedLoop
        marqueeText="Sonic ✦ Prints ✦ Print ✦ Anything ✦"
        speed={1}
        curveAmount={0}
        direction="left"
        interactive
        baseline={39}
        stripHeight={50}
        className="text-[40px]"
        scrollLinked
        scrollFactor={0.6}
      />
    </section>
  );
}
