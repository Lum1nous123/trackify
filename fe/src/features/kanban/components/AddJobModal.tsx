"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Image as ImageIcon,
  Link2,
  Lock,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

type AddJobFormState = {
  companyName: string;
  position: string;

  // tier 2
  jobDescriptionUrl: string;
  jobDescriptionText: string;
  applicationDeadline: string; // yyyy-mm-dd
  companyLogoUrl: string;

  // tier 3
  personalNotes: string;

  // UI
  expandedTier2: boolean;
  expandedTier3: boolean;
};

function isWithinDays(dateValue: string, days: number) {
  if (!dateValue) return false;
  const date = new Date(dateValue + "T00:00:00");
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();

  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

function useEscapeKey(onEscape: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onEscape]);
}

function CompanyLogoPreview({ url }: { url: string }) {
  const trimmed = url.trim();
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (!trimmed) {
      setIsValid(false);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setIsValid(true);
    };
    img.onerror = () => {
      if (cancelled) return;
      setIsValid(false);
    };
    img.src = trimmed;

    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  const initialLetter = useMemo(() => {
    const u = trimmed;
    if (!u) return "J";
    try {
      const host = new URL(u).hostname;
      const parts = host.split(".").filter(Boolean);
      const first = parts[0]?.[0] ?? "J";
      return first.toUpperCase();
    } catch {
      return "J";
    }
  }, [trimmed]);

  if (!trimmed || !isValid) {
    return (
      <div
        className='flex h-[32px] w-[32px] items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200'
        aria-label='Company logo preview placeholder'
        title='Logo preview'
      >
        <span className='text-[12px] font-extrabold text-zinc-400'>
          {initialLetter}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt='Company logo preview'
      className='h-[32px] w-[32px] rounded-full object-cover ring-1 ring-zinc-200'
    />
  );
}

function TextInput({
  label,
  required,
  placeholder,
  value,
  onChange,
  icon,
  rightHint,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  icon: React.ReactNode;
  rightHint?: React.ReactNode;
}) {
  return (
    <label className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <span className='text-[12px] font-extrabold text-zinc-700'>
          {label}
        </span>
        {required ? (
          <span className='text-[12px] font-extrabold text-[#EF4444]'>*</span>
        ) : null}
        {rightHint ? <span className='ml-auto'>{rightHint}</span> : null}
      </div>

      <div className='relative'>
        <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
          {icon}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={[
            "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
            "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
          ].join(" ")}
        />
      </div>
    </label>
  );
}

function TextareaInput({
  label,
  placeholder,
  value,
  onChange,
  rows,
  maxChars,
  aiBadge,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  rows: number;
  maxChars?: number;
  aiBadge?: React.ReactNode;
}) {
  const count = value.length;
  const limit = maxChars ?? 5000;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <span className='text-[12px] font-extrabold text-zinc-700'>
          {label}
        </span>
        <span className='ml-auto'>{aiBadge ?? null}</span>
      </div>

      <div className='relative'>
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, limit))}
          placeholder={placeholder}
          className={[
            "w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
            "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
          ].join(" ")}
        />
        <div className='pointer-events-none absolute right-3 top-3'>
          {aiBadge ?? null}
        </div>
      </div>

      <div className='flex items-center justify-end text-[12px] font-semibold text-zinc-400'>
        {count} / {limit}
      </div>
    </div>
  );
}

