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

type CvUploadResponse = {
  cvId: string;
  fileUrl: string;
};

export async function POST(request: Request) {
  const formData = await request.formData();

  const cvRaw = formData.get("cv");
  const cvFile = cvRaw instanceof File ? cvRaw : undefined;

  if (!cvFile) {
    return NextResponse.json(
      { message: "CV file is required" },
      { status: 400 },
    );
  }

  const body = new FormData();
  body.append("cv", cvFile, cvFile.name || "cv.pdf");

  try {
    const res = await axiosServer.post<ApiResponse<CvUploadResponse>>(
      "/api/cvs/upload",
      body,
    );

    // Keep backend ApiResponse shape for client error handling (message/errorCode/etc.)
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? { message: "CV upload failed" };

    return NextResponse.json(data, { status });
  }
}
