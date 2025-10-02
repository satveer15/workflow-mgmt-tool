import api from './api';
import type { ApiResponse, Notification } from '../types';

export const notificationService = {
  // Get all notifications for current user
  async getAllNotifications(): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data.data!;
  },

  // Get unread notifications
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications/unread');
    return response.data.data!;
  },

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<number>>('/notifications/count');
    return response.data.data!;
  },

  // Mark notification as read
  async markAsRead(id: number): Promise<Notification> {
    const response = await api.put<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data.data!;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },
};
