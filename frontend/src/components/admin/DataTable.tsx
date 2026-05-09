/**
 * Reusable admin data table.
 *
 *   - Search input (controlled — caller provides the value + setter)
 *   - Sortable column headers (click to toggle asc/desc)
 *   - Pagination controls (next/prev + range readout)
 *   - Loading + empty states
 *
 * The table is intentionally generic: each column receives `(row) =>
 * ReactNode` so callers can render badges, icons, action buttons inline.
 */
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  /** Stable backend ordering key; omit for non-sortable columns. */
  ordering?: string;
  width?: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyState?: ReactNode;

  // Search
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Sorting
  ordering?: string; // e.g. "name" or "-created_at"
  onOrderingChange?: (value: string) => void;

  // Pagination
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;

  // Right-rail toolbar (e.g. "Add" button)
  toolbar?: ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyState,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  ordering,
  onOrderingChange,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  toolbar,
}: Props<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  function toggleSort(col: Column<T>) {
    if (!col.ordering || !onOrderingChange) return;
    const current = ordering ?? "";
    if (current === col.ordering) onOrderingChange(`-${col.ordering}`);
    else if (current === `-${col.ordering}`) onOrderingChange(col.ordering);
    else onOrderingChange(col.ordering);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {(onSearchChange || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 px-4 py-3 sm:px-5">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[12rem]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden
              />
              <input
                value={search ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                type="search"
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-100 bg-stone-50/60 text-stone-600">
            <tr>
              {columns.map((col) => {
                const isAsc = ordering === col.ordering;
                const isDesc = ordering === `-${(col.ordering ?? "")}`;
                const isActive = isAsc || isDesc;
                const align =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left";
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={`px-4 py-3 font-semibold uppercase tracking-wide text-[11px] ${align}`}
                  >
                    {col.ordering ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className={`inline-flex items-center gap-1 transition hover:text-stone-900 ${
                          isActive ? "text-emerald-700" : ""
                        }`}
                      >
                        {col.header}
                        {isAsc ? (
                          <ArrowUp className="h-3 w-3" aria-hidden />
                        ) : isDesc ? (
                          <ArrowDown className="h-3 w-3" aria-hidden />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-stone-50 last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-3 w-full max-w-[120px] animate-pulse rounded bg-stone-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-sm text-stone-500"
                >
                  {emptyState ?? "Nothing here yet."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-stone-50 last:border-0 hover:bg-emerald-50/30"
                >
                  {columns.map((col) => {
                    const align =
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                          ? "text-center"
                          : "text-left";
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-stone-800 ${align}`}
                      >
                        {col.render(row)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-4 py-3 text-xs text-stone-600 sm:px-5">
          <p>
            Showing <strong className="text-stone-900">{showingFrom}</strong>–
            <strong className="text-stone-900">{showingTo}</strong> of{" "}
            <strong className="text-stone-900">{total}</strong>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-md border border-stone-200 bg-white px-3 py-1.5 font-medium transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 font-medium text-stone-700">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-stone-200 bg-white px-3 py-1.5 font-medium transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
