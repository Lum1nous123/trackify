import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "TRACKIFY_REFRESH_TOKEN";

const getCookieSecure = (): boolean => {
  return (
    process.env.TRACKIFY_JWT_COOKIE_SECURE === "true" ||
    process.env.TRACKIFY_COOKIE_SECURE === "true"
  );
};

type LoginRequestBody = {
  email: string;
  password: string;
};

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequestBody;

  try {
    const res = await axiosServer.post<AuthTokensResponse>(
      "/api/auth/login",
      body,
    );

    const response = NextResponse.json({ ok: true });

    response.cookies.set(ACCESS_COOKIE_NAME, res.data.accessToken, {
      httpOnly: true,
      secure: getCookieSecure(),
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set(REFRESH_COOKIE_NAME, res.data.refreshToken, {
      httpOnly: true,
      secure: getCookieSecure(),
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? { message: "Proxy login failed" };

    return NextResponse.json(data, { status });
  }
}
