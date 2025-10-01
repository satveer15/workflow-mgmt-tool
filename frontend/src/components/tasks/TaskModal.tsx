import { useState, useEffect } from 'react';
import { Modal, Input, TextArea, Select, Button } from '../ui';
import { useTasks } from '../../contexts/TaskContext';
import { userService } from '../../services';
import type { Task, TaskPriority, CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest } from '../../types';
import './TaskModal.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedToId: string;
  dueDate: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSuccess }) => {
  const { createTask, updateTask, assignTask } = useTasks();
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (task) {
        // Edit mode - populate form
        setFormData({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          assignedToId: task.assignedToId?.toString() || '',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        });
      } else {
        // Create mode - reset form
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          assignedToId: '',
          dueDate: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, task]);

  const fetchUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
      const dueDateFormatted = formData.dueDate ? `${formData.dueDate}T23:59:59` : undefined;

      if (task) {
        // Update existing task
        const updateData: UpdateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          dueDate: dueDateFormatted,
        };
        await updateTask(task.id, updateData);

        // Handle assignment change separately if it changed
        const newAssigneeId = formData.assignedToId ? parseInt(formData.assignedToId) : null;
        const oldAssigneeId = task.assignedToId;

        if (newAssigneeId !== oldAssigneeId && newAssigneeId) {
          const assignData: AssignTaskRequest = { userId: newAssigneeId };
          await assignTask(task.id, assignData);
        }
      } else {
        // Create new task
        const createData: CreateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : undefined,
          dueDate: dueDateFormatted,
        };
        await createTask(createData);
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      setErrors({ title: error.response?.data?.message || 'Failed to save task' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="task-form">
        <Input
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="Enter task title"
          fullWidth
          required
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Enter task description (optional)"
          fullWidth
          rows={4}
        />

        <Select
          label="Priority"
          value={formData.priority}
          onChange={(value) => handleChange('priority', value as TaskPriority)}
          options={[
            { value: 'LOW', label: '🟢 Low' },
            { value: 'MEDIUM', label: '🟡 Medium' },
            { value: 'HIGH', label: '🔴 High' },
          ]}
          fullWidth
          required
        />

        <Select
          label="Assign To"
          value={formData.assignedToId}
          onChange={(value) => handleChange('assignedToId', value)}
          placeholder="Select user (optional)"
          helperText="Assign this task to a team member"
          options={[
            { value: '', label: 'Unassigned' },
            ...users.map((user) => ({
              value: user.id.toString(),
              label: `${user.username} (${user.roles.join(', ')})`,
            })),
          ]}
          fullWidth
        />

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          helperText="Optional: Set a deadline for this task"
          fullWidth
        />

        <div className="task-form-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
