import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";

export default async function KanbanPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <DashboardShell pageTitle='Kanban Board'>
      <KanbanBoard />
    </DashboardShell>
  );
}
