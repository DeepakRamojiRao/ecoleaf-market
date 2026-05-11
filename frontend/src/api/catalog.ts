/**
 * Typed wrappers around /api/v1/catalog/*
 *   - categories : full CRUD
 *   - products   : full CRUD (with optional file upload for product image)
 *
 * Image upload: pass `image: File` on ProductWriteInput to send the request
 * as multipart/form-data instead of JSON. The backend stores the file under
 * MEDIA_ROOT/products/ and returns the resolved absolute URL via
 * `image_display_url` (which falls back to the legacy `image_url`).
 */
import { api } from "@/lib/api";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  parent_name?: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  children_count?: number;
  product_count?: number;
  created_at: string;
  updated_at: string;
};

export type CategoryWriteInput = {
  name: string;
  description?: string;
  parent?: number | null;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  category: number;
  category_name?: string;
  supplier: number | null;
  supplier_name?: string | null;
  description: string;
  price: string;
  cost: string;
  stock_quantity: number;
  low_stock_threshold: number;
  /** Uploaded file's storage path (e.g. "products/2026/05/foo.jpg") or null. */
  image: string | null;
  /** Legacy URL field — kept for backward-compat seed data. */
  image_url: string;
  /** Read-only — absolute URL the frontend should use to display the image. */
  image_display_url: string;
  is_active: boolean;
  is_low_stock?: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWriteInput = {
  sku: string;
  name: string;
  category: number;
  supplier?: number | null;
  description?: string;
  price: string;
  cost?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  /** New uploaded file. If set, the request is sent as multipart/form-data. */
  image?: File | null;
  /** Legacy URL — only used if no file is uploaded. */
  image_url?: string;
  is_active?: boolean;
};

type ListParams = {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

/** Serialize an input object to FormData, coercing primitives the way DRF expects. */
function toFormData(input: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (value instanceof File) {
      fd.append(key, value);
      continue;
    }
    if (value === null) {
      // DRF treats empty string as null for nullable FKs / blankable fields.
      fd.append(key, "");
      continue;
    }
    if (typeof value === "boolean") {
      fd.append(key, value ? "true" : "false");
      continue;
    }
    fd.append(key, String(value));
  }
  return fd;
}

function containsFile(input: object): boolean {
  return Object.values(input).some((v) => v instanceof File);
}

export const categoriesApi = {
  list: (params?: ListParams & { parent?: string | number }) =>
    api
      .get<Paginated<Category>>("/catalog/categories/", { params })
      .then((r) => r.data),
  retrieve: (id: number) =>
    api.get<Category>(`/catalog/categories/${id}/`).then((r) => r.data),
  create: (input: CategoryWriteInput) =>
    api.post<Category>("/catalog/categories/", input).then((r) => r.data),
  update: (id: number, input: Partial<CategoryWriteInput>) =>
    api
      .patch<Category>(`/catalog/categories/${id}/`, input)
      .then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/catalog/categories/${id}/`).then(() => undefined),
};

export const productsApi = {
  list: (
    params?: ListParams & {
      category?: number;
      supplier?: number;
      low_stock?: boolean;
    },
  ) => {
    const p: Record<string, unknown> = { ...params };
    if (params?.low_stock) p.low_stock = "1";
    return api
      .get<Paginated<Product>>("/catalog/products/", { params: p })
      .then((r) => r.data);
  },
  retrieve: (id: number) =>
    api.get<Product>(`/catalog/products/${id}/`).then((r) => r.data),
  create: (input: ProductWriteInput) => {
    const body = containsFile(input)
      ? toFormData(input as Record<string, unknown>)
      : input;
    return api
      .post<Product>("/catalog/products/", body)
      .then((r) => r.data);
  },
  update: (id: number, input: Partial<ProductWriteInput>) => {
    const body = containsFile(input)
      ? toFormData(input as Record<string, unknown>)
      : input;
    return api
      .patch<Product>(`/catalog/products/${id}/`, body)
      .then((r) => r.data);
  },
  remove: (id: number) =>
    api.delete(`/catalog/products/${id}/`).then(() => undefined),
};
