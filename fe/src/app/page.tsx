import LandingPage from "@/features/landing/components/LandingPage";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "TRACKIFY_REFRESH_TOKEN";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (accessToken || refreshToken) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
