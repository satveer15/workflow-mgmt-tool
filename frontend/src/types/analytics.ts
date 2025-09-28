// Analytics types
export interface TaskStatistics {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
}

export interface TeamAnalytics {
  tasksPerUser: Record<string, number>;
  completionRatePerUser: Record<string, number>;
}
