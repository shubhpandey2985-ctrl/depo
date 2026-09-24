package com.deeptech.backend.service;

import com.deeptech.backend.entity.resource;
import com.deeptech.backend.repository.resourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class resourceService {

    private final resourceRepository resourceRepository;
    private final auditLogService auditLogService;

    public resourceService(
            resourceRepository resourceRepository,
            auditLogService auditLogService) {

        this.resourceRepository = resourceRepository;
        this.auditLogService = auditLogService;
    }

    public List<resource> getAllResources() {

        return resourceRepository.findAll();
    }

    public resource getResourceById(Long id) {

        return resourceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resource not found with id: " + id
                        ));
    }

    public resource createResource(resource newResource) {

        validateResource(newResource);
        validateQuantity(newResource.getQuantity());

        updateStatus(newResource);

        resource savedResource =
                resourceRepository.save(newResource);

        auditLogService.log(
                "CREATE",
                "RESOURCE",
                savedResource.getId(),
                "Created resource: "
                        + savedResource.getName()
        );

        return savedResource;
    }

    public resource updateResource(
            Long id,
            resource resourceDetails) {

        resource existingResource =
                getResourceById(id);

        validateResource(resourceDetails);
        validateQuantity(resourceDetails.getQuantity());

        existingResource.setName(
                resourceDetails.getName()
        );

        existingResource.setCategory(
                resourceDetails.getCategory()
        );

        existingResource.setSub(
                resourceDetails.getSub()
        );

        existingResource.setQuantity(
                resourceDetails.getQuantity()
        );

        existingResource.setTone(
                resourceDetails.getTone()
        );

        existingResource.setLocation(
                resourceDetails.getLocation()
        );

        updateStatus(existingResource);

        resource savedResource =
                resourceRepository.save(existingResource);

        auditLogService.log(
                "UPDATE",
                "RESOURCE",
                savedResource.getId(),
                "Updated resource: "
                        + savedResource.getName()
        );

        return savedResource;
    }

    public void deleteResource(Long id) {

        resource existingResource =
                getResourceById(id);

        String resourceName =
                existingResource.getName();

        resourceRepository.delete(existingResource);

        auditLogService.log(
                "DELETE",
                "RESOURCE",
                id,
                "Deleted resource: "
                        + resourceName
        );
    }

    private void validateResource(
            resource resource) {

        if (resource == null) {

            throw new RuntimeException(
                    "Resource data cannot be empty"
            );
        }

        if (resource.getName() == null
                || resource.getName().isBlank()) {

            throw new RuntimeException(
                    "Resource name cannot be empty"
            );
        }

        if (resource.getCategory() == null
                || resource.getCategory().isBlank()) {

            throw new RuntimeException(
                    "Resource category cannot be empty"
            );
        }
    }

    private void validateQuantity(
            Integer quantity) {

        if (quantity == null
                || quantity < 0) {

            throw new RuntimeException(
                    "Resource quantity cannot be negative"
            );
        }
    }

    private void updateStatus(
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
}