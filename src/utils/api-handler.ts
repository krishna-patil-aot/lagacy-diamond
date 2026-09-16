import { toast } from "sonner";
import { FormattedApiError, isFormattedApiError } from "./instance";

export interface ApiHandlerOptions<T> {
  successMessage?: string | ((data: T) => string);
  errorMessage?: string | ((error: FormattedApiError) => string);
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: FormattedApiError) => void;
}

export interface ApiHandlerResult<T> {
  data: T | null;
  error: FormattedApiError | null;
  success: boolean;
}

export async function apiHandler<T>(
  action: () => Promise<T>,
  options: ApiHandlerOptions<T> = {}
): Promise<ApiHandlerResult<T>> {
  const {
    successMessage,
    errorMessage,
    showSuccessToast = Boolean(successMessage),
    showErrorToast = true,
    onSuccess,
    onError,
  } = options;

  try {
    const data = await action();

    if (showSuccessToast && successMessage) {
      const msg = typeof successMessage === "function" ? successMessage(data) : successMessage;
      toast.success(msg);
    }

    if (onSuccess) {
      onSuccess(data);
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (err) {
    let formattedError: FormattedApiError;

    if (isFormattedApiError(err as object)) {
      formattedError = err as FormattedApiError;
    } else if (err instanceof Error) {
      formattedError = {
        message: err.message,
        statusCode: 500,
      };
    } else {
      formattedError = {
        message: "An unexpected error occurred.",
        statusCode: 500,
      };
    }

    if (showErrorToast) {
      switch (formattedError.statusCode) {
        case 401:
          toast.error("Session Expired", {
            description: "Your session has expired. Please sign in again with Admin credentials.",
          });
          break;
        case 403:
          toast.error("Access Forbidden", {
            description: "You do not have curator privileges to perform this operation.",
          });
          break;
        case 429:
          toast.error("Rate Limit Exceeded", {
            description: "Too many vault requests. Please wait a moment before trying again.",
          });
          break;
        case 500:
          toast.error("Vault Server Error", {
            description: formattedError.message || "Internal server error occurred.",
          });
          break;
        default: {
          const customMsg =
            typeof errorMessage === "function"
              ? errorMessage(formattedError)
              : errorMessage || formattedError.message;
          toast.error("Action Failed", { description: customMsg });
          break;
        }
      }
    }

    if (onError) {
      onError(formattedError);
    }

    return {
      data: null,
      error: formattedError,
      success: false,
    };
  }
}
