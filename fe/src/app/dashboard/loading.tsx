import React from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-black/5 ring-1 ring-black/5 ${className}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <DashboardShell pageTitle='Dashboard'>
      <div className='flex flex-col gap-6 pb-10'>
        {/* Stat cards skeleton */}
        <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, idx) => (
            <article
              key={idx}
              className='group relative overflow-hidden rounded-2xl bg-[#0f1011] border border-[#23252a] p-5 ring-1 ring-[#23252a]/60 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='h-[11px] w-[70%] animate-pulse rounded bg-black/10' />
                  <div className='mt-2 h-[40px] w-[55%] animate-pulse rounded bg-black/10' />
                </div>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-black/0 ring-1 ring-black/10'>
                  <div className='h-[22px] w-[22px] animate-pulse rounded bg-black/10' />
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* AI Spotlight + below sections */}
        <div className='flex flex-col gap-6'>
          {/* AI Spotlight (full row) */}
          <section className='col-span-12 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <div className='h-5 w-[45%] animate-pulse rounded bg-black/10' />
                <div className='mt-2 h-[14px] w-[60%] animate-pulse rounded bg-black/10' />
              </div>
              <div className='h-9 w-[90px] animate-pulse rounded-xl bg-black/5 ring-1 ring-black/5' />
            </div>

            <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3'>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className='rounded-2xl border border-[#23252a] bg-[#0f1011] p-4'
                >
                  <div className='h-4 w-[70%] animate-pulse rounded bg-black/10' />
                  <div className='mt-2 h-3 w-[55%] animate-pulse rounded bg-black/10' />

                  <div className='mt-4 space-y-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-2'>
                        <div className='h-12 w-12 animate-pulse rounded-2xl bg-black/5 ring-1 ring-black/5' />
                      </div>
                      <div className='h-7 w-[92px] animate-pulse rounded-full bg-black/5 ring-1 ring-black/5' />
                    </div>

                    <SkeletonBlock className='h-[86px]' />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className='grid grid-cols-12 gap-6'>
            {/* QuickActions (md:col-span-4) */}
            <section className='col-span-12 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)] md:col-span-4'>
              <div className='h-5 w-[55%] animate-pulse rounded bg-black/10' />
              <div className='mt-2 h-3 w-[70%] animate-pulse rounded bg-black/10' />

              <div className='mt-5 grid grid-cols-2 gap-3'>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonBlock
                    key={idx}
                    className='h-[40px] rounded-xl bg-black/5'
                  />
                ))}
              </div>

              <div className='mt-4 h-[70px] w-full rounded-xl border border-[#23252a] bg-[#0f1011]' />
            </section>

            {/* RecentActivity (md:col-span-8) */}
            <section className='col-span-12 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)] md:col-span-8'>
              <div className='h-5 w-[45%] animate-pulse rounded bg-black/10' />
              <div className='mt-2 h-3 w-[60%] animate-pulse rounded bg-black/10' />

              <div className='mt-5 space-y-3'>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className='flex items-center gap-3 py-4'
                  >
                    <div className='h-10 w-10 animate-pulse rounded-2xl bg-black/5 ring-1 ring-black/5' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-3 w-[65%] animate-pulse rounded bg-black/10' />
                      <div className='h-3 w-[45%] animate-pulse rounded bg-black/10' />
                    </div>
                    <div className='h-8 w-[90px] animate-pulse rounded-full bg-black/5 ring-1 ring-black/5' />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Upcoming deadlines skeleton */}
        <section className='rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'>
          <div className='flex items-center justify-between gap-4'>
            <SkeletonBlock className='h-[28px] w-[45%] rounded-2xl bg-black/5' />
            <SkeletonBlock className='h-[28px] w-[25%] rounded-2xl bg-black/5' />
          </div>

          <div className='mt-5 space-y-3'>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className='flex items-center gap-3'
              >
                <div className='h-10 w-10 animate-pulse rounded-xl bg-black/5 ring-1 ring-[#23252a]' />
                <div className='flex-1 space-y-2'>
                  <div className='h-3 w-[65%] animate-pulse rounded bg-black/10' />
                  <div className='h-3 w-[45%] animate-pulse rounded bg-black/10' />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
