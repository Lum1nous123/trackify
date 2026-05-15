import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_BASE_URL } from "@/core/http/axiosServer";

type MeResponse = {
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "TRACKIFY_REFRESH_TOKEN";

const buildCookieHeader = async (): Promise<string> => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  return [
    accessToken ? `${ACCESS_COOKIE_NAME}=${accessToken}` : "",
    refreshToken ? `${REFRESH_COOKIE_NAME}=${refreshToken}` : "",
  ]
    .filter(Boolean)
    .join("; ");
};

export async function PATCH(request: Request) {
  const formData = await request.formData();

  const fullNameRaw = formData.get("fullName");
  const fullName =
    typeof fullNameRaw === "string" ? fullNameRaw.trim() : undefined;

  const avatarRaw = formData.get("avatar");
  const avatarFile = avatarRaw instanceof File ? avatarRaw : undefined;

  const body = new FormData();

  // Don’t send fullName when it’s blank (backend treats blank as no-op).
  if (fullName !== undefined && fullName.length > 0) {
    body.append("fullName", fullName);
  }

  if (avatarFile) {
    body.append("avatar", avatarFile, avatarFile.name || "avatar.png");
  }

  const cookieHeader = await buildCookieHeader();

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/users/me`, {
      method: "PATCH",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      body,
    });

    const data = (await res.json().catch(() => null)) ?? {
      message: "Proxy update profile failed",
    };

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Proxy update profile failed" },
      { status: 500 },
    );
  }
}
