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

    // TODO: Add notification service integration
    // TODO: Add task assignment functionality
    // TODO: Add status update method
    // TODO: Add search functionality

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

        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));
            task.setAssignedTo(assignee);
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
        logger.info("Task updated successfully: {}", id);
        return convertToDTO(updatedTask);
    }

    public void deleteTask(Long id) {
        logger.info("Deleting task: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        User currentUser = userService.getCurrentUser();
        if (!task.getCreatedBy().getId().equals(currentUser.getId()) &&
            !hasAdminOrManagerRole(currentUser)) {
            throw new BadRequestException("You don't have permission to delete this task");
        }

        taskRepository.delete(task);
        logger.info("Task deleted successfully: {}", id);
    }

    private boolean hasAdminOrManagerRole(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleType.ADMIN || role.getName() == RoleType.MANAGER);
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
