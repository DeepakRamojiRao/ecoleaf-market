import { api } from "@/lib/api";

import type { Paginated } from "./catalog";

export type Supplier = {
  id: number;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  is_active: boolean;
  notes: string;
  product_count?: number;
  created_at: string;
  updated_at: string;
};

export type SupplierWriteInput = {
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active?: boolean;
  notes?: string;
};

type ListParams = {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export const suppliersApi = {
  list: (params?: ListParams) =>
    api
      .get<Paginated<Supplier>>("/suppliers/", { params })
      .then((r) => r.data),
  retrieve: (id: number) =>
    api.get<Supplier>(`/suppliers/${id}/`).then((r) => r.data),
  create: (input: SupplierWriteInput) =>
    api.post<Supplier>("/suppliers/", input).then((r) => r.data),
  update: (id: number, input: Partial<SupplierWriteInput>) =>
    api.patch<Supplier>(`/suppliers/${id}/`, input).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/suppliers/${id}/`).then(() => undefined),
};
