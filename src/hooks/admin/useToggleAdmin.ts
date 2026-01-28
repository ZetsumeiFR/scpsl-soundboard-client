import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";

export function useToggleAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      api.admin.updateUser(userId, { isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
