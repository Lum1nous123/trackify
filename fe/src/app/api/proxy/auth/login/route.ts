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

const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
  };
};

type LoginRequestBody = {
  email: string;
  password: string;
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
  const body = (await request.json()) as LoginRequestBody;

  try {
    const res = await axiosServer.post<ApiResponse<AuthTokensResponse>>(
      "/api/auth/login",
      body,
    );

    const response = NextResponse.json({ ok: true });

    const tokens = res.data.data;

    if (!tokens?.accessToken || !tokens?.refreshToken) {
      return NextResponse.json(
        { message: "Proxy login failed: missing tokens" },
        { status: 500 },
      );
    }

    const cookieConfig = getCookieConfig();

    response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
      httpOnly: true,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      path: "/",
    });

    response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
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
