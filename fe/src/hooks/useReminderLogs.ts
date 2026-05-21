"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";

export type ReminderLog = {
  id: string;
  jobId: string | null;
  userId: string | null;
  reminderType: string;
  triggerDate: string; // yyyy-mm-dd
  sentAt: string; // ISO
  readAt?: string | null;

  companyName?: string | null;
  position?: string | null;
};

type GetReminderLogsParams = {
  limit: number;
  offset: number;
};

async function getReminderLogsPage(params: GetReminderLogsParams) {
  const { limit, offset } = params;

  const res = await axiosClient.get<ReminderLog[]>(
    `/api/proxy/reminders/logs?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(
      String(offset),
    )}`,
  );

  return res.data;
}

export function useReminderLogs(
  limit: number = 20,
  options?: { offset?: number; enabled?: boolean },
) {
  const offset = options?.offset ?? 0;
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.reminders.logsWithOffset({ limit, offset }),
    queryFn: () => getReminderLogsPage({ limit, offset }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
  });
}
