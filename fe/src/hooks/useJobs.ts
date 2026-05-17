"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type { ApiResponse } from "@/types/api.type";
import type {
  CreateJobRequestBody,
  CreateJobResponse,
  UpdateJobRequestBody,
  UpdateJobResponse,
} from "@/types/job.type";

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateJobRequestBody) =>
      axiosClient
        .post<ApiResponse<CreateJobResponse>>("/api/proxy/jobs/add", body)
        .then((res) => res.data),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.kanban.jobs() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.jobs(),
        }),
      ]);
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; body: UpdateJobRequestBody }) =>
      axiosClient
        .put<
          ApiResponse<UpdateJobResponse>
        >(`/api/proxy/jobs/${params.id}`, params.body)
        .then((res) => res.data),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.kanban.jobs() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.jobs(),
        }),
      ]);
    },
  });
}
