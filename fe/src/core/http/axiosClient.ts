import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

type ApiErrorResponse = {
  status: number;
  errorCode: string;
  message: string;
};

type ClearAccessReason = "INVALID_TOKEN";
type ClearAllReason = "REFRESH_TOKEN_INVALID";

type RetriableAxiosRequestConfig = AxiosRequestConfig & {
  __trackifyRetriedAfterClearAccess?: boolean;
};

const CLEAR_ACCESS_URL = "/api/proxy/auth/clear-access";
const CLEAR_ALL_URL = "/api/proxy/auth/clear-tokens";

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.status === "number" && typeof v.errorCode === "string";
};

const getErrorResponse = (error: unknown): ApiErrorResponse | null => {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (!isApiErrorResponse(data)) return null;
  return data;
};

let clearAccessPromise: Promise<void> | null = null;
let clearAllPromise: Promise<void> | null = null;

const clearAccessCookie = async (): Promise<void> => {
  if (!clearAccessPromise) {
    clearAccessPromise = axios
      .post(CLEAR_ACCESS_URL)
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        clearAccessPromise = null;
      });
  }
  return clearAccessPromise;
};

const clearAllCookies = async (): Promise<void> => {
  if (!clearAllPromise) {
    clearAllPromise = axios
      .post(CLEAR_ALL_URL)
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        clearAllPromise = null;
      });
  }
  return clearAllPromise;
};

export const axiosClient: AxiosInstance = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  // baseURL intentionally empty: Next proxy routes are same-origin
  baseURL: "",
});

axiosClient.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    const headers = config.headers as Record<string, unknown> | undefined;
    if (headers && typeof headers === "object" && "Content-Type" in headers) {
      delete headers["Content-Type"];
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as
      | RetriableAxiosRequestConfig
      | undefined;
    const errorBody = getErrorResponse(error);

    const status = error.response?.status;

    const errorCode = errorBody?.errorCode;

    if ((status === 401 || status === 403) && errorCode === "INVALID_TOKEN") {
      if (!originalConfig) return Promise.reject(error);

      const config = originalConfig;

      if (config.__trackifyRetriedAfterClearAccess) {
        return Promise.reject(error);
      }

      config.__trackifyRetriedAfterClearAccess = true;

      await clearAccessCookie();

      return axiosClient.request(config);
    }

    if (
      (status === 401 || status === 403) &&
      errorCode === "REFRESH_TOKEN_INVALID"
    ) {
      await clearAllCookies();
    }

    return Promise.reject(error);
  },
);
