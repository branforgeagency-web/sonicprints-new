"use client";

import Image from "next/image";
import logo from "@/app/public/images/nav/soniclogo-trimmed.png";
import { Icon, type IconName } from "./icons";

export type View = "dashboard" | "orders" | "customers" | "employees";

export const NAV: { id: View; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "orders", label: "Orders", icon: "orders" },
  { id: "customers", label: "Customers", icon: "customers" },
  { id: "employees", label: "Employees", icon: "employees" },
];

interface Props {
  view: View;
  onView: (v: View) => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export default function Sidebar({ view, onView, collapsed, mobileOpen, onCloseMobile, onLogout }: Props) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={onCloseMobile}
        className={`fixed inset-0 z-30 cursor-pointer bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--d-border)] bg-[var(--d-surface)] transition-[transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[88px]" : "lg:w-72"}`}
      >
        {/* Logo */}
        <div className={`flex h-20 items-center gap-3 px-5 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f7f4ee] p-1.5 ring-1 ring-[var(--d-border)]">
            <Image src={logo} alt="" priority sizes="56px" className="h-full w-auto object-contain" />
          </span>
          <span className={`text-[22px] font-extrabold tracking-[-0.03em] text-[var(--d-text)] ${collapsed ? "lg:hidden" : ""}`}>
            Sonic<span className="text-[#bd5501]">Prints</span>
          </span>
        </div>

        {/* Links */}
        <nav aria-label="Dashboard" className="mt-4 flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const on = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onView(item.id);
                  onCloseMobile();
                }}
                aria-current={on ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={`group relative flex h-12 w-full cursor-pointer items-center gap-4 rounded-xl px-4 text-[15px] font-semibold transition-colors duration-300 ${
                  on ? "bg-[#bd5501]/12 text-[#bd5501]" : "text-[var(--d-muted)] hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]"
                } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-2 bottom-2 -left-3 w-1 rounded-r-full bg-[#bd5501] transition-opacity ${on ? "opacity-100" : "opacity-0"}`}
                />
                <Icon name={item.icon} className="h-[22px] w-[22px] shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-5">
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? "Log out" : undefined}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#bd5501] text-[15px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(189,85,1,0.9)] transition-[background-color,transform] duration-300 hover:bg-[#a34900] active:scale-[0.98]"
          >
            <Icon name="logout" />
            <span className={collapsed ? "lg:hidden" : ""}>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
