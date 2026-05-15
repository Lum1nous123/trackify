"use client";

import React from "react";
import { AuthLogo } from "@/features/auth/components/AuthLogo";

type AuthShellProps = {
  cardTitle: string;
  cardSubtitle?: string;
  cardActions?: React.ReactNode;
  children: React.ReactNode;
  bottomHint: React.ReactNode;
};

export function AuthShell({
  cardTitle,
  cardSubtitle,
  cardActions,
  children,
  bottomHint,
}: AuthShellProps) {
  return (
    <div className='flex min-h-screen w-full flex-col'>
      <div className='flex flex-1 flex-col md:flex-row'>
        {/* Left hero (desktop) */}
        <aside className='hidden w-full shrink-0 flex-col justify-between bg-[#4f46e5]/95 p-10 text-white md:flex md:w-[50%]'>
          <div className='flex items-center'>
            <AuthLogo />
          </div>

          <div>
            <h1 className='max-w-md text-[44px] leading-[1.02] font-extrabold tracking-tight'>
              Track every
              <br />
              application.
            </h1>
            <h2 className='mt-5 text-[38px] leading-[1.05] font-extrabold tracking-tight'>
              Land your dream job.
            </h2>
            <p className='mt-5 max-w-sm text-[14px] leading-6 text-white/90'>
              The ultimate platform for modern professionals to organize their
              job search, manage interviews, and accelerate their career growth.
            </p>
          </div>

          <div className='flex gap-4'>
            <div className='w-[190px] rounded-xl bg-white/15 p-4 ring-1 ring-white/15'>
              <div className='text-[24px] font-extrabold leading-none'>
                15k+
              </div>
              <div className='mt-2 text-[12px] font-medium text-white/85'>
                JOBS TRACKED
              </div>
            </div>
            <div className='w-[190px] rounded-xl bg-white/15 p-4 ring-1 ring-white/15'>
              <div className='text-[24px] font-extrabold leading-none'>92%</div>
              <div className='mt-2 text-[12px] font-medium text-white/85'>
                SUCCESS RATE
              </div>
            </div>
          </div>
        </aside>

        {/* Right card */}
        <section className='flex w-full flex-col items-center justify-center bg-zinc-50 p-6 md:w-[50%] md:p-10'>
          <div className='w-full max-w-md rounded-3xl bg-white p-7 shadow-[0_14px_50px_rgba(0,0,0,0.08)] md:p-9'>
            <div className='flex items-start justify-between'>
              <div>
                <h2 className='text-center text-[22px] font-extrabold tracking-tight text-black md:text-left'>
                  {cardTitle}
                </h2>
                {cardSubtitle ? (
                  <p className='mt-2 text-center text-[13px] leading-5 text-zinc-600 md:text-left'>
                    {cardSubtitle}
                  </p>
                ) : null}
              </div>
              {/* (optional right-side area) */}
            </div>

            <div className='mt-6'>{children}</div>

            {cardActions ? <div className='mt-4'>{cardActions}</div> : null}

            <div className='mt-5 text-center text-[13px] text-zinc-700'>
              {bottomHint}
            </div>
          </div>

          <footer className='mt-8 w-full max-w-md text-center text-[12px] text-zinc-500'>
            © 2024 JobTrackr Inc. All rights reserved.
          </footer>

          <div className='mt-3 hidden w-full max-w-md items-center justify-center gap-8 text-[14px] text-zinc-800 md:flex'>
            <a
              href='#'
              className='underline underline-offset-2'
            >
              Privacy Policy
            </a>
            <a
              href='#'
              className='underline underline-offset-2'
            >
              Terms of Service
            </a>
            <a
              href='#'
              className='underline underline-offset-2'
            >
              Help Center
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
