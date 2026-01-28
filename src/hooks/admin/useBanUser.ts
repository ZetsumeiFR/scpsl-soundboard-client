import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      api.admin.updateUser(userId, { isBanned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
