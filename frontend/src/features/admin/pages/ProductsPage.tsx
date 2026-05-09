import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import {
  categoriesApi,
  productsApi,
  type Product,
  type ProductWriteInput,
} from "@/api/catalog";
import { suppliersApi } from "@/api/suppliers";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const list = useQuery({
    queryKey: ["products", { search, ordering, page }],
    queryFn: () =>
      productsApi.list({
        search: search || undefined,
        ordering,
        page,
        page_size: PAGE_SIZE,
      }),
  });
  const categories = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesApi.list({ page_size: 200 }),
  });
  const suppliers = useQuery({
    queryKey: ["suppliers", "all"],
    queryFn: () => suppliersApi.list({ page_size: 200 }),
  });

  const create = useMutation({
    mutationFn: (input: ProductWriteInput) => productsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setCreating(false);
    },
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; input: Partial<ProductWriteInput> }) =>
      productsApi.update(vars.id, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setDeleting(null);
    },
  });

  const columns: Column<Product>[] = [
    {
      key: "actions",
      header: "Action",
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(row)}
            className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(row)}
            className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
    {
      key: "image",
      header: "Image",
      width: "70px",
      render: (r) =>
        r.image_url ? (
          <img
            src={r.image_url}
            alt=""
            className="h-10 w-10 rounded-md object-cover ring-1 ring-stone-200"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-[10px] text-stone-400">
            No img
          </div>
        ),
    },
    { key: "sku", header: "SKU", ordering: "sku", render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    {
      key: "name",
      header: "Name",
      ordering: "name",
      render: (r) => <span className="font-medium text-stone-900">{r.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (r) => r.category_name ?? "—",
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (r) => r.supplier_name ?? "—",
    },
    {
      key: "price",
      header: "Price",
      ordering: "price",
      width: "100px",
      align: "right",
      render: (r) => `₹${r.price}`,
    },
    {
      key: "stock",
      header: "Stock",
      ordering: "stock_quantity",
      width: "120px",
      align: "right",
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
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
      key: "active",
      header: "Status",
      width: "100px",
      render: (r) =>
        r.is_active ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Active
          </span>
        ) : (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600 ring-1 ring-stone-200">
            Hidden
          </span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        breadcrumbs={[{ label: "Products" }]}
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add product
          </button>
        }
      />

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
        searchPlaceholder="Search by SKU or name…"
        ordering={ordering}
        onOrderingChange={setOrdering}
        page={page}
        pageSize={PAGE_SIZE}
        total={list.data?.count ?? 0}
        onPageChange={setPage}
      />

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Add product"
        size="lg"
      >
        <ProductForm
          categories={categories.data?.results ?? []}
          suppliers={suppliers.data?.results ?? []}
          isSubmitting={create.isPending}
          onCancel={() => setCreating(false)}
          submitLabel="Create product"
          onSubmit={(input) => create.mutateAsync(input)}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit product${editing ? `: ${editing.name}` : ""}`}
        size="lg"
      >
        {editing && (
          <ProductForm
            initial={editing}
            categories={categories.data?.results ?? []}
            suppliers={suppliers.data?.results ?? []}
            isSubmitting={update.isPending}
            onCancel={() => setEditing(null)}
            submitLabel="Save changes"
            onSubmit={(input) => update.mutateAsync({ id: editing.id, input })}
          />
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete product"
        size="sm"
        description={
          deleting
            ? `"${deleting.name}" will be removed permanently.`
            : undefined
        }
      >
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setDeleting(null)}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting.id)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-60"
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </>
  );
}

function ProductForm({
  initial,
  categories,
  suppliers,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isSubmitting,
}: {
  initial?: Product;
  categories: { id: number; name: string }[];
  suppliers: { id: number; name: string }[];
  onSubmit: (input: ProductWriteInput) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductWriteInput & { supplier: number | "" }>({
    defaultValues: {
      sku: initial?.sku ?? "",
      name: initial?.name ?? "",
      category: initial?.category ?? (categories[0]?.id ?? 0),
      supplier: initial?.supplier ?? "",
      description: initial?.description ?? "",
      price: initial?.price ?? "0.00",
      cost: initial?.cost ?? "0.00",
      stock_quantity: initial?.stock_quantity ?? 0,
      low_stock_threshold: initial?.low_stock_threshold ?? 10,
      image_url: initial?.image_url ?? "",
      is_active: initial?.is_active ?? true,
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      sku: values.sku.trim(),
      name: values.name.trim(),
      category: Number(values.category),
      supplier:
        values.supplier === "" || values.supplier == null
          ? null
          : Number(values.supplier),
      description: values.description?.trim() ?? "",
      price: String(values.price),
      cost: String(values.cost ?? "0"),
      stock_quantity: Number(values.stock_quantity ?? 0),
      low_stock_threshold: Number(values.low_stock_threshold ?? 10),
      image_url: values.image_url?.trim() ?? "",
      is_active: !!values.is_active,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-stone-800">SKU</label>
          <input
            {...register("sku", { required: "SKU is required" })}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            placeholder="BL-LRG-001"
          />
          {errors.sku && (
            <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800">Name</label>
          <input
            {...register("name", { required: "Name is required" })}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            placeholder="Large fresh banana leaf"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-stone-800">
            Category
          </label>
          <select
            {...register("category", {
              required: "Category is required",
              valueAsNumber: true,
            })}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {categories.length === 0 && (
              <option value="">— No categories yet —</option>
            )}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">
              {errors.category.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800">
            Supplier
          </label>
          <select
            {...register("supplier")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">— None —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-800">
          Description
        </label>
        <textarea
          rows={3}
          {...register("description")}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-semibold text-stone-800">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("price", { required: true })}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800">Cost</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("cost")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800">Stock</label>
          <input
            type="number"
            min="0"
            {...register("stock_quantity", { valueAsNumber: true })}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800">
            Low-stock at
          </label>
          <input
            type="number"
            min="0"
            {...register("low_stock_threshold", { valueAsNumber: true })}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-800">
          Image URL
        </label>
        <input
          type="url"
          {...register("image_url")}
          className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="https://…/product.jpg"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          {...register("is_active")}
          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
        />
        Active
      </label>

      <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 transition hover:shadow-lg disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
