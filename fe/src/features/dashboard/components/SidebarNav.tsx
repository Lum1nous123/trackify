"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { axiosClient } from "@/core/http/axiosClient";
import { useMe } from "@/hooks/useAuth";
import LogoSvg from "@/app/logo/LogoSvg";
import { useQueryClient } from "@tanstack/react-query";

const NavItemIcon = ({
  kind,
  active,
}: {
  kind: "dashboard" | "kanban" | "applications" | "analytics" | "settings";
  active?: boolean;
}) => {
  const stroke = active ? "#ffffff" : "#A5B4FC";
  const common = {
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "dashboard":
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          {...common}
        >
          <path d='M4 13V5a2 2 0 0 1 2-2h4v10H4Z' />
          <path d='M14 3h4a2 2 0 0 1 2 2v6h-6V3Z' />
          <path d='M4 21a2 2 0 0 1 2-2h4v4H6a2 2 0 0 1-2-2Z' />
          <path d='M14 15h6v4a2 2 0 0 1-2 2h-4v-6Z' />
        </svg>
      );
    case "kanban":
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          {...common}
        >
          <path d='M4 6h16' />
          <path d='M7 6v15' />
          <path d='M12 6v15' />
          <path d='M17 6v15' />
        </svg>
      );
    case "applications":
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          {...common}
        >
          <path d='M8 6h13' />
          <path d='M8 12h13' />
          <path d='M8 18h13' />
          <path d='M3 6h.01' />
          <path d='M3 12h.01' />
          <path d='M3 18h.01' />
        </svg>
      );
    case "analytics":
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          {...common}
        >
          <path d='M4 19V5' />
          <path d='M4 19h16' />
          <path d='M8 15l3-3 3 2 5-7' />
        </svg>
      );
    case "settings":
      return (
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          {...common}
        >
          <path d='M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z' />
          <path d='M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2 2 0 0 1-1.4 3.4 2 2 0 0 1-1.5-.6l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.7V23a2 2 0 0 1-4 0v-.1a1.8 1.8 0 0 0-1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1H1a2 2 0 0 1 0-4h.1a1.8 1.8 0 0 0 1.7-1 1.8 1.8 0 0 0-.4-2l-.1-.1A2 2 0 0 1 5.1 2.5l.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1-1.7V1a2 2 0 0 1 4 0v.1a1.8 1.8 0 0 0 1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1H23a2 2 0 0 1 0 4h-.1a1.8 1.8 0 0 0-1.7 1Z' />
        </svg>
      );
    default:
      return null;
  }
};

type NavLink = {
  key: string;
  label: string;
  href?: string;
  active?: boolean;
  icon: "dashboard" | "kanban" | "applications" | "analytics" | "settings";
};

const NAV: NavLink[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  { key: "kanban", label: "Kanban Board", href: "/kanban", icon: "kanban" },
  {
    key: "applications",
    label: "Applications",
    href: "/applications",
    icon: "applications",
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/analytics",
    icon: "analytics",
  },
  { key: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

const truncateEmail = (email: string) => {
  if (email.length <= 16) return email;
  return `${email.slice(0, 12)}...`;
};

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: me } = useMe();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = me?.fullName || me?.username || "User";
  const emailText = me?.email ? truncateEmail(me.email) : "—";

  const avatarLetter = useMemo(() => {
    const email = (me?.email ?? "").trim();
    if (!email) return "U";
    return email[0]!.toUpperCase();
  }, [me?.email]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      // Clear both access+refresh cookies (see: fe/src/app/api/proxy/auth/clear-tokens/route.ts)
      await axiosClient.post("/api/proxy/auth/clear-tokens");
    } catch {
      // Even if the request fails, still clear client cache + redirect
    } finally {
      queryClient.clear();
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className='fixed left-0 top-0 z-20 h-screen w-[260px] bg-[#0F172A] text-white'>
      <div className='flex h-full flex-col'>
        <div className='px-6 pt-6'>
          <div className='flex items-center gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10'>
              <LogoSvg />
            </div>
            <div className='flex flex-col leading-none'>
              <div className='text-[16px] font-extrabold tracking-tight'>
                Trackify
              </div>
            </div>
          </div>
        </div>

        <nav className='mt-7 flex-1 px-3'>
          <div className='space-y-1'>
            {NAV.map((item) => {
              const base =
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors";
              const active =
                "bg-indigo-600/90 text-white shadow-[0_10px_25px_rgba(99,102,241,0.25)]";
              const inactive =
                "text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-transparent group-hover:ring-white/10";

              const isActive = item.href ? pathname === item.href : false;

              const cls = `${base} ${isActive ? active : inactive}`;

              return item.href ? (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cls}
                  aria-current={isActive ? "page" : undefined}
                >
                  <NavItemIcon
                    kind={item.icon}
                    active={isActive}
                  />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div
                  key={item.key}
                  className={cls}
                  role='button'
                  tabIndex={0}
                  aria-disabled='true'
                >
                  <NavItemIcon
                    kind={item.icon}
                    active={false}
                  />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </nav>

        <div className='border-t border-white/10 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div
              className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10'
              aria-hidden='true'
            >
              {me?.avatarUrl ? (
                <img
                  src={me.avatarUrl}
                  alt='User avatar'
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='text-[14px] font-extrabold text-[#A5B4FC]'>
                  {avatarLetter}
                </div>
              )}
            </div>

            <div className='min-w-0 flex-1'>
              <div className='truncate text-[13px] font-semibold'>
                {displayName}
              </div>
              <div className='truncate text-[12px] text-white/60'>
                {emailText}
              </div>
            </div>

            <button
              type='button'
              onClick={handleLogout}
              disabled={isLoggingOut}
              className='rounded-xl bg-white/10 px-3 py-2 text-[12px] font-semibold text-white ring-1 ring-white/20 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
