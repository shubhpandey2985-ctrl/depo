package com.deeptech.backend.controller;

import com.deeptech.backend.entity.issue;
import com.deeptech.backend.service.issueService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class issueController {

    private final issueService issueService;

    public issueController(issueService issueService) {
        this.issueService = issueService;
    }

    // Get all issue records.
    @GetMapping
    public List<issue> getAllIssues() {
        return issueService.getAllIssues();
    }

    // Get one issue by ID.
    @GetMapping("/{id}")
    public issue getIssueById(@PathVariable Long id) {
        return issueService.getIssueById(id);
    }

    // Get issues belonging to a particular user.
    @GetMapping("/user/{userId}")
    public List<issue> getIssuesByUser(@PathVariable Long userId) {
        return issueService.getIssuesByUser(userId);
    }

    // Get issues involving a particular resource.
    @GetMapping("/resource/{resourceId}")
    public List<issue> getIssuesByResource(@PathVariable Long resourceId) {
        return issueService.getIssuesByResource(resourceId);
    }

    // Filter issues by status.
    @GetMapping("/status/{status}")
    public List<issue> getIssuesByStatus(@PathVariable String status) {
        return issueService.getIssuesByStatus(status);
    }

    // Create an issue record.
    //
    // Example:
    // POST /api/issues?userId=1&resourceId=1
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public issue createIssue(
            @RequestBody issue issue,
            @RequestParam Long userId,
            @RequestParam Long resourceId) {

        return issueService.createIssue(
                issue,
                userId,
                resourceId
        );
    }

    // Mark an issued resource as returned.
    @PutMapping("/{id}/return")
    public issue returnIssue(@PathVariable Long id) {
        return issueService.returnIssue(id);
    }

    // Delete an issue record.
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
    }
}