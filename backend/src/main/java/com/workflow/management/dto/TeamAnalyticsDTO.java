package com.workflow.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamAnalyticsDTO {

    private Map<String, Long> tasksPerUser;
    private Map<String, Double> completionRatePerUser;
}
