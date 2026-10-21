const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
} as const;

interface Props {
  /** Fade the loader in/out (handy for overlays). Defaults to true. */
  show?: boolean;
  /** Optional text under the spinner, also announced to screen readers. */
  label?: string;
  size?: keyof typeof SIZES;
  /** Cover the nearest `relative` parent with a blurred cream layer. */
  overlay?: boolean;
  className?: string;
}

/** Brand spinner — inline, or as an overlay over its `relative` parent. */
export default function Loader({ show = true, label, size = "lg", overlay = false, className = "" }: Props) {
  const spinner = (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-ink/10 border-t-accent ${SIZES[size]}`}
    />
  );

  if (!overlay && !label) {
    return show ? <span role="status" aria-label="Loading" className={`inline-flex ${className}`}>{spinner}</span> : null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!show}
      className={`flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${
        overlay ? "absolute inset-0 z-10 bg-cream/90 backdrop-blur-sm" : ""
      } ${show ? "opacity-100" : "pointer-events-none opacity-0"} ${className}`}
    >
      {spinner}
      {label ? <p className="text-sm font-semibold text-ink">{label}</p> : <span className="sr-only">Loading</span>}
    </div>
  );
}
