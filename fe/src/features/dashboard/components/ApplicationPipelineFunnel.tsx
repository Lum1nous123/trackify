import React from "react";
import type { PipelineStage } from "../mock/mockData";
import type { Tint } from "../utils/tints";

const tintBarClasses = (tint: Tint) => {
  // Mục tiêu:
  // - màu sáng, bão hoà (không dùng /25 /30 để tránh “đục/muddy”)
  // - bỏ border/ring
  // - chữ tương phản rõ ràng để đọc tốt trên nền dark
  switch (tint) {
    case "indigo":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "bg-indigo-500",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-zinc-50",
        count: "text-zinc-50",
        focusRing: "",
      };
    case "violet":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "bg-violet-500",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-zinc-50",
        count: "text-zinc-50",
        focusRing: "",
      };
    case "cyan":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "bg-cyan-500",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-zinc-50",
        count: "text-zinc-50",
        focusRing: "",
      };
    case "amber":
      return {
        bar: [
          "flex h-[44px] items-center justify-between rounded-lg px-5",
          "bg-amber-400",
        ].join(" "),
        label: "text-[11px] font-extrabold tracking-widest text-zinc-900",
        count: "text-zinc-900",
        focusRing: "",
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
