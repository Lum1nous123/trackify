import React from "react";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-black/5 ring-1 ring-black/5 ${className}`}
    />
  );
}

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-black/10 ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <DashboardShell pageTitle='Profile & Settings'>
      <div className='flex flex-col gap-6 pb-10'>
        {/* Top bar */}
        <div className='flex items-center justify-between gap-4'>
          <div className='min-w-0'>
            <SkeletonLine className='h-[14px] w-[320px]' />
            <SkeletonLine className='mt-3 h-[32px] w-[220px]' />
          </div>

          <div className='h-[38px] w-[110px]'>
            <SkeletonBlock className='h-full w-full rounded-xl shadow-none' />
          </div>
        </div>

        {/* Main grid */}
        <div className='grid grid-cols-12 gap-6'>
          {/* Left card */}
          <section className='col-span-12 rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_35px_rgba(15,23,42,0.06)] md:col-span-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <SkeletonBlock className='h-[52px] w-[52px] rounded-full shadow-none' />

                <div className='min-w-0'>
                  <SkeletonLine className='h-[16px] w-[160px]' />
                  <SkeletonLine className='mt-2 h-[12px] w-[210px]' />
                </div>
              </div>

              <div className='hidden' />
            </div>

            <div className='mt-6'>
              <SkeletonLine className='h-[14px] w-[160px]' />

              <div className='mt-4 flex flex-col gap-3'>
                <div className='flex flex-col gap-2'>
                  <SkeletonLine className='h-[12px] w-[90px]' />
                  <SkeletonBlock className='h-[38px] w-full rounded-xl ring-1 ring-black/5' />
                </div>

                <div className='flex flex-col gap-2'>
                  <SkeletonLine className='h-[12px] w-[50px]' />
                  <SkeletonBlock className='h-[38px] w-full rounded-xl ring-1 ring-black/5' />
                </div>

                <div className='flex flex-col gap-2'>
                  <SkeletonLine className='h-[12px] w-[60px]' />
                  <SkeletonBlock className='h-[38px] w-full rounded-xl ring-1 ring-black/5' />
                </div>

                <div className='flex flex-col gap-2'>
                  <SkeletonLine className='h-[12px] w-[90px]' />
                  <SkeletonBlock className='h-[38px] w-full rounded-xl ring-1 ring-black/5' />
                </div>
              </div>
            </div>

            <div className='mt-7'>
              <SkeletonLine className='h-[14px] w-[90px]' />

              <div className='mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4'>
                <SkeletonLine className='h-[12px] w-[130px]' />
                <SkeletonLine className='mt-2 h-[12px] w-[220px]' />

                <SkeletonBlock className='mt-4 h-[36px] w-full rounded-xl ring-1 ring-black/5' />
              </div>
            </div>
          </section>

          {/* Right card */}
          <section className='col-span-12 rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_35px_rgba(15,23,42,0.06)] md:col-span-8'>
            <div className='flex flex-col gap-4'>
              {/* Tabs */}
              <div className='flex flex-wrap gap-3 border-b border-zinc-200 pb-3'>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className='h-[14px] w-[120px] animate-pulse rounded bg-black/10'
                  />
                ))}
              </div>

              {/* Notification tab content skeleton (default in client) */}
              <div className='flex flex-col gap-4'>
                <div>
                  <SkeletonLine className='h-[14px] w-[220px]' />
                  <SkeletonLine className='mt-2 h-[12px] w-[320px]' />
                </div>

                <div className='space-y-3'>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className='flex items-start justify-between gap-4 rounded-xl border border-zinc-100 p-3'
                    >
                      <div className='flex-1'>
                        <SkeletonLine className='h-[12px] w-[180px]' />
                        <SkeletonLine className='mt-2 h-[12px] w-[260px]' />
                      </div>

                      <SkeletonBlock className='h-[22px] w-[42px] rounded-full shadow-none' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
