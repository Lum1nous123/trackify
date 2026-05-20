"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type { JobStatusKey } from "@/features/kanban/types/kanban";
import { toast } from "sonner";

export type ReminderSetting = {
  id: string;
  jobStatus: JobStatusKey | string;
  reminderType: string;

  enabled: boolean;
  startOffsetDays: number;
  endOffsetDays: number;
  frequencyDays: number;

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type UpsertReminderSettingsItemRequest = {
  jobStatus: JobStatusKey | string;
  reminderType: string;
  enabled: boolean;
  startOffsetDays: number;
  endOffsetDays: number;
  frequencyDays: number;
};

async function getReminderSettings(): Promise<ReminderSetting[]> {
  const res = await axiosClient.get<ReminderSetting[]>(
    "/api/proxy/reminders/settings",
  );
  return res.data;
}

async function upsertReminderSettings(
  items: UpsertReminderSettingsItemRequest[],
): Promise<void> {
  await axiosClient.put("/api/proxy/reminders/settings", items);
}

export function useReminderSettings() {
  return useQuery({
    queryKey: queryKeys.reminders.settings(),
    queryFn: getReminderSettings,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpsertReminderSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertReminderSettings,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.reminders.settings(),
        }),
      ]);
      toast.success("Reminder settings updated");
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update reminder settings",
      );
    },
  });
}
