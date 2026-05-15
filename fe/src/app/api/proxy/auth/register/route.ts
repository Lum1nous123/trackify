import { NextResponse } from "next/server";
import { BACKEND_BASE_URL, axiosServer } from "@/core/http/axiosServer";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "TRACKIFY_REFRESH_TOKEN";

const getCookieSecure = (): boolean => {
  return (
    process.env.TRACKIFY_JWT_COOKIE_SECURE === "true" ||
    process.env.TRACKIFY_COOKIE_SECURE === "true"
  );
};

type RegisterRequestBody = {
  email: string;
  password: string;
  username: string;
  fullName: string;
};

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterRequestBody;

  try {
    const res = await axiosServer.post<AuthTokensResponse>(
      "/api/auth/register",
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
      message?: string;
      code?: string;
    };

    const status = axiosError.response?.status ?? 500;

    if (axiosError.response?.data) {
      return NextResponse.json(axiosError.response.data, { status });
    }

    return NextResponse.json(
      {
        message: axiosError.message ?? "Proxy register failed",
        code: axiosError.code,
        backendBaseUrl: BACKEND_BASE_URL,
      },
      { status },
    );
  }
}
