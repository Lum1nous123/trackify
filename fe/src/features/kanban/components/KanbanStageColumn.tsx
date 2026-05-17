"use client";

import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";

import type { JobKanbanCard, JobStatusKey } from "../types/kanban";
import { STAGE_TINT_BY_KEY } from "../utils/kanbanTints";
import { TINTS } from "@/features/dashboard/utils/tints";
import { getDeadlineTone } from "../utils/deadline";

import { JobKanbanDraggableCard } from "./JobKanbanDraggableCard";

const STAGE_META: Record<JobStatusKey, { label: string }> = {
  SAVED: { label: "SAVED" },
  APPLIED: { label: "APPLIED" },
  INTERVIEW: { label: "INTERVIEW" },
  OFFER: { label: "OFFER" },
  REJECT: { label: "REJECT" },
};

export function KanbanStageColumn({
  stageKey,
  cards,
  onSelectCard,
}: {
  stageKey: JobStatusKey;
  cards: JobKanbanCard[];
  onSelectCard: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey });

  const tint = STAGE_TINT_BY_KEY[stageKey];

  const tintBorder = useMemo(() => TINTS[tint].border, [tint]);
  const tintSoft = useMemo(() => TINTS[tint].bgSoft, [tint]);
  const tintText = useMemo(() => TINTS[tint].text, [tint]);

  const count = cards.length;
  const stageLabel = STAGE_META[stageKey].label;

  const hasSoonDeadline = useMemo(() => {
    return cards.some((c) => getDeadlineTone(c.deadline) !== "OK");
  }, [cards]);

  return (
    <section
      ref={setNodeRef}
      className={[
        "min-w-[280px] max-w-[280px] rounded-2xl border bg-white",
        "border-black/10",
        isOver ? `shadow-[0_0_0_2px_rgba(99,102,241,0.25)]` : "",
      ].join(" ")}
    >
      <header
        className={[
          "flex items-center justify-between gap-3 rounded-t-2xl px-4 py-4 border-b border-black/10",
        ].join(" ")}
      >
        <div className='min-w-0'>
          <div className='text-[12px] font-extrabold tracking-widest text-zinc-900'>
            {stageLabel}
          </div>
        </div>

        <div
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-[12px] font-extrabold",
            tintBorder,
            tintSoft,
            "text-zinc-900",
          ].join(" ")}
          aria-label={`${stageLabel} count ${count}`}
        >
          {count}
        </div>
      </header>

      <div className='p-3'>
        {cards.length === 0 ? (
          <div className='rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-6 text-center text-[12px] font-semibold text-zinc-400'>
            No jobs
          </div>
        ) : null}

        {hasSoonDeadline ? (
          <div className='mb-3 inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1 text-[11px] font-extrabold text-zinc-500 ring-1 ring-zinc-200'>
            ⚠ Some deadlines are coming up
          </div>
        ) : null}

        <div className='flex flex-col gap-3'>
          {cards.map((card) => (
            <JobKanbanDraggableCard
              key={card.id}
              card={card}
              tintTextClass={tintText}
              onSelect={() => onSelectCard(card.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
