package com.workflow.management.service;

import com.workflow.management.dto.*;
import com.workflow.management.entity.*;
import com.workflow.management.exception.BadRequestException;
import com.workflow.management.exception.ResourceNotFoundException;
import com.workflow.management.repository.TaskRepository;
import com.workflow.management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    public TaskDTO createTask(CreateTaskRequest request) {
        User currentUser = userService.getCurrentUser();
        logger.info("Creating task: {} by user: {}", request.getTitle(), currentUser.getUsername());

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM);
        task.setStatus(TaskStatus.TODO);
        task.setCreatedBy(currentUser);
        task.setDueDate(request.getDueDate());

        // Assign task if assignedToId is provided
        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));
            task.setAssignedTo(assignee);

            // Create notification for task assignment
            notificationService.createNotification(
                    assignee,
                    "You have been assigned a new task: " + task.getTitle(),
                    NotificationType.TASK_ASSIGNED
            );
        }

        Task savedTask = taskRepository.save(task);
        logger.info("Task created successfully: {}", savedTask.getId());
        return convertToDTO(savedTask);
    }

    public List<TaskDTO> getAllTasks(TaskStatus status, Long assignedToId, Long createdById) {
        logger.info("Fetching tasks with filters - status: {}, assignedToId: {}, createdById: {}",
                status, assignedToId, createdById);

        List<Task> tasks;

        if (status != null && assignedToId != null) {
            User assignee = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", assignedToId));
            tasks = taskRepository.findByAssignedToAndStatus(assignee, status);
        } else if (assignedToId != null) {
            User assignee = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", assignedToId));
            tasks = taskRepository.findByAssignedTo(assignee);
        } else if (createdById != null) {
            User creator = userRepository.findById(createdById)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdById));
            tasks = taskRepository.findByCreatedBy(creator);
        } else if (status != null) {
            tasks = taskRepository.findByStatus(status);
        } else {
            tasks = taskRepository.findAll();
        }

        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO getTaskById(Long id) {
        logger.info("Fetching task by id: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        return convertToDTO(task);
    }

    public TaskDTO updateTask(Long id, UpdateTaskRequest request) {
        logger.info("Updating task: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Check if current user is the creator or has admin/manager role
        User currentUser = userService.getCurrentUser();
        if (!task.getCreatedBy().getId().equals(currentUser.getId()) &&
            !hasAdminOrManagerRole(currentUser)) {
            throw new BadRequestException("You don't have permission to update this task");
        }

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        Task updatedTask = taskRepository.save(task);

        // Notify assigned user about task update
        if (updatedTask.getAssignedTo() != null) {
            notificationService.createNotification(
                    updatedTask.getAssignedTo(),
                    "Task updated: " + updatedTask.getTitle(),
                    NotificationType.TASK_UPDATED
            );
        }

        logger.info("Task updated successfully: {}", id);
        return convertToDTO(updatedTask);
    }

    public void deleteTask(Long id) {
        logger.info("Deleting task: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Check if current user is the creator or has admin/manager role
        User currentUser = userService.getCurrentUser();
        if (!task.getCreatedBy().getId().equals(currentUser.getId()) &&
            !hasAdminOrManagerRole(currentUser)) {
            throw new BadRequestException("You don't have permission to delete this task");
        }

        taskRepository.delete(task);
        logger.info("Task deleted successfully: {}", id);
    }

    public TaskDTO assignTask(Long taskId, AssignTaskRequest request) {
        logger.info("Assigning task: {} to user: {}", taskId, request.getUserId());
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User assignee = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        task.setAssignedTo(assignee);
        Task updatedTask = taskRepository.save(task);

        // Create notification for task assignment
        notificationService.createNotification(
                assignee,
                "You have been assigned to task: " + task.getTitle(),
                NotificationType.TASK_ASSIGNED
        );

        logger.info("Task assigned successfully: {}", taskId);
        return convertToDTO(updatedTask);
    }

    public TaskDTO updateTaskStatus(Long taskId, UpdateTaskStatusRequest request) {
        logger.info("Updating task status: {} to {}", taskId, request.getStatus());
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        // Permission check: ADMIN/MANAGER can update any task
        // EMPLOYEE can only update tasks they created or are assigned to
        User currentUser = userService.getCurrentUser();
        boolean isAdminOrManager = hasAdminOrManagerRole(currentUser);
        boolean isCreator = task.getCreatedBy() != null && task.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(currentUser.getId());

        if (!isAdminOrManager && !isCreator && !isAssignee) {
            throw new BadRequestException("You don't have permission to update the status of this task");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(request.getStatus());
        Task updatedTask = taskRepository.save(task);

        // Notify relevant users about status change
        if (request.getStatus() == TaskStatus.DONE) {
            if (updatedTask.getCreatedBy() != null) {
                notificationService.createNotification(
                        updatedTask.getCreatedBy(),
                        "Task completed: " + updatedTask.getTitle(),
                        NotificationType.TASK_COMPLETED
                );
            }
        } else if (request.getStatus() == TaskStatus.CANCELLED) {
            if (updatedTask.getAssignedTo() != null) {
                notificationService.createNotification(
                        updatedTask.getAssignedTo(),
                        "Task cancelled: " + updatedTask.getTitle(),
                        NotificationType.TASK_CANCELLED
                );
            }
        } else {
            if (updatedTask.getAssignedTo() != null) {
                notificationService.createNotification(
                        updatedTask.getAssignedTo(),
                        "Task status changed from " + oldStatus + " to " + request.getStatus() + ": " + updatedTask.getTitle(),
                        NotificationType.TASK_UPDATED
                );
            }
        }

        logger.info("Task status updated successfully: {}", taskId);
        return convertToDTO(updatedTask);
    }

    private boolean hasAdminOrManagerRole(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleType.ADMIN || role.getName() == RoleType.MANAGER);
    }

    public List<TaskDTO> searchTasks(String query) {
        logger.info("Searching tasks with query: {}", query);

        if (query == null || query.trim().isEmpty()) {
            return getAllTasks(null, null, null);
        }

        List<Task> tasks = taskRepository.searchTasks(query.trim());

        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        if (task.getAssignedTo() != null) {
            dto.setAssignedToId(task.getAssignedTo().getId());
            dto.setAssignedToUsername(task.getAssignedTo().getUsername());
        }

        if (task.getCreatedBy() != null) {
            dto.setCreatedById(task.getCreatedBy().getId());
            dto.setCreatedByUsername(task.getCreatedBy().getUsername());
        }

        return dto;
    }
}
