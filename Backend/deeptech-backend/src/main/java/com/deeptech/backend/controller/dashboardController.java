package com.deeptech.backend.controller;

import com.deeptech.backend.entity.issue;
import com.deeptech.backend.entity.resource;
import com.deeptech.backend.repository.issueRepository;
import com.deeptech.backend.repository.resourceRepository;
import com.deeptech.backend.repository.userRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class dashboardController {

    private final userRepository userRepository;
    private final resourceRepository resourceRepository;
    private final issueRepository issueRepository;

    public dashboardController(
            userRepository userRepository,
            resourceRepository resourceRepository,
            issueRepository issueRepository) {

        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.issueRepository = issueRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard() {

        updateOverdueIssues();

        List<resource> resources =
                resourceRepository.findAll();

        int availableItems = resources.stream()
                .filter(r -> r.getQuantity() != null)
                .mapToInt(resource::getQuantity)
                .sum();

        int lowStockItems = resources.stream()
                .filter(r ->
                        r.getQuantity() != null
                                && r.getQuantity() > 0
                                && r.getQuantity() <= 2)
                .mapToInt(resource::getQuantity)
                .sum();

        int issuedItems =
                issueRepository
                        .findByStatus("Issued")
                        .stream()
                        .mapToInt(issue::getQuantity)
                        .sum();

        int overdueItems =
                issueRepository
                        .findByStatus("Overdue")
                        .stream()
                        .mapToInt(issue::getQuantity)
                        .sum();

        int totalItems =
                availableItems
                        + issuedItems
                        + overdueItems;

        int issuedToday =
                issueRepository
                        .findByIssuedAtBetween(
                                LocalDate.now()
                                        .atStartOfDay(),
                                LocalDate.now()
                                        .plusDays(1)
                                        .atStartOfDay()
                        )
                        .stream()
                        .mapToInt(issue::getQuantity)
                        .sum();

        Map<String, Object> dashboard =
                new HashMap<>();

        dashboard.put(
                "totalItems",
                totalItems
        );

        dashboard.put(
                "availableItems",
                availableItems
        );

        dashboard.put(
                "issuedToday",
                issuedToday
        );

        dashboard.put(
                "lowStockItems",
                lowStockItems
        );

        dashboard.put(
                "totalResources",
                resourceRepository.count()
        );

        dashboard.put(
                "totalUsers",
                userRepository.count()
        );

        dashboard.put(
                "totalIssues",
                issueRepository.count()
        );

        dashboard.put(
                "activeIssues",
                issueRepository.countByStatus(
                        "Issued"
                )
        );

        dashboard.put(
                "returnedIssues",
                issueRepository.countByStatus(
                        "Returned"
                )
        );

        dashboard.put(
                "overdueIssues",
                issueRepository.countByStatus(
                        "Overdue"
                )
        );

        return dashboard;
    }

    private void updateOverdueIssues() {

        List<issue> issues =
                issueRepository.findByStatus(
                        "Issued"
                );

        LocalDate today =
                LocalDate.now();

        boolean changed = false;

        for (issue currentIssue : issues) {

            if (currentIssue.getReturnDate() != null
                    && currentIssue
                    .getReturnDate()
                    .isBefore(today)) {

                currentIssue.setStatus(
                        "Overdue"
                );

                changed = true;
            }
        }

        if (changed) {

            issueRepository.saveAll(
                    issues
            );
        }
    }
}