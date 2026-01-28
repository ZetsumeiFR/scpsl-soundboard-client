import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../api/client";

export function useDeleteSound() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.deleteSound(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    },
  });

  return {
    deleteSound: mutation.mutate,
    deleteSoundAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error instanceof ApiError ? mutation.error : null,
    reset: mutation.reset,
  };
}
