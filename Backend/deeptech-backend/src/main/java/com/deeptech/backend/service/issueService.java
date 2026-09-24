package com.deeptech.backend.service;

import com.deeptech.backend.entity.issue;
import com.deeptech.backend.entity.resource;
import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.issueRepository;
import com.deeptech.backend.repository.resourceRepository;
import com.deeptech.backend.repository.userRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException(
                    "User not found with id: " + userId
            );
        }

        return issueRepository.findByUserId(userId);
    }

    public List<issue> getIssuesByResource(Long resourceId) {

        updateOverdueIssues();

        if (!resourceRepository.existsById(resourceId)) {
            throw new RuntimeException(
                    "Resource not found with id: " + resourceId
            );
        }

        return issueRepository.findByResourceId(resourceId);
    }

    public List<issue> getIssuesByStatus(String status) {

        updateOverdueIssues();

        if (status == null || status.isBlank()) {
            throw new RuntimeException(
                    "Issue status cannot be empty"
            );
        }

        return issueRepository.findByStatus(status);
    }

    @Transactional
    public issue createIssue(
            issue newIssue,
            Long userId,
            Long resourceId) {

        if (newIssue == null) {
            throw new RuntimeException(
                    "Issue data cannot be empty"
            );
        }

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }

        if (resourceId == null) {
            throw new RuntimeException(
                    "Resource ID is required"
            );
        }

        user user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: "
                                        + userId
                        ));

        resource resource = resourceRepository
                .findById(resourceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resource not found with id: "
                                        + resourceId
                        ));

        Integer quantity =
                newIssue.getQuantity();

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Issue quantity must be greater than zero"
            );
        }

        if (resource.getQuantity() == null) {
            throw new RuntimeException(
                    "Resource quantity is invalid"
            );
        }

        if (resource.getQuantity() < quantity) {
            throw new RuntimeException(
                    "Not enough resource quantity available"
            );
        }

        /*
         * Return date is required when the resource
         * is marked as returnable.
         */
        if (newIssue.isReturnable()
                && newIssue.getReturnDate() == null) {

            throw new RuntimeException(
                    "Return date is required for returnable resources"
            );
        }

        /*
         * Return date cannot be before the issue date.
         */
        if (newIssue.isReturnable()
                && newIssue.getReturnDate() != null
                && newIssue.getReturnDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Return date cannot be in the past"
            );
        }

        newIssue.setUser(user);
        newIssue.setResource(resource);

        /*
         * Always use the backend's current time
         * instead of trusting a frontend timestamp.
         */
        newIssue.setIssuedAt(
                LocalDateTime.now()
        );

        newIssue.setStatus("Issued");

        /*
         * A non-returnable resource should not
         * have a return date.
         */
        if (!newIssue.isReturnable()) {
            newIssue.setReturnDate(null);
        }

        /*
         * Reduce available resource quantity.
         */
        resource.setQuantity(
                resource.getQuantity() - quantity
        );

        updateResourceStatus(resource);

        resourceRepository.save(resource);

        issue savedIssue =
                issueRepository.save(newIssue);

        /*
         * Record the action in audit logs.
         */
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

    @Transactional
    public issue returnIssue(Long id) {

        issue existingIssue =
                getIssueById(id);

        if ("Returned".equalsIgnoreCase(
                existingIssue.getStatus())) {

            throw new RuntimeException(
                    "This resource has already been returned"
            );
        }

        if (!"Issued".equalsIgnoreCase(
                existingIssue.getStatus())
                && !"Overdue".equalsIgnoreCase(
                existingIssue.getStatus())) {

            throw new RuntimeException(
                    "This issue cannot be returned"
            );
        }

        resource resource =
                existingIssue.getResource();

        if (resource == null) {
            throw new RuntimeException(
                    "Resource associated with this issue was not found"
            );
        }

        if (resource.getQuantity() == null) {
            resource.setQuantity(0);
        }

        /*
         * Restore the returned quantity.
         */
        resource.setQuantity(
                resource.getQuantity()
                        + existingIssue.getQuantity()
        );

        updateResourceStatus(resource);

        resourceRepository.save(resource);

        existingIssue.setReturnedAt(
                LocalDateTime.now()
        );

        existingIssue.setStatus(
                "Returned"
        );

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

    @Transactional
    public void deleteIssue(Long id) {

        issue existingIssue =
                getIssueById(id);

        /*
         * Do not allow deletion of an active issue,
         * because doing so would leave inventory
         * quantity incorrect.
         */
        if ("Issued".equalsIgnoreCase(
                existingIssue.getStatus())
                || "Overdue".equalsIgnoreCase(
                existingIssue.getStatus())) {

            throw new RuntimeException(
                    "Active issues cannot be deleted. Return the resource first."
            );
        }

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

            resource.setStatus(
                    "Unavailable"
            );

        } else {

            resource.setStatus(
                    "Available"
            );
        }
    }

    private void updateOverdueIssues() {

        List<issue> issues =
                issueRepository.findByStatus("Issued");

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
            issueRepository.saveAll(issues);
        }
    }
}