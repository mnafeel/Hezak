import { toast } from 'react-hot-toast';
import type { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message?: string;
  errors?: string[];
  issues?: Array<{ path: (string | number)[]; message: string }>;
  error?: string;
}

/**
 * Extracts a user-friendly error message from an API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorData = axiosError.response?.data;

    if (errorData) {
      // Check for array of error messages
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return errorData.errors.join('. ');
      }

      // Check for Zod validation issues
      if (errorData.issues && Array.isArray(errorData.issues) && errorData.issues.length > 0) {
        const messages = errorData.issues.map((issue) => {
          const path = issue.path.length > 0 ? issue.path.join('.') : 'field';
          return `${path}: ${issue.message}`;
        });
        return messages.join('. ');
      }

      // Check for single error message
      if (errorData.message) {
        return errorData.message;
      }

      if (errorData.error) {
        return errorData.error;
      }
    }

    // Handle HTTP status codes
    const status = axiosError.response?.status;
    if (status) {
      switch (status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'You are not authorized. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This resource already exists.';
        case 422:
          return 'Validation error. Please check your input.';
        case 500:
          return 'Server error. Please try again later or contact support.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return `Request failed with status ${status}. Please try again.`;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Shows an error toast with a user-friendly message
 */
export const showError = (error: unknown, defaultMessage = 'An error occurred') => {
  const message = getErrorMessage(error);
  toast.error(message || defaultMessage);
  console.error('Error details:', error);
  return message;
};

/**
 * Shows a success toast
 */
export const showSuccess = (message: string) => {
  toast.success(message);
};


