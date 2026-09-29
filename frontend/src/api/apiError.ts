import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (typeof data?.detail === "string") {
      return data.detail;
    }


    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item: any) => {
          if (typeof item === "string") return item;
          return item?.msg || "Validation error";
        })
        .join(", ");
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (status === 400) {
      return "Invalid request. Please check your input.";
    }

    if (status === 401) {
      return "You are not authorized. Please log in again.";
    }

    if (status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (status === 404) {
      return "The requested resource was not found.";
    }

    if (status === 408) {
      return "The request timed out. Please try again.";
    }

    if (status === 422) {
      return "Invalid input. Please check the provided data.";
    }

    if (status === 429) {
      return "Too many requests. Please try again later.";
    }

    if (status && status >= 500) {
      return "Server error. Please try again later.";
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Unable to connect to the server. Please check your connection.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}