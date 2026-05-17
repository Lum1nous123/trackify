import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import ApplicationsClient from "@/features/applications/components/ApplicationsClient";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";

export default async function ApplicationsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <DashboardShell pageTitle='My Applications'>
      <ApplicationsClient />
    </DashboardShell>
  );
}
