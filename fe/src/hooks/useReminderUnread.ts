"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";

export type ReminderUnreadLog = {
  id: string;
  jobId: string | null;
  userId: string | null;
  reminderType: string;
  triggerDate: string; // yyyy-mm-dd
  sentAt: string; // ISO
  readAt: string | null;

  companyName?: string | null;
  position?: string | null;
};

async function getUnreadCount(): Promise<number> {
  const res = await axiosClient.get<number>(
    `/api/proxy/reminders/logs/unread/count`,
  );
  return res.data;
}

async function getUnreadLogs(params: {
  limit: number;
  offset: number;
}): Promise<ReminderUnreadLog[]> {
  const { limit, offset } = params;

  const res = await axiosClient.get<ReminderUnreadLog[]>(
    `/api/proxy/reminders/logs/unread?limit=${encodeURIComponent(
      String(limit),
    )}&offset=${encodeURIComponent(String(offset))}`,
  );

  return res.data;
}

async function markAllUnreadAsRead(): Promise<number> {
  const res = await axiosClient.post<number>(
    `/api/proxy/reminders/logs/unread/mark-read`,
  );
  return res.data;
}

export function useReminderUnreadCount(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.reminders.unreadCount(),
    queryFn: getUnreadCount,
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useReminderUnreadLogs(params: {
  limit: number;
  offset: number;
  enabled?: boolean;
}) {
  const { limit, offset, enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.reminders.unreadLogs({ limit, offset }),
    queryFn: () => getUnreadLogs({ limit, offset }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useMarkAllUnreadReminderLogsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllUnreadAsRead,
    onSuccess: () => {
      // Update badge count, but keep unread list state in modal as-is.
      queryClient.invalidateQueries({
        queryKey: queryKeys.reminders.unreadCount(),
      });
    },
  });
}
