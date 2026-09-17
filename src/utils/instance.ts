import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export interface FormattedApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export function isFormattedApiError(error: object | null): error is FormattedApiError {
  return (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    "statusCode" in error
  );
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  const port = process.env.PORT || 3000;
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:${port}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${port}`;
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    const sessionMatch = document.cookie.match(new RegExp("(^| )diamond_session=([^;]+)"));
    if (sessionMatch?.[2]) {
      return sessionMatch[2];
    }
    const legacyMatch = document.cookie.match(new RegExp("(^| )diamond_auth_token=([^;]+)"));
    if (legacyMatch?.[2]) {
      return legacyMatch[2];
    }
    return localStorage.getItem("diamond_auth_token");
  }

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return (
      cookieStore.get("diamond_session")?.value ||
      cookieStore.get("diamond_auth_token")?.value ||
      null
    );
  } catch {
    return null;
  }
}

export const axiosInstance: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.baseURL && !config.url?.startsWith("http")) {
      config.baseURL = getBaseUrl();
    }

    const bypassSecret =
      process.env.VERCEL_AUTOMATION_BYPASS_SECRET ||
      process.env.VERCEL_PROTECTION_BYPASS;
    if (bypassSecret && !config.headers["x-vercel-protection-bypass"]) {
      config.headers["x-vercel-protection-bypass"] = bypassSecret;
    }

    const token = await getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(formatAxiosError(error));
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(formatAxiosError(error));
  }
);

export function formatAxiosError(error: AxiosError): FormattedApiError {
  const responseData = error.response?.data as
    | {
        error?: string;
        message?: string | { message?: string; code?: string };
        errors?: Record<string, string[]>;
      }
    | undefined;

  let message = "An unexpected error occurred.";
  if (typeof responseData?.error === "string") {
    message = responseData.error;
  } else if (typeof responseData?.message === "string") {
    message = responseData.message;
  } else if (responseData?.message && typeof responseData.message === "object") {
    message = responseData.message.message || JSON.stringify(responseData.message);
  } else if (error.message) {
    message = error.message;
  }

  const statusCode = error.response?.status || 500;
  const errors = responseData?.errors;

  return {
    message,
    statusCode,
    errors,
  };
}

export async function apiCall<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error && "message" in error) {
      throw error as FormattedApiError;
    }
    if (error instanceof AxiosError) {
      throw formatAxiosError(error);
    }
    const standardMessage = error instanceof Error ? error.message : "Request failed";
    const formatted: FormattedApiError = {
      message: standardMessage,
      statusCode: 500,
    };
    throw formatted;
  }
}
