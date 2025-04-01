import { toast } from 'react-toastify';

export interface ErrorResponseData {
  response: {
    data: {
      error_code: string;
      error_message: string;
    };
  };
  message?: string;
}

export function errorHandler(error: ErrorResponseData, errorMessage: string): void {
  if (error.response?.data?.error_message) {
    toast.error(error.response.data.error_message);
  } else {
    toast.error(errorMessage);
  }
}
