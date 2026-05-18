"use client";

import React from "react";
import type { JobKanbanCard } from "@/features/kanban/types/kanban";
import { TINTS, type Tint } from "../utils/tints";

type StatusKey = JobKanbanCard["status"];

function toLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysUntil(deadlineIsoDate?: string | null): number | null {
  if (!deadlineIsoDate) return null;
  // deadline IsoDate is typically yyyy-mm-dd (LocalDate)
  const target = new Date(`${deadlineIsoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const today = toLocalMidnight(now);
  const targetMidnight = toLocalMidnight(target);
  const diffMs = targetMidnight.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function statusText(status: string): string {
  if (status === "SAVED") return "Saved";
  if (status === "APPLIED") return "Applied";
  if (status === "INTERVIEW") return "Interviewing";
  if (status === "OFFER") return "Offer Received";
  if (status === "REJECT") return "Rejected";
  return status;
}

function tintFromStatus(status: StatusKey): Tint {
  if (status === "APPLIED") return "violet";
  if (status === "INTERVIEW") return "indigo";
  if (status === "OFFER") return "amber";
  if (status === "REJECT") return "amber";
  return "cyan";
}

function pillFor(tint: Tint) {
  const t = TINTS[tint];
  return {
    text: t.text,
    ring: t.ring,
    bgSoft: t.bgSoft,
    border: t.border,
  };
}

function initialsFromCompany(companyName?: string | null) {
  const name = (companyName ?? "").trim();
  return name.slice(0, 1).toUpperCase() || "•";
}

function formatMatch(matchScore?: number | null) {
  return typeof matchScore === "number" ? `${matchScore}%` : "No AI";
}

function clampMissingSkills(skills: string[] | null | undefined) {
  const list = Array.isArray(skills) ? skills : [];
  return list.slice(0, 3);
}

function pickSuggestedKeyword(suggestedKeywords: string[] | null | undefined) {
  const list = Array.isArray(suggestedKeywords) ? suggestedKeywords : [];
  return list[0] ?? null;
}

function sortLowMatch(cards: JobKanbanCard[]) {
  return [...cards].sort((a, b) => {
    const av = typeof a.matchScore === "number" ? a.matchScore : 9999;
    const bv = typeof b.matchScore === "number" ? b.matchScore : 9999;
    return av - bv;
  });
}

function sortMostMissing(cards: JobKanbanCard[]) {
  return [...cards].sort((a, b) => {
    const al = a.missingSkills?.length ?? 0;
    const bl = b.missingSkills?.length ?? 0;
    return bl - al;
  });
}

function sortSoonRisk(cards: JobKanbanCard[]) {
  // nearest deadline asc; then low matchScore first
  return [...cards].sort((a, b) => {
    const ad = a.deadline
      ? new Date(`${a.deadline}T00:00:00`).getTime()
      : Infinity;
    const bd = b.deadline
      ? new Date(`${b.deadline}T00:00:00`).getTime()
      : Infinity;

    if (ad !== bd) return ad - bd;

    const av = typeof a.matchScore === "number" ? a.matchScore : 9999;
    const bv = typeof b.matchScore === "number" ? b.matchScore : 9999;
    return av - bv;
  });
}

function MiniPanel({
  title,
  subtitle,
  tint,
  items,
  variant,
}: {
  title: string;
  subtitle: string;
  tint: Tint;
  variant: "lowMatch" | "gaps" | "soonRisk";
  items: JobKanbanCard[];
}) {
  const panelPill = pillFor(tint);

  return (
    <div className='rounded-2xl border border-black/10 bg-white p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div
            className={`text-[12px] font-extrabold tracking-widest ${panelPill.text}`}
          >
            {title}
          </div>
          <div className='mt-1 text-[12px] font-medium text-zinc-500'>
            {subtitle}
          </div>
        </div>
        <div
          className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-extrabold ${panelPill.text} ring-1 ${panelPill.ring} ${panelPill.bgSoft}`}
          aria-hidden='true'
        >
          {items.length}
        </div>
      </div>

      <div className='mt-4 space-y-3'>
        {items.map((card) => {
          const tintForCard = tintFromStatus(card.status);
          const cardPill = pillFor(tintForCard);

          const matchText = formatMatch(card.matchScore ?? null);

          const missingAllCount = card.missingSkills?.length ?? 0;
          const missingList = clampMissingSkills(card.missingSkills);
          const missingExtra =
            missingAllCount > missingList.length
              ? missingAllCount - missingList.length
              : 0;

          const suggested = pickSuggestedKeyword(card.suggestedKeywords);

          const diff = variant === "soonRisk" ? daysUntil(card.deadline) : null;
          const dueText =
            variant === "soonRisk"
              ? diff === null
                ? "No date"
                : diff < 0
                  ? `${Math.abs(diff)}d overdue`
                  : diff === 0
                    ? "Due today"
                    : `${diff}d left`
              : null;

          const stText = statusText(card.status);

          const logoSrc = card.companyLogoUrl ?? null;
          const initials = initialsFromCompany(card.companyName);

          return (
            <div
              key={card.id}
              className='flex items-start justify-between gap-3 rounded-xl border border-black/10 bg-[#F8FAFC] p-3'
            >
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`flex h-[36px] w-[36px] items-center justify-center overflow-hidden ${cardPill.bgSoft} aspect-square shrink-0`}
                    aria-hidden='true'
                  >
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={card.companyName ?? "Company logo"}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='text-[13px] font-extrabold text-zinc-700'>
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className='min-w-0'>
                    <div className='truncate text-[13px] font-extrabold text-zinc-900'>
                      {card.companyName || "Unknown company"}
                    </div>
                    <div className='truncate text-[12px] font-medium text-zinc-500'>
                      {card.position || "—"}
                    </div>
                  </div>
                </div>

                <div className='mt-2 space-y-2'>
                  <div className='text-[12px] font-semibold text-zinc-700'>
                    Match:{" "}
                    <span
                      className={
                        typeof card.matchScore === "number"
                          ? cardPill.text
                          : "text-zinc-500"
                      }
                    >
                      {matchText}
                    </span>
                  </div>

                  <div>
                    <div className='text-[12px] font-semibold text-zinc-600'>
                      Missing
                    </div>
                    <div className='mt-1 flex flex-wrap gap-1.5'>
                      {missingList.map((s) => (
                        <span
                          key={s}
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-extrabold ${cardPill.text} ${cardPill.bgSoft} border-black/10`}
                          title={s}
                        >
                          {s}
                        </span>
                      ))}
                      {missingExtra > 0 ? (
                        <span className='rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-extrabold text-zinc-600'>
                          +{missingExtra}
                        </span>
                      ) : null}
                      {missingAllCount === 0 ? (
                        <span className='rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-extrabold text-zinc-600'>
                          No gaps
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {variant === "lowMatch" ? (
                    <div className='text-[12px] font-semibold text-zinc-600'>
                      Next keyword:{" "}
                      <span className='text-zinc-800'>{suggested ?? "—"}</span>
                    </div>
                  ) : null}

                  {variant === "gaps" ? (
                    <div className='text-[12px] font-semibold text-zinc-600'>
                      Suggested:{" "}
                      <span className='text-zinc-800'>{suggested ?? "—"}</span>
                    </div>
                  ) : null}

                  {variant === "soonRisk" ? (
                    <div className='text-[12px] font-semibold text-zinc-600'>
                      {dueText ? (
                        <>
                          Risk: <span className='text-zinc-800'>{dueText}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-extrabold ${cardPill.text} ring-1 ${cardPill.ring} ${cardPill.bgSoft}`}
                title={stText}
              >
                {stText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AiSpotlight({ cards }: { cards: JobKanbanCard[] }) {
  const safeCards = Array.isArray(cards) ? cards : [];

  const lowMatch = sortLowMatch(safeCards).slice(0, 3);
  const gaps = sortMostMissing(safeCards).slice(0, 3);
  const soonCandidates = safeCards.filter((c) => !!c.deadline);
  const soonRisk = sortSoonRisk(soonCandidates).slice(0, 3);

  return (
    <section className='rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_35px_rgba(15,23,42,0.06)]'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-[16px] font-extrabold tracking-tight text-zinc-900'>
            AI Spotlight
          </h2>
          <p className='mt-1 text-[12px] font-medium text-zinc-500'>
            What to improve next — per job, not aggregated.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <div
            className='rounded-lg border border-black/10 bg-[#F8FAFC] px-3 py-2 text-[12px] font-semibold text-zinc-600'
            aria-label='AI powered insights'
          >
            AI on your jobs
          </div>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <MiniPanel
          title='LOW MATCH'
          subtitle='Jobs likely needing skill gaps'
          tint='violet'
          variant='lowMatch'
          items={lowMatch}
        />
        <MiniPanel
          title='GAPS'
          subtitle='Missing skills with highest count'
          tint='cyan'
          variant='gaps'
          items={gaps}
        />
        <MiniPanel
          title='SOON + RISK'
          subtitle='Nearest deadlines, low match first'
          tint='amber'
          variant='soonRisk'
          items={soonRisk}
        />
      </div>
    </section>
  );
}
