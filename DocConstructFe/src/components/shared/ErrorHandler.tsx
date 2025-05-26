import { toast } from 'react-toastify';

export interface ErrorResponseData {
  response?: {
    data?: {
      error_params: {
        validation_errors?: {
          [key: string]: string;
        };
      };
      error_code?: string;
      error_message?: string;
      message?: string;
      detail?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  request?: any;
}

export function errorHandler(error: ErrorResponseData, errorMessage: string): void {
  if (error.response?.data?.error_message) {
    toast.error(error.response.data.error_message);
  } else if (error.response?.data?.error_code === 'validation_error') {
    const validationErrors = error.response.data.error_params.validation_errors;
    if (validationErrors) {
      Object.entries(validationErrors).forEach(([key, value]) => {
        toast.error(value);
      });
    }
  } else {
    toast.error(errorMessage);
  }
}
