import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../api/client";

interface RenameSoundParams {
  id: string;
  name: string;
}

export function useRenameSound() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, name }: RenameSoundParams) => api.renameSound(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
    },
  });

  return {
    rename: mutation.mutate,
    renameAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error instanceof ApiError ? mutation.error : null,
    reset: mutation.reset,
  };
}
