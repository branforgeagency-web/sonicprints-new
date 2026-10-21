"use client";

import { useState } from "react";
import { DataTable, type Column } from "../../table";
import { EMPLOYEES, type Employee } from "../data";
import { Icon } from "../icons";

const FILTERS = ["All", "Active", "Inactive"] as const;

/* ------------------------------------------------------------------ */
/* Active / inactive switch                                            */
/* ------------------------------------------------------------------ */

function StatusToggle({ on, name, onChange }: { on: boolean; name: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${on ? "Deactivate" : "Activate"} ${name}`}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-[#bd5501]/25 focus-visible:outline-none ${
        on ? "bg-[#0f6b3e]" : "bg-[var(--d-grid)]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export default function EmployeesView() {
  // Demo only: toggles live in local state until there's an API to save them.
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  const toggle = (id: string) =>
    setEmployees((list) => list.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Name",
      className: "whitespace-nowrap",
      render: (e) => (
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#bd5501]/15 text-sm font-bold text-[#bd5501]">
            {e.name[0]}
          </span>
          <span className="font-semibold">{e.name}</span>
        </span>
      ),
    },
    { key: "username", header: "Username", className: "font-mono text-xs text-[var(--d-muted)]" },
    {
      key: "email",
      header: "Email",
      render: (e) => (
        <a href={`mailto:${e.email}`} className="hover:text-[#bd5501] hover:underline">
          {e.email}
        </a>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      className: "whitespace-nowrap",
      render: (e) => (
        <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="hover:text-[#bd5501]">
          {e.phone}
        </a>
      ),
    },
    { key: "department", header: "Department", className: "whitespace-nowrap" },
    { key: "branch", header: "Branch", className: "whitespace-nowrap" },
    { key: "location", header: "Location", className: "whitespace-nowrap text-[var(--d-muted)]" },
    {
      key: "address",
      header: "Address",
      className: "whitespace-nowrap",
      render: (e) => (
        <span className="block leading-tight">
          {e.address}
          <span className="block text-xs text-[var(--d-muted)]">{e.area}</span>
        </span>
      ),
    },
    { key: "state", header: "State", className: "whitespace-nowrap text-[var(--d-muted)]" },
    { key: "country", header: "Country", className: "text-[var(--d-muted)]" },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      render: (e) => (
        <span className="flex items-center gap-3">
          <StatusToggle on={e.active} name={e.name} onChange={() => toggle(e.id)} />
          <span className={`w-14 text-xs font-semibold ${e.active ? "text-[#2f9a62]" : "text-[var(--d-muted)]"}`}>
            {e.active ? "Active" : "Inactive"}
          </span>
        </span>
      ),
    },
  ];

  const needle = q.trim().toLowerCase();
  const rows = employees.filter(
    (e) =>
      (filter === "All" || (filter === "Active") === e.active) &&
      [e.name, e.username, e.email, e.phone, e.department, e.branch, e.area, e.location, e.state]
        .join(" ")
        .toLowerCase()
        .includes(needle),
  );
  const activeCount = employees.filter((e) => e.active).length;

  return (
    <section className="dash-rise rounded-2xl border border-[var(--d-border)] bg-[var(--d-card)]">
      <div className="flex flex-col gap-4 border-b border-[var(--d-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === f ? "bg-[#bd5501] text-white" : "bg-[var(--d-hover)] text-[var(--d-muted)] hover:text-[var(--d-text)]"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-1 text-sm text-[var(--d-muted)]">
            {activeCount} of {employees.length} active
          </span>
        </div>
        <label className="relative block sm:w-72">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--d-muted)]">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search employees…"
            aria-label="Search employees"
            className="h-11 w-full rounded-xl border border-[var(--d-border)] bg-transparent pr-4 pl-10 text-sm text-[var(--d-text)] outline-none placeholder:text-[var(--d-muted)] focus:border-[#bd5501]"
          />
        </label>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        pageSizes={[8, 15, 25]}
        minWidth={1750}
        emptyText="No employees match."
      />
    </section>
  );
}
