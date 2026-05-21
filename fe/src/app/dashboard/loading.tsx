import React from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/10 ${className}`} />
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
              className='group relative overflow-hidden rounded-2xl bg-[#0f1011] p-5 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='h-[11px] w-[70%] animate-pulse rounded bg-white/15' />
                  <div className='mt-2 h-[40px] w-[55%] animate-pulse rounded bg-white/15' />
                </div>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/5'>
                  <div className='h-[22px] w-[22px] animate-pulse rounded bg-white/15' />
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* AI Spotlight + below sections */}
        <div className='flex flex-col gap-6'>
          {/* AI Spotlight (full row) */}
          <section className='col-span-12 rounded-2xl bg-[#0f1011] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <div className='h-5 w-[45%] animate-pulse rounded bg-white/15' />
                <div className='mt-2 h-[14px] w-[60%] animate-pulse rounded bg-white/10' />
              </div>
              <div className='h-9 w-[90px] animate-pulse rounded-xl bg-white/5' />
            </div>

            <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3'>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className='rounded-2xl bg-[#0f1011] p-4 shadow-[0_1px_0_rgba(35,37,42,0.30)]'
                >
                  <div className='h-4 w-[70%] animate-pulse rounded bg-white/10' />
                  <div className='mt-2 h-3 w-[55%] animate-pulse rounded bg-white/10' />

                  <div className='mt-4 space-y-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-2'>
                        <div className='h-12 w-12 animate-pulse rounded-2xl bg-white/5' />
                      </div>
                      <div className='h-7 w-[92px] animate-pulse rounded-full bg-white/5' />
                    </div>

                    <SkeletonBlock className='h-[86px] bg-transparent' />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className='grid grid-cols-12 gap-6'>
            {/* QuickActions (md:col-span-4) */}
            <section className='col-span-12 rounded-2xl bg-[#0f1011] p-6 shadow-[0_1px_0_rgba(35,37,42,0.35),0_12px_35px_rgba(0,0,0,0.18)] md:col-span-4'>
              <div className='h-5 w-[55%] animate-pulse rounded bg-white/15' />
              <div className='mt-2 h-3 w-[70%] animate-pulse rounded bg-white/10' />

              <div className='mt-5 grid grid-cols-2 gap-3'>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonBlock
                    key={idx}
                    className='h-[40px] rounded-xl bg-white/8'
                  />
                ))}
              </div>

              <div className='mt-4 h-[70px] w-full rounded-xl bg-white/5' />
            </section>

            {/* RecentActivity (md:col-span-8) */}
            <section className='col-span-12 rounded-2xl bg-[#0f1011] p-6 shadow-[0_1px_0_rgba(35,37,42,0.35),0_12px_35px_rgba(0,0,0,0.18)] md:col-span-8'>
              <div className='h-5 w-[45%] animate-pulse rounded bg-white/15' />
              <div className='mt-2 h-3 w-[60%] animate-pulse rounded bg-white/10' />

              <div className='mt-5 space-y-3'>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className='flex items-center gap-3 py-4'
                  >
                    <div className='h-10 w-10 animate-pulse rounded-2xl bg-white/5' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-3 w-[65%] animate-pulse rounded bg-white/10' />
                      <div className='h-3 w-[45%] animate-pulse rounded bg-white/10' />
                    </div>
                    <div className='h-8 w-[90px] animate-pulse rounded-full bg-white/5' />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Upcoming deadlines skeleton */}
        <section className='mt-2 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.40),0_12px_35px_rgba(0,0,0,0.18)]'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0'>
              <SkeletonBlock className='h-[20px] w-[55%] bg-white/10' />
              <div className='mt-2'>
                <SkeletonBlock className='h-[12px] w-[65%] bg-white/10' />
              </div>
            </div>

            <SkeletonBlock className='h-[32px] w-[88px] rounded-lg bg-white/10' />
          </div>

          <div className='mt-6 overflow-x-auto pb-2'>
            <div className='flex min-w-max gap-4'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className='w-[220px] shrink-0 rounded-2xl bg-[#0f1011] p-4'
                >
                  {/* Top accent bar */}
                  <div className='h-1 w-full animate-pulse rounded-full bg-white/10' />

                  <div className='mt-3 flex items-start justify-between gap-4'>
                    <div className='min-w-0'>
                      <div className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/5'>
                        <div className='h-[26px] w-[26px] animate-pulse rounded-lg bg-white/10' />
                      </div>

                      <div className='mt-3 h-[16px] w-[80%] animate-pulse rounded bg-white/10' />
                      <div className='mt-2 h-[12px] w-[70%] animate-pulse rounded bg-white/10' />
                    </div>

                    {/* Pill */}
                    <div className='h-[28px] w-[110px] animate-pulse rounded-full bg-white/10' />
                  </div>

                  <div className='mt-3 h-px w-full bg-white/5' />

                  <div className='mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]'>
                    <div className='h-4 w-4 animate-pulse rounded bg-white/10' />
                    <div className='h-[12px] w-[70%] animate-pulse rounded bg-white/10' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
