import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { taskService } from '../services';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  UpdateTaskStatusRequest,
  TaskFilters,
} from '../types';

interface TaskContextType {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  isLoading: boolean;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  getTaskById: (id: number) => Promise<Task>;
  createTask: (taskData: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: number, taskData: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  assignTask: (id: number, assignData: AssignTaskRequest) => Promise<Task>;
  updateTaskStatus: (id: number, statusData: UpdateTaskStatusRequest) => Promise<Task>;
  setFilters: (filters: TaskFilters) => void;
  setSelectedTask: (task: Task | null) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFiltersState] = useState<TaskFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async (newFilters?: TaskFilters) => {
    setIsLoading(true);
    try {
      const fetchedTasks = await taskService.getAllTasks(newFilters || filters);
      setTasks(fetchedTasks);
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskById = async (id: number): Promise<Task> => {
    setIsLoading(true);
    try {
      const task = await taskService.getTaskById(id);
      setSelectedTask(task);
      return task;
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskRequest): Promise<Task> => {
    setIsLoading(true);
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (
    id: number,
    taskData: UpdateTaskRequest
  ): Promise<Task> => {
    setIsLoading(true);
    try {
      const updatedTask = await taskService.updateTask(id, taskData);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      if (selectedTask?.id === id) {
        setSelectedTask(updatedTask);
      }
      return updatedTask;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const assignTask = async (
    id: number,
    assignData: AssignTaskRequest
  ): Promise<Task> => {
    setIsLoading(true);
    try {
      const updatedTask = await taskService.assignTask(id, assignData);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      if (selectedTask?.id === id) {
        setSelectedTask(updatedTask);
      }
      return updatedTask;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (
    id: number,
    statusData: UpdateTaskStatusRequest
  ): Promise<Task> => {
    setIsLoading(true);
    try {
      const updatedTask = await taskService.updateTaskStatus(id, statusData);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      if (selectedTask?.id === id) {
        setSelectedTask(updatedTask);
      }
      return updatedTask;
    } finally {
      setIsLoading(false);
    }
  };

  const setFilters = (newFilters: TaskFilters) => {
    setFiltersState(newFilters);
  };

  const value: TaskContextType = {
    tasks,
    selectedTask,
    filters,
    isLoading,
    fetchTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    setFilters,
    setSelectedTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
