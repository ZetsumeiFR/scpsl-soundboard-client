import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { SoundQueryParams } from "../types/sound";

export const soundsQueryKey = (params?: SoundQueryParams) =>
  ["sounds", params ?? {}] as const;

export function useUserSounds(params?: SoundQueryParams) {
  const query = useQuery({
    queryKey: soundsQueryKey(params),
    queryFn: () => api.getSounds(params),
  });

  return {
    sounds: query.data?.sounds ?? [],
    count: query.data?.count ?? 0,
    totalCount: query.data?.totalCount ?? 0,
    page: query.data?.page ?? 1,
    limit: query.data?.limit ?? 20,
    totalPages: query.data?.totalPages ?? 1,
    maxSounds: query.data?.maxSounds ?? 25,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
