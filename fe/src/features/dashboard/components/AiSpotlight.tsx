"use client";

import React from "react";
import type { JobKanbanCard } from "@/features/kanban/types/kanban";

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

type PanelColorKey = "lowMatch" | "gaps" | "soonRisk";

type PanelPill = {
  text: string;
  ring: string;
  bgSoft: string;
  border: string;
};

const PANEL_COLORS: Record<PanelColorKey, { accentHex: string }> = {
  lowMatch: { accentHex: "#E05252" }, // Red-orange
  gaps: { accentHex: "#D4A017" }, // Amber
  soonRisk: { accentHex: "#E07B39" }, // Orange
};

function pillForAccent(accentHex: string): PanelPill {
  if (accentHex === "#E05252") {
    return {
      text: "text-[#E05252]",
      ring: "ring-[#E05252]/20",
      bgSoft: "bg-[#E05252]/10",
      border: "border-[#E05252]/40",
    };
  }
  if (accentHex === "#D4A017") {
    return {
      text: "text-[#D4A017]",
      ring: "ring-[#D4A017]/20",
      bgSoft: "bg-[#D4A017]/10",
      border: "border-[#D4A017]/40",
    };
  }
  return {
    text: "text-[#E07B39]",
    ring: "ring-[#E07B39]/20",
    bgSoft: "bg-[#E07B39]/10",
    border: "border-[#E07B39]/40",
  };
}

function initialsFromCompany(companyName?: string | null) {
  const name = (companyName ?? "").trim();
  return name.slice(0, 1).toUpperCase() || "•";
}

function formatMatch(matchScore?: number | null) {
  return typeof matchScore === "number" ? `${matchScore}%` : "No AI";
}

