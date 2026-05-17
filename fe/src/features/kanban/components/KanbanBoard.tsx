"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";

import type { JobKanbanCard, JobStatusKey } from "../types/kanban";
import { KanbanStageColumn } from "./KanbanStageColumn";
import { JobCreateEditModal } from "./JobCreateEditModal";
import { useKanbanJobs, usePatchJobStatus } from "../hooks/useKanbanJobs";

const STAGES: JobStatusKey[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECT",
];

export function KanbanBoard() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useKanbanJobs();
  const patchStatus = usePatchJobStatus();

  const [cards, setCards] = useState<JobKanbanCard[]>([]);

  // keep local optimistic state in sync with server
  useEffect(() => {
    if (data?.cards) setCards(data.cards);
  }, [data?.cards]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeCard, setActiveCard] = useState<JobKanbanCard | null>(null);

  const grouped = useMemo(() => {
    const byStage: Record<JobStatusKey, JobKanbanCard[]> = {
      SAVED: [],
      APPLIED: [],
      INTERVIEW: [],
      OFFER: [],
      REJECT: [],
    };

    for (const c of cards) {
      byStage[c.status].push(c);
    }
    return byStage;
  }, [cards]);

  const openCreate = () => {
    setActiveCard(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (card: JobKanbanCard) => {
    setActiveCard(card);
    setModalMode("edit");
    setModalOpen(true);
  };

  const onSaved = () => {
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["kanban", "jobs"] });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const overId = event.over?.id;
    if (!overId) return;

    const nextStatus = String(overId) as JobStatusKey;

    const activeId = String(event.active.id);
    const current = cards.find((c) => c.id === activeId);
    if (!current) return;
    if (current.status === nextStatus) return;

    const prevCards = cards;
    setCards((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, status: nextStatus } : c)),
    );

    try {
      await patchStatus.mutateAsync({
        id: activeId,
        status: nextStatus,
      });
    } catch {
      // revert
      setCards(prevCards);
    }
  };

  return (
    <div className='flex flex-col gap-6 pb-10'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-[18px] font-extrabold tracking-tight text-zinc-900'>
          Kanban Board
        </h1>
        <p className='text-[12px] font-medium text-zinc-500'>
          Drag cards between columns. Click a card to edit details.
        </p>
      </div>

      {isLoading ? (
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {STAGES.map((stageKey) => (
            <section
              key={stageKey}
              className='min-w-[280px] max-w-[280px] rounded-2xl border border-black/10 bg-white p-3'
            >
              <div className='h-6 w-24 rounded bg-zinc-100' />
              <div className='mt-3 space-y-3'>
                <div className='h-20 rounded-xl bg-zinc-50' />
                <div className='h-20 rounded-xl bg-zinc-50' />
              </div>
            </section>
          ))}
        </div>
      ) : isError ? (
        <div className='rounded-xl border border-red-500/20 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700'>
          Failed to load kanban.
        </div>
      ) : (
        <div className='overflow-x-auto pb-2'>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className='flex min-w-max gap-4'>
              {STAGES.map((stageKey) => (
                <KanbanStageColumn
                  key={stageKey}
                  stageKey={stageKey}
                  cards={grouped[stageKey]}
                  onSelectCard={(id) => {
                    const card = cards.find((c) => c.id === id);
                    if (!card) return;
                    openEdit(card);
                  }}
                />
              ))}
            </div>
          </DndContext>
        </div>
      )}

      <JobCreateEditModal
        open={modalOpen}
        mode={modalMode}
        card={activeCard}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <button
        type='button'
        onClick={openCreate}
        className='fixed right-6 bottom-6 z-10 flex h-[52px] items-center gap-2 rounded-2xl bg-[#6366F1] px-5 text-[16px] font-extrabold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4F46E5]'
        aria-label='Add job'
        title='Add job'
      >
        <span aria-hidden='true'>＋</span>
        <span className='hidden sm:inline'>Add Job</span>
      </button>
    </div>
  );
}
