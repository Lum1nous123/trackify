"use client";

import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Building2,
  Briefcase,
  CalendarDays,
  Check,
  Image as ImageIcon,
  Link2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import type { JobKanbanCard } from "../types/kanban";
import { useCreateJob, useUpdateJob } from "@/hooks/useJobs";
import { buildClearbitLogoUrl } from "../utils/clearbit";
import {
  getDeadlineTone,
  deadlineBadgeClasses,
  type DeadlineTone,
} from "../utils/deadline";

type Mode = "create" | "edit";
type CreatePhase = 1 | 2;

type FormValuesBase = {
  companyName: string;
  position: string;

  jobDescriptionUrl: string;
  jobDescriptionText: string;
  applicationDeadline: string; // yyyy-mm-dd

  companyLogoUrl: string;
  personalNotes: string;
};

const isNonEmpty = (s: string) => s.trim().length > 0;

const validateUrlIfPresent = (value: string) => {
  if (!value.trim()) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const validateDateIfPresent = (value: string) => {
  if (!value.trim()) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
};

type SchemaVariant = "edit" | "createPhase1" | "createPhase2";

function buildJobFormSchema(variant: SchemaVariant): z.ZodType<FormValuesBase> {
  const base = z.object({
    companyName: z.string(),
    position: z.string(),

    jobDescriptionUrl: z.string(),
    jobDescriptionText: z.string(),

    applicationDeadline: z.string(),
    companyLogoUrl: z.string(),
    personalNotes: z.string(),
  });

  return base.superRefine((val, ctx) => {
    const hasCompanyAndPosition =
      isNonEmpty(val.companyName) && isNonEmpty(val.position);

    const hasJdUrl = isNonEmpty(val.jobDescriptionUrl);
    const hasJdText = isNonEmpty(val.jobDescriptionText);
    const hasJdSource = hasJdUrl || hasJdText;

    if (variant === "edit") {
      if (!hasCompanyAndPosition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name and position are required.",
          path: ["companyName"],
        });
      }
    }

    if (variant === "createPhase1") {
      if (!hasJdUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Job description URL is required.",
          path: ["jobDescriptionUrl"],
        });
      }
    }

    if (variant === "createPhase2") {
      if (!hasCompanyAndPosition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name and position are required.",
          path: ["companyName"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name and position are required.",
          path: ["position"],
        });
      }

      if (!hasJdSource) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide job description URL or paste job description text.",
          path: ["jobDescriptionText"],
        });
      }
    }

    if (!validateUrlIfPresent(val.jobDescriptionUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid job description URL",
        path: ["jobDescriptionUrl"],
      });
    }

    if (!validateUrlIfPresent(val.companyLogoUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid company logo URL",
        path: ["companyLogoUrl"],
      });
    }

    if (!validateDateIfPresent(val.applicationDeadline)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date",
        path: ["applicationDeadline"],
      });
    }
  });
}

type ApiErrorBody = {
  message?: string | null;
  errorCode?: string | null;
};

function extractApiErrorBody(err: unknown): ApiErrorBody | null {
  if (!err || typeof err !== "object") return null;

  const v = err as { response?: { data?: unknown }; message?: unknown };

  const data = v.response?.data as unknown;
  if (!data || typeof data !== "object") return null;

  const body = data as ApiErrorBody;

  const maybeMessage = body.message;
  const maybeErrorCode = body.errorCode;

  if (typeof maybeMessage === "string" || typeof maybeErrorCode === "string") {
    return body;
  }

  return null;
}

function isScrapeFailure(err: unknown): boolean {
  const body = extractApiErrorBody(err);
  if (!body) return false;

  const message = body.message ?? "";
  const errorCode = body.errorCode ?? "";

  // Backend scrape failure messages:
  // - "Failed to scrape page"
  // - "Failed to scrape page (timeout / missing elements)"
  // - sometimes other BAD_REQUESTs related to scrape/analysis
  if (message.includes("Failed to scrape page")) return true;

  if (
    errorCode === "BAD_REQUEST" &&
    (message.includes("Job.jdText is required") || message.includes("scrape"))
  ) {
    return true;
  }

  return false;
}