function matchBarColors(matchScore: number): { fill: string; track: string } {
  if (matchScore <= 20)
    return { fill: "#FF4D4F", track: "rgba(255, 77, 79, 0.18)" };
  if (matchScore <= 60)
    return { fill: "#FAAD14", track: "rgba(250, 173, 20, 0.18)" };
  return { fill: "#52C41A", track: "rgba(82, 196, 26, 0.18)" };
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

function getTabAccentHex(tab: TabKey): string {
  if (tab === "lowMatch") return PANEL_COLORS.lowMatch.accentHex;
  if (tab === "gaps") return PANEL_COLORS.gaps.accentHex;
  return PANEL_COLORS.soonRisk.accentHex;
}

function TabButton({
  tab,
  activeTab,
  onSelect,
}: {
  tab: TabKey;
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}) {
  const accentHex = getTabAccentHex(tab);
  const active = tab === activeTab;

  const className = active
    ? "rounded-xl border bg-white/5 px-3 py-1.5 text-[12px] font-extrabold text-white"
    : "rounded-xl border border-[#23252a] bg-[#0f1011] px-3 py-1.5 text-[12px] font-extrabold text-[#d0d6e0] hover:bg-white/5";

  return (
    <button
      type='button'
      className={className}
      style={active ? { borderColor: accentHex } : undefined}
      onClick={() => onSelect(tab)}
    >
      {tab === "lowMatch"
        ? "LOW MATCH"
        : tab === "gaps"
          ? "GAPS"
          : "SOON + RISK"}
    </button>
  );
}

type TabKey = "lowMatch" | "gaps" | "soonRisk";

function AiSpotlightSkeleton() {
  // Reuse the same “dashboard loading” look & feel (animate-pulse blocks)
  return (
    <section className='rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <div className='h-5 w-[45%] animate-pulse rounded bg-white/15' />
          <div className='mt-2 h-[14px] w-[60%] animate-pulse rounded bg-white/10' />
        </div>
        <div className='h-9 w-[90px] animate-pulse rounded-xl bg-white/5' />
      </div>

      <div className='mt-5 flex items-center gap-3'>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className='h-[34px] w-[132px] animate-pulse rounded-xl bg-white/5'
          />
        ))}
      </div>

      <div className='mt-5 grid grid-cols-1 gap-4'>
        <div className='rounded-2xl bg-[#0f1011] p-4 shadow-[0_1px_0_rgba(35,37,42,0.30)] border border-[#23252a]'>
          <div className='h-4 w-[70%] animate-pulse rounded bg-white/10' />
          <div className='mt-2 h-3 w-[55%] animate-pulse rounded bg-white/10' />
          <div className='mt-4 space-y-3'>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className='flex items-start justify-between gap-3 rounded-xl border border-[#23252a] bg-[#0f1011] p-3'
              >
                <div className='flex items-start gap-3 min-w-0'>
                  <div className='h-12 w-12 animate-pulse rounded-2xl bg-white/5' />
                  <div className='min-w-0'>
                    <div className='h-3 w-[140px] animate-pulse rounded bg-white/10' />
                    <div className='mt-2 h-3 w-[110px] animate-pulse rounded bg-white/10' />
                  </div>
                </div>
                <div className='h-7 w-[92px] animate-pulse rounded-full bg-white/5' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniPanel({
  title,
  subtitle,
  panelKey,
  items,
  variant,
}: {
  title: string;
  subtitle: string;
  panelKey: PanelColorKey;
  variant: "lowMatch" | "gaps" | "soonRisk";
  items: JobKanbanCard[];
}) {
  const panel = PANEL_COLORS[panelKey];
  const panelPill = pillForAccent(panel.accentHex);

  return (
    <div className='rounded-2xl border border-[#23252a] bg-[#0f1011] p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div
            className={`text-[12px] font-extrabold tracking-widest ${panelPill.text}`}
          >
            {title}
          </div>
          <div className='mt-1 text-[12px] font-medium text-[#d0d6e0]'>
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
          const cardPill = panelPill;

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
              className='flex items-start justify-between gap-3 rounded-xl border border-[#23252a] bg-[#0f1011] p-3'
            >
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`flex h-[60px] w-[60px] rounded-md items-center justify-center overflow-hidden ${cardPill.bgSoft} aspect-square shrink-0`}
                    aria-hidden='true'
                  >
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={card.companyName ?? "Company logo"}
                        className='h-full w-full object-contain'
                      />
                    ) : (
                      <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className='min-w-0'>
                    <div className='truncate text-[13px] font-extrabold text-[#f7f8f8]'>
                      {card.companyName || "Unknown company"}
                    </div>
                    <div className='truncate text-[12px] font-medium text-zinc-500'>
                      {card.position || "—"}
                    </div>
                  </div>
                </div>

                <div className='mt-2 space-y-2'>
                  <div className='text-[12px] font-semibold text-zinc-700'>
                    Match
                    {typeof card.matchScore === "number" ? (
                      <div className='mt-1 flex items-center gap-3'>
                        <div
                          className='h-2.5 flex-1 overflow-hidden rounded-full border'
                          style={{
                            backgroundColor: matchBarColors(card.matchScore)
                              .track,
                            borderColor: matchBarColors(card.matchScore).track,
                          }}
                        >
                          <div
                            className='h-full rounded-full'
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, card.matchScore),
                              )}%`,
                              backgroundColor: matchBarColors(card.matchScore)
                                .fill,
                            }}
                          />
                        </div>

                        <div className='shrink-0 text-[12px] font-extrabold text-[#f7f8f8]'>
                          {matchText}
                        </div>
                      </div>
                    ) : (
                      <span className='ml-2 text-zinc-500'>{matchText}</span>
                    )}
                  </div>

                  <div>
                    <div className='text-[12px] font-semibold text-[#9898B8]'>
                      Missing
                    </div>
                    <div className='mt-1 flex flex-wrap gap-1.5'>
                      {missingList.map((s) => (
                        <span
                          key={s}
                          className='rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-extrabold text-[#9898B8]'
                          title={s}
                        >
                          {s}
                        </span>
                      ))}
                      {missingExtra > 0 ? (
                        <span className='rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-extrabold text-[#9898B8]'>
                          +{missingExtra}
                        </span>
                      ) : null}
                      {missingAllCount === 0 ? (
                        <span className='rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-extrabold text-[#9898B8]'>
                          No gaps
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {variant === "lowMatch" ? (
                    <div className='text-[12px] font-semibold text-[#d0d6e0]'>
                      Next keyword:{" "}
                      <span className='text-[#f7f8f8]'>{suggested ?? "—"}</span>
                    </div>
                  ) : null}

                  {variant === "gaps" ? (
                    <div className='text-[12px] font-semibold text-[#d0d6e0]'>
                      Suggested:{" "}
                      <span className='text-[#f7f8f8]'>{suggested ?? "—"}</span>
                    </div>
                  ) : null}

                  {variant === "soonRisk" ? (
                    <div className='text-[12px] font-semibold text-[#d0d6e0]'>
                      {dueText ? (
                        <>
                          Risk:{" "}
                          <span className='text-[#f7f8f8]'>{dueText}</span>
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

export function AiSpotlight({
  cards,
  isLoading,
}: {
  cards: JobKanbanCard[];
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("lowMatch");

  const safeCards = Array.isArray(cards) ? cards : [];

  const lowMatch = sortLowMatch(safeCards).slice(0, 3);
  const gaps = sortMostMissing(safeCards).slice(0, 3);
  const soonCandidates = safeCards.filter((c) => !!c.deadline);
  const soonRisk = sortSoonRisk(soonCandidates).slice(0, 3);

  if (isLoading) {
    return <AiSpotlightSkeleton />;
  }

  return (
    <section className='rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-[16px] font-extrabold tracking-tight text-[#f7f8f8]'>
            AI Spotlight
          </h2>
          <p className='mt-1 text-[12px] font-medium text-[#d0d6e0]'>
            What to improve next — per job, not aggregated.
          </p>
        </div>
      </div>

      <div className='mt-5 flex items-center gap-3'>
        <TabButton
          tab='lowMatch'
          activeTab={activeTab}
          onSelect={setActiveTab}
        />
        <TabButton
          tab='gaps'
          activeTab={activeTab}
          onSelect={setActiveTab}
        />
        <TabButton
          tab='soonRisk'
          activeTab={activeTab}
          onSelect={setActiveTab}
        />
      </div>

      <div className='mt-5 grid grid-cols-1 gap-4'>
        {activeTab === "lowMatch" ? (
          <MiniPanel
            title='LOW MATCH'
            subtitle='Jobs likely needing skill gaps'
            panelKey='lowMatch'
            variant='lowMatch'
            items={lowMatch}
          />
        ) : null}

        {activeTab === "gaps" ? (
          <MiniPanel
            title='GAPS'
            subtitle='Missing skills with highest count'
            panelKey='gaps'
            variant='gaps'
            items={gaps}
          />
        ) : null}

        {activeTab === "soonRisk" ? (
          <MiniPanel
            title='SOON + RISK'
            subtitle='Nearest deadlines, low match first'
            panelKey='soonRisk'
            variant='soonRisk'
            items={soonRisk}
          />
        ) : null}
      </div>
    </section>
  );
}
