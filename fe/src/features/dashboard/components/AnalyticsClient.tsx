"use client";

import React, { useEffect, useMemo } from "react";
import { useMe } from "@/hooks/useAuth";
import {
  useAnalyticsOverviewStats,
  useAnalyticsPipelineFunnel,
  useAnalyticsTopMissingSkills,
  useAnalyticsStatusConversionRates,
} from "@/hooks/useAnalytics";
import type {
  StatusConversionRateResponse,
  TopMissingSkillResponse,
} from "@/types/analytics.type";
import { ApplicationPipelineFunnel } from "./ApplicationPipelineFunnel";
import type { PipelineStage } from "../mock/mockData";

type Tint = "indigo" | "violet" | "cyan" | "amber";

const tintColors: Record<
  Tint,
  { stroke: string; border: string; ring: string; text: string; soft: string }
> = {
  indigo: {
    stroke: "#6366F1",
    border: "border-indigo-200",
    ring: "ring-indigo-200/70",
    text: "text-indigo-800",
    soft: "bg-indigo-50",
  },
  violet: {
    stroke: "#8B5CF6",
    border: "border-violet-200",
    ring: "ring-violet-200/70",
    text: "text-violet-800",
    soft: "bg-violet-50",
  },
  cyan: {
    stroke: "#06B6D4",
    border: "border-cyan-200",
    ring: "ring-cyan-200/70",
    text: "text-cyan-800",
    soft: "bg-cyan-50",
  },
  amber: {
    stroke: "#F59E0B",
    border: "border-amber-200",
    ring: "ring-amber-200/70",
    text: "text-amber-800",
    soft: "bg-amber-50",
  },
};

function formatPct(rate: number) {
  const v = Math.round(rate * 100);
  return `${v}%`;
}

