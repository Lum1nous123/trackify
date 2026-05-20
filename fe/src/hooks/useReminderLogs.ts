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
  companyName?: string | null;
  position?: string | null;
};

async function getReminderLogs(limit: number): Promise<ReminderLog[]> {
  const res = await axiosClient.get<ReminderLog[]>(
    `/api/proxy/reminders/logs?limit=${encodeURIComponent(String(limit))}`,
  );
  return res.data;
}

export function useReminderLogs(limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.reminders.logs({ limit }),
    queryFn: () => getReminderLogs(limit),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
