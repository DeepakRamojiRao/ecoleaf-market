import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Package, Warehouse } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { productsApi, type Product } from "@/api/catalog";

const PAGE_SIZE = 10;

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<string>("stock_quantity");
  const [page, setPage] = useState(1);
  const [lowOnly, setLowOnly] = useState(false);

  const list = useQuery({
    queryKey: ["inventory", { search, ordering, page, lowOnly }],
    queryFn: () =>
      productsApi.list({
        search: search || undefined,
        ordering,
        page,
        page_size: PAGE_SIZE,
        low_stock: lowOnly || undefined,
      }),
  });

  const total = list.data?.count ?? 0;
  const lowStockCount = list.data?.results.filter((p) => p.is_low_stock).length ?? 0;

  const columns: Column<Product>[] = [
    {
      key: "image",
      header: "Image",
      width: "70px",
      render: (r) =>
        r.image_display_url ? (
          <img
            src={r.image_display_url}
            alt=""
            className="h-10 w-10 rounded-md object-cover ring-1 ring-stone-200"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-[10px] text-stone-400">
            No img
          </div>
        ),
    },
    {
      key: "sku",
      header: "SKU",
      ordering: "sku",
      render: (r) => <span className="font-mono text-xs">{r.sku}</span>,
    },
    {
      key: "name",
      header: "Name",
      ordering: "name",
      render: (r) => <span className="font-medium text-stone-900">{r.name}</span>,
    },
    { key: "category", header: "Category", render: (r) => r.category_name ?? "—" },
    {
      key: "stock",
      header: "On hand",
      ordering: "stock_quantity",
      width: "120px",
      align: "right",
      render: (r) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
            r.is_low_stock
              ? "bg-amber-50 text-amber-700 ring-amber-100"
              : "bg-emerald-50 text-emerald-700 ring-emerald-100"
          }`}
        >
          {r.stock_quantity}
        </span>
      ),
    },
    {
      key: "threshold",
      header: "Low at",
      width: "100px",
      align: "right",
      render: (r) => r.low_stock_threshold,
    },
    {
      key: "status",
      header: "Status",
      width: "140px",
      render: (r) =>
        r.is_low_stock ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
            <AlertTriangle className="h-3 w-3" aria-hidden /> Low stock
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Healthy
          </span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Live stock levels across all active products."
        breadcrumbs={[{ label: "Inventory" }]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<Package className="h-5 w-5" aria-hidden />}
          label="Total products"
          value={total}
          tone="emerald"
        />
        <SummaryCard
          icon={<Warehouse className="h-5 w-5" aria-hidden />}
          label="Items in current view"
          value={list.data?.results.length ?? 0}
          tone="lime"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" aria-hidden />}
          label="Low-stock in view"
          value={lowStockCount}
          tone="amber"
        />
      </div>

      <DataTable
        columns={columns}
        rows={list.data?.results ?? []}
        rowKey={(r) => r.id}
        loading={list.isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search inventory…"
        ordering={ordering}
        onOrderingChange={setOrdering}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        toolbar={
          <label className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => {
                setLowOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            Low-stock only
          </label>
        }
      />
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "emerald" | "lime" | "amber";
}) {
  const tones: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    lime: "bg-lime-50 text-lime-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
