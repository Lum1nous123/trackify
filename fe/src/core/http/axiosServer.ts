import axios, { type AxiosInstance } from "axios";
import { cookies } from "next/headers";

export const getBackendBaseUrl = (): string => {
  const fromEnv =
    process.env.TRACKIFY_BACKEND_URL ??
    process.env.NEXT_PUBLIC_TRACKIFY_BACKEND_URL ??
    "";

  // Fallback for local dev (you can override via TRACKIFY_BACKEND_URL)
  return fromEnv || "http://localhost:8081";
};

export const BACKEND_BASE_URL = getBackendBaseUrl();

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "TRACKIFY_REFRESH_TOKEN";

const buildCookieHeader = async (): Promise<string> => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  return [
    accessToken ? `${ACCESS_COOKIE_NAME}=${accessToken}` : "",
    refreshToken ? `${REFRESH_COOKIE_NAME}=${refreshToken}` : "",
  ]
    .filter(Boolean)
    .join("; ");
};

export const axiosServer: AxiosInstance = axios.create({
  baseURL: getBackendBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosServer.interceptors.request.use(async (config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  // Avoid sending multipart requests with application/json header.
  if (isFormData) {
    const headers = config.headers as Record<string, unknown> | undefined;
    if (headers && typeof headers === "object" && "Content-Type" in headers) {
      delete headers["Content-Type"];
    }
  }

  const cookieHeader = await buildCookieHeader();

  if (cookieHeader) {
    const headers = config.headers as unknown as
      | { set?: (name: string, value: string) => unknown; [k: string]: unknown }
      | undefined;

    if (headers?.set) {
      headers.set("cookie", cookieHeader);
    } else {
      (config.headers as any) = {
        ...(config.headers as any),
        cookie: cookieHeader,
      };
    }
  }

  return config;
});
