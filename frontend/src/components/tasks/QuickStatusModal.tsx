import { useState } from 'react';
import { Modal, Button, Badge } from '../ui';
import { useTasks } from '../../contexts/TaskContext';
import { useRole } from '../../hooks';
import type { Task, TaskStatus } from '../../types';
import './QuickStatusModal.css';

interface QuickStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess?: () => void;
}

export const QuickStatusModal: React.FC<QuickStatusModalProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess
}) => {
  const { updateTaskStatus } = useTasks();
  const { canUpdateTaskStatus } = useRole();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    setIsLoading(true);
    try {
      await updateTaskStatus(task.id, { status: newStatus });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      alert(`Failed to update task status: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!task) return null;

  const hasPermission = canUpdateTaskStatus(task);

  const statusOptions: { status: TaskStatus; label: string; icon: string; description: string }[] = [
    { status: 'TODO', label: 'To Do', icon: '📝', description: 'Not started yet' },
    { status: 'IN_PROGRESS', label: 'In Progress', icon: '⚡', description: 'Currently working on it' },
    { status: 'DONE', label: 'Done', icon: '✅', description: 'Completed successfully' },
    { status: 'CANCELLED', label: 'Cancelled', icon: '❌', description: 'Cancelled or abandoned' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Task Status"
      size="sm"
    >
      <div className="quick-status-modal">
        {/* Task Info */}
        <div className="quick-status-task-info">
          <h3 className="quick-status-task-title">{task.title}</h3>
          {task.description && (
            <p className="quick-status-task-description">{task.description}</p>
          )}
          <div className="quick-status-task-meta">
            <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
              {task.priority}
            </Badge>
            {task.assignedToUsername && (
              <span className="quick-status-assignee">
                👤 {task.assignedToUsername}
              </span>
            )}
          </div>
        </div>

        {/* Status Options */}
        <div className="quick-status-options">
          <p className="quick-status-label">Change status to:</p>
          {!hasPermission && (
            <div className="quick-status-permission-denied">
              ⚠️ You don't have permission to update this task's status
            </div>
          )}
          {statusOptions.map(({ status, label, icon, description }) => (
            <button
              key={status}
              className={`quick-status-option ${task.status === status ? 'quick-status-current' : ''}`}
              onClick={() => handleStatusChange(status)}
              disabled={isLoading || task.status === status || !hasPermission}
            >
              <div className="quick-status-option-icon">{icon}</div>
              <div className="quick-status-option-content">
                <div className="quick-status-option-label">{label}</div>
                <div className="quick-status-option-description">{description}</div>
              </div>
              {task.status === status && (
                <div className="quick-status-check">✓</div>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="quick-status-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            fullWidth
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
