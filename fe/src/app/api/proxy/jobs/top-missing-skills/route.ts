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

type TopMissingSkillResponse = {
  skillName: string;
  count: number;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const limitRaw = url.searchParams.get("limit");

  const limit = limitRaw ? Number(limitRaw) : NaN;

  if (!userId || !Number.isFinite(limit) || limit <= 0) {
    return NextResponse.json(
      { message: "userId and positive limit are required" },
      { status: 400 },
    );
  }

  try {
    const res = await axiosServer.get<ApiResponse<TopMissingSkillResponse[]>>(
      "/api/jobs/top-missing-skills",
      {
        params: { userId, limit },
      },
    );

    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Get top missing skills failed",
    };

    return NextResponse.json(data, { status });
  }
}
