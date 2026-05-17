"use client";

import React, { useMemo, useState } from "react";

import { useApplications } from "@/hooks/useApplications";
import type { JobKanbanCard } from "@/features/kanban/types/kanban";
import { buildClearbitLogoUrl } from "@/features/kanban/utils/clearbit";
import {
  formatDeadline,
  getDeadlineTone,
  deadlineBadgeClasses,
  type DeadlineTone,
} from "@/features/kanban/utils/deadline";

const MATCH_COLORS = {
  red: "#EF4444",
  amber: "#F59E0B",
  teal: "#0D9488",
  gray: "#E5E7EB",
} as const;

function getMatchBucket(matchScore: number): "red" | "amber" | "teal" {
  const s = Math.max(0, Math.min(100, matchScore));
  if (s >= 75) return "teal";
  if (s >= 50) return "amber";
  return "red";
}

function getMatchStroke(matchScore: number | null | undefined): string {
  if (typeof matchScore !== "number") return MATCH_COLORS.gray;
  const bucket = getMatchBucket(matchScore);
  return MATCH_COLORS[bucket];
}

function getAiTone(matchScore: number | null | undefined): DeadlineTone {
  if (typeof matchScore !== "number") return "OK";
  if (matchScore >= 75) return "OK";
  if (matchScore >= 50) return "SOON";
  return "OVERDUE";
}

function initialsFromCompanyName(companyName: string): string {
  const name = (companyName || "").trim();
  if (!name) return "J";
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "J";
  const second = parts.length > 1 ? parts[1]?.[0] : (parts[0]?.[1] ?? "");
  return `${first}${second}`.toUpperCase();
}

function MatchCircle({
  matchScore,
  sizePx = 72,
}: {
  matchScore: number | null | undefined;
  sizePx?: number;
}) {
  const stroke = getMatchStroke(matchScore);
  const value =
    typeof matchScore === "number"
      ? Math.max(0, Math.min(100, matchScore))
      : null;

  const radius = 30;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  const dash = value === null ? 0 : (value / 100) * circumference;
  const gap = circumference - dash;

  const labelText = value === null ? "—" : `${Math.round(value)}%`;

  return (
    <div className='flex items-center justify-center'>
      <svg
        width={sizePx}
        height={sizePx}
        viewBox='0 0 120 120'
        role='img'
        aria-label={`AI match score ${labelText}`}
      >
        <circle
          cx='60'
          cy='60'
          r={radius}
          fill='none'
          stroke='rgba(0,0,0,0.06)'
          strokeWidth={strokeWidth}
        />
        <circle
          cx='60'
          cy='60'
          r={radius}
          fill='none'
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={circumference * 0.25}
          transform='rotate(-90 60 60)'
        />
        <text
          x='60'
          y='66'
          textAnchor='middle'
          fontSize='20'
          fontWeight='800'
          fill='#0f172a'
        >
          {labelText}
        </text>
      </svg>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className='rounded-2xl border border-black/10 bg-white p-4 ring-1 ring-black/5'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 animate-pulse rounded-2xl bg-zinc-100' />
          <div className='min-w-0'>
            <div className='h-4 w-[160px] animate-pulse rounded bg-zinc-100' />
            <div className='mt-2 h-3 w-[120px] animate-pulse rounded bg-zinc-100' />
          </div>
        </div>
        <div className='h-7 w-[74px] animate-pulse rounded-full bg-zinc-100' />
      </div>

      <div className='mt-3 flex items-center justify-between gap-3'>
        <div className='h-[72px] w-[72px] animate-pulse rounded-full bg-zinc-100' />
        <div className='h-7 w-[120px] animate-pulse rounded-full bg-zinc-100' />
      </div>

      <div className='mt-4 space-y-2'>
        <div className='h-3 w-[220px] animate-pulse rounded bg-zinc-100' />
        <div className='h-3 w-[260px] animate-pulse rounded bg-zinc-100' />
        <div className='h-3 w-[180px] animate-pulse rounded bg-zinc-100' />
      </div>
    </div>
  );
}

