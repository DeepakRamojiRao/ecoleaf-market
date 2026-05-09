import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import {
  suppliersApi,
  type Supplier,
  type SupplierWriteInput,
} from "@/api/suppliers";

const PAGE_SIZE = 10;

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<string>("name");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Supplier | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const list = useQuery({
    queryKey: ["suppliers", { search, ordering, page }],
    queryFn: () =>
      suppliersApi.list({
        search: search || undefined,
        ordering,
        page,
        page_size: PAGE_SIZE,
      }),
  });

  const create = useMutation({
    mutationFn: (input: SupplierWriteInput) => suppliersApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setCreating(false);
    },
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; input: Partial<SupplierWriteInput> }) =>
      suppliersApi.update(vars.id, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setEditing(null);
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => suppliersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setDeleting(null);
    },
  });

  const columns: Column<Supplier>[] = [
    {
      key: "actions",
      header: "Action",
      width: "120px",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(row)}
            aria-label={`Edit ${row.name}`}
            className="rounded-md p-1.5 text-emerald-700 transition hover:bg-emerald-50"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(row)}
            aria-label={`Delete ${row.name}`}
            className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
    { key: "id", header: "Id", ordering: "id", width: "70px", render: (r) => r.id },
    {
      key: "name",
      header: "Name",
      ordering: "name",
      render: (r) => <span className="font-medium text-stone-900">{r.name}</span>,
    },
    { key: "email", header: "Email", render: (r) => r.contact_email || "—" },
    { key: "phone", header: "Phone", render: (r) => r.contact_phone || "—" },
    {
      key: "address",
      header: "Address",
      render: (r) => (
        <span className="block max-w-[26ch] truncate text-stone-600">
          {r.address || "—"}
        </span>
      ),
    },
    {
      key: "products",
      header: "Products",
      width: "100px",
      align: "right",
      render: (r) => r.product_count ?? 0,
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
            Inactive
          </span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Suppliers"
        breadcrumbs={[{ label: "Suppliers" }]}
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add supplier
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
        searchPlaceholder="Search suppliers…"
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
        title="Add supplier"
        size="lg"
      >
        <SupplierForm
          isSubmitting={create.isPending}
          onCancel={() => setCreating(false)}
          submitLabel="Create supplier"
          onSubmit={(input) => create.mutateAsync(input)}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit supplier${editing ? `: ${editing.name}` : ""}`}
        size="lg"
      >
        {editing && (
          <SupplierForm
            initial={editing}
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
        title="Delete supplier"
        size="sm"
        description={
          deleting
            ? `"${deleting.name}" will be removed. Products linked to this supplier will keep their data.`
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

function SupplierForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isSubmitting,
}: {
  initial?: Supplier;
  onSubmit: (input: SupplierWriteInput) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierWriteInput>({
    defaultValues: {
      name: initial?.name ?? "",
      contact_email: initial?.contact_email ?? "",
      contact_phone: initial?.contact_phone ?? "",
      address: initial?.address ?? "",
      notes: initial?.notes ?? "",
      is_active: initial?.is_active ?? true,
    },
  });

  const submit = handleSubmit(async (values) => onSubmit(values));

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <label className="block text-sm font-semibold text-stone-800">Name</label>
        <input
          autoFocus
          {...register("name", { required: "Name is required" })}
          className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="Plantation Co."
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-stone-800">Email</label>
          <input
            type="email"
            {...register("contact_email")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            placeholder="hello@plantation.co"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-800">Phone</label>
          <input
            type="tel"
            {...register("contact_phone")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            placeholder="+91 90000 00000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-800">Address</label>
        <input
          {...register("address")}
          className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-800">Notes</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
