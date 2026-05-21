import React from "react";
import { CalendarDays } from "lucide-react";
import type { DeadlineItem } from "../mock/mockData";
import type { Tint } from "../utils/tints";

type UrgencyLevel = "red" | "yellow" | "green";

const CLAMP_TITLE_STYLE: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const CLAMP_SUBTITLE_STYLE: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

function parseDays(whenText: string): number | null {
  // Examples from fe/src/app/dashboard/page.tsx:
  // - "Due Today"
  // - "2 days left"
  // - "1 day left"
  // - "12 days left"
  // - "5 days overdue"
  if (whenText === "Due Today") return 0;

  const left = whenText.match(/(\d+)\s+day[s]?\s+left/i);
  if (left) return Number.parseInt(left[1], 10);

  const overdue = whenText.match(/(\d+)\s+day[s]?\s+overdue/i);
  if (overdue) return -Number.parseInt(overdue[1], 10);

  return null;
}

function urgencyLevelFromDays(days: number | null, tint: Tint): UrgencyLevel {
  if (days !== null) {
    if (days <= 3) return "red"; // includes overdue (negative)
    if (days <= 7) return "yellow";
    return "green";
  }

  // Fallback: map existing urgencyTint groups
  if (tint === "violet" || tint === "amber") return "red";
  if (tint === "cyan") return "yellow";
  return "green";
}

function badgeText(days: number | null, whenText: string): string {
  if (whenText === "Due Today") return "Today";
  if (days === null) return whenText;

  if (days < 0) return `${Math.abs(days)}d late`;
  return `${days}d left`;
}

function urgencyColors(level: UrgencyLevel): {
  accent: string;
  pillText: string;
  pillBg: string;
} {
  switch (level) {
    case "red":
      return { accent: "#EF4444", pillText: "#0B1220", pillBg: "#EF4444" };
    case "yellow":
      return { accent: "#F59E0B", pillText: "#111827", pillBg: "#F59E0B" };
    case "green":
      return { accent: "#22C55E", pillText: "#052e16", pillBg: "#22C55E" };
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

export function UpcomingDeadlines({ items }: { items: DeadlineItem[] }) {
  return (
    <section className='mt-2 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-[16px] font-extrabold tracking-tight text-[#f7f8f8]'>
            Upcoming Deadlines
          </h2>
          <p className='mt-1 text-[12px] font-medium text-[#d0d6e0]'>
            Keep an eye on what’s next.
          </p>
        </div>

        <button
          type='button'
          className='rounded-lg px-3 py-2 text-[12px] font-semibold text-[#d0d6e0] hover:bg-[#141516]'
          aria-label='View all deadlines'
        >
          View all
        </button>
      </div>

      <div className='mt-6 overflow-x-auto pb-2'>
        <div className='flex min-w-max gap-4'>
          {items.map((item) => {
            const days = parseDays(item.whenText);
            const level = urgencyLevelFromDays(days, item.urgencyTint);
            const colors = urgencyColors(level);

            const logoBgStyle: React.CSSProperties = {
              backgroundColor: `${colors.accent}1A`,
            };

            return (
              <article
                key={item.id}
                className='w-[220px] shrink-0 flex flex-col rounded-2xl bg-[#0f1011] p-4 shadow-[0_1px_0_rgba(35,37,42,0.25),0_12px_35px_rgba(0,0,0,0.12)] hover:shadow-[0_1px_0_rgba(35,37,42,0.40),0_16px_45px_rgba(0,0,0,0.18)] transition-shadow'
              >
                {/* Top accent bar */}
                <div
                  className='h-1 w-full rounded-full'
                  style={{ backgroundColor: colors.accent }}
                />

                <div className='mt-3 flex items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <div
                      className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl'
                      style={logoBgStyle}
                      aria-label={`${item.companyInitial} company logo container`}
                    >
                      {item.companyLogoUrl ? (
                        <img
                          src={item.companyLogoUrl}
                          alt={
                            item.title ? `${item.title} logo` : "Company logo"
                          }
                          className='h-full w-full object-contain'
                          loading='lazy'
                        />
                      ) : (
                        <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                          {item.companyInitial}
                        </div>
                      )}
                    </div>

                    <div
                      className='mt-3 text-[14px] font-extrabold text-[#f7f8f8]'
                      style={CLAMP_TITLE_STYLE}
                    >
                      {item.title}
                    </div>

                    <div
                      className='mt-1 text-[12px] font-medium text-[#d0d6e0]'
                      style={CLAMP_SUBTITLE_STYLE}
                    >
                      {item.subtitle}
                    </div>
                  </div>

                  <div
                    className='shrink-0 rounded-full px-3 py-1 text-[12px] font-extrabold'
                    style={{
                      backgroundColor: colors.pillBg,
                      color: colors.pillText,
                    }}
                    aria-label={`Urgency: ${item.whenText}`}
                  >
                    {badgeText(days, item.whenText)}
                  </div>
                </div>

                <div className='mt-3 h-px w-full bg-white/5' />

                <div className='mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]'>
                  <CalendarDays
                    className='h-4 w-4'
                    style={{ color: colors.accent }}
                    strokeWidth={2}
                    aria-hidden='true'
                  />
                  <span className='min-w-0 truncate'>{item.whenText}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
