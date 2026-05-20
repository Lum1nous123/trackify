import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") ?? "20";

    const res = await axiosServer.get(
      `/api/reminder-logs?limit=${encodeURIComponent(limit)}`,
    );

    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Get reminder logs failed",
    };

    return NextResponse.json(data, { status });
  }
}
