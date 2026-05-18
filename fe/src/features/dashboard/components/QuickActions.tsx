"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { JobKanbanCard } from "@/features/kanban/types/kanban";
import { JobCreateEditModal } from "@/features/kanban/components/JobCreateEditModal";
import {
  useKanbanJobs,
  usePatchJobStatus,
} from "@/features/kanban/hooks/useKanbanJobs";

type Mode = "create" | "edit";

function toTimestamp(card: JobKanbanCard): number {
  const updated = card.updatedAt ? new Date(card.updatedAt).getTime() : null;
  const created = card.createdAt ? new Date(card.createdAt).getTime() : null;

  // fallback to last activity
  let lastActivity: number | null = null;
  if (Array.isArray(card.activity) && card.activity.length > 0) {
    const last = card.activity.reduce((acc, a) => {
      const t = new Date(a.changedAt).getTime();
      if (Number.isNaN(t)) return acc;
      return t > acc ? t : acc;
    }, 0);
    lastActivity = last > 0 ? last : null;
  }

  return updated ?? created ?? lastActivity ?? 0;
}

function getLatestByStatus(
  cards: JobKanbanCard[],
  status: JobKanbanCard["status"],
): JobKanbanCard | null {
  const filtered = cards.filter((c) => c.status === status);
  if (filtered.length === 0) return null;

  let best = filtered[0]!;
  let bestT = toTimestamp(best);

  for (const c of filtered) {
    const t = toTimestamp(c);
    if (t > bestT) {
      best = c;
      bestT = t;
    }
  }

  return best;
}

function countByStatus(cards: JobKanbanCard[]) {
  const base = {
    SAVED: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECT: 0,
  } as const;

  const out = { ...base };
  for (const c of cards) {
    out[c.status] += 1;
  }
  return out;
}

export function QuickActions() {
  const router = useRouter();
  const patchStatus = usePatchJobStatus();
  const { data } = useKanbanJobs();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [activeCard, setActiveCard] = useState<JobKanbanCard | null>(null);

  const safeCards = Array.isArray(data?.cards) ? data.cards : [];

  const counts = useMemo(() => countByStatus(safeCards), [safeCards]);

  const latestApplied = useMemo(
    () => getLatestByStatus(safeCards, "APPLIED"),
    [safeCards],
  );
  const latestInterview = useMemo(
    () => getLatestByStatus(safeCards, "INTERVIEW"),
    [safeCards],
  );
  const latestAny = useMemo(() => {
    if (safeCards.length === 0) return null;
    return safeCards.reduce((acc, c) =>
      toTimestamp(c) > toTimestamp(acc) ? c : acc,
    );
  }, [safeCards]);

  const openCreate = () => {
    setActiveCard(null);
    setMode("create");
    setOpen(true);
  };

  const openEditLatest = () => {
    if (!latestAny) {
      toast.error("No jobs to edit yet.");
      return;
    }
    setActiveCard(latestAny);
    setMode("edit");
    setOpen(true);
  };

  const moveLatestAppliedToInterview = async () => {
    if (!latestApplied) {
      toast.error("No APPLIED job found.");
      return;
    }

    try {
      await patchStatus.mutateAsync({
        id: latestApplied.id,
        status: "INTERVIEW",
      });
      toast.success("Moved to Interview.");
    } catch {
      toast.error("Failed to move status.");
    }
  };

  const moveLatestInterviewToOffer = async () => {
    if (!latestInterview) {
      toast.error("No INTERVIEW job found.");
      return;
    }

    try {
      await patchStatus.mutateAsync({
        id: latestInterview.id,
        status: "OFFER",
      });
      toast.success("Moved to Offer.");
    } catch {
      toast.error("Failed to move status.");
    }
  };

  return (
    <div>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-[16px] font-extrabold tracking-tight text-zinc-900'>
            Quick Actions
          </h2>
          <p className='mt-1 text-[12px] font-medium text-zinc-500'>
            Create a job, or move status fast.
          </p>
        </div>

        <div className='text-[12px] font-semibold text-zinc-500'>
          {safeCards.length} jobs
        </div>
      </div>

      <div className='mt-5 space-y-3'>
        <div className='grid grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={openCreate}
            className='h-[40px] rounded-xl bg-[#6366F1] px-3 text-[13px] font-extrabold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-50'
            aria-label='Add job'
          >
            ＋ Add
          </button>

          <button
            type='button'
            onClick={openEditLatest}
            disabled={!latestAny}
            className='h-[40px] rounded-xl border border-black/10 bg-white px-3 text-[13px] font-extrabold text-zinc-700 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50'
            aria-label='Edit latest job'
          >
            Update
          </button>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={moveLatestAppliedToInterview}
            disabled={!latestApplied}
            className='h-[40px] rounded-xl border border-black/10 bg-white px-3 text-[13px] font-extrabold text-zinc-700 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50'
            aria-label='Move latest applied job to interview'
            title={
              latestApplied
                ? "Move latest APPLIED → INTERVIEW"
                : "No APPLIED jobs"
            }
          >
            Move Applied ({counts.APPLIED})
          </button>

          <button
            type='button'
            onClick={moveLatestInterviewToOffer}
            disabled={!latestInterview}
            className='h-[40px] rounded-xl border border-black/10 bg-white px-3 text-[13px] font-extrabold text-zinc-700 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50'
            aria-label='Move latest interview job to offer'
            title={
              latestInterview
                ? "Move latest INTERVIEW → OFFER"
                : "No INTERVIEW jobs"
            }
          >
            Move Interview ({counts.INTERVIEW})
          </button>
        </div>

        <div className='rounded-xl border border-black/10 bg-[#F8FAFC] px-4 py-3'>
          <div className='text-[12px] font-semibold text-zinc-700'>Tip</div>
          <div className='mt-1 text-[12px] font-medium text-zinc-500'>
            Use Kanban board for drag & drop details.
          </div>
        </div>
      </div>

      <JobCreateEditModal
        open={open}
        mode={mode}
        card={activeCard}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          // React Query invalidation will update cards/lists.
          // Avoid router.refresh() for faster UI updates.
        }}
      />
    </div>
  );
}
