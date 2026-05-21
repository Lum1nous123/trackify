"use client";

import React from "react";

export type NotificationModalItem = {
  id: string;
  reminderType: string;
  triggerDate: string | null; // yyyy-mm-dd
  sentAt: string | null; // ISO
  companyName?: string | null;
  position?: string | null;
};

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();

  if (!Number.isFinite(ms)) return "—";
  if (ms < 0) return "vừa mới cập nhật";

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "vừa xong";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} tuần trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  const years = Math.floor(days / 365);
  return `${years} năm trước`;
}

export type NotificationModalProps = {
  items: NotificationModalItem[];
  showMoreAvailable: boolean;
  onShowMore: () => void;
  onClose: () => void;
  isLoading: boolean;
};

export default function NotificationModal({
  items,
  showMoreAvailable,
  onShowMore,
  onClose,
  isLoading,
}: NotificationModalProps) {
  return (
    <div className='fixed inset-0 z-[1000]'>
      {/* backdrop */}
      <button
        type='button'
        aria-label='Close notifications'
        className='absolute inset-0 bg-black/50'
        onClick={onClose}
      />

      {/* modal */}
      <div
        className='absolute right-8 top-[74px] z-[1001] w-[360px] rounded-2xl border border-[#23252a] bg-[#0f1011] shadow-[0_24px_48px_rgba(0,0,0,0.35)]'
        role='dialog'
        aria-modal='true'
        aria-label='Notifications'
      >
        <div className='flex items-center justify-between gap-4 border-b border-[#23252a] px-4 py-3'>
          <div>
            <div className='text-[13px] font-extrabold tracking-tight text-[#f7f8f8]'>
              Notifications
            </div>
            <div className='mt-1 text-[12px] text-[#d0d6e0]'>
              Reminder triggers & updates
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='rounded-xl border border-[#23252a] bg-[#0f1011] px-3 py-1 text-[12px] font-semibold text-[#d0d6e0] hover:bg-[#141516]'
            aria-label='Close'
          >
            Close
          </button>
        </div>

        <div className='max-h-[420px] overflow-auto px-4 py-3'>
          {isLoading ? (
            <div className='text-[12px] text-[#8a8f98]'>Loading…</div>
          ) : items.length === 0 ? (
            <div className='text-[12px] text-[#8a8f98]'>
              No unread reminders.
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              {items.map((item) => (
                <div
                  key={item.id}
                  className='rounded-xl border border-[#23252a] bg-[#0f1011] p-3'
                >
                  <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                    {item.reminderType}
                  </div>

                  <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                    Trigger: {item.triggerDate ?? "—"}
                  </div>

                  <div className='mt-1 text-[12px] text-[#8a8f98]'>
                    Sent: {item.sentAt ? formatTimeAgo(item.sentAt) : "—"}
                  </div>

                  {(item.companyName || item.position) && (
                    <div className='mt-2 text-[12px] text-[#8a8f98]'>
                      {item.companyName ?? ""}
                      {item.companyName && item.position ? " • " : ""}
                      {item.position ?? ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center justify-between gap-4 border-t border-[#23252a] px-4 py-3'>
          <div className='text-[12px] text-[#8a8f98]'>
            Tip: open = auto mark as read
          </div>

          <button
            type='button'
            disabled={!showMoreAvailable || isLoading}
            onClick={onShowMore}
            className={[
              "rounded-xl border px-3 py-2 text-[12px] font-semibold",
              showMoreAvailable
                ? "border-[#23252a] bg-[#0f1011] text-[#d0d6e0] hover:bg-[#141516]"
                : "border-[#23252a] bg-[#0f1011] text-[#8a8f98] opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            Xem thêm
          </button>
        </div>
      </div>
    </div>
  );
}
