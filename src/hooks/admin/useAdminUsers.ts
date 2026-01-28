import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { AdminUsersQueryParams } from "../../types/admin";

export function useAdminUsers(params: AdminUsersQueryParams = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => api.admin.getUsers(params),
  });
}
