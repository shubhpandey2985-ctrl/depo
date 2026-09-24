package com.deeptech.backend.controller;

import com.deeptech.backend.entity.issue;
import com.deeptech.backend.entity.resource;
import com.deeptech.backend.repository.issueRepository;
import com.deeptech.backend.repository.resourceRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class insightsController {

    private final issueRepository issueRepository;
    private final resourceRepository resourceRepository;

    public insightsController(
            issueRepository issueRepository,
            resourceRepository resourceRepository) {

        this.issueRepository = issueRepository;
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    public Map<String, Object> getInsights() {

        List<issue> issues =
                issueRepository.findAll();

        List<resource> resources =
                resourceRepository.findAll();

        int totalIssues = issues.size();

        int activeIssues = (int) issues.stream()
                .filter(issue ->
                        "Issued".equalsIgnoreCase(
                                issue.getStatus()
                        ))
                .count();

        int returnedIssues = (int) issues.stream()
                .filter(issue ->
                        "Returned".equalsIgnoreCase(
                                issue.getStatus()
                        ))
                .count();

        int overdueIssues = (int) issues.stream()
                .filter(issue ->
                        "Overdue".equalsIgnoreCase(
                                issue.getStatus()
                        ))
                .count();

        int totalIssuedQuantity = issues.stream()
                .mapToInt(issue ->
                        issue.getQuantity() != null
                                ? issue.getQuantity()
                                : 0
                )
                .sum();

        int availableQuantity = resources.stream()
                .mapToInt(resource ->
                        resource.getQuantity() != null
                                ? resource.getQuantity()
                                : 0
                )
                .sum();

        Map<String, Object> insights =
                new HashMap<>();

        insights.put(
                "totalIssues",
                totalIssues
        );

        insights.put(
                "activeIssues",
                activeIssues
        );

        insights.put(
                "returnedIssues",
                returnedIssues
        );

        insights.put(
                "overdueIssues",
                overdueIssues
        );

        insights.put(
                "totalIssuedQuantity",
                totalIssuedQuantity
        );

        insights.put(
                "availableQuantity",
                availableQuantity
        );

        insights.put(
                "totalResources",
                resources.size()
        );

        return insights;
    }
}