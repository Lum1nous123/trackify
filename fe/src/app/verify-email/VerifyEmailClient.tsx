"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosClient } from "@/core/http/axiosClient";
import { AuthLogo } from "@/features/auth/components/AuthLogo";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { Mail, Pin, ShieldCheck } from "lucide-react";
import Link from "next/link";

type VerifyForm = {
  email: string;
  code: string;
};

const InputIconMail = ({ className }: { className?: string }) => (
  <Mail
    className={className ? className : "text-[#6B7280]"}
    width={18}
    height={18}
    aria-hidden='true'
  />
);

const InputIconPin = ({ className }: { className?: string }) => (
  <Pin
    className={className ? className : "text-[#6B7280]"}
    width={18}
    height={18}
    aria-hidden='true'
  />
);

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmailFromQuery = useMemo(() => {
    const email = searchParams.get("email");
    return email ?? "";
  }, [searchParams]);

  const [form, setForm] = useState<VerifyForm>({
    email: "",
    code: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmailFromQuery) {
      setForm((s) => ({ ...s, email: initialEmailFromQuery }));
    }
  }, [initialEmailFromQuery]);

  const canSubmit =
    form.email.trim().length > 0 && form.code.trim().length >= 4;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await axiosClient.post("/api/proxy/auth/verify-email", {
        email: form.email,
        code: form.code,
      });

      router.replace("/dashboard");
    } catch (err: unknown) {
      const maybe = err as {
        response?: { data?: { message?: string } };
      };

      const message =
        maybe.response?.data?.message ??
        "Verification failed. Please check the code and try again.";

      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      cardTitle='Verify your email'
      cardSubtitle='Enter the code sent to your inbox'
      bottomHint={
        <>
          Wrong email?{" "}
          <Link
            href='/register'
            className='font-semibold text-[#4f46e5]'
          >
            Sign up again
          </Link>
        </>
      }
    >
      <div className='flex flex-col'>
        <div className='mb-4 flex justify-center md:hidden'>
          <AuthLogo />
        </div>

        <div className='mb-4 flex items-start gap-3 rounded-xl border border-[#d5d4f3] bg-white p-4'>
          <div className='mt-0.5'>
            <ShieldCheck
              className='text-[#4f46e5]'
              width={20}
              height={20}
            />
          </div>
          <div className='text-sm text-zinc-700'>
            We sent a 6-digit verification code to your email. Paste it below to
            unlock your dashboard.
          </div>
        </div>

        {errorMessage ? (
          <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
            {errorMessage}
          </div>
        ) : null}

        <form
          onSubmit={onSubmit}
          className='flex flex-col gap-5'
        >
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-zinc-900'>Email</label>
            <div className='relative'>
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2'>
                <InputIconMail />
              </div>
              <input
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    email: e.target.value,
                  }))
                }
                type='email'
                autoComplete='email'
                placeholder='you@email.com'
                className='w-full rounded-xl border border-[#d5d4f3] bg-white py-3 pl-11 pr-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/30'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-zinc-900'>
              Verification code
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2'>
                <InputIconPin />
              </div>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    code: e.target.value,
                  }))
                }
                inputMode='numeric'
                autoComplete='one-time-code'
                placeholder='123456'
                className='w-full rounded-xl border border-[#d5d4f3] bg-white py-3 pl-11 pr-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/30'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={submitting || !canSubmit}
            className='mt-1 h-[46px] w-full rounded-xl bg-[#4f46e5] text-sm font-semibold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {submitting ? "Verifying..." : "Verify code"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
