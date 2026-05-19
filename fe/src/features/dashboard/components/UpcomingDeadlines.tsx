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
            const pill = pillFor(item.urgencyTint);

            return (
              <article
                key={item.id}
                className='w-[220px] shrink-0 rounded-2xl border border-[#23252a] bg-[#0f1011] p-4'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <div className='flex h-10 w-10 items-center justify-center rounded-md bg-[#0f1011] ring-1 ring-[#23252a] overflow-hidden'>
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

                    <div className='mt-3 text-[14px] font-extrabold text-[#f7f8f8]'>
                      {item.title}
                    </div>
                    <div className='mt-1 text-[12px] font-medium text-[#d0d6e0]'>
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

                <div className='mt-3 h-px w-full bg-[#23252a]' />

                <div className='mt-3 text-[12px] font-semibold text-[#d0d6e0]'>
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
