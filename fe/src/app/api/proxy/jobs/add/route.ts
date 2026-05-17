import { NextResponse } from "next/server";
import { axiosServer } from "@/core/http/axiosServer";

type CreateJobRequestBody = {
  companyName: string;
  position: string;

  jobDescriptionUrl?: string;
  jobDescriptionText?: string;

  applicationDeadline?: string; // yyyy-mm-dd
  companyLogoUrl?: string;

  personalNotes?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreateJobRequestBody;

  try {
    const res = await axiosServer.post("/api/jobs/add", body);

    // payload from backend already matches ApiResponse.success format
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? { message: "Create job failed" };

    return NextResponse.json(data, { status });
  }
}
