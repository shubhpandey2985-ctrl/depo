package com.deeptech.backend.controller;

import com.deeptech.backend.entity.resource;
import com.deeptech.backend.service.resourceService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class resourceController {

    private final resourceService resourceService;

    public resourceController(resourceService resourceService) {
        this.resourceService = resourceService;
    }

    // Get all resources.
    @GetMapping
    public List<resource> getAllResources() {
        return resourceService.getAllResources();
    }

    // Get one resource by ID.
    @GetMapping("/{id}")
    public resource getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id);
    }

    // Create a new resource.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public resource createResource(@RequestBody resource resource) {
        return resourceService.createResource(resource);
    }

    // Update an existing resource.
    @PutMapping("/{id}")
    public resource updateResource(
            @PathVariable Long id,
            @RequestBody resource resourceDetails) {
        return resourceService.updateResource(id, resourceDetails);
    }

    // Delete a resource.
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
    }
}