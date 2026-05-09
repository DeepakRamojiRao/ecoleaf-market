import { api } from "@/lib/api";
import type { User } from "@/store/authStore";

import type { Paginated } from "./catalog";

type ListParams = {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export const adminApi = {
  customers: (params?: ListParams) =>
    api
      .get<Paginated<User>>("/auth/admin/customers/", { params })
      .then((r) => r.data),
};
