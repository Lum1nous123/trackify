import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

export async function POST() {
  try {
    const res = await axiosServer.post(`/api/reminder-logs/unread/mark-read`);
    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Mark reminder logs as read failed",
    };

    return NextResponse.json(data, { status });
  }
}
