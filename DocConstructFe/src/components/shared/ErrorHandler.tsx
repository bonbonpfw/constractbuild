import { toast } from 'react-toastify';

export interface ErrorResponseData {
  response?: {
    data?: {
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
  // Log the complete error for debugging
  console.error("Error details:", error);
  
  let displayMessage = errorMessage;
  
  // Extract more meaningful error messages
  if (error.response?.data) {
    if (error.response.data.error_message) {
      displayMessage = error.response.data.error_message;
    } else if (error.response.data.message) {
      displayMessage = error.response.data.message;
    } else if (error.response.data.detail) {
      displayMessage = error.response.data.detail;
    }
    
    // Append error code if available
    if (error.response.data.error_code) {
      displayMessage += ` (Code: ${error.response.data.error_code})`;
    }
  } else if (error.message) {
    // If it's a network error or other non-response error
    displayMessage = error.message;
  }
  
  // If response status is available, show it
  if (error.response?.status) {
    displayMessage += ` [Status: ${error.response.status}]`;
  }
  
  toast.error(displayMessage);
}
