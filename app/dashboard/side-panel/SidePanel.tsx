"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../dashboard-area/icons";

export const PANEL_DEFAULT = 480;
const PANEL_MIN = 380;
const PANEL_MAX = 900;
const STORE_KEY = "sp-panel-width";

/** Largest width that still leaves room for the sidebar (~290px) + ~400px of content. */
const maxWidth = () => Math.max(PANEL_MIN, Math.min(PANEL_MAX, window.innerWidth - 700));
const clamp = (w: number) => Math.round(Math.min(maxWidth(), Math.max(PANEL_MIN, w)));

/**
 * Panel width with a remembered value. Use it in the page so the content can make
 * room (`xl:pr-[var(--panel-w)]`) and pass `width` / `onWidthChange` to <SidePanel>.
 */
export function usePanelWidth() {
  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return PANEL_DEFAULT;
    try {
      const saved = Number(localStorage.getItem(STORE_KEY));
      return saved ? clamp(saved) : PANEL_DEFAULT;
    } catch {
      return PANEL_DEFAULT;
    }
  });
  const update = (w: number) => {
    setWidth(w);
    try {
      localStorage.setItem(STORE_KEY, String(w));
    } catch {}
  };
  return [width, update] as const;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Small line above the title, e.g. "Customer". */
  eyebrow?: string;
  /** Changing this replays the content fade, e.g. when switching records. */
  contentKey?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Desktop width in px (drag the left edge to change it). */
  width?: number;
  onWidthChange?: (w: number) => void;
}

/**
 * Right-hand detail panel for the dashboard. On desktop (xl) it sits below the top bar,
 * the page stays clickable, and the left edge can be dragged to resize. Below xl it's a
 * full-width drawer with a backdrop. Closes on Escape.
 */
export default function SidePanel({
  open,
  onClose,
  title,
  eyebrow,
  contentKey,
  children,
  footer,
  width: controlled,
  onWidthChange,
}: Props) {
  const [own, setOwn] = useState(PANEL_DEFAULT);
  const width = controlled ?? own;
  const setWidth = onWidthChange ?? setOwn;
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, w: 0 });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ---- Drag to resize (pointer capture keeps it smooth outside the handle) ---- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, w: width };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setWidth(clamp(startRef.current.w + (startRef.current.x - e.clientX)));
  };
  const endDrag = () => setDragging(false);
  const onHandleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setWidth(clamp(width + 24));
    else if (e.key === "ArrowRight") setWidth(clamp(width - 24));
    else return;
    e.preventDefault();
  };

  return (
    <>
      {/* Backdrop — phones / tablets only */}
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-40 cursor-pointer bg-black/50 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* While dragging: keep the resize cursor everywhere and stop text selection */}
      {dragging && <div className="fixed inset-0 z-[60] cursor-col-resize select-none" />}

      <aside
        aria-label={title}
        aria-hidden={!open}
        inert={!open}
        style={{ "--panel-w": `${width}px` } as React.CSSProperties}
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l border-[var(--d-border)] bg-[var(--d-surface)] shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.5)] ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-[480px] xl:top-20 xl:w-[var(--panel-w)] xl:max-w-none ${
          dragging ? "transition-none" : "transition-transform duration-500"
        } ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Resize handle (desktop) */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel"
          aria-valuenow={width}
          aria-valuemin={PANEL_MIN}
          aria-valuemax={PANEL_MAX}
          tabIndex={0}
          title="Drag to resize · double-click to reset"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => setWidth(clamp(PANEL_DEFAULT))}
          onKeyDown={onHandleKey}
          className="group absolute inset-y-0 -left-2 z-10 hidden w-4 cursor-col-resize touch-none items-center justify-center outline-none xl:flex"
        >
          <span
            className={`h-full w-0.5 transition-colors ${
              dragging ? "bg-[#bd5501]" : "bg-transparent group-hover:bg-[#bd5501]/60 group-focus-visible:bg-[#bd5501]"
            }`}
          />
          <span
            className={`absolute grid h-10 w-4 place-items-center rounded-full border border-[var(--d-border)] bg-[var(--d-card)] shadow transition-colors ${
              dragging ? "border-[#bd5501]" : "group-hover:border-[#bd5501]/60"
            }`}
          >
            <span className="flex gap-[3px]">
              <span className="h-4 w-px bg-[var(--d-muted)]" />
              <span className="h-4 w-px bg-[var(--d-muted)]" />
            </span>
          </span>
        </div>

        <header className="flex items-start justify-between gap-4 border-b border-[var(--d-border)] px-6 py-5">
          <div className="min-w-0">
            {eyebrow && <p className="text-[11px] font-semibold tracking-[0.2em] text-[#bd5501] uppercase">{eyebrow}</p>}
            <h2 className="mt-1 truncate text-xl font-extrabold tracking-[-0.02em] text-[var(--d-text)]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--d-muted)] transition-[background-color,color,transform] duration-300 hover:rotate-90 hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]"
          >
            <Icon name="close" />
          </button>
        </header>

        <div key={contentKey} className="dash-rise flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {footer && <footer className="border-t border-[var(--d-border)] px-6 py-4">{footer}</footer>}
      </aside>
    </>
  );
}
