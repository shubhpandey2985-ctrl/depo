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

        List<resource> resources = resourceRepository.findAll();

        // Quantity physically available in the inventory right now.
        int availableItems = resources.stream()
                .filter(r -> r.getQuantity() != null)
                .mapToInt(resource::getQuantity)
                .sum();

        // Low-stock quantity: resources with 1-2 units remaining.
        int lowStockItems = resources.stream()
                .filter(r -> r.getQuantity() != null
                        && r.getQuantity() > 0
                        && r.getQuantity() <= 2)
                .mapToInt(resource::getQuantity)
                .sum();

        // Items currently outside the inventory because they are issued.
        int issuedItems = issueRepository.findByStatus("Issued")
                .stream()
                .mapToInt(issue::getQuantity)
                .sum();

        // Overdue items are also currently outside the inventory.
        int overdueItems = issueRepository.findByStatus("Overdue")
                .stream()
                .mapToInt(issue::getQuantity)
                .sum();

        // Total physical inventory = available + currently issued + overdue.
        int totalItems = availableItems + issuedItems + overdueItems;

        // Quantity issued today.
        int issuedToday = issueRepository
                .findByIssuedAtBetween(
                        LocalDate.now().atStartOfDay(),
                        LocalDate.now().plusDays(1).atStartOfDay()
                )
                .stream()
                .mapToInt(issue::getQuantity)
                .sum();

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("totalItems", totalItems);
        dashboard.put("availableItems", availableItems);
        dashboard.put("issuedToday", issuedToday);
        dashboard.put("lowStockItems", lowStockItems);

        // Additional backend statistics retained for other frontend features.
        dashboard.put("totalResources", resourceRepository.count());
        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalIssues", issueRepository.count());
        dashboard.put("activeIssues", issueRepository.countByStatus("Issued"));
        dashboard.put("returnedIssues", issueRepository.countByStatus("Returned"));
        dashboard.put("overdueIssues", issueRepository.countByStatus("Overdue"));

        return dashboard;
    }
}
