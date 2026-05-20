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

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [pendingInterviewMove, setPendingInterviewMove] = useState<{
    id: string;
    deadline?: string;
  } | null>(null);
  const [interviewAtValue, setInterviewAtValue] = useState("");

  const openInterviewModal = (activeId: string) => {
    const current = cards.find((c) => c.id === activeId);
    if (!current) return;

    setPendingInterviewMove({
      id: activeId,
      deadline: current.deadline,
    });
    setInterviewAtValue("");
    setInterviewModalOpen(true);
  };

  const closeInterviewModal = () => {
    setPendingInterviewMove(null);
    setInterviewAtValue("");
    setInterviewModalOpen(false);
  };

  const confirmInterviewModal = async () => {
    if (!pendingInterviewMove) return;

    const interviewAt = interviewAtValue.trim();
    if (!interviewAt) return;

    const deadline = pendingInterviewMove.deadline;
    if (deadline && interviewAt > deadline) {
      // simple UI validation: interviewAt must be <= deadline (lexicographic works for yyyy-mm-dd)
      return;
    }

    const activeId = pendingInterviewMove.id;
    const prevCards = cards;

    // optimistic local update after validation
    setCards((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, status: "INTERVIEW" } : c)),
    );

    try {
      await patchStatus.mutateAsync({
        id: activeId,
        status: "INTERVIEW",
        interviewAt,
      });
      closeInterviewModal();
    } catch {
      setCards(prevCards);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const overId = event.over?.id;
    if (!overId) return;

    const nextStatus = String(overId) as JobStatusKey;

    const activeId = String(event.active.id);
    const current = cards.find((c) => c.id === activeId);
    if (!current) return;
    if (current.status === nextStatus) return;

    if (nextStatus === "INTERVIEW") {
      openInterviewModal(activeId);
      return;
    }

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
        <h1 className='text-[18px] font-extrabold tracking-tight text-[#f7f8f8]'>
          Kanban Board
        </h1>
        <p className='text-[12px] font-medium text-[#d0d6e0]'>
          Drag cards between columns. Click a card to edit details.
        </p>
      </div>

      {isLoading ? (
        <div className='flex gap-4 overflow-x-auto pb-2'>
          {STAGES.map((stageKey) => (
            <section
              key={stageKey}
              className='min-w-[280px] max-w-[280px] rounded-2xl border border-[#23252a] bg-[#0f1011] p-3'
            >
              <div className='h-6 w-24 rounded bg-[#141516]' />
              <div className='mt-3 space-y-3'>
                <div className='h-20 rounded-xl bg-[#141516]' />
                <div className='h-20 rounded-xl bg-[#141516]' />
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

      {interviewModalOpen && pendingInterviewMove ? (
        <div className='fixed inset-0 z-70 flex items-center justify-center overflow-y-auto bg-black/40 p-4'>
          <div
            role='dialog'
            aria-modal='true'
            aria-label='Set interview date'
            className='w-full max-w-[520px] overflow-hidden rounded-2xl bg-[#0f1011] border border-[#23252a] shadow-[0_24px_48px_rgba(0,0,0,0.35)]'
          >
            <div className='relative border-b border-[#23252a] px-6 py-5'>
              <button
                type='button'
                aria-label='Close'
                onClick={closeInterviewModal}
                className='absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl text-[#d0d6e0] hover:bg-[#141516]'
              >
                ✕
              </button>

              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='text-[18px] font-extrabold tracking-tight text-[#f7f8f8]'>
                    Interview date
                  </div>
                  <div className='mt-1 text-[13px] font-semibold text-[#d0d6e0]'>
                    Enter the date you will interview. It must be ≤ deadline.
                  </div>
                </div>
              </div>
            </div>

            <div className='px-6 py-5'>
              <label className='flex flex-col gap-2'>
                <div className='text-[12px] font-extrabold text-[#8a8f98]'>
                  Interview date
                </div>

                <div className='relative'>
                  <input
                    type='date'
                    value={interviewAtValue}
                    onChange={(e) => setInterviewAtValue(e.target.value)}
                    className={[
                      "h-[42px] w-full rounded-xl border bg-white px-3 text-sm text-zinc-900 outline-none",
                      "border-zinc-200 focus:border-[#5e6ad2]/60 focus:ring-1 focus:ring-[#5e6ad2]/20",
                    ].join(" ")}
                  />
                </div>
              </label>

              {pendingInterviewMove.deadline ? (
                <div className='mt-3 text-[12px] font-semibold text-[#d0d6e0]'>
                  Job deadline:{" "}
                  <span className='font-extrabold text-[#f7f8f8]'>
                    {pendingInterviewMove.deadline}
                  </span>
                </div>
              ) : null}

              {interviewAtValue && pendingInterviewMove.deadline ? (
                interviewAtValue > pendingInterviewMove.deadline ? (
                  <div className='mt-3 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700'>
                    Interview date must be ≤ job deadline.
                  </div>
                ) : null
              ) : null}
            </div>

            <div className='border-t border-[#23252a] px-6 py-4'>
              <div className='flex items-center justify-end gap-3'>
                <button
                  type='button'
                  onClick={closeInterviewModal}
                  className='h-[38px] rounded-xl px-4 text-sm font-extrabold text-[#8a8f98] hover:bg-[#141516]'
                >
                  Cancel
                </button>

                <button
                  type='button'
                  onClick={confirmInterviewModal}
                  disabled={
                    !interviewAtValue.trim() ||
                    (!!pendingInterviewMove.deadline &&
                      interviewAtValue.trim() > pendingInterviewMove.deadline)
                  }
                  className={[
                    "h-[38px] rounded-xl px-4 text-sm font-extrabold text-white shadow-[0_12px_0_rgba(94,106,210,0.12)] hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-50",
                    "bg-[#5e6ad2]",
                  ].join(" ")}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type='button'
        onClick={openCreate}
        className='fixed right-6 bottom-6 z-10 flex h-[52px] items-center gap-2 rounded-2xl bg-[#5e6ad2] px-5 text-[16px] font-extrabold text-white shadow-[0_12px_0_rgba(94,106,210,0.12)] hover:bg-[#828fff]'
        aria-label='Add job'
        title='Add job'
      >
        <span aria-hidden='true'>＋</span>
        <span className='hidden sm:inline'>Add Job</span>
      </button>
    </div>
  );
}
