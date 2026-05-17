"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type { ApiResponse } from "@/types/api.type";
import type { MeResponse } from "@/types/auth.type";

export function useMe() {
  return useQuery<MeResponse>({
    queryKey: queryKeys.auth.me(),
    queryFn: () =>
      axiosClient.get<MeResponse>("/api/proxy/auth/me").then((r) => r.data),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      axiosClient
        .patch<ApiResponse<MeResponse>>("/api/proxy/users/me", formData)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
