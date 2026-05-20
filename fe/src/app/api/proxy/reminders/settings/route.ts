import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

export async function GET() {
  try {
    const res = await axiosServer.get("/api/reminder-settings");
    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Get reminder settings failed",
    };

    return NextResponse.json(data, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const res = await axiosServer.put("/api/reminder-settings", body);

    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Update reminder settings failed",
    };

    return NextResponse.json(data, { status });
  }
}
