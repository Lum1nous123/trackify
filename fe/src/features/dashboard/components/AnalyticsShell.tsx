import React from "react";
import { SidebarNav } from "./SidebarNav";

export type AnalyticsShellProps = {
  children: React.ReactNode;
};

const BellIcon = () => (
  <svg
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <path
      d='M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z'
      stroke='#64748b'
      strokeWidth='2'
      strokeLinejoin='round'
    />
    <path
      d='M13.73 21a2 2 0 0 1-3.46 0'
      stroke='#64748b'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

const HelpIcon = () => (
  <svg
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <path
      d='M12 18h.01'
      stroke='#64748b'
      strokeWidth='3'
      strokeLinecap='round'
    />
    <path
      d='M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4v.5'
      stroke='#64748b'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <path
      d='M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z'
      stroke='#64748b'
      strokeWidth='2'
    />
  </svg>
);

export function AnalyticsShell({ children }: AnalyticsShellProps) {
  return (
    <div className='min-h-screen bg-[#F8FAFC]'>
      <SidebarNav />

      <div className='flex min-h-screen flex-col ml-[260px]'>
        <header className='sticky top-0 z-10 flex h-[64px] items-center justify-between gap-4 border-b border-black/5 bg-[#F8FAFC] px-8'>
          <div className='min-w-0'>
            <div className='text-[18px] font-bold tracking-tight text-zinc-900'>
              Analytics
            </div>
            <div className='mt-1 text-[12px] font-medium text-zinc-500'>
              Track your job search performance
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              className='rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-semibold text-zinc-700 hover:bg-black/5'
              aria-label='Select time range'
            >
              Last 30 days
            </button>

            <button
              type='button'
              className='rounded-full border border-black/10 bg-white p-2 hover:bg-black/5'
              aria-label='Notifications'
            >
              <BellIcon />
            </button>

            <button
              type='button'
              className='rounded-full border border-black/10 bg-white p-2 hover:bg-black/5'
              aria-label='Help'
            >
              <HelpIcon />
            </button>
          </div>
        </header>

        <main className='flex-1 px-8 py-8'>{children}</main>
      </div>
    </div>
  );
}
