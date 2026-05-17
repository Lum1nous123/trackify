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

type StatusConversionRateResponse = {
  fromStatus: string;
  toStatus: string;
  rate: number; // [0..1]
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
    const res = await axiosServer.get<
      ApiResponse<StatusConversionRateResponse[]>
    >("/api/jobs/status-conversion-rates", {
      params: { userId, limit },
    });

    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Get status conversion rates failed",
    };

    return NextResponse.json(data, { status });
  }
}
