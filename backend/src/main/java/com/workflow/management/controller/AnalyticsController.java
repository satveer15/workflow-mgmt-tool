package com.workflow.management.controller;

import com.workflow.management.dto.ApiResponse;
import com.workflow.management.dto.ProductivityMetricsDTO;
import com.workflow.management.dto.TaskStatisticsDTO;
import com.workflow.management.dto.TeamAnalyticsDTO;
import com.workflow.management.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TaskStatisticsDTO>> getTaskStatistics() {
        logger.info("GET /api/analytics/tasks - Get task statistics");
        TaskStatisticsDTO statistics = analyticsService.getTaskStatistics();
        return ResponseEntity.ok(ApiResponse.success("Task statistics retrieved successfully", statistics));
    }

    @GetMapping("/productivity")
    public ResponseEntity<ApiResponse<ProductivityMetricsDTO>> getProductivityMetrics() {
        logger.info("GET /api/analytics/productivity - Get productivity metrics");
        ProductivityMetricsDTO metrics = analyticsService.getProductivityMetrics();
        return ResponseEntity.ok(ApiResponse.success("Productivity metrics retrieved successfully", metrics));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TeamAnalyticsDTO>> getTeamAnalytics() {
        logger.info("GET /api/analytics/team - Get team analytics");
        TeamAnalyticsDTO teamAnalytics = analyticsService.getTeamAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Team analytics retrieved successfully", teamAnalytics));
    }
}
