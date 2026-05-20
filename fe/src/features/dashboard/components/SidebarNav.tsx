"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { axiosClient } from "@/core/http/axiosClient";
import { useMe } from "@/hooks/useAuth";
import LogoSvg from "@/app/logo/LogoSvg";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const NavItemIcon = ({
  kind,
  active,
}: {
  kind: "dashboard" | "kanban" | "applications" | "analytics" | "settings";
  active?: boolean;
}) => {
  const color = active ? "#ffffff" : "#5e6ad2";

  const common = {
    size: 18,
    strokeWidth: 1.8,
    color,
    "aria-hidden": true,
  } as const;

  switch (kind) {
    case "dashboard":
      return <LayoutDashboard {...common} />;
    case "kanban":
      return <KanbanSquare {...common} />;
    case "applications":
      return <FileText {...common} />;
    case "analytics":
      return <BarChart3 {...common} />;
    case "settings":
      return <Settings {...common} />;
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
    <aside className='fixed left-0 top-0 z-20 h-screen w-[260px] bg-[#0f1011] text-[#f7f8f8]'>
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
                "bg-[#5e6ad2]/90 text-white shadow-[0_10px_25px_rgba(94,106,210,0.25)]";
              const inactive =
                "text-[#d0d6e0]/80 hover:bg-[#141516] hover:text-[#f7f8f8] ring-1 ring-transparent group-hover:ring-[#23252a]";

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

        <div className='border-t border-[#23252a] px-6 py-4'>
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
                <div className='text-[14px] font-extrabold text-[#5e6ad2]'>
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
              className='rounded-xl bg-white/10 px-3 py-2 text-[12px] font-semibold text-white ring-1 ring-[#23252a] hover:bg-[#141516] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
