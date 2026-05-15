import React from "react";
import type { PipelineStage } from "../mock/mockData";
import { TINTS, type Tint } from "../utils/tints";

const tintBarClasses = (tint: Tint) => {
  // Nặng màu hơn để dễ nhìn (pipeline cần tương phản rõ hơn StatCards).
  // Không dùng trực tiếp TINTS.bgSoft/text vì đang quá nhạt.
  switch (tint) {
    case "indigo":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "border-2 shadow-[0_12px_30px_rgba(99,102,241,0.14)] ring-1",
          "bg-indigo-500/25",
          "border-indigo-600/55",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-indigo-900",
        count: "text-indigo-900",
        focusRing: "ring-indigo-500/35",
      };
    case "violet":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "border-2 shadow-[0_12px_30px_rgba(139,92,246,0.14)] ring-1",
          "bg-violet-500/25",
          "border-violet-600/55",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-violet-900",
        count: "text-violet-900",
        focusRing: "ring-violet-500/35",
      };
    case "cyan":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "border-2 shadow-[0_12px_30px_rgba(0,201,255,0.14)] ring-1",
          "bg-cyan-500/25",
          "border-cyan-600/55",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-cyan-900",
        count: "text-cyan-900",
        focusRing: "ring-cyan-500/35",
      };
    case "amber":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "border-2 shadow-[0_12px_30px_rgba(245,158,11,0.18)] ring-1",
          "bg-amber-400/30",
          "border-amber-600/55",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-amber-900",
        count: "text-amber-900",
        focusRing: "ring-amber-500/40",
      };
    default: {
      const _exhaustive: never = tint;
      return _exhaustive;
    }
  }
};

export function ApplicationPipelineFunnel({
  stages,
}: {
  stages: PipelineStage[];
}) {
  const total = stages.length;

  return (
    <div>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-[16px] font-extrabold tracking-tight text-zinc-900'>
            Application Pipeline
          </h2>
          <p className='mt-1 text-[12px] font-medium text-zinc-500'>
            Track the journey from saved to offer.
          </p>
        </div>

        <div className='flex items-center justify-end gap-2 text-zinc-500'>
          <button
            type='button'
            aria-label='More pipeline options'
            className='rounded-lg px-2 py-1 hover:bg-black/5'
          >
            <span aria-hidden='true'>⋯</span>
          </button>
        </div>
      </div>

      {/* Funnel (Saved -> Offer) */}
      <div className='mt-6 flex flex-col items-center gap-3 pb-1'>
        {stages.map((stage, idx) => {
          const { bar, label, count, focusRing } = tintBarClasses(stage.tint);

          // Width decreases as we go deeper (matches the screenshot funnel feel).
          const widthPct =
            total <= 1 ? 100 : Math.max(26, 100 - (idx * 70) / (total - 1));

          return (
            <div
              key={stage.key}
              className='relative flex w-full items-center justify-center'
              aria-label={`${stage.label}: ${stage.count}`}
            >
              <div
                className={bar}
                style={{ width: `${widthPct}%` }}
              >
                <div className={label}>{stage.label}</div>
                <div className='flex items-center gap-2'>
                  <span
                    className={["text-[13px] font-extrabold", count].join(" ")}
                  >
                    {stage.count}
                  </span>
                  {/* subtle focus ring token for consistent tint */}
                  <span
                    className={["hidden", focusRing].join(" ")}
                    aria-hidden='true'
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className='mt-6 flex w-full items-center gap-3'>
          <div className='h-px flex-1 bg-black/5' />
          <div className='text-[11px] font-semibold text-zinc-500'>
            CONVERSION INSIGHTS
          </div>
          <div className='h-px flex-1 bg-black/5' />
        </div>
      </div>
    </div>
  );
}
