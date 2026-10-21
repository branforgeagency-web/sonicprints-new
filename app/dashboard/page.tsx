import type { Metadata } from "next";
import { Dashboard } from "./dashboard-area";

export const metadata: Metadata = {
  title: "Dashboard · SonicPrints",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
