import api from './api';
import type { ApiResponse, User } from '../types';

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data!;
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  // Get user by username
  async getUserByUsername(username: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/username/${username}`);
    return response.data.data!;
  },

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(`/users/role/${role}`);
    return response.data.data!;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data.data!;
  },
};
