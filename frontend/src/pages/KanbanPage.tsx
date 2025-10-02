import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useAuth } from '../contexts';
import { useTasks } from '../contexts/TaskContext';
import { userService } from '../services';
import { Card, Badge, Select, LoadingSpinner } from '../components';
import { QuickStatusModal } from '../components/tasks';
import type { Task, TaskStatus, User } from '../types';
import './KanbanPage.css';

const STATUSES: { id: TaskStatus; label: string; icon: string }[] = [
  { id: 'TODO', label: 'To Do', icon: '📝' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: '⚡' },
  { id: 'DONE', label: 'Done', icon: '✅' },
  { id: 'CANCELLED', label: 'Cancelled', icon: '❌' },
];

export const KanbanPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, fetchTasks, updateTaskStatus, isLoading } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Users for filter
  const [users, setUsers] = useState<User[]>([]);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsStatusModalOpen(true);
  };

  const handleStatusModalClose = () => {
    setIsStatusModalOpen(false);
    setSelectedTask(null);
  };

  const handleStatusUpdateSuccess = () => {
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    // Fetch users for filter (exclude admins)
    userService.getAllUsers().then((allUsers) => {
      const nonAdminUsers = allUsers.filter(u => !u.roles.includes('ADMIN'));
      setUsers(nonAdminUsers);
    }).catch((error) => {
      console.error('Failed to fetch users:', error);
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((t: Task) => t.priority === priorityFilter);
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter((t: Task) => t.assignedToId === parseInt(userFilter));
    }

    if (myTasksOnly && user) {
      filtered = filtered.filter((t: Task) => t.assignedToId === user.id);
    }

    return filtered;
  }, [tasks, priorityFilter, userFilter, myTasksOnly, user]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      CANCELLED: [],
    };

    filteredTasks.forEach((task: Task) => {
      grouped[task.status]?.push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t: Task) => t.id.toString() === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }

    const taskId = parseInt(active.id.toString());
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t: Task) => t.id === taskId);

    if (!task || task.status === newStatus) {
      return;
    }

    try {
      await updateTaskStatus(taskId, { status: newStatus });
      await fetchTasks(); // Refresh tasks after update
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      alert(`Failed to update task status: ${error.response?.data?.message || error.message}`);
    }
  };

  const getPriorityBadgeVariant = (priority: string): "low" | "medium" | "high" | "default" => {
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
    <div className="kanban-page">
      {/* Header */}
      <div className="kanban-header">
        <div>
          <h1>Kanban Board</h1>
          <p className="kanban-subtitle">Drag and drop tasks to update their status</p>
        </div>
        <button onClick={() => fetchTasks()} className="refresh-btn" disabled={isLoading}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <Card className="kanban-filters">
        <div className="filters-row">
          <Select
            label="Priority"
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'LOW', label: '🟢 Low' },
              { value: 'MEDIUM', label: '🟡 Medium' },
              { value: 'HIGH', label: '🔴 High' },
            ]}
          />

          <Select
            label="Assigned User"
            value={userFilter}
            onChange={(value) => setUserFilter(value)}
            options={[
              { value: 'all', label: 'All Users' },
              ...users.map(u => ({ value: u.id.toString(), label: u.username }))
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
      </Card>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-columns">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              tasks={tasksByStatus[status.id]}
              getPriorityBadgeVariant={getPriorityBadgeVariant}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="kanban-card kanban-card-dragging">
              <TaskCard task={activeTask} getPriorityBadgeVariant={getPriorityBadgeVariant} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Quick Status Modal */}
      <QuickStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleStatusModalClose}
        task={selectedTask}
        onSuccess={handleStatusUpdateSuccess}
      />
    </div>
  );
};

interface KanbanColumnProps {
  status: { id: TaskStatus; label: string; icon: string };
  tasks: Task[];
  getPriorityBadgeVariant: (priority: string) => "low" | "medium" | "high" | "default";
  onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  getPriorityBadgeVariant,
  onTaskClick,
}) => {
  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  return (
    <div ref={setNodeRef} className="kanban-column" data-status={status.id}>
      {/* Column Header */}
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <span className="kanban-column-icon">{status.icon}</span>
          <span className="kanban-column-label">{status.label}</span>
        </div>
        <div className="kanban-column-count">{tasks.length}</div>
      </div>

      {/* Tasks */}
      <div className="kanban-column-content">
        {tasks.length === 0 ? (
          <div className="kanban-empty">
            <p>No tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              getPriorityBadgeVariant={getPriorityBadgeVariant}
              onTaskClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface KanbanCardProps {
  task: Task;
  getPriorityBadgeVariant: (priority: string) => "low" | "medium" | "high" | "default";
  onTaskClick: (task: Task) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, getPriorityBadgeVariant, onTaskClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id.toString(),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
      onClick={() => {
        // Only trigger modal if not dragging
        if (!isDragging) {
          onTaskClick(task);
        }
      }}
    >
      <TaskCard task={task} getPriorityBadgeVariant={getPriorityBadgeVariant} />
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; getPriorityBadgeVariant: (priority: string) => string }> = ({
  task,
  getPriorityBadgeVariant,
}) => {
  return (
    <>
      <div className="kanban-card-header">
        <h4 className="kanban-card-title">{task.title}</h4>
        <Badge variant={getPriorityBadgeVariant(task.priority) as "low" | "medium" | "high" | "default"} size="sm">
          {task.priority}
        </Badge>
      </div>

      {task.description && (
        <p className="kanban-card-description">{task.description}</p>
      )}

      <div className="kanban-card-footer">
        {task.assignedToUsername && (
          <div className="kanban-card-assignee">
            <span className="kanban-assignee-icon">👤</span>
            <span className="kanban-assignee-name">{task.assignedToUsername}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="kanban-card-due-date">
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </>
  );
};
