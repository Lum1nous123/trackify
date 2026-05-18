"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLogo } from "@/features/auth/components/AuthLogo";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { axiosClient } from "@/core/http/axiosClient";

type RegisterForm = {
  email: string;
  username: string;
  fullName: string;
  password: string;
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

const InputIconUser = ({ className }: { className?: string }) => (
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
      d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
      stroke='#6B7280'
      strokeWidth='2'
    />
    <path
      d='M20 22C20 17.5817 16.4183 14 12 14C7.58172 14 4 17.5817 4 22'
      stroke='#6B7280'
      strokeWidth='2'
      strokeLinecap='round'
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

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    form.email.trim().length > 0 &&
    form.username.trim().length > 0 &&
    form.fullName.trim().length > 0 &&
    form.password.length >= 8;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await axiosClient.post("/api/proxy/auth/register", {
        email: form.email,
        username: form.username,
        fullName: form.fullName,
        password: form.password,
      });

      window.location.assign("/");
    } catch (err: unknown) {
      const maybe = err as {
        response?: { data?: { message?: string } };
      };

      const message =
        maybe.response?.data?.message ??
        "Register failed. Please check the fields.";

      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      cardTitle='Create account'
      cardSubtitle='Sign up to your account'
      bottomHint={
        <>
          Already have an account?{" "}
          <Link
            href='/login'
            className='font-semibold text-[#4f46e5]'
          >
            Sign in
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
              Username
            </label>

            <div className='relative'>
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2'>
                <InputIconUser />
              </div>
              <input
                value={form.username}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    username: e.target.value,
                  }))
                }
                type='text'
                autoComplete='username'
                placeholder='your_username'
                className='w-full rounded-xl border border-[#d5d4f3] bg-white py-3 pl-11 pr-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/30'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-zinc-900'>
              Full name
            </label>

            <div className='relative'>
              <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2'>
                <InputIconUser />
              </div>
              <input
                value={form.fullName}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    fullName: e.target.value,
                  }))
                }
                type='text'
                autoComplete='name'
                placeholder='Your full name'
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
                autoComplete='new-password'
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

          <button
            type='submit'
            disabled={submitting || !canSubmit}
            className='mt-1 h-[46px] w-full rounded-xl bg-[#4f46e5] text-sm font-semibold text-white shadow-[0_12px_0_rgba(79,70,229,0.12)] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {submitting ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
