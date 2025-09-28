import api from './api';
import type {
  ApiResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  UpdateTaskStatusRequest,
  TaskFilters,
} from '../types';

export const taskService = {
  // Get all tasks with optional filters
  async getAllTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId.toString());
    if (filters?.createdById) params.append('createdById', filters.createdById.toString());

    const response = await api.get<ApiResponse<Task[]>>(
      `/tasks${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data!;
  },

  // Get task by ID
  async getTaskById(id: number): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data!;
  },

  // Create new task
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
    return response.data.data!;
  },

  // Update task
  async updateTask(id: number, taskData: UpdateTaskRequest): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
    return response.data.data!;
  },

  // Delete task
  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  // Assign task to user
  async assignTask(id: number, assignData: AssignTaskRequest): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(
      `/tasks/${id}/assign`,
      assignData
    );
    return response.data.data!;
  },

  // Update task status
  async updateTaskStatus(id: number, statusData: UpdateTaskStatusRequest): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(
      `/tasks/${id}/status`,
      statusData
    );
    return response.data.data!;
  },

  // Search tasks
  async searchTasks(query: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);

    const response = await api.get<ApiResponse<Task[]>>(
      `/tasks/search${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data!;
  },
};
