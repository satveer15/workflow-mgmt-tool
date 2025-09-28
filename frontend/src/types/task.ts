// Task enums as const objects
export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

// Task types
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: number | null;
  assignedToUsername: string | null;
  createdById: number;
  createdByUsername: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignedToId?: number;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface AssignTaskRequest {
  userId: number;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

// Task filters
export interface TaskFilters {
  status?: TaskStatus;
  assignedToId?: number;
  createdById?: number;
}
