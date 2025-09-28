import api from './api';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '../types';

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<string> {
    const response = await api.post<ApiResponse<string>>(
      '/auth/register',
      userData
    );
    return response.data.message;
  },

  // Logout user
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Refresh token
  async refreshToken(): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/refresh');
    return response.data.data!;
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      await api.get<ApiResponse<string>>('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data.data!;
  },
};
