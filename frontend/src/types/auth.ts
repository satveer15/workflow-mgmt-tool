// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
  email: string;
  roles: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}
