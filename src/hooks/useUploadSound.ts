import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../api/client";

export function useUploadSound() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) =>
      api.uploadSound(file, name, setProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      setProgress(0);
    },
    onError: (error: Error) => {
      setProgress(0);
      if (error instanceof ApiError && error.code === "RATE_LIMIT_EXCEEDED" && error.retryAfter) {
        setCooldownEnd(Date.now() + error.retryAfter * 1000);
      }
    },
  });

  return {
    upload: mutation.mutate,
    uploadAsync: mutation.mutateAsync,
    progress,
    cooldownEnd,
    clearCooldown: () => setCooldownEnd(null),
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error instanceof ApiError ? mutation.error : null,
    reset: () => {
      mutation.reset();
      setProgress(0);
    },
  };
}
