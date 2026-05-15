"use client";

import React, { useMemo, useState } from "react";

import {
  mockKanban,
  type KanbanCard,
  type KanbanStageKey,
} from "../mock/mockKanbanData";
import { KanbanStageColumn } from "./KanbanStageColumn";
import { KanbanDrawer } from "./KanbanDrawer";
import { AddJobModal } from "./AddJobModal";
import type { KanbanStage } from "../mock/mockKanbanData";

export function KanbanBoard() {
  const stages = useMemo(() => mockKanban.stages, []);
  const cards = useMemo(() => mockKanban.cards, []);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  const activeCard = useMemo(() => {
    if (!activeCardId) return null;
    return cards.find((c) => c.id === activeCardId) ?? null;
  }, [activeCardId, cards]);

  const grouped = useMemo(() => {
    const byStage: Record<KanbanStageKey, KanbanCard[]> = {
      SAVED: [],
      APPLIED: [],
      INTERVIEW: [],
      OFFER: [],
    };

    for (const card of cards) {
      byStage[card.stage].push(card);
    }

    return byStage;
  }, [cards]);

  const onCloseDrawer = () => setActiveCardId(null);

  return (
    <div className='flex flex-col gap-6 pb-10'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-[18px] font-extrabold tracking-tight text-zinc-900'>
          Kanban Board
        </h1>
        <p className='text-[12px] font-medium text-zinc-500'>
          Click a card to view details. Layout is responsive for mobile &
          desktop.
        </p>
      </div>

      <div className='overflow-x-auto pb-2'>
        <div className='flex min-w-max gap-4'>
          {stages.map((stage: KanbanStage) => (
            <KanbanStageColumn
              key={stage.key}
              stage={stage}
              cards={grouped[stage.key]}
              onSelectCard={(id: string) => setActiveCardId(id)}
            />
          ))}
        </div>
      </div>

      <KanbanDrawer
        card={activeCard}
        onClose={onCloseDrawer}
      />

      {/* Floating action button */}
      <button
        type='button'
        onClick={() => setIsAddJobOpen(true)}
        className='fixed right-6 bottom-6 z-10 flex h-[52px] items-center gap-2 rounded-2xl bg-[#6366F1] px-5 text-[16px] font-extrabold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4F46E5]'
        aria-label='Add job'
        title='Add job'
      >
        <span aria-hidden='true'>＋</span>
        <span className='hidden sm:inline'>Add Job</span>
      </button>

      <AddJobModal
        open={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onSaved={() => {
          // backend call not implemented yet
        }}
      />
    </div>
  );
}
