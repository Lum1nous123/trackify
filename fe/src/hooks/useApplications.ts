"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type { JobKanbanResponse } from "@/features/kanban/types/kanban";

async function getApplications(): Promise<JobKanbanResponse> {
  const res = await axiosClient.get<JobKanbanResponse>(
    "/api/proxy/jobs/applications",
  );
  return res.data;
}

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications.jobs(),
    queryFn: getApplications,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
