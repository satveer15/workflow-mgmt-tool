// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// Error response
export interface ApiError {
  error: string;
  message: string;
  timestamp?: string;
  status?: number;
}