function JobCard({ card }: { card: JobKanbanCard }) {
  const logoUrl = useMemo(() => {
    return buildClearbitLogoUrl({
      companyLogoUrl: card.companyLogoUrl,
      jdUrl: card.jdUrl,
      companyName: card.companyName,
    });
  }, [card.companyLogoUrl, card.companyName, card.jdUrl]);

  const deadlineTone = useMemo(
    () => getDeadlineTone(card.deadline),
    [card.deadline],
  );

  const aiTone = useMemo(
    () => getAiTone(card.matchScore ?? null),
    [card.matchScore],
  );

  const matchText =
    typeof card.matchScore === "number" ? `${card.matchScore}%` : "—";

  const missingPreview = useMemo(() => {
    const list = card.missingSkills ?? [];
    return list.slice(0, 3);
  }, [card.missingSkills]);

  const keywordsPreview = useMemo(() => {
    const list = card.suggestedKeywords ?? [];
    return list.slice(0, 4);
  }, [card.suggestedKeywords]);

  const initials = useMemo(() => {
    return initialsFromCompanyName(card.companyName);
  }, [card.companyName]);

  const hasMissing = missingPreview.length > 0;
  const hasKeywords = keywordsPreview.length > 0;

  return (
    <article className='rounded-2xl border border-black/10 bg-white p-4 ring-1 ring-black/5'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex min-w-0 items-center gap-3'>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${card.companyName} logo`}
              className='h-12 w-12 rounded-2xl ring-1 bg-white object-cover'
            />
          ) : (
            <div
              className='flex h-12 w-12 items-center justify-center rounded-2xl ring-1 bg-white'
              style={{ boxShadow: "0 12px 28px rgba(0,0,0,0.06)" }}
              aria-hidden='true'
            >
              <span className='text-[13px] font-extrabold text-zinc-900'>
                {initials}
              </span>
            </div>
          )}

          <div className='min-w-0'>
            <div className='truncate text-[13px] font-extrabold text-zinc-900'>
              {card.companyName}
            </div>
            <div className='truncate text-[12px] font-semibold text-zinc-500'>
              {card.position}
            </div>
          </div>
        </div>

        <span className='inline-flex items-center rounded-full bg-indigo-600/5 px-3 py-1 text-[11px] font-extrabold text-indigo-700 ring-1 ring-indigo-500/20'>
          {card.status}
        </span>
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <MatchCircle
            matchScore={card.matchScore}
            sizePx={72}
          />
          <div className='flex flex-col'>
            <div className='text-[11px] font-extrabold text-zinc-500'>
              AI Match
            </div>
            <div className='mt-1 text-[12px] font-extrabold text-zinc-900'>
              {matchText}
            </div>
          </div>
        </div>

        {card.deadline ? (
          <span
            className={[
              "rounded-full px-3 py-1 text-[11px] font-extrabold ring-1",
              deadlineBadgeClasses(deadlineTone),
            ].join(" ")}
            aria-label={`Deadline ${card.deadline}`}
          >
            Due {formatDeadline(card.deadline)}
          </span>
        ) : null}
      </div>

      <div className='mt-4 grid gap-2'>
        <div className='text-[12px] font-extrabold text-zinc-800'>
          AI insights
        </div>

        <div className='space-y-2'>
          {hasMissing ? (
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-[11px] font-extrabold text-zinc-500'>
                Missing:
              </span>
              {missingPreview.map((s) => (
                <span
                  key={s}
                  className='rounded-full bg-zinc-50 px-2 py-1 text-[11px] font-extrabold text-zinc-800 ring-1 ring-black/5'
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className='text-[12px] font-semibold text-zinc-500'>
              Missing skills: —
            </div>
          )}

          {hasKeywords ? (
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-[11px] font-extrabold text-zinc-500'>
                Keywords:
              </span>
              {keywordsPreview.map((k) => (
                <span
                  key={k}
                  className='rounded-full border border-black/10 bg-white px-2 py-1 text-[11px] font-extrabold text-zinc-800'
                >
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <div className='text-[12px] font-semibold text-zinc-500'>
              Suggested keywords: —
            </div>
          )}

          {/* tiny extra hint tied to match score */}
          <div className='pt-1'>
            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold ring-1",
                deadlineBadgeClasses(aiTone),
              ].join(" ")}
            >
              AI score is{" "}
              {typeof card.matchScore === "number"
                ? matchText
                : "not available"}
            </span>
          </div>
        </div>
      </div>

      {card.activity?.length ? (
        <div className='mt-4 rounded-xl bg-zinc-50 px-3 py-2 ring-1 ring-black/5'>
          <div className='text-[11px] font-extrabold text-zinc-600'>
            Latest update
          </div>
          <div className='mt-1 truncate text-[12px] font-semibold text-zinc-800'>
            {card.activity[0]!.text}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function ApplicationsClient() {
  const { data, isLoading, isError } = useApplications();
  const [query, setQuery] = useState("");

  const cards = data?.cards ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => {
      const hay = `${c.companyName} ${c.position} ${c.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [cards, query]);

  return (
    <div className='flex flex-col gap-6 pb-10'>
      <section className='flex flex-col gap-2'>
        <h1 className='text-[20px] font-extrabold tracking-tight text-zinc-900'>
          My Applications
        </h1>
        <p className='text-[12px] font-semibold text-zinc-500'>
          Jobs you’ve added, with AI insights (match score, missing skills,
          keywords).
        </p>

        <div className='mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-2 ring-1 ring-black/5'>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search company, position, status...'
              aria-label='Search applications'
              className='w-full bg-transparent text-sm font-semibold text-zinc-800 outline-none placeholder:text-zinc-400'
            />
          </div>

          <div className='text-[12px] font-semibold text-zinc-500'>
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <JobCardSkeleton key={idx} />
          ))}
        </section>
      ) : isError ? (
        <div className='rounded-xl border border-red-500/20 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700'>
          Failed to load applications.
        </div>
      ) : filtered.length === 0 ? (
        <div className='rounded-xl border border-black/10 bg-white px-4 py-10 text-center'>
          <div className='text-[14px] font-extrabold text-zinc-900'>
            No applications found
          </div>
          <div className='mt-2 text-[12px] font-semibold text-zinc-500'>
            Try a different search keyword.
          </div>
        </div>
      ) : (
        <section className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((card) => (
            <JobCard
              key={card.id}
              card={card}
            />
          ))}
        </section>
      )}
    </div>
  );
}
