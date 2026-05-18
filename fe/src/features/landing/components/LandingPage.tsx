"use client";

import type React from "react";
import Link from "next/link";
import LogoSvg from "@/app/logo/LogoSvg";
import { useState } from "react";

function PrimaryButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className='inline-flex items-center justify-center rounded-md bg-[#5e6ad2] px-[14px] py-[8px] text-[14px] font-medium text-[#ffffff] transition-colors hover:bg-[#828fff] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className='inline-flex items-center justify-center rounded-md border border-[#23252a] bg-[#0f1011] px-[14px] py-[8px] text-[14px] font-medium text-[#f7f8f8] transition-colors hover:bg-[#141516] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
    >
      {children}
    </Link>
  );
}

function TinyPill({ children }: { children: React.ReactNode }) {
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-[#23252a] bg-[#0f1011] px-4 py-2 text-[12px] font-medium text-[#d0d6e0]'>
      <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
      {children}
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className='text-[13px] font-medium tracking-[0.4px] text-[#d0d6e0]'>
      {children}
    </div>
  );
}

function Headline({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-semibold text-[#f7f8f8] ${className}`}
      style={{ letterSpacing: "-0.6px" }}
    >
      {children}
    </h2>
  );
}

function DisplayXL({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className='font-semibold text-[#f7f8f8] leading-[1.05]'
      style={{ letterSpacing: "-3.0px", fontSize: "80px" }}
    >
      {children}
    </h1>
  );
}

function DisplayXLResponsive({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className='font-semibold text-[#f7f8f8] leading-[1.05]'
      style={{
        letterSpacing: "-3.0px",
        fontSize: "clamp(36px, 6.2vw, 80px)",
      }}
    >
      {children}
    </h1>
  );
}

function FakeDashboardMock() {
  return (
    <div className='rounded-[16px] border border-[#23252a] bg-[#0f1011] p-4'>
      <div className='flex items-center justify-between rounded-[12px] border border-[#23252a] bg-[#141516] px-4 py-3'>
        <div className='flex items-center gap-3'>
          <div className='h-2 w-2 rounded-full bg-[#5e6ad2]' />
          <div className='h-2 w-2 rounded-full bg-[#f7f8f8]/50' />
          <div className='h-2 w-2 rounded-full bg-[#f7f8f8]/20' />
        </div>
        <div className='text-[12px] font-semibold text-[#d0d6e0]'>
          Applications / Pipeline
        </div>
      </div>

      <div className='mt-4 grid grid-cols-12 gap-3'>
        <div className='col-span-7 rounded-[12px] border border-[#23252a] bg-[#0f1011] p-3'>
          <div className='flex items-center justify-between'>
            <div className='text-[12px] font-semibold text-[#f7f8f8]'>
              Application stages
            </div>
            <div className='text-[12px] font-semibold text-[#d0d6e0]'>
              AI context
            </div>
          </div>
          <div className='mt-3 grid grid-cols-4 gap-2'>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className='h-9 rounded-[10px] border border-[#23252a] bg-[#141516]'
              />
            ))}
          </div>
          <div className='mt-3 h-24 rounded-[12px] border border-[#23252a] bg-[#141516]' />
        </div>

        <div className='col-span-5 rounded-[12px] border border-[#23252a] bg-[#0f1011] p-3'>
          <div className='text-[12px] font-semibold text-[#f7f8f8]'>
            Skill match
          </div>

          <div className='mt-2 space-y-2'>
            {[
              { label: "React", value: 72 },
              { label: "SQL", value: 61 },
              { label: "System design", value: 84 },
            ].map((row) => (
              <div
                key={row.label}
                className='rounded-[10px] border border-[#23252a] bg-[#141516] p-2'
              >
                <div className='flex items-center justify-between text-[11px]'>
                  <span className='font-semibold text-[#d0d6e0]'>
                    {row.label}
                  </span>
                  <span className='font-semibold text-[#f7f8f8]'>
                    {row.value}%
                  </span>
                </div>
                <div className='mt-2 h-2 overflow-hidden rounded-full bg-[#23252a]'>
                  <div
                    className='h-full rounded-full bg-[#5e6ad2]'
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className='mt-3 rounded-[12px] border border-[#23252a] bg-[#141516] p-3'>
            <div className='text-[11px] font-semibold text-[#8a8f98]'>
              AI match score
            </div>
            <div className='mt-1 text-[28px] font-semibold text-[#f7f8f8]'>
              8.9
            </div>
            <div className='text-[11px] font-semibold text-[#d0d6e0]'>
              Good fit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  tag,
  children,
}: {
  title: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6'>
      <div className='flex items-center justify-between'>
        <div className='text-[16px] font-semibold text-[#f7f8f8]'>{title}</div>
        <div className='rounded-full border border-[#23252a] bg-[#141516] px-3 py-1 text-[12px] font-semibold text-[#d0d6e0]'>
          {tag}
        </div>
      </div>
      <div className='mt-3 text-[14px] leading-6 text-[#d0d6e0]'>
        {children}
      </div>
      <div className='mt-4 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]'>
        <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
        Designed for signal density.
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className='min-h-screen bg-[#010102] text-[#f7f8f8]'>
      <header className='sticky top-0 z-40 relative h-[56px] border-b border-[#23252a] bg-[#010102]/90'>
        <div className='mx-auto flex h-full max-w-[1280px] items-center justify-between px-6'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 text-[#5e6ad2] [&>svg]:h-full [&>svg]:w-full'>
              <LogoSvg />
            </div>

            <div className='leading-none'>
              <div
                className='text-[16px] font-semibold'
                style={{ letterSpacing: "-0.3px" }}
              >
                Trackify
              </div>
              <div className='text-[12px] font-semibold text-[#8a8f98]'>
                Job tracking + AI match analysis
              </div>
            </div>
          </div>

          <nav className='hidden items-center gap-3 md:flex'>
            <Link
              href='/#how-it-works'
              className='rounded-md px-3 py-2 text-[14px] font-medium text-[#d0d6e0] transition-colors hover:bg-[#141516] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
            >
              How it works
            </Link>
            <Link
              href='/#pricing'
              className='rounded-md px-3 py-2 text-[14px] font-medium text-[#d0d6e0] transition-colors hover:bg-[#141516] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
            >
              Pricing
            </Link>
          </nav>

          <div className='hidden items-center gap-3 md:flex'>
            <Link
              href='/login'
              className='rounded-md border border-[#23252a] bg-[#0f1011] px-[14px] py-[8px] text-[14px] font-medium text-[#f7f8f8] transition-colors hover:bg-[#141516] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
            >
              Login
            </Link>
            <PrimaryButton href='/register'>Get started</PrimaryButton>
          </div>

          <button
            type='button'
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls='trackify-mobile-menu'
            className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] md:hidden focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <path
                d='M4 7H20'
                stroke='#f7f8f8'
                strokeWidth='2'
                strokeLinecap='round'
              />
              <path
                d='M4 12H20'
                stroke='#f7f8f8'
                strokeWidth='2'
                strokeLinecap='round'
              />
              <path
                d='M4 17H20'
                stroke='#f7f8f8'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div
            id='trackify-mobile-menu'
            className='absolute left-0 right-0 top-[56px] bg-[#010102] px-6 pb-6 pt-4 md:hidden'
          >
            <div className='mx-auto max-w-[1280px] rounded-[16px] border border-[#23252a] bg-[#0f1011] p-4'>
              <div className='space-y-2'>
                <Link
                  href='/#how-it-works'
                  onClick={() => setMenuOpen(false)}
                  className='block rounded-md px-3 py-2 text-[14px] font-medium text-[#d0d6e0] transition-colors hover:bg-[#141516] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
                >
                  How it works
                </Link>
                <Link
                  href='/#pricing'
                  onClick={() => setMenuOpen(false)}
                  className='block rounded-md px-3 py-2 text-[14px] font-medium text-[#d0d6e0] transition-colors hover:bg-[#141516] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
                >
                  Pricing
                </Link>
                <Link
                  href='/login'
                  onClick={() => setMenuOpen(false)}
                  className='mt-2 block rounded-md border border-[#23252a] bg-[#0f1011] px-[14px] py-[8px] text-[14px] font-medium text-[#f7f8f8] transition-colors hover:bg-[#141516] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
                >
                  Login
                </Link>
                <Link
                  href='/register'
                  onClick={() => setMenuOpen(false)}
                  className='block rounded-md bg-[#5e6ad2] px-[14px] py-[8px] text-[14px] font-medium text-[#ffffff] transition-colors hover:bg-[#828fff] focus-visible:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#5e69d1]/50'
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className='mx-auto max-w-[1280px] px-6 pt-10 pb-10'>
          <div className='grid grid-cols-12 gap-10 items-start'>
            <div className='col-span-12 lg:col-span-7'>
              <TinyPill>Job tracking + AI match analysis</TinyPill>

              <div className='mt-6'>
                <DisplayXLResponsive>
                  Track every
                  <br />
                  application.
                  <br />
                  Let AI
                  <br />
                  do the <span className='text-[#5e6ad2]'>analysis.</span>
                </DisplayXLResponsive>
              </div>

              <p
                className='mt-4 max-w-[560px] text-[16px] leading-7 text-[#d0d6e0]'
                style={{ letterSpacing: "-0.05px" }}
              >
                Upload your CV, paste a TopCV job URL, and Trackify returns a
                match score, missing skills, suggested keywords, and a
                structured summary—then keeps your pipeline readable.
              </p>

              <div className='mt-7 flex flex-col gap-3 sm:flex-row sm:items-center'>
                <PrimaryButton href='/register'>Start free</PrimaryButton>
                <SecondaryButton href='/#how-it-works'>
                  See how it works
                </SecondaryButton>
              </div>

              <div className='mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3'>
                {[
                  { label: "Free to start", value: "0" },
                  { label: "AI job score", value: "1" },
                  { label: "Auto pipeline", value: "∞" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className='rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6'
                  >
                    <div className='text-[12px] font-semibold text-[#8a8f98]'>
                      {s.label}
                    </div>
                    <div
                      className='mt-1 text-[32px] font-semibold text-[#5e6ad2]'
                      style={{ letterSpacing: "-0.8px" }}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='col-span-12 lg:col-span-5'>
              <div className='h-[360px] overflow-hidden rounded-[16px] border border-[#23252a] bg-[#0f1011] sm:h-[420px] lg:h-[520px]'>
                <img
                  src='/dashboard-hero.png'
                  alt='Trackify dashboard preview'
                  className='h-full w-full object-contain object-center'
                  loading='eager'
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className='mx-auto max-w-[1280px] px-6 pb-14'>
          <div
            id='how-it-works'
            className='rounded-[16px] border border-[#23252a] bg-[#0f1011] p-8'
          >
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
              <div>
                <SectionEyebrow>What you get</SectionEyebrow>
                <Headline className='mt-2 text-[28px]'>
                  AI that helps you move faster.
                </Headline>
                <p
                  className='mt-2 max-w-[700px] text-[16px] leading-7 text-[#d0d6e0]'
                  style={{ letterSpacing: "-0.05px" }}
                >
                  No messy spreadsheets. No guessing which applications need
                  attention. Trackify produces clear signals and actionable next
                  steps.
                </p>
              </div>

              <div className='flex items-start md:items-end gap-3'>
                <PrimaryButton href='/register'>
                  Create your account
                </PrimaryButton>
              </div>
            </div>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card
                title='AI Match Score'
                tag='Signals'
              >
                Get a score + summary of how well your CV fits the role.
                Designed to help you prioritize.
              </Card>
              <Card
                title='Application Kanban'
                tag='Workflow'
              >
                Track status by stage. Drag and drop cards while Trackify keeps
                context consistent.
              </Card>
              <Card
                title='Auto Insights'
                tag='Action'
              >
                Missing skills and suggested keywords appear automatically after
                analysis—no extra work required.
              </Card>
              <Card
                title='Zero Friction'
                tag='Fast'
              >
                Add a job URL, upload your CV, and you’re done. Caching reduces
                redundant AI calls for the same input.
              </Card>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className='mx-auto max-w-[1280px] px-6 pb-14'>
          <div className='rounded-[16px] border border-[#23252a] bg-[#0f1011] p-8'>
            <SectionEyebrow>Zero Friction Workflow</SectionEyebrow>
            <Headline className='mt-2 text-[28px]'>
              A simple pipeline you’ll actually use.
            </Headline>
            <p
              className='mt-2 max-w-[720px] text-[16px] leading-7 text-[#d0d6e0]'
              style={{ letterSpacing: "-0.05px" }}
            >
              Follow three steps. Trackify handles the rest.
            </p>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              {[
                {
                  n: 1,
                  title: "Upload your CV",
                  body: "Securely store your CV. Use it only to generate job insights.",
                },
                {
                  n: 2,
                  title: "Add job URL (TopCV)",
                  body: "Paste the job link or title. Trackify builds a clean application record.",
                },
                {
                  n: 3,
                  title: "Get score + next steps",
                  body: "AI highlights what’s missing and suggests how to improve your fit.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className='rounded-[12px] border border-[#23252a] bg-[#141516] p-6'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#23252a] bg-[#0f1011]'>
                      <span className='text-[14px] font-semibold text-[#5e6ad2]'>
                        {s.n}
                      </span>
                    </div>
                    <div className='text-[16px] font-semibold text-[#f7f8f8]'>
                      {s.title}
                    </div>
                  </div>
                  <div className='mt-3 text-[14px] leading-7 text-[#d0d6e0]'>
                    {s.body}
                  </div>
                  <div className='mt-4 h-px bg-[#23252a]' />
                  <div className='mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#d0d6e0]'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Context stays attached to each stage.
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-6 rounded-[12px] border border-[#23252a] bg-[#141516] p-6'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
                <div>
                  <div className='text-[12px] font-semibold text-[#d0d6e0]'>
                    Processing demo
                  </div>
                  <div className='mt-1 text-[22px] font-semibold text-[#f7f8f8]'>
                    AI analysis in seconds.
                  </div>
                  <div className='mt-1 text-[14px] leading-6 text-[#d0d6e0]'>
                    Simulated: match score + missing skills + suggested keywords
                    summary.
                  </div>
                </div>

                <div className='w-full md:w-auto overflow-hidden rounded-[12px] border border-[#23252a] bg-[#0f1011]'>
                  <div className='relative h-[210px] w-full'>
                    <img
                      src='/analytics.png'
                      alt='Trackify preview'
                      className='h-full w-full object-cover'
                      style={{ objectPosition: "50% 38%" }}
                      loading='lazy'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className='mx-auto max-w-[1280px] px-6 pb-14'>
          <div
            id='pricing'
            className='rounded-[16px] border border-[#23252a] bg-[#0f1011] p-8'
          >
            <SectionEyebrow>Pricing</SectionEyebrow>
            <Headline className='mt-2 text-[28px]'>
              Simple plans for consistent analysis.
            </Headline>
            <p
              className='mt-2 max-w-[720px] text-[16px] leading-7 text-[#d0d6e0]'
              style={{ letterSpacing: "-0.05px" }}
            >
              Trackify caches results to reduce redundant AI calls for the same
              CV + job URL inputs.
            </p>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6'>
                <div className='text-[13px] font-semibold text-[#8a8f98]'>
                  Starter
                </div>
                <div className='mt-3 text-[36px] font-semibold text-[#f7f8f8]'>
                  $0
                </div>
                <div className='mt-1 text-[14px] font-semibold text-[#8a8f98]'>
                  Free to start
                </div>
                <div className='mt-4 space-y-2 text-[14px] text-[#d0d6e0]'>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Basic tracking
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Limited AI scoring
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Deadline reminders
                  </div>
                </div>
                <div className='mt-6'>
                  <SecondaryButton href='/register'>Start free</SecondaryButton>
                </div>
              </div>

              <div className='rounded-[12px] border border-[#23252a] bg-[#141516] p-6'>
                <div className='text-[13px] font-semibold text-[#8a8f98]'>
                  Recommended
                </div>
                <div className='mt-3 text-[36px] font-semibold text-[#f7f8f8]'>
                  $12
                </div>
                <div className='mt-1 text-[14px] font-semibold text-[#8a8f98]'>
                  / month
                </div>
                <div className='mt-4 space-y-2 text-[14px] text-[#d0d6e0]'>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Full match analysis
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Missing skills + keywords
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Result caching
                  </div>
                </div>
                <div className='mt-6'>
                  <PrimaryButton href='/register'>Get started</PrimaryButton>
                </div>
              </div>

              <div className='rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6'>
                <div className='text-[13px] font-semibold text-[#8a8f98]'>
                  Pro
                </div>
                <div className='mt-3 text-[36px] font-semibold text-[#f7f8f8]'>
                  $24
                </div>
                <div className='mt-1 text-[14px] font-semibold text-[#8a8f98]'>
                  / month
                </div>
                <div className='mt-4 space-y-2 text-[14px] text-[#d0d6e0]'>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Higher throughput
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Priority caching
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
                    Advanced pipeline analytics
                  </div>
                </div>
                <div className='mt-6'>
                  <SecondaryButton href='/register'>Upgrade</SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className='mx-auto max-w-[1280px] px-6 pb-14'>
          <div className='rounded-[16px] border border-[#23252a] bg-[#0f1011] p-8'>
            <SectionEyebrow>FAQ</SectionEyebrow>
            <Headline className='mt-2 text-[28px]'>
              Short answers. No fluff.
            </Headline>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[
                {
                  q: "What inputs does Trackify analyze?",
                  a: "A CV file plus a job URL (TopCV). Trackify extracts signals to compute match score, missing skills, suggested keywords, and a summary.",
                },
                {
                  q: "Does Trackify call AI every time?",
                  a: "No. Results are cached so repeated inputs reuse prior analysis—reducing redundant AI calls.",
                },
                {
                  q: "How do deadlines work?",
                  a: "Trackify supports application deadline reminders so you can keep momentum without manually tracking dates.",
                },
                {
                  q: "Can I edit the pipeline after analysis?",
                  a: "Yes. The pipeline remains your workflow. Trackify keeps AI context attached so stages stay meaningful.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className='rounded-[12px] border border-[#23252a] bg-[#141516] p-6'
                >
                  <div className='text-[16px] font-semibold text-[#f7f8f8]'>
                    {item.q}
                  </div>
                  <div className='mt-2 text-[14px] leading-7 text-[#d0d6e0]'>
                    {item.a}
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='text-[14px] leading-7 text-[#8a8f98]'>
                Want to see Trackify’s analysis output in your own workflow?
              </div>
              <PrimaryButton href='/register'>
                Create your account
              </PrimaryButton>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className='mx-auto max-w-[1280px] px-6 pb-16'>
          <div className='rounded-[16px] border border-[#23252a] bg-[#0f1011] p-10'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
              <div>
                <SectionEyebrow>Ready to track smarter?</SectionEyebrow>
                <div className='mt-2 text-[28px] font-semibold leading-[1.2]'>
                  Join focused applicants with AI match analysis.
                </div>
                <p className='mt-3 text-[16px] leading-7 text-[#d0d6e0]'>
                  Upload your CV, paste a job URL, and get a structured match
                  report with missing skills and keyword suggestions—then manage
                  deadlines with a clean pipeline.
                </p>
              </div>

              <div className='flex flex-col items-start md:items-end gap-4'>
                <PrimaryButton href='/register'>Get started</PrimaryButton>
                <div className='rounded-[12px] border border-[#23252a] bg-[#141516] px-4 py-3 text-[12px] font-semibold text-[#8a8f98]'>
                  No credit card. No spam. Just workflow.
                </div>
              </div>
            </div>
          </div>

          <footer className='mt-10 text-center text-[12px] text-[#8a8f98]'>
            <div className='font-semibold text-[#d0d6e0]'>Trackify</div>
            <div className='mt-1'>
              © {new Date().getFullYear()} — AI job tracker. Built for focus.
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
