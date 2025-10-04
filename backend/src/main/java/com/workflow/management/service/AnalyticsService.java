package com.workflow.management.service;

import com.workflow.management.dto.ProductivityMetricsDTO;
import com.workflow.management.dto.TaskStatisticsDTO;
import com.workflow.management.dto.TeamAnalyticsDTO;
import com.workflow.management.entity.Task;
import com.workflow.management.entity.TaskPriority;
import com.workflow.management.entity.TaskStatus;
import com.workflow.management.entity.User;
import com.workflow.management.repository.TaskRepository;
import com.workflow.management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public TaskStatisticsDTO getTaskStatistics() {
        logger.info("Fetching task statistics");
        List<Task> allTasks = taskRepository.findAll();

        Long totalTasks = (long) allTasks.size();

        Map<String, Long> tasksByStatus = new HashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            long count = allTasks.stream()
                    .filter(task -> task.getStatus() == status)
                    .count();
            tasksByStatus.put(status.name(), count);
        }

        Map<String, Long> tasksByPriority = new HashMap<>();
        for (TaskPriority priority : TaskPriority.values()) {
            long count = allTasks.stream()
                    .filter(task -> task.getPriority() == priority)
                    .count();
            tasksByPriority.put(priority.name(), count);
        }

        TaskStatisticsDTO stats = new TaskStatisticsDTO(totalTasks, tasksByStatus, tasksByPriority);
        logger.info("Task statistics fetched successfully");
        return stats;
    }

    public ProductivityMetricsDTO getProductivityMetrics() {
        logger.info("Fetching productivity metrics");
        User currentUser = userService.getCurrentUser();

        Long totalTasks = taskRepository.countByAssignedToAndStatus(currentUser.getId(), null);
        Long completedTasks = taskRepository.countByAssignedToAndStatus(currentUser.getId(), TaskStatus.DONE);
        Long inProgressTasks = taskRepository.countByAssignedToAndStatus(currentUser.getId(), TaskStatus.IN_PROGRESS);
        Long todoTasks = taskRepository.countByAssignedToAndStatus(currentUser.getId(), TaskStatus.TODO);

        Double completionRate = totalTasks > 0 ? (completedTasks.doubleValue() / totalTasks.doubleValue()) * 100 : 0.0;

        ProductivityMetricsDTO metrics = new ProductivityMetricsDTO(
                totalTasks, completedTasks, inProgressTasks, todoTasks, completionRate
        );
        logger.info("Productivity metrics fetched successfully");
        return metrics;
    }

    public TeamAnalyticsDTO getTeamAnalytics() {
        logger.info("Fetching team analytics");
        List<User> allUsers = userRepository.findAll();
        Map<String, Long> tasksPerUser = new HashMap<>();
        Map<String, Double> completionRatePerUser = new HashMap<>();

        for (User user : allUsers) {
            List<Task> userTasks = taskRepository.findByAssignedTo(user);
            long totalUserTasks = userTasks.size();
            long completedUserTasks = userTasks.stream()
                    .filter(task -> task.getStatus() == TaskStatus.DONE)
                    .count();

            tasksPerUser.put(user.getUsername(), totalUserTasks);

            double completionRate = totalUserTasks > 0 ?
                    (completedUserTasks / (double) totalUserTasks) * 100 : 0.0;
            completionRatePerUser.put(user.getUsername(), completionRate);
        }

        TeamAnalyticsDTO teamAnalytics = new TeamAnalyticsDTO(tasksPerUser, completionRatePerUser);
        logger.info("Team analytics fetched successfully");
        return teamAnalytics;
    }
}
