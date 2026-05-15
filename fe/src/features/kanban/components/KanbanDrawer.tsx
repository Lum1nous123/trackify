"use client";

import React, { useCallback, useEffect, useMemo } from "react";

import { TINTS, type Tint } from "@/features/dashboard/utils/tints";
import type { KanbanCard, KanbanStageKey } from "../mock/mockKanbanData";
import { STAGE_TINT_BY_KEY } from "../utils/kanbanTints";

function clampPercent(n: number) {
  return Math.max(0, Math.min(100, n));
}

function ProgressRing({ percent, tint }: { percent: number; tint: Tint }) {
  const p = clampPercent(percent);
  const r = 86;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div className='relative flex h-[220px] w-[220px] items-center justify-center'>
      <svg
        width='220'
        height='220'
        viewBox='0 0 220 220'
        aria-hidden='true'
      >
        <circle
          cx='110'
          cy='110'
          r={r}
          stroke='#E5E7EB'
          strokeWidth='16'
          fill='none'
        />
        <circle
          cx='110'
          cy='110'
          r={r}
          stroke='currentColor'
          strokeWidth='16'
          fill='none'
          strokeLinecap='round'
          strokeDasharray={`${dash} ${c - dash}`}
          transform='rotate(-90 110 110)'
        />
      </svg>

      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <div className='text-[44px] font-black leading-none text-zinc-900'>
          {p}%
        </div>
        <div className='mt-2 text-[12px] font-bold tracking-widest text-zinc-500'>
          MATCH
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className='text-[18px] font-extrabold tracking-tight text-zinc-900'>
      {children}
    </div>
  );
}

function Pill({ children, tint }: { children: React.ReactNode; tint: Tint }) {
  return (
    <div
      className={[
        "inline-flex items-center rounded-full border px-4 py-2 text-[14px] font-extrabold",
        TINTS[tint].border,
        TINTS[tint].bgSoft,
        TINTS[tint].text,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function MissingSkillItem({ skill, tint }: { skill: string; tint: Tint }) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full border px-4 py-2",
        TINTS[tint].bgSoft,
        TINTS[tint].border,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-6 w-6 items-center justify-center rounded-full text-[14px] font-extrabold",
          TINTS[tint].text,
        ].join(" ")}
        aria-hidden='true'
      >
        !
      </span>
      <span className='text-[16px] font-extrabold text-zinc-900'>{skill}</span>
    </div>
  );
}

function DrawerBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <button
      type='button'
      aria-label='Close drawer'
      onClick={onClose}
      className='fixed inset-0 z-40 bg-black/30'
    />
  );
}

export function KanbanDrawer({
  card,
  onClose,
}: {
  card: KanbanCard | null;
  onClose: () => void;
}) {
  const tint = useMemo((): Tint => {
    if (!card) return "indigo";
    return STAGE_TINT_BY_KEY[card.stage];
  }, [card]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!card) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, handleKeyDown]);

  if (!card) return null;

  return (
    <div className='fixed inset-0 z-50'>
      <DrawerBackdrop onClose={onClose} />

      <aside className='absolute right-0 top-0 flex h-full w-[480px] flex-col bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.12)]'>
        <div className='flex items-center justify-between gap-3 border-b border-zinc-200 px-6 py-4'>
          <div className='flex items-start gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-500/20'>
              <span className='text-[18px] font-extrabold text-[#4f46e5]'>
                {card.initials}
              </span>
            </div>
            <div className='min-w-0'>
              <div className='truncate text-[14px] font-extrabold tracking-tight text-zinc-900'>
                {card.company}
              </div>
              <div className='truncate text-[12px] font-medium text-zinc-500'>
                {card.title}
              </div>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='h-10 w-10 rounded-xl text-zinc-700 hover:bg-black/5'
            aria-label='Close'
          >
            ✕
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-6 py-6'>
          <div className='flex flex-col items-center gap-5'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-[12px] font-extrabold tracking-widest text-white'>
                {card.stage}
              </div>
            </div>

            <div
              className='text-center'
              style={{ color: TINTS[tint].text }}
            >
              <ProgressRing
                percent={card.scorePercent}
                tint={tint}
              />
            </div>

            <div className='text-center'>
              <SectionTitle> {card.matchLabel} </SectionTitle>
              <div className='mt-2 text-[16px] font-medium text-zinc-600'>
                {card.matchSubLabel}
              </div>
            </div>
          </div>

          <div className='mt-8'>
            <div className='text-[18px] font-extrabold tracking-tight text-zinc-900'>
              MISSING SKILLS
            </div>

            <div className='mt-4 flex flex-wrap gap-3'>
              {card.missingSkills.map((s) => (
                <MissingSkillItem
                  key={s}
                  skill={s}
                  tint={tint}
                />
              ))}
            </div>
          </div>

          <div className='mt-8'>
            <div className='text-[18px] font-extrabold tracking-tight text-zinc-900'>
              SUGGESTED KEYWORDS
            </div>

            <div className='mt-4 flex flex-col gap-3'>
              {card.suggestedKeywords.map((k) => (
                <Pill
                  key={k}
                  tint={tint}
                >
                  {k}
                </Pill>
              ))}
            </div>
          </div>

          <div className='mt-10'>
            <div className='text-[22px] font-extrabold tracking-tight text-zinc-900'>
              ACTIVITY TIMELINE
            </div>

            <div className='mt-6 flex flex-col gap-6'>
              {card.activity.map((a, idx) => (
                <div
                  key={a.id}
                  className='flex items-start gap-4'
                >
                  <div className='relative flex h-10 w-10 items-center justify-center'>
                    <span
                      className={[
                        "absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full",
                        TINTS[tint].bgSoft,
                        TINTS[tint].border,
                      ].join(" ")}
                      aria-hidden='true'
                    />
                    <span
                      className={[
                        "relative z-10 text-[18px] font-black",
                        TINTS[tint].text,
                      ].join(" ")}
                      aria-hidden='true'
                    >
                      ●
                    </span>
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='text-[16px] font-extrabold text-zinc-900'>
                      {idx === 0 ? "Latest" : "Update"}
                    </div>
                    <div className='mt-1 text-[14px] font-medium text-zinc-600'>
                      {a.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-8 flex flex-col gap-4 pb-8'>
            <button
              type='button'
              className='h-[56px] rounded-2xl bg-[#4f46e5] px-5 text-[18px] font-extrabold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4338ca]'
              onClick={() => {
                // UI placeholder
                // eslint-disable-next-line no-alert
                alert("Re-analyze action not implemented yet.");
              }}
            >
              ↻ Re-analyze CV
            </button>

            <button
              type='button'
              className='h-[56px] rounded-2xl border-2 border-zinc-700/20 bg-white px-5 text-[18px] font-extrabold text-zinc-900 hover:bg-zinc-50'
              onClick={() => {
                // UI placeholder
                // eslint-disable-next-line no-alert
                alert("Mark as Offer action not implemented yet.");
              }}
            >
              🏷️ Mark as Offer
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
