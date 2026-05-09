import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { adminApi } from "@/api/admin";
import type { User } from "@/store/authStore";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ["customers", { search, ordering, page }],
    queryFn: () =>
      adminApi.customers({
        search: search || undefined,
        ordering,
        page,
        page_size: PAGE_SIZE,
      }),
  });

  const columns: Column<User>[] = [
    {
      key: "id",
      header: "Id",
      ordering: "id",
      width: "80px",
      render: (r) => r.id,
    },
    {
      key: "email",
      header: "Email",
      ordering: "email",
      render: (r) => <span className="font-medium text-stone-900">{r.email}</span>,
    },
    {
      key: "name",
      header: "Name",
      ordering: "full_name",
      render: (r) => r.full_name || "—",
    },
    { key: "phone", header: "Phone", render: (r) => r.phone || "—" },
    {
      key: "type",
      header: "Account type",
      width: "140px",
      render: (r) => (
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-stone-700 ring-1 ring-stone-200">
          {r.account_type}
        </span>
      ),
    },
    {
      key: "onboarded",
      header: "Onboarded",
      width: "120px",
      render: (r) =>
        r.is_onboarded ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Yes
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
            Pending
          </span>
        ),
    },
    {
      key: "created",
      header: "Joined",
      ordering: "created_at",
      width: "140px",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Everyone who has signed up for the storefront."
        breadcrumbs={[{ label: "Customers" }]}
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
        searchPlaceholder="Search by email, name, or phone…"
        ordering={ordering}
        onOrderingChange={setOrdering}
        page={page}
        pageSize={PAGE_SIZE}
        total={list.data?.count ?? 0}
        onPageChange={setPage}
      />
    </>
  );
}
