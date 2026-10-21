"use client";

import { useCallback, useState } from "react";
import LoginModal from "./LoginModal";

interface Props {
  /** "icon" = round navbar button, "block" = full-width row for the mobile menu. */
  variant?: "icon" | "block";
  onOpen?: () => void;
}

export default function LoginButton({ variant = "icon", onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const show = () => {
    onOpen?.();
    setOpen(true);
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={show}
          aria-label="Staff login"
          title="Staff login"
          className="cursor-pointer grid h-11 w-11 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/10 transition-colors duration-300 hover:bg-accent hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={show}
          className="cursor-pointer flex items-center justify-between rounded-full border border-ink/15 py-2 pr-2 pl-6 text-base font-medium text-ink transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          Staff Login
          <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
            ⎆
          </span>
        </button>
      )}
      <LoginModal open={open} onClose={close} />
    </>
  );
}
