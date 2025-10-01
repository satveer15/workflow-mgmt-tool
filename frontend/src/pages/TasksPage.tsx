import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts';
import { useTasks } from '../contexts/TaskContext';
import { userService } from '../services';
import { Card, Button, Select, Badge, LoadingSpinner } from '../components';
import { TaskModal } from '../components/tasks/TaskModal';
import { QuickStatusModal } from '../components/tasks';
import type { Task, TaskStatus, User } from '../types';
import './TasksPage.css';

type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'status';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, fetchTasks, deleteTask, updateTaskStatus, isLoading } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [taskForStatusUpdate, setTaskForStatusUpdate] = useState<Task | null>(null);

  // Users for filter
  const [users, setUsers] = useState<User[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');

  // Refresh interval
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchTasks();
    // Fetch users for filter (exclude admins)
    userService.getAllUsers().then((allUsers) => {
      const nonAdminUsers = allUsers.filter(u => !u.roles.includes('ADMIN'));
      setUsers(nonAdminUsers);
    }).catch((error) => {
      console.error('Failed to fetch users:', error);
    });
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTasks();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t: Task) => t.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((t: Task) => t.priority === priorityFilter);
    }

    // Apply user filter
    if (userFilter !== 'all') {
      filtered = filtered.filter((t: Task) => t.assignedToId === parseInt(userFilter));
    }

    // Apply "My Tasks" filter
    if (myTasksOnly && user) {
      filtered = filtered.filter((t: Task) => t.assignedToId === user.id);
    }

    // Sort
    filtered.sort((a: Task, b: Task) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [tasks, statusFilter, priorityFilter, userFilter, myTasksOnly, sortBy, user]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskCardClick = (task: Task) => {
    setTaskForStatusUpdate(task);
    setIsStatusModalOpen(true);
  };

  const handleStatusModalClose = () => {
    setIsStatusModalOpen(false);
    setTaskForStatusUpdate(null);
  };

  const handleStatusUpdateSuccess = () => {
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        alert('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, { status: newStatus });
    } catch (error) {
      alert('Failed to update task status');
    }
  };

  const handleRefresh = () => {
    fetchTasks();
    setLastRefresh(new Date());
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusMap: Record<string, any> = {
      TODO: 'todo',
      IN_PROGRESS: 'in-progress',
      DONE: 'done',
      CANCELLED: 'cancelled',
    };
    return statusMap[status] || 'default';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    const priorityMap: Record<string, any> = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
    };
    return priorityMap[priority] || 'default';
  };

  if (isLoading && tasks.length === 0) {
    return <LoadingSpinner center />;
  }

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1>Tasks</h1>
          <p className="tasks-subtitle">
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          </p>
        </div>
        <div className="tasks-header-actions">
          <Button variant="secondary" onClick={handleRefresh} size="sm">
            🔄 Refresh
          </Button>
          <Button onClick={handleCreateTask}>+ Create Task</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="tasks-filters">
        <div className="filters-grid">
          <Select
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'TODO', label: 'To Do' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'DONE', label: 'Done' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />

          <Select
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'HIGH', label: '🔴 High' },
              { value: 'MEDIUM', label: '🟡 Medium' },
              { value: 'LOW', label: '🟢 Low' },
            ]}
          />

          <Select
            label="Assigned User"
            value={userFilter}
            onChange={setUserFilter}
            options={[
              { value: 'all', label: 'All Users' },
              ...users.map(u => ({ value: u.id.toString(), label: u.username }))
            ]}
          />

          <Select
            label="Sort By"
            value={sortBy}
            onChange={(value) => setSortBy(value as SortOption)}
            options={[
              { value: 'createdAt', label: 'Created Date' },
              { value: 'dueDate', label: 'Due Date' },
              { value: 'priority', label: 'Priority' },
              { value: 'status', label: 'Status' },
            ]}
          />

          <div className="filter-checkbox">
            <label>
              <input
                type="checkbox"
                checked={myTasksOnly}
                onChange={(e) => setMyTasksOnly(e.target.checked)}
              />
              <span>My Tasks Only</span>
            </label>
          </div>
        </div>

        <div className="last-refresh">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </div>
      </Card>

      {/* Task List */}
      {filteredAndSortedTasks.length === 0 ? (
        <Card className="empty-tasks">
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>
              {tasks.length === 0
                ? 'Get started by creating your first task!'
                : 'Try adjusting your filters'}
            </p>
            <Button onClick={handleCreateTask} style={{ marginTop: 'var(--space-lg)' }}>
              + Create Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="tasks-grid">
          {filteredAndSortedTasks.map((task: Task) => (
            <Card
              key={task.id}
              className="task-card"
              hover
              onClick={() => handleTaskCardClick(task)}
            >
              <div className="task-card-header">
                <div className="task-card-badges">
                  <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </div>
                <div className="task-card-actions">
                  <button
                    className="task-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                    title="Edit task"
                  >
                    ✏️
                  </button>
                  <button
                    className="task-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3 className="task-card-title">{task.title}</h3>

              {task.description && (
                <p className="task-card-description">{task.description}</p>
              )}

              <div className="task-card-meta">
                <div className="task-meta-item">
                  <span className="task-meta-label">Created by:</span>
                  <span className="task-meta-value">{task.createdByUsername}</span>
                </div>
                {task.assignedToUsername && (
                  <div className="task-meta-item">
                    <span className="task-meta-label">Assigned to:</span>
                    <span className="task-meta-value">{task.assignedToUsername}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="task-meta-item">
                    <span className="task-meta-label">Due date:</span>
                    <span className="task-meta-value">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Status change buttons */}
              <div className="task-card-status-actions">
                {task.status !== 'TODO' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleStatusChange(task.id, 'TODO');
                    }}
                  >
                    → To Do
                  </Button>
                )}
                {task.status !== 'IN_PROGRESS' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleStatusChange(task.id, 'IN_PROGRESS');
                    }}
                  >
                    → In Progress
                  </Button>
                )}
                {task.status !== 'DONE' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleStatusChange(task.id, 'DONE');
                    }}
                  >
                    → Done
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSuccess={() => fetchTasks()}
      />

      {/* Quick Status Modal */}
      <QuickStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleStatusModalClose}
        task={taskForStatusUpdate}
        onSuccess={handleStatusUpdateSuccess}
      />
    </div>
  );
};
