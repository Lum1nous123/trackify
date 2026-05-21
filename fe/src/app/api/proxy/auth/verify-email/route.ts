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

type VerifyRequestBody = {
  email: string;
  code: string;
};

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

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

export async function POST(request: Request) {
  const body = (await request.json()) as VerifyRequestBody;

  try {
    const res = await axiosServer.post<ApiResponse<AuthTokensResponse>>(
      "/api/auth/verify-email",
      body,
    );

    const response = NextResponse.json({ ok: true });

    const tokens = res.data.data;

    if (!tokens?.accessToken || !tokens?.refreshToken) {
      return NextResponse.json(
        { message: "Proxy verify-email failed: missing tokens" },
        { status: 500 },
      );
    }

    response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
      httpOnly: true,
      secure: getCookieSecure(),
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
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
    };

    const status = axiosError.response?.status ?? 500;

    if (axiosError.response?.data) {
      return NextResponse.json(axiosError.response.data, { status });
    }

    return NextResponse.json(
      {
        message: axiosError.message ?? "Proxy verify-email failed",
      },
      { status },
    );
  }
}