export function AddJobModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<AddJobFormState>({
    companyName: "",
    position: "",

    jobDescriptionUrl: "",
    jobDescriptionText: "",
    applicationDeadline: "",
    companyLogoUrl: "",

    personalNotes: "",

    expandedTier2: false,
    expandedTier3: false,
  });

  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const canSave = useMemo(() => {
    return (
      form.companyName.trim().length > 0 && form.position.trim().length > 0
    );
  }, [form.companyName, form.position]);

  const showAiBanner = useMemo(() => {
    return (
      form.jobDescriptionUrl.trim().length > 0 ||
      form.jobDescriptionText.trim().length > 0
    );
  }, [form.jobDescriptionUrl, form.jobDescriptionText]);

  useEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) return;

    // reset each time modal opens
    setForm({
      companyName: "",
      position: "",

      jobDescriptionUrl: "",
      jobDescriptionText: "",
      applicationDeadline: "",
      companyLogoUrl: "",

      personalNotes: "",

      expandedTier2: false,
      expandedTier3: false,
    });

    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const toggleTier2 = () =>
    setForm((s) => ({ ...s, expandedTier2: !s.expandedTier2 }));
  const toggleTier3 = () =>
    setForm((s) => ({ ...s, expandedTier3: !s.expandedTier3 }));

  const onCancel = () => onClose();

  const onSave = () => {
    if (!canSave) return;

    // UI-only placeholder (no backend call)
    toast.success("✅ Job saved to Kanban board");
    onSaved();
    onClose();
  };

  const aiBadge = (
    <span className='inline-flex items-center gap-1 rounded-md bg-indigo-600/10 px-2 py-1 text-[11px] font-extrabold text-[#4f46e5] ring-1 ring-[#4f46e5]/20'>
      <Sparkles
        size={12}
        aria-hidden='true'
      />
      AI ✦
    </span>
  );

  return (
    <div className='fixed inset-0 z-60 flex items-start justify-center bg-black/40 p-4 pt-[120px] md:pt-[150px]'>
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Add new job modal'
        className='w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_rgba(0,0,0,0.12)]'
      >
        {/* Modal content is scrollable */}
        <div className='max-h-[90vh] overflow-y-auto'>
          <div className='relative border-b border-zinc-200 px-6 py-5'>
            <button
              type='button'
              aria-label='Close'
              onClick={onCancel}
              className='absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100'
            >
              <X
                size={18}
                aria-hidden='true'
              />
            </button>

            <div className='flex items-start gap-3 pr-10'>
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-500/20'>
                <Building2
                  size={18}
                  aria-hidden='true'
                  className='text-[#4f46e5]'
                />
              </div>

              <div className='min-w-0'>
                <div className='text-[18px] font-extrabold tracking-tight text-zinc-900'>
                  Add New Job
                </div>
                <div className='mt-1 text-[13px] font-semibold text-zinc-400'>
                  Required fields only to get started. You can fill in more
                  details later.
                </div>
              </div>
            </div>
          </div>

          <div className='px-6 py-5'>
            {/* TIER 1 */}
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <span className='rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-extrabold text-white'>
                  Required
                </span>
                <span className='text-[12px] font-extrabold text-zinc-600'>
                  Get started — just 2 fields
                </span>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <label className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[12px] font-extrabold text-zinc-700'>
                      Company Name
                    </span>
                    <span className='text-[12px] font-extrabold text-[#EF4444]'>
                      *
                    </span>
                  </div>

                  <div className='relative'>
                    <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                      <Building2
                        size={16}
                        aria-hidden='true'
                      />
                    </div>
                    <input
                      ref={firstFieldRef}
                      value={form.companyName}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, companyName: e.target.value }))
                      }
                      placeholder='e.g. Shopee, VNG, Tiki...'
                      className={[
                        "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                        "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                      ].join(" ")}
                    />
                  </div>
                </label>

                <label className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[12px] font-extrabold text-zinc-700'>
                      Position / Role
                    </span>
                    <span className='text-[12px] font-extrabold text-[#EF4444]'>
                      *
                    </span>
                  </div>

                  <div className='relative'>
                    <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                      <Briefcase
                        size={16}
                        aria-hidden='true'
                      />
                    </div>
                    <input
                      value={form.position}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, position: e.target.value }))
                      }
                      placeholder='e.g. Backend Engineer, SWE Intern...'
                      className={[
                        "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                        "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                      ].join(" ")}
                    />
                  </div>
                </label>
              </div>

              <div className='rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='text-[12px] font-extrabold text-zinc-700'>
                    Status
                  </div>
                  <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[12px] font-extrabold text-[#4f46e5] ring-1 ring-[#4f46e5]/10'>
                    <Lock
                      size={14}
                      aria-hidden='true'
                      className='text-[#4f46e5]'
                    />
                    SAVED
                  </div>
                </div>
                <div className='mt-2 text-[12px] font-semibold text-zinc-400'>
                  Auto-set. Change it on the Kanban board later.
                </div>
              </div>
            </div>

            {/* TIER 2 */}
            <div className='mt-5'>
              <div className='flex items-center gap-2'>
                <span className='rounded-full border border-zinc-300 bg-transparent px-3 py-1 text-[11px] font-extrabold text-zinc-600'>
                  Optional
                </span>
                <span className='text-[12px] font-extrabold text-zinc-600'>
                  Job Details
                </span>
              </div>

              <button
                type='button'
                onClick={toggleTier2}
                className='mt-3 flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left hover:bg-zinc-50'
                aria-expanded={form.expandedTier2}
              >
                <span className='flex items-center gap-2 text-[13px] font-extrabold text-[#4f46e5]'>
                  <Plus
                    size={16}
                    aria-hidden='true'
                    className={form.expandedTier2 ? "rotate-45" : ""}
                  />
                  {form.expandedTier2 ? "Hide details" : "+ Add details"}
                </span>
                {form.expandedTier2 ? (
                  <ChevronUp
                    size={18}
                    aria-hidden='true'
                    className='text-zinc-500'
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    aria-hidden='true'
                    className='text-zinc-500'
                  />
                )}
              </button>

              {/* Animated collapse */}
              <div
                className='transition-[max-height] duration-300 ease-in-out overflow-hidden'
                style={{ maxHeight: form.expandedTier2 ? 520 : 0 }}
              >
                <div className='mt-4 flex flex-col gap-4'>
                  {showAiBanner ? (
                    <div className='rounded-xl bg-indigo-600/10 px-4 py-3 ring-1 ring-[#4f46e5]/20'>
                      <div className='flex items-center gap-2 text-[12px] font-extrabold text-[#4f46e5]'>
                        <Sparkles
                          size={14}
                          aria-hidden='true'
                        />
                        ✦ AI will automatically analyze this JD after saving
                      </div>
                    </div>
                  ) : null}

                  <div className='flex flex-col gap-2'>
                    <div className='text-[12px] font-extrabold text-zinc-700'>
                      Job Description URL
                    </div>
                    <div className='relative'>
                      <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                        <Link2
                          size={16}
                          aria-hidden='true'
                        />
                      </div>
                      <input
                        value={form.jobDescriptionUrl}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            jobDescriptionUrl: e.target.value,
                          }))
                        }
                        placeholder='https://careers.company.com/job/...'
                        className={[
                          "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                          "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                        ].join(" ")}
                      />
                      <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                        {aiBadge}
                      </div>
                    </div>
                    <div className='text-[12px] font-semibold text-zinc-400'>
                      Paste the JD link — AI will analyze it later
                    </div>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <TextareaInput
                      label='Paste Job Description (text)'
                      value={form.jobDescriptionText}
                      onChange={(next) =>
                        setForm((s) => ({ ...s, jobDescriptionText: next }))
                      }
                      placeholder="Paste the job description text here if you don't have a URL..."
                      rows={4}
                      maxChars={5000}
                      aiBadge={aiBadge}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-2'>
                      <div className='text-[12px] font-extrabold text-zinc-700'>
                        Application Deadline
                      </div>
                      <div className='relative'>
                        <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                          <CalendarDays
                            size={16}
                            aria-hidden='true'
                          />
                        </div>
                        <input
                          type='date'
                          value={form.applicationDeadline}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              applicationDeadline: e.target.value,
                            }))
                          }
                          className={[
                            "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 text-sm text-zinc-900 outline-none",
                            "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                          ].join(" ")}
                        />
                      </div>

                      {isWithinDays(form.applicationDeadline, 3) ? (
                        <div className='mt-1 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[12px] font-extrabold text-[#D97706] ring-1 ring-[#F59E0B]/20'>
                          ⚠ Deadline soon
                        </div>
                      ) : null}
                    </div>

                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='text-[12px] font-extrabold text-zinc-700'>
                          Company Logo URL
                        </div>
                        <CompanyLogoPreview url={form.companyLogoUrl} />
                      </div>

                      <div className='relative'>
                        <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                          <ImageIcon
                            size={16}
                            aria-hidden='true'
                          />
                        </div>

                        <input
                          value={form.companyLogoUrl}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              companyLogoUrl: e.target.value,
                            }))
                          }
                          placeholder='https://...'
                          className={[
                            "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                            "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                          ].join(" ")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 3 */}
            <div className='mt-5'>
              <div className='flex items-center gap-2'>
                <span className='rounded-full border border-zinc-300 bg-transparent px-3 py-1 text-[11px] font-extrabold text-zinc-600'>
                  Optional
                </span>
                <span className='text-[12px] font-extrabold text-zinc-600'>
                  Notes & Context
                </span>
              </div>

              <button
                type='button'
                onClick={toggleTier3}
                className='mt-3 flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left hover:bg-zinc-50'
                aria-expanded={form.expandedTier3}
              >
                <span className='flex items-center gap-2 text-[13px] font-extrabold text-[#4f46e5]'>
                  <Plus
                    size={16}
                    aria-hidden='true'
                    className={form.expandedTier3 ? "rotate-45" : ""}
                  />
                  {form.expandedTier3 ? "Hide notes" : "+ Add notes"}
                </span>
                {form.expandedTier3 ? (
                  <ChevronUp
                    size={18}
                    aria-hidden='true'
                    className='text-zinc-500'
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    aria-hidden='true'
                    className='text-zinc-500'
                  />
                )}
              </button>

              <div
                className='transition-[max-height] duration-300 ease-in-out overflow-hidden'
                style={{ maxHeight: form.expandedTier3 ? 240 : 0 }}
              >
                <div className='mt-4'>
                  <div className='flex flex-col gap-2'>
                    <div className='text-[12px] font-extrabold text-zinc-700'>
                      Personal Notes
                    </div>
                    <textarea
                      rows={3}
                      value={form.personalNotes}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          personalNotes: e.target.value,
                        }))
                      }
                      placeholder="Referral source, salary range, reasons you're interested, recruiter name..."
                      className={[
                        "w-full resize-y rounded-xl border border-transparent bg-[#F8FAFC] px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                        "focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                      ].join(" ")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='border-t border-zinc-200 px-6 py-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='text-[12px] font-semibold text-zinc-400'>
                💡 You can edit all details after saving
              </div>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={onCancel}
                  className='h-[38px] rounded-xl px-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-100'
                >
                  Cancel
                </button>

                <button
                  type='button'
                  onClick={onSave}
                  disabled={!canSave}
                  className={[
                    "h-[38px] rounded-xl px-4 text-sm font-extrabold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50",
                    canSave ? "bg-[#6366F1]" : "bg-[#6366F1]/80",
                  ].join(" ")}
                >
                  <span className='inline-flex items-center gap-2'>
                    <Check
                      size={16}
                      aria-hidden='true'
                    />
                    Save Job
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
