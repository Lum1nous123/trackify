import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { message: "userId is required" },
      { status: 400 },
    );
  }

  try {
    const res = await axiosServer.get<ApiResponse<Record<string, number>>>(
      "/api/jobs/pipeline-funnel",
      { params: { userId } },
    );

    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Get pipeline funnel failed",
    };

    return NextResponse.json(data, { status });
  }
}
