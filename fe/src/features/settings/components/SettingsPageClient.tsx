"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { useCvActive } from "@/hooks/useCvActive";
import { useCvUpload } from "@/hooks/useCvUpload";
import { useMe, useUpdateMe } from "@/hooks/useAuth";
import {
  useReminderSettings,
  useUpsertReminderSettings,
} from "@/hooks/useReminderSettings";
import { useReminderLogs } from "@/hooks/useReminderLogs";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={() => {
        if (disabled) return;
        onChange(!checked);
      }}
      aria-pressed={checked}
      disabled={disabled}
      className={[
        "relative inline-flex h-[22px] w-[42px items-center rounded-full border-2",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        checked
          ? "border-[#5e6ad2] bg-[#5e6ad2]"
          : "border-zinc-700 bg-zinc-800",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-[18px] w-[18px rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform",
          checked ? "translate-x-[19px]" : "translate-x-[2px]",
        ].join(" ")}
      />
    </button>
  );
}

function Field({
  label,
  value,
  readOnly,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (next: string) => void;
}) {
  return (
    <label className='flex flex-col gap-2'>
      <span className='text-[12px] font-semibold text-[#8a8f98]'>{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={[
          "h-[38px] rounded-xl border bg-[#0f1011] px-3 text-sm text-[#f7f8f8] placeholder:text-[#8a8f98] outline-none",
          readOnly
            ? "border-[#23252a] bg-[#141516] text-[#f7f8f8]"
            : "border-[#23252a] focus:border-[#5e6ad2]/60 focus:ring-1 focus:ring-[#5e6ad2]/20",
        ].join(" ")}
      />
    </label>
  );
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function isPdfFile(file: File): boolean {
  const mimeOk = file.type === "application/pdf";
  const extOk = file.name.toLowerCase().endsWith(".pdf");
  return mimeOk || extOk;
}

async function resizeTo84x84Png(file: File): Promise<{
  blob: Blob;
  previewUrl: string;
}> {
  const imageDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load image"));
    el.src = imageDataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 84;
  canvas.height = 84;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }

  // Cover logic: scale để cạnh ngắn nhất vừa khít 84px, rồi crop giữa
  const scale = Math.max(84 / img.width, 84 / img.height);
  const scaledW = img.width * scale;
  const scaledH = img.height * scale;
  const offsetX = (84 - scaledW) / 2;
  const offsetY = (84 - scaledH) / 2;

  ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error("Failed to convert canvas to blob"));
          return;
        }
        resolve(b);
      },
      "image/png",
      0.92,
    );
  });

  const previewUrl = URL.createObjectURL(blob);
  return { blob, previewUrl };
}

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();

  if (!Number.isFinite(ms)) return "—";
  if (ms < 0) return "vừa mới cập nhật";

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "vừa xong";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} tuần trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  const years = Math.floor(days / 365);
  return `${years} năm trước`;
}