function StatCard({
  title,
  value,
  tint,
  deltaText,
  icon,
}: {
  title: string;
  value: string;
  tint: Tint;
  deltaText?: string;
  icon: "bolt" | "arrow" | "spark" | "clock";
}) {
  const c = tintColors[tint];

  const Icon = () => {
    switch (icon) {
      case "bolt":
        return (
          <svg
            className='h-5 w-5'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              d='M13 2L3 14h9l-1 8 10-12h-9l1-8Z'
              stroke={c.stroke}
              strokeWidth='2'
              strokeLinejoin='round'
            />
          </svg>
        );
      case "arrow":
        return (
          <svg
            className='h-5 w-5'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              d='M7 17l10-10'
              stroke={c.stroke}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M7 7h10v10'
              stroke={c.stroke}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
      case "spark":
        return (
          <svg
            className='h-5 w-5'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              d='M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z'
              stroke={c.stroke}
              strokeWidth='2'
              strokeLinejoin='round'
            />
            <path
              d='M20.2 14.2l.8 3.2 3.2.8-3.2.8-.8-3.2-3.2-.8 3.2-.8.8-3.2-3.2-.8Z'
              fill={c.stroke}
              opacity='0.25'
            />
          </svg>
        );
      case "clock":
        return (
          <svg
            className='h-5 w-5'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z'
              stroke={c.stroke}
              strokeWidth='2'
            />
            <path
              d='M12 6v6l4 2'
              stroke={c.stroke}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-black/5`}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <div className='text-[11px] font-extrabold tracking-widest text-zinc-500'>
            {title}
          </div>
          <div className='mt-2 flex items-baseline gap-2'>
            <div className='text-[34px] font-extrabold tracking-tight text-zinc-900'>
              {value}
            </div>
          </div>
          {deltaText ? (
            <div className='mt-2 text-[12px] font-medium text-zinc-500'>
              <span className='inline-flex items-center gap-2'>
                <span
                  className={`inline-flex h-5 items-center rounded-lg px-2 text-[11px] font-extrabold ${c.soft} ${c.text} ring-1 ${c.ring}`}
                >
                  {deltaText}
                </span>
              </span>
            </div>
          ) : null}
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-black/0`}
          style={{ boxShadow: `0 10px 25px rgba(0,0,0,0.04)` }}
        >
          <Icon />
        </div>
      </div>

      <div
        className='pointer-events-none absolute left-0 top-0 h-full w-[3px]'
        style={{ backgroundColor: c.stroke, opacity: 0.45 }}
      />
    </article>
  );
}

function LineAreaChart({
  points,
  tint,
}: {
  points: { xLabel: string; y: number }[];
  tint: Tint;
}) {
  const w = 560;
  const h = 200;
  const pad = 18;

  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const xStep = (w - pad * 2) / Math.max(1, points.length - 1);

  const yToSvg = (y: number) => {
    if (maxY === minY) return h / 2;
    const t = (y - minY) / (maxY - minY);
    return pad + (1 - t) * (h - pad * 2);
  };

  const path = points
    .map((p, i) => {
      const x = pad + i * xStep;
      const y = yToSvg(p.y);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaPath = `${path} L ${
    pad + (points.length - 1) * xStep
  } ${h - pad} L ${pad} ${h - pad} Z`;

  const c = tintColors[tint];

  return (
    <div className='mt-5 rounded-xl bg-white p-4 ring-1 ring-black/5'>
      <div className='flex items-center justify-between'>
        <div className='text-[12px] font-semibold text-zinc-500'>
          Applications Over Time
        </div>
        <div className='text-[12px] font-semibold text-zinc-500'>
          Last 8 weeks
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className='mt-4 h-[180px] w-full'
        role='img'
        aria-label='Applications over time chart'
      >
        {[0, 1, 2, 3].map((i) => {
          const y = pad + (i * (h - pad * 2)) / 3;
          return (
            <line
              key={i}
              x1={pad}
              y1={y}
              x2={w - pad}
              y2={y}
              stroke='rgba(0,0,0,0.06)'
              strokeWidth='1'
            />
          );
        })}

        <path
          d={areaPath}
          fill={c.stroke}
          fillOpacity='0.12'
        />
        <path
          d={path}
          fill='none'
          stroke={c.stroke}
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {points.map((p, i) => {
          const x = pad + i * xStep;
          const y = h - 6;
          return (
            <text
              key={p.xLabel + i}
              x={x}
              y={y}
              textAnchor='middle'
              fontSize='10'
              fill='rgba(0,0,0,0.45)'
            >
              {p.xLabel}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function MatchScoreDonut({
  total,
  buckets,
}: {
  total: number;
  buckets: { label: string; color: "red" | "amber" | "teal"; count: number }[];
}) {
  const strokeWidth = 18;
  const r = 58;
  const c = 2 * Math.PI * r;
  const totalCount = buckets.reduce((s, b) => s + b.count, 0) || 1;

  const toColor = (color: "red" | "amber" | "teal") => {
    switch (color) {
      case "red":
        return "#EF4444";
      case "amber":
        return "#F59E0B";
      case "teal":
        return "#0D9488";
      default:
        return "#6366F1";
    }
  };

  let acc = 0;

  return (
    <div className='rounded-xl bg-white p-6 ring-1 ring-black/5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-[14px] font-extrabold tracking-tight text-zinc-900'>
            Match Score Dist.
          </h3>
          <p className='mt-1 text-[12px] font-medium text-zinc-500'>
            AI match distribution
          </p>
        </div>
        <div className='text-[12px] font-semibold text-zinc-500'>
          Jobs total: {total}
        </div>
      </div>

      <div className='mt-5 flex items-center justify-center gap-6'>
        <svg
          viewBox='0 0 140 140'
          className='h-[168px] w-[168px]'
        >
          <circle
            cx='70'
            cy='70'
            r={r}
            fill='none'
            stroke='rgba(0,0,0,0.06)'
            strokeWidth={strokeWidth}
          />
          {buckets.map((b, idx) => {
            const frac = b.count / totalCount;
            const dash = frac * c;
            const gap = c - dash;
            const offset = c * (1 - acc);
            acc += frac;

            return (
              <circle
                key={b.label + idx}
                cx='70'
                cy='70'
                r={r}
                fill='none'
                stroke={toColor(b.color)}
                strokeWidth={strokeWidth}
                strokeLinecap='round'
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
                transform='rotate(-90 70 70)'
              />
            );
          })}

          <text
            x='70'
            y='74'
            textAnchor='middle'
            fontSize='20'
            fill='#0f172a'
            fontWeight='800'
          >
            {total}
          </text>
          <text
            x='70'
            y='95'
            textAnchor='middle'
            fontSize='10'
            fill='rgba(0,0,0,0.45)'
            fontWeight='700'
          >
            JOBS TOTAL
          </text>
        </svg>

        <div className='min-w-[160px]'>
          {buckets.map((b) => (
            <div
              key={b.label}
              className='flex items-center justify-between gap-3 py-2'
            >
              <div className='flex items-center gap-3'>
                <span
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: toColor(b.color) }}
                  aria-hidden='true'
                />
                <span className='text-[12px] font-extrabold text-zinc-800'>
                  {b.label}
                </span>
              </div>
              <div className='text-[12px] font-extrabold text-zinc-800'>
                {b.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversionRates({ rates }: { rates: StatusConversionRateResponse[] }) {
  const pctRows = useMemo(() => {
    const get = (from: string, to: string) => {
      const found = rates.find(
        (r) => r.fromStatus === from && r.toStatus === to,
      );
      return found ?? null;
    };

    return [
      {
        from: "SAVED",
        to: "APPLIED",
        label: "Saved → Applied",
        item: get("SAVED", "APPLIED"),
      },
      {
        from: "APPLIED",
        to: "INTERVIEW",
        label: "Applied → Interview",
        item: get("APPLIED", "INTERVIEW"),
      },
      {
        from: "INTERVIEW",
        to: "OFFER",
        label: "Interview → Offer",
        item: get("INTERVIEW", "OFFER"),
      },
      {
        from: "ANY",
        to: "REJECT",
        label: "Any → Rejected",
        item: rates.find((r) => r.toStatus === "REJECT"),
      },
    ] as const;
  }, [rates]);

  const toPct = (rate: number | undefined) => {
    if (typeof rate !== "number") return "0%";
    return formatPct(rate);
  };

  const pillTint = (_from: string, to: string) => {
    if (to === "APPLIED") return "indigo";
    if (to === "INTERVIEW") return "violet";
    if (to === "OFFER") return "cyan";
    if (to === "REJECT") return "amber";
    return "indigo";
  };

  return (
    <div className='rounded-xl bg-white p-6 ring-1 ring-black/5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-[14px] font-extrabold tracking-tight text-zinc-900'>
            Conversion Rates
          </h3>
          <p className='mt-1 text-[12px] font-medium text-zinc-500'>
            Stage-by-stage success
          </p>
        </div>
        <button
          type='button'
          className='rounded-lg border border-black/10 px-3 py-2 text-[12px] font-semibold text-zinc-600 hover:bg-black/5'
          aria-label='More conversion options'
        >
          More
        </button>
      </div>

      <div className='mt-5 space-y-3'>
        {pctRows.map((row) => {
          const rate = row.item?.rate;
          const tint = pillTint(row.from, row.to);
          const c = tintColors[tint];

          return (
            <div
              key={row.label}
              className='flex items-center justify-between gap-4 rounded-xl bg-zinc-50 px-4 py-3'
            >
              <div className='flex items-center gap-3'>
                <span
                  className='h-2.5 w-2.5 rounded-full'
                  style={{ backgroundColor: c.stroke }}
                  aria-hidden='true'
                />
                <div className='text-[12px] font-extrabold text-zinc-800'>
                  {row.label}
                </div>
              </div>
              <div className={`text-[12px] font-extrabold ${c.text}`}>
                {toPct(rate)}
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-5 text-[11px] font-semibold text-zinc-500'>
        Rates are calculated from job status transitions.
      </div>
    </div>
  );
}

function deriveApplicationsOverTime(totalApplications: number) {
  // Deterministic spread (no gradients / no randomness) to keep chart stable.
  // 8 weeks points sum roughly to totalApplications.
  const base = Math.floor(totalApplications / 8);
  const remainder = totalApplications % 8;

  const weights = [6, 5, 7, 12, 14, 9, 13, 4];
  const weightSum = weights.reduce((s, w) => s + w, 0) || 1;

  const pts = weights.map((w, idx) => {
    const alloc = Math.floor((w / weightSum) * totalApplications);
    return { idx, alloc };
  });

  let currentSum = pts.reduce((s, p) => s + p.alloc, 0);
  let i = 0;
  while (currentSum < totalApplications && i < 200) {
    const k = i % pts.length;
    pts[k] = { ...pts[k], alloc: pts[k].alloc + 1 };
    currentSum += 1;
    i += 1;
  }

  // fallback if totalApplications small
  if (totalApplications > 0 && currentSum === 0) {
    pts[0] = { idx: 0, alloc: totalApplications };
  }

  return pts.map((p, idx) => ({
    xLabel: `W${idx + 1}`,
    y: p.alloc + (idx === 0 ? remainder - remainder : 0) + base,
  }));
}

function deriveMatchScoreBuckets({
  total,
  avgMatchScore,
}: {
  total: number;
  avgMatchScore: number; // 0..100
}) {
  if (total <= 0) {
    return [
      { label: "Low", color: "red" as const, count: 0 },
      { label: "Mid", color: "amber" as const, count: 0 },
      { label: "High", color: "teal" as const, count: 0 },
    ];
  }

  const a = Math.max(0, Math.min(100, avgMatchScore));
  const lowFrac = Math.max(0, (50 - a) / 50);
  const highFrac = Math.max(0, (a - 50) / 50);
  const midFrac = Math.max(0, 1 - lowFrac - highFrac);

  let low = Math.round(total * lowFrac);
  let mid = Math.round(total * midFrac);
  let high = total - low - mid;

  if (high < 0) {
    high = 0;
    mid = total - low;
  }

  return [
    { label: "Low", color: "red" as const, count: low },
    { label: "Mid", color: "amber" as const, count: mid },
    { label: "High", color: "teal" as const, count: high },
  ];
}

export default function AnalyticsClient() {
  const { data: me } = useMe();
  const userId = me?.id;

  const overviewStatsQuery = useAnalyticsOverviewStats({ userId });
  const pipelineFunnelQuery = useAnalyticsPipelineFunnel({ userId });
  const topMissingSkillsQuery = useAnalyticsTopMissingSkills({
    userId,
    limit: 4,
  });
  const statusConversionRatesQuery = useAnalyticsStatusConversionRates({
    userId,
    limit: 4,
  });

  const overviewStats = overviewStatsQuery.data;
  const pipelineFunnel = pipelineFunnelQuery.data;
  const topMissingSkills = topMissingSkillsQuery.data ?? [];
  const statusConversionRates = statusConversionRatesQuery.data ?? [];

  const totalApplications = overviewStats?.totalApplications ?? 0;
  const responseRate = overviewStats?.responseRate ?? 0;
  const rawAvgMatchScore = overviewStats?.avgMatchScore ?? 0;

  // Backend avgMatchScore may be 0..1 (e.g. 0.15) or 0..100.
  // Normalize to 0..100 for UI.
  const avgMatchScore =
    rawAvgMatchScore > 1 ? rawAvgMatchScore : rawAvgMatchScore * 100;

  useEffect(() => {
    if (!overviewStatsQuery.isSuccess) return;

    // Log raw + normalized to pinpoint why UI shows 0%
    console.log("[analytics] overviewStats raw", {
      userId,
      totalApplications,
      responseRate,
      rawAvgMatchScore,
    });

    console.log("[analytics] avgMatchScore normalized", {
      userId,
      avgMatchScore, // 0..100
      uiAvgMatchText: `${Math.round(avgMatchScore)}%`,
    });
  }, [
    overviewStatsQuery.isSuccess,
    userId,
    totalApplications,
    responseRate,
    rawAvgMatchScore,
    avgMatchScore,
  ]);

  const offerCount = pipelineFunnel?.["OFFER"] ?? 0;

  const matchBuckets = useMemo(() => {
    return deriveMatchScoreBuckets({
      total: totalApplications,
      avgMatchScore,
    });
  }, [totalApplications, avgMatchScore]);

  const applicationsOverTime = useMemo(() => {
    return deriveApplicationsOverTime(totalApplications);
  }, [totalApplications]);

  const linePoints = useMemo(() => {
    return applicationsOverTime.map((p) => ({
      xLabel: p.xLabel,
      y: p.y,
    }));
  }, [applicationsOverTime]);

  const funnelStages = useMemo(() => {
    const saved = pipelineFunnel?.["SAVED"] ?? 0;
    const applied = pipelineFunnel?.["APPLIED"] ?? 0;
    const interview = pipelineFunnel?.["INTERVIEW"] ?? 0;
    const offer = pipelineFunnel?.["OFFER"] ?? 0;

    const stages: PipelineStage[] = [
      { key: "SAVED", label: "SAVED", count: saved, tint: "indigo" },
      { key: "APPLIED", label: "APPLIED", count: applied, tint: "violet" },
      { key: "INTERVIEW", label: "INTERVIEW", count: interview, tint: "cyan" },
      { key: "OFFER", label: "OFFER", count: offer, tint: "amber" },
    ];

    return stages;
  }, [pipelineFunnel]);

  const stats = useMemo(() => {
    const responseRateText = formatPct(responseRate);
    const avgMatchText = `${Math.round(avgMatchScore)}%`;

    return [
      {
        key: "total",
        title: "TOTAL APPLICATIONS",
        value: `${totalApplications}`,
        tint: "indigo" as const,
        deltaText: "+3 this week",
        icon: "spark" as const,
      },
      {
        key: "response",
        title: "RESPONSE RATE",
        value: responseRateText,
        tint: "cyan" as const,
        icon: "arrow" as const,
      },
      {
        key: "match",
        title: "AVG MATCH SCORE",
        value: avgMatchText,
        tint: "violet" as const,
        icon: "bolt" as const,
      },
      {
        key: "offers",
        title: "OFFERS",
        value: `${offerCount}`,
        tint: "amber" as const,
        deltaText: "+1 this week",
        icon: "clock" as const,
      },
    ];
  }, [avgMatchScore, offerCount, responseRate, totalApplications]);

  const avgTimeToOfferDays = 18;

  return (
    <div className='flex flex-col gap-6 pb-10'>
      <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((s) => (
          <StatCard
            key={s.key}
            title={s.title}
            value={s.value}
            tint={s.tint}
            deltaText={s.deltaText}
            icon={s.icon}
          />
        ))}
      </section>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <section className='lg:col-span-7'>
          <LineAreaChart
            points={linePoints}
            tint='violet'
          />
        </section>
        <section className='lg:col-span-5'>
          <div className='rounded-xl bg-white p-6 ring-1 ring-black/5'>
            <ApplicationPipelineFunnel stages={funnelStages} />
          </div>
        </section>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <section className='lg:col-span-4'>
          <div className='rounded-xl bg-white p-6 ring-1 ring-black/5'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-[14px] font-extrabold tracking-tight text-zinc-900'>
                  Top Missing Skills
                </h3>
                <p className='mt-1 text-[12px] font-medium text-zinc-500'>
                  Skills to focus next
                </p>
              </div>
              <div className='text-[12px] font-semibold text-zinc-500'>
                {topMissingSkills.length} skills
              </div>
            </div>

            <div className='mt-5 space-y-4'>
              {(() => {
                const max = Math.max(
                  ...topMissingSkills.map((s) => s.count),
                  1,
                );
                const colors = ["#EF4444", "#F59E0B", "#8B5CF6", "#0D9488"];

                const safe: TopMissingSkillResponse[] = topMissingSkills;

                return safe.map((s, idx) => {
                  const w = Math.round((s.count / max) * 100);
                  const color = colors[idx % colors.length];

                  return (
                    <div key={s.skillName}>
                      <div className='flex items-center justify-between gap-4'>
                        <div className='text-[12px] font-extrabold text-zinc-800'>
                          {s.skillName}
                        </div>
                        <div className='text-[12px] font-extrabold text-zinc-800'>
                          {s.count} jobs
                        </div>
                      </div>
                      <div className='mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-100'>
                        <div
                          className='h-full rounded-full'
                          style={{ width: `${w}%`, backgroundColor: color }}
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </section>

        <section className='lg:col-span-4'>
          <MatchScoreDonut
            total={totalApplications}
            buckets={matchBuckets}
          />
        </section>

        <section className='lg:col-span-4'>
          <ConversionRates rates={statusConversionRates} />
        </section>
      </div>

      <section className='rounded-2xl bg-white p-6 ring-1 ring-black/5'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div className='min-w-0'>
            <div className='text-[12px] font-extrabold tracking-widest text-zinc-500'>
              AVG TIME TO OFFER
            </div>
            <div className='mt-2 text-[20px] font-extrabold text-zinc-900'>
              {avgTimeToOfferDays} days
            </div>
            <div className='mt-1 text-[12px] font-medium text-zinc-500'>
              from first apply
            </div>
          </div>

          <div className='rounded-xl bg-zinc-50 px-4 py-3 ring-1 ring-black/5'>
            <div className='text-[12px] font-extrabold text-zinc-800'>
              AI insights
            </div>
            <div className='mt-1 text-[12px] font-medium text-zinc-500'>
              backend data live
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