export function JobCreateEditModal({
  open,
  mode,
  card,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: Mode;
  card: JobKanbanCard | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = mode === "edit";
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const [createPhase, setCreatePhase] = useState<CreatePhase>(1);

  const defaultValues = useMemo<FormValuesBase>(() => {
    if (!isEdit || !card) {
      return {
        companyName: "",
        position: "",
        jobDescriptionUrl: "",
        jobDescriptionText: "",
        applicationDeadline: "",
        companyLogoUrl: "",
        personalNotes: "",
      };
    }

    return {
      companyName: card.companyName ?? "",
      position: card.position ?? "",
      jobDescriptionUrl: card.jdUrl ?? "",
      jobDescriptionText: card.jdText ?? "",
      applicationDeadline: card.deadline ?? "",
      companyLogoUrl: card.companyLogoUrl ?? "",
      personalNotes: card.notes ?? "",
    };
  }, [card, isEdit]);

  useEffect(() => {
    if (!open) return;

    setCreatePhase(isEdit ? 2 : 1);
    reset(defaultValues);
  }, [open, defaultValues, isEdit]);

  const schemaVariant: SchemaVariant = isEdit
    ? "edit"
    : createPhase === 1
      ? "createPhase1"
      : "createPhase2";

  const schema = useMemo(
    () => buildJobFormSchema(schemaVariant),
    [schemaVariant],
  );

  const form = useForm<FormValuesBase>({
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  const [logoPreviewOk, setLogoPreviewOk] = useState<boolean>(true);

  useEffect(() => {
    setLogoPreviewOk(true);
  }, [open, createPhase]);

  const deadlineTone: DeadlineTone = useMemo(() => {
    return getDeadlineTone(watch("applicationDeadline"));
  }, [watch]);

  const aiBadge = (
    <span className='inline-flex items-center gap-1 rounded-md bg-indigo-600/10 px-2 py-1 text-[11px] font-extrabold text-[#4f46e5] ring-1 ring-[#4f46e5]/20'>
      <Sparkles
        size={12}
        aria-hidden='true'
      />
      AI ✦
    </span>
  );

  const showAiBanner = useMemo(() => {
    return (
      (watch("jobDescriptionUrl") || "").trim().length > 0 ||
      (watch("jobDescriptionText") || "").trim().length > 0
    );
  }, [watch]);

  const computedLogoPreviewUrl = useMemo(() => {
    return buildClearbitLogoUrl({
      companyLogoUrl: watch("companyLogoUrl"),
      jdUrl: watch("jobDescriptionUrl"),
      companyName: watch("companyName") || "",
    });
  }, [watch]);

  const onSubmit = async (values: FormValuesBase) => {
    if (isEdit) {
      const toastId = toast.loading("Saving changes…");
      try {
        const body = {
          companyName: values.companyName.trim() || undefined,
          position: values.position.trim() || undefined,
          jobDescriptionUrl: values.jobDescriptionUrl.trim() || undefined,
          jobDescriptionText: values.jobDescriptionText.trim() || undefined,
          applicationDeadline: values.applicationDeadline.trim() || undefined,
          companyLogoUrl: values.companyLogoUrl.trim() || undefined,
          personalNotes: values.personalNotes.trim() || undefined,
        };

        const id = card?.id;
        if (!id) {
          toast.error("Missing job id", { id: toastId });
          return;
        }

        await updateJob.mutateAsync({ id, body });

        toast.success("Job updated", { id: toastId });
        onSaved();
        onClose();
      } catch (err: unknown) {
        const apiBody = extractApiErrorBody(err);
        toast.error(apiBody?.message ?? "Network error", { id: toastId });
      }
      return;
    }

    if (createPhase === 1) {
      const toastId = toast.loading("Analyzing job URL…");

      try {
        const body = {
          // Backend sẽ scrape best-effort từ jobDescriptionUrl để fill companyName/position
          // FE vẫn phải truyền đủ field theo type signature.
          companyName: "",
          position: "",
          jobDescriptionUrl: values.jobDescriptionUrl.trim() || undefined,
          personalNotes: values.personalNotes.trim() || undefined,
          applicationDeadline: values.applicationDeadline.trim() || undefined,
          companyLogoUrl: values.companyLogoUrl.trim() || undefined,
        };

        await createJob.mutateAsync(body);

        toast.success("Job added", { id: toastId });
        onSaved();
        onClose();
      } catch (err: unknown) {
        if (isScrapeFailure(err)) {
          toast.error("Scrape failed. Please enter details manually.", {
            id: toastId,
          });
          setCreatePhase(2);
          return;
        }

        const apiBody = extractApiErrorBody(err);
        toast.error(apiBody?.message ?? "Network error", { id: toastId });
      }

      return;
    }

    // createPhase === 2
    const toastId = toast.loading("Saving job…");
    try {
      const body = {
        companyName: values.companyName.trim(),
        position: values.position.trim(),
        jobDescriptionUrl: values.jobDescriptionUrl.trim() || undefined,
        jobDescriptionText: values.jobDescriptionText.trim() || undefined,
        applicationDeadline: values.applicationDeadline.trim() || undefined,
        companyLogoUrl: values.companyLogoUrl.trim() || undefined,
        personalNotes: values.personalNotes.trim() || undefined,
      };

      await createJob.mutateAsync(body);

      toast.success("Job added", { id: toastId });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const apiBody = extractApiErrorBody(err);
      toast.error(apiBody?.message ?? "Network error", { id: toastId });
    }
  };

  if (!open) return null;

  const title = isEdit ? "Edit Job" : "Add New Job";

  const submitLabel = isEdit
    ? "Save Changes"
    : createPhase === 1
      ? "Analyze & Save"
      : "Save Job";

  const canSubmit = isEdit
    ? true
    : createPhase === 1
      ? isNonEmpty(watch("jobDescriptionUrl"))
      : true;

  const transformStyle = isEdit
    ? "translateX(0%)"
    : createPhase === 1
      ? "translateX(0%)"
      : "translateX(-100%)";

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-black/40 p-4'>
      <div
        role='dialog'
        aria-modal='true'
        aria-label={title}
        className='w-full max-w-[720px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_rgba(0,0,0,0.12)]'
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='max-h-[90vh] overflow-y-auto'>
            <div className='relative border-b border-zinc-200 px-6 py-5'>
              <button
                type='button'
                aria-label='Close'
                onClick={onClose}
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
                    {title}
                  </div>
                  <div className='mt-1 text-[13px] font-semibold text-zinc-400'>
                    {isEdit
                      ? "Update job details (status via drag & drop)"
                      : "Paste job URL first. If scraping fails, we’ll switch to manual input."}
                  </div>
                </div>
              </div>
            </div>

            <div className='px-6 py-5'>
              {isEdit ? (
                <>
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
                          {...register("companyName")}
                          className={[
                            "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                            "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                          ].join(" ")}
                          placeholder='e.g. Shopee, VNG, Tiki'
                        />
                      </div>
                      {errors.companyName ? (
                        <p className='text-[12px] font-semibold text-[#EF4444]'>
                          {String(
                            errors.companyName.message ??
                              "Invalid company name",
                          )}
                        </p>
                      ) : null}
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
                          {...register("position")}
                          className={[
                            "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                            "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                          ].join(" ")}
                          placeholder='e.g. Backend Engineer, SWE Intern'
                        />
                      </div>
                      {errors.position ? (
                        <p className='text-[12px] font-semibold text-[#EF4444]'>
                          {String(
                            errors.position.message ?? "Invalid position",
                          )}
                        </p>
                      ) : null}
                    </label>
                  </div>

                  <div className='mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='text-[12px] font-extrabold text-zinc-700'>
                        Status
                      </div>
                      <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[12px] font-extrabold text-[#4f46e5] ring-1 ring-[#4f46e5]/10'>
                        {card?.status ? (
                          <span>{card.status}</span>
                        ) : (
                          <span>SAVED</span>
                        )}
                      </div>
                    </div>
                    <div className='mt-2 text-[12px] font-semibold text-zinc-400'>
                      Drag the card to change status.
                    </div>
                  </div>

                  <div className='mt-5'>
                    <div className='flex flex-col gap-2'>
                      <div className='text-[12px] font-extrabold text-zinc-700'>
                        Job Description URL
                      </div>

                      <div className='flex items-center gap-3'>
                        <div className='relative min-w-0 flex-1'>
                          <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                            <Link2
                              size={16}
                              aria-hidden='true'
                            />
                          </div>
                          <input
                            {...register("jobDescriptionUrl")}
                            className={[
                              "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 pr-3 text-sm text-zinc-900 outline-none",
                              "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                            ].join(" ")}
                            placeholder='https://careers.company.com/job/...'
                          />
                        </div>

                        <div className='flex-shrink-0'>{aiBadge}</div>
                      </div>

                      <div className='text-[12px] font-semibold text-zinc-400'>
                        Paste the JD link — AI will analyze it after saving.
                      </div>
                    </div>

                    {showAiBanner ? (
                      <div className='mt-3 rounded-xl bg-indigo-600/10 px-4 py-3 ring-1 ring-[#4f46e5]/20 text-[12px] font-extrabold text-[#4f46e5] inline-flex items-center gap-2'>
                        <Plus
                          size={16}
                          aria-hidden='true'
                        />
                        AI will process this job after you save.
                      </div>
                    ) : null}

                    <div className='mt-5 flex flex-col gap-4'>
                      <div>
                        <div className='text-[12px] font-extrabold text-zinc-700'>
                          Paste Job Description (text)
                        </div>
                        <textarea
                          {...register("jobDescriptionText")}
                          rows={4}
                          className={[
                            "mt-2 w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                            "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                          ].join(" ")}
                          placeholder="Paste JD text if you don't have a URL..."
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4 items-center'>
                        <label className='flex flex-col gap-2 items-center'>
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
                              {...register("applicationDeadline")}
                              className={[
                                "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 text-sm text-zinc-900 outline-none",
                                "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                              ].join(" ")}
                            />
                          </div>

                          {deadlineTone !== "OK" ? (
                            <div
                              className={[
                                "mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-extrabold ring-1",
                                deadlineBadgeClasses(deadlineTone),
                              ].join(" ")}
                            >
                              ⚠ Deadline{" "}
                              {deadlineTone === "OVERDUE" ? "overdue" : "soon"}
                            </div>
                          ) : null}
                        </label>

                        <label className='flex flex-col gap-2 items-center'>
                          <div className='flex items-center justify-between gap-3'>
                            <div className='text-[12px] font-extrabold text-zinc-700'>
                              Company Logo URL
                            </div>
                          </div>

                          <div className='relative'>
                            <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                              <ImageIcon
                                size={16}
                                aria-hidden='true'
                              />
                            </div>
                            <input
                              {...register("companyLogoUrl")}
                              className={[
                                "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                                "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                              ].join(" ")}
                              placeholder='https://... (optional)'
                            />
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className='mt-5 flex flex-col gap-2'>
                      <div className='text-[12px] font-extrabold text-zinc-700'>
                        Personal Notes
                      </div>
                      <textarea
                        {...register("personalNotes")}
                        rows={3}
                        className={[
                          "w-full resize-y rounded-xl border border-transparent bg-[#F8FAFC] px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                          "focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                        ].join(" ")}
                        placeholder='Referral source, salary range, recruiter name...'
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='text-[12px] font-extrabold text-zinc-700'>
                        Status
                      </div>
                      <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[12px] font-extrabold text-[#4f46e5] ring-1 ring-[#4f46e5]/10'>
                        <span>SAVED</span>
                      </div>
                    </div>
                    <div className='mt-2 text-[12px] font-semibold text-zinc-400'>
                      Auto-set. Change it on the Kanban board later.
                    </div>
                  </div>

                  <div className='mt-5 overflow-hidden'>
                    <div
                      className='flex transition-transform duration-300 ease-in-out'
                      style={{ transform: transformStyle }}
                    >
                      {/* Phase 1 panel */}
                      <div className='w-full shrink-0 px-0'>
                        <div className='flex flex-col gap-2'>
                          <div className='text-[12px] font-extrabold text-zinc-700'>
                            Job Description URL
                          </div>

                          <div className='flex items-center gap-3'>
                            <div className='relative min-w-0 flex-1'>
                              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                                <Link2
                                  size={16}
                                  aria-hidden='true'
                                />
                              </div>
                              <input
                                {...register("jobDescriptionUrl")}
                                className={[
                                  "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 pr-3 text-sm text-zinc-900 outline-none",
                                  "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                                ].join(" ")}
                                placeholder='https://careers.company.com/job/...'
                              />
                            </div>

                            <div className='flex-shrink-0'>{aiBadge}</div>
                          </div>

                          <div className='text-[12px] font-semibold text-zinc-400'>
                            Paste the JD link — we’ll scrape & analyze it after
                            saving.
                          </div>
                        </div>

                        {showAiBanner ? (
                          <div className='mt-3 rounded-xl bg-indigo-600/10 px-4 py-3 ring-1 ring-[#4f46e5]/20 text-[12px] font-extrabold text-[#4f46e5] inline-flex items-center gap-2'>
                            <Plus
                              size={16}
                              aria-hidden='true'
                            />
                            AI will process this job after you save.
                          </div>
                        ) : null}
                      </div>

                      {/* Phase 2 panel */}
                      <div className='w-full shrink-0'>
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
                                {...register("companyName")}
                                className={[
                                  "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                                  "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                                ].join(" ")}
                                placeholder='e.g. Shopee, VNG, Tiki'
                              />
                            </div>
                            {errors.companyName ? (
                              <p className='text-[12px] font-semibold text-[#EF4444]'>
                                {String(
                                  errors.companyName.message ??
                                    "Invalid company name",
                                )}
                              </p>
                            ) : null}
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
                                {...register("position")}
                                className={[
                                  "h-[42px] w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                                  "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                                ].join(" ")}
                                placeholder='e.g. Backend Engineer, SWE Intern'
                              />
                            </div>
                            {errors.position ? (
                              <p className='text-[12px] font-semibold text-[#EF4444]'>
                                {String(
                                  errors.position.message ?? "Invalid position",
                                )}
                              </p>
                            ) : null}
                          </label>
                        </div>

                        <div className='mt-5'>
                          <div className='flex flex-col gap-2'>
                            <div className='text-[12px] font-extrabold text-zinc-700'>
                              Job Description URL
                            </div>

                            <div className='flex items-center gap-3'>
                              <div className='relative min-w-0 flex-1'>
                                <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                                  <Link2
                                    size={16}
                                    aria-hidden='true'
                                  />
                                </div>
                                <input
                                  {...register("jobDescriptionUrl")}
                                  className={[
                                    "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 pr-3 text-sm text-zinc-900 outline-none",
                                    "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                                  ].join(" ")}
                                  placeholder='https://careers.company.com/job/...'
                                />
                              </div>

                              <div className='flex-shrink-0'>{aiBadge}</div>
                            </div>

                            <div className='text-[12px] font-semibold text-zinc-400'>
                              Paste the JD link (optional if you paste the text
                              below)
                            </div>
                          </div>

                          <div className='mt-5 flex flex-col gap-2'>
                            <div className='text-[12px] font-extrabold text-zinc-700'>
                              Paste Job Description (text)
                            </div>
                            <textarea
                              {...register("jobDescriptionText")}
                              rows={4}
                              className={[
                                "mt-2 w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                                "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                              ].join(" ")}
                              placeholder='Paste JD text if scraping fails...'
                            />
                          </div>

                          <div className='mt-5 grid grid-cols-2 gap-4 items-center'>
                            <label className='flex flex-col gap-2 items-center'>
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
                                  {...register("applicationDeadline")}
                                  className={[
                                    "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 text-sm text-zinc-900 outline-none",
                                    "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                                  ].join(" ")}
                                />
                              </div>

                              {deadlineTone !== "OK" ? (
                                <div
                                  className={[
                                    "mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-extrabold ring-1",
                                    deadlineBadgeClasses(deadlineTone),
                                  ].join(" ")}
                                >
                                  ⚠ Deadline{" "}
                                  {deadlineTone === "OVERDUE"
                                    ? "overdue"
                                    : "soon"}
                                </div>
                              ) : null}
                            </label>

                            <label className='flex flex-col gap-2 items-center'>
                              <div className='flex items-center justify-between gap-3'>
                                <div className='text-[12px] font-extrabold text-zinc-700'>
                                  Company Logo URL
                                </div>
                              </div>

                              <div className='relative'>
                                <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'>
                                  <ImageIcon
                                    size={16}
                                    aria-hidden='true'
                                  />
                                </div>
                                <input
                                  {...register("companyLogoUrl")}
                                  className={[
                                    "h-[42px] w-full rounded-xl border bg-white px-3 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                                    "border-zinc-200 focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                                  ].join(" ")}
                                  placeholder='https://... (optional)'
                                />
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className='mt-5 flex flex-col gap-2'>
                          <div className='text-[12px] font-extrabold text-zinc-700'>
                            Personal Notes
                          </div>
                          <textarea
                            {...register("personalNotes")}
                            rows={3}
                            className={[
                              "w-full resize-y rounded-xl border border-transparent bg-[#F8FAFC] px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none",
                              "focus:border-[#4f46e5]/60 focus:ring-1 focus:ring-[#4f46e5]/20",
                            ].join(" ")}
                            placeholder='Referral source, salary range, recruiter name...'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='border-t border-zinc-200 px-6 py-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='text-[12px] font-semibold text-zinc-400'>
                {isEdit
                  ? "Tip: status is controlled by drag & drop."
                  : "Tip: You can edit all details after saving."}
              </div>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='h-[38px] rounded-xl px-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-100'
                >
                  Cancel
                </button>

                <button
                  type='submit'
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    createJob.isPending ||
                    updateJob.isPending
                  }
                  className={[
                    "h-[38px] rounded-xl px-4 text-sm font-extrabold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50",
                    isEdit ? "bg-[#4f46e5]" : "bg-[#6366F1]",
                  ].join(" ")}
                >
                  <span className='inline-flex items-center gap-2'>
                    <Check
                      size={16}
                      aria-hidden='true'
                    />
                    {isSubmitting ? "Saving…" : submitLabel}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
