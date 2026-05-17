import { NextResponse } from "next/server";

import { axiosServer } from "@/core/http/axiosServer";

type CvActiveResponse = {
  cvId: string | null;
  fileUrl: string | null;
  uploadedAt: string | null;
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

export async function GET() {
  try {
    const res =
      await axiosServer.get<ApiResponse<CvActiveResponse | null>>(
        "/api/cvs/active",
      );

    return NextResponse.json(res.data.data);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Proxy active CV failed",
    };

    return NextResponse.json(data, { status });
  }
}
