package com.deeptech.backend.service;

import com.deeptech.backend.entity.auditLog;
import com.deeptech.backend.repository.auditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class auditLogService {

    private final auditLogRepository auditLogRepository;

    public auditLogService(auditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(
            String action,
            String entityType,
            Long entityId,
            String details) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String performedBy = "SYSTEM";

        if (authentication != null &&
                authentication.isAuthenticated() &&
                authentication.getName() != null) {

            performedBy = authentication.getName();
        }

        auditLog log = new auditLog(
                action,
                entityType,
                entityId,
                performedBy,
                LocalDateTime.now(),
                details
        );

        auditLogRepository.save(log);
    }

    public List<auditLog> getAllLogs() {
        return auditLogRepository
                .findAllByOrderByTimestampDesc();
    }
}