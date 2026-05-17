import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AnalyticsShell } from "@/features/dashboard/components/AnalyticsShell";
import AnalyticsClient from "@/features/dashboard/components/AnalyticsClient";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <AnalyticsShell>
      <AnalyticsClient />
    </AnalyticsShell>
  );
}
