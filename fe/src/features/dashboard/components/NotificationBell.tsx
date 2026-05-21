"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import NotificationModal, {
  type NotificationModalItem,
} from "@/features/dashboard/components/NotificationModal";
import { useReminderLogs } from "@/hooks/useReminderLogs";
import {
  useMarkAllUnreadReminderLogsRead,
  useReminderUnreadCount,
} from "@/hooks/useReminderUnread";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: unreadCount = 0, isLoading: isUnreadCountLoading } =
    useReminderUnreadCount(true);

  const markAllReadMutation = useMarkAllUnreadReminderLogsRead();

  const {
    data: reminderLogsPage,
    isLoading: isReminderLogsLoading,
    refetch: refetchReminderLogs,
  } = useReminderLogs(limit, { offset, enabled: isOpen });

  const [items, setItems] = useState<NotificationModalItem[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const badgeText = useMemo(() => {
    if (isUnreadCountLoading) return "";
    if (unreadCount <= 0) return "";
    if (unreadCount > 99) return "99+";
    return String(unreadCount);
  }, [isUnreadCountLoading, unreadCount]);

  const openModal = () => {
    setOffset(0);
    setItems([]);
    setHasMore(false);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    // Ensure first page is loaded immediately on open
    refetchReminderLogs().catch(() => undefined);
  }, [isOpen, refetchReminderLogs]);

  useEffect(() => {
    if (!isOpen) return;

    const page = (reminderLogsPage ?? []).map((log) => ({
      id: log.id,
      reminderType: log.reminderType,
      triggerDate: log.triggerDate ?? null,
      sentAt: log.sentAt ?? null,
      companyName: log.companyName ?? null,
      position: log.position ?? null,
    }));

    const nextItems = offset === 0 ? page : [...items, ...page];

    setItems(nextItems);

    setHasMore(page.length === limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, offset, reminderLogsPage]);

  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasMarkedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (hasMarkedRef.current) return;
    if (offset !== 0) return;
    if (isReminderLogsLoading) return;

    // Auto mark-all-read when modal opens (but only after first page has loaded)
    // Requirement: no manual "mark read" button.
    hasMarkedRef.current = true;

    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        // Badge will be updated via query invalidation.
        // Modal items remain stable in local state.
      },
    });
  }, [isOpen, offset, isReminderLogsLoading, markAllReadMutation]);

  const onShowMore = () => {
    setOffset((o) => o + limit);
  };

  return (
    <>
      <button
        type='button'
        onClick={openModal}
        aria-label='Notifications'
        className='relative rounded-full border border-[#23252a] bg-[#141516] p-2 hover:bg-[#141516]/80'
      >
        <Bell
          className='h-[18px] w-[18px] text-[#64748b]'
          aria-hidden='true'
        />

        {badgeText ? (
          <span
            className='absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5e6ad2] px-1 text-[10px] font-extrabold text-white ring-1 ring-white/30'
            aria-label={`${unreadCount} unread notifications`}
          >
            {badgeText}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <NotificationModal
          items={items}
          showMoreAvailable={hasMore}
          onShowMore={onShowMore}
          onClose={closeModal}
          isLoading={isReminderLogsLoading && items.length === 0}
        />
      ) : null}
    </>
  );
}
