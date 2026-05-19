"use client";

import React, { useMemo } from "react";

import type { JobKanbanCard } from "../types/kanban";
import { buildClearbitLogoUrl } from "../utils/clearbit";
import {
  deadlineBadgeClasses,
  formatDeadline,
  getDeadlineTone,
} from "../utils/deadline";

export function JobKanbanCardView({
  card,
  tintTextClass,
  onSelect,
}: {
  card: JobKanbanCard;
  tintTextClass: string;
  onSelect: () => void;
}) {
  const logoUrl = useMemo(() => {
    return buildClearbitLogoUrl({
      companyLogoUrl: card.companyLogoUrl,
      jdUrl: card.jdUrl,
      companyName: card.companyName,
    });
  }, [card.companyLogoUrl, card.companyName, card.jdUrl]);

  const initials = useMemo(() => {
    const name = (card.companyName || "").trim();
    if (!name) return "J";
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "J";
    const second = parts.length > 1 ? parts[1]?.[0] : (parts[0]?.[1] ?? "");
    return `${first}${second}`.toUpperCase();
  }, [card.companyName]);

  const deadlineTone = useMemo(
    () => getDeadlineTone(card.deadline),
    [card.deadline],
  );

  const matchPercent = useMemo(() => {
    const v = card.matchScore ?? null;
    if (v === null) return null;
    // assume BE sends 0..100
    const clamped = Math.max(0, Math.min(100, v));
    return clamped;
  }, [card.matchScore]);

  return (
    <button
      type='button'
      onClick={onSelect}
      className={[
        "group text-left w-full rounded-2xl border bg-[#0f1011] border-[#23252a] px-3 py-3",
        "hover:shadow-[0_12px_28px_rgba(0,0,0,0.28)]",
        "focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30",
      ].join(" ")}
      aria-label={`Open job ${card.companyName} ${card.position}`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`${card.companyName} logo`}
                className='h-10 w-10 rounded-2xl ring-1 ring-[#23252a] bg-[#0f1011] object-contain'
              />
            ) : (
              <span
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-[#23252a] bg-[#0f1011]",
                  tintTextClass,
                ].join(" ")}
                aria-hidden='true'
              >
                <span className='text-[13px] font-extrabold text-[#f7f8f8]'>
                  {initials}
                </span>
              </span>
            )}

            <div className='min-w-0'>
              <div className='truncate text-[13px] font-extrabold text-[#f7f8f8]'>
                {card.companyName}
              </div>
              <div className='truncate text-[12px] font-semibold text-[#d0d6e0]'>
                {card.position}
              </div>
            </div>
          </div>

          <div className='mt-2 flex flex-wrap items-center gap-2'>
            {matchPercent !== null ? (
              <span
                className={[
                  "rounded-full border border-[#23252a] bg-[#141516] px-2.5 py-1 text-[12px] font-extrabold text-[#f7f8f8]",
                ].join(" ")}
                aria-label={`Match ${matchPercent}%`}
              >
                {matchPercent}%
              </span>
            ) : (
              <span className='rounded-full border border-[#23252a] bg-[#141516] px-2.5 py-1 text-[12px] font-extrabold text-[#f7f8f8]'>
                —
              </span>
            )}

            {card.deadline ? (
              <span
                className={[
                  "rounded-full px-3 py-1 text-[11px] font-extrabold",
                  deadlineBadgeClasses(deadlineTone),
                ].join(" ")}
                aria-label={`Deadline ${card.deadline}`}
              >
                Due {formatDeadline(card.deadline)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        <span className='rounded-full bg-[#5e6ad2]/10 px-2 py-1 text-[11px] font-extrabold text-[#5e6ad2] ring-1 ring-[#5e6ad2]/20'>
          {card.status}
        </span>
      </div>
    </button>
  );
}
