"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLogo } from "@/features/auth/components/AuthLogo";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { axiosClient } from "@/core/http/axiosClient";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

type RegisterForm = {
  email: string;
  username: string;
  fullName: string;
  password: string;
};

const InputIconMail = ({ className }: { className?: string }) => (
  <Mail
    className={className ? className : "text-[#6B7280]"}
    width={18}
    height={18}
    aria-hidden='true'
  />
);

const InputIconUser = ({ className }: { className?: string }) => (
  <User
    className={className ? className : "text-[#6B7280]"}
    width={18}
    height={18}
    aria-hidden='true'
  />
);

const InputIconLock = ({ className }: { className?: string }) => (
  <Lock
    className={className ? className : "text-[#6B7280]"}
    width={18}
    height={18}
    aria-hidden='true'
  />
);

const InputIconEye = ({
  className,
  open,
}: {
  className?: string;
  open: boolean;
}) => {
  const iconClass = className ? className : "text-[#6B7280]";

  return open ? (
    <Eye
      className={iconClass}
      width={20}
      height={20}
      aria-hidden='true'
    />
  ) : (
    <EyeOff
      className={iconClass}
      width={20}
      height={20}
      aria-hidden='true'
    />
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
