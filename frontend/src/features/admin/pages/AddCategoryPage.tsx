import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/admin/PageHeader";
import { categoriesApi, type CategoryWriteInput } from "@/api/catalog";

import { CategoryForm } from "../components/CategoryForm";

export default function AddCategoryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const parents = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesApi.list({ page_size: 200 }),
  });

  const create = useMutation({
    mutationFn: (input: CategoryWriteInput) => categoriesApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      navigate("/admin/categories");
    },
  });

  return (
    <>
      <PageHeader
        title="Add Category"
        breadcrumbs={[
          { label: "Manage Category", to: "/admin/categories" },
          { label: "Add Category" },
        ]}
      />

      <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <CategoryForm
          parents={parents.data?.results ?? []}
          isSubmitting={create.isPending}
          onCancel={() => navigate("/admin/categories")}
          submitLabel="Create category"
          onSubmit={(input) => create.mutateAsync(input)}
        />
        {create.isError && (
          <p className="mt-3 text-sm text-red-600">
            Couldn't create category. Please check the fields and try again.
          </p>
        )}
      </div>
    </>
  );
}
