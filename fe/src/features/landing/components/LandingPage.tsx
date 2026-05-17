import type React from "react";
import Link from "next/link";
import LogoSvg from "@/app/logo/LogoSvg";

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
      className='inline-flex items-center justify-center rounded-xl bg-indigo-600/90 px-6 py-3 text-sm font-bold text-white shadow-[0_18px_35px_rgba(79,70,229,0.25)] ring-1 ring-white/10 transition hover:bg-indigo-600'
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
      className='inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white/90 shadow-[0_10px_25px_rgba(0,0,0,0.25)] transition hover:bg-white/10'
    >
      {children}
    </Link>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10'>
      <span className='text-sm font-black text-indigo-200'>{n}</span>
    </div>
  );
}

function FakeDashboardMock() {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)]'>
      <div className='flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1226] px-4 py-3'>
        <div className='flex items-center gap-3'>
          <div className='h-2 w-2 rounded-full bg-indigo-400' />
          <div className='h-2 w-2 rounded-full bg-white/50' />
          <div className='h-2 w-2 rounded-full bg-white/20' />
        </div>
        <div className='text-xs font-semibold text-white/70'>
          Analytics / Pipeline
        </div>
      </div>

      <div className='mt-4 grid grid-cols-12 gap-3'>
        <div className='col-span-7 rounded-xl border border-white/10 bg-[#0B1226] p-3'>
          <div className='flex items-center justify-between'>
            <div className='text-xs font-bold text-white'>
              Application stages
            </div>
            <div className='text-xs font-semibold text-indigo-200'>
              AI insight
            </div>
          </div>
          <div className='mt-3 grid grid-cols-4 gap-2'>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className='h-9 rounded-lg bg-white/5 ring-1 ring-white/10'
              />
            ))}
          </div>
          <div className='mt-3 h-24 rounded-xl border border-white/10 bg-white/5' />
        </div>

        <div className='col-span-5 rounded-xl border border-white/10 bg-[#0B1226] p-3'>
          <div className='text-xs font-bold text-white'>Skill match</div>
          <div className='mt-2 space-y-2'>
            {[
              { label: "React", value: 72 },
              { label: "SQL", value: 61 },
              { label: "System design", value: 84 },
            ].map((row) => (
              <div
                key={row.label}
                className='rounded-lg bg-white/5 p-2 ring-1 ring-white/10'
              >
                <div className='flex items-center justify-between text-[11px]'>
                  <span className='font-semibold text-white/80'>
                    {row.label}
                  </span>
                  <span className='font-bold text-indigo-200'>
                    {row.value}%
                  </span>
                </div>
                <div className='mt-2 h-2 overflow-hidden rounded-full bg-white/5'>
                  <div
                    className='h-full rounded-full bg-indigo-500'
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className='mt-3 rounded-xl border border-white/10 bg-white/5 p-3'>
            <div className='text-[11px] font-semibold text-white/70'>
              AI Match Score
            </div>
            <div className='mt-1 text-2xl font-black text-white'>8.9</div>
            <div className='text-[11px] font-semibold text-indigo-200'>
              Good fit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-[#0F172A] text-white'>
      <header className='sticky top-0 z-40 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10'>
              <LogoSvg />
            </div>
            <div className='flex flex-col leading-none'>
              <div className='text-[16px] font-extrabold tracking-tight'>
                Trackify
              </div>
              <div className='text-[11px] font-semibold text-white/60'>
                Job tracking + AI analysis
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              href='/login'
              className='rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/10'
            >
              Login
            </Link>
            <PrimaryButton href='/register'>Get started free</PrimaryButton>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className='mx-auto max-w-6xl px-6 pb-10 pt-10'>
          <div className='grid grid-cols-12 gap-10 items-start'>
            <div className='col-span-12 lg:col-span-7'>
              <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-indigo-200'>
                <span className='h-2 w-2 rounded-full bg-indigo-400' />
                Built for busy job seekers
              </div>

              <h1 className='mt-5 text-[44px] leading-[1.06] font-black tracking-tight'>
                Track every
                <br />
                application.
                <br />
                Let the AI
                <br />
                do the
                <span className='text-indigo-200'> analysis.</span>
              </h1>

              <p className='mt-4 max-w-xl text-sm leading-6 text-white/75'>
                Upload your CV, paste the job link, and Trackify turns your
                applications into clean stages + actionable AI feedback.
              </p>

              <div className='mt-7 flex flex-col sm:flex-row gap-3'>
                <PrimaryButton href='/register'>Start free</PrimaryButton>
                <SecondaryButton href='#how-it-works'>
                  See how it works
                </SecondaryButton>
              </div>

              <div className='mt-7 grid grid-cols-3 gap-3'>
                {[
                  { label: "Free to start", value: "0" },
                  { label: "AI job score", value: "1" },
                  { label: "Auto pipeline", value: "∞" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className='rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.25)]'
                  >
                    <div className='text-xs font-bold text-white/70'>
                      {s.label}
                    </div>
                    <div className='mt-1 text-2xl font-black text-indigo-200'>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='col-span-12 lg:col-span-5'>
              <FakeDashboardMock />
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className='mx-auto max-w-6xl px-6 pb-10'>
          <div
            id='how-it-works'
            className='rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8'
          >
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
              <div>
                <div className='text-xs font-bold text-indigo-200'>
                  What you get
                </div>
                <h2 className='mt-2 text-2xl font-black tracking-tight'>
                  AI that helps you move faster.
                </h2>
                <p className='mt-2 max-w-2xl text-sm text-white/70'>
                  No messy spreadsheets. No guessing which applications to focus
                  on. Just clear signals and next actions.
                </p>
              </div>

              <Link
                href='/register'
                className='inline-flex items-center justify-center rounded-xl bg-indigo-600/90 px-5 py-3 text-sm font-black shadow-[0_18px_35px_rgba(79,70,229,0.25)] ring-1 ring-white/10 transition hover:bg-indigo-600'
              >
                Create your account
              </Link>
            </div>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[
                {
                  title: "AI Match Score",
                  desc: "Get a score + summary of how well your CV fits the job. Designed to help you prioritize.",
                  tag: "Signals",
                },
                {
                  title: "Application Kanban",
                  desc: "Track status by stage. Drag and drop your cards while Trackify keeps context up to date.",
                  tag: "Workflow",
                },
                {
                  title: "Auto Insights",
                  desc: "Trackify highlights missing skills and suggests what to improve—without you doing extra work.",
                  tag: "Action",
                },
                {
                  title: "Zero Friction",
                  desc: "Add a job link, upload your CV, and you’re done. The pipeline stays clean and readable.",
                  tag: "Fast",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className='rounded-2xl border border-white/10 bg-[#0B1226] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.25)]'
                >
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-black'>{card.title}</div>
                    <div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-indigo-200'>
                      {card.tag}
                    </div>
                  </div>
                  <p className='mt-2 text-sm leading-6 text-white/70'>
                    {card.desc}
                  </p>

                  <div className='mt-4 flex items-center gap-2'>
                    <span className='h-2 w-2 rounded-full bg-indigo-400' />
                    <span className='text-xs font-bold text-white/70'>
                      Built for clarity, not noise.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className='mx-auto max-w-6xl px-6 pb-12'>
          <div className='rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8'>
            <div className='text-xs font-bold text-indigo-200'>
              Zero Friction Workflow.
            </div>
            <h2 className='mt-2 text-2xl font-black tracking-tight'>
              A simple pipeline you’ll actually use.
            </h2>
            <p className='mt-2 max-w-2xl text-sm text-white/70'>
              Follow three steps. Trackify handles the rest.
            </p>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              {[
                {
                  n: 1,
                  title: "Upload your CV",
                  body: "Securely store your CV. We only use it to generate job insights.",
                },
                {
                  n: 2,
                  title: "Add job URL",
                  body: "Paste a job link or title. Trackify builds a clean application record.",
                },
                {
                  n: 3,
                  title: "Get score + next steps",
                  body: "AI highlights what’s missing and suggests how to improve your fit.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className='rounded-2xl border border-white/10 bg-[#0B1226] p-5'
                >
                  <div className='flex items-center gap-3'>
                    <NumberBadge n={s.n} />
                    <div className='text-sm font-black'>{s.title}</div>
                  </div>
                  <p className='mt-3 text-sm leading-6 text-white/70'>
                    {s.body}
                  </p>
                  <div className='mt-4 h-px bg-white/10' />
                  <div className='mt-3 flex items-center gap-2 text-xs font-bold text-indigo-200'>
                    <span className='h-2 w-2 rounded-full bg-indigo-400' />
                    Trackify keeps context for every stage.
                  </div>
                </div>
              ))}
            </div>

            {/* Demo card */}
            <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div>
                  <div className='text-xs font-bold text-indigo-200'>
                    Processing demo
                  </div>
                  <div className='mt-1 text-lg font-black'>
                    AI analysis in seconds.
                  </div>
                  <div className='mt-1 text-sm text-white/70'>
                    Watch Trackify build your score + missing skills summary.
                  </div>
                </div>

                <div className='rounded-2xl border border-white/10 bg-[#0B1226] p-4 w-full md:w-auto'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10'>
                      <svg
                        width='22'
                        height='22'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        aria-hidden='true'
                      >
                        <path
                          d='M12 2C8.1 2 5 5.1 5 9c0 5.4 7 13 7 13s7-7.6 7-13c0-3.9-3.1-7-7-7Z'
                          stroke='#A5B4FC'
                          strokeWidth='2'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M9.5 9.5h5'
                          stroke='#A5B4FC'
                          strokeWidth='2'
                          strokeLinecap='round'
                        />
                        <path
                          d='M12 7v5'
                          stroke='#A5B4FC'
                          strokeWidth='2'
                          strokeLinecap='round'
                        />
                      </svg>
                    </div>
                    <div>
                      <div className='text-sm font-black'>
                        Processing. Analysis…
                      </div>
                      <div className='text-xs font-bold text-white/70'>
                        Simulated for landing.
                      </div>
                    </div>
                  </div>
                  <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10'>
                    <div className='h-full w-[65%] rounded-full bg-indigo-500' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='mx-auto max-w-6xl px-6 pb-16'>
          <div className='relative overflow-hidden rounded-3xl border border-indigo-200/30 bg-[#111A35] p-6 md:p-10 shadow-[0_40px_120px_rgba(79,70,229,0.20)]'>
            <div className='absolute inset-0 pointer-events-none'>
              <div className='absolute -top-28 -left-28 h-64 w-64 rounded-full bg-indigo-500/10 ring-1 ring-indigo-300/20' />
              <div className='absolute -bottom-28 -right-28 h-64 w-64 rounded-full bg-white/5 ring-1 ring-white/10' />
            </div>

            <div className='relative flex flex-col md:flex-row md:items-center md:justify-between gap-8'>
              <div>
                <div className='text-xs font-bold text-indigo-200'>
                  Ready to land your next job?
                </div>
                <h2 className='mt-2 text-2xl md:text-3xl font-black tracking-tight'>
                  Join thousands of focused applicants.
                </h2>
                <p className='mt-3 max-w-2xl text-sm text-white/75'>
                  Trackify turns messy applications into a readable
                  pipeline—plus AI insights that help you improve.
                </p>
              </div>

              <div className='flex flex-col items-start sm:items-end gap-3'>
                <PrimaryButton href='/register'>
                  Create free account
                </PrimaryButton>
                <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/70'>
                  No credit card. No spam. Just workflow.
                </div>
              </div>
            </div>
          </div>

          <footer className='mt-10 text-center text-xs text-white/50'>
            <div className='font-semibold'>Trackify</div>
            <div>
              © {new Date().getFullYear()} — AI job tracker. Built for focus.
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
