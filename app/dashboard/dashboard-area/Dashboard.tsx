"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, useSession } from "@/components/auth";
import { DashboardAnalytics } from "./dashboard-analytics";
import Sidebar, { type View } from "./Sidebar";
import Topbar from "./Topbar";
import { useDashTheme } from "./useDashTheme";
import CustomersView from "./views/CustomersView";
import OrdersView from "./views/OrdersView";
import EmployeesView from "./views/EmployeesView";
import "./dashboard.css";

const TITLES: Record<View, string> = {
  dashboard: "Dashboard Overview",
  orders: "Orders",
  customers: "Customers",
  employees: "Employees"
};

/**
 * Staff dashboard (UI only, demo data). Rendered as a full-screen layer so the
 * marketing site's navbar / footer stay hidden without touching the root layout.
 */
export default function Dashboard() {
  const session = useSession();
  const [theme, toggleTheme] = useDashTheme();
  const [view, setView] = useState<View>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  // The page behind this layer shouldn't scroll.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const logout = () => {
    clearSession();
    router.push("/");
  };

  const toggleMenu = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed((v) => !v);
    else setMobileOpen((v) => !v);
  };

  return (
    <div data-theme={theme} className="dash fixed inset-0 z-[80] flex bg-[var(--d-bg)] font-sans text-[var(--d-text)] transition-colors duration-500">
      {session === undefined ? null : session === null ? (
        /* Signed out */
        <div className="m-auto max-w-sm p-6 text-center">
          <p className="text-2xl font-extrabold">You&apos;re not signed in</p>
          <p className="mt-2 text-sm text-[var(--d-muted)]">Use Staff Login on the site to open the dashboard.</p>
          <Link
            href="/"
            className="mt-6 inline-flex cursor-pointer rounded-full bg-[#bd5501] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a34900]"
          >
            Back to site
          </Link>
        </div>
      ) : (
        <>
          <Sidebar
            view={view}
            onView={setView}
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            onLogout={logout}
          />

          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
            <Topbar session={session} theme={theme} onToggleTheme={toggleTheme} onMenu={toggleMenu} onLogout={logout} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">{TITLES[view]}</h1>
                </div>
                <span className="rounded-full bg-[#bd5501]/12 px-3 py-1 text-xs font-semibold text-[#bd5501] capitalize">
                  {session.role}
                </span>
              </div>  

              <div key={view}>
                {view === "dashboard" && <DashboardAnalytics />}
                {view === "orders" && <OrdersView />}
                {view === "customers" && <CustomersView />}
                {view === "employees" && <EmployeesView />}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
