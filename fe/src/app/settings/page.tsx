import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SettingsPageClient } from "@/features/settings/components/SettingsPageClient";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return <SettingsPageClient />;
}
