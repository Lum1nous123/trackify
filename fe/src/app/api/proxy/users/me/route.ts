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

type MeResponse = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export async function PATCH(request: Request) {
  const formData = await request.formData();

  const fullNameRaw = formData.get("fullName");
  const fullName =
    typeof fullNameRaw === "string" ? fullNameRaw.trim() : undefined;

  const avatarRaw = formData.get("avatar");
  const avatarFile = avatarRaw instanceof File ? avatarRaw : undefined;

  const body = new FormData();

  // Don’t send fullName when it’s blank (backend treats blank as no-op).
  if (fullName !== undefined && fullName.length > 0) {
    body.append("fullName", fullName);
  }

  if (avatarFile) {
    body.append("avatar", avatarFile, avatarFile.name || "avatar.png");
  }

  try {
    const res = await axiosServer.patch<ApiResponse<MeResponse>>(
      "/api/users/me",
      body,
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: "Proxy update profile failed",
    };

    return NextResponse.json(data, { status });
  }
}
