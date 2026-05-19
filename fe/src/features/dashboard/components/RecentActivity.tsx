import React from "react";
import type { ActivityItem } from "../mock/mockData";
import { TINTS, type Tint } from "../utils/tints";

function tintToPill(tint: Tint) {
  const t = TINTS[tint];
  return {
    bg: t.bgSoft,
    text: t.text,
    ring: t.ring,
  };
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-[16px] font-extrabold tracking-tight text-[#f7f8f8]'>
            Recent Activity
          </h2>
          <p className='mt-1 text-[12px] font-medium text-[#d0d6e0]'>
            Latest updates across your applications.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='rounded-lg px-2 py-1 hover:bg-[#141516]'
            aria-label='More activity options'
          >
            <span aria-hidden='true'>⋯</span>
          </button>
        </div>
      </div>

      <div className='mt-5 divide-y divide-[#23252a]'>
        {items.map((item) => {
          const pill = tintToPill(item.tint);
          return (
            <div
              key={item.id}
              className='flex items-start gap-3 py-4'
            >
              <div
                className='flex h-10 w-10 items-center justify-center rounded-md ring-1 ring-[#23252a] bg-[#0f1011] overflow-hidden'
                aria-hidden='true'
              >
                {item.companyLogoUrl ? (
                  <img
                    src={item.companyLogoUrl}
                    alt={item.name ? `${item.name} logo` : "Company logo"}
                    className='h-full w-full object-contain'
                    loading='lazy'
                  />
                ) : (
                  <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                    {item.initials}
                  </div>
                )}
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='truncate text-[13px] font-semibold text-[#f7f8f8]'>
                      {item.name}
                    </div>
                    <div className='truncate text-[12px] text-[#d0d6e0]'>
                      {item.company}
                    </div>
                  </div>

                  <div
                    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${pill.text} ring-1 ${pill.ring}`}
                    style={{ backgroundColor: "transparent" }}
                  >
                    {item.statusText}
                  </div>
                </div>

                <div className='mt-2 text-[12px] text-[#8a8f98]'>
                  {item.whenText}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
