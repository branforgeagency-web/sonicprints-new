"use client";

import { useSyncExternalStore } from "react";

export type DashTheme = "dark" | "light";

const KEY = "sp-dash-theme";
const EVENT = "sp-dash-theme-change";

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

const read = (): DashTheme => {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

/** Dashboard-only dark / light theme, remembered per browser. */
export function useDashTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as DashTheme);
  const toggle = () => {
    try {
      localStorage.setItem(KEY, theme === "dark" ? "light" : "dark");
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  };
  return [theme, toggle] as const;
}
