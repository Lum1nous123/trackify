import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { axiosServer } from "@/core/http/axiosServer";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { StatCards } from "@/features/dashboard/components/StatCards";
import { AiSpotlightClient } from "@/features/dashboard/components/AiSpotlightClient";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { UpcomingDeadlines } from "@/features/dashboard/components/UpcomingDeadlines";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { KanbanJobsHydrationBoundary } from "@/features/dashboard/components/KanbanJobsHydrationBoundary";

import { QueryClient, dehydrate } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";

import type {
  ActivityItem,
  DashboardStat,
  DeadlineItem,
} from "@/features/dashboard/mock/mockData";

import type {
  JobKanbanResponse,
  JobKanbanCard,
} from "@/features/kanban/types/kanban";
import type { Tint } from "@/features/dashboard/utils/tints";
import { buildClearbitLogoUrl } from "@/features/kanban/utils/clearbit";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";

type ApiResponse<T> = {
  status: number;
  success: boolean;
  errorCode: string | null;
  message: string | null;
  path: string | null;
  method: string | null;
  details: Record<string, unknown>;
  data: T;
};

type MeResponse = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl?: string | null;
};

type DashboardStatsResponse = {
  interviewsThisWeek: number;
  pendingResponses: number;
  thisMonth: number;
  upcomingDeadlines: number;
};

type UpcomingDeadlineItemResponse = {
  id: string;
  companyName: string;
  position: string;
  deadline: string | null;
};

function toLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysUntil(deadlineIsoDate?: string | null): number | null {
  if (!deadlineIsoDate) return null;
  const target = new Date(`${deadlineIsoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const today = toLocalMidnight(now);
  const targetMidnight = toLocalMidnight(target);
  const diffMs = targetMidnight.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function urgencyTintFromDays(diff: number | null | undefined): Tint {
  if (diff === null || diff === undefined) return "indigo";
  if (diff < 0) return "amber";
  if (diff === 0) return "violet";
  if (diff <= 3) return "amber";
  if (diff <= 10) return "cyan";
  return "indigo";
}

function whenTextFromDays(diff: number | null | undefined): string {
  if (diff === null || diff === undefined) return "No deadline";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return "Due Today";
  if (diff === 1) return "1 day left";
  return `${diff} days left`;
}

function relTimeFromIso(iso: string): string {
  const date = new Date(iso);
  const ms = Date.now() - date.getTime();
  const hours = Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function statusText(status: string): string {
  if (status === "SAVED") return "Saved";
  if (status === "APPLIED") return "Applied";
  if (status === "INTERVIEW") return "Interviewing";
  if (status === "OFFER") return "Offer Received";
  if (status === "REJECT") return "Rejected";
  return status;
}

function tintFromStatus(status: string): Tint {
  if (status === "APPLIED") return "violet";
  if (status === "INTERVIEW") return "indigo";
  if (status === "OFFER") return "amber";
  if (status === "REJECT") return "amber";
  return "cyan";
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const meRes = await axiosServer.get<ApiResponse<MeResponse>>("/api/auth/me");
  const userId = meRes.data.data.id;

  const dashboardStatsRes = await axiosServer.get<
    ApiResponse<DashboardStatsResponse>
  >("/api/jobs/dashboard-stats", { params: { userId } });
  const dashboardStats = dashboardStatsRes.data.data;

  const upcomingDeadlinesRes = await axiosServer.get<
    ApiResponse<UpcomingDeadlineItemResponse[]>
  >("/api/jobs/upcoming-deadlines", { params: { userId, limit: 4 } });
  const upcomingDeadlines = upcomingDeadlinesRes.data.data;

  const kanbanRes =
    await axiosServer.get<ApiResponse<JobKanbanResponse>>("/api/jobs/kanban");
  const kanban = kanbanRes.data.data;

  // Prefetch/seed React Query cache for dashboard client components (AiSpotlight, QuickActions)
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.kanban.jobs(), kanban);
  const dehydratedState = dehydrate(queryClient);

  const stats: DashboardStat[] = [
    {
      key: "interviewsThisWeek",
      title: "INTERVIEWS THIS WEEK",
      value: `${dashboardStats.interviewsThisWeek}`,
      accent: "indigo",
    },
    {
      key: "pendingResponses",
      title: "PENDING RESPONSES",
      value: `${dashboardStats.pendingResponses}`,
      accent: "amber",
    },
    {
      key: "thisMonth",
      title: "THIS MONTH",
      value: `${dashboardStats.thisMonth}`,
      accent: "violet",
    },
    {
      key: "upcomingDeadlines",
      title: "UPCOMING DEADLINES",
      value: `${dashboardStats.upcomingDeadlines}`,
      accent: "cyan",
    },
  ];

  const companyLogoByName = new Map<string, string>();

  for (const card of kanban?.cards ?? []) {
    const name = card.companyName?.trim();
    const logo = card.companyLogoUrl?.trim();
    if (!name || !logo) continue;
    if (!companyLogoByName.has(name)) {
      companyLogoByName.set(name, logo);
    }
  }

  const upcomingDeadlineItems: DeadlineItem[] = upcomingDeadlines.map(
    (item) => {
      const diff = daysUntil(item.deadline);
      const companyName = item.companyName ?? "";
      const companyNameTrimmed = companyName.trim();
      const companyInitial =
        companyNameTrimmed.slice(0, 1).toUpperCase() || "•";

      const tint = urgencyTintFromDays(diff);

      const companyLogoUrl =
        companyLogoByName.get(companyNameTrimmed) ??
        buildClearbitLogoUrl({
          companyName,
        });

      return {
        id: item.id,
        companyInitial,
        companyLogoUrl,
        title: companyName,
        subtitle: item.position,
        whenText: whenTextFromDays(diff),
        urgencyTint: tint,
      };
    },
  );

  const flatCardActivities: Array<{
    card: JobKanbanCard;
    activity: {
      id: string;
      text: string;
      changedAt: string;
      toStatus?: JobKanbanCard["status"];
    };
  }> = (kanban?.cards ?? []).flatMap((card) =>
    (card.activity ?? []).map((activity) => ({
      card,
      activity,
    })),
  );

  flatCardActivities.sort(
    (a, b) =>
      new Date(b.activity.changedAt).getTime() -
      new Date(a.activity.changedAt).getTime(),
  );

  // RecentActivity (Recent Activity) should show at most 1 line per card/job:
  // - Keep the newest activity for each card.id
  // - Then take top 4 by newest activity.changedAt
  const newestActivityByCardId = new Map<
    JobKanbanCard["id"],
    (typeof flatCardActivities)[number]
  >();

  for (const item of flatCardActivities) {
    if (!newestActivityByCardId.has(item.card.id)) {
      newestActivityByCardId.set(item.card.id, item);
    }
  }

  const recentItems: ActivityItem[] = Array.from(
    newestActivityByCardId.values(),
  )
    .sort(
      (a, b) =>
        new Date(b.activity.changedAt).getTime() -
        new Date(a.activity.changedAt).getTime(),
    )
    .slice(0, 4)
    .map(({ card, activity }) => {
      const companyName = card.companyName ?? "";
      const initials = companyName.trim().slice(0, 1).toUpperCase() || "•";
      const when = relTimeFromIso(activity.changedAt);

      const pillStatus = activity.toStatus ?? card.status;
      const stText = statusText(pillStatus);

      const companyLogoUrl =
        card.companyLogoUrl ??
        buildClearbitLogoUrl({
          companyLogoUrl: card.companyLogoUrl,
          jdUrl: card.jdUrl,
          companyName,
        });

      return {
        id: activity.id,
        initials,
        name: companyName,
        company: card.position,
        companyLogoUrl,
        statusText: stText,
        whenText: `${stText} • ${when}`,
        tint: tintFromStatus(pillStatus),
      };
    });

  return (
    <DashboardShell pageTitle='Dashboard'>
      <div className='flex flex-col gap-6 pb-10'>
        <StatCards stats={stats} />

        <div className='flex flex-col gap-6'>
          <KanbanJobsHydrationBoundary dehydratedState={dehydratedState}>
            <>
              <section className='col-span-12 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.35),0_12px_35px_rgba(0,0,0,0.18)]'>
                <AiSpotlightClient />
              </section>

              <div className='grid grid-cols-12 gap-6'>
                <section className='col-span-12 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.35),0_12px_35px_rgba(0,0,0,0.18)] md:col-span-4'>
                  <QuickActions />
                </section>

                <section className='col-span-12 rounded-2xl bg-[#0f1011] border border-[#23252a] p-6 shadow-[0_1px_0_rgba(35,37,42,0.35),0_12px_35px_rgba(0,0,0,0.18)] md:col-span-8'>
                  <RecentActivity items={recentItems} />
                </section>
              </div>
            </>
          </KanbanJobsHydrationBoundary>
        </div>

        <UpcomingDeadlines items={upcomingDeadlineItems} />
      </div>
    </DashboardShell>
  );
}
