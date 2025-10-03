import api from './api';
import type {
  ApiResponse,
  TaskStatistics,
  ProductivityMetrics,
  TeamAnalytics,
} from '../types';

export const analyticsService = {
  // Get task statistics
  async getTaskStatistics(): Promise<TaskStatistics> {
    const response = await api.get<ApiResponse<TaskStatistics>>('/analytics/tasks');
    return response.data.data!;
  },

  // Get productivity metrics for current user
  async getProductivityMetrics(): Promise<ProductivityMetrics> {
    const response = await api.get<ApiResponse<ProductivityMetrics>>(
      '/analytics/productivity'
    );
    return response.data.data!;
  },

  // Get team analytics
  async getTeamAnalytics(): Promise<TeamAnalytics> {
    const response = await api.get<ApiResponse<TeamAnalytics>>('/analytics/team');
    return response.data.data!;
  },
};
