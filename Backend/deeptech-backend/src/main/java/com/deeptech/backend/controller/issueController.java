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

    public issueController(
            issueService issueService) {

        this.issueService = issueService;
    }

    // Get all issues
    @GetMapping
    public List<issue> getAllIssues() {

        return issueService.getAllIssues();
    }

    // Get one issue
    @GetMapping("/{id}")
    public issue getIssueById(
            @PathVariable Long id) {

        return issueService.getIssueById(id);
    }

    // Get issues belonging to one user
    @GetMapping("/user/{userId}")
    public List<issue> getIssuesByUser(
            @PathVariable Long userId) {

        return issueService.getIssuesByUser(
                userId
        );
    }

    // Get issues for one resource
    @GetMapping("/resource/{resourceId}")
    public List<issue> getIssuesByResource(
            @PathVariable Long resourceId) {

        return issueService.getIssuesByResource(
                resourceId
        );
    }

    // Get issues by status
    @GetMapping("/status/{status}")
    public List<issue> getIssuesByStatus(
            @PathVariable String status) {

        return issueService.getIssuesByStatus(
                status
        );
    }

    // Create an issue
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public issue createIssue(
            @RequestBody issue newIssue,
            @RequestParam Long userId,
            @RequestParam Long resourceId) {

        return issueService.createIssue(
                newIssue,
                userId,
                resourceId
        );
    }

    // Return a resource
    @PutMapping("/{id}/return")
    public issue returnIssue(
            @PathVariable Long id) {

        return issueService.returnIssue(id);
    }

    // Delete an issue
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIssue(
            @PathVariable Long id) {

        issueService.deleteIssue(id);
    }
}