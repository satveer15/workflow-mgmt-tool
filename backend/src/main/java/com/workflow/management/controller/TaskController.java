package com.workflow.management.controller;

import com.workflow.management.dto.*;
import com.workflow.management.entity.TaskStatus;
import com.workflow.management.service.TaskService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(@Valid @RequestBody CreateTaskRequest request) {
        logger.info("POST /api/tasks - Create new task");
        TaskDTO taskDTO = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", taskDTO));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) Long createdById) {
        logger.info("GET /api/tasks - Get all tasks with filters");
        List<TaskDTO> tasks = taskService.getAllTasks(status, assignedToId, createdById);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> searchTasks(
            @RequestParam(required = false) String query) {
        logger.info("GET /api/tasks/search - Search tasks with query: {}", query);
        List<TaskDTO> tasks = taskService.searchTasks(query);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<ApiResponse<TaskDTO>> getTaskById(@PathVariable Long id) {
        logger.info("GET /api/tasks/{} - Get task by id", id);
        TaskDTO taskDTO = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", taskDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        logger.info("PUT /api/tasks/{} - Update task", id);
        TaskDTO taskDTO = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", taskDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTask(@PathVariable Long id) {
        logger.info("DELETE /api/tasks/{} - Delete task", id);
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskDTO>> assignTask(
            @PathVariable Long id,
            @Valid @RequestBody AssignTaskRequest request) {
        logger.info("PUT /api/tasks/{}/assign - Assign task", id);
        TaskDTO taskDTO = taskService.assignTask(id, request);
        return ResponseEntity.ok(ApiResponse.success("Task assigned successfully", taskDTO));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        logger.info("PATCH /api/tasks/{}/status - Update task status", id);
        TaskDTO taskDTO = taskService.updateTaskStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", taskDTO));
    }
}
