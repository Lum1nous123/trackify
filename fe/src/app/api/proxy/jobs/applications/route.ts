import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

export async function GET() {
  try {
    const res = await axiosServer.get("/api/jobs/applications");

    // BE: ApiResponse.success(status, data) => we want only "data"
    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Get applications failed",
    };

    return NextResponse.json(data, { status });
  }
}
