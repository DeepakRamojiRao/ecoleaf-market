import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import {
  categoriesApi,
  type Category,
  type CategoryWriteInput,
} from "@/api/catalog";

import { CategoryForm } from "../components/CategoryForm";

const PAGE_SIZE = 10;

export default function ManageCategoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<string>("display_order");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const list = useQuery({
    queryKey: ["categories", { search, ordering, page }],
    queryFn: () =>
      categoriesApi.list({
        search: search || undefined,
        ordering,
        page,
        page_size: PAGE_SIZE,
      }),
  });

  // Used to populate the parent dropdown — pull all categories once.
  const allParents = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesApi.list({ page_size: 200 }),
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; input: Partial<CategoryWriteInput> }) =>
      categoriesApi.update(vars.id, vars.input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setDeleting(null);
    },
  });

  const columns: Column<Category>[] = [
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
    { key: "id", header: "Id", ordering: "id", width: "80px", render: (r) => r.id },
    {
      key: "children",
      header: "Children",
      width: "100px",
      render: (r) => r.children_count ?? 0,
    },
    {
      key: "name",
      header: "Name",
      ordering: "name",
      render: (r) => <span className="font-medium text-stone-900">{r.name}</span>,
    },
    {
      key: "image",
      header: "Image",
      width: "110px",
      render: (r) =>
        r.image_url ? (
          <img
            src={r.image_url}
            alt=""
            className="h-10 w-10 rounded-md object-cover ring-1 ring-stone-200"
          />
        ) : (
          <span className="text-xs text-stone-400">No image</span>
        ),
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="block max-w-[26ch] truncate text-stone-600">
          {r.description || "—"}
        </span>
      ),
    },
    {
      key: "display_order",
      header: "Display order",
      ordering: "display_order",
      width: "120px",
      align: "right",
      render: (r) => r.display_order,
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
        title="Manage Category"
        breadcrumbs={[{ label: "Manage Category" }]}
        actions={
          <Link
            to="/admin/categories/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add category
          </Link>
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
        searchPlaceholder="Search categories…"
        ordering={ordering}
        onOrderingChange={setOrdering}
        page={page}
        pageSize={PAGE_SIZE}
        total={list.data?.count ?? 0}
        onPageChange={setPage}
        emptyState={
          <span>
            No categories yet.{" "}
            <Link to="/admin/categories/new" className="font-semibold text-emerald-700">
              Add your first one →
            </Link>
          </span>
        }
      />

      {/* Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit category${editing ? `: ${editing.name}` : ""}`}
        size="lg"
      >
        {editing && (
          <CategoryForm
            initial={editing}
            parents={allParents.data?.results ?? []}
            isSubmitting={update.isPending}
            onCancel={() => setEditing(null)}
            submitLabel="Save changes"
            onSubmit={(input) => update.mutateAsync({ id: editing.id, input })}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete category"
        size="sm"
        description={
          deleting
            ? `"${deleting.name}" will be removed permanently. Products linked to it must be reassigned first.`
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
        {remove.isError && (
          <p className="mt-3 text-sm text-red-600">
            Couldn't delete — the category may still have products. Reassign
            them first.
          </p>
        )}
      </Modal>
    </>
  );
}
