"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Role } from "./LoginModal";

/* Front-end only demo session (no backend) — saved in localStorage. */

export interface Session {
  user: string;
  role: Role;
}

const KEY = "sp-session";
const EVENT = "sp-session-change";

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export function saveSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** `undefined` while rendering on the server, `null` when signed out. */
export function useSession(): Session | null | undefined {
  const raw = useSyncExternalStore(subscribe, read, () => undefined);
  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }, [raw]);
}
