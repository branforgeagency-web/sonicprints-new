"use client";

import { useState } from "react";
import { Icon } from "../dashboard-area/icons";

export interface Column<T> {
  key: string;
  header: string;
  /** Cell content; defaults to `row[key]`. */
  render?: (row: T) => React.ReactNode;
  /** Classes for the body cells of this column. */
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pageSizes?: number[];
  emptyText?: string;
  minWidth?: number;
}

/** Themed table with client-side pagination (uses the dashboard `--d-*` tokens). */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  pageSizes = [5, 10, 20],
  emptyText = "No records found.",
  minWidth = 720,
}: Props<T>) {
  const [size, setSize] = useState(pageSizes[0]!);
  const [page, setPage] = useState(1);

  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages); // stays valid when filters shrink the rows
  const start = (current - 1) * size;
  const visible = rows.slice(start, start + size);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead className="text-xs tracking-wide text-[var(--d-muted)] uppercase">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-5 py-3.5 font-semibold">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-t border-[var(--d-border)] text-[var(--d-text)] transition-colors hover:bg-[var(--d-hover)]"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-4 ${c.className ?? ""}`}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-[var(--d-muted)]">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={current}
        pages={pages}
        total={rows.length}
        start={start}
        shown={visible.length}
        size={size}
        pageSizes={pageSizes}
        onPage={setPage}
        onSize={(s) => {
          setSize(s);
          setPage(1);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

// 1 … 4 5 6 … 12 — always first, last and the neighbours of the current page.
function pageList(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pages - 1, page + 1);
  if (from > 2) out.push("…");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < pages - 1) out.push("…");
  out.push(pages);
  return out;
}

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  start: number;
  shown: number;
  size: number;
  pageSizes: number[];
  onPage: (p: number) => void;
  onSize: (s: number) => void;
}

function Pagination({ page, pages, total, start, shown, size, pageSizes, onPage, onSize }: PaginationProps) {
  const arrow =
    "grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[var(--d-text)] transition-colors hover:bg-[var(--d-hover)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--d-border)] px-5 py-4 text-sm sm:flex-row">
      <div className="flex items-center gap-3 text-[var(--d-muted)]">
        <span>
          {total === 0 ? "0" : `${start + 1}–${start + shown}`} of {total}
        </span>
        <label className="flex items-center gap-2">
          <span className="sr-only sm:not-sr-only">Rows</span>
          <select
            value={size}
            onChange={(e) => onSize(Number(e.target.value))}
            className="h-9 cursor-pointer rounded-lg border border-[var(--d-border)] bg-[var(--d-card)] px-2 text-[var(--d-text)] outline-none focus:border-[#bd5501]"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)} className={arrow}>
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>
        {pageList(page, pages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="w-9 text-center text-[var(--d-muted)]">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 min-w-9 cursor-pointer rounded-lg px-2 font-semibold tabular-nums transition-colors ${
                p === page ? "bg-[#bd5501] text-white" : "text-[var(--d-muted)] hover:bg-[var(--d-hover)] hover:text-[var(--d-text)]"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => onPage(page + 1)} className={arrow}>
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
