"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLogo } from "@/features/auth/components/AuthLogo";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { axiosClient } from "@/core/http/axiosClient";

type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const InputIconMail = ({ className }: { className?: string }) => (
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
      d='M4 6.5H20V17.5C20 18.0523 19.5523 18.5 19 18.5H5C4.44772 18.5 4 18.0523 4 17.5V6.5Z'
      stroke='#6B7280'
      strokeWidth='2'
      strokeLinejoin='round'
    />
    <path
      d='M4.5 7L12 12.2L19.5 7'
      stroke='#6B7280'
      strokeWidth='2'
      strokeLinejoin='round'
    />
  </svg>
);

const InputIconLock = ({ className }: { className?: string }) => (
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
      d='M7 11V8.5C7 6.567 8.567 5 10.5 5C12.433 5 14 6.567 14 8.5V11'
      stroke='#6B7280'
      strokeWidth='2'
      strokeLinecap='round'
    />
    <path
      d='M6.5 11H14.5C15.0523 11 15.5 11.4477 15.5 12V19C15.5 19.5523 15.0523 20 14.5 20H6.5C5.94772 20 5.5 19.5523 5.5 19V12C5.5 11.4477 5.94772 11 6.5 11Z'
      stroke='#6B7280'
      strokeWidth='2'
      strokeLinejoin='round'
    />
  </svg>
);

const InputIconEye = ({
  className,
  open,
}: {
  className?: string;
  open: boolean;
}) => {
  if (open) {
    return (
      <svg
        className={className}
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
      >
        <path
          d='M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z'
          stroke='#6B7280'
          strokeWidth='2'
          strokeLinejoin='round'
        />
        <path
          d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
          stroke='#6B7280'
          strokeWidth='2'
          strokeLinejoin='round'
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
    >
      <path
        d='M3 3L21 21'
        stroke='#6B7280'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M2.5 12C4.5 7.5 8 5 12 5C13.3 5 14.5 5.3 15.6 5.8'
        stroke='#6B7280'
        strokeWidth='2'
        strokeLinejoin='round'
      />
      <path
        d='M21.5 12C19.5 16.5 16 19 12 19C10.7 19 9.5 18.7 8.4 18.2'
        stroke='#6B7280'
        strokeWidth='2'
        strokeLinejoin='round'
      />
      <path
        d='M9.5 9.5C8.8 10.3 8.5 11.2 8.5 12C8.5 13.7 10 15 12 15C12.8 15 13.7 14.7 14.5 14'
        stroke='#6B7280'
        strokeWidth='2'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = form.email.trim().length > 0 && form.password.length >= 1;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await axiosClient.post("/api/proxy/auth/login", {
        email: form.email,
        password: form.password,
      });

      window.location.assign("/dashboard");
    } catch (err: unknown) {
      const maybe = err as {
        response?: { data?: { message?: string } };
      };

      const message =
        maybe.response?.data?.message ??
        "Login failed. Please check your email/password.";

      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      cardTitle='Welcome back'
      cardSubtitle='Sign in to your account'
      bottomHint={
        <>
          Don't have an account?{" "}
          <Link
            href='/register'
            className='font-semibold text-[#4f46e5]'
          >
            Sign up
          </Link>
        </>
      }
    >
      <div className='flex flex-col'>
        <div className='mb-4 flex justify-center md:hidden'>
          <AuthLogo />
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
              Password
            </label>

            <div className='relative'>
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2'>
                <InputIconLock />
              </div>

              <input
                value={form.password}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    password: e.target.value,
                  }))
                }
                type={showPassword ? "text" : "password"}
                autoComplete='current-password'
                placeholder='••••••••'
                className='w-full rounded-xl border border-[#d5d4f3] bg-white py-3 pl-11 pr-12 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/30'
              />

              <button
                type='button'
                aria-label='Toggle password visibility'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-600 hover:bg-zinc-100'
              >
                <InputIconEye open={showPassword} />
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <label className='flex items-center gap-2 text-sm text-zinc-700'>
              <input
                type='checkbox'
                checked={form.rememberMe}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    rememberMe: e.target.checked,
                  }))
                }
                className='h-4 w-4 rounded border-[#d5d4f3]'
              />
              Remember me
            </label>

            <Link
              href='#'
              className='text-sm font-medium text-[#4f46e5] underline underline-offset-2'
            >
              Forgot password?
            </Link>
          </div>

          <button
            type='submit'
            disabled={submitting || !canSubmit}
            className='mt-1 h-[46px] w-full rounded-xl bg-[#4f46e5] text-sm font-semibold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>

          <div className='flex items-center gap-3 pt-2'>
            <div className='h-px flex-1 bg-[#d5d4f3]' />
            <div className='text-xs font-semibold text-zinc-400'>or</div>
            <div className='h-px flex-1 bg-[#d5d4f3]' />
          </div>

          <button
            type='button'
            className='flex h-[46px] w-full items-center justify-center gap-3 rounded-xl border border-[#d5d4f3] bg-white text-sm font-medium text-zinc-800 hover:bg-[#fafafa]'
          >
            <span className='flex h-6 w-6 items-center justify-center rounded-full bg-transparent'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 48 48'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
              >
                <path
                  d='M44.5 20H24V28H36.6C35.2 32.5 31 36 24 36C16.3 36 10 29.7 10 22C10 14.3 16.3 8 24 8C27.4 8 30.3 9.2 32.6 11.4L38.2 5.8C34.5 2.4 29.5 0.5 24 0.5C11.8 0.5 2 10.3 2 22C2 33.7 11.8 43.5 24 43.5C36.2 43.5 45 35.1 45 22C45 21.3 44.8 20.7 44.5 20Z'
                  fill='#EA4335'
                />
                <path
                  d='M8.6 14.6L16 20L21.4 15.1C20.7 13.7 20.3 12.2 20.3 10.6C20.3 8.5 21.2 6.6 22.6 5.3L16 0.5C12.1 4 9.7 9 9.7 14.6H8.6Z'
                  fill='#4285F4'
                />
                <path
                  d='M22.6 5.3C24 4 25.8 3.3 27.7 3.3C30.1 3.3 32.3 4.1 33.9 5.7L40 0.5C36.7 -2.4 31.9 -4 27.7 -4C22.2 -4 17.2 -1.8 13.7 2L22.6 5.3Z'
                  fill='#34A853'
                />
              </svg>
            </span>
            Continue with Google
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
