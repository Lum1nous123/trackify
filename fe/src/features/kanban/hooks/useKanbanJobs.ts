"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type {
  JobKanbanCard,
  JobKanbanResponse,
  JobStatusKey,
} from "../types/kanban";

async function getKanban(): Promise<JobKanbanResponse> {
  const res = await axiosClient.get<JobKanbanResponse>(
    "/api/proxy/jobs/kanban",
  );
  return res.data;
}

async function patchJobStatus(params: {
  id: string;
  status: JobStatusKey;
  interviewAt?: string; // yyyy-mm-dd
}): Promise<unknown> {
  const body: { status: JobStatusKey; interviewAt?: string } = {
    status: params.status,
  };

  if (params.status === "INTERVIEW") {
    body.interviewAt = params.interviewAt;
  }

  const res = await axiosClient.patch(
    `/api/proxy/jobs/${params.id}/status`,
    body,
  );
  return res.data;
}

export function useKanbanJobs() {
  return useQuery({
    queryKey: queryKeys.kanban.jobs(),
    queryFn: getKanban,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function usePatchJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchJobStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.kanban.jobs(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications.jobs(),
        }),
      ]);
    },
  });
}

export function groupKanbanCards(
  cards: JobKanbanCard[],
): Record<JobStatusKey, JobKanbanCard[]> {
  return {
    SAVED: cards.filter((c) => c.status === "SAVED"),
    APPLIED: cards.filter((c) => c.status === "APPLIED"),
    INTERVIEW: cards.filter((c) => c.status === "INTERVIEW"),
    OFFER: cards.filter((c) => c.status === "OFFER"),
    REJECT: cards.filter((c) => c.status === "REJECT"),
  };
}
