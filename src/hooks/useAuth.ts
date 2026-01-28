import { useQuery } from "@tanstack/react-query";
import { api, type User } from "../api/client";

export function useAuth() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: api.getMe,
  });

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data?.user,
    error: query.error,
    refetch: query.refetch,
  };
}

export type { User };
