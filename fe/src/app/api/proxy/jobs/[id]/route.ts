import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

type UpdateJobRequestBody = {
  companyName?: string;
  position?: string;

  jobDescriptionUrl?: string;
  jobDescriptionText?: string;

  applicationDeadline?: string; // yyyy-mm-dd
  companyLogoUrl?: string;

  personalNotes?: string;
};

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const id = params.id;

  const body = (await request.json()) as UpdateJobRequestBody;

  try {
    const res = await axiosServer.put(`/api/jobs/${id}`, body);
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? { message: "Update job failed" };

    return NextResponse.json(data, { status });
  }
}
