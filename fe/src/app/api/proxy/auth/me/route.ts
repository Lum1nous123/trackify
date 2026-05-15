import { NextResponse } from "next/server";

import { axiosServer } from "@/core/http/axiosServer";

type MeResponse = {
  email: string;
  username: string;
  fullName: string | null;
};

export async function GET() {
  try {
    const res = await axiosServer.get<MeResponse>("/api/auth/me");

    return NextResponse.json(res.data);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? { message: "Proxy me failed" };

    return NextResponse.json(data, { status });
  }
}
