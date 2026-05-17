import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const id = params.id;

  const body = (await request.json()) as { status: string };

  try {
    const res = await axiosServer.patch(`/api/jobs/${id}/status`, body);

    return NextResponse.json(res.data.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Patch job status failed",
    };

    return NextResponse.json(data, { status });
  }
}