export function SettingsPageClient() {
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();
  const cvUpload = useCvUpload();
  const { data: cvActive, isLoading: isCvActiveLoading } = useCvActive();

  const REMINDER_RULES = useMemo(
    () => ({
      deadline: {
        jobStatus: "SAVED",
        reminderType: "DEADLINE_REMINDER",
        startOffsetDays: 3,
        endOffsetDays: 0,
        frequencyDays: 1,
      },
      followUp: {
        jobStatus: "APPLIED",
        reminderType: "FOLLOW_UP_APPLIED",
        startOffsetDays: 7,
        endOffsetDays: 14,
        frequencyDays: 1,
      },
      interview: {
        jobStatus: "INTERVIEW",
        reminderType: "INTERVIEW_PREP",
        startOffsetDays: 2,
        endOffsetDays: 0,
        frequencyDays: 1,
      },
    }),
    [],
  );

  // MVP (option 1): user chỉnh 1 số X => backend sẽ nhắc theo X ngày trước deadline
  // => startOffsetDays = endOffsetDays = X
  const [deadlineReminderDays, setDeadlineReminderDays] = useState<number>(
    () => REMINDER_RULES.deadline.startOffsetDays,
  );

  const { data: reminderSettings, isLoading: isReminderSettingsLoading } =
    useReminderSettings();

  const upsertReminderSettings = useUpsertReminderSettings();

  const { data: reminderLogs, isLoading: isReminderLogsLoading } =
    useReminderLogs(8);

  const displayName = useMemo(() => {
    return me?.fullName?.trim() || me?.username || "User";
  }, [me?.fullName, me?.username]);

  const avatarLetter = useMemo(() => {
    const source = displayName.trim();
    if (!source) return "U";
    return source[0]!.toUpperCase();
  }, [displayName]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cvFileInputRef = useRef<HTMLInputElement | null>(null);

  const [cvUploadLoading, setCvUploadLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "account" | "notifications" | "ai" | "danger"
  >("notifications");

  const [formFullName, setFormFullName] = useState("");
  const [formLinkedIn, setFormLinkedIn] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");

  useEffect(() => {
    if (!me) return;
    setFormFullName(me.fullName ?? "");
  }, [me]);

  const [saveLoading, setSaveLoading] = useState(false);

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarBlob84, setAvatarBlob84] = useState<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const [toggles, setToggles] = useState({
    deadlineReminders: true,
    followUp: false,
    weeklyDigest: true,
    interviewAlerts: true,
    aiPreferences: true,
    salaryInsights: false,
  });

  useEffect(() => {
    if (!reminderSettings) return;

    const findRule = (jobStatus: string, reminderType: string) =>
      reminderSettings.find(
        (r) =>
          String(r.jobStatus) === String(jobStatus) &&
          r.reminderType === reminderType,
      );

    const deadlineRule = findRule(
      REMINDER_RULES.deadline.jobStatus,
      REMINDER_RULES.deadline.reminderType,
    );

    const deadlineEnabled = deadlineRule?.enabled;

    // MVP (option 1): if startOffsetDays === endOffsetDays => X
    const deadlineDays =
      deadlineRule &&
      deadlineRule.startOffsetDays !== undefined &&
      deadlineRule.endOffsetDays !== undefined &&
      deadlineRule.startOffsetDays === deadlineRule.endOffsetDays
        ? deadlineRule.startOffsetDays
        : (deadlineRule?.startOffsetDays ??
          REMINDER_RULES.deadline.startOffsetDays);

    setDeadlineReminderDays(deadlineDays);

    const followUpEnabled = findRule(
      REMINDER_RULES.followUp.jobStatus,
      REMINDER_RULES.followUp.reminderType,
    )?.enabled;

    const interviewEnabled = findRule(
      REMINDER_RULES.interview.jobStatus,
      REMINDER_RULES.interview.reminderType,
    )?.enabled;

    setToggles((s) => ({
      ...s,
      deadlineReminders: deadlineEnabled ?? false,
      followUp: followUpEnabled ?? false,
      interviewAlerts: interviewEnabled ?? false,
    }));
  }, [reminderSettings, REMINDER_RULES]);

  const onPickAvatarClick = () => fileInputRef.current?.click();
  const onPickCvClick = () => cvFileInputRef.current?.click();

  const onAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error("Avatar must be an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar is too large. Max size is 5MB.");
      return;
    }

    toast.message("Resizing avatar to 84x84…");

    try {
      const next = await resizeTo84x84Png(file);

      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(next.previewUrl);
      setAvatarBlob84(next.blob);
    } catch {
      toast.error("Failed to resize avatar.");
    } finally {
      // allow selecting same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onCvFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPdfFile(file)) {
      toast.error("CV must be a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("CV is too large. Max size is 10MB.");
      return;
    }

    const toastId = toast.loading("Uploading CV…");
    setCvUploadLoading(true);

    try {
      const form = new FormData();
      form.append("cv", file, file.name || "cv.pdf");

      await cvUpload.mutateAsync(form);

      toast.success("CV uploaded successfully.", { id: toastId });

      if (cvFileInputRef.current) cvFileInputRef.current.value = "";
    } catch {
      toast.error("Network error while uploading CV.", { id: toastId });
    } finally {
      setCvUploadLoading(false);
    }
  };

  const onSave = async () => {
    if (!me) return;

    const fullNameToSend = formFullName.trim();

    const form = new FormData();
    form.append("fullName", fullNameToSend);

    if (avatarBlob84) {
      form.append("avatar", avatarBlob84, "avatar.png");
    }

    const toastId = toast.loading("Saving profile…");
    setSaveLoading(true);

    try {
      await updateMe.mutateAsync(form);

      toast.success("Profile updated successfully.", { id: toastId });

      // reset local avatar selection
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
      setAvatarBlob84(null);
    } catch {
      toast.error("Network error while updating profile.", { id: toastId });
    } finally {
      setSaveLoading(false);
    }
  };

  const avatarSrc = avatarPreviewUrl ?? (me?.avatarUrl ? me.avatarUrl : null);

  return (
    <DashboardShell pageTitle='Profile & Settings'>
      <div className='flex flex-col gap-6 pb-10'>
        <div className='flex items-center justify-between gap-4'>
          <div className='min-w-0'>
            <div className='text-[14px] font-semibold text-[#8a8f98]'>
              {isLoading ? "Loading..." : "Manage your profile & preferences"}
            </div>
            <div className='mt-1 truncate text-[22px] font-extrabold tracking-tight text-[#f7f8f8]'>
              {displayName}
            </div>
          </div>

          <button
            type='button'
            onClick={onSave}
            disabled={saveLoading || isLoading}
            className='h-[38px] rounded-xl bg-[#5e6ad2] px-4 text-sm font-semibold text-white shadow-[0_12px_0_rgba(94,106,210,0.12)] hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {saveLoading ? "Saving..." : "Save"}
          </button>
        </div>

        <div className='grid grid-cols-12 gap-6'>
          {/* Left: personal details + profile card */}
          <section className='col-span-12 rounded-2xl bg-[#0f1011] p-6 border border-[#23252a] shadow-[0_24px_48px_rgba(0,0,0,0.25)] md:col-span-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <button
                  type='button'
                  onClick={onPickAvatarClick}
                  className='relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#5e6ad2]/10 ring-1 ring-[#5e6ad2]/20 hover:ring-[#5e6ad2]/40'
                  aria-label='Change avatar'
                  title='Change avatar'
                >
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt='Avatar preview'
                      className='h-full w-full rounded-full object-cover'
                    />
                  ) : (
                    <div className='text-[18px] font-extrabold text-[#5e6ad2]'>
                      {isLoading ? "…" : avatarLetter}
                    </div>
                  )}
                </button>

                <div className='min-w-0'>
                  <div className='truncate text-[14px] font-bold tracking-tight text-white'>
                    {isLoading ? "Loading..." : displayName}
                  </div>
                  <div className='mt-1 text-[12px] text-zinc-500'>
                    {me?.email ?? "—"}
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={onAvatarFileChange}
                className='hidden'
              />
            </div>

            <div className='mt-6'>
              <div className='text-[13px] font-extrabold tracking-tight text-[#f7f8f8]'>
                Personal Details
              </div>

              <div className='mt-4 flex flex-col gap-3'>
                <Field
                  label='Full Name'
                  value={formFullName}
                  onChange={setFormFullName}
                  placeholder='Your full name'
                />
                <Field
                  label='Email'
                  value={me?.email ?? ""}
                  readOnly
                />

                <Field
                  label='Job Title'
                  value={formJobTitle}
                  onChange={setFormJobTitle}
                  placeholder='e.g. Backend Developer'
                />
                <Field
                  label='LinkedIn URL'
                  value={formLinkedIn}
                  onChange={setFormLinkedIn}
                  placeholder='linkedin.com/in/your-handle'
                />
              </div>
            </div>

            <div className='mt-7'>
              <div className='text-[13px] font-extrabold tracking-tight text-[#f7f8f8]'>
                My CV
              </div>

              <div className='mt-4 rounded-2xl border border-dashed border-[#23252a] bg-[#0f1011] p-4'>
                <div className='text-[12px] font-semibold text-[#d0d6e0]'>
                  {isCvActiveLoading
                    ? "Checking CV…"
                    : cvActive?.uploadedAt
                      ? "CV đã được cập nhật"
                      : "Upload resume"}
                </div>
                <div className='mt-1 text-[12px] text-[#8a8f98]'>
                  {isCvActiveLoading
                    ? "Please wait…"
                    : cvActive?.uploadedAt
                      ? `Cập nhật ${formatTimeAgo(cvActive.uploadedAt)}`
                      : "(UI placeholder — wire upload endpoint later)"}
                </div>
                <input
                  ref={cvFileInputRef}
                  type='file'
                  accept='application/pdf'
                  className='hidden'
                  onChange={onCvFileChange}
                />

                <button
                  type='button'
                  className='mt-4 h-[36px] rounded-xl border border-[#23252a] bg-[#0f1011] px-3 text-sm font-semibold text-[#f7f8f8] hover:bg-[#141516] disabled:cursor-not-allowed disabled:opacity-60'
                  disabled={cvUploadLoading}
                  onClick={onPickCvClick}
                >
                  {cvUploadLoading
                    ? "Uploading…"
                    : cvActive?.uploadedAt
                      ? "Update CV"
                      : "Upload new"}
                </button>
              </div>
            </div>
          </section>

          {/* Right: tabbed preferences */}
          <section className='col-span-12 rounded-2xl bg-[#0f1011] p-6 border border-[#23252a] shadow-[0_24px_48px_rgba(0,0,0,0.25)] md:col-span-8'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-wrap gap-3 border-b border-[#23252a] pb-3'>
                <button
                  type='button'
                  className={[
                    "text-[12px] font-extrabold tracking-tight uppercase pb-2 transition-colors",
                    activeTab === "account"
                      ? "text-[#5e6ad2] border-b-2 border-[#5e6ad2]"
                      : "text-[#8a8f98] hover:text-[#d0d6e0]",
                  ].join(" ")}
                  onClick={() => setActiveTab("account")}
                >
                  Account
                </button>

                <button
                  type='button'
                  className={[
                    "text-[12px] font-extrabold tracking-tight uppercase pb-2 transition-colors",
                    activeTab === "notifications"
                      ? "text-[#5e6ad2] border-b-2 border-[#5e6ad2]"
                      : "text-[#8a8f98] hover:text-[#d0d6e0]",
                  ].join(" ")}
                  onClick={() => setActiveTab("notifications")}
                >
                  Notifications
                </button>

                <button
                  type='button'
                  className={[
                    "text-[12px] font-extrabold tracking-tight uppercase pb-2 transition-colors",
                    activeTab === "ai"
                      ? "text-[#5e6ad2] border-b-2 border-[#5e6ad2]"
                      : "text-[#8a8f98] hover:text-[#d0d6e0]",
                  ].join(" ")}
                  onClick={() => setActiveTab("ai")}
                >
                  AI Preferences
                </button>

                <button
                  type='button'
                  className={[
                    "text-[12px] font-extrabold tracking-tight uppercase pb-2 transition-colors",
                    activeTab === "danger"
                      ? "text-[#5e6ad2] border-b-2 border-[#5e6ad2]"
                      : "text-[#8a8f98] hover:text-[#d0d6e0]",
                  ].join(" ")}
                  onClick={() => setActiveTab("danger")}
                >
                  Danger Zone
                </button>
              </div>

              {activeTab === "notifications" ? (
                <div className='flex flex-col gap-4'>
                  <div>
                    <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                      Notification Settings
                    </div>
                    <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                      Manage how and when you want to be alerted about your
                      applications.
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-start justify-between gap-4 rounded-xl border border-[#23252a] bg-[#0f1011] p-3'>
                      <div>
                        <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                          Deadline reminders
                        </div>
                        <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                          Go to the next alert hours before an application
                          deadline.
                        </div>

                        <div className='mt-3 flex items-center gap-2'>
                          <div className='text-[12px] font-semibold text-[#d0d6e0]'>
                            Nhắc me
                          </div>

                          <input
                            type='number'
                            inputMode='numeric'
                            min={0}
                            max={60}
                            disabled={
                              upsertReminderSettings.isPending ||
                              !toggles.deadlineReminders
                            }
                            value={deadlineReminderDays}
                            onChange={(e) => {
                              const raw = Number(e.target.value);
                              const next = Number.isFinite(raw)
                                ? Math.max(0, Math.min(60, Math.trunc(raw)))
                                : 0;
                              setDeadlineReminderDays(next);
                            }}
                            onBlur={() => {
                              if (!toggles.deadlineReminders) return;
                              if (upsertReminderSettings.isPending) return;

                              upsertReminderSettings.mutateAsync([
                                {
                                  jobStatus: REMINDER_RULES.deadline.jobStatus,
                                  reminderType:
                                    REMINDER_RULES.deadline.reminderType,
                                  enabled: true,
                                  startOffsetDays: deadlineReminderDays,
                                  endOffsetDays: deadlineReminderDays,
                                  frequencyDays:
                                    REMINDER_RULES.deadline.frequencyDays,
                                },
                              ]);
                            }}
                            className={[
                              "h-[38px] w-[88px] rounded-xl border bg-[#0f1011] px-3 text-sm text-[#f7f8f8] outline-none",
                              upsertReminderSettings.isPending ||
                              !toggles.deadlineReminders
                                ? "border-[#23252a] text-[#8a8f98] opacity-60 cursor-not-allowed"
                                : "border-[#23252a] focus:border-[#5e6ad2]/60 focus:ring-1 focus:ring-[#5e6ad2]/20",
                            ].join(" ")}
                          />

                          <div className='text-[12px] font-semibold text-[#d0d6e0]'>
                            ngày trước
                          </div>
                        </div>
                      </div>

                      <Toggle
                        checked={toggles.deadlineReminders}
                        disabled={upsertReminderSettings.isPending}
                        onChange={(next) => {
                          setToggles((s) => ({
                            ...s,
                            deadlineReminders: next,
                          }));

                          upsertReminderSettings.mutateAsync([
                            {
                              jobStatus: REMINDER_RULES.deadline.jobStatus,
                              reminderType:
                                REMINDER_RULES.deadline.reminderType,
                              enabled: next,
                              startOffsetDays: deadlineReminderDays,
                              endOffsetDays: deadlineReminderDays,
                              frequencyDays:
                                REMINDER_RULES.deadline.frequencyDays,
                            },
                          ]);
                        }}
                      />
                    </div>

                    <div className='flex items-start justify-between gap-4 rounded-xl border border-[#23252a] p-3'>
                      <div>
                        <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                          Follow-up nudges
                        </div>
                        <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                          Smart reminders to follow up after 7 days of no
                          response.
                        </div>
                      </div>
                      <Toggle
                        checked={toggles.followUp}
                        disabled={upsertReminderSettings.isPending}
                        onChange={(next) => {
                          setToggles((s) => ({ ...s, followUp: next }));

                          upsertReminderSettings.mutateAsync([
                            {
                              jobStatus: REMINDER_RULES.followUp.jobStatus,
                              reminderType:
                                REMINDER_RULES.followUp.reminderType,
                              enabled: next,
                              startOffsetDays:
                                REMINDER_RULES.followUp.startOffsetDays,
                              endOffsetDays:
                                REMINDER_RULES.followUp.endOffsetDays,
                              frequencyDays:
                                REMINDER_RULES.followUp.frequencyDays,
                            },
                          ]);
                        }}
                      />
                    </div>

                    <div className='flex items-start justify-between gap-4 rounded-xl border border-[#23252a] bg-[#0f1011] p-3'>
                      <div>
                        <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                          Weekly digest
                        </div>
                        <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                          A summary of your tracking progress every Monday
                          morning.
                        </div>
                      </div>
                      <Toggle
                        checked={toggles.weeklyDigest}
                        onChange={(next) =>
                          setToggles((s) => ({ ...s, weeklyDigest: next }))
                        }
                      />
                    </div>

                    <div className='flex items-start justify-between gap-4 rounded-xl border border-[#23252a] bg-[#0f1011] p-3'>
                      <div>
                        <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                          Interview alerts
                        </div>
                        <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                          Immediate notifications for new interview invitations.
                        </div>
                      </div>
                      <Toggle
                        checked={toggles.interviewAlerts}
                        disabled={upsertReminderSettings.isPending}
                        onChange={(next) => {
                          setToggles((s) => ({
                            ...s,
                            interviewAlerts: next,
                          }));

                          upsertReminderSettings.mutateAsync([
                            {
                              jobStatus: REMINDER_RULES.interview.jobStatus,
                              reminderType:
                                REMINDER_RULES.interview.reminderType,
                              enabled: next,
                              startOffsetDays:
                                REMINDER_RULES.interview.startOffsetDays,
                              endOffsetDays:
                                REMINDER_RULES.interview.endOffsetDays,
                              frequencyDays:
                                REMINDER_RULES.interview.frequencyDays,
                            },
                          ]);
                        }}
                      />
                    </div>
                    <div className='mt-6'>
                      <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                        Recent reminders
                      </div>
                      <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                        Latest reminder triggers (history / dedupe).
                      </div>

                      <div className='mt-3 flex flex-col gap-2'>
                        {isReminderLogsLoading ? (
                          <div className='text-[12px] text-[#8a8f98]'>
                            Loading…
                          </div>
                        ) : null}

                        {!isReminderLogsLoading &&
                        reminderLogs &&
                        reminderLogs.length > 0
                          ? reminderLogs.map((log) => (
                              <div
                                key={log.id}
                                className='rounded-xl border border-[#23252a] bg-[#0f1011] p-3'
                              >
                                <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                                  {log.reminderType}
                                </div>
                                <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                                  Trigger: {log.triggerDate}
                                </div>
                                <div className='mt-1 text-[12px] text-[#8a8f98]'>
                                  Sent: {formatTimeAgo(log.sentAt)}
                                </div>
                              </div>
                            ))
                          : null}

                        {!isReminderLogsLoading &&
                        (!reminderLogs || reminderLogs.length === 0) ? (
                          <div className='text-[12px] text-[#8a8f98]'>
                            No reminders yet.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "ai" ? (
                <div className='flex flex-col gap-4'>
                  <div>
                    <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                      AI Preferences
                    </div>
                    <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                      Control how Trackify uses AI to help you land your next
                      role.
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-start justify-between gap-4 rounded-xl border border-[#23252a] bg-[#0f1011] p-3'>
                      <div>
                        <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                          Market fit analysis
                        </div>
                        <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                          AI suggestions based on your experience and your
                          target roles.
                        </div>
                      </div>
                      <Toggle
                        checked={toggles.aiPreferences}
                        onChange={(next) =>
                          setToggles((s) => ({
                            ...s,
                            aiPreferences: next,
                          }))
                        }
                      />
                    </div>

                    <div className='flex items-start justify-between gap-4 rounded-xl border border-[#23252a] bg-[#0f1011] p-3'>
                      <div>
                        <div className='text-[12px] font-extrabold text-[#f7f8f8]'>
                          Salary insights
                        </div>
                        <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                          Alerts when market trends shift for your location and
                          role.
                        </div>
                      </div>
                      <Toggle
                        checked={toggles.salaryInsights}
                        onChange={(next) =>
                          setToggles((s) => ({
                            ...s,
                            salaryInsights: next,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "account" ? (
                <div className='flex flex-col gap-4'>
                  <div>
                    <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                      Account
                    </div>
                    <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                      Basic profile info (loaded from{" "}
                      <span className='font-semibold text-[#8a8f98]'>
                        /api/auth/me
                      </span>
                      ).
                    </div>
                  </div>

                  <div className='rounded-2xl border border-[#23252a] bg-[#141516] p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200'>
                        {avatarSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarSrc}
                            alt='Avatar'
                            className='h-full w-full rounded-xl object-cover'
                          />
                        ) : (
                          <span className='text-sm font-extrabold text-[#4f46e5]'>
                            {isLoading ? "…" : avatarLetter}
                          </span>
                        )}
                      </div>
                      <div className='min-w-0'>
                        <div className='truncate text-[13px] font-extrabold text-zinc-900'>
                          {displayName}
                        </div>
                        <div className='truncate text-[12px] text-zinc-500'>
                          {me?.username ? `@${me.username}` : "—"}
                        </div>
                      </div>
                    </div>

                    <div className='mt-3 text-[12px] text-[#d0d6e0]'>
                      Email:{" "}
                      <span className='font-semibold text-[#f7f8f8]'>
                        {me?.email ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "danger" ? (
                <div className='flex flex-col gap-4'>
                  <div>
                    <div className='text-[13px] font-extrabold text-[#f7f8f8]'>
                      Danger Zone
                    </div>
                    <div className='mt-1 text-[12px] text-[#d0d6e0]'>
                      Actions are not wired to the backend yet.
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <button
                      type='button'
                      className='w-full rounded-2xl border border-red-200 bg-red-50 p-4 text-left'
                      onClick={() =>
                        toast.message("Account deletion not implemented yet.")
                      }
                    >
                      <div className='text-[12px] font-extrabold text-red-700'>
                        Delete account
                      </div>
                      <div className='mt-1 text-[12px] text-red-700/80'>
                        Permanently remove your account and associated data.
                      </div>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
