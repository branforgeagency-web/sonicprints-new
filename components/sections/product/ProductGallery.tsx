"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { ProductMedia } from "@/components/ui";

/** Amazon-style product photo: hover (or touch-drag) to zoom into the spot under the pointer. */
export default function ProductGallery({ image, alt, name, label }: { image?: StaticImageData; alt: string; name: string; label: string }) {
  const [zoom, setZoom] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // No photo yet: a branded placeholder, without zoom.
  if (!image) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[32px] ring-1 ring-ink/[0.06]">
        <ProductMedia alt={alt} name={name} label={label} sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
    );
  }

  const follow = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    if (imgRef.current) imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div
      onPointerEnter={(e) => {
        follow(e);
        setZoom(true);
      }}
      onPointerMove={follow}
      onPointerLeave={() => setZoom(false)}
      className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[32px] bg-[#f1f1f1] ring-1 ring-ink/[0.06]"
    >
      <Image
        ref={imgRef}
        src={image}
        alt={alt}
        fill
        priority
        placeholder="blur"
        sizes="(max-width: 1024px) 100vw, 50vw"
        className={`object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${zoom ? "scale-[2.1]" : "scale-100"}`}
      />
      <span
        className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] whitespace-nowrap text-ink/60 uppercase ring-1 ring-ink/5 backdrop-blur transition-opacity duration-300 ${
          zoom ? "opacity-0" : "opacity-100"
        }`}
      >
        Hover to zoom
      </span>
    </div>
  );
}
