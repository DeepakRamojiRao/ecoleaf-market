/**
 * Typed wrappers around /api/v1/catalog/*
 *   - categories : full CRUD
 *   - products   : full CRUD
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
  image_url: string;
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
  image_url?: string;
  is_active?: boolean;
};

type ListParams = {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

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
  create: (input: ProductWriteInput) =>
    api.post<Product>("/catalog/products/", input).then((r) => r.data),
  update: (id: number, input: Partial<ProductWriteInput>) =>
    api
      .patch<Product>(`/catalog/products/${id}/`, input)
      .then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/catalog/products/${id}/`).then(() => undefined),
};
