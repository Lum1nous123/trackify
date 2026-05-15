import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { mockDashboard } from "@/features/dashboard/mock/mockData";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { StatCards } from "@/features/dashboard/components/StatCards";
import { ApplicationPipelineFunnel } from "@/features/dashboard/components/ApplicationPipelineFunnel";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { UpcomingDeadlines } from "@/features/dashboard/components/UpcomingDeadlines";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <DashboardShell pageTitle='Dashboard'>
      <div className='flex flex-col gap-6 pb-10'>
        <StatCards stats={mockDashboard.stats} />

        <div className='grid grid-cols-12 gap-6'>
          {/* Main funnel */}
          <section className='col-span-12 rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_35px_rgba(15,23,42,0.06)] md:col-span-8'>
            <ApplicationPipelineFunnel stages={mockDashboard.pipeline} />
          </section>

          {/* Right column: recent activity */}
          <section className='col-span-12 rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_35px_rgba(15,23,42,0.06)] md:col-span-4'>
            <RecentActivity items={mockDashboard.recentActivity} />
          </section>
        </div>

        <UpcomingDeadlines items={mockDashboard.upcomingDeadlines} />
      </div>
    </DashboardShell>
  );
}
