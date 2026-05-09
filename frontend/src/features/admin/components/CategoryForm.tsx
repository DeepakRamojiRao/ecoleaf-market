/**
 * Shared category create/edit form. Drops in for both the Add Category page
 * (full-page form) and the inline edit modal on the Manage Category page.
 */
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { Category, CategoryWriteInput } from "@/api/catalog";

type Props = {
  initial?: Category | null;
  parents: Category[];
  onSubmit: (values: CategoryWriteInput) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
};

export function CategoryForm({
  initial,
  parents,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isSubmitting,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryWriteInput & { parent: number | "" }>({
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      parent: initial?.parent ?? "",
      image_url: initial?.image_url ?? "",
      display_order: initial?.display_order ?? 0,
      is_active: initial?.is_active ?? true,
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      parent: initial?.parent ?? "",
      image_url: initial?.image_url ?? "",
      display_order: initial?.display_order ?? 0,
      is_active: initial?.is_active ?? true,
    });
  }, [initial, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: values.description?.trim() ?? "",
      parent:
        values.parent === "" || values.parent == null
          ? null
          : Number(values.parent),
      image_url: values.image_url?.trim() ?? "",
      display_order: Number(values.display_order ?? 0),
      is_active: !!values.is_active,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <label className="block text-sm font-semibold text-stone-800">
          Name
        </label>
        <input
          type="text"
          autoFocus
          {...register("name", { required: "Name is required" })}
          className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="Fresh banana leaves"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-800">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="Short description for the storefront."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-stone-800">
            Parent category
          </label>
          <select
            {...register("parent")}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">— Top level —</option>
            {parents
              .filter((p) => !initial || p.id !== initial.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-800">
            Display order
          </label>
          <input
            type="number"
            min={0}
            {...register("display_order", { valueAsNumber: true })}
            className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
          className="mt-1 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="https://…/image.jpg"
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
