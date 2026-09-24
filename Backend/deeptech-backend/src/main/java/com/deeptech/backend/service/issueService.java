package com.deeptech.backend.service;

import com.deeptech.backend.entity.issue;
import com.deeptech.backend.entity.resource;
import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.issueRepository;
import com.deeptech.backend.repository.resourceRepository;
import com.deeptech.backend.repository.userRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class issueService {

    private final issueRepository issueRepository;
    private final resourceRepository resourceRepository;
    private final userRepository userRepository;
    private final auditLogService auditLogService;

    public issueService(
            issueRepository issueRepository,
            resourceRepository resourceRepository,
            userRepository userRepository,
            auditLogService auditLogService) {

        this.issueRepository = issueRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<issue> getAllIssues() {

        updateOverdueIssues();

        return issueRepository.findAll();
    }

    public issue getIssueById(Long id) {

        updateOverdueIssues();

        return issueRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Issue not found with id: " + id
                        ));
    }

    public List<issue> getIssuesByUser(Long userId) {

        updateOverdueIssues();

        return issueRepository.findByUserId(userId);
    }

    public List<issue> getIssuesByResource(Long resourceId) {

        updateOverdueIssues();

        return issueRepository.findByResourceId(resourceId);
    }

    public List<issue> getIssuesByStatus(String status) {

        updateOverdueIssues();

        return issueRepository.findByStatus(status);
    }

    public issue createIssue(
            issue issue,
            Long userId,
            Long resourceId) {

        user user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + userId
                        ));

        resource resource =
                resourceRepository.findById(resourceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resource not found with id: "
                                                + resourceId
                                ));

        if (issue.getQuantity() == null
                || issue.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        if (resource.getQuantity()
                < issue.getQuantity()) {

            throw new RuntimeException(
                    "Not enough resource quantity available"
            );
        }

        issue.setUser(user);
        issue.setResource(resource);

        if (issue.getIssuedAt() == null) {

            issue.setIssuedAt(
                    LocalDateTime.now()
            );
        }

        issue.setStatus("Issued");

        resource.setQuantity(
                resource.getQuantity()
                        - issue.getQuantity()
        );

        updateResourceStatus(resource);

        resourceRepository.save(resource);

        issue savedIssue =
                issueRepository.save(issue);

        auditLogService.log(
                "ISSUE",
                "ISSUE",
                savedIssue.getId(),
                "Issued "
                        + savedIssue.getQuantity()
                        + " unit(s) of "
                        + resource.getName()
                        + " to "
                        + user.getEmail()
        );

        return savedIssue;
    }

    public issue returnIssue(Long id) {

        issue existingIssue =
                getIssueById(id);

        if ("Returned".equalsIgnoreCase(
                existingIssue.getStatus())) {

            return existingIssue;
        }

        resource resource =
                existingIssue.getResource();

        resource.setQuantity(
                resource.getQuantity()
                        + existingIssue.getQuantity()
        );

        updateResourceStatus(resource);

        resourceRepository.save(resource);

        existingIssue.setReturnedAt(
                LocalDateTime.now()
        );

        existingIssue.setStatus("Returned");

        issue savedIssue =
                issueRepository.save(existingIssue);

        auditLogService.log(
                "RETURN",
                "ISSUE",
                savedIssue.getId(),
                "Returned "
                        + savedIssue.getQuantity()
                        + " unit(s) of "
                        + resource.getName()
        );

        return savedIssue;
    }

    public void deleteIssue(Long id) {

        issue existingIssue =
                getIssueById(id);

        issueRepository.delete(existingIssue);

        auditLogService.log(
                "DELETE",
                "ISSUE",
                id,
                "Deleted issue record"
        );
    }

    private void updateResourceStatus(
            resource resource) {

        if (resource.getQuantity() == 0) {

            resource.setStatus("Unavailable");

        } else {

            resource.setStatus("Available");
        }
    }

    private void updateOverdueIssues() {

        List<issue> issues =
                issueRepository.findByStatus("Issued");

        LocalDate today = LocalDate.now();

        for (issue currentIssue : issues) {

            if (currentIssue.getReturnDate() != null
                    && currentIssue.getReturnDate()
                    .isBefore(today)) {

                currentIssue.setStatus("Overdue");
            }
        }

        if (!issues.isEmpty()) {

            issueRepository.saveAll(issues);
        }
    }
}