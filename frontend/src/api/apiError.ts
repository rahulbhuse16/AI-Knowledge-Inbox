import axios from "axios";

interface ApiErrorResponse {
  detail?: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  return (
    error.response?.data?.detail ||
    error.message ||
    fallback
  );
}