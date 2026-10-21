"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@/components/auth";
import { Icon } from "./icons";
import type { DashTheme } from "./useDashTheme";

interface Props {
  session: Session;
  theme: DashTheme;
  onToggleTheme: () => void;
  onMenu: () => void;
  onLogout: () => void;
}

export default function Topbar({ session, theme, onToggleTheme, onMenu, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile menu on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const btn =
    "grid h-11 w-11 cursor-pointer place-items-center rounded-full text-[#bd5501] transition-colors duration-300 hover:bg-[var(--d-hover)]";

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-[var(--d-border)] bg-[var(--d-surface)]/85 px-4 backdrop-blur-xl sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Toggle menu" className={btn}>
        <Icon name="menu" className="h-6 w-6" />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
          className={btn}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} className="h-6 w-6" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Account"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-[#bd5501] text-base font-bold text-white uppercase ring-4 ring-[#bd5501]/15 transition-transform duration-300 hover:scale-105"
          >
            {session.user.trim()[0] ?? "S"}
          </button>

          <div
            className={`absolute top-full right-0 mt-3 w-60 origin-top-right rounded-2xl border border-[var(--d-border)] bg-[var(--d-card)] p-2 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] transition-[transform,opacity] duration-200 ${
              open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
            }`}
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-[var(--d-text)]">{session.user}</p>
              <p className="mt-0.5 text-xs text-[var(--d-muted)] capitalize">{session.role}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--d-text)] transition-colors hover:bg-[var(--d-hover)] hover:text-[#bd5501]"
            >
              <Icon name="logout" className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
