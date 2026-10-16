import Image, { type StaticImageData } from "next/image";

interface Props {
  image?: StaticImageData;
  alt: string;
  name: string;
  label?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  compact?: boolean;
}

/** Product photo filling its (relative) parent — or a branded placeholder until a photo is added. */
export default function ProductMedia({
  image,
  alt,
  name,
  label,
  sizes,
  priority,
  className = "",
  compact = false,
}: Props) {
  if (image) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 overflow-hidden bg-ink ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute -right-[18%] -bottom-[18%] aspect-square w-[70%] rounded-full bg-accent/35 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(247,244,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(247,244,238,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      {!compact && label && (
        <span className="absolute top-[9%] left-[9%] max-w-[80%] font-mono text-[10px] tracking-[0.16em] text-cream/45 uppercase">
          {label}
        </span>
      )}
      <span
        className={`absolute right-[9%] bottom-[9%] left-[9%] leading-[1.02] font-extrabold tracking-[-0.03em] text-cream ${
          compact ? "text-[11px]" : "text-[clamp(12px,1.5vw,20px)]"
        }`}
      >
        {name}
      </span>
    </div>
  );
}
