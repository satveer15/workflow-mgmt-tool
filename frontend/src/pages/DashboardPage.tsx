import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { useTasks } from '../contexts/TaskContext';
import { Card, CardHeader, CardBody, Badge, Button, LoadingSpinner } from '../components';
import { QuickStatusModal } from '../components/tasks';
import type { Task } from '../types';
import './DashboardPage.css';

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  cancelled: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, fetchTasks, isLoading } = useTasks();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    cancelled: 0,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isQuickStatusModalOpen, setIsQuickStatusModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsQuickStatusModalOpen(true);
  };

  const handleQuickStatusSuccess = () => {
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Calculate stats
    const newStats: TaskStats = {
      total: tasks.length,
      todo: tasks.filter((t: any) => t.status === 'TODO').length,
      inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t: any) => t.status === 'DONE').length,
      cancelled: tasks.filter((t: any) => t.status === 'CANCELLED').length,
    };
    setStats(newStats);
  }, [tasks]);

  const recentTasks = tasks.slice(0, 5);
  const myTasks = user ? tasks.filter((t: any) => t.assignedToId === user.id) : [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'todo';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'DONE':
        return 'done';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'low';
      case 'MEDIUM':
        return 'medium';
      case 'HIGH':
        return 'high';
      default:
        return 'default';
    }
  };

  if (isLoading && tasks.length === 0) {
    return <LoadingSpinner center />;
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p className="dashboard-subtitle">
            Here's an overview of your tasks and team progress
          </p>
        </div>
        <Button onClick={() => navigate('/tasks')}>View All Tasks</Button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card stat-total" hover>
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.total}</h3>
            <p className="stat-label">Total Tasks</p>
          </div>
        </Card>

        <Card className="stat-card stat-todo" hover>
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.todo}</h3>
            <p className="stat-label">To Do</p>
          </div>
        </Card>

        <Card className="stat-card stat-in-progress" hover>
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.inProgress}</h3>
            <p className="stat-label">In Progress</p>
          </div>
        </Card>

        <Card className="stat-card stat-done" hover>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.done}</h3>
            <p className="stat-label">Completed</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <div className="card-header-content">
              <h2>My Tasks</h2>
              <Badge variant="info">{myTasks.length}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            {myTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks assigned to you yet</p>
              </div>
            ) : (
              <div className="task-list">
                {myTasks.slice(0, 5).map((task: any) => (
                  <div
                    key={task.id}
                    className="task-item task-item-clickable"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-item-header">
                      <span className="task-item-title">{task.title}</span>
                      <div className="task-item-badges">
                        <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    {task.dueDate && (
                      <p className="task-item-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="card-header-content">
              <h2>Recent Tasks</h2>
              <Badge variant="default">{recentTasks.length}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks yet. Create your first task!</p>
                <Button onClick={() => navigate('/tasks')} size="sm" style={{ marginTop: 'var(--space-md)' }}>
                  Create Task
                </Button>
              </div>
            ) : (
              <div className="task-list">
                {recentTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="task-item task-item-clickable"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-item-header">
                      <span className="task-item-title">{task.title}</span>
                      <div className="task-item-badges">
                        <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="task-item-meta">
                      Created by {task.createdByUsername}
                      {task.assignedToUsername && ` • Assigned to ${task.assignedToUsername}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick Status Modal */}
      <QuickStatusModal
        isOpen={isQuickStatusModalOpen}
        onClose={() => setIsQuickStatusModalOpen(false)}
        task={selectedTask}
        onSuccess={handleQuickStatusSuccess}
      />
    </div>
  );
};
