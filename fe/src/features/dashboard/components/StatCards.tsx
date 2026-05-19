import React from "react";
import { TINTS, type Tint } from "../utils/tints";
import type { DashboardStat } from "../mock/mockData";

function accentClasses(accent: Tint) {
  const t = TINTS[accent];
  return {
    border: t.border,
    bgSoft: t.bgSoft,
    text: t.text,
    ring: t.ring,
  };
}

const StatIcon = ({ accent }: { accent: Tint }) => {
  const t = TINTS[accent];
  return (
    <svg
      className={t.icon}
      width='22'
      height='22'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
    >
      <path
        d='M7 7h10v10H7V7Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinejoin='round'
      />
      <path
        d='M4 4h16v16'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );
};

export function StatCards({ stats }: { stats: DashboardStat[] }) {
  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {stats.map((s) => {
        const a = accentClasses(s.accent);
        return (
          <article
            key={s.key}
            className={`group relative overflow-hidden rounded-2xl bg-[#0f1011] border border-[#23252a] p-5 ring-1 ring-[#23252a]/60 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(35,37,42,0.60),0_12px_35px_rgba(0,0,0,0.24)]`}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <div className='text-[11px] font-extrabold tracking-widest text-[#d0d6e0]'>
                  {s.title}
                </div>
                <div className='mt-2 flex items-baseline gap-2'>
                  <div className='text-[40px] font-black leading-none tracking-tight text-[#f7f8f8]'>
                    {s.value}
                  </div>
                </div>
                {s.deltaText ? (
                  <div className='mt-2 text-[12px] font-medium text-[#8a8f98]'>
                    <span
                      className={`inline-flex items-center gap-1 ${a.text}`}
                    >
                      {s.deltaText}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-black/0 transition-colors group-hover:bg-white/40'>
                <StatIcon accent={s.accent} />
              </div>
            </div>

            <div
              className={`pointer-events-none absolute left-0 top-0 h-full w-1 ${a.border}`}
            />
          </article>
        );
      })}
    </section>
  );
}
