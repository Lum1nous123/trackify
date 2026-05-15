import React from "react";
import type { DeadlineItem } from "../mock/mockData";
import { TINTS, type Tint } from "../utils/tints";

function pillFor(tint: Tint) {
  const t = TINTS[tint];
  return {
    text: t.text,
    ring: t.ring,
    bgSoft: t.bgSoft,
  };
}

export function UpcomingDeadlines({ items }: { items: DeadlineItem[] }) {
  return (
    <section className='mt-2 rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_35px_rgba(15,23,42,0.06)]'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-[16px] font-extrabold tracking-tight text-zinc-900'>
            Upcoming Deadlines
          </h2>
          <p className='mt-1 text-[12px] font-medium text-zinc-500'>
            Keep an eye on what’s next.
          </p>
        </div>

        <button
          type='button'
          className='rounded-lg px-3 py-2 text-[12px] font-semibold text-zinc-600 hover:bg-black/5'
          aria-label='View all deadlines'
        >
          View all
        </button>
      </div>

      <div className='mt-6 overflow-x-auto pb-2'>
        <div className='flex min-w-max gap-4'>
          {items.map((item) => {
            const pill = pillFor(item.urgencyTint);

            return (
              <article
                key={item.id}
                className='w-[220px] shrink-0 rounded-2xl border border-black/10 bg-white p-4'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 ring-1 ring-black/5'>
                      <div className='text-[13px] font-extrabold text-zinc-700'>
                        {item.companyInitial}
                      </div>
                    </div>

                    <div className='mt-3 text-[14px] font-extrabold text-zinc-900'>
                      {item.title}
                    </div>
                    <div className='mt-1 text-[12px] font-medium text-zinc-500'>
                      {item.subtitle}
                    </div>
                  </div>

                  <div
                    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${pill.text} ring-1 ${pill.ring} ${pill.bgSoft} `}
                    style={{ backgroundColor: undefined }}
                  >
                    {item.whenText}
                  </div>
                </div>

                <div className='mt-3 h-px w-full bg-black/5' />

                <div className='mt-3 text-[12px] font-semibold text-zinc-500'>
                  Due for {item.title}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
