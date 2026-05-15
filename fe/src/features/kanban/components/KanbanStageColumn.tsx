"use client";

import React, { useMemo } from "react";

import { TINTS, type Tint } from "@/features/dashboard/utils/tints";
import type { KanbanCard, KanbanStage } from "../mock/mockKanbanData";

function tintToBorder(tint: Tint) {
  return TINTS[tint]?.border ?? "border-black/10";
}

function tintToSoft(tint: Tint) {
  return TINTS[tint]?.bgSoft ?? "bg-zinc-50";
}

function tintToText(tint: Tint) {
  return TINTS[tint]?.text ?? "text-zinc-700";
}

export function KanbanStageColumn({
  stage,
  cards,
  onSelectCard,
}: {
  stage: KanbanStage;
  cards: KanbanCard[];
  onSelectCard: (id: string) => void;
}) {
  const tintBorder = useMemo(() => tintToBorder(stage.tint), [stage.tint]);
  const tintSoft = useMemo(() => tintToSoft(stage.tint), [stage.tint]);
  const tintText = useMemo(() => tintToText(stage.tint), [stage.tint]);

  return (
    <section className='min-w-[280px] max-w-[280px] rounded-2xl border border-black/10 bg-white'>
      <header
        className={[
          "flex items-center justify-between gap-3 rounded-t-2xl px-4 py-4 border-b border-black/10",
        ].join(" ")}
      >
        <div className='min-w-0'>
          <div className='text-[12px] font-extrabold tracking-widest text-zinc-900'>
            {stage.label}
          </div>
        </div>

        <div
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-[12px] font-extrabold",
            tintBorder,
            tintSoft,
            "text-zinc-900",
          ].join(" ")}
          aria-label={`${stage.label} count ${stage.count}`}
        >
          {stage.count}
        </div>
      </header>

      <div className='p-3'>
        {cards.length === 0 ? (
          <div className='rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-6 text-center text-[12px] font-semibold text-zinc-400'>
            No cards
          </div>
        ) : null}

        <div className='flex flex-col gap-3'>
          {cards.map((card) => (
            <button
              key={card.id}
              type='button'
              onClick={() => onSelectCard(card.id)}
              className={[
                "group text-left w-full rounded-2xl border bg-white px-3 py-3",
                "hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
                tintBorder,
              ].join(" ")}
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-2xl ring-1 bg-white",
                        tintSoft,
                        tintText,
                      ].join(" ")}
                      aria-hidden='true'
                    >
                      <span className='text-[13px] font-extrabold'>
                        {card.initials}
                      </span>
                    </span>

                    <div className='min-w-0'>
                      <div className='truncate text-[13px] font-extrabold text-zinc-900'>
                        {card.company}
                      </div>
                      <div className='truncate text-[12px] font-semibold text-zinc-500'>
                        {card.title}
                      </div>
                    </div>
                  </div>

                  <div className='mt-2 text-[12px] font-semibold text-zinc-500'>
                    Updated: {card.updatedAtText}
                  </div>
                </div>

                <div className='shrink-0'>
                  <div className='rounded-full border border-black/10 bg-zinc-50 px-2.5 py-1 text-[12px] font-extrabold text-zinc-900'>
                    {card.scorePercent}%
                  </div>
                </div>
              </div>

              <div className='mt-3 flex flex-wrap gap-2'>
                <span className='rounded-full bg-indigo-600/5 px-2 py-1 text-[11px] font-extrabold text-indigo-700 ring-1 ring-indigo-500/20'>
                  {card.matchLabel}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
