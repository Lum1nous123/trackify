import React from "react";
import { SidebarNav } from "./SidebarNav";
import NotificationBell from "@/features/dashboard/components/NotificationBell";

export type DashboardShellProps = {
  pageTitle: string;
  children: React.ReactNode;
};

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <path
      d='M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z'
      stroke='#8a8f98'
      strokeWidth='2'
    />
    <path
      d='M21 21L16.65 16.65'
      stroke='#8a8f98'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

export function DashboardShell({ pageTitle, children }: DashboardShellProps) {
  return (
    <div className='min-h-screen bg-[#010102]'>
      <SidebarNav />

      <div className='flex min-h-screen flex-col ml-[260px]'>
        <header className='sticky top-0 z-10 flex h-[64px] items-center gap-4 border-b border-[#23252a] bg-[#010102] px-8'>
          <div className='min-w-0 flex-1'>
            <div className='text-[18px] font-bold tracking-tight text-[#f7f8f8]'>
              {pageTitle}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='hidden w-[420px] items-center gap-3 rounded-full bg-[#0f1011] px-4 py-2 ring-1 ring-[#23252a] md:flex'>
              <SearchIcon />
              <input
                aria-label='Search applications'
                placeholder='Search applications...'
                className='w-full bg-transparent text-sm text-[#d0d6e0] placeholder:text-[#8a8f98] outline-none'
              />
            </div>

            <NotificationBell />
          </div>
        </header>

        <main className='flex-1 px-8 py-8'>{children}</main>
      </div>
    </div>
  );
}
